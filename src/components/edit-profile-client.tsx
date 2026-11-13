"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import { readApiError } from "@/lib/client-error";
import { compressPostImage } from "@/lib/compress-image";
import {
  MAX_BIO_LENGTH,
  MAX_IMAGE_MB,
  MAX_NAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from "@/lib/constants";

interface EditProfileClientProps {
  initialUser: {
    name: string;
    username: string;
    bio: string;
    image: string | null;
  };
  cooldownDaysLeft: number;
  hasUsedInitialChange: boolean;
}

export function EditProfileClient({
  initialUser,
  cooldownDaysLeft,
  hasUsedInitialChange,
}: EditProfileClientProps) {
  const router = useRouter();
  const { t, lang, showToast } = useAppPreferences();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(initialUser.name);
  const [username, setUsername] = useState(initialUser.username);
  const [bio, setBio] = useState(initialUser.bio);
  const [image, setImage] = useState<string | null>(initialUser.image);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canChangeUsername = cooldownDaysLeft === 0;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(t("errImageTooLarge"));
      return;
    }
    try {
      const compressed = await compressPostImage(file);
      setPendingAvatar(compressed);
      setImage(URL.createObjectURL(compressed));
    } catch {
      setError(t("errImageCompress"));
    }
  }

  async function uploadAvatar(file: File): Promise<string> {
    const sigRes = await fetch("/api/upload", { method: "POST" });
    const sigJson = (await sigRes.json()) as {
      data?: {
        signature: string;
        timestamp: number;
        folder: string;
        cloudName: string;
        apiKey: string;
      };
      error?: string;
    };
    if (!sigRes.ok || !sigJson.data) {
      throw new Error(sigJson.error ?? t("errUploadSig"));
    }
    const { signature, timestamp, folder, cloudName, apiKey } = sigJson.data;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );
    const cloudJson = (await cloudRes.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };
    if (!cloudRes.ok || !cloudJson.secure_url) {
      throw new Error(cloudJson.error?.message ?? t("errUploadCloud"));
    }
    return cloudJson.secure_url;
  }

  async function handleSave() {
    if (saving) return;
    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedBio = bio.trim();

    if (!trimmedName || trimmedName.length > MAX_NAME_LENGTH) {
      setError(t("errNameRequired"));
      return;
    }
    if (canChangeUsername) {
      if (!/^[a-z0-9._]+$/.test(trimmedUsername)) {
        setError(t("errUsernameCharset"));
        return;
      }
      if (trimmedUsername.length < 3 || trimmedUsername.length > MAX_USERNAME_LENGTH) {
        setError(t("errUsernameLength"));
        return;
      }
    }
    if (trimmedBio.length > MAX_BIO_LENGTH) {
      setError(t("errBioLength"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let finalImage = image;
      if (pendingAvatar) {
        finalImage = await uploadAvatar(pendingAvatar);
      }

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          username: trimmedUsername,
          bio: trimmedBio,
          ...(pendingAvatar || image !== initialUser.image
            ? { image: finalImage }
            : {}),
        }),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, lang, "errProfileSave"));
      }
      const json = (await res.json()) as {
        data?: { username: string };
      };
      if (!json.data) {
        throw new Error(t("errInvalidResponse"));
      }

      showToast(t("profileUpdatedToast"));
      router.push(`/u/${json.data.username}`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("errProfileSave");
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell username={initialUser.username} showHeader={false} hideBottomNav>
      <div
        style={{
          height: 54,
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{ fontSize: 15, textAlign: "left" }}
        >
          {lang === "vi" ? "Hủy" : "Cancel"}
        </button>
        <strong style={{ fontSize: 16, textAlign: "center" }}>
          {lang === "vi" ? "Chỉnh sửa trang cá nhân" : "Edit profile"}
        </strong>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            justifySelf: "end",
            fontSize: 15,
            fontWeight: 700,
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? "..." : lang === "vi" ? "Xong" : "Done"}
        </button>
      </div>

      <div style={{ padding: "24px 16px" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: "18px 18px 8px",
          }}
        >
          {/* Row 1: Name + Avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                {lang === "vi" ? "Tên" : "Name"}
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                placeholder={lang === "vi" ? "Tên hiển thị" : "Display name"}
                style={{
                  width: "100%",
                  border: 0,
                  outline: "none",
                  background: "transparent",
                  color: "var(--ink)",
                  font: "inherit",
                  fontSize: 15,
                }}
              />
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleAvatarChange}
            />
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setAvatarMenuOpen((prev) => !prev)}
                title={lang === "vi" ? "Đổi ảnh đại diện" : "Change avatar"}
                style={{ display: "block", borderRadius: "50%" }}
              >
                <UserAvatar name={name || "F"} image={image} size={54} />
              </button>

              {avatarMenuOpen && (
                <>
                  <div
                    onClick={() => setAvatarMenuOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  />
                  <div
                    role="menu"
                    className="popover-menu"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 220,
                      zIndex: 50,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      padding: 6,
                      boxShadow: "0 12px 32px rgba(0, 0, 0, 0.36)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        fileRef.current?.click();
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: 11,
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      {lang === "vi" ? "Tải ảnh lên" : "Upload photo"}
                    </button>
                    <div style={{ height: 1, background: "var(--border)", margin: "2px 8px" }} />
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!image}
                      onClick={() => {
                        setImage(null);
                        setPendingAvatar(null);
                        if (fileRef.current) fileRef.current.value = "";
                        setAvatarMenuOpen(false);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: 11,
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: "var(--red)",
                        opacity: image ? 1 : 0.4,
                        cursor: image ? "pointer" : "default",
                      }}
                    >
                      {lang === "vi" ? "Gỡ ảnh hiện tại" : "Remove current photo"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Username */}
          <div
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
              {lang === "vi" ? "Tên người dùng" : "Username"}
            </div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={MAX_USERNAME_LENGTH}
              disabled={!canChangeUsername}
              placeholder="username"
              style={{
                width: "100%",
                border: 0,
                outline: "none",
                background: "transparent",
                color: canChangeUsername ? "var(--ink)" : "var(--muted)",
                font: "inherit",
                fontSize: 15,
              }}
            />
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              {canChangeUsername
                ? hasUsedInitialChange
                  ? lang === "vi"
                    ? "Có thể đổi (mỗi 30 ngày 1 lần)"
                    : "Available (once every 30 days)"
                  : lang === "vi"
                  ? "Bạn có sẵn 1 lượt đổi miễn phí lần đầu"
                  : "1 free initial change available"
                : lang === "vi"
                ? `Bạn có thể đổi lại sau ${cooldownDaysLeft} ngày`
                : `Available again in ${cooldownDaysLeft} days`}
            </div>
          </div>

          {/* Row 3: Bio */}
          <div style={{ padding: "14px 0" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
              {lang === "vi" ? "Tiểu sử" : "Bio"}
            </div>
            <textarea
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              rows={2}
              maxLength={MAX_BIO_LENGTH}
              placeholder={lang === "vi" ? "+ Viết tiểu sử" : "+ Write bio"}
              style={{
                width: "100%",
                border: 0,
                outline: "none",
                background: "transparent",
                color: "var(--ink)",
                font: "inherit",
                fontSize: 15,
                resize: "none",
              }}
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 12,
              background: "var(--red-soft)",
              color: "var(--red)",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </AppShell>
  );
}
