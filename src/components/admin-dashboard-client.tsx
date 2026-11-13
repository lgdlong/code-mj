"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Article, ChartBar, ChatCircle, Desktop, Flag, Globe, MagnifyingGlass, Moon, Sun, Users } from "@phosphor-icons/react";
import { AdminOverviewTab } from "@/components/admin/admin-overview-tab";
import type { AdminCommentRow, AdminPostRow, AdminTab, AdminUserRow, PendingAdminConfirm } from "@/components/admin/admin-types";
import { useAppPreferences } from "@/components/providers";

const AdminConfirmDialog = dynamic(() => import("@/components/admin/admin-confirm-dialog").then((m) => m.AdminConfirmDialog), { ssr: false });
const AdminPostsTab = dynamic(() => import("@/components/admin/admin-content-tabs").then((m) => m.AdminPostsTab), { ssr: false });
const AdminCommentsTab = dynamic(() => import("@/components/admin/admin-content-tabs").then((m) => m.AdminCommentsTab), { ssr: false });
const AdminReportsTab = dynamic(() => import("@/components/admin/admin-moderation-tabs").then((m) => m.AdminReportsTab), { ssr: false });
const AdminUsersTab = dynamic(() => import("@/components/admin/admin-moderation-tabs").then((m) => m.AdminUsersTab), { ssr: false });
import { readApiError } from "@/lib/client-error";
import type { AdminStatsDTO, ReportDTO } from "@/types/domain";

export function AdminDashboardClient() {
  const { theme, lang, t, toggleTheme, toggleLang, showToast } = useAppPreferences();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [query, setQuery] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<PendingAdminConfirm | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [sRes, pRes, cRes, rRes, uRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/posts"),
        fetch("/api/admin/comments"),
        fetch("/api/admin/reports"),
        fetch("/api/admin/users"),
      ]);
      const [sJson, pJson, cJson, rJson, uJson] = (await Promise.all([
        sRes.ok ? sRes.json() : { data: null },
        pRes.ok ? pRes.json() : { data: [] },
        cRes.ok ? cRes.json() : { data: [] },
        rRes.ok ? rRes.json() : { data: [] },
        uRes.ok ? uRes.json() : { data: [] },
      ])) as [{ data: AdminStatsDTO | null }, { data: AdminPostRow[] }, { data: AdminCommentRow[] }, { data: ReportDTO[] }, { data: AdminUserRow[] }];
      return { stats: sJson.data, posts: pJson.data, comments: cJson.data, reports: rJson.data, users: uJson.data };
    },
  });

  async function executeConfirmedAction() {
    if (!pendingConfirm || actionLoading) return;
    setActionLoading(true);
    try {
      const res =
        pendingConfirm.type === "deletePost"
          ? await fetch(`/api/posts/${pendingConfirm.id}`, { method: "DELETE" })
          : pendingConfirm.type === "deleteComment"
          ? await fetch(`/api/comments/${pendingConfirm.id}`, { method: "DELETE" })
          : pendingConfirm.type === "toggleBan"
          ? await fetch(`/api/admin/users/${pendingConfirm.id}/ban`, { method: "POST" })
          : await fetch(`/api/admin/reports/${pendingConfirm.reportId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: pendingConfirm.action }),
            });
      if (!res.ok) {
        showToast(await readApiError(res, lang, "errAdminAction"), "error");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      setPendingConfirm(null);
    } catch {
      showToast(t("errNetwork"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function dismissReport(reportId: number) {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      if (!res.ok) {
        showToast(await readApiError(res, lang, "errAdminAction"), "error");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch {
      showToast(t("errNetwork"), "error");
    } finally {
      setActionLoading(false);
    }
  }

  const q = query.trim().toLowerCase();
  const reports = data?.reports ?? [];
  const pendingReportsCount = reports.filter((r) => r.status === "pending").length;
  const navItems = [
    ["overview", lang === "vi" ? "Tổng quan" : "Overview", ChartBar],
    ["posts", lang === "vi" ? "Quản lý bài viết" : "Posts", Article],
    ["comments", lang === "vi" ? "Quản lý bình luận" : "Comments", ChatCircle],
    ["reports", lang === "vi" ? "Quản lý báo cáo" : "Reports", Flag],
    ["users", lang === "vi" ? "Quản lý người dùng" : "Users", Users],
  ] as const;

  return (
    <>
      <div className="lg:hidden min-h-dvh flex flex-col items-center justify-center text-center p-6 gap-3">
        <Desktop size={48} />
        <h2 className="text-lg font-bold">{lang === "vi" ? "Chỉ hỗ trợ trên máy tính" : "Desktop Only"}</h2>
        <p className="text-sm max-w-[320px]" style={{ color: "var(--muted)" }}>
          {lang === "vi" ? "Trang quản trị marjames chỉ hiển thị ở độ rộng màn hình ≥ 1024px." : "marjames Admin Dashboard requires screen width ≥ 1024px."}
        </p>
        <Link href="/" className="px-4 py-2 rounded-lg text-sm font-semibold mt-2" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
          {lang === "vi" ? "Về trang chủ" : "Back to App"}
        </Link>
      </div>

      <div className="hidden lg:grid min-h-dvh grid-cols-[240px_1fr]">
        <aside className="sticky top-0 h-dvh flex flex-col p-4" style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5 px-2.5 py-2 pb-5">
            <img src="/logo.png" alt="" width={36} height={36} style={{ objectFit: "contain", display: "block" }} />
            <span className="text-xl font-extrabold tracking-tight">marjames</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full">Admin</span>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left"
                style={{ background: tab === key ? "var(--surface-alt)" : "transparent", color: tab === key ? "var(--ink)" : "var(--muted)" }}
              >
                <Icon size={18} />
                <span>{label}</span>
                {key === "reports" && pendingReportsCount > 0 && (
                  <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--red-soft)", color: "var(--red)" }}>
                    {pendingReportsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold" style={{ color: "var(--muted)" }}>
              <ArrowLeft size={18} />
              <span>{lang === "vi" ? "Về trang chủ" : "Back to App"}</span>
            </Link>
          </div>
        </aside>

        <div className="flex flex-col min-w-0">
          <header className="h-14 px-6 flex items-center justify-between gap-4 sticky top-0 z-10" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-80" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
              <MagnifyingGlass size={16} color="var(--muted)" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "vi" ? "Tìm theo @username hoặc nội dung..." : "Search @username or content..."}
                className="flex-1 bg-transparent border-0 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleTheme} className="h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                <span>{theme === "dark" ? "Light" : "Dark"}</span>
              </button>
              <button type="button" onClick={toggleLang} className="h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                <Globe size={15} />
                <span>{lang.toUpperCase()}</span>
              </button>
            </div>
          </header>

          <main className="p-6 max-w-[1200px] w-full">
            {tab === "overview" && data?.stats && <AdminOverviewTab stats={data.stats} lang={lang} />}
            {tab === "posts" && <AdminPostsTab posts={data?.posts ?? []} query={q} onDeletePost={(id) => setPendingConfirm({ type: "deletePost", id })} />}
            {tab === "comments" && <AdminCommentsTab comments={data?.comments ?? []} query={q} onDeleteComment={(id) => setPendingConfirm({ type: "deleteComment", id })} />}
            {tab === "reports" && <AdminReportsTab reports={reports} query={q} onResolve={(reportId, action) => setPendingConfirm({ type: "resolveReport", reportId, action })} onDismiss={dismissReport} />}
            {tab === "users" && <AdminUsersTab users={data?.users ?? []} query={q} onToggleBan={(id, currentlyBanned) => setPendingConfirm({ type: "toggleBan", id, currentlyBanned })} />}
          </main>
        </div>
      </div>

      <AdminConfirmDialog pending={pendingConfirm} loading={actionLoading} onConfirm={executeConfirmedAction} onCancel={() => setPendingConfirm(null)} />
    </>
  );
}
