import { handleApiError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

export async function POST() {
  try {
    const viewer = await requireSessionUser();
    const seenAt = new Date();
    await prisma.userSetting.upsert({
      where: { userId: viewer.id },
      create: { userId: viewer.id, notificationsSeenAt: seenAt },
      update: { notificationsSeenAt: seenAt },
    });
    return jsonOk({ seenAt: seenAt.toISOString() });
  } catch (err) {
    return handleApiError(err, "notifications/seen:POST");
  }
}
