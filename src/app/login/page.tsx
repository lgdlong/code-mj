"use client";

import { useState } from "react";
import { GoogleLogo } from "@phosphor-icons/react";
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
          <span>marjames</span>
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
          <GoogleLogo size={20} weight="bold" />
          <span>{loading ? "..." : t("googleBtn")}</span>
        </button>
      </div>
    </main>
  );
}
