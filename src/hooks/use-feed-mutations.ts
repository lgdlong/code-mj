"use client";

import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useAppPreferences } from "@/components/providers";
import { readApiError } from "@/lib/client-error";
import type { PostDTO } from "@/types/domain";

export interface FeedPage {
  items: PostDTO[];
  nextCursor: string | null;
}

export function useFeedMutations() {
  const queryClient = useQueryClient();
  const { t, lang, showToast } = useAppPreferences();

  async function toggleLike(postId: string) {
    const toggle = (data: InfiniteData<FeedPage> | undefined) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((p) =>
            p.id === postId
              ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) }
              : p
          ),
        })),
      };
    queryClient.setQueryData<InfiniteData<FeedPage>>(["feed"], toggle);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) {
        queryClient.setQueryData<InfiniteData<FeedPage>>(["feed"], toggle);
        showToast(await readApiError(res, lang, "errLike"), "error");
      }
    } catch {
      queryClient.setQueryData<InfiniteData<FeedPage>>(["feed"], toggle);
      showToast(t("errNetwork"), "error");
    }
  }

  async function toggleFollow(username: string) {
    const toggle = (data: InfiniteData<FeedPage> | undefined) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((p) =>
            p.author.username === username
              ? { ...p, author: { ...p.author, isFollowing: !p.author.isFollowing } }
              : p
          ),
        })),
      };
    queryClient.setQueryData<InfiniteData<FeedPage>>(["feed"], toggle);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
        method: "POST",
      });
      if (!res.ok) {
        queryClient.setQueryData<InfiniteData<FeedPage>>(["feed"], toggle);
        showToast(await readApiError(res, lang, "errFollow"), "error");
      }
    } catch {
      queryClient.setQueryData<InfiniteData<FeedPage>>(["feed"], toggle);
      showToast(t("errNetwork"), "error");
    }
  }

  return { toggleLike, toggleFollow };
}
