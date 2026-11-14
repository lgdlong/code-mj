"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { AppShell } from "@/components/app-shell";
import { MoreSheet } from "@/components/more-sheet";
import { PostCard } from "@/components/post-card";
import { CommentComposer, type CommentComposerMedia } from "@/components/post-detail/comment-composer";
import { CommentThread } from "@/components/post-detail/comment-thread";
import { useAppPreferences } from "@/components/providers";
import { usePostDetailActions } from "@/hooks/use-post-detail-actions";

const ConfirmModal = dynamic(() => import("@/components/confirm-modal").then((m) => m.ConfirmModal), { ssr: false });
const ReportModal = dynamic(() => import("@/components/report-modal").then((m) => m.ReportModal), { ssr: false });
import type { CommentDTO, PostDTO } from "@/types/domain";

interface PostDetailClientProps {
  currentUser: { id: string; username: string };
  initialPost: PostDTO;
  initialComments: CommentDTO[];
  initialNextCursor: number | null;
}

export function PostDetailClient({
  currentUser,
  initialPost,
  initialComments,
  initialNextCursor,
}: PostDetailClientProps) {
  const router = useRouter();
  const { t } = useAppPreferences();
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const commentMediaRef = useRef<CommentComposerMedia | null>(null);
  const [composerHeight, setComposerHeight] = useState(76);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const {
    post, comments, commentText, setCommentText, replyTarget, setReplyTarget, startReply,
    submitting, nextCursor, loadingMore, loadMoreComments,
    sheetTarget, setSheetTarget, deleteTarget, setDeleteTarget,
    reportTarget, setReportTarget, actionLoading,
    handleToggleLike, handleToggleCommentLike, handleSubmitComment, confirmDelete, submitReport,
  } = usePostDetailActions(
    initialPost,
    initialComments,
    initialNextCursor,
    commentMediaRef
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || nextCursor === null || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreComments();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loadMoreComments]);

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
        {t("replies")}
      </div>

      <CommentThread
        postId={post.id}
        comments={comments}
        currentUserId={currentUser.id}
        isPostOwner={isPostOwner}
        bottomInset={composerHeight + 12}
        onReply={(target) => {
          startReply(target);
          commentInputRef.current?.focus();
        }}
        onToggleLike={handleToggleCommentLike}
        onOpenMore={setSheetTarget}
      />

      {nextCursor !== null && (
        <div
          ref={sentinelRef}
          style={{ padding: "16px 16px 80px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}
        >
          {loadingMore ? "..." : ""}
        </div>
      )}

      <CommentComposer
        value={commentText}
        onValueChange={setCommentText}
        replyTo={replyTarget?.username ?? null}
        onCancelReply={() => setReplyTarget(null)}
        submitting={submitting}
        onSubmit={handleSubmitComment}
        inputRef={commentInputRef}
        mediaRef={commentMediaRef}
        onHeightChange={setComposerHeight}
      />

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
