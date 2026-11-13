"use client";

import Link from "next/link";
import { DotsThree, Heart } from "@phosphor-icons/react";
import type { MoreSheetTarget } from "@/components/more-sheet";
import { UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import type { CommentDTO } from "@/types/domain";
function renderMentions(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9_]{3,24})/g);
  return parts.map((part, i) => {
    if (/^@[a-zA-Z0-9_]{3,24}$/.test(part)) {
      const username = part.slice(1).toLowerCase();
      return (
        <Link
          key={i}
          href={`/u/${username}`}
          style={{ color: "#3897f0", fontWeight: 500 }}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

interface CommentThreadProps {
  postId: string;
  comments: CommentDTO[];
  currentUserId: string;
  isPostOwner: boolean;
  onReply: (target: { id: number; username: string }) => void;
  onToggleLike: (commentId: number) => void;
  onOpenMore: (target: MoreSheetTarget) => void;
}

export function CommentThread({
  postId,
  comments,
  currentUserId,
  isPostOwner,
  onReply,
  onToggleLike,
  onOpenMore,
}: CommentThreadProps) {
  const { t } = useAppPreferences();

  return (
    <div style={{ paddingBottom: 76 }}>
      {comments.map((c) => {
        const canDeleteC = isPostOwner || c.author.id === currentUserId;
        return (
          <div
            key={c.id}
            style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
                  <Link href={`/u/${c.author.username}`} className="post-username">
                    {c.author.username}
                  </Link>
                  <button
                    type="button"
                    className="post-more-btn"
                    onClick={() =>
                      onOpenMore({
                        kind: "comment",
                        postId,
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

                <div className="post-content">{renderMentions(c.content)}</div>

                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14 }}>
                  <button
                    type="button"
                    onClick={() => onToggleLike(c.id)}
                    aria-label="Like"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 13,
                      color: c.likedByMe ? "var(--red)" : "var(--muted)",
                    }}
                  >
                    <Heart size={16} weight={c.likedByMe ? "fill" : "regular"} />
                    {c.likesCount > 0 && <span>{c.likesCount}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => onReply({ id: c.id, username: c.author.username })}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--muted)",
                    }}
                  >
                    {t("replyAction")}
                  </button>
                </div>

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
                      const canDeleteR = isPostOwner || r.author.id === currentUserId;
                      return (
                        <div key={r.id} style={{ display: "flex", gap: 12 }}>
                          <UserAvatar name={r.author.name} image={r.author.image} />
                          <div className="post-main">
                            <div className="post-author-row">
                              <Link href={`/u/${r.author.username}`} className="post-username">
                                {r.author.username}
                              </Link>
                              <button
                                type="button"
                                className="post-more-btn"
                                onClick={() =>
                                  onOpenMore({
                                    kind: "comment",
                                    postId,
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
                            <div className="post-content">{renderMentions(r.content)}</div>
                            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14 }}>
                              <button
                                type="button"
                                onClick={() => onToggleLike(r.id)}
                                aria-label="Like"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 13,
                                  color: r.likedByMe ? "var(--red)" : "var(--muted)",
                                }}
                              >
                                <Heart size={15} weight={r.likedByMe ? "fill" : "regular"} />
                                {r.likesCount > 0 && <span>{r.likesCount}</span>}
                              </button>
                              <button
                                type="button"
                                onClick={() => onReply({ id: c.id, username: r.author.username })}
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--muted)",
                                }}
                              >
                                {t("replyAction")}
                              </button>
                            </div>
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
  );
}
