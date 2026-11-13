import Link from "next/link";

export default function NotFoundPage() {
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
      <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>404</div>
      <p style={{ color: "var(--muted)", fontSize: 14, maxWidth: 300 }}>
        Trang bạn tìm không tồn tại hoặc nội dung đã bị xóa.
      </p>
      <Link href="/" className="btn-post-primary" style={{ marginTop: 6 }}>
        Về trang chủ
      </Link>
    </main>
  );
}
