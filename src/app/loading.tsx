export default function LoadingPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--bg)",
        color: "var(--ink)",
      }}
    >
      <div
        className="animate-pulse"
        style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        marjames
      </div>
      <div
        className="animate-spin"
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: "2px solid var(--border)",
          borderTopColor: "var(--ink)",
        }}
      />
    </main>
  );
}
