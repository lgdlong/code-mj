"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAppPreferences } from "@/components/providers";
import { readApiError } from "@/lib/client-error";
import type { PostDTO } from "@/types/domain";

export function useFeedMutations() {
  const queryClient = useQueryClient();
  const { t, lang, showToast } = useAppPreferences();

  async function toggleLike(postId: string) {
    const toggle = (list: PostDTO[] | undefined) =>
      list?.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) }
          : p
      );
    queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) {
        queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
        showToast(await readApiError(res, lang, "errLike"), "error");
      } else {
        void queryClient.invalidateQueries({ queryKey: ["feed"] });
      }
    } catch {
      queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
      showToast(t("errNetwork"), "error");
    }
  }

  async function toggleFollow(username: string) {
    const toggle = (list: PostDTO[] | undefined) =>
      list?.map((p) =>
        p.author.username === username
          ? { ...p, author: { ...p.author, isFollowing: !p.author.isFollowing } }
          : p
      );
    queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
        method: "POST",
      });
      if (!res.ok) {
        queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
        showToast(await readApiError(res, lang, "errFollow"), "error");
      } else {
        void queryClient.invalidateQueries({ queryKey: ["feed"] });
      }
    } catch {
      queryClient.setQueryData<PostDTO[]>(["feed"], toggle);
      showToast(t("errNetwork"), "error");
    }
  }

  return { toggleLike, toggleFollow };
}
