function Bar({ width, height = 14, radius = 6 }: { width: string | number; height?: number; radius?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        background: "var(--surface-alt)",
      }}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
      <div className="animate-pulse" style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface-alt)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Bar width="32%" height={13} />
        <Bar width="92%" />
        <Bar width="68%" />
        <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
          <Bar width={44} height={12} />
          <Bar width={44} height={12} />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", minHeight: "100dvh", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
      <div style={{ height: 52, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Bar width={110} height={18} />
      </div>
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", minHeight: "100dvh", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
      <div style={{ height: 52, padding: "0 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <Bar width={28} height={28} radius={999} />
        <Bar width={80} height={16} />
      </div>
      <PostCardSkeleton />
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <Bar width={140} height={13} />
      </div>
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", minHeight: "100dvh", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
      <div style={{ height: 52, padding: "0 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <Bar width={28} height={28} radius={999} />
        <Bar width={110} height={16} />
      </div>
      <div style={{ padding: "18px 16px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Bar width={140} height={20} />
            <Bar width={90} height={13} />
          </div>
          <div className="animate-pulse" style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-alt)" }} />
        </div>
        <Bar width="75%" />
        <Bar width="100%" height={38} radius={10} />
      </div>
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}

export function CompactPageSkeleton() {
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", minHeight: "100dvh", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
      <div style={{ height: 52, padding: "0 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Bar width={48} height={15} />
        <Bar width={100} height={15} />
        <Bar width={56} height={28} radius={999} />
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <Bar width="100%" height={84} radius={12} />
        <Bar width="60%" />
      </div>
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div style={{ minHeight: "100dvh", padding: 24, display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Bar width={140} height={28} />
        <Bar width="100%" height={36} radius={10} />
        <Bar width="100%" height={36} radius={10} />
        <Bar width="100%" height={36} radius={10} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignContent: "start" }}>
        <Bar width="100%" height={96} radius={12} />
        <Bar width="100%" height={96} radius={12} />
        <Bar width="100%" height={96} radius={12} />
        <Bar width="100%" height={96} radius={12} />
      </div>
    </div>
  );
}
