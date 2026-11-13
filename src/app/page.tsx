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

  const rows = await prisma.post.findMany({
    where: { author: { banned: false } },
    orderBy: { createdAt: "desc" },
    take: FEED_PAGE_SIZE + 1,
    include: postIncludeForUser(user.id),
  });

  const hasMore = rows.length > FEED_PAGE_SIZE;
  const initialPosts = (hasMore ? rows.slice(0, FEED_PAGE_SIZE) : rows).map(mapPostToDTO);
  const initialNextCursor = hasMore ? (initialPosts[initialPosts.length - 1]?.id ?? null) : null;

  return (
    <FeedClient
      currentUser={{
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
      }}
      initialPosts={initialPosts}
      initialNextCursor={initialNextCursor}
    />
  );
}
