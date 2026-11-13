import { destroyCloudinaryAsset } from "@/server/cloudinary";
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
        post: { select: { id: true, authorId: true, imagePublicId: true } },
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
      await prisma.comment.delete({ where: { id: report.commentId } });
      return jsonOk({ id: reportId, status: "resolved" });
    }

    const imagePublicId = report.post.imagePublicId;
    await prisma.post.delete({ where: { id: report.postId } });
    await destroyCloudinaryAsset(imagePublicId);
    return jsonOk({ id: reportId, status: "resolved" });
  } catch (err) {
    return handleApiError(err, "admin/reports/[id]:PATCH");
  }
}
