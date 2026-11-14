"use client";

import { useAppPreferences } from "@/components/providers";

/** Role pill shown next to an admin's name (profile header, posts, comments). */
export function AdminBadge() {
  const { t } = useAppPreferences();
  return (
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
      {t("adminBadge")}
    </span>
  );
}
