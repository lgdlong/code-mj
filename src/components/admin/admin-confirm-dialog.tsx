"use client";

import { ConfirmModal } from "@/components/confirm-modal";
import type { PendingAdminConfirm } from "@/components/admin/admin-types";
import { useAppPreferences } from "@/components/providers";

interface AdminConfirmDialogProps {
  pending: PendingAdminConfirm | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdminConfirmDialog({
  pending,
  loading,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const { t } = useAppPreferences();

  const title =
    pending?.type === "deletePost"
      ? t("confirmDeletePostTitle")
      : pending?.type === "deleteComment"
      ? t("confirmDeleteCommentTitle")
      : pending?.type === "toggleBan"
      ? pending.currentlyBanned
        ? t("adminConfirmUnbanTitle")
        : t("adminConfirmBanTitle")
      : pending?.action === "ban"
      ? t("adminConfirmResolveBanTitle")
      : t("adminConfirmResolveDeleteTitle");

  const message =
    pending?.type === "deletePost"
      ? t("confirmDeletePostMsg")
      : pending?.type === "deleteComment"
      ? t("confirmDeleteCommentMsg")
      : pending?.type === "toggleBan"
      ? pending.currentlyBanned
        ? t("adminConfirmUnbanMsg")
        : t("adminConfirmBanMsg")
      : pending?.action === "ban"
      ? t("adminConfirmResolveBanMsg")
      : t("adminConfirmResolveDeleteMsg");

  return (
    <ConfirmModal
      open={Boolean(pending)}
      title={title}
      message={message}
      confirmLabel={
        pending?.type === "deletePost" || pending?.type === "deleteComment"
          ? t("deleteBtn")
          : t("confirmLabel")
      }
      cancelLabel={t("cancel")}
      danger={pending?.type !== "toggleBan" || !pending.currentlyBanned}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
