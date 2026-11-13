"use client";

import Link from "next/link";
import {
  ArrowSquareOut,
  Article,
  ChatCircle,
  Flag,
  Heart,
  Image as ImageIcon,
  Prohibit,
  Pulse,
  Users,
} from "@phosphor-icons/react";
import type { Lang } from "@/lib/i18n";
import type { AdminStatsDTO } from "@/types/domain";

interface AdminOverviewTabProps {
  stats: AdminStatsDTO;
  lang: Lang;
}

export function AdminOverviewTab({ stats, lang }: AdminOverviewTabProps) {
  const imgPct =
    stats.totalPosts > 0
      ? Math.round((stats.postsWithImage / stats.totalPosts) * 100)
      : 0;
  const capPct = Math.min(100, Math.round((stats.totalUsers / stats.maxUsers) * 100));

  const cards = [
    [lang === "vi" ? "Thành viên (trần 1.000)" : "Members (cap 1,000)", `${stats.totalUsers} / ${stats.maxUsers}`, `${capPct}%`, Users],
    [lang === "vi" ? "Tổng bài viết" : "Total Posts", String(stats.totalPosts), "", Article],
    [lang === "vi" ? "Tổng bình luận" : "Total Comments", String(stats.totalComments), "", ChatCircle],
    [lang === "vi" ? "Tài khoản bị khóa" : "Banned Users", String(stats.bannedUsers), "", Prohibit],
    [lang === "vi" ? "Tổng lượt thả tim" : "Total Likes", String(stats.totalLikes), "", Heart],
    [lang === "vi" ? "Bài viết có ảnh" : "Posts with Image", `${imgPct}%`, `${stats.postsWithImage} posts`, ImageIcon],
    [lang === "vi" ? "Hoạt động 7 ngày" : "7-Day Active", String(stats.active7d), "", Pulse],
    [lang === "vi" ? "Báo cáo chờ xử lý" : "Pending Reports", String(stats.pendingReports), "", Flag],
  ] as const;

  return (
    <>
      <h1 className="text-xl font-bold mb-5">
        {lang === "vi" ? "Tổng quan" : "Overview"}
      </h1>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map(([label, value, sub, Icon]) => (
          <div
            key={label}
            className="p-4 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>
              <span>{label}</span>
              <Icon size={16} />
            </div>
            <div className="text-2xl font-extrabold">{value}</div>
            {sub && <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3 text-sm font-bold" style={{ borderBottom: "1px solid var(--border)" }}>
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

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3 text-sm font-bold" style={{ borderBottom: "1px solid var(--border)" }}>
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
                <td className="p-3">{p.likesCount} tim · {p.commentsCount} bình luận</td>
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
  );
}
