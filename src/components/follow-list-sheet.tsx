"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserAvatar, formatRelativeTime } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import type { LikerDTO } from "@/types/domain";

export type FollowListKind = "followers" | "following";

interface FollowListSheetProps {
  username: string;
  kind: FollowListKind;
  initialCount: number;
  onClose: () => void;
}

interface FollowsPage {
  items: LikerDTO[];
  nextCursor: string | null;
}

async function fetchFollows(
  username: string,
  kind: FollowListKind,
  cursor: string | null
): Promise<FollowsPage> {
  const base = `/api/users/${encodeURIComponent(username)}/follows?kind=${kind}`;
  const res = await fetch(cursor ? `${base}&cursor=${encodeURIComponent(cursor)}` : base);
  const json = (await res.json()) as { data?: FollowsPage; error?: string };
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "errFeedLoad");
  }
  return json.data;
}

export function FollowListSheet({ username, kind, initialCount, onClose }: FollowListSheetProps) {
  const { t, lang, showToast } = useAppPreferences();
  const [items, setItems] = useState<LikerDTO[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchFollows(username, kind, null)
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
  }, [username, kind]);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const page = await fetchFollows(username, kind, nextCursor);
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
          {kind === "followers" ? t("likedByFollowers") : t("likedByFollowing")} · {initialCount}
        </div>

        <div className="likes-sheet-list">
          {loading && items.length === 0 ? (
            <div className="likes-sheet-empty">...</div>
          ) : failed ? (
            <div className="likes-sheet-empty">{t("errFeedLoad")}</div>
          ) : items.length === 0 ? (
            <div className="likes-sheet-empty">{t("likedByEmpty")}</div>
          ) : (
            items.map((user) => (
              <Link
                key={user.id}
                href={`/u/${user.username}`}
                className="liker-row"
                onClick={onClose}
              >
                <UserAvatar name={user.name} image={user.image} size={36} />
                <div className="liker-body">
                  <div className="liker-name">{user.name}</div>
                  <div className="liker-username">@{user.username}</div>
                </div>
                <span className="liker-time">
                  {formatRelativeTime(user.createdAt, lang)}
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
