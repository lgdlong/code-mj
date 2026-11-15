import { FEED_PAGE_SIZE, MAX_POST_LENGTH } from "@/lib/constants";
import { generatePostId, handleApiError, jsonError, jsonOk, pageCursor, parseJsonBody, parsePageCursor, parsePostImages, parsePostVideo } from "@/server/http";
import { verifyVideoObject } from "@/server/media-storage";
import { mapPostToDTO, postIncludeForUser } from "@/server/post-mapper";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

interface CreatePostBody {
  content?: unknown;
  imageUrls?: unknown;
  imagePublicIds?: unknown;
  videoUrl?: unknown;
  videoPublicKey?: unknown;
}

export async function GET(req: Request) {
  try {
    const viewer = await requireSessionUser();
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") === "following" ? "following" : "all";
    const cursor = parsePageCursor(searchParams.get("cursor"));

    const posts = await prisma.post.findMany({
      where: {
        author: { banned: false },
        AND: [
          ...(tab === "following"
            ? [
                {
                  // Own posts + posts of people I follow, in one query (no pre-fetch of ids).
                  OR: [{ authorId: viewer.id }, { author: { followers: { some: { followerId: viewer.id } } } }],
                },
              ]
            : []),
          ...(cursor
            ? [{ OR: [{ createdAt: { lt: cursor.at } }, { createdAt: cursor.at, id: { lt: cursor.id } }] }]
            : []),
        ],
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: FEED_PAGE_SIZE + 1,
      include: postIncludeForUser(viewer.id),
    });

    const hasMore = posts.length > FEED_PAGE_SIZE;
    const items = (hasMore ? posts.slice(0, FEED_PAGE_SIZE) : posts).map(mapPostToDTO);
    const last = hasMore ? posts[FEED_PAGE_SIZE - 1] : null;
    const nextCursor = last ? pageCursor(last.createdAt, last.id) : null;

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

    const parsedVideo = parsePostVideo(body);
    if (!parsedVideo.ok) {
      return jsonError("Invalid video", 400, parsedVideo.code);
    }
    const video = parsedVideo.video;
    if (video && !(await verifyVideoObject(video.videoPublicKey, user.id))) {
      return jsonError("Invalid video", 400, "errVideoInvalid");
    }

    if (!content && imageUrls.length === 0 && !video) {
      return jsonError("Post must contain text, an image or a video", 400, "errPostEmpty");
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
        videoUrl: video?.videoUrl ?? null,
        videoPublicKey: video?.videoPublicKey ?? null,
      },
      include: postIncludeForUser(user.id),
    });

    return jsonOk(mapPostToDTO(created), 201);
  } catch (err) {
    return handleApiError(err, "posts:POST");
  }
}
