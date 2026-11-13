"use client";

import Link from "next/link";
import { ArrowSquareOut, Trash } from "@phosphor-icons/react";
import type { AdminCommentRow, AdminPostRow } from "@/components/admin/admin-types";

export function AdminPostsTab({
  posts,
  query,
  onDeletePost,
}: {
  posts: AdminPostRow[];
  query: string;
  onDeletePost: (id: string) => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
            <th className="p-3">Tác giả</th>
            <th className="p-3">Nội dung</th>
            <th className="p-3">Ảnh</th>
            <th className="p-3">Tương tác</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {posts
            .filter((p) => p.username.toLowerCase().includes(query) || p.content.toLowerCase().includes(query))
            .map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3 font-semibold">@{p.username}</td>
                <td className="p-3 max-w-md">{p.content}</td>
                <td className="p-3">{p.imageUrl ? "Có" : "—"}</td>
                <td className="p-3">{p.likes} tim · {p.comments} cmt</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onDeletePost(p.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ color: "var(--red)", border: "1px solid var(--border)" }}
                  >
                    <Trash size={14} /> Xóa
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminCommentsTab({
  comments,
  query,
  onDeleteComment,
}: {
  comments: AdminCommentRow[];
  query: string;
  onDeleteComment: (id: number) => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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
            .filter((c) => c.username.toLowerCase().includes(query) || c.content.toLowerCase().includes(query))
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
                <td className="p-3">{c.tier === 1 ? "Tầng 1" : "Trả lời (Tầng 2)"}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onDeleteComment(c.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ color: "var(--red)", border: "1px solid var(--border)" }}
                  >
                    <Trash size={14} /> Xóa
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
