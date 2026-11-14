export type AdminTab = "overview" | "posts" | "comments" | "reports" | "users";

export interface AdminPostRow {
  id: string;
  username: string;
  content: string;
  imageUrls: string[];
  likes: number;
  comments: number;
  createdAt: string;
}

export interface AdminCommentRow {
  id: number;
  postId: string;
  postExcerpt: string;
  username: string;
  content: string;
  tier: 1 | 2;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  username: string;
  name: string;
  role: "user" | "admin";
  banned: boolean;
  postsCount: number;
}

export type PendingAdminConfirm =
  | { type: "deletePost"; id: string }
  | { type: "deleteComment"; id: number }
  | { type: "toggleBan"; id: string; currentlyBanned: boolean }
  | { type: "resolveReport"; reportId: number; action: "delete" | "ban" };
