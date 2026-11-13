"use client";

import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react";
import type { AdminUserRow } from "@/components/admin/admin-types";
import type { ReportDTO } from "@/types/domain";

export function AdminReportsTab({
  reports,
  query,
  onResolve,
  onDismiss,
}: {
  reports: ReportDTO[];
  query: string;
  onResolve: (reportId: number, action: "delete" | "ban") => void;
  onDismiss: (reportId: number) => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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
                r.targetAuthor.toLowerCase().includes(query) ||
                r.reporter.toLowerCase().includes(query) ||
                r.content.toLowerCase().includes(query)
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
                          onClick={() => onResolve(r.id, "delete")}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ color: "var(--red)", border: "1px solid var(--border)" }}
                        >
                          Xóa nội dung
                        </button>
                        <button
                          type="button"
                          onClick={() => onResolve(r.id, "ban")}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ color: "var(--red)", border: "1px solid var(--border)" }}
                        >
                          Khóa user
                        </button>
                        <button
                          type="button"
                          onClick={() => onDismiss(r.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
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
  );
}

export function AdminUsersTab({
  users,
  query,
  onToggleBan,
}: {
  users: AdminUserRow[];
  query: string;
  onToggleBan: (id: string, currentlyBanned: boolean) => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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
            .filter((u) => u.username.toLowerCase().includes(query) || u.name.toLowerCase().includes(query))
            .map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3">
                  <div className="font-semibold">@{u.username}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{u.name}</div>
                </td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.postsCount}</td>
                <td className="p-3">
                  {u.banned ? <span style={{ color: "var(--red)" }}>Đã khóa</span> : "Hoạt động"}
                </td>
                <td className="p-3">
                  {u.role !== "admin" && (
                    <button
                      type="button"
                      onClick={() => onToggleBan(u.id, u.banned)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ color: u.banned ? "var(--ink)" : "var(--red)", border: "1px solid var(--border)" }}
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
  );
}
