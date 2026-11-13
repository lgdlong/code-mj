import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { getServerUser } from "@/server/session";
export default async function AdminPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  return <AdminDashboardClient />;
}
