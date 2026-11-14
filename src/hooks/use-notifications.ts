"use client";

import { useQuery } from "@tanstack/react-query";
import { UNREAD_POLL_MS } from "@/lib/constants";

async function fetchUnreadCount(): Promise<number> {
  const res = await fetch("/api/notifications/unread");
  if (!res.ok) return 0;
  const json = (await res.json()) as { data?: { count?: number } };
  return json.data?.count ?? 0;
}

/** Badge polling; TanStack stops the interval while the tab is hidden. */
export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: fetchUnreadCount,
    refetchInterval: UNREAD_POLL_MS,
  });
}
