"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AvatarPicker } from "@/components/profile/avatar-picker";
import { EditProfileFields } from "@/components/profile/edit-profile-fields";
import { EditProfileHeader } from "@/components/profile/edit-profile-header";
import { useAppPreferences } from "@/components/providers";
import { readApiError } from "@/lib/client-error";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
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
  const [name, setName] = useState(initialUser.name);
  const [username, setUsername] = useState(initialUser.username);
  const [bio, setBio] = useState(initialUser.bio);
  const [image, setImage] = useState<string | null>(initialUser.image);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
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
        const uploaded = await uploadImageToCloudinary(pendingAvatar, t);
        finalImage = uploaded.url;
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
      <EditProfileHeader
        saving={saving}
        onCancel={() => router.back()}
        onSave={handleSave}
      />

      <div style={{ padding: "24px 16px" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: "18px 18px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                {lang === "vi" ? "Tên" : "Name"}
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                placeholder={lang === "vi" ? "Tên hiển thị" : "Display name"}
                style={{ width: "100%", border: 0, outline: "none", background: "transparent", color: "var(--ink)", font: "inherit", fontSize: 15 }}
              />
            </div>

            <AvatarPicker
              name={name || "F"}
              image={image}
              onFileChange={handleAvatarChange}
              onRemove={() => {
                setImage(null);
                setPendingAvatar(null);
              }}
            />
          </div>

          <EditProfileFields
            username={username}
            bio={bio}
            canChangeUsername={canChangeUsername}
            hasUsedInitialChange={hasUsedInitialChange}
            cooldownDaysLeft={cooldownDaysLeft}
            onUsernameChange={setUsername}
            onBioChange={setBio}
          />
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: "var(--red-soft)", color: "var(--red)", fontSize: 13, textAlign: "center" }}>
            {error}
          </div>
        )}
      </div>
    </AppShell>
  );
}
