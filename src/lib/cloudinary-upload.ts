import type { I18nKey } from "@/lib/i18n";

interface UploadResponse {
  data?: { url: string; publicId: string };
}

/**
 * Uploads through our server proxy (/api/upload), which runs the sharp
 * compression pass before storing the bytes in Cloudinary.
 */
export async function uploadImage(
  file: File,
  t: (key: I18nKey) => string
): Promise<{ url: string; publicId: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const json = (await res.json().catch(() => ({}))) as UploadResponse;
  if (!res.ok || !json.data) {
    if (res.status === 413) throw new Error(t("errImageTooLarge"));
    if (res.status === 415) throw new Error(t("errImageCompress"));
    throw new Error(t("errUploadCloud"));
  }
  return json.data;
}
