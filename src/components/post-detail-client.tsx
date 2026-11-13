"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "@phosphor-icons/react";
import { AppShell } from "@/components/app-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import { MoreSheet } from "@/components/more-sheet";
import { PostCard } from "@/components/post-card";
import { CommentThread } from "@/components/post-detail/comment-thread";
import { useAppPreferences } from "@/components/providers";
import { ReportModal } from "@/components/report-modal";
import { usePostDetailActions } from "@/hooks/use-post-detail-actions";
import type { CommentDTO, PostDTO } from "@/types/domain";

interface PostDetailClientProps {
  currentUser: { id: string; username: string };
  initialPost: PostDTO;
  initialComments: CommentDTO[];
}

export function PostDetailClient({
  currentUser,
  initialPost,
  initialComments,
}: PostDetailClientProps) {
  const router = useRouter();
  const { t } = useAppPreferences();
  const {
    post, comments, commentText, setCommentText, replyTarget, setReplyTarget,
    submitting, sheetTarget, setSheetTarget, deleteTarget, setDeleteTarget,
    reportTarget, setReportTarget, actionLoading,
    handleToggleLike, handleSubmitComment, confirmDelete, submitReport,
  } = usePostDetailActions(initialPost, initialComments);

  const isPostOwner = post.author.id === currentUser.id;

  return (
    <AppShell username={currentUser.username} showHeader={false} hideBottomNav>
      <div
        style={{
          height: 52,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "var(--nav-bg)",
          backdropFilter: "blur(14px)",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          style={{ width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center" }}
        >
          <ArrowLeft size={21} weight="bold" />
        </button>
        <strong style={{ fontSize: 16 }}>{t("threadDetail")}</strong>
      </div>

      <PostCard
        post={post}
        currentUserId={currentUser.id}
        onToggleLike={handleToggleLike}
        onOpenMore={(p) =>
          setSheetTarget({
            kind: "post",
            postId: p.id,
            canEdit: p.author.id === currentUser.id,
            canDelete: p.author.id === currentUser.id,
          })
        }
      />

      <div style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)" }}>
        {t("replies")} ·{" "}
        <span style={{ color: "var(--muted)", fontWeight: 400 }}>{t("tier2Hint")}</span>
      </div>

      <CommentThread
        postId={post.id}
        comments={comments}
        currentUserId={currentUser.id}
        isPostOwner={isPostOwner}
        onReply={setReplyTarget}
        onOpenMore={setSheetTarget}
      />

      <form className="comment-composer-bar" onSubmit={handleSubmitComment}>
        {replyTarget && (
          <button
            type="button"
            onClick={() => setReplyTarget(null)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 999,
              background: "var(--surface-alt)",
              color: "var(--muted)",
              whiteSpace: "nowrap",
            }}
          >
            <span>@{replyTarget.username}</span>
            <X size={12} />
          </button>
        )}
        <input
          className="comment-input"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={replyTarget ? `${t("replyingTo")} @${replyTarget.username}...` : t("replyPlaceholder")}
          required
        />
        <button className="btn-post-sm" type="submit" disabled={submitting}>
          {t("postBtn")}
        </button>
      </form>

      <MoreSheet
        target={sheetTarget}
        onClose={() => setSheetTarget(null)}
        onEdit={(postId) => router.push(`/compose?edit=${postId}`)}
        onDelete={(target) => setDeleteTarget(target)}
        onReport={(target) => setReportTarget(target)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget?.kind === "comment" ? t("confirmDeleteCommentTitle") : t("confirmDeletePostTitle")}
        message={deleteTarget?.kind === "comment" ? t("confirmDeleteCommentMsg") : t("confirmDeletePostMsg")}
        confirmLabel={t("deleteBtn")}
        cancelLabel={t("cancel")}
        loading={actionLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ReportModal
        open={Boolean(reportTarget)}
        targetType={reportTarget?.kind ?? "post"}
        loading={actionLoading}
        onSubmit={submitReport}
        onClose={() => setReportTarget(null)}
      />
    </AppShell>
  );
}
