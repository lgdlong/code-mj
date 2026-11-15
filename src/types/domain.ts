export interface UserSummaryDTO {
  id: string;
  username: string;
  name: string;
  image: string | null;
  bio: string;
  role: "user" | "admin";
  banned: boolean;
  followersCount: number;
  isFollowing: boolean;
}
  videoUrl: string | null;
  videoPublicKey?: string | null;

export interface ReplyDTO {
  id: number;
  postId: string;
  parentId: number;
  content: string;
  imageUrls: string[];
  mentions: string[];
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
  author: Pick<UserSummaryDTO, "id" | "username" | "name" | "image" | "role">;
}

export interface CommentDTO {
  id: number;
  postId: string;
  content: string;
  imageUrls: string[];
  mentions: string[];
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
  author: Pick<UserSummaryDTO, "id" | "username" | "name" | "image" | "role">;
  replies: ReplyDTO[];
}

export interface PostDTO {
  id: string;
  content: string;
  imageUrls: string[];
  /** Only returned to the post author's editor (single-post GET). */
  imagePublicIds?: string[];
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  author: Pick<UserSummaryDTO, "id" | "username" | "name" | "image" | "role"> & {
    isFollowing: boolean;
  };
}

export interface ProfileDTO extends UserSummaryDTO {
  followingCount: number;
  postsCount: number;
}

export interface LikerDTO {
  id: string;
  username: string;
  name: string;
  image: string | null;
  role: "user" | "admin";
  createdAt: string;
}

export type ActivityKind = "like" | "comment" | "reply" | "follow";

export interface ActivityDTO {
  /** Stable React key, unique per actor + target. */
  id: string;
  kind: ActivityKind;
  createdAt: string;
  read: boolean;
  actor: Pick<UserSummaryDTO, "id" | "username" | "name" | "image">;
  postId?: string;
  preview?: string;
  hasImage?: boolean;
}

export interface ReportDTO {
  id: number;
  type: "post" | "comment";
  targetId: string | number;
  postId: string;
  targetAuthor: string;
  reporter: string;
  content: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export interface AdminDailyStatDTO {
  date: string;
  posts: number;
  comments: number;
  likes: number;
  users: number;
}

export interface AdminStatsDTO {
  totalUsers: number;
  maxUsers: number;
  totalPosts: number;
  totalComments: number;
  bannedUsers: number;
  totalLikes: number;
  postsWithImage: number;
  active7d: number;
  pendingReports: number;
  dailyStats: AdminDailyStatDTO[];
  latestPosts: Array<{
    id: string;
    authorUsername: string;
    content: string;
    likesCount: number;
    commentsCount: number;
  }>;
}
