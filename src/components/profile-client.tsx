"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import { MoreSheet, type MoreSheetTarget } from "@/components/more-sheet";
import { PostCard } from "@/components/post-card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTopBar } from "@/components/profile/profile-top-bar";
import { useAppPreferences } from "@/components/providers";
import { ReportModal } from "@/components/report-modal";
import { readApiError } from "@/lib/client-error";
import type { PostDTO, ProfileDTO } from "@/types/domain";
interface ProfileClientProps {
  currentUser: {
    id: string;
    username: string;
  };
  initialProfile: ProfileDTO;
  initialPosts: PostDTO[];
}

export function ProfileClient({
  currentUser,
  initialProfile,
  initialPosts,
}: ProfileClientProps) {
  const router = useRouter();
  const { t, lang, showToast } = useAppPreferences();
  const [profile, setProfile] = useState<ProfileDTO>(initialProfile);
  const [posts, setPosts] = useState<PostDTO[]>(initialPosts);
  const [sheetTarget, setSheetTarget] = useState<MoreSheetTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MoreSheetTarget | null>(null);
  const [reportTarget, setReportTarget] = useState<MoreSheetTarget | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isSelf = profile.id === currentUser.id;

  async function handleToggleFollow() {
    const nextFollowing = !profile.isFollowing;
    const apply = (val: boolean) =>
      setProfile((prev) => ({
        ...prev,
        isFollowing: val,
        followersCount: prev.followersCount + (val ? 1 : -1),
      }));
    apply(nextFollowing);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(profile.username)}/follow`, {
        method: "POST",
      });
      if (!res.ok) {
        apply(!nextFollowing);
        showToast(await readApiError(res, lang, "errFollow"), "error");
      }
    } catch {
      apply(!nextFollowing);
      showToast(t("errNetwork"), "error");
    }
  }

  async function handleToggleLike(postId: string) {
    const toggle = (list: PostDTO[]) =>
      list.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likesCount: p.likesCount + (p.likedByMe ? -1 : 1),
            }
          : p
      );
    setPosts(toggle);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) {
        setPosts(toggle);
        showToast(await readApiError(res, lang, "errLike"), "error");
      }
    } catch {
      setPosts(toggle);
      showToast(t("errNetwork"), "error");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/posts/${deleteTarget.postId}`, { method: "DELETE" });
      if (!res.ok) {
        showToast(await readApiError(res, lang, "errDeletePost"), "error");
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.postId));
      setDeleteTarget(null);
      showToast(t("deletedToast"));
    } catch {
      showToast(t("errNetwork"), "error");
    } finally {
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
    <AppShell username={currentUser.username} showHeader={false}>
      <ProfileTopBar username={profile.username} onBack={() => router.push("/")} />

      <ProfileHeader
        profile={profile}
        isSelf={isSelf}
        onToggleFollow={handleToggleFollow}
      />

      {posts.length === 0 ? (
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
