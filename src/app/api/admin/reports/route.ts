import { handleApiError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireAdminUser } from "@/server/session";
import type { ReportDTO } from "@/types/domain";

export async function GET() {
  try {
    await requireAdminUser();
    const reports = await prisma.report.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        reporter: { select: { username: true } },
        post: {
          select: {
            content: true,
            author: { select: { username: true } },
          },
        },
        comment: {
          select: {
            content: true,
            author: { select: { username: true } },
          },
        },
      },
    });

    const items: ReportDTO[] = reports.map((r) => ({
      id: r.id,
      type: r.targetType === "comment" ? "comment" : "post",
      targetId: r.targetType === "comment" && r.commentId ? r.commentId : r.postId,
      postId: r.postId,
      targetAuthor:
        r.targetType === "comment" && r.comment
          ? r.comment.author.username
          : r.post.author.username,
      reporter: r.reporter.username,
      content:
        r.targetType === "comment" && r.comment
          ? r.comment.content
          : r.post.content,
      reason: r.reason,
      status:
        r.status === "resolved"
          ? "resolved"
          : r.status === "dismissed"
          ? "dismissed"
          : "pending",
      createdAt: r.createdAt.toISOString(),
    }));

    return jsonOk(items);
  } catch (err) {
    return handleApiError(err, "admin/reports:GET");
  }
}
