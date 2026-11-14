"use client";

import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ComposeHeader } from "@/components/compose/compose-header";
import { ComposeImageGrid } from "@/components/compose/compose-image-grid";
import { UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import { useComposeImages } from "@/hooks/use-compose-images";
import type { FeedPage } from "@/hooks/use-feed-mutations";
import { authClient } from "@/lib/auth-client";
import { readApiError } from "@/lib/client-error";
import { MAX_POST_IMAGES, MAX_POST_LENGTH } from "@/lib/constants";
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
  const [content, setContent] = useState("");
  const { items, total, restore, addFiles, remove, publish, cleanup } = useComposeImages();
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

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed && total === 0) {
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
        body: JSON.stringify({ content: trimmed, imageUrls, imagePublicIds }),
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

      cleanup();
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
        canSubmit={Boolean(content.trim() || total > 0)}
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t("addImage")}
            disabled={total >= MAX_POST_IMAGES}
            style={{ width: 32, height: 32, borderRadius: 8, display: "inline-grid", placeItems: "center", color: "var(--muted)", opacity: total >= MAX_POST_IMAGES ? 0.35 : 1, cursor: total >= MAX_POST_IMAGES ? "not-allowed" : "pointer" }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="5.5" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15.5l-4.2-4.2a2 2 0 0 0-2.8 0L6 19.3" />
            </svg>
          </button>

          {error && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>
      </div>
    </AppShell>
  );
}

export default function ComposePage() {
  return <Suspense><ComposeInner /></Suspense>;
}
