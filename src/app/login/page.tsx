"use client";

import { useState } from "react";
import { useAppPreferences } from "@/components/providers";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const { t } = useAppPreferences();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (res?.error) {
        setError(res.error.message ?? "Login failed");
        setLoading(false);
      }
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        background: "var(--bg)",
        color: "var(--ink)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          <img
            src="/logo.png"
            alt=""
            width={56}
            height={56}
            style={{ objectFit: "contain", display: "block" }}
          />
          <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span>marjames</span>
            <a
              href="https://www.threads.com/@thienthansangaa_"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: 0,
                lineHeight: 1.2,
                color: "var(--muted)",
                textDecoration: "none",
              }}
            >
              @thienthansangaa_
            </a>
          </span>
        </div>

        {error && (
          <div
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              background: "var(--red-soft)",
              color: "var(--red)",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            minHeight: 50,
            borderRadius: 14,
            background: "var(--btn-primary-bg)",
            color: "var(--btn-primary-ink)",
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/>
          </svg>
          <span>{loading ? "..." : t("googleBtn")}</span>
        </button>
      </div>
    </main>
  );
}
