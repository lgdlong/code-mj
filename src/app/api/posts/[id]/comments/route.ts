import { COMMENT_PAGE_SIZE, MAX_COMMENT_LENGTH } from "@/lib/constants";
import { parseMentions } from "@/lib/mentions";
import {
  handleApiError,
  jsonError,
  jsonOk,
  pageCursor,
  parseJsonBody,
  parsePageCursor,
  parsePostId,
  parsePostImages,
} from "@/server/http";
import { mapCommentToDTO } from "@/server/post-mapper";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";
import type { CommentDTO } from "@/types/domain";

interface CreateCommentBody {
  content?: unknown;
  parentId?: unknown;
  imageUrls?: unknown;
  imagePublicIds?: unknown;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const viewer = await requireSessionUser();
    const { id } = await context.params;
    const postId = parsePostId(id);
    if (!postId) return jsonError("Invalid post ID", 400);

    const { searchParams } = new URL(req.url);
    const cursor = parsePageCursor(searchParams.get("cursor"));
    const cursorId = cursor ? Number.parseInt(cursor.id, 10) : null;

    const rows = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
        author: { banned: false },
        ...(cursor && cursorId && Number.isInteger(cursorId)
          ? { OR: [{ createdAt: { gt: cursor.at } }, { createdAt: cursor.at, id: { gt: cursorId } }] }
          : {}),
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: COMMENT_PAGE_SIZE + 1,
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true, role: true },
        },
        _count: { select: { likes: true } },
        likes: { where: { userId: viewer.id }, select: { userId: true } },
        replies: {
          where: { author: { banned: false } },
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, username: true, name: true, image: true, role: true },
            },
            _count: { select: { likes: true } },
            likes: { where: { userId: viewer.id }, select: { userId: true } },
          },
        },
      },
    });

    const hasMore = rows.length > COMMENT_PAGE_SIZE;
    const pageRows = hasMore ? rows.slice(0, COMMENT_PAGE_SIZE) : rows;
    const items: CommentDTO[] = pageRows.map(mapCommentToDTO);

    const nextCursor = hasMore ? pageCursor(pageRows[pageRows.length - 1].createdAt, pageRows[pageRows.length - 1].id) : null;
    return jsonOk({ items, nextCursor });
  } catch (err) {
    return handleApiError(err, "posts/[id]/comments:GET");
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const postId = parsePostId(id);
    if (!postId) return jsonError("Invalid post ID", 400);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) return jsonError("Post not found", 404);

    const body = await parseJsonBody<CreateCommentBody>(req);
    if (!body) return jsonError("Invalid JSON body", 400);

    const content = typeof body.content === "string" ? body.content.trim() : "";
    const parsedImages = parsePostImages(body);
    if (!parsedImages.ok) return jsonError("Invalid image data", 400, parsedImages.code);
    const { imageUrls, imagePublicIds } = parsedImages.images;

    if (!content && imageUrls.length === 0) {
      return jsonError("Comment content is required", 400, "errCommentEmpty");
    }
    if (content.length > MAX_COMMENT_LENGTH) {
      return jsonError(`Comment exceeds ${MAX_COMMENT_LENGTH} characters`, 400, "errCommentTooLong");
    }

    // Store only handles that exist; unknown ones stay plain text in the content.
    const handles = content ? parseMentions(content).handles : [];
    const mentionRows = handles.length
      ? await prisma.user.findMany({
          where: { username: { in: handles }, banned: false },
          select: { username: true },
        })
      : [];
    const mentions = mentionRows.map((u) => u.username);

    let parentId: number | null = null;
    if (body.parentId !== undefined && body.parentId !== null) {
      if (typeof body.parentId !== "number" || !Number.isInteger(body.parentId) || body.parentId <= 0) {
        return jsonError("Invalid parentId", 400);
      }
      const parent = await prisma.comment.findUnique({
        where: { id: body.parentId },
        select: { id: true, postId: true, parentId: true },
      });
      if (!parent || parent.postId !== postId) {
        return jsonError("Parent comment not found", 404);
      }
      if (parent.parentId !== null) {
        return jsonError("Maximum 2 comment levels allowed", 400);
      }
      parentId = parent.id;
    }

    const created = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        parentId,
        content,
        imageUrls,
        imagePublicIds,
        mentions,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true, role: true },
        },
      },
    });

    return jsonOk(
      {
        id: created.id,
        postId: created.postId,
        parentId: created.parentId,
        content: created.content,
        imageUrls: created.imageUrls,
        mentions: created.mentions,
        createdAt: created.createdAt.toISOString(),
        likesCount: 0,
        likedByMe: false,
        author: {
          id: created.author.id,
          username: created.author.username,
          name: created.author.name,
          image: created.author.image,
          role: created.author.role === "admin" ? "admin" : "user",
        },
      },
      201
    );
  } catch (err) {
    return handleApiError(err, "posts/[id]/comments:POST");
  }
}
