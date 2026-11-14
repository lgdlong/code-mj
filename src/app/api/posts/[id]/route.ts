import { MAX_POST_LENGTH } from "@/lib/constants";
import { destroyCloudinaryAssets } from "@/server/cloudinary";
import { postAssetIds } from "@/server/media-cleanup";
import { handleApiError, jsonError, jsonOk, parseJsonBody, parsePostId, parsePostImages } from "@/server/http";
import { mapPostForEditor, mapPostToDTO, postIncludeForUser } from "@/server/post-mapper";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

interface UpdatePostBody {
  content?: unknown;
  imageUrls?: unknown;
  imagePublicIds?: unknown;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const viewer = await requireSessionUser();
    const { id } = await context.params;
    const postId = parsePostId(id);
    if (!postId) return jsonError("Invalid post ID", 400);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: postIncludeForUser(viewer.id),
    });
    if (!post) return jsonError("Post not found", 404);

    const dto =
      post.authorId === viewer.id ? mapPostForEditor(post) : mapPostToDTO(post);
    return jsonOk(dto);
  } catch (err) {
    return handleApiError(err, "posts/[id]:GET");
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const postId = parsePostId(id);
    if (!postId) return jsonError("Invalid post ID", 400);

    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) return jsonError("Post not found", 404);
    if (existing.authorId !== user.id) return jsonError("Forbidden", 403);

    const body = await parseJsonBody<UpdatePostBody>(req);
    if (!body) return jsonError("Invalid JSON body", 400);

    const content =
      typeof body.content === "string" ? body.content.trim() : existing.content;

    const hasImageFields = "imageUrls" in body || "imagePublicIds" in body;
    let nextImages = { imageUrls: existing.imageUrls, imagePublicIds: existing.imagePublicIds };
    if (hasImageFields) {
      const parsed = parsePostImages(body);
      if (!parsed.ok) {
        return jsonError(parsed.code === "errTooManyImages" ? "Too many images" : "Invalid image URL", 400, parsed.code);
      }
      nextImages = parsed.images;
    }
    const { imageUrls, imagePublicIds } = nextImages;

    if (!content && imageUrls.length === 0) {
      return jsonError("Post must contain text or an image", 400, "errPostEmpty");
    }
    if (content.length > MAX_POST_LENGTH) {
      return jsonError(`Post content exceeds ${MAX_POST_LENGTH} characters`, 400, "errPostTooLong");
    }

    const removedIds = existing.imagePublicIds.filter((id) => !imagePublicIds.includes(id));
    await destroyCloudinaryAssets(removedIds);

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { content, imageUrls, imagePublicIds },
      include: postIncludeForUser(user.id),
    });

    return jsonOk(mapPostToDTO(updated));
  } catch (err) {
    return handleApiError(err, "posts/[id]:PATCH");
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const postId = parsePostId(id);
    if (!postId) return jsonError("Invalid post ID", 400);

    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) return jsonError("Post not found", 404);
    if (existing.authorId !== user.id && user.role !== "admin") {
      return jsonError("Forbidden", 403);
    }

    // Gather before delete: the cascade removes comments (and their ids) too.
    const assetIds = await postAssetIds(postId);
    await prisma.post.delete({ where: { id: postId } });
    await destroyCloudinaryAssets(assetIds);

    return jsonOk({ deleted: true, id: postId });
  } catch (err) {
    return handleApiError(err, "posts/[id]:DELETE");
  }
}
