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

export interface ReplyDTO {
  id: number;
  postId: string;
  parentId: number;
  content: string;
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
  author: Pick<UserSummaryDTO, "id" | "username" | "name" | "image" | "role">;
}

export interface CommentDTO {
  id: number;
  postId: string;
  content: string;
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
  author: Pick<UserSummaryDTO, "id" | "username" | "name" | "image" | "role">;
  replies: ReplyDTO[];
}

export interface PostDTO {
  id: string;
  content: string;
  imageUrl: string | null;
  imagePublicId: string | null;
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
  topPosts: Array<{
    id: string;
    authorUsername: string;
    content: string;
    likesCount: number;
    commentsCount: number;
  }>;
}
