"use client";

import Link from "next/link";
import { parseMentions } from "@/lib/mentions";

/**
 * Renders comment content, linking @handles the server verified at write time
 * (stored on the row as `mentions`). Unknown handles stay plain text.
 */
export function MentionText({
  text,
  mentions,
}: {
  text: string;
  mentions: string[];
}) {
  const { segments } = parseMentions(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.handle && mentions.includes(seg.handle) ? (
          <Link
            key={i}
            href={`/u/${seg.handle}`}
            style={{ color: "var(--mention-link)", fontWeight: 500 }}
          >
            {seg.text}
          </Link>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}
