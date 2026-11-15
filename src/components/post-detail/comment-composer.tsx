"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import { ComposeImageGrid } from "@/components/compose/compose-image-grid";
import { ImageGlyph } from "@/components/icons";
import { useAppPreferences } from "@/components/providers";
import {
  useComposeImages,
  type ComposeImageError,
  type ComposeImagePayload,
} from "@/hooks/use-compose-images";
import { useMentionSuggest } from "@/hooks/use-mention-suggest";
import type { I18nKey } from "@/lib/i18n";
import type { LikerDTO } from "@/types/domain";

/** What the submit handler needs from the composer's media state. */
export interface CommentComposerMedia {
  total: number;
  publish: (t: (key: I18nKey) => string) => Promise<ComposeImagePayload>;
  reset: () => void;
}

interface CommentComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  replyTo: string | null;
  onCancelReply: () => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  mediaRef: React.RefObject<CommentComposerMedia | null>;
  onHeightChange?: (height: number) => void;
}

export function CommentComposer({
  value,
  onValueChange,
  replyTo,
  onCancelReply,
  submitting,
  onSubmit,
  inputRef,
  mediaRef,
  onHeightChange,
}: CommentComposerProps) {
  const { t, showToast } = useAppPreferences();
  const media = useComposeImages();
  const [caret, setCaret] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submit reads through the parent's ref, not component state.
  useEffect(() => {
    mediaRef.current = { total: media.total, publish: media.publish, reset: media.reset };
  }, [media.total, media.publish, media.reset, mediaRef]);

  const suggest = useMentionSuggest(value, caret);

  // Report the composer height so the thread pads above the fixed bar.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !onHeightChange) return;
    const observer = new ResizeObserver(() => onHeightChange(root.offsetHeight));
    observer.observe(root);
    onHeightChange(root.offsetHeight);
    return () => observer.disconnect();
  }, [onHeightChange]);

  async function handleAddFiles(files: File[]) {
    const error: ComposeImageError | null = await media.addFiles(files);
    if (error) showToast(t(error), "error");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onValueChange(e.target.value);
    setCaret(e.target.selectionStart);
  }

  function pickActive(username: string) {
    const result = suggest.insert(username, value, caret ?? value.length);
    if (result === null) return;
    onValueChange(result.text);
    // Keep caret state in sync so the suggest effect doesn't re-run against the
    // old caret and reopen the dropdown for the token just chosen.
    setCaret(result.caret);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(result.caret, result.caret);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggest.open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      suggest.moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      suggest.moveActive(-1);
    } else if (e.key === "Escape") {
      suggest.close();
    } else if (e.key === "Enter" || e.key === "Tab") {
      const user = suggest.items[suggest.activeIndex] as LikerDTO | undefined;
      if (user) {
        e.preventDefault();
        pickActive(user.username);
      }
    }
  }

  return (
    <div ref={rootRef} className="comment-composer-wrap">
      {media.items.length > 0 && (
        <div className="comment-composer-media">
          <ComposeImageGrid
            items={media.items}
            removeLabel={t("removeImage")}
            onRemove={media.remove}
          />
        </div>
      )}
      {replyTo && (
        <div className="comment-reply-chip">
          {t("replyingTo")} @{replyTo}
          <button type="button" onClick={onCancelReply} aria-label={t("cancel")}>
            <X size={12} weight="bold" />
          </button>
        </div>
      )}
      {suggest.open && (
        <div className="mention-suggest" role="listbox">
          {suggest.items.map((user, i) => (
            <button
              type="button"
              key={user.id}
              role="option"
              aria-selected={i === suggest.activeIndex}
              className={i === suggest.activeIndex ? "mention-suggest-row active" : "mention-suggest-row"}
              onMouseDown={(e) => {
                e.preventDefault();
                pickActive(user.username);
              }}
            >
              {user.image ? (
                <img src={user.image} alt="" className="mention-suggest-avatar" />
              ) : (
                <span className="mention-suggest-avatar">{user.name.charAt(0).toUpperCase()}</span>
              )}
              <span className="mention-suggest-name">@{user.username}</span>
            </button>
          ))}
        </div>
      )}
      <form className="comment-composer-bar" onSubmit={onSubmit}>
        <button
          type="button"
          className="comment-image-btn"
          onClick={() => fileInputRef.current?.click()}
          aria-label={t("addImage")}
          disabled={media.total >= 5}
        >
          <ImageGlyph size={22} />
        </button>
        <input
          ref={inputRef}
          className="comment-input"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => suggest.close(), 120)}
          onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
          placeholder={t("replyPlaceholder")}
          required={media.total === 0}
        />
        <button className="btn-post-sm" type="submit" disabled={submitting}>
          {t("postBtn")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) void handleAddFiles(files);
          }}
        />
      </form>
    </div>
  );
}
