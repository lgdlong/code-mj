"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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
  const [theme, setTheme] = useState<Theme>("dark");
  const [lang, setLang] = useState<Lang>("vi");

  useEffect(() => {
    let active = true;
    document.documentElement.setAttribute("data-theme", "dark");
    fetch("/api/users/me/settings")
      .then(async (res) => {
        if (!active || !res.ok) return;
        const json = (await res.json()) as { data?: { theme?: Theme; lang?: Lang } };
        const dbTheme: Theme = json.data?.theme === "light" ? "light" : "dark";
        const dbLang: Lang = json.data?.lang === "en" ? "en" : "vi";
        setTheme(dbTheme);
        setLang(dbLang);
        document.documentElement.setAttribute("data-theme", dbTheme);
        localStorage.setItem(THEME_STORAGE_KEY, dbTheme);
        localStorage.setItem(LANG_STORAGE_KEY, dbLang);
      })
      .catch(() => {
        // Unauthenticated or offline: keep default dark + vi
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
      void fetch("/api/users/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      }).catch(() => {});
      return next;
    });
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "vi" ? "en" : "vi";
      localStorage.setItem(LANG_STORAGE_KEY, next);
      void fetch("/api/users/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: next }),
      }).catch(() => {});
      return next;
    });
  }, []);
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
