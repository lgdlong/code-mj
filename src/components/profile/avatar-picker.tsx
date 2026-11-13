"use client";

import { useRef, useState } from "react";
import { UserAvatar } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";

interface AvatarPickerProps {
  name: string;
  image: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function AvatarPicker({
  name,
  image,
  onFileChange,
  onRemove,
}: AvatarPickerProps) {
  const { lang } = useAppPreferences();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={onFileChange}
      />
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          title={lang === "vi" ? "Đổi ảnh đại diện" : "Change avatar"}
          style={{ display: "block", borderRadius: "50%" }}
        >
          <UserAvatar name={name || "F"} image={image} size={54} />
        </button>

        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 40 }}
            />
            <div
              role="menu"
              className="popover-menu"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 220,
                zIndex: 50,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 6,
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.36)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  fileRef.current?.click();
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 11,
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                {lang === "vi" ? "Tải ảnh lên" : "Upload photo"}
              </button>
              <div style={{ height: 1, background: "var(--border)", margin: "2px 8px" }} />
              <button
                type="button"
                role="menuitem"
                disabled={!image}
                onClick={() => {
                  onRemove();
                  if (fileRef.current) fileRef.current.value = "";
                  setMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 11,
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "var(--red)",
                  opacity: image ? 1 : 0.4,
                  cursor: image ? "pointer" : "default",
                }}
              >
                {lang === "vi" ? "Gỡ ảnh hiện tại" : "Remove current photo"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
