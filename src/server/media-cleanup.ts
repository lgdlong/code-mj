import { prisma } from "@/server/prisma";

/** Level-1 comment plus its replies (strict 2 levels, so no recursion). */
export async function commentAssetIds(commentId: number): Promise<string[]> {
  const rows = await prisma.comment.findMany({
    where: { OR: [{ id: commentId }, { parentId: commentId }] },
    select: { imagePublicIds: true },
  });
  return rows.flatMap((r) => r.imagePublicIds);
}

/** Post images plus every comment/reply image under it. */
export async function postAssetIds(postId: string): Promise<string[]> {
  const [post, comments] = await Promise.all([
    prisma.post.findUnique({ where: { id: postId }, select: { imagePublicIds: true } }),
    prisma.comment.findMany({ where: { postId }, select: { imagePublicIds: true } }),
  ]);
  return [...(post?.imagePublicIds ?? []), ...comments.flatMap((c) => c.imagePublicIds)];
}
