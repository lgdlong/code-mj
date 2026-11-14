import type { PostDTO } from "@/types/domain";

export const postIncludeForUser = (viewerId: string) => ({
  author: {
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      role: true,
      followers: {
        where: { followerId: viewerId },
        select: { followerId: true },
      },
    },
  },
  likes: {
    where: { userId: viewerId },
    select: { userId: true },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
});

export interface PostRecordWithMeta {
  id: string;
  content: string;
  imageUrls: string[];
  imagePublicIds: string[];
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    name: string;
    image: string | null;
    role: string;
    followers: Array<{ followerId: string }>;
  };
  likes: Array<{ userId: string }>;
  _count: {
    likes: number;
    comments: number;
  };
}

export function mapPostToDTO(post: PostRecordWithMeta): PostDTO {
  return {
    id: post.id,
    content: post.content,
    imageUrls: post.imageUrls,
    imagePublicIds: post.imagePublicIds,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    likedByMe: post.likes.length > 0,
    author: {
      id: post.author.id,
      username: post.author.username,
      name: post.author.name,
      image: post.author.image,
      role: post.author.role === "admin" ? "admin" : "user",
      isFollowing: post.author.followers.length > 0,
    },
  };
}
