import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_FOLDER = "cortis-fandom";

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  configured = true;
}

export interface UploadSignaturePayload {
  signature: string;
  timestamp: number;
  folder: string;
  cloudName: string;
  apiKey: string;
}

export function createUploadSignature(): UploadSignaturePayload {
  ensureConfigured();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: CLOUDINARY_FOLDER },
    apiSecret
  );

  return {
    signature,
    timestamp,
    folder: CLOUDINARY_FOLDER,
    cloudName,
    apiKey,
  };
}

export async function destroyCloudinaryAsset(publicId: string | null | undefined): Promise<void> {
  if (!publicId) return;
  try {
    ensureConfigured();
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("[Cloudinary:destroy]", { publicId, err });
  }
}
