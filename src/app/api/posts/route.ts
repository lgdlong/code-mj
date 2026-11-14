import { FEED_PAGE_SIZE, MAX_POST_LENGTH } from "@/lib/constants";
import { generatePostId, handleApiError, jsonError, jsonOk, parseJsonBody, parsePostId, parsePostImages } from "@/server/http";
import { mapPostToDTO, postIncludeForUser } from "@/server/post-mapper";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

interface CreatePostBody {
  content?: unknown;
  imageUrls?: unknown;
  imagePublicIds?: unknown;
}

export async function GET(req: Request) {
  try {
    const viewer = await requireSessionUser();
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") === "following" ? "following" : "all";
    const cursorRaw = searchParams.get("cursor");
    const cursor = cursorRaw ? parsePostId(cursorRaw) : null;

    const posts = await prisma.post.findMany({
      where: {
        author: { banned: false },
        ...(tab === "following" && {
          // Own posts + posts of people I follow, in one query (no pre-fetch of ids).
          OR: [{ authorId: viewer.id }, { author: { followers: { some: { followerId: viewer.id } } } }],
        }),
      },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      take: FEED_PAGE_SIZE + 1,
      include: postIncludeForUser(viewer.id),
    });

    const hasMore = posts.length > FEED_PAGE_SIZE;
    const items = (hasMore ? posts.slice(0, FEED_PAGE_SIZE) : posts).map(mapPostToDTO);
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    return jsonOk({ items, nextCursor });
  } catch (err) {
    return handleApiError(err, "posts:GET");
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireSessionUser();
    const body = await parseJsonBody<CreatePostBody>(req);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const content = typeof body.content === "string" ? body.content.trim() : "";
    const parsed = parsePostImages(body);
    if (!parsed.ok) {
      return jsonError(parsed.code === "errTooManyImages" ? "Too many images" : "Invalid image URL", 400, parsed.code);
    }
    const { imageUrls, imagePublicIds } = parsed.images;

    if (!content && imageUrls.length === 0) {
      return jsonError("Post must contain text or an image", 400, "errPostEmpty");
    }
    if (content.length > MAX_POST_LENGTH) {
      return jsonError(`Post content exceeds ${MAX_POST_LENGTH} characters`, 400, "errPostTooLong");
    }
    const created = await prisma.post.create({
      data: {
        id: generatePostId(),
        authorId: user.id,
        content,
        imageUrls,
        imagePublicIds,
      },
      include: postIncludeForUser(user.id),
    });

    return jsonOk(mapPostToDTO(created), 201);
  } catch (err) {
    return handleApiError(err, "posts:POST");
  }
}
