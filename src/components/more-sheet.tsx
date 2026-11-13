"use client";

import { Flag, PencilSimple, Trash } from "@phosphor-icons/react";
import { useAppPreferences } from "@/components/providers";

export interface MoreSheetTarget {
  kind: "post" | "comment";
  postId: string;
  commentId?: number;
  canEdit: boolean;
  canDelete: boolean;
}

interface MoreSheetProps {
  target: MoreSheetTarget | null;
  onClose: () => void;
  onEdit?: (postId: string) => void;
  onDelete: (target: MoreSheetTarget) => void;
  onReport: (target: MoreSheetTarget) => void;
}

export function MoreSheet({
  target,
  onClose,
  onEdit,
  onDelete,
  onReport,
}: MoreSheetProps) {
  const { t } = useAppPreferences();
  if (!target) return null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        {target.canEdit && onEdit && (
          <button
            type="button"
            className="sheet-item"
            onClick={() => {
              onClose();
              onEdit(target.postId);
            }}
          >
            <span>{t("editPost")}</span>
            <PencilSimple size={19} />
          </button>
        )}

        {target.canDelete && (
          <button
            type="button"
            className="sheet-item danger"
            onClick={() => {
              onClose();
              onDelete(target);
            }}
          >
            <span>
              {target.kind === "post" ? t("deletePost") : t("deleteComment")}
            </span>
            <Trash size={19} />
          </button>
        )}

        {!target.canDelete && (
          <button
            type="button"
            className="sheet-item danger"
            onClick={() => {
              onClose();
              onReport(target);
            }}
          >
            <span>
              {target.kind === "post" ? t("reportPost") : t("reportComment")}
            </span>
            <Flag size={19} />
          </button>
        )}

        <button
          type="button"
          className="sheet-item"
          onClick={onClose}
          style={{
            color: "var(--muted)",
            justifyContent: "center",
            marginTop: 4,
          }}
        >
          <span>{t("close")}</span>
        </button>
      </div>
    </div>
  );
}
