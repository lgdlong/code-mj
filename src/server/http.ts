import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";
import { MAX_POST_IMAGES } from "@/lib/constants";
import { videoUrl } from "@/server/media-storage";
import { ForbiddenError, UnauthorizedError } from "@/server/session";

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function jsonError(message: string, status = 400, code?: string): NextResponse {
  return NextResponse.json(code ? { error: message, code } : { error: message }, { status });
}

export function handleApiError(err: unknown, context: string): NextResponse {
  if (err instanceof UnauthorizedError) {
    return jsonError(err.message, 401);
  }
  if (err instanceof ForbiddenError) {
    return jsonError(err.message, 403);
  }
  console.error(`[API:${context}]`, err);
  return jsonError("Internal server error", 500);
}

export async function parseJsonBody<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
const POST_ID_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const POST_ID_LENGTH = 11;

export const generatePostId = customAlphabet(POST_ID_ALPHABET, POST_ID_LENGTH);

export function parsePostId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(trimmed)) return null;
  return trimmed;
}

export function parsePositiveInt(raw: string): number | null {
  const num = Number(raw);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

export function isSafeMediaUrl(url: string, allowGoogleAvatar = false): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.hostname === "res.cloudinary.com") return true;
    if (allowGoogleAvatar && parsed.hostname.endsWith(".googleusercontent.com")) return true;
    return false;
  } catch {
    return false;
  }
}

export interface PostImages {
  imageUrls: string[];
  imagePublicIds: string[];
}

export type ParsedPostImages =
  | { ok: true; images: PostImages }
  | { ok: false; code: "errInvalidMediaUrl" | "errTooManyImages" };

/** Paired URL/publicId arrays; both must match in length and stay within MAX_POST_IMAGES. */
export function parsePostImages(body: {
  imageUrls?: unknown;
  imagePublicIds?: unknown;
}): ParsedPostImages {
  const urls = body.imageUrls ?? [];
  const ids = body.imagePublicIds ?? [];
  if (!Array.isArray(urls) || !Array.isArray(ids)) {
    return { ok: false, code: "errInvalidMediaUrl" };
  }
  if (urls.length > MAX_POST_IMAGES || ids.length > MAX_POST_IMAGES) {
    return { ok: false, code: "errTooManyImages" };
  }
  if (urls.length !== ids.length) {
    return { ok: false, code: "errInvalidMediaUrl" };
  }

  const imageUrls: string[] = [];
  const imagePublicIds: string[] = [];
  for (let i = 0; i < urls.length; i += 1) {
    const rawUrl = urls[i];
    const rawId = ids[i];
    if (typeof rawUrl !== "string" || typeof rawId !== "string") {
      return { ok: false, code: "errInvalidMediaUrl" };
    }
    const url = rawUrl.trim();
    const publicId = rawId.trim();
    if (!url || !publicId || !isSafeMediaUrl(url)) {
      return { ok: false, code: "errInvalidMediaUrl" };
    }
    imageUrls.push(url);
    imagePublicIds.push(publicId);
  }
  return { ok: true, images: { imageUrls, imagePublicIds } };
}

export interface PostVideo {
  videoUrl: string;
  videoPublicKey: string;
}

export type ParsedPostVideo =
  | { ok: true; video: PostVideo | null }
  | { ok: false; code: "errVideoInvalid" };

/** URL must be exactly the public URL of the key, so the pair cannot be forged or mixed. */
export function parsePostVideo(body: {
  videoUrl?: unknown;
  videoPublicKey?: unknown;
}): ParsedPostVideo {
  const rawUrl = body.videoUrl ?? null;
  const rawKey = body.videoPublicKey ?? null;
  if (rawUrl === null && rawKey === null) return { ok: true, video: null };
  if (typeof rawUrl !== "string" || typeof rawKey !== "string") {
    return { ok: false, code: "errVideoInvalid" };
  }
  const key = rawKey.trim();
  const url = rawUrl.trim();
  if (!key || !url) return { ok: false, code: "errVideoInvalid" };
  try {
    if (videoUrl(key) !== url) return { ok: false, code: "errVideoInvalid" };
  } catch {
    return { ok: false, code: "errVideoInvalid" };
  }
  return { ok: true, video: { videoUrl: url, videoPublicKey: key } };
}

/**
 * Stable keyset cursor: rows are ordered by (createdAt, id), so a page boundary must
 * carry both — ordering by createdAt alone skips or repeats rows that share a timestamp.
 */
export interface PageCursor {
  at: Date;
  id: string;
}

export function parsePageCursor(raw: string | null): PageCursor | null {
  if (!raw) return null;
  const sep = raw.lastIndexOf("|");
  if (sep <= 0 || sep === raw.length - 1) return null;
  const at = new Date(raw.slice(0, sep));
  if (Number.isNaN(at.getTime())) return null;
  return { at, id: raw.slice(sep + 1) };
}

export function pageCursor(at: string | Date, id: string | number): string {
  const date = at instanceof Date ? at : new Date(at);
  return `${date.toISOString()}|${id}`;
}
