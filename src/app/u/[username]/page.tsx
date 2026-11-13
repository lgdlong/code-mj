import { notFound, redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile-client";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { mapPostToDTO, postIncludeForUser } from "@/server/post-mapper";
import { prisma } from "@/server/prisma";
import { getServerUser } from "@/server/session";
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const viewer = await getServerUser();
  if (!viewer) redirect("/login");

  const { username } = await params;
  const decoded = decodeURIComponent(username);

  const [user, posts] = await Promise.all([
    prisma.user.findUnique({
      where: { username: decoded },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        role: true,
        banned: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
        followers: {
          where: { followerId: viewer.id },
          select: { followerId: true },
        },
      },
    }),
    prisma.post.findMany({
      where: { author: { username: decoded, banned: false } },
      orderBy: { createdAt: "desc" },
      take: FEED_PAGE_SIZE,
      include: postIncludeForUser(viewer.id),
    }),
  ]);

  if (!user || user.banned) notFound();
  return (
    <ProfileClient
      currentUser={{ id: viewer.id, username: viewer.username }}
      initialProfile={{
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
        bio: user.bio,
        role: user.role === "admin" ? "admin" : "user",
        banned: user.banned,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        postsCount: user._count.posts,
        isFollowing: user.followers.length > 0,
      }}
      initialPosts={posts.map(mapPostToDTO)}
    />
  );
}
