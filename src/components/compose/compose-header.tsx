"use client";

import { useAppPreferences } from "@/components/providers";

interface ComposeHeaderProps {
  isEdit: boolean;
  submitting: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ComposeHeader({
  isEdit,
  submitting,
  canSubmit,
  onCancel,
  onSubmit,
}: ComposeHeaderProps) {
  const { t } = useAppPreferences();

  return (
    <div
      style={{
        height: 52,
        padding: "0 16px",
        borderBottom: "1px solid var(--border)",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
      }}
    >
      <button type="button" onClick={onCancel} style={{ fontSize: 15, textAlign: "left" }}>
        {t("cancel")}
      </button>
      <strong style={{ fontSize: 15, textAlign: "center" }}>
        {isEdit ? t("editThread") : t("newThread")}
      </strong>
      <button
        type="button"
        className="btn-post-primary"
        style={{ justifySelf: "end", opacity: submitting ? 0.6 : 1 }}
        disabled={submitting || !canSubmit}
        onClick={onSubmit}
      >
        {isEdit ? t("saveBtn") : t("postBtn")}
      </button>
    </div>
  );
}
