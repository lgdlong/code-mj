"use client";

import { useCallback, useState } from "react";
import { prepareUploadImage } from "@/lib/compress-image";
import { uploadImage } from "@/lib/cloudinary-upload";
import { MAX_IMAGE_MB, MAX_POST_IMAGES } from "@/lib/constants";
import type { I18nKey } from "@/lib/i18n";

export interface ComposeGridItem {
  key: string;
  url: string;
  sizeKb: number | null;
}

export interface ComposeImagePayload {
  imageUrls: string[];
  imagePublicIds: string[];
}

export type ComposeImageError = "errImageTooLarge" | "errImageCompress" | "errTooManyImages";

interface SavedImage {
  url: string;
  publicId: string;
}

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
  sizeKb: number;
}

function newPendingId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const keySaved = (saved: SavedImage) => `saved:${saved.publicId || saved.url}`;
const keyPending = (pending: PendingImage) => `pending:${pending.id}`;

export function useComposeImages() {
  const [saved, setSaved] = useState<SavedImage[]>([]);
  const [pending, setPending] = useState<PendingImage[]>([]);

  const total = saved.length + pending.length;

  const items: ComposeGridItem[] = [
    ...saved.map((s) => ({ key: keySaved(s), url: s.url, sizeKb: null })),
    ...pending.map((p) => ({ key: keyPending(p), url: p.previewUrl, sizeKb: p.sizeKb })),
  ];

  /** Seed from an existing post (edit mode). Mismatched server lengths are dropped, not guessed. */
  const restore = useCallback((imageUrls: string[], imagePublicIds: string[]) => {
    const len = Math.min(imageUrls.length, imagePublicIds.length);
    setSaved(imageUrls.slice(0, len).map((url, i) => ({ url, publicId: imagePublicIds[i] })));
  }, []);

  const addFiles = useCallback(async (files: File[]): Promise<ComposeImageError | null> => {
    const room = MAX_POST_IMAGES - total;
    if (room <= 0) return "errTooManyImages";

    let error: ComposeImageError | null = null;
    const accepted = files.slice(0, room);
    if (accepted.length < files.length) error = "errTooManyImages";

    for (const file of accepted) {
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        error = "errImageTooLarge";
        continue;
      }
      try {
        // Untouched original when the server can decode it and it fits the body cap.
        const upload = await prepareUploadImage(file);
        setPending((prev) => [
          ...prev,
          {
            id: newPendingId(),
            file: upload,
            previewUrl: URL.createObjectURL(upload),
            sizeKb: Math.max(1, Math.round(upload.size / 1024)),
          },
        ]);
      } catch {
        error = "errImageCompress";
      }
    }
    return error;
  }, [total]);

  const remove = useCallback((key: string) => {
    if (key.startsWith("pending:")) {
      setPending((prev) => {
        const target = prev.find((p) => keyPending(p) === key);
        if (target) URL.revokeObjectURL(target.previewUrl);
        return prev.filter((p) => keyPending(p) !== key);
      });
      return;
    }
    setSaved((prev) => prev.filter((s) => keySaved(s) !== key));
  }, []);

  /** Uploads pending images concurrently and returns the combined, ordered payload for the API. */
  const publish = useCallback(async (t: (key: I18nKey) => string): Promise<ComposeImagePayload> => {
    const uploaded = await Promise.all(
      pending.map((item) => uploadImage(item.file, t)) // throws with a readable message
    );
    return {
      imageUrls: [...saved.map((s) => s.url), ...uploaded.map((u) => u.url)],
      imagePublicIds: [...saved.map((s) => s.publicId), ...uploaded.map((u) => u.publicId)],
    };
  }, [pending, saved]);

  /** Clears saved + pending and revokes previews. Call after a successful submit. */
  const reset = useCallback(() => {
    for (const item of pending) URL.revokeObjectURL(item.previewUrl);
    setPending([]);
    setSaved([]);
  }, [pending]);

  return { items, total, restore, addFiles, remove, publish, reset };
}
