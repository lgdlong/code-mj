import { COMMENT_PAGE_SIZE, MAX_COMMENT_LENGTH } from "@/lib/constants";
import { handleApiError, jsonError, jsonOk, parseJsonBody, parsePostId } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";
import type { CommentDTO } from "@/types/domain";

interface CreateCommentBody {
  content?: unknown;
  parentId?: unknown;
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
    const cursorRaw = searchParams.get("cursor");
    const cursorId = cursorRaw ? Number.parseInt(cursorRaw, 10) : null;
    const cursor = cursorId && Number.isInteger(cursorId) && cursorId > 0 ? cursorId : null;

    const rows = await prisma.comment.findMany({
      where: { postId, parentId: null, author: { banned: false } },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "asc" },
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
    const items: CommentDTO[] = pageRows.map((c) => ({
      id: c.id,
      postId: c.postId,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      likesCount: c._count.likes,
      likedByMe: c.likes.length > 0,
      author: {
        id: c.author.id,
        username: c.author.username,
        name: c.author.name,
        image: c.author.image,
        role: c.author.role === "admin" ? "admin" : "user",
      },
      replies: c.replies.map((r) => ({
        id: r.id,
        postId: r.postId,
        parentId: c.id,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        likesCount: r._count.likes,
        likedByMe: r.likes.length > 0,
        author: {
          id: r.author.id,
          username: r.author.username,
          name: r.author.name,
          image: r.author.image,
          role: r.author.role === "admin" ? "admin" : "user",
        },
      })),
    }));

    const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;
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
    if (!content) return jsonError("Comment content is required", 400, "errCommentEmpty");
    if (content.length > MAX_COMMENT_LENGTH) {
      return jsonError(`Comment exceeds ${MAX_COMMENT_LENGTH} characters`, 400, "errCommentTooLong");
    }

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
