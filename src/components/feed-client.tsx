"use client";

import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { MoreSheet, type MoreSheetTarget } from "@/components/more-sheet";
import { PostCard, UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import { type FeedPage, useFeedMutations } from "@/hooks/use-feed-mutations";

const ConfirmModal = dynamic(() => import("@/components/confirm-modal").then((m) => m.ConfirmModal), { ssr: false });
const ReportModal = dynamic(() => import("@/components/report-modal").then((m) => m.ReportModal), { ssr: false });
import { readApiError } from "@/lib/client-error";
import type { PostDTO } from "@/types/domain";

interface FeedClientProps {
  currentUser: {
    id: string;
    username: string;
    name: string;
    image: string | null;
  };
  initialPosts: PostDTO[];
  initialNextCursor: string | null;
}

async function fetchFeedPage(cursor: string | null): Promise<FeedPage> {
  const url = cursor ? `/api/posts?tab=all&cursor=${encodeURIComponent(cursor)}` : "/api/posts?tab=all";
  const res = await fetch(url);
  const json = (await res.json()) as { data?: FeedPage; error?: string };
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "errFeedLoad");
  }
  return json.data;
}

export function FeedClient({ currentUser, initialPosts, initialNextCursor }: FeedClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, lang, showToast } = useAppPreferences();
  const [sheetTarget, setSheetTarget] = useState<MoreSheetTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MoreSheetTarget | null>(null);
  const [reportTarget, setReportTarget] = useState<MoreSheetTarget | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toggleLike, toggleFollow } = useFeedMutations();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    error: feedError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: {
      pages: [{ items: initialPosts, nextCursor: initialNextCursor }],
      pageParams: [null],
    },
  });

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  async function confirmDelete() {
    if (!deleteTarget || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/posts/${deleteTarget.postId}`, { method: "DELETE" });
      if (!res.ok) {
        showToast(await readApiError(res, lang, "errDeletePost"), "error");
        return;
      }
      queryClient.setQueryData<InfiniteData<FeedPage>>(["feed"], (prev) =>
        prev && {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            items: page.items.filter((p) => p.id !== deleteTarget.postId),
          })),
        }
      );
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      setDeleteTarget(null);
      showToast(t("deletedToast"));
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
          targetType: "post",
          postId: reportTarget.postId,
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
    <AppShell username={currentUser.username}>
      <div
        onClick={() => router.push("/compose")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
        }}
      >
        <UserAvatar name={currentUser.name} image={currentUser.image} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
            {currentUser.username}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 15 }}>{t("whatsNew")}</div>
        </div>
      </div>

      {feedError ? (
        <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--red)", fontSize: 14 }}>
          {t("errFeedLoad")}
        </div>
      ) : isLoading ? (
        <div style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>...</div>
      ) : posts.length === 0 ? (
        <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          {t("emptyPosts")}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUser.id}
            onToggleLike={toggleLike}
            onToggleFollow={toggleFollow}
            onOpenMore={(p) =>
              setSheetTarget({
                kind: "post",
                postId: p.id,
                canEdit: p.author.id === currentUser.id,
                canDelete: p.author.id === currentUser.id,
              })
            }
          />
        ))
      )}

      {hasNextPage && (
        <div
          ref={sentinelRef}
          style={{ padding: "20px 16px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}
        >
          {isFetchingNextPage ? "..." : ""}
        </div>
      )}

      <MoreSheet
        target={sheetTarget}
        onClose={() => setSheetTarget(null)}
        onEdit={(postId) => router.push(`/compose?edit=${postId}`)}
        onDelete={(target) => setDeleteTarget(target)}
        onReport={(target) => setReportTarget(target)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={t("confirmDeletePostTitle")}
        message={t("confirmDeletePostMsg")}
        confirmLabel={t("deleteBtn")}
        cancelLabel={t("cancel")}
        loading={actionLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ReportModal
        open={Boolean(reportTarget)}
        targetType="post"
        loading={actionLoading}
        onSubmit={submitReport}
        onClose={() => setReportTarget(null)}
      />
    </AppShell>
  );
}
