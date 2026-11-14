"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  CaretRight,
  Equals,
  HouseSimple,
  MagnifyingGlass,
  Plus,
  User,
} from "@phosphor-icons/react";
import { useAppPreferences } from "@/components/providers";
import { useUnreadCount } from "@/hooks/use-notifications";
import { authClient } from "@/lib/auth-client";

interface AppShellProps {
  username: string;
  showHeader?: boolean;
  hideBottomNav?: boolean;
  headerTabs?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  username,
  showHeader = true,
  hideBottomNav = false,
  headerTabs,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, lang, toggleTheme, toggleLang, t } = useAppPreferences();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();

  const isHome = pathname === "/";
  const isProfile = pathname === `/u/${username}`;

  async function handleLogout() {
    setMenuOpen(false);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <main className="main-column">
        {showHeader && (
          <header className="top-header">
            <div className="header-bar">
              <Link
                href="/"
                className="brand-mark"
                style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
              >
                <img
                  src="/logo.png"
                  alt=""
                  width={38}
                  height={38}
                  style={{ objectFit: "contain", display: "block" }}
                />
                <span className="brand-wordmark">marjames</span>
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Link
                  href="/search"
                  className="header-icon-btn"
                  aria-label="Search"
                >
                  <MagnifyingGlass size={22} weight="bold" />
                </Link>
                <Link
                  href="/notifications"
                  className="header-icon-btn"
                  aria-label={t("notifications")}
                  style={{ position: "relative" }}
                >
                  <Bell size={22} weight="bold" />
                  {unreadCount > 0 && (
                    <span className="header-badge">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
            {headerTabs}
          </header>
        )}
        {children}
      </main>

      {!hideBottomNav && (
        <nav className="bottom-nav" aria-label="Primary">
          <Link
            href="/"
            className={`nav-item ${isHome ? "active" : ""}`}
            aria-label="Home"
          >
            <HouseSimple size={24} weight={isHome ? "fill" : "regular"} />
          </Link>
          <Link
            href="/compose"
            className={`nav-item ${pathname === "/compose" ? "active" : ""}`}
            aria-label="Create"
          >
            <span className="nav-create-box">
              <Plus size={16} weight="bold" />
            </span>
          </Link>
          <Link
            href={`/u/${username}`}
            className={`nav-item ${isProfile ? "active" : ""}`}
            aria-label="Profile"
          >
            <User size={24} weight={isProfile ? "fill" : "regular"} />
          </Link>
          <button
            type="button"
            className={`nav-item ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Menu"
          >
            <Equals size={24} weight="bold" />
          </button>
        </nav>
      )}

      {menuOpen && (
        <>
          <div
            className="dropdown-backdrop"
            onClick={() => setMenuOpen(false)}
          />
          <div className="header-dropdown">
            <button
              type="button"
              className="dropdown-item"
              onClick={toggleTheme}
            >
              <span>{t("menuAppearance")}</span>
              <span className="dropdown-meta">
                {theme === "dark" ? t("menuThemeDark") : t("menuThemeLight")}
                <CaretRight size={14} />
              </span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={toggleLang}
            >
              <span>{t("menuLanguage")}</span>
              <span className="dropdown-meta">
                {lang === "vi" ? "Tiếng Việt" : "English"}
                <CaretRight size={14} />
              </span>
            </button>
            <div className="dropdown-divider" />
            <button
              type="button"
              className="dropdown-item danger"
              onClick={handleLogout}
            >
              <span>{t("menuLogout")}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
