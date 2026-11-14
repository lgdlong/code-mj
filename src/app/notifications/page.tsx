import { redirect } from "next/navigation";
import { NotificationsClient } from "@/components/notifications-client";
import { loadActivity } from "@/server/notifications";
import { getServerUser } from "@/server/session";

export default async function NotificationsPage() {
  const viewer = await getServerUser();
  if (!viewer) redirect("/login");

  const items = await loadActivity(viewer.id);

  return (
    <NotificationsClient username={viewer.username} initialItems={items} />
  );
}
