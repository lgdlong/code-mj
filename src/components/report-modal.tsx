"use client";

import { useEffect, useState } from "react";
import { useAppPreferences } from "@/components/providers";
import { MAX_REPORT_REASON_LENGTH } from "@/lib/constants";
import type { I18nKey } from "@/lib/i18n";

interface ReportModalProps {
  open: boolean;
  targetType: "post" | "comment";
  loading?: boolean;
  onSubmit: (reason: string) => void | Promise<void>;
  onClose: () => void;
}

const REPORT_REASON_KEYS: { id: string; key: I18nKey }[] = [
  { id: "spam", key: "reportReasonSpam" },
  { id: "harassment", key: "reportReasonHarassment" },
  { id: "inappropriate", key: "reportReasonInappropriate" },
  { id: "misinfo", key: "reportReasonMisinfo" },
  { id: "other", key: "reportReasonOther" },
];

export function ReportModal({
  open,
  targetType,
  loading = false,
  onSubmit,
  onClose,
}: ReportModalProps) {
  const { t } = useAppPreferences();
  const [selectedId, setSelectedId] = useState<string>("spam");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedId("spam");
      setDetails("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const chosen = REPORT_REASON_KEYS.find((r) => r.id === selectedId);
    if (!chosen) {
      setError(t("reportNeedReason"));
      return;
    }
    const trimmedDetails = details.trim();
    if (chosen.id === "other" && !trimmedDetails) {
      setError(t("reportNeedDetails"));
      return;
    }
    setError(null);
    const label = t(chosen.key);
    const fullReason = trimmedDetails ? `${label}: ${trimmedDetails}` : label;
    await onSubmit(fullReason.slice(0, MAX_REPORT_REASON_LENGTH));
  }

  return (
    <div
      className="sheet-overlay"
      onClick={loading ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      style={{ alignItems: "center", padding: 16 }}
    >
      <form
        className="sheet-panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          borderRadius: 18,
          maxWidth: 440,
          padding: 20,
          border: "1px solid var(--border)",
          gap: 12,
        }}
      >
        <h2 id="report-modal-title" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
          {targetType === "comment" ? t("reportTitleComment") : t("reportTitlePost")}
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
          {t("reportSubtitle")}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {REPORT_REASON_KEYS.map((r) => {
            const active = selectedId === r.id;
            return (
              <label
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--surface-hover)" : "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                <input
                  type="radio"
                  name="report-reason"
                  checked={active}
                  onChange={() => {
                    setSelectedId(r.id);
                    setError(null);
                  }}
                />
                <span>{t(r.key)}</span>
              </label>
            );
          })}
        </div>

        <div>
          <label
            htmlFor="report-details"
            style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}
          >
            {t("reportDetailsLabel")}{" "}
            {selectedId === "other" ? t("reportDetailsRequired") : t("reportDetailsOptional")}
          </label>
          <textarea
            id="report-details"
            rows={2}
            maxLength={140}
            value={details}
            onChange={(e) => {
              setDetails(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t("reportDetailsPlaceholder")}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--surface-alt)",
              color: "var(--ink)",
              fontSize: 14,
              resize: "none",
              outline: "none",
            }}
          />
        </div>

        {error && (
          <div style={{ fontSize: 13, color: "var(--red)" }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button
            type="button"
            className="btn-post-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: 10,
              background: "var(--red)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : t("reportSubmit")}
          </button>
        </div>
      </form>
    </div>
  );
}
