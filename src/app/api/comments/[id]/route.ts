import { handleApiError, jsonError, jsonOk, parsePositiveInt } from "@/server/http";
import { destroyCloudinaryAssets } from "@/server/cloudinary";
import { commentAssetIds } from "@/server/media-cleanup";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const commentId = parsePositiveInt(id);
    if (!commentId) return jsonError("Invalid comment ID", 400);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: { select: { authorId: true } },
      },
    });
    if (!comment) return jsonError("Comment not found", 404);

    const canDelete =
      comment.authorId === user.id ||
      comment.post.authorId === user.id ||
      user.role === "admin";
    if (!canDelete) return jsonError("Forbidden", 403);

    // Gather before delete: the cascade removes replies (and their ids) too.
    const assetIds = await commentAssetIds(commentId);
    await prisma.comment.delete({ where: { id: commentId } });
    await destroyCloudinaryAssets(assetIds);
    return jsonOk({ deleted: true, id: commentId });
  } catch (err) {
    return handleApiError(err, "comments/[id]:DELETE");
  }
}
