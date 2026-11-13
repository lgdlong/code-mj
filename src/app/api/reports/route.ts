import { MAX_REPORT_REASON_LENGTH } from "@/lib/constants";
import { handleApiError, jsonError, jsonOk, parseJsonBody, parsePostId } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

interface CreateReportBody {
  targetType?: unknown;
  postId?: unknown;
  commentId?: unknown;
  reason?: unknown;
}

export async function POST(req: Request) {
  try {
    const user = await requireSessionUser();
    const body = await parseJsonBody<CreateReportBody>(req);
    if (!body) return jsonError("Invalid JSON body", 400);

    const targetType = body.targetType === "comment" ? "comment" : body.targetType === "post" ? "post" : null;
    if (!targetType) return jsonError("Invalid targetType", 400);

    const postId = typeof body.postId === "string" ? parsePostId(body.postId) : null;
    if (!postId) return jsonError("Invalid postId", 400);

    const commentId =
      targetType === "comment"
        ? typeof body.commentId === "number" && Number.isInteger(body.commentId)
          ? body.commentId
          : null
        : null;
    if (targetType === "comment" && (!commentId || commentId <= 0)) {
      return jsonError("commentId is required for comment reports", 400);
    }

    const reasonRaw = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!reasonRaw) {
      return jsonError("Report reason is required", 400, "reportNeedReason");
    }
    const reason = reasonRaw.slice(0, MAX_REPORT_REASON_LENGTH);

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true } });
    if (!post) return jsonError("Post not found", 404);

    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, postId: true, authorId: true },
      });
      if (!comment || comment.postId !== postId) {
        return jsonError("Comment not found", 404);
      }
      if (comment.authorId === user.id) {
        return jsonError("You cannot report your own content", 400, "errReportSelf");
      }
    } else if (post.authorId === user.id) {
      return jsonError("You cannot report your own content", 400, "errReportSelf");
    }
    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType,
        postId,
        commentId,
        reason,
      },
    });

    return jsonOk({ id: report.id, status: report.status }, 201);
  } catch (err) {
    return handleApiError(err, "reports:POST");
  }
}
