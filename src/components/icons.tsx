interface GlyphProps {
  size?: number;
}

// Icons are rounded, never sharp (AGENTS.md) - Phosphor's square-bodied glyphs are redrawn here.
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function ImageGlyph({ size = 21 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <rect x="3" y="3" width="18" height="18" rx="7" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15.5l-4.2-4.2a2 2 0 0 0-2.8 0L6 19.3" />
    </svg>
  );
}

export function VideoGlyph({ size = 21 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <rect x="1.5" y="4.5" width="14" height="15" rx="5.5" />
      <path d="M15.5 9.6 21 6.4a1.2 1.2 0 0 1 1.5 1.1v9a1.2 1.2 0 0 1-1.5 1.1l-5.5-3.2" />
    </svg>
  );
}

export function ExternalGlyph({ size = 14 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M14.5 3.5h6v6" />
      <path d="M20.5 3.5 11.5 12.5" />
      <path d="M19.5 14v4.5a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4H11" />
    </svg>
  );
}
