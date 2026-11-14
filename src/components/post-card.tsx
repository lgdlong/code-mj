"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatCircle, DotsThree, Heart } from "@phosphor-icons/react";
import { PostImageLightbox } from "@/components/post-image-lightbox";
import { useAppPreferences } from "@/components/providers";
import type { PostDTO } from "@/types/domain";

const LikesSheet = dynamic(
  () => import("@/components/likes-sheet").then((m) => m.LikesSheet),
  { ssr: false }
);

interface PostCardProps {
  post: PostDTO;
  currentUserId: string;
  onToggleLike: (postId: string) => void;
  onToggleFollow?: (username: string) => void;
  onOpenMore: (post: PostDTO) => void;
}

export function formatRelativeTime(isoDate: string, lang: "vi" | "en"): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  if (diffSec < 60) return lang === "vi" ? "Vừa xong" : "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return lang === "vi" ? `${diffMin} phút` : `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return lang === "vi" ? `${diffHr} giờ` : `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  return lang === "vi" ? `${diffDay} ngày` : `${diffDay}d`;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FF7300, #FE0000)",
  "linear-gradient(135deg, #FDC101, #FF7300)",
  "linear-gradient(135deg, #FE0000, #9E0000)",
  "linear-gradient(135deg, #2b2b2b, #555555)",
];

export function getAvatarGradient(name: string): string {
  const code = name.trim().charCodeAt(0) || 0;
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
}

export function UserAvatar({
  name,
  image,
  size = 38,
  showFollowBadge,
  onFollowClick,
}: {
  name: string;
  image: string | null;
  size?: number;
  showFollowBadge?: boolean;
  onFollowClick?: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = (name.trim()[0] ?? "F").toUpperCase();
  const showImage = Boolean(image) && !imgFailed;

  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      {showImage ? (
        <img
          src={image!}
          alt={name}
          className="avatar-img"
          style={{ width: size, height: size }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className="avatar-fallback"
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * 0.37),
            background: getAvatarGradient(name),
          }}
        >
          {initial}
        </div>
      )}
      {showFollowBadge && onFollowClick && (
        <button
          type="button"
          className="avatar-follow-badge"
          onClick={(e) => {
            e.stopPropagation();
            onFollowClick();
          }}
          aria-label="Follow"
        >
          +
        </button>
      )}
    </div>
  );
}

export function PostCard({
  post,
  currentUserId,
  onToggleLike,
  onToggleFollow,
  onOpenMore,
}: PostCardProps) {
  const router = useRouter();
  const { lang, t } = useAppPreferences();
  const isSelf = post.author.id === currentUserId;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [likesOpen, setLikesOpen] = useState(false);

  return (
    <article className="post-card">
      <UserAvatar
        name={post.author.name}
        image={post.author.image}
        showFollowBadge={!isSelf && !post.author.isFollowing && Boolean(onToggleFollow)}
        onFollowClick={
          onToggleFollow ? () => onToggleFollow(post.author.username) : undefined
        }
      />

      <div className="post-main">
        <div className="post-author-row">
          <div className="post-author-meta">
            <Link href={`/u/${post.author.username}`} className="post-username">
              {post.author.username}
            </Link>
            <span className="post-time">
              {formatRelativeTime(post.createdAt, lang)}
            </span>
          </div>

          <button
            type="button"
            className="post-more-btn"
            onClick={() => onOpenMore(post)}
            aria-label="More"
          >
            <DotsThree size={20} weight="bold" />
          </button>
        </div>

        <div
          style={{ cursor: "pointer" }}
          onClick={() => router.push(`/post/${post.id}`)}
        >
          {post.content && <div className="post-content">{post.content}</div>}
          {post.imageUrls.length > 0 && (
            <div
              className="post-image-grid"
              data-count={Math.min(post.imageUrls.length, 5)}
              style={{ cursor: "zoom-in" }}
            >
              {post.imageUrls.slice(0, 5).map((url, i) => (
                <img
                  key={url}
                  src={url}
                  alt="Post attachment"
                  loading="lazy"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(i);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="post-actions">
          <div className="post-like-group">
            <button
              type="button"
              className={`action-btn ${post.likedByMe ? "liked" : ""}`}
              onClick={() => onToggleLike(post.id)}
              aria-label="Like"
            >
              <Heart size={19} weight={post.likedByMe ? "fill" : "regular"} />
            </button>
            <button
              type="button"
              className="action-count"
              onClick={() => setLikesOpen(true)}
              aria-label={t("likedByTitle")}
            >
              {post.likesCount}
            </button>
          </div>

          <Link href={`/post/${post.id}`} className="action-btn" aria-label="Comments">
            <ChatCircle size={19} />
            <span>{post.commentsCount}</span>
          </Link>
        </div>
      </div>

      {likesOpen && (
        <LikesSheet
          postId={post.id}
          likesCount={post.likesCount}
          onClose={() => setLikesOpen(false)}
        />
      )}

      {lightboxIndex !== null && (
        <PostImageLightbox
          urls={post.imageUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </article>
  );
}
