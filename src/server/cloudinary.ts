import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const CLOUDINARY_FOLDER = "cortis-fandom";
const UPLOAD_TIMEOUT_MS = 30_000;

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: UPLOAD_TIMEOUT_MS,
  });
  configured = true;
}

export interface UploadedImage {
  url: string;
  publicId: string;
}

/** Uploads already-optimized bytes server-side, so the sharp pass runs before storage. */
export async function uploadImageBuffer(buffer: Buffer): Promise<UploadedImage> {
  ensureConfigured();
  const { promise, resolve, reject } = Promise.withResolvers<UploadApiResponse>();
  const stream = cloudinary.uploader.upload_stream(
    { folder: CLOUDINARY_FOLDER, resource_type: "image" },
    (err, res) => {
      if (err || !res) {
        reject(err ?? new Error("Cloudinary upload returned no result"));
        return;
      }
      resolve(res);
    }
  );
  stream.end(buffer);
  const result = await promise;

  return { url: result.secure_url, publicId: result.public_id };
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

export async function destroyCloudinaryAssets(publicIds: string[]): Promise<void> {
  await Promise.all(publicIds.map((id) => destroyCloudinaryAsset(id)));
}
