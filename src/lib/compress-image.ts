import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 0.28; // Keep under 300KB to preserve Cloudinary 25-credit free tier
const MAX_WIDTH_OR_HEIGHT = 1200;

export async function compressPostImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
    fileType: "image/webp",
    useWebWorker: true,
  });
}
