"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle, X } from "@phosphor-icons/react";
import { AppShell } from "@/components/app-shell";
import { UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import { authClient } from "@/lib/auth-client";
import { readApiError } from "@/lib/client-error";
import { compressPostImage } from "@/lib/compress-image";
import { MAX_IMAGE_MB, MAX_POST_LENGTH } from "@/lib/constants";
import type { PostDTO } from "@/types/domain";

interface SignedUploadResponse {
  data?: {
    signature: string;
    timestamp: number;
    folder: string;
    cloudName: string;
    apiKey: string;
  };
  error?: string;
}

function ComposeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdParam = searchParams.get("edit");
  const editId = editIdParam?.trim() || null;
  const { t, lang, showToast } = useAppPreferences();
  const { data: session } = authClient.useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedSizeKb, setCompressedSizeKb] = useState<number | null>(null);
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
        setImageUrl(json.data.imageUrl);
        setImagePublicId(json.data.imagePublicId);
        setPreviewUrl(json.data.imageUrl);
      } catch {
        if (active) setError(t("errPostLoad"));
      }
    })();
    return () => {
      active = false;
    };
  }, [editId, lang, t]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(t("errImageTooLarge"));
      return;
    }

    try {
      const compressed = await compressPostImage(file);
      setPendingFile(compressed);
      setCompressedSizeKb(Math.max(1, Math.round(compressed.size / 1024)));
      setPreviewUrl(URL.createObjectURL(compressed));
    } catch {
      setError(t("errImageCompress"));
    }
  }

  function removeImage() {
    setPendingFile(null);
    setPreviewUrl(null);
    setImageUrl(null);
    setImagePublicId(null);
    setCompressedSizeKb(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
    const sigRes = await fetch("/api/upload", { method: "POST" });
    const sigJson = (await sigRes.json()) as SignedUploadResponse;
    if (!sigRes.ok || !sigJson.data) {
      throw new Error(sigJson.error ?? t("errUploadSig"));
    }
    const { signature, timestamp, folder, cloudName, apiKey } = sigJson.data;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );
    const cloudJson = (await cloudRes.json()) as {
      secure_url?: string;
      public_id?: string;
      error?: { message?: string };
    };
    if (!cloudRes.ok || !cloudJson.secure_url || !cloudJson.public_id) {
      throw new Error(cloudJson.error?.message ?? t("errUploadCloud"));
    }
    return { url: cloudJson.secure_url, publicId: cloudJson.public_id };
  }

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed && !previewUrl) {
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
      let finalUrl = imageUrl;
      let finalPublicId = imagePublicId;
      if (pendingFile) {
        const uploaded = await uploadToCloudinary(pendingFile);
        finalUrl = uploaded.url;
        finalPublicId = uploaded.publicId;
      }

      const endpoint = editId ? `/api/posts/${editId}` : "/api/posts";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          imageUrl: finalUrl,
          imagePublicId: finalPublicId,
        }),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, lang, "errPostSave"));
      }

      showToast(editId ? t("updatedToast") : t("postedToast"));
      router.push("/");
      router.refresh();
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
      <div
        style={{
          height: 52,
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{ fontSize: 15, textAlign: "left" }}
        >
          {t("cancel")}
        </button>
        <strong style={{ fontSize: 15, textAlign: "center" }}>
          {editId ? t("editThread") : t("newThread")}
        </strong>
        <button
          type="button"
          className="btn-post-primary"
          style={{ justifySelf: "end", opacity: submitting ? 0.6 : 1 }}
          disabled={submitting || (!content.trim() && !previewUrl)}
          onClick={handleSubmit}
        >
          {editId ? t("saveBtn") : t("postBtn")}
        </button>
      </div>

      <div style={{ padding: "16px", display: "flex", gap: 12 }}>
        <UserAvatar
          name={session?.user?.name ?? "F"}
          image={session?.user?.image ?? null}
        />
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

          {previewUrl && (
            <div style={{ position: "relative", marginBottom: 10 }}>
              <div className="post-image-wrap">
                <img src={previewUrl} alt="Preview" />
              </div>
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove image"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "rgba(16,16,16,0.75)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={16} weight="bold" />
              </button>
              {compressedSizeKb !== null && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 6,
                  }}
                >
                  <CheckCircle size={14} weight="fill" />
                  <span>WebP: {compressedSizeKb} KB</span>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t("addImage")}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "inline-grid",
              placeItems: "center",
              color: "var(--muted)",
            }}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="5.5" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15.5l-4.2-4.2a2 2 0 0 0-2.8 0L6 19.3" />
            </svg>
          </button>

          {error && (
            <p style={{ color: "var(--red)", fontSize: 13, marginTop: 8 }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function ComposePage() {
  return (
    <Suspense>
      <ComposeInner />
    </Suspense>
  );
}
