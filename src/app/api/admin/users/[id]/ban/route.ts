import { handleApiError, jsonError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireAdminUser } from "@/server/session";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    const { id } = await context.params;
    if (id === admin.id) {
      return jsonError("Cannot ban yourself", 400);
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, banned: true },
    });
    if (!target) return jsonError("User not found", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { banned: !target.banned },
      select: { id: true, banned: true },
    });

    return jsonOk(updated);
  } catch (err) {
    return handleApiError(err, "admin/users/[id]/ban:POST");
  }
}
