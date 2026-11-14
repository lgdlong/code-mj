"use client";

import { useAppPreferences } from "@/components/providers";
import { MAX_BIO_LENGTH, MAX_USERNAME_LENGTH, USERNAME_CHANGE_COOLDOWN_DAYS } from "@/lib/constants";

interface EditProfileFieldsProps {
  username: string;
  bio: string;
  canChangeUsername: boolean;
  hasUsedInitialChange: boolean;
  cooldownDaysLeft: number;
  onUsernameChange: (v: string) => void;
  onBioChange: (v: string) => void;
}

export function EditProfileFields({
  username,
  bio,
  canChangeUsername,
  hasUsedInitialChange,
  cooldownDaysLeft,
  onUsernameChange,
  onBioChange,
}: EditProfileFieldsProps) {
  const { lang } = useAppPreferences();

  const cooldownLabel =
    USERNAME_CHANGE_COOLDOWN_DAYS === 1
      ? lang === "vi"
        ? "mỗi ngày 1 lần"
        : "once a day"
      : lang === "vi"
      ? `mỗi ${USERNAME_CHANGE_COOLDOWN_DAYS} ngày 1 lần`
      : `once every ${USERNAME_CHANGE_COOLDOWN_DAYS} days`;

  const cooldownText = canChangeUsername
    ? hasUsedInitialChange
      ? lang === "vi"
        ? `Có thể đổi (${cooldownLabel})`
        : `Available (${cooldownLabel})`
      : lang === "vi"
      ? "Bạn có sẵn 1 lượt đổi miễn phí lần đầu"
      : "1 free initial change available"
    : lang === "vi"
    ? `Bạn có thể đổi lại sau ${cooldownDaysLeft} ngày`
    : `Available again in ${cooldownDaysLeft} day${cooldownDaysLeft === 1 ? "" : "s"}`;

  return (
    <>
      <div style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          {lang === "vi" ? "Tên người dùng" : "Username"}
        </div>
        <input
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
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
          {cooldownText}
        </div>
      </div>

      <div style={{ padding: "14px 0" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          {lang === "vi" ? "Tiểu sử" : "Bio"}
        </div>
        <textarea
          value={bio}
          onChange={(e) => {
            onBioChange(e.target.value);
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
    </>
  );
}
