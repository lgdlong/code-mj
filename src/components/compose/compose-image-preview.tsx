"use client";

import { CheckCircle, X } from "@phosphor-icons/react";

interface ComposeImagePreviewProps {
  previewUrl: string;
  compressedSizeKb: number | null;
  onRemove: () => void;
}

export function ComposeImagePreview({
  previewUrl,
  compressedSizeKb,
  onRemove,
}: ComposeImagePreviewProps) {
  return (
    <div style={{ position: "relative", marginBottom: 10 }}>
      <div className="post-image-wrap">
        <img src={previewUrl} alt="Preview" />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "rgba(16,16,16,0.75)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
        }}
      >
        <X size={16} weight="bold" />
      </button>
      {compressedSizeKb !== null && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 6,
          }}
        >
          <CheckCircle size={14} weight="fill" />
          <span>WebP: {compressedSizeKb} KB</span>
        </div>
      )}
    </div>
  );
}
