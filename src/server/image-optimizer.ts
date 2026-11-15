import sharp from "sharp";
import {
  COMPRESS_IMAGE_DIMENSION,
  MAX_STORED_IMAGE_BYTES,
  SERVER_IMAGE_QUALITY,
} from "@/lib/constants";

async function encodeWebp(input: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(input)
      .rotate()
      .resize({
        width: COMPRESS_IMAGE_DIMENSION,
        height: COMPRESS_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: SERVER_IMAGE_QUALITY })
      .toBuffer();
  } catch (err) {
    console.error("[sharp:compress]", err);
    return null;
  }
}

/**
 * Server pass: at most one lossy generation, done by sharp.
 * Decoding doubles as validation — file.type is client-controlled and often empty.
 * Bytes are returned untouched when the image already fits the display and storage ceilings.
 */
export async function optimizeImage(input: Buffer): Promise<Buffer | null> {
  let width = 0;
  let height = 0;
  try {
    const meta = await sharp(input).metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;
  } catch (err) {
    console.error("[sharp:decode]", err instanceof Error ? err.message : err);
    return null;
  }

  if (
    Math.max(width, height) <= COMPRESS_IMAGE_DIMENSION &&
    input.length <= MAX_STORED_IMAGE_BYTES
  ) {
    return input;
  }

  const encoded = await encodeWebp(input);
  return encoded && encoded.length < input.length ? encoded : input;
}
