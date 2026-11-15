import imageCompression from "browser-image-compression";
import { CLIENT_IMAGE_QUALITY, COMPRESS_IMAGE_DIMENSION, MAX_UPLOAD_BYTES } from "@/lib/constants";

/** Containers the server's prebuilt sharp is guaranteed to decode (no HEIC/HEVC codec in those binaries). */
const PASSTHROUGH_TYPES: Record<string, true> = {
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
};

/**
 * Browser pass for originals above the request-body cap, or in a container the server may not
 * decode. No `maxSizeMB`: the quality loop it runs is what members saw as broken images.
 */
async function compressPostImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: COMPRESS_IMAGE_DIMENSION,
    initialQuality: CLIENT_IMAGE_QUALITY,
    fileType: "image/webp",
    useWebWorker: true,
  });
}

/**
 * Uploads the original untouched only when sharp is guaranteed to decode it and it fits the body
 * cap — that keeps the server pass the single lossy generation. Everything else is re-encoded
 * here (canvas handles containers sharp lacks, e.g. HEIC on iOS, and shrinks oversize files).
 */
export async function prepareUploadImage(file: File): Promise<File> {
  return PASSTHROUGH_TYPES[file.type] && file.size <= MAX_UPLOAD_BYTES
    ? file
    : compressPostImage(file);
}
