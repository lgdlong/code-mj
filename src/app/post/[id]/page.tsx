import { notFound, redirect } from "next/navigation";
import { PostDetailClient } from "@/components/post-detail-client";
import { COMMENT_PAGE_SIZE } from "@/lib/constants";
import { pageCursor, parsePostId } from "@/server/http";
import { mapCommentToDTO, mapPostToDTO, postIncludeForUser } from "@/server/post-mapper";
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

  const rows = await prisma.comment.findMany({
    where: { postId, parentId: null, author: { banned: false } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: COMMENT_PAGE_SIZE + 1,
    include: {
      author: {
        select: { id: true, username: true, name: true, image: true, role: true },
      },
      _count: { select: { likes: true } },
      likes: { where: { userId: viewer.id }, select: { userId: true } },
      replies: {
        where: { author: { banned: false } },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
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

  const hasMore = rows.length > COMMENT_PAGE_SIZE;
  const commentRows = hasMore ? rows.slice(0, COMMENT_PAGE_SIZE) : rows;

  const initialComments: CommentDTO[] = commentRows.map(mapCommentToDTO);

  const lastComment = hasMore ? initialComments[initialComments.length - 1] : null;
  const initialNextCursor = lastComment ? pageCursor(lastComment.createdAt, lastComment.id) : null;

  return (
    <PostDetailClient
      currentUser={{ id: viewer.id, username: viewer.username }}
      initialPost={mapPostToDTO(post)}
      initialComments={initialComments}
      initialNextCursor={initialNextCursor}
    />
  );
}
