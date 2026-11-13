"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App:ErrorBoundary]", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        textAlign: "center",
        background: "var(--bg)",
        color: "var(--ink)",
        gap: 14,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        marjames
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
        Đã xảy ra lỗi
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 14, maxWidth: 320 }}>
        Không thể tải trang lúc này. Bạn thử tải lại hoặc quay về trang chủ.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button type="button" onClick={reset} className="btn-post-primary">
          Thử lại
        </button>
        <Link href="/" className="btn-post-sm">
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
