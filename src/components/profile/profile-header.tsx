"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import type { ProfileDTO } from "@/types/domain";

interface ProfileHeaderProps {
  profile: ProfileDTO;
  isSelf: boolean;
  onToggleFollow: () => void;
}

export function ProfileHeader({
  profile,
  isSelf,
  onToggleFollow,
}: ProfileHeaderProps) {
  const { t } = useAppPreferences();

  return (
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
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
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
          <strong style={{ color: "var(--ink)" }}>{profile.followersCount}</strong>{" "}
          {t("followersLabel")}
        </span>
        <span>
          <strong style={{ color: "var(--ink)" }}>{profile.followingCount}</strong>{" "}
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
            onClick={onToggleFollow}
            style={{
              width: "100%",
              minHeight: 38,
              borderRadius: 10,
              background: profile.isFollowing ? "transparent" : "var(--btn-primary-bg)",
              color: profile.isFollowing ? "var(--ink)" : "var(--btn-primary-ink)",
              border: profile.isFollowing ? "1px solid var(--border)" : "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {profile.isFollowing ? t("followingBtn") : t("follow")}
          </button>
        )}
      </div>
    </section>
  );
}
