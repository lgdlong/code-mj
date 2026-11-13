import { I18N, type I18nKey, type Lang } from "@/lib/i18n";

export async function readApiError(
  res: Response,
  lang: Lang,
  fallbackKey: I18nKey
): Promise<string> {
  const dict = I18N[lang];
  try {
    const json = (await res.json()) as { error?: unknown; code?: unknown };
    if (typeof json.code === "string" && json.code in dict) {
      return dict[json.code as I18nKey];
    }
    if (typeof json.error === "string" && json.error.trim()) {
      return json.error.trim();
    }
  } catch {
    // Non-JSON response body; fall back to localized message
  }
  return `${dict[fallbackKey]} (HTTP ${res.status})`;
}
