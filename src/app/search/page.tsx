"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { AppShell } from "@/components/app-shell";
import { useAppPreferences } from "@/components/providers";
import { SearchResults, type RecentEntry } from "@/components/search/search-results";
import { RECENT_SEARCH_LIMIT } from "@/lib/constants";
import type { PostDTO, UserSummaryDTO } from "@/types/domain";

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

  function saveRecent(entry: RecentEntry) {
    const next = [
      entry,
      ...recent.filter((r) => !(r.type === entry.type && r.value === entry.value)),
    ].slice(0, RECENT_SEARCH_LIMIT);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  function removeRecent(entry: RecentEntry) {
    const next = recent.filter((r) => !(r.type === entry.type && r.value === entry.value));
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
        <button type="button" onClick={() => router.push("/")} style={{ fontSize: 15, fontWeight: 500 }}>
          {t("cancel")}
        </button>
      </div>

      <SearchResults
        hasQuery={Boolean(query.trim())}
        loading={loading}
        recent={recent}
        users={searchData?.users ?? []}
        posts={searchData?.posts ?? []}
        onSelectRecent={(item) =>
          item.type === "user" ? router.push(`/u/${item.value}`) : setQuery(item.value)
        }
        onRemoveRecent={removeRecent}
        onSaveUserRecent={(username) => saveRecent({ type: "user", value: username })}
      />
    </AppShell>
  );
}
