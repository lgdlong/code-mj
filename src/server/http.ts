import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";
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
