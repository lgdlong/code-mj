"use client";

import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import { AppShell } from "@/components/app-shell";
import { ComposeHeader } from "@/components/compose/compose-header";
import { ComposeImageGrid } from "@/components/compose/compose-image-grid";
import { ImageGlyph, VideoGlyph } from "@/components/icons";
import { UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import { useComposeImages } from "@/hooks/use-compose-images";
import type { FeedPage } from "@/hooks/use-feed-mutations";
import { authClient } from "@/lib/auth-client";
import { readApiError } from "@/lib/client-error";
import { MAX_POST_IMAGES, MAX_POST_LENGTH } from "@/lib/constants";
import { uploadVideo, VideoUploadError, type UploadedVideo } from "@/lib/video-upload";
import type { PostDTO } from "@/types/domain";

function ComposeInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const editIdParam = searchParams.get("edit");
  const editId = editIdParam?.trim() || null;
  const { t, lang, showToast } = useAppPreferences();
  const { data: session } = authClient.useSession();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState("");
  const { items, total, restore, addFiles, remove, publish, reset } = useComposeImages();
  const [video, setVideo] = useState<UploadedVideo | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    let active = true;
    (async () => {
      try {
        const r = await fetch(`/api/posts/${editId}`);
        if (!r.ok) {
          if (active) setError(await readApiError(r, lang, "errPostLoad"));
          return;
        }
        const json = (await r.json()) as { data?: PostDTO };
        if (!active || !json.data) return;
        setContent(json.data.content);
        restore(json.data.imageUrls, json.data.imagePublicIds ?? []);
        if (json.data.videoUrl && json.data.videoPublicKey) {
          setVideo({ url: json.data.videoUrl, key: json.data.videoPublicKey, sizeKb: 0 });
        }
      } catch {
        if (active) setError(t("errPostLoad"));
      }
    })();
    return () => {
      active = false;
    };
    // restore is stable; intentional single-run fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, lang, t]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    setError(null);
    if (files.length === 0) return;
    const failure = await addFiles(files);
    if (failure) setError(t(failure));
  }

  async function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setError(null);
    if (!file) return;
    setUploadingVideo(true);
    try {
      // shortcut: abandoning the composer orphans the R2 object (no cleanup job yet); add an owner-scoped delete when storage cost matters.
      setVideo(await uploadVideo(file));
    } catch (err) {
      const key = err instanceof VideoUploadError ? err.code : "errVideoUpload";
      setError(t(key));
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed && total === 0 && !video) {
      setError(t("errPostEmpty"));
      return;
    }
    if (trimmed.length > MAX_POST_LENGTH) {
      setError(t("errPostTooLong"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { imageUrls, imagePublicIds } = await publish(t);

      const endpoint = editId ? `/api/posts/${editId}` : "/api/posts";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          imageUrls,
          imagePublicIds,
          videoUrl: video?.url ?? null,
          videoPublicKey: video?.key ?? null,
        }),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, lang, "errPostSave"));
      }

      const json = (await res.json()) as { data?: PostDTO };
      const saved = json.data;
      if (saved) {
        queryClient.setQueryData<InfiniteData<FeedPage>>(["feed"], (prev) =>
          prev
            ? {
                ...prev,
                pages: prev.pages.map((page, i) =>
                  i === 0
                    ? {
                        ...page,
                        items: editId
                          ? page.items.map((p) => (p.id === saved.id ? saved : p))
                          : [saved, ...page.items],
                      }
                    : page
                ),
              }
            : prev
        );
      }

      reset();
      setVideo(null);
      showToast(editId ? t("updatedToast") : t("postedToast"));
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("errPostSave");
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell username="" showHeader={false} hideBottomNav>
      <ComposeHeader
        isEdit={Boolean(editId)}
        submitting={submitting}
        canSubmit={Boolean(content.trim() || total > 0 || video)}
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
      />

      <div style={{ padding: "16px", display: "flex", gap: 12 }}>
        <UserAvatar name={session?.user?.name ?? "F"} image={session?.user?.image ?? null} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            rows={2}
            maxLength={MAX_POST_LENGTH}
            placeholder={t("whatsNew")}
            style={{
              width: "100%",
              minHeight: 36,
              border: 0,
              outline: "none",
              background: "transparent",
              color: "var(--ink)",
              font: "inherit",
              fontSize: 15,
              resize: "none",
            }}
          />

          <ComposeImageGrid items={items} removeLabel={t("removeImage")} onRemove={remove} />

          {video && (
            <div style={{ position: "relative", marginTop: 10 }}>
              <video
                src={video.url}
                controls
                playsInline
                preload="metadata"
                style={{ width: "100%", maxHeight: 320, borderRadius: 12, display: "block", background: "#000" }}
              />
              <button
                type="button"
                onClick={() => setVideo(null)}
                aria-label={t("removeVideo")}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                }}
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={handleFileSelect}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime"
            hidden
            onChange={handleVideoSelect}
          />
          <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 4 }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t("addImage")}
              disabled={total >= MAX_POST_IMAGES}
              style={{ width: 32, height: 32, borderRadius: 999, display: "inline-grid", placeItems: "center", color: "var(--muted)", opacity: total >= MAX_POST_IMAGES ? 0.35 : 1, cursor: total >= MAX_POST_IMAGES ? "not-allowed" : "pointer" }}
            >
              <ImageGlyph />
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              aria-label={t("addVideo")}
              disabled={Boolean(video) || uploadingVideo}
              style={{ width: 32, height: 32, borderRadius: 999, display: "inline-grid", placeItems: "center", color: "var(--muted)", opacity: video || uploadingVideo ? 0.35 : 1, cursor: video || uploadingVideo ? "not-allowed" : "pointer" }}
            >
              <VideoGlyph />
            </button>
            {uploadingVideo && (
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{t("uploadingVideo")}</span>
            )}
          </div>

          {error && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>
      </div>
    </AppShell>
  );
}

export default function ComposePage() {
  return <Suspense><ComposeInner /></Suspense>;
}
