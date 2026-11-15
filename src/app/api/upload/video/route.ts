import { VIDEO_MIME, VIDEO_MIMES } from "@/lib/constants";
import { handleApiError, jsonError, jsonOk, parseJsonBody } from "@/server/http";
import { presignVideoUpload } from "@/server/media-storage";
import { requireSessionUser } from "@/server/session";

export const runtime = "nodejs";

/** Hands the browser a short-lived signed PUT so the video never passes through Vercel. */
export async function POST(req: Request) {
  try {
    const user = await requireSessionUser();
    const body = await parseJsonBody<{ contentType?: unknown }>(req);
    const contentType =
      typeof body?.contentType === "string" ? body.contentType : VIDEO_MIME;
    if (!VIDEO_MIMES.includes(contentType)) {
      return jsonError("Unsupported video type", 415, "errVideoType");
    }
    const payload = await presignVideoUpload(user.id, contentType);
    return jsonOk(payload);
  } catch (err) {
    return handleApiError(err, "upload/video:POST");
  }
}
