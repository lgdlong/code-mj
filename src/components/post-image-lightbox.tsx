"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";

interface PostImageLightboxProps {
  urls: string[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PostImageLightbox({ urls, index, onClose, onNavigate }: PostImageLightboxProps) {
  const count = urls.length;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && count > 1) onNavigate((index - 1 + count) % count);
      if (e.key === "ArrowRight" && count > 1) onNavigate((index + 1) % count);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, index, onClose, onNavigate]);

  if (typeof document === "undefined") return null;

  const navStyle = {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10000,
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(40, 40, 40, 0.85)",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
  } as const;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} / ${count}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 9999,
        background: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        margin: 0,
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{ ...navStyle, top: 16, left: 16, transform: "none" }}
      >
        <X size={18} weight="bold" />
      </button>

      {count > 1 && (
        <span
          style={{
            position: "fixed",
            top: 22,
            right: 20,
            zIndex: 10000,
            color: "#ffffff",
            fontSize: 13,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {index + 1}/{count}
        </span>
      )}

      <img
        src={urls[index]}
        alt="Post attachment fullscreen"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100vw", height: "100dvh", objectFit: "contain", display: "block" }}
      />

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index - 1 + count) % count);
            }}
            style={{ ...navStyle, left: 12 }}
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index + 1) % count);
            }}
            style={{ ...navStyle, right: 12 }}
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
