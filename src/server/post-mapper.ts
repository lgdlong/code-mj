import type { CommentDTO, PostDTO, ReplyDTO } from "@/types/domain";

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
  videoUrl: string | null;
  videoPublicKey: string | null;
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
    videoUrl: post.videoUrl,
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

/** Editor-only shape: the compose screen needs Cloudinary ids to drop removed assets. */
export function mapPostForEditor(post: PostRecordWithMeta): PostDTO {
  return {
    ...mapPostToDTO(post),
    imagePublicIds: post.imagePublicIds,
    videoPublicKey: post.videoPublicKey,
  };
}

export interface CommentRecordWithMeta {
  id: number;
  postId: string;
  parentId: number | null;
  content: string;
  imageUrls: string[];
  mentions: string[];
  createdAt: Date;
  author: {
    id: string;
    username: string;
    name: string;
    image: string | null;
    role: string;
  };
  likes: Array<{ userId: string }>;
  _count: { likes: number };
}

export interface CommentRowWithReplies extends CommentRecordWithMeta {
  replies: CommentRecordWithMeta[];
}

function mapCommentAuthor(author: CommentRecordWithMeta["author"]) {
  return {
    id: author.id,
    username: author.username,
    name: author.name,
    image: author.image,
    role: author.role === "admin" ? ("admin" as const) : ("user" as const),
  };
}

function mapReplyToDTO(reply: CommentRecordWithMeta, parentId: number): ReplyDTO {
  return {
    id: reply.id,
    postId: reply.postId,
    parentId,
    content: reply.content,
    imageUrls: reply.imageUrls,
    mentions: reply.mentions,
    createdAt: reply.createdAt.toISOString(),
    likesCount: reply._count.likes,
    likedByMe: reply.likes.length > 0,
    author: mapCommentAuthor(reply.author),
  };
}

export function mapCommentToDTO(comment: CommentRowWithReplies): CommentDTO {
  return {
    id: comment.id,
    postId: comment.postId,
    content: comment.content,
    imageUrls: comment.imageUrls,
    mentions: comment.mentions,
    createdAt: comment.createdAt.toISOString(),
    likesCount: comment._count.likes,
    likedByMe: comment.likes.length > 0,
    author: mapCommentAuthor(comment.author),
    replies: comment.replies.map((r) => mapReplyToDTO(r, comment.id)),
  };
}
