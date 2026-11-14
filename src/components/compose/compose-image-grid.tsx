"use client";

import { CheckCircle, X } from "@phosphor-icons/react";
import type { ComposeGridItem } from "@/hooks/use-compose-images";

interface ComposeImageGridProps {
  items: ComposeGridItem[];
  removeLabel: string;
  onRemove: (key: string) => void;
}

export function ComposeImageGrid({ items, removeLabel, onRemove }: ComposeImageGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="compose-image-grid" data-count={Math.min(items.length, 5)}>
      {items.map((item) => (
        <div key={item.key} className="compose-image-cell">
          <img src={item.url} alt="Preview" />
          <button
            type="button"
            onClick={() => onRemove(item.key)}
            aria-label={removeLabel}
            className="compose-image-remove"
          >
            <X size={16} weight="bold" />
          </button>
          {item.sizeKb !== null && (
            <span className="compose-image-size">
              <CheckCircle size={12} weight="fill" />
              {item.sizeKb} KB
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
