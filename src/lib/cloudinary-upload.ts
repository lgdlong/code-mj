import type { I18nKey } from "@/lib/i18n";

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

export async function uploadImageToCloudinary(
  file: File,
  t: (key: I18nKey) => string
): Promise<{ url: string; publicId: string }> {
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
