import { handleApiError, jsonError, jsonOk, parseJsonBody } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

const DEFAULT_THEME = "dark" as const;
const DEFAULT_LANG = "vi" as const;

interface UpdateSettingsBody {
  theme?: unknown;
  lang?: unknown;
}

export async function GET() {
  try {
    const user = await requireSessionUser();
    const setting = await prisma.userSetting.findUnique({
      where: { userId: user.id },
      select: { theme: true, lang: true },
    });
    return jsonOk({
      theme: setting?.theme === "light" ? "light" : DEFAULT_THEME,
      lang: setting?.lang === "en" ? "en" : DEFAULT_LANG,
    });
  } catch (err) {
    return handleApiError(err, "users/me/settings:GET");
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireSessionUser();
    const body = await parseJsonBody<UpdateSettingsBody>(req);
    if (!body) return jsonError("Invalid JSON body", 400);

    const nextTheme =
      body.theme === undefined
        ? undefined
        : body.theme === "dark" || body.theme === "light"
        ? body.theme
        : null;
    if (nextTheme === null) return jsonError("Invalid theme", 400);

    const nextLang =
      body.lang === undefined
        ? undefined
        : body.lang === "vi" || body.lang === "en"
        ? body.lang
        : null;
    if (nextLang === null) return jsonError("Invalid lang", 400);

    const saved = await prisma.userSetting.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        theme: nextTheme ?? DEFAULT_THEME,
        lang: nextLang ?? DEFAULT_LANG,
      },
      update: {
        ...(nextTheme !== undefined ? { theme: nextTheme } : {}),
        ...(nextLang !== undefined ? { lang: nextLang } : {}),
      },
      select: { theme: true, lang: true },
    });

    return jsonOk({
      theme: saved.theme === "light" ? "light" : DEFAULT_THEME,
      lang: saved.lang === "en" ? "en" : DEFAULT_LANG,
    });
  } catch (err) {
    return handleApiError(err, "users/me/settings:PATCH");
  }
}
