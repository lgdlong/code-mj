"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { Toaster, toast } from "sonner";
import { I18N, type I18nKey, type Lang } from "@/lib/i18n";

type Theme = "dark" | "light";
type ToastType = "success" | "error" | "info";

interface AppPreferencesContextValue {
  theme: Theme;
  lang: Lang;
  toggleTheme: () => void;
  toggleLang: () => void;
  t: (key: I18nKey) => string;
  showToast: (message: string, type?: ToastType) => void;
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

const THEME_STORAGE_KEY = "marjames_theme";
const LANG_STORAGE_KEY = "marjames_lang";
const QUERY_STALE_TIME_MS = 30_000;
const QUERY_GC_TIME_MS = 5 * 60 * 1000;

// localStorage is the client source of truth for theme/lang, read through useSyncExternalStore
// so the first client render matches SSR (defaults) and stored values apply with no flash.
const preferenceListeners = new Set<() => void>();

function subscribePreferences(onChange: () => void): () => void {
  preferenceListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    preferenceListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writePreference(key: string, value: string): void {
  localStorage.setItem(key, value);
  for (const listener of preferenceListeners) listener();
}

const readStoredTheme = (): Theme =>
  localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
const readStoredLang = (): Lang =>
  localStorage.getItem(LANG_STORAGE_KEY) === "en" ? "en" : "vi";
const readServerTheme = (): Theme => "dark";
const readServerLang = (): Lang => "vi";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_STALE_TIME_MS,
            gcTime: QUERY_GC_TIME_MS,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const theme = useSyncExternalStore(subscribePreferences, readStoredTheme, readServerTheme);
  const lang = useSyncExternalStore(subscribePreferences, readStoredLang, readServerLang);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetch("/api/users/me/settings")
      .then(async (res) => {
        if (!active || !res.ok) return;
        const json = (await res.json()) as { data?: { theme?: Theme; lang?: Lang } };
        // DB wins over whatever was stored locally; writing the store re-renders.
        writePreference(THEME_STORAGE_KEY, json.data?.theme === "light" ? "light" : "dark");
        writePreference(LANG_STORAGE_KEY, json.data?.lang === "en" ? "en" : "vi");
      })
      .catch(() => {
        // Unauthenticated or offline: keep stored preference
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    writePreference(THEME_STORAGE_KEY, next);
    void fetch("/api/users/me/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  }, [theme]);

  const toggleLang = useCallback(() => {
    const next: Lang = lang === "vi" ? "en" : "vi";
    writePreference(LANG_STORAGE_KEY, next);
    void fetch("/api/users/me/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: next }),
    }).catch(() => {});
  }, [lang]);
  const t = useCallback(
    (key: I18nKey): string => I18N[lang][key],
    [lang]
  );

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    if (type === "error") {
      toast.error(message);
    } else if (type === "info") {
      toast.info(message);
    } else {
      toast.success(message);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppPreferencesContext.Provider
        value={{ theme, lang, toggleTheme, toggleLang, t, showToast }}
      >
        {children}
        <Toaster theme={theme} position="top-center" richColors closeButton />
      </AppPreferencesContext.Provider>
    </QueryClientProvider>
  );
}

export function useAppPreferences(): AppPreferencesContextValue {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) {
    throw new Error("useAppPreferences must be used inside Providers");
  }
  return ctx;
}
