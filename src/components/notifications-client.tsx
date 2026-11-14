"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { UserAvatar, formatRelativeTime } from "@/components/post-card";
import { useAppPreferences } from "@/components/providers";
import type { ActivityDTO, ActivityKind } from "@/types/domain";

const NOTIF_SUFFIX: Record<ActivityKind, "notifLike" | "notifComment" | "notifReply" | "notifFollow"> = {
  like: "notifLike",
  comment: "notifComment",
  reply: "notifReply",
  follow: "notifFollow",
};

interface NotificationsClientProps {
  username: string;
  initialItems: ActivityDTO[];
}

export function NotificationsClient({
  username,
  initialItems,
}: NotificationsClientProps) {
  const { t, lang } = useAppPreferences();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Clear the badge once the list is actually shown; the tinted rows stay visibly "new".
    void fetch("/api/notifications/seen", { method: "POST" })
      .then(() => queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] }))
      .catch(() => {
        // Badge clears on the next successful poll instead.
      });
  }, [queryClient]);

  return (
    <AppShell username={username}>
      <div className="notif-head">{t("notifications")}</div>

      {initialItems.length === 0 ? (
        <div className="notif-empty">{t("notificationsEmpty")}</div>
      ) : (
        initialItems.map((item) => (
          <Link
            key={item.id}
            href={
              item.kind === "follow"
                ? `/u/${item.actor.username}`
                : `/post/${item.postId}`
            }
            className={`notif-row ${item.read ? "" : "unread"}`}
          >
            <UserAvatar name={item.actor.name} image={item.actor.image} size={36} />
            <div className="notif-body">
              <div className="notif-text">
                <strong>{item.actor.username}</strong> {t(NOTIF_SUFFIX[item.kind])}
              </div>
              {item.preview ? (
                <div className="notif-preview">{item.preview}</div>
              ) : item.hasImage ? (
                <div className="notif-preview">{t("notifImagePost")}</div>
              ) : null}
              <div className="notif-time">
                {formatRelativeTime(item.createdAt, lang)}
              </div>
            </div>
          </Link>
        ))
      )}
    </AppShell>
  );
}
