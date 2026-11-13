import { MAX_POST_LENGTH } from "@/lib/constants";
import { destroyCloudinaryAsset } from "@/server/cloudinary";
import { handleApiError, jsonError, jsonOk, parseJsonBody, parsePostId } from "@/server/http";
import { mapPostToDTO, postIncludeForUser } from "@/server/post-mapper";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

interface UpdatePostBody {
  content?: unknown;
  imageUrl?: unknown;
  imagePublicId?: unknown;
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

    return jsonOk(mapPostToDTO(post));
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
    const hasImageUrlField = Object.prototype.hasOwnProperty.call(body, "imageUrl");
    const nextImageUrl = hasImageUrlField
      ? typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : null
      : existing.imageUrl;
    const nextImagePublicId = hasImageUrlField
      ? typeof body.imagePublicId === "string" && body.imagePublicId.trim()
        ? body.imagePublicId.trim()
        : null
      : existing.imagePublicId;

    if (!content && !nextImageUrl) {
      return jsonError("Post must contain text or an image", 400);
    }
    if (content.length > MAX_POST_LENGTH) {
      return jsonError(`Post content exceeds ${MAX_POST_LENGTH} characters`, 400);
    }

    if (
      existing.imagePublicId &&
      existing.imagePublicId !== nextImagePublicId
    ) {
      await destroyCloudinaryAsset(existing.imagePublicId);
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
        imageUrl: nextImageUrl,
        imagePublicId: nextImagePublicId,
      },
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

    await prisma.post.delete({ where: { id: postId } });
    await destroyCloudinaryAsset(existing.imagePublicId);

    return jsonOk({ deleted: true, id: postId });
  } catch (err) {
    return handleApiError(err, "posts/[id]:DELETE");
  }
}
