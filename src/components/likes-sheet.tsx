"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserAvatar, formatRelativeTime } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import type { LikerDTO } from "@/types/domain";

interface LikesSheetProps {
  postId: string;
  likesCount: number;
  onClose: () => void;
}

interface LikersPage {
  items: LikerDTO[];
  nextCursor: string | null;
}

async function fetchLikers(postId: string, cursor: string | null): Promise<LikersPage> {
  const url = cursor
    ? `/api/posts/${postId}/likes?cursor=${encodeURIComponent(cursor)}`
    : `/api/posts/${postId}/likes`;
  const res = await fetch(url);
  const json = (await res.json()) as { data?: LikersPage; error?: string };
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "errFeedLoad");
  }
  return json.data;
}

export function LikesSheet({ postId, likesCount, onClose }: LikesSheetProps) {
  const { t, lang, showToast } = useAppPreferences();
  const [items, setItems] = useState<LikerDTO[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchLikers(postId, null)
      .then((page) => {
        if (!active) return;
        setItems(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [postId]);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const page = await fetchLikers(postId, nextCursor);
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...page.items.filter((item) => !seen.has(item.id))];
      });
      setNextCursor(page.nextCursor);
    } catch {
      showToast(t("errNetwork"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet-panel likes-sheet-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="likes-sheet-head">
          {t("likedByTitle")} · {likesCount}
        </div>

        <div className="likes-sheet-list">
          {loading && items.length === 0 ? (
            <div className="likes-sheet-empty">...</div>
          ) : failed ? (
            <div className="likes-sheet-empty">{t("errFeedLoad")}</div>
          ) : items.length === 0 ? (
            <div className="likes-sheet-empty">{t("likedByEmpty")}</div>
          ) : (
            items.map((liker) => (
              <Link
                key={liker.id}
                href={`/u/${liker.username}`}
                className="liker-row"
                onClick={onClose}
              >
                <UserAvatar name={liker.name} image={liker.image} size={36} />
                <div className="liker-body">
                  <div className="liker-name">{liker.name}</div>
                  <div className="liker-username">@{liker.username}</div>
                </div>
                <span className="liker-time">
                  {formatRelativeTime(liker.createdAt, lang)}
                </span>
              </Link>
            ))
          )}
        </div>

        {nextCursor && (
          <button
            type="button"
            className="likes-sheet-more"
            onClick={() => void loadMore()}
            disabled={loading}
          >
            {loading ? "..." : t("loadMoreBtn")}
          </button>
        )}
      </div>
    </div>
  );
}
