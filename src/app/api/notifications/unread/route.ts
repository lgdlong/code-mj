import { handleApiError, jsonOk } from "@/server/http";
import { countUnread } from "@/server/notifications";
import { requireSessionUser } from "@/server/session";

export async function GET() {
  try {
    const viewer = await requireSessionUser();
    return jsonOk({ count: await countUnread(viewer.id) });
  } catch (err) {
    return handleApiError(err, "notifications/unread:GET");
  }
}
