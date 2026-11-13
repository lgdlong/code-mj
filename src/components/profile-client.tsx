"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { AppShell } from "@/components/app-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import { MoreSheet, type MoreSheetTarget } from "@/components/more-sheet";
import { PostCard, UserAvatar } from "@/components/post-card";
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
          onClick={() => router.push("/")}
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
        <strong style={{ fontSize: 16 }}>@{profile.username}</strong>
      </div>

      <section
        style={{
          padding: "18px 16px 14px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {profile.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>
                @{profile.username}
              </span>
              {profile.role === "admin" && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "var(--red-soft)",
                    color: "var(--red)",
                  }}
                >
                  Admin
                </span>
              )}
            </div>
          </div>

          <UserAvatar name={profile.name} image={profile.image} size={64} />
        </div>

        {profile.bio && (
          <div style={{ marginTop: 12, fontSize: 14.5 }}>{profile.bio}</div>
        )}

        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 16,
            fontSize: 14,
            color: "var(--muted)",
          }}
        >
          <span>
            <strong style={{ color: "var(--ink)" }}>
              {profile.followersCount}
            </strong>{" "}
            {t("followersLabel")}
          </span>
          <span>
            <strong style={{ color: "var(--ink)" }}>
              {profile.followingCount}
            </strong>{" "}
            {t("followingLabel")}
          </span>
        </div>

        <div style={{ marginTop: 14 }}>
          {isSelf ? (
            <Link
              href="/settings/profile"
              style={{
                width: "100%",
                minHeight: 38,
                borderRadius: 10,
                background: "var(--surface-alt)",
                color: "var(--ink)",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t("editProfile")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleToggleFollow}
              style={{
                width: "100%",
                minHeight: 38,
                borderRadius: 10,
                background: profile.isFollowing
                  ? "var(--bg)"
                  : "var(--btn-primary-bg)",
                color: profile.isFollowing
                  ? "var(--ink)"
                  : "var(--btn-primary-ink)",
                border: profile.isFollowing
                  ? "1px solid var(--border)"
                  : "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {profile.isFollowing ? t("followingBtn") : t("follow")}
            </button>
          )}
        </div>

      </section>

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
