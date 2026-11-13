"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { AppShell } from "@/components/app-shell";
import { PostCard, UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import { RECENT_SEARCH_LIMIT } from "@/lib/constants";
import type { PostDTO, UserSummaryDTO } from "@/types/domain";

interface RecentEntry {
  type: "keyword" | "user";
  value: string;
}

const RECENT_KEY = "marjames_recent_searches";

export default function SearchPage() {
  const router = useRouter();
  const { t } = useAppPreferences();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recent, setRecent] = useState<RecentEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RecentEntry[];
        setRecent(parsed.slice(0, RECENT_SEARCH_LIMIT));
      }
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  const { data: searchData, isFetching: loading } = useQuery({
    queryKey: ["search", debouncedQuery],
    enabled: debouncedQuery.length > 0,
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      const json = (await res.json()) as {
        data?: { users: UserSummaryDTO[]; posts: PostDTO[] };
      };
      if (!res.ok || !json.data) {
        throw new Error("Search failed");
      }
      return json.data;
    },
  });

  const users = searchData?.users ?? [];
  const posts = searchData?.posts ?? [];

  function saveRecent(entry: RecentEntry) {
    const next = [
      entry,
      ...recent.filter(
        (r) => !(r.type === entry.type && r.value === entry.value)
      ),
    ].slice(0, RECENT_SEARCH_LIMIT);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  function removeRecent(entry: RecentEntry) {
    const next = recent.filter(
      (r) => !(r.type === entry.type && r.value === entry.value)
    );
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  return (
    <AppShell username="" showHeader={false}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "var(--nav-bg)",
          backdropFilter: "blur(14px)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            flex: 1,
            height: 38,
            padding: "0 12px",
            borderRadius: 10,
            background: "var(--surface-alt)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MagnifyingGlass size={17} color="var(--muted)" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            style={{
              flex: 1,
              minWidth: 0,
              border: 0,
              outline: "none",
              background: "transparent",
              color: "var(--ink)",
              font: "inherit",
              fontSize: 15,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{ fontSize: 15, fontWeight: 500 }}
        >
          {t("cancel")}
        </button>
      </div>

      {!query.trim() ? (
        <div>
          {recent.length > 0 && (
            <div
              style={{
                padding: "14px 16px 6px",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {t("searchRecent")}
            </div>
          )}
          {recent.map((item) => (
            <div
              key={`${item.type}:${item.value}`}
              onClick={() => {
                if (item.type === "user") {
                  router.push(`/u/${item.value}`);
                } else {
                  setQuery(item.value);
                }
              }}
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
                  removeRecent(item);
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
      ) : loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
          ...
        </div>
      ) : users.length === 0 && posts.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 14,
          }}
        >
          {t("searchEmpty")}
        </div>
      ) : (
        <div>
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/u/${u.username}`}
              onClick={() => saveRecent({ type: "user", value: u.username })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
              }}
            >
              <UserAvatar name={u.name} image={u.image} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  {u.name}
                </div>
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
      )}
    </AppShell>
  );
}
