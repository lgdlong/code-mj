"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import { MoreSheet, type MoreSheetTarget } from "@/components/more-sheet";
import { PostCard, UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import { ReportModal } from "@/components/report-modal";
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
}

async function fetchFeed(): Promise<PostDTO[]> {
  const res = await fetch("/api/posts?tab=all");
  const json = (await res.json()) as { data?: { items: PostDTO[] }; error?: string };
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "errFeedLoad");
  }
  return json.data.items;
}

export function FeedClient({ currentUser, initialPosts }: FeedClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, lang, showToast } = useAppPreferences();
  const [sheetTarget, setSheetTarget] = useState<MoreSheetTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MoreSheetTarget | null>(null);
  const [reportTarget, setReportTarget] = useState<MoreSheetTarget | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data: posts = [], isLoading, error: feedError } = useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeed,
    initialData: initialPosts,
  });

  async function handleToggleLike(postId: string) {
    const toggle = (list: PostDTO[] | undefined) =>
      list?.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likesCount: p.likesCount + (p.likedByMe ? -1 : 1),
            }
          : p
      );

    queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) {
        queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
        showToast(await readApiError(res, lang, "errLike"), "error");
      } else {
        void queryClient.invalidateQueries({ queryKey: ["feed"] });
      }
    } catch {
      queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
      showToast(t("errNetwork"), "error");
    }
  }

  async function handleToggleFollow(username: string) {
    const toggle = (list: PostDTO[] | undefined) =>
      list?.map((p) =>
        p.author.username === username
          ? { ...p, author: { ...p.author, isFollowing: !p.author.isFollowing } }
          : p
      );

    queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
        method: "POST",
      });
      if (!res.ok) {
        queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
        showToast(await readApiError(res, lang, "errFollow"), "error");
      } else {
        void queryClient.invalidateQueries({ queryKey: ["feed"] });
      }
    } catch {
      queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
      showToast(t("errNetwork"), "error");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/posts/${deleteTarget.postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        showToast(await readApiError(res, lang, "errDeletePost"), "error");
        return;
      }
      queryClient.setQueryData<PostDTO[]>(["feed"], (prev) =>
        prev?.filter((p) => p.id !== deleteTarget.postId)
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
          <div style={{ color: "var(--muted)", fontSize: 15 }}>
            {t("whatsNew")}
          </div>
        </div>
      </div>

      {feedError ? (
        <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--red)", fontSize: 14 }}>
          {t("errFeedLoad")}
        </div>
      ) : isLoading ? (
        <div style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
          ...
        </div>
      ) : posts.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 14,
          }}
        >
          {t("emptyPosts")}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUser.id}
            onToggleLike={handleToggleLike}
            onToggleFollow={handleToggleFollow}
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
