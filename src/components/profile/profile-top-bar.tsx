"use client";

import { ArrowLeft } from "@phosphor-icons/react";

export function ProfileTopBar({
  username,
  onBack,
}: {
  username: string;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        height: 52,
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "var(--nav-bg)",
        backdropFilter: "blur(14px)",
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
        }}
      >
        <ArrowLeft size={21} weight="bold" />
      </button>
      <strong style={{ fontSize: 16 }}>@{username}</strong>
    </div>
  );
}
