import { createUploadSignature } from "@/server/cloudinary";
import { handleApiError, jsonOk } from "@/server/http";
import { requireSessionUser } from "@/server/session";

export async function POST() {
  try {
    await requireSessionUser();
    const payload = createUploadSignature();
    return jsonOk(payload);
  } catch (err) {
    return handleApiError(err, "upload:POST");
  }
}
