"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MoreSheetTarget } from "@/components/more-sheet";
import { useAppPreferences } from "@/components/providers";
import { readApiError } from "@/lib/client-error";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import type { CommentDTO, PostDTO, ReplyDTO } from "@/types/domain";

export function usePostDetailActions(initialPost: PostDTO, initialComments: CommentDTO[]) {
  const router = useRouter();
  const { t, lang, showToast } = useAppPreferences();
  const [post, setPost] = useState<PostDTO>(initialPost);
  const [comments, setComments] = useState<CommentDTO[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ id: number; username: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sheetTarget, setSheetTarget] = useState<MoreSheetTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MoreSheetTarget | null>(null);
  const [reportTarget, setReportTarget] = useState<MoreSheetTarget | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function handleToggleLike() {
    const toggle = (p: PostDTO) => ({
      ...p,
      likedByMe: !p.likedByMe,
      likesCount: p.likesCount + (p.likedByMe ? -1 : 1),
    });
    setPost(toggle);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) {
        setPost(toggle);
        showToast(await readApiError(res, lang, "errLike"), "error");
      }
    } catch {
      setPost(toggle);
      showToast(t("errNetwork"), "error");
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    const content = commentText.trim();
    if (!content) return showToast(t("errCommentEmpty"), "error");
    if (content.length > MAX_COMMENT_LENGTH) return showToast(t("errCommentTooLong"), "error");
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId: replyTarget?.id ?? null }),
      });
      if (!res.ok) return showToast(await readApiError(res, lang, "errCommentSubmit"), "error");
      const json = (await res.json()) as { data?: ReplyDTO & { parentId: number | null } };
      if (!json.data) return showToast(t("errInvalidResponse"), "error");
      const created = json.data;
      if (created.parentId) {
        setComments((prev) =>
          prev.map((c) => (c.id === created.parentId ? { ...c, replies: [...c.replies, created] } : c))
        );
      } else {
        setComments((prev) => [...prev, { ...created, replies: [] }]);
      }
      setPost((prev) => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
      setCommentText("");
      setReplyTarget(null);
    } catch {
      showToast(t("errNetwork"), "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || actionLoading) return;
    setActionLoading(true);
    try {
      if (deleteTarget.kind === "post") {
        const res = await fetch(`/api/posts/${deleteTarget.postId}`, { method: "DELETE" });
        if (!res.ok) return showToast(await readApiError(res, lang, "errDeletePost"), "error");
        setDeleteTarget(null);
        showToast(t("deletedToast"));
        router.push("/");
        router.refresh();
        return;
      }
      if (deleteTarget.commentId) {
        const res = await fetch(`/api/comments/${deleteTarget.commentId}`, { method: "DELETE" });
        if (!res.ok) return showToast(await readApiError(res, lang, "errDeleteComment"), "error");
        setComments((prev) =>
          prev
            .filter((c) => c.id !== deleteTarget.commentId)
            .map((c) => ({ ...c, replies: c.replies.filter((r) => r.id !== deleteTarget.commentId) }))
        );
        setPost((prev) => ({ ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) }));
        setDeleteTarget(null);
        showToast(t("deletedCommentToast"));
      }
    } catch {
      showToast(t("errNetwork"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function submitReport(reason: string) {
    if (!reportTarget || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: reportTarget.kind,
          postId: reportTarget.postId,
          commentId: reportTarget.commentId,
          reason,
        }),
      });
      if (!res.ok) return showToast(await readApiError(res, lang, "errReport"), "error");
      setReportTarget(null);
      showToast(t("reportedToast"));
    } catch {
      showToast(t("errNetwork"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  return {
    post, comments, commentText, setCommentText, replyTarget, setReplyTarget,
    submitting, sheetTarget, setSheetTarget, deleteTarget, setDeleteTarget,
    reportTarget, setReportTarget, actionLoading,
    handleToggleLike, handleSubmitComment, confirmDelete, submitReport,
  };
}
