"use client";

import Link from "next/link";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { PostCard, UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import type { PostDTO, UserSummaryDTO } from "@/types/domain";

export interface RecentEntry {
  type: "keyword" | "user";
  value: string;
}

interface SearchResultsProps {
  hasQuery: boolean;
  loading: boolean;
  recent: RecentEntry[];
  users: UserSummaryDTO[];
  posts: PostDTO[];
  onSelectRecent: (entry: RecentEntry) => void;
  onRemoveRecent: (entry: RecentEntry) => void;
  onSaveUserRecent: (username: string) => void;
}

export function SearchResults({
  hasQuery,
  loading,
  recent,
  users,
  posts,
  onSelectRecent,
  onRemoveRecent,
  onSaveUserRecent,
}: SearchResultsProps) {
  const { t } = useAppPreferences();

  if (!hasQuery) {
    return (
      <div>
        {recent.length > 0 && (
          <div style={{ padding: "14px 16px 6px", fontSize: 15, fontWeight: 700 }}>
            {t("searchRecent")}
          </div>
        )}
        {recent.map((item) => (
          <div
            key={`${item.type}:${item.value}`}
            onClick={() => onSelectRecent(item)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--surface-alt)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <MagnifyingGlass size={18} />
            </div>
            <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
              {item.type === "user" ? `@${item.value}` : item.value}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveRecent(item);
              }}
              aria-label="Remove"
              style={{
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                color: "var(--muted)",
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>...</div>;
  }

  if (users.length === 0 && posts.length === 0) {
    return (
      <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
        {t("searchEmpty")}
      </div>
    );
  }

  return (
    <div>
      {users.map((u) => (
        <Link
          key={u.id}
          href={`/u/${u.username}`}
          onClick={() => onSaveUserRecent(u.username)}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}
        >
          <UserAvatar name={u.name} image={u.image} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{u.name}</div>
          </div>
        </Link>
      ))}

      {posts.length > 0 && (
        <div
          style={{
            padding: "12px 16px 6px",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--muted)",
            borderTop: users.length ? "1px solid var(--border)" : undefined,
          }}
        >
          {t("searchPostsHeading")} ({posts.length})
        </div>
      )}

      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          currentUserId=""
          onToggleLike={() => {}}
          onOpenMore={() => {}}
        />
      ))}
    </div>
  );
}
