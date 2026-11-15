import { uploadImageBuffer } from "@/server/cloudinary";
import { optimizeImage } from "@/server/image-optimizer";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { handleApiError, jsonError, jsonOk } from "@/server/http";
import { requireSessionUser } from "@/server/session";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Proxy upload: one sharp encode server-side, then store the bytes in Cloudinary. */
export async function POST(req: Request) {
  try {
    await requireSessionUser();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("Missing image file", 400, "errImageCompress");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return jsonError("Image exceeds the upload limit", 413, "errImageTooLarge");
    }

    // MIME type is client-controlled; optimizeImage validates by decoding the bytes.
    const optimized = await optimizeImage(Buffer.from(await file.arrayBuffer()));
    if (!optimized) {
      return jsonError("Unsupported or corrupt image", 415, "errImageCompress");
    }

    const uploaded = await uploadImageBuffer(optimized);
    return jsonOk(uploaded);
  } catch (err) {
    return handleApiError(err, "upload:POST");
  }
}
