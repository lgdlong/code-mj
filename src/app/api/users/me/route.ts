import {
  MAX_BIO_LENGTH,
  MAX_NAME_LENGTH,
  MAX_USERNAME_LENGTH,
  USERNAME_CHANGE_COOLDOWN_DAYS,
} from "@/lib/constants";
import { handleApiError, jsonError, jsonOk, parseJsonBody } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

interface UpdateMeBody {
  name?: unknown;
  username?: unknown;
  bio?: unknown;
  image?: unknown;
}
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function PATCH(req: Request) {
  try {
    const user = await requireSessionUser();
    const body = await parseJsonBody<UpdateMeBody>(req);
    if (!body) return jsonError("Invalid JSON body", 400);

    const name = typeof body.name === "string" ? body.name.trim() : user.name;
    const bio = typeof body.bio === "string" ? body.bio.trim() : user.bio;
    const rawUsername =
      typeof body.username === "string" ? body.username.trim().toLowerCase() : user.username;
    if (!/^[a-z0-9._]+$/.test(rawUsername)) {
      return jsonError(
        "Username may only contain a-z, 0-9, dots, and underscores.",
        400,
        "errUsernameCharset"
      );
    }
    const username = rawUsername;

    if (!name || name.length > MAX_NAME_LENGTH) {
      return jsonError(`Display name must be 1-${MAX_NAME_LENGTH} characters.`, 400, "errNameRequired");
    }
    if (username.length < 3 || username.length > MAX_USERNAME_LENGTH) {
      return jsonError(`Username must be 3-${MAX_USERNAME_LENGTH} characters.`, 400, "errUsernameLength");
    }
    if (bio.length > MAX_BIO_LENGTH) {
      return jsonError(`Bio must be at most ${MAX_BIO_LENGTH} characters.`, 400, "errBioLength");
    }
    const isChangingUsername = username !== user.username;
    if (isChangingUsername) {
      const currentRecord = await prisma.user.findUnique({
        where: { id: user.id },
        select: { usernameChangedAt: true },
      });

      if (currentRecord?.usernameChangedAt) {
        const elapsedMs = Date.now() - currentRecord.usernameChangedAt.getTime();
        const cooldownMs = USERNAME_CHANGE_COOLDOWN_DAYS * MS_PER_DAY;
        if (elapsedMs < cooldownMs) {
          const daysLeft = Math.ceil((cooldownMs - elapsedMs) / MS_PER_DAY);
          return jsonError(
            `Bạn chỉ có thể đổi username mỗi ${USERNAME_CHANGE_COOLDOWN_DAYS} ngày 1 lần (còn ${daysLeft} ngày).`,
            429
          );
        }
      }

      const taken = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      if (taken && taken.id !== user.id) {
        return jsonError("Username is already taken", 409, "errUsernameTaken");
      }
    }

    const nextImage =
      typeof body.image === "string" && body.image.trim()
        ? body.image.trim()
        : body.image === null
        ? null
        : undefined;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        username,
        bio,
        ...(nextImage !== undefined ? { image: nextImage } : {}),
        ...(isChangingUsername ? { usernameChangedAt: new Date() } : {}),
      },
      select: { id: true, name: true, username: true, bio: true, image: true },
    });

    return jsonOk(updated);
  } catch (err) {
    return handleApiError(err, "users/me:PATCH");
  }
}
