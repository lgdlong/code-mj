import { handleApiError, jsonOk } from "@/server/http";
import { loadActivity } from "@/server/notifications";
import { requireSessionUser } from "@/server/session";

export async function GET() {
  try {
    const viewer = await requireSessionUser();
    const items = await loadActivity(viewer.id);
    return jsonOk({ items });
  } catch (err) {
    return handleApiError(err, "notifications:GET");
  }
}
