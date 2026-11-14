"use client";

import { useEffect, useRef, useState } from "react";
import type { LikerDTO } from "@/types/domain";

const DEBOUNCE_MS = 200;

interface MentionSuggestState {
  open: boolean;
  items: LikerDTO[];
  activeIndex: number;
  /** Where the `@token` starts in the input value; null = dropdown closed. */
  tokenStart: number;
}

/**
 * Tracks a trailing `@token` before the caret and fetches followed-user
 * suggestions for it. Only followed users are suggested; anything else must
 * be typed exactly and is validated server-side on submit.
 */
export function useMentionSuggest(value: string, caret: number | null) {
  const [state, setState] = useState<MentionSuggestState>({
    open: false,
    items: [],
    activeIndex: 0,
    tokenStart: -1,
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (caret === null) return;
    const before = value.slice(0, caret);
    const match = /(?:^|\s)@([a-z0-9._]*)$/i.exec(before);

    // Both branches go through the same timer so the effect body never calls
    // setState synchronously (react-hooks/set-state-in-effect).
    const timer = setTimeout(() => {
      if (!match) {
        abortRef.current?.abort();
        setState((s) => (s.open ? { ...s, open: false, items: [], tokenStart: -1 } : s));
        return;
      }
      // Position of "@" itself, not of the match start (the regex eats the
      // leading whitespace when present) — otherwise insert() swallows it.
      const tokenStart = caret - match[1].length - 1;
      const q = match[1].toLowerCase();
      void (async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        try {
          const res = await fetch(`/api/mentions/suggest?q=${encodeURIComponent(q)}`, {
            signal: controller.signal,
          });
          if (!res.ok) return;
          const json = (await res.json()) as { data?: { items?: LikerDTO[] } };
          const items = json.data?.items ?? [];
          setState({ open: items.length > 0, items, activeIndex: 0, tokenStart });
        } catch (err) {
          if ((err as Error).name !== "AbortError") setState((s) => ({ ...s, open: false }));
        }
      })();
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, caret]);

  function close() {
    setState({ open: false, items: [], activeIndex: 0, tokenStart: -1 });
  }

  function moveActive(delta: number) {
    setState((s) =>
      s.open
        ? { ...s, activeIndex: (s.activeIndex + delta + s.items.length) % s.items.length }
        : s
    );
  }

  /** Replaces the `@token` with `@username `. Returns the new value + caret, or null. */
  function insert(
    username: string,
    currentValue: string,
    currentCaret: number
  ): { text: string; caret: number } | null {
    if (!state.open) return null;
    const { tokenStart } = state;
    if (tokenStart < 0) return null;
    const replacement = `@${username} `;
    const caretAfter = tokenStart + replacement.length;
    const text = `${currentValue.slice(0, tokenStart)}${replacement}${currentValue.slice(currentCaret)}`;
    close();
    return { text, caret: caretAfter };
  }

  return {
    open: state.open,
    items: state.items,
    activeIndex: state.activeIndex,
    moveActive,
    insert,
    close,
  };
}
