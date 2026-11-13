"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, DotsThree, X } from "@phosphor-icons/react";
import { AppShell } from "@/components/app-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import { MoreSheet, type MoreSheetTarget } from "@/components/more-sheet";
import { PostCard, UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import { ReportModal } from "@/components/report-modal";
import { readApiError } from "@/lib/client-error";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import type { CommentDTO, PostDTO, ReplyDTO } from "@/types/domain";
interface PostDetailClientProps {
  currentUser: {
    id: string;
    username: string;
  };
  initialPost: PostDTO;
  initialComments: CommentDTO[];
}

export function PostDetailClient({
  currentUser,
  initialPost,
  initialComments,
}: PostDetailClientProps) {
  const router = useRouter();
  const { t, lang, showToast } = useAppPreferences();
  const [post, setPost] = useState<PostDTO>(initialPost);
  const [comments, setComments] = useState<CommentDTO[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sheetTarget, setSheetTarget] = useState<MoreSheetTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MoreSheetTarget | null>(null);
  const [reportTarget, setReportTarget] = useState<MoreSheetTarget | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const isPostOwner = post.author.id === currentUser.id;

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
    if (!content) {
      showToast(t("errCommentEmpty"), "error");
      return;
    }
    if (content.length > MAX_COMMENT_LENGTH) {
      showToast(t("errCommentTooLong"), "error");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          parentId: replyTarget?.id ?? null,
        }),
      });
      if (!res.ok) {
        showToast(await readApiError(res, lang, "errCommentSubmit"), "error");
        return;
      }
      const json = (await res.json()) as {
        data?: ReplyDTO & { parentId: number | null };
      };
      if (!json.data) {
        showToast(t("errInvalidResponse"), "error");
        return;
      }
      const created = json.data;
      if (created.parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === created.parentId
              ? {
                  ...c,
                  replies: [
                    ...c.replies,
                    { ...created, parentId: created.parentId! },
                  ],
                }
              : c
          )
        );
      } else {
        setComments((prev) => [
          ...prev,
          {
            id: created.id,
            postId: created.postId,
            content: created.content,
            createdAt: created.createdAt,
            author: created.author,
            replies: [],
          },
        ]);
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
        const res = await fetch(`/api/posts/${deleteTarget.postId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          showToast(await readApiError(res, lang, "errDeletePost"), "error");
          return;
        }
        setDeleteTarget(null);
        showToast(t("deletedToast"));
        router.push("/");
        router.refresh();
        return;
      }

      if (deleteTarget.commentId) {
        const res = await fetch(`/api/comments/${deleteTarget.commentId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          showToast(await readApiError(res, lang, "errDeleteComment"), "error");
          return;
        }
        setComments((prev) =>
          prev
            .filter((c) => c.id !== deleteTarget.commentId)
            .map((c) => ({
              ...c,
              replies: c.replies.filter((r) => r.id !== deleteTarget.commentId),
            }))
        );
        setPost((prev) => ({
          ...prev,
          commentsCount: Math.max(0, prev.commentsCount - 1),
        }));
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
      if (!res.ok) {
        showToast(await readApiError(res, lang, "errReport"), "error");
        return;
      }
      setReportTarget(null);
      showToast(t("reportedToast"));
    } catch {
      showToast(t("errNetwork"), "error");
    } finally {
      setActionLoading(false);
    }
  }

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
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
          }}
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

      <div
        style={{
          padding: "12px 16px",
          fontSize: 14,
          fontWeight: 600,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {t("replies")} ·{" "}
        <span style={{ color: "var(--muted)", fontWeight: 400 }}>
          {t("tier2Hint")}
        </span>
      </div>

      <div style={{ paddingBottom: 76 }}>
        {comments.map((c) => {
          const canDeleteC = isPostOwner || c.author.id === currentUser.id;
          return (
            <div
              key={c.id}
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <UserAvatar name={c.author.name} image={c.author.image} />
                  {c.replies.length > 0 && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 16,
                        background: "var(--border)",
                        margin: "6px 0 2px",
                        borderRadius: 2,
                      }}
                    />
                  )}
                </div>

                <div className="post-main">
                  <div className="post-author-row">
                    <Link
                      href={`/u/${c.author.username}`}
                      className="post-username"
                    >
                      {c.author.username}
                    </Link>
                    <button
                      type="button"
                      className="post-more-btn"
                      onClick={() =>
                        setSheetTarget({
                          kind: "comment",
                          postId: post.id,
                          commentId: c.id,
                          canEdit: false,
                          canDelete: canDeleteC,
                        })
                      }
                      aria-label="More"
                    >
                      <DotsThree size={19} weight="bold" />
                    </button>
                  </div>

                  <div className="post-content">{c.content}</div>

                  <button
                    type="button"
                    onClick={() =>
                      setReplyTarget({ id: c.id, username: c.author.username })
                    }
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--muted)",
                    }}
                  >
                    {t("replyAction")}
                  </button>

                  {c.replies.length > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {c.replies.map((r) => {
                        const canDeleteR =
                          isPostOwner || r.author.id === currentUser.id;
                        return (
                          <div key={r.id} style={{ display: "flex", gap: 12 }}>
                            <UserAvatar
                              name={r.author.name}
                              image={r.author.image}
                            />
                            <div className="post-main">
                              <div className="post-author-row">
                                <Link
                                  href={`/u/${r.author.username}`}
                                  className="post-username"
                                >
                                  {r.author.username}
                                </Link>
                                <button
                                  type="button"
                                  className="post-more-btn"
                                  onClick={() =>
                                    setSheetTarget({
                                      kind: "comment",
                                      postId: post.id,
                                      commentId: r.id,
                                      canEdit: false,
                                      canDelete: canDeleteR,
                                    })
                                  }
                                  aria-label="More"
                                >
                                  <DotsThree size={19} weight="bold" />
                                </button>
                              </div>
                              <div className="post-content">{r.content}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
          placeholder={
            replyTarget
              ? `${t("replyingTo")} @${replyTarget.username}...`
              : t("replyPlaceholder")
          }
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
        title={
          deleteTarget?.kind === "comment"
            ? t("confirmDeleteCommentTitle")
            : t("confirmDeletePostTitle")
        }
        message={
          deleteTarget?.kind === "comment"
            ? t("confirmDeleteCommentMsg")
            : t("confirmDeletePostMsg")
        }
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
