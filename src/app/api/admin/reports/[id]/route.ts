import { destroyCloudinaryAssets } from "@/server/cloudinary";
import { commentAssetIds, postAssetIds } from "@/server/media-cleanup";
import { deleteVideoObject } from "@/server/media-storage";
import { handleApiError, jsonError, jsonOk, parseJsonBody, parsePositiveInt } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireAdminUser } from "@/server/session";

interface ResolveReportBody {
  action?: unknown;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const reportId = parsePositiveInt(id);
    if (!reportId) return jsonError("Invalid report ID", 400);

    const body = await parseJsonBody<ResolveReportBody>(req);
    const action = body?.action;
    if (action !== "delete" && action !== "ban" && action !== "dismiss") {
      return jsonError("Invalid action", 400);
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        post: { select: { id: true, authorId: true, imagePublicIds: true, videoPublicKey: true } },
        comment: { select: { id: true, authorId: true } },
      },
    });
    if (!report) return jsonError("Report not found", 404);

    if (action === "dismiss") {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "dismissed" },
      });
      return jsonOk({ id: reportId, status: "dismissed" });
    }

    if (action === "ban") {
      const targetUserId =
        report.targetType === "comment" && report.comment
          ? report.comment.authorId
          : report.post.authorId;
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { role: true },
      });
      if (targetUser?.role === "admin") {
        return jsonError("Cannot ban an admin account", 403, "errCannotBanAdmin");
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: targetUserId },
          data: { banned: true },
        }),
        prisma.report.update({
          where: { id: reportId },
          data: { status: "resolved" },
        }),
      ]);
      return jsonOk({ id: reportId, status: "resolved" });
    }

    if (report.targetType === "comment" && report.commentId) {
      // Gather before delete: the cascade removes replies too.
      const assetIds = await commentAssetIds(report.commentId);
      await prisma.comment.delete({ where: { id: report.commentId } });
      await destroyCloudinaryAssets(assetIds);
      return jsonOk({ id: reportId, status: "resolved" });
    }

    // Gather before delete: the cascade removes comment images too.
    const assetIds = await postAssetIds(report.postId);
    await prisma.post.delete({ where: { id: report.postId } });
    await destroyCloudinaryAssets(assetIds);
    await deleteVideoObject(report.post.videoPublicKey);
    return jsonOk({ id: reportId, status: "resolved" });
  } catch (err) {
    return handleApiError(err, "admin/reports/[id]:PATCH");
  }
}
