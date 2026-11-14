"use client";

import { useState } from "react";
import { PostImageLightbox } from "@/components/post-image-lightbox";

interface MediaGridProps {
  urls: string[];
  alt: string;
  /** Stop the click from bubbling (post cards navigate on container click). */
  stopPropagation?: boolean;
  className?: string;
}

/** Reusable image grid + lightbox. Styling comes from `.post-image-grid[data-count]`. */
export function MediaGrid({ urls, alt, stopPropagation = false, className }: MediaGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (urls.length === 0) return null;

  return (
    <>
      <div
        className={className ? `post-image-grid ${className}` : "post-image-grid"}
        data-count={Math.min(urls.length, 5)}
        style={{ cursor: "zoom-in" }}
      >
        {urls.slice(0, 5).map((url, i) => (
          <img
            key={url}
            src={url}
            alt={alt}
            loading="lazy"
            onClick={(e) => {
              if (stopPropagation) e.stopPropagation();
              setLightboxIndex(i);
            }}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <PostImageLightbox
          urls={urls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
