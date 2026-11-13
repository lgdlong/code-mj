import { redirect } from "next/navigation";
import { FeedClient } from "@/components/feed-client";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { mapPostToDTO, postIncludeForUser } from "@/server/post-mapper";
import { prisma } from "@/server/prisma";
import { getServerUser } from "@/server/session";
export default async function HomePage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: { author: { banned: false } },
    orderBy: { createdAt: "desc" },
    take: FEED_PAGE_SIZE,
    include: postIncludeForUser(user.id),
  });

  return (
    <FeedClient
      currentUser={{
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
      }}
      initialPosts={posts.map(mapPostToDTO)}
    />
  );
}
