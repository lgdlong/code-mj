"use client";

import { useAppPreferences } from "@/components/providers";

interface EditProfileHeaderProps {
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function EditProfileHeader({
  saving,
  onCancel,
  onSave,
}: EditProfileHeaderProps) {
  const { lang } = useAppPreferences();

  return (
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
      <button type="button" onClick={onCancel} style={{ fontSize: 15, textAlign: "left" }}>
        {lang === "vi" ? "Hủy" : "Cancel"}
      </button>
      <strong style={{ fontSize: 16, textAlign: "center" }}>
        {lang === "vi" ? "Chỉnh sửa trang cá nhân" : "Edit profile"}
      </strong>
      <button
        type="button"
        onClick={onSave}
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
  );
}
