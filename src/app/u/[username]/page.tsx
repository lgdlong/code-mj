import { notFound, redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile-client";
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

  const user = await prisma.user.findUnique({
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
  });

  if (!user || user.banned) notFound();

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: postIncludeForUser(viewer.id),
  });

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
