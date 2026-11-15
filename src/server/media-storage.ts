import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MAX_VIDEO_BYTES, MOV_MIME, VIDEO_MIME } from "@/lib/constants";

/**
 * Videos live in R2 because Cloudinary's free tier bills video bandwidth;
 * images stay on Cloudinary. Keys are `vid/<userId>/<uuid>.mp4|.mov`.
 */
const VIDEO_PREFIX = "vid/";
const EXT_BY_TYPE: Record<string, string> = {
  [VIDEO_MIME]: "mp4",
  [MOV_MIME]: "mov",
};
const UPLOAD_URL_TTL_SECONDS = 600;
/**
 * One day, not immutable: a deleted video must stop playing even when purge
 * credentials are absent, and no purge call is made on delete today.
 */
const CACHE_CONTROL = "public, max-age=86400";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

let client: S3Client | null = null;

function s3(): S3Client {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

export function videoUrl(key: string): string {
  return `${env("R2_PUBLIC_BASE_URL").replace(/\/$/, "")}/${key}`;
}

export interface PresignedVideo {
  uploadUrl: string;
  key: string;
  url: string;
}

/** The browser PUTs the file straight to R2: Vercel's 4.5 MB body cap rules out a proxy. */
export async function presignVideoUpload(userId: string, contentType: string): Promise<PresignedVideo> {
  const ext = EXT_BY_TYPE[contentType];
  if (!ext) throw new Error(`Unsupported video type: ${contentType}`);
  const key = `${VIDEO_PREFIX}${userId}/${crypto.randomUUID()}.${ext}`;
  const uploadUrl = await getSignedUrl(
    s3(),
    new PutObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: key,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL,
    }),
    { expiresIn: UPLOAD_URL_TTL_SECONDS }
  );
  return { uploadUrl, key, url: videoUrl(key) };
}

/** Trusts the key only when it sits under the caller's own prefix. */
export function ownsVideoKey(key: string, userId: string): boolean {
  return key.startsWith(`${VIDEO_PREFIX}${userId}/`) && /\.(mp4|mov)$/.test(key);
}

/**
 * Confirms the object actually landed and obeys the limits; the presigned PUT
 * cannot pin a size, so the check happens here instead of trusting the client.
 */
export async function verifyVideoObject(key: string, userId: string): Promise<boolean> {
  if (!ownsVideoKey(key, userId)) return false;
  try {
    const head = await s3().send(
      new HeadObjectCommand({ Bucket: env("R2_BUCKET"), Key: key })
    );
    const size = head.ContentLength ?? 0;
    return (
      size > 0 &&
      size <= MAX_VIDEO_BYTES &&
      head.ContentType !== undefined &&
      head.ContentType in EXT_BY_TYPE
    );
  } catch (err) {
    console.error("[R2:head]", { key, err });
    return false;
  }
}

export async function deleteVideoObject(key: string | null | undefined): Promise<void> {
  if (!key || !key.startsWith(VIDEO_PREFIX)) return;
  try {
    await s3().send(new DeleteObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
  } catch (err) {
    console.error("[R2:delete]", { key, err });
  }
}
