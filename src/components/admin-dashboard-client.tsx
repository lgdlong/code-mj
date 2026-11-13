"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowSquareOut,
  Article,
  ChartBar,
  ChatCircle,
  Desktop,
  Flag,
  Globe,
  Heart,
  Image as ImageIcon,
  MagnifyingGlass,
  Moon,
  Prohibit,
  Pulse,
  Sun,
  Trash,
  Users,
} from "@phosphor-icons/react";
import { ConfirmModal } from "@/components/confirm-modal";
import { useAppPreferences } from "@/components/providers";
import { readApiError } from "@/lib/client-error";
import type { AdminStatsDTO, ReportDTO } from "@/types/domain";
type AdminTab = "overview" | "posts" | "comments" | "reports" | "users";

interface AdminPostRow {
  id: string;
  username: string;
  content: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  createdAt: string;
}

interface AdminCommentRow {
  id: number;
  postId: string;
  postExcerpt: string;
  username: string;
  content: string;
  tier: 1 | 2;
  createdAt: string;
}

interface AdminUserRow {
  id: string;
  username: string;
  name: string;
  role: "user" | "admin";
  banned: boolean;
  postsCount: number;
}

type PendingConfirm =
  | { type: "deletePost"; id: string }
  | { type: "deleteComment"; id: number }
  | { type: "toggleBan"; id: string; currentlyBanned: boolean }
  | { type: "resolveReport"; reportId: number; action: "delete" | "ban" };

export function AdminDashboardClient() {
  const { theme, lang, t, toggleTheme, toggleLang, showToast } = useAppPreferences();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [query, setQuery] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
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
      ])) as [
        { data: AdminStatsDTO | null },
        { data: AdminPostRow[] },
        { data: AdminCommentRow[] },
        { data: ReportDTO[] },
        { data: AdminUserRow[] },
      ];
      return {
        stats: sJson.data,
        posts: pJson.data,
        comments: cJson.data,
        reports: rJson.data,
        users: uJson.data,
      };
    },
  });

  const stats = data?.stats ?? null;
  const posts = data?.posts ?? [];
  const comments = data?.comments ?? [];
  const reports = data?.reports ?? [];
  const users = data?.users ?? [];

  async function executeConfirmedAction() {
    if (!pendingConfirm || actionLoading) return;
    setActionLoading(true);
    try {
      let res: Response;
      if (pendingConfirm.type === "deletePost") {
        res = await fetch(`/api/posts/${pendingConfirm.id}`, { method: "DELETE" });
      } else if (pendingConfirm.type === "deleteComment") {
        res = await fetch(`/api/comments/${pendingConfirm.id}`, { method: "DELETE" });
      } else if (pendingConfirm.type === "toggleBan") {
        res = await fetch(`/api/admin/users/${pendingConfirm.id}/ban`, { method: "POST" });
      } else {
        res = await fetch(`/api/admin/reports/${pendingConfirm.reportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: pendingConfirm.action }),
        });
      }

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
  const pendingReportsCount = reports.filter((r) => r.status === "pending").length;
  const imgPct =
    stats && stats.totalPosts > 0
      ? Math.round((stats.postsWithImage / stats.totalPosts) * 100)
      : 0;
  const capPct = stats ? Math.min(100, Math.round((stats.totalUsers / stats.maxUsers) * 100)) : 0;

  return (
    <>
      <div className="lg:hidden min-h-dvh flex flex-col items-center justify-center text-center p-6 gap-3">
        <Desktop size={48} />
        <h2 className="text-lg font-bold">
          {lang === "vi" ? "Chỉ hỗ trợ trên máy tính" : "Desktop Only"}
        </h2>
        <p className="text-sm max-w-[320px]" style={{ color: "var(--muted)" }}>
          {lang === "vi"
            ? "Trang quản trị marjames chỉ hiển thị ở độ rộng màn hình ≥ 1024px."
            : "marjames Admin Dashboard requires screen width ≥ 1024px."}
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg text-sm font-semibold mt-2"
          style={{
            background: "var(--surface-alt)",
            border: "1px solid var(--border)",
          }}
        >
          {lang === "vi" ? "Về trang chủ" : "Back to App"}
        </Link>
      </div>

      <div className="hidden lg:grid min-h-dvh grid-cols-[240px_1fr]">
        <aside
          className="sticky top-0 h-dvh flex flex-col p-4"
          style={{
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2.5 px-2.5 py-2 pb-5">
            <img
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              style={{ objectFit: "contain", display: "block" }}
            />
            <span className="text-xl font-extrabold tracking-tight">marjames</span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            >
              Admin
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {(
              [
                ["overview", lang === "vi" ? "Tổng quan" : "Overview", ChartBar],
                ["posts", lang === "vi" ? "Quản lý bài viết" : "Posts", Article],
                ["comments", lang === "vi" ? "Quản lý bình luận" : "Comments", ChatCircle],
                ["reports", lang === "vi" ? "Quản lý báo cáo" : "Reports", Flag],
                ["users", lang === "vi" ? "Quản lý người dùng" : "Users", Users],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left"
                style={{
                  background: tab === key ? "var(--surface-alt)" : "transparent",
                  color: tab === key ? "var(--ink)" : "var(--muted)",
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
                {key === "reports" && pendingReportsCount > 0 && (
                  <span
                    className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "var(--red-soft)", color: "var(--red)" }}
                  >
                    {pendingReportsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold"
              style={{ color: "var(--muted)" }}
            >
              <ArrowLeft size={18} />
              <span>{lang === "vi" ? "Về trang chủ" : "Back to App"}</span>
            </Link>
          </div>
        </aside>

        <div className="flex flex-col min-w-0">
          <header
            className="h-14 px-6 flex items-center justify-between gap-4 sticky top-0 z-10"
            style={{
              background: "var(--surface)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center gap-2 h-9 px-3 rounded-lg w-80"
              style={{
                background: "var(--surface-alt)",
                border: "1px solid var(--border)",
              }}
            >
              <MagnifyingGlass size={16} color="var(--muted)" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === "vi"
                    ? "Tìm theo @username hoặc nội dung..."
                    : "Search @username or content..."
                }
                className="flex-1 bg-transparent border-0 outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                style={{
                  background: "var(--surface-alt)",
                  border: "1px solid var(--border)",
                }}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                <span>{theme === "dark" ? "Light" : "Dark"}</span>
              </button>
              <button
                type="button"
                onClick={toggleLang}
                className="h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                style={{
                  background: "var(--surface-alt)",
                  border: "1px solid var(--border)",
                }}
              >
                <Globe size={15} />
                <span>{lang.toUpperCase()}</span>
              </button>
            </div>
          </header>

          <main className="p-6 max-w-[1200px] w-full">
            {tab === "overview" && stats && (
              <>
                <h1 className="text-xl font-bold mb-5">
                  {lang === "vi" ? "Tổng quan" : "Overview"}
                </h1>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    [
                      lang === "vi" ? "Thành viên (trần 1.000)" : "Members (cap 1,000)",
                      `${stats.totalUsers} / ${stats.maxUsers}`,
                      `${capPct}%`,
                      Users,
                    ],
                    [lang === "vi" ? "Tổng bài viết" : "Total Posts", String(stats.totalPosts), "", Article],
                    [lang === "vi" ? "Tổng bình luận" : "Total Comments", String(stats.totalComments), "", ChatCircle],
                    [lang === "vi" ? "Tài khoản bị khóa" : "Banned Users", String(stats.bannedUsers), "", Prohibit],
                    [lang === "vi" ? "Tổng lượt thả tim" : "Total Likes", String(stats.totalLikes), "", Heart],
                    [lang === "vi" ? "Bài viết có ảnh" : "Posts with Image", `${imgPct}%`, `${stats.postsWithImage} posts`, ImageIcon],
                    [lang === "vi" ? "Hoạt động 7 ngày" : "7-Day Active", String(stats.active7d), "", Pulse],
                    [lang === "vi" ? "Báo cáo chờ xử lý" : "Pending Reports", String(stats.pendingReports), "", Flag],
                  ].map(([label, value, sub, Icon]) => (
                    <div
                      key={label as string}
                      className="p-4 rounded-xl"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="flex items-center justify-between text-xs font-semibold mb-2"
                        style={{ color: "var(--muted)" }}
                      >
                        <span>{label as string}</span>
                        <Icon size={16} />
                      </div>
                      <div className="text-2xl font-extrabold">{value as string}</div>
                      {sub && (
                        <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                          {sub as string}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl overflow-hidden mb-6"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="px-4 py-3 text-sm font-bold"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {lang === "vi" ? "Thống kê 5 ngày gần nhất" : "Last 5 Days Activity"}
                  </div>
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                        <th className="p-3">Ngày</th>
                        <th className="p-3">Bài mới</th>
                        <th className="p-3">Bình luận mới</th>
                        <th className="p-3">Tim mới</th>
                        <th className="p-3">Thành viên mới</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.dailyStats.map((d) => (
                        <tr key={d.date} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td className="p-3 font-semibold">{d.date}</td>
                          <td className="p-3">{d.posts}</td>
                          <td className="p-3">{d.comments}</td>
                          <td className="p-3">{d.likes}</td>
                          <td className="p-3">+{d.users}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="px-4 py-3 text-sm font-bold"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {lang === "vi" ? "Top bài viết tương tác cao" : "Top Engaged Posts"}
                  </div>
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                        <th className="p-3">Tác giả</th>
                        <th className="p-3">Nội dung</th>
                        <th className="p-3">Tương tác</th>
                        <th className="p-3">Xem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topPosts.map((p) => (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td className="p-3 font-semibold">@{p.authorUsername}</td>
                          <td className="p-3 max-w-md truncate">{p.content}</td>
                          <td className="p-3">
                            {p.likesCount} tim · {p.commentsCount} bình luận
                          </td>
                          <td className="p-3">
                            <Link
                              href={`/post/${p.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                              style={{ border: "1px solid var(--border)" }}
                            >
                              <ArrowSquareOut size={14} /> Xem bài
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === "posts" && (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                      <th className="p-3">Tác giả</th>
                      <th className="p-3">Nội dung</th>
                      <th className="p-3">Tương tác</th>
                      <th className="p-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts
                      .filter(
                        (p) =>
                          p.username.toLowerCase().includes(q) ||
                          p.content.toLowerCase().includes(q)
                      )
                      .map((p) => (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td className="p-3 font-semibold">@{p.username}</td>
                          <td className="p-3 max-w-md">{p.content}</td>
                          <td className="p-3">
                            {p.likes} tim · {p.comments} cmt
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => setPendingConfirm({ type: "deletePost", id: p.id })}
                              style={{
                                color: "var(--red)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <Trash size={14} /> Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "comments" && (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                      <th className="p-3">Tác giả</th>
                      <th className="p-3">Nội dung</th>
                      <th className="p-3">Bài viết gốc</th>
                      <th className="p-3">Cấp độ</th>
                      <th className="p-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments
                      .filter(
                        (c) =>
                          c.username.toLowerCase().includes(q) ||
                          c.content.toLowerCase().includes(q)
                      )
                      .map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td className="p-3 font-semibold">@{c.username}</td>
                          <td className="p-3 max-w-sm">{c.content}</td>
                          <td className="p-3">
                            <Link
                              href={`/post/${c.postId}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                              style={{ border: "1px solid var(--border)" }}
                            >
                              <ArrowSquareOut size={14} /> #{c.postId} · {c.postExcerpt}…
                            </Link>
                          </td>
                          <td className="p-3">
                            {c.tier === 1 ? "Tầng 1" : "Trả lời (Tầng 2)"}
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => setPendingConfirm({ type: "deleteComment", id: c.id })}
                              style={{
                                color: "var(--red)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <Trash size={14} /> Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "reports" && (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                      <th className="p-3">Nội dung bị báo cáo</th>
                      <th className="p-3">Người báo cáo</th>
                      <th className="p-3">Lý do</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports
                      .filter(
                        (r) =>
                          r.targetAuthor.toLowerCase().includes(q) ||
                          r.reporter.toLowerCase().includes(q) ||
                          r.content.toLowerCase().includes(q)
                      )
                      .map((r) => (
                        <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td className="p-3 max-w-sm">
                            <div className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                              [{r.type === "post" ? "Bài viết" : "Bình luận"}] @{r.targetAuthor}
                            </div>
                            <div>{r.content}</div>
                          </td>
                          <td className="p-3">@{r.reporter}</td>
                          <td className="p-3">{r.reason}</td>
                          <td className="p-3 font-semibold">{r.status}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1.5">
                              <Link
                                href={`/post/${r.postId}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                                style={{ border: "1px solid var(--border)" }}
                              >
                                <ArrowSquareOut size={14} /> Xem bài
                              </Link>
                              {r.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPendingConfirm({
                                        type: "resolveReport",
                                        reportId: r.id,
                                        action: "delete",
                                      })
                                    }
                                    style={{
                                      color: "var(--red)",
                                      border: "1px solid var(--border)",
                                    }}
                                  >
                                    Xóa nội dung
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPendingConfirm({
                                        type: "resolveReport",
                                        reportId: r.id,
                                        action: "ban",
                                      })
                                    }
                                    style={{
                                      color: "var(--red)",
                                      border: "1px solid var(--border)",
                                    }}
                                  >
                                    Khóa user
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => dismissReport(r.id)}
                                    style={{ border: "1px solid var(--border)" }}
                                  >
                                    Bỏ qua
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "users" && (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                      <th className="p-3">Thành viên</th>
                      <th className="p-3">Vai trò</th>
                      <th className="p-3">Bài viết</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(
                        (u) =>
                          u.username.toLowerCase().includes(q) ||
                          u.name.toLowerCase().includes(q)
                      )
                      .map((u) => (
                        <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td className="p-3">
                            <div className="font-semibold">@{u.username}</div>
                            <div className="text-xs" style={{ color: "var(--muted)" }}>
                              {u.name}
                            </div>
                          </td>
                          <td className="p-3">{u.role}</td>
                          <td className="p-3">{u.postsCount}</td>
                          <td className="p-3">
                            {u.banned ? (
                              <span style={{ color: "var(--red)" }}>Đã khóa</span>
                            ) : (
                              "Hoạt động"
                            )}
                          </td>
                          <td className="p-3">
                            {u.role !== "admin" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingConfirm({
                                    type: "toggleBan",
                                    id: u.id,
                                    currentlyBanned: u.banned,
                                  })
                                }
                                style={{
                                  color: u.banned ? "var(--ink)" : "var(--red)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                {u.banned ? "Mở khóa" : "Khóa"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(pendingConfirm)}
        title={
          pendingConfirm?.type === "deletePost"
            ? t("confirmDeletePostTitle")
            : pendingConfirm?.type === "deleteComment"
            ? t("confirmDeleteCommentTitle")
            : pendingConfirm?.type === "toggleBan"
            ? pendingConfirm.currentlyBanned
              ? t("adminConfirmUnbanTitle")
              : t("adminConfirmBanTitle")
            : pendingConfirm?.action === "ban"
            ? t("adminConfirmResolveBanTitle")
            : t("adminConfirmResolveDeleteTitle")
        }
        message={
          pendingConfirm?.type === "deletePost"
            ? t("confirmDeletePostMsg")
            : pendingConfirm?.type === "deleteComment"
            ? t("confirmDeleteCommentMsg")
            : pendingConfirm?.type === "toggleBan"
            ? pendingConfirm.currentlyBanned
              ? t("adminConfirmUnbanMsg")
              : t("adminConfirmBanMsg")
            : pendingConfirm?.action === "ban"
            ? t("adminConfirmResolveBanMsg")
            : t("adminConfirmResolveDeleteMsg")
        }
        confirmLabel={
          pendingConfirm?.type === "deletePost" || pendingConfirm?.type === "deleteComment"
            ? t("deleteBtn")
            : t("confirmLabel")
        }
        cancelLabel={t("cancel")}
        danger={
          pendingConfirm?.type !== "toggleBan" || !pendingConfirm.currentlyBanned
        }
        loading={actionLoading}
        onConfirm={executeConfirmedAction}
        onCancel={() => setPendingConfirm(null)}
      />
    </>
  );
}
