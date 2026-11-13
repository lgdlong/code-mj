"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={() => !loading && onCancel()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(0, 0, 0, 0.62)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "sheetFadeIn 180ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        className="popover-menu"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 18px 48px rgba(0, 0, 0, 0.4)",
        }}
      >
        <h2
          id="confirm-modal-title"
          style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 14,
            lineHeight: 1.45,
            color: "var(--muted)",
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 12,
              background: "var(--surface-alt)",
              border: "1px solid var(--border)",
              color: "var(--ink)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 12,
              background: danger ? "var(--red)" : "var(--btn-primary-bg)",
              color: danger ? "#ffffff" : "var(--btn-primary-ink)",
              fontSize: 14,
              fontWeight: 700,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
