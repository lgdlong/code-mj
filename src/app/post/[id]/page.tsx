import { notFound, redirect } from "next/navigation";
import { PostDetailClient } from "@/components/post-detail-client";
import { parsePostId } from "@/server/http";
import { mapPostToDTO, postIncludeForUser } from "@/server/post-mapper";
import { prisma } from "@/server/prisma";
import { getServerUser } from "@/server/session";
import type { CommentDTO } from "@/types/domain";
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await getServerUser();
  if (!viewer) redirect("/login");

  const { id } = await params;
  const postId = parsePostId(id);
  if (!postId) notFound();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: postIncludeForUser(viewer.id),
  });
  if (!post) notFound();

  const commentRows = await prisma.comment.findMany({
    where: { postId, parentId: null, author: { banned: false } },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: { id: true, username: true, name: true, image: true, role: true },
      },
      _count: { select: { likes: true } },
      likes: { where: { userId: viewer.id }, select: { userId: true } },
      replies: {
        where: { author: { banned: false } },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, username: true, name: true, image: true, role: true },
          },
          _count: { select: { likes: true } },
          likes: { where: { userId: viewer.id }, select: { userId: true } },
        },
      },
    },
  });

  const initialComments: CommentDTO[] = commentRows.map((c) => ({
    id: c.id,
    postId: c.postId,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    likesCount: c._count.likes,
    likedByMe: c.likes.length > 0,
    author: {
      id: c.author.id,
      username: c.author.username,
      name: c.author.name,
      image: c.author.image,
      role: c.author.role === "admin" ? "admin" : "user",
    },
    replies: c.replies.map((r) => ({
      id: r.id,
      postId: r.postId,
      parentId: c.id,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      likesCount: r._count.likes,
      likedByMe: r.likes.length > 0,
      author: {
        id: r.author.id,
        username: r.author.username,
        name: r.author.name,
        image: r.author.image,
        role: r.author.role === "admin" ? "admin" : "user",
      },
    })),
  }));

  return (
    <PostDetailClient
      currentUser={{ id: viewer.id, username: viewer.username }}
      initialPost={mapPostToDTO(post)}
      initialComments={initialComments}
    />
  );
}
