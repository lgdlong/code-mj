# Plan — Comment images + @mentions

Scope: (1) comments can carry up to 5 compressed images, (2) `@username` autocomplete for followed users, exact-username mentions for non-followed, server-side existence validation.

## Current state (verified)

| Concern | Where | Fact |
|---|---|---|
| Image pipeline | `src/lib/compress-image.ts:6` | `browser-image-compression`, WebP, ≤1200px, ≤0.28MB, web worker |
| Media validation | `src/server/http.ts:71` `parsePostImages` | ≤5 pairs, equal length, `isSafeMediaUrl` (https + `res.cloudinary.com`) |
| Upload | `src/lib/cloudinary-upload.ts` → `POST /api/upload` | signed upload, server only signs |
| Media cleanup | `src/server/cloudinary.ts:48` | `destroyCloudinaryAssets` |
| Comment write | `src/app/api/posts/[id]/comments/route.ts:93` | text only, no media, no mentions |
| Comment read | same file `:27-50` + `src/app/post/[id]/page.tsx:26-79` | DTO mapped **twice**, duplicated |
| Comment delete | `src/app/api/comments/[id]/route.ts` | row delete, no asset cleanup |
| Mention render | `src/components/post-detail/comment-thread.tsx:9-29` | regex-only links, no existence check → dead `@foo` links to 404 |
| Username shape | `src/server/auth.ts:8`, `src/app/api/users/me/route.ts:28-34` | always stored lowercase, `[a-z0-9._]{3,24}` |
| Indexes | `prisma/schema.prisma` | `user.username` unique btree + GIN trgm; `follow` PK `(followerId, followingId)` |
| Constants | `src/lib/constants.ts` | no image-per-comment or mention limits |

## Decisions

1. **Reuse the whole post media pipeline** — `compressPostImage`, `useComposeImages`, `ComposeImageGrid`, `parsePostImages`, `uploadImageToCloudinary`, signature route. Zero new image code.
2. **One cap for both** (`5` = `MAX_POST_IMAGES`). No `MAX_COMMENT_IMAGES`; a second constant for the same number is drift. Naming wart accepted.
3. **Image-only comment allowed** (`content` OR `imageUrls` non-empty), same rule as posts (`errPostEmpty` precedent).
4. **Mentions are validated at write time and stored on the row** (`Comment.mentions String[]`). Rendering links only handles present in that array. Consequence: no 404 links, no per-render queries, and invalid `@text` stays plain text instead of rejecting the comment (rejecting on a typo'd handle is hostile).
5. **Suggestion list = followed users only**, prefix match on `username`. Non-followed users are never suggested; they work only when typed exactly and validated by (4).
6. **Cleanup on every delete path** — verified all 4 sites: `comments/[id]:DELETE`, `posts/[id]:DELETE`, `admin/reports/[id]:PATCH` (comment branch `:70`, post branch `:74`). Comment delete also cascades its replies (`parentId onDelete: Cascade`) and post delete cascades all comments, so a single row's ids are never enough. No user-delete route exists (ban only), so no extra path there.
7. **No mention notification** in this change (not asked).
8. **No renaming** of `parsePostImages` — reuse as-is; rename is churn with no behavior gain.

## Schema (additive, `prisma db push`, no data loss)

```prisma
model Comment {
  // …
  imageUrls      String[] @default([]) @map("images")
  imagePublicIds String[] @default([])
  mentions       String[] @default([])   // lowercased, verified-existing usernames
}
```

Backfill existing comments once (keeps old `@name` links working):

```sql
UPDATE "comment" c SET mentions = s.m
FROM (
  SELECT c2.id, array_agg(DISTINCT u.username) AS m
  FROM "comment" c2
  CROSS JOIN LATERAL regexp_matches(lower(c2.content), '(^|[^\w@])@([a-z0-9._]{0,23}[a-z0-9_])', 'g') AS g
  JOIN "user" u ON u.username = g[2] AND u.banned = false
  GROUP BY c2.id
) s
WHERE c.id = s.id;
```

## Feature 1 — comment images

1. `src/server/http.ts`: reuse `parsePostImages` in comment POST (same ≤5 / equal-length / safe-host rules).
2. `src/server/post-mapper.ts`: add `mapCommentToDTO(comment)` returning `CommentDTO` including its `replies` (both carry `imageUrls` + `mentions`); `viewerId` is not a parameter because the route/page already filter `likes` by viewer in the query. Delete the two duplicated inline mappers (`route.ts:54-84`, `page.tsx:40-79`).
3. `src/types/domain.ts`: `imageUrls: string[]`, `mentions: string[]` on `CommentDTO` and `ReplyDTO`.
4. `src/app/api/posts/[id]/comments/route.ts` POST: accept `imageUrls`/`imagePublicIds`; validate; allow empty content when images present; return new fields in the 201 body.
5. **New `src/server/media-cleanup.ts`** — gather must happen *before* the cascade runs:

```ts
/** Level-1 comment + its replies (strict 2 levels, so no recursion). */
export async function commentAssetIds(commentId: number): Promise<string[]> {
  const rows = await prisma.comment.findMany({
    where: { OR: [{ id: commentId }, { parentId: commentId }] },
    select: { imagePublicIds: true },
  });
  return rows.flatMap((r) => r.imagePublicIds);
}

/** Post images + every comment/reply image under it. */
export async function postAssetIds(postId: string): Promise<string[]> {
  const [post, comments] = await Promise.all([
    prisma.post.findUnique({ where: { id: postId }, select: { imagePublicIds: true } }),
    prisma.comment.findMany({ where: { postId }, select: { imagePublicIds: true } }),
  ]);
  return [...(post?.imagePublicIds ?? []), ...comments.flatMap((c) => c.imagePublicIds)];
}
```

6. Wire all 3 delete routes: `ids = await …AssetIds(id)` → `prisma.*.delete` → `destroyCloudinaryAssets(ids)`.
   - `src/app/api/comments/[id]/route.ts:29` (replies included via the `OR`).
   - `src/app/api/posts/[id]/route.ts:107` (replaces the current `destroyCloudinaryAssets(existing.imagePublicIds)`).
   - `src/app/api/admin/reports/[id]/route.ts:70,74` — the comment branch currently deletes with no asset handling; the post branch destroys only post images.
7. `src/components/post-card.tsx:155-174,212-219`: extract the grid + lightbox block into `src/components/media-grid.tsx` (`<MediaGrid urls />`, own lightbox state, `stopPropagation` inside). Reuse it in `CommentThread` for comment/reply images. Net line reduction in `post-card`.
8. Composer: move the form out of `post-detail-client.tsx:128-144` into `src/components/post-detail/comment-composer.tsx` (keeps both files <200 lines). It owns:
   - `useComposeImages()` for `items/total/addFiles/remove/publish/reset` (attachment button + `<ComposeImageGrid>` strip above the input)
   - bottom inset: the composer is `position: fixed; bottom: 0` and the thread's static `paddingBottom: 76` (`comment-thread.tsx:53`) only matches the one-row composer. With the image strip (~90px) the last comment is covered. `CommentComposer` observes its own root with a `ResizeObserver` and calls `onHeightChange(h)`; `post-detail-client` keeps `composerHeight` state and passes `bottomInset={composerHeight + 12}` to `CommentThread`, which uses it instead of the constant. Measured height includes `env(safe-area-inset-bottom)`. No magic numbers, works for any future composer growth (mention dropdown overlays, excluded).
   - mention dropdown (below)
   - submit: `publish(t)` → `POST …/comments` with media → `reset()` on success
   - `use-post-detail-actions.ts:106-110` guard becomes `content || total > 0` (image-only allowed); keep the `MAX_COMMENT_LENGTH` check on text
   - client-side cap: `addFiles` already rejects past `MAX_POST_IMAGES` total (use-compose-images.ts:62-64) — comment composer inherits it, no extra constant

   Hook change — `use-compose-images.ts:116` `cleanup()` only revokes preview URLs and `publish()` never clears `pending`. That is invisible in compose (it navigates away) but the comment composer stays mounted, so the next submit would re-upload the same files and re-attach them. Replace `cleanup()` with `reset()`:

```ts
const reset = useCallback(() => {
  for (const item of pending) URL.revokeObjectURL(item.previewUrl);
  setPending([]);
  setSaved([]);
}, [pending]);
```
   Call sites: `compose/page.tsx:116` (rename) and the comment composer (new)
9. `src/app/globals.css`: `.comment-composer-bar` → column wrapper (`.comment-composer-media`, `.comment-composer-row`) + `.mention-suggest` (absolute, `bottom: 100%`, max-height 240, scroll).
10. `src/lib/i18n.ts`: `commentImageHint`; `errImageTooLarge` / `errImageCompress` / `errTooManyImages` / `errInvalidMediaUrl` / `errUploadSig` / `errUploadCloud` / `errCommentEmpty` all already exist (i18n.ts:91-96, 106) — no new error keys needed. EN + VI complete.
11. `src/server/notifications.ts:95-106,130-139`: comment select gains `imageUrls`; comment items gain `hasImage: imageUrls.length > 0`. Without it an image-only comment notification renders an empty preview (`notifications-client.tsx:61-64` already falls back to `notifImagePost` when `hasImage`).

## Feature 2 — mentions

**Shared parser** — `src/lib/mentions.ts` (no server imports, used by client + server). One function, one pass, because the two obvious shortcuts are both traps: a capture group in a `/g` regex makes `String.split` emit the delimiters as separate parts, and reusing a `/g` regex with `.test()` reuses `lastIndex` between calls.

```ts
// Last char must be alnum/_ so "hi @alice. thanks" yields "alice", not "alice."
const HANDLE = /@[a-z0-9._]{0,23}[a-z0-9_]/gi;

export interface MentionSegment { text: string; handle: string | null }

/** Single pass. Boundary = start of string or a char that is not \w and not @. */
export function parseMentions(text: string): {
  segments: MentionSegment[];
  handles: string[]; // lowercased, deduped, first MENTION_MAX_HANDLES
}
```

Boundary matches the backfill SQL (`(^|[^\w@])`), so renderer, server validation and backfill agree on what a mention is. Deliberately **not** a lookbehind (`(?<![\w@])`): unsupported on Safari < 16.4, and this is a mobile-first audience; the manual boundary check needs nothing new.

**Suggestion endpoint** — `src/app/api/mentions/suggest/route.ts`:

```
GET /api/mentions/suggest?q=prefix
→ { items: [{ id, username, name, image }] }   // ≤ MENTION_SUGGEST_LIMIT (6)
```

```ts
prisma.user.findMany({
  where: {
    banned: false,
    ...(q ? { username: { startsWith: q.toLowerCase().slice(0, MAX_USERNAME_LENGTH) } } : {}),
    followers: { some: { followerId: viewer.id } },   // follows only
  },
  select: { id: true, username: true, name: true, image: true },
  orderBy: { username: "asc" },
  take: MENTION_SUGGEST_LIMIT,
});
```

Query notes: `startsWith` (no `mode: insensitive` — usernames are stored lowercase, verified) uses the `user_username_key` unique btree as a range scan; the follow filter compiles to one `EXISTS` on the `follow` PK `(followerId, followingId)` — index prefix. One round trip, 4 columns, no N+1, no `contains`/trgm, no join in JS.

**Write validation** — in comment POST (and only there):

```ts
const handles = parseMentions(content).handles;          // ≤10, lowercased, deduped
const existing = handles.length
  ? await prisma.user.findMany({
      where: { username: { in: handles }, banned: false },
      select: { username: true },
    })
  : [];
// store existing.map(u => u.username) as `mentions`; unknown handles stay plain text
```
One query on the unique btree, `in`-list over ≤10 values.

**Client** — `src/hooks/use-mention-suggest.ts`:
- On caret change, take the trailing token `/(^|\s)@([a-z0-9._]*)$/` before `selectionStart`.
- Token present (even `@` with empty prefix) → debounce 200ms → `fetch` with `AbortController`; abort in-flight on next keystroke; close on blur/space/Enter.
- State: `items`, `activeIndex`, `open`, `insert(username)` replacing `@token` → `@username ` and restoring caret.

`comment-composer.tsx` wiring: keyboard `↑ ↓` move `activeIndex`, `Enter`/`Tab` insert (and `preventDefault` so the form does not submit), `Esc` closes.

**Render** — `src/components/mention-text.tsx`:

```tsx
<MentionText text={c.content} mentions={c.mentions} />
```
Calls `parseMentions`, links segments whose lowercase handle is in `mentions` (authoritative, server-validated), leaves the rest plain. Replaces `renderMentions` in `comment-thread.tsx:12-29`. Edit-profile `@` bio not touched.

Handle cap: a comment naming more than `MENTION_MAX_HANDLES` (10) users stores only the first 10; the rest render as plain text rather than creating 20 lookups.

## Constants

```ts
export const MENTION_SUGGEST_LIMIT = 6;
export const MENTION_MAX_HANDLES = 10;
```

## Files

| File | Change |
|---|---|
| `prisma/schema.prisma` | 3 columns on `Comment` |
| `src/lib/constants.ts` | 2 mention constants |
| `src/lib/mentions.ts` | **new** parse helper |
| `src/server/post-mapper.ts` | `mapCommentToDTO` |
| `src/server/media-cleanup.ts` | **new** `commentAssetIds` / `postAssetIds` |
| `src/server/http.ts` | (no change; reuse `parsePostImages`) |
| `src/app/api/mentions/suggest/route.ts` | **new** |
| `src/app/api/posts/[id]/comments/route.ts` | media + mentions + mapper |
| `src/app/api/comments/[id]/route.ts` | destroy assets |
| `src/app/api/posts/[id]/route.ts` | `postAssetIds` before cascade delete |
| `src/app/api/admin/reports/[id]/route.ts` | asset cleanup on both branches |
| `src/app/post/[id]/page.tsx` | mapper, new fields |
| `src/types/domain.ts` | DTO fields |
| `src/components/media-grid.tsx` | **new** (extracted) |
| `src/components/mention-text.tsx` | **new** |
| `src/components/post-card.tsx` | use `MediaGrid` |
| `src/components/post-detail/comment-thread.tsx` | `MediaGrid` + `MentionText` + `bottomInset` padding |
| `src/components/post-detail/comment-composer.tsx` | **new** (form + images + dropdown) |
| `src/components/post-detail-client.tsx` | render composer, drop inline form |
| `src/hooks/use-mention-suggest.ts` | **new** |
| `src/hooks/use-compose-images.ts` | `cleanup` → `reset` (clear state too) |
| `src/app/compose/page.tsx` | `reset` rename |
| `src/hooks/use-post-detail-actions.ts` | submit accepts media/mentions |
| `src/app/globals.css` | composer + dropdown; reuse `.post-image-grid` for comment images (data-count logic already keyed to 1/3/5 layouts) — no new grid styles |
| `src/lib/i18n.ts` | VI/EN keys |
| `src/server/notifications.ts` | `hasImage` for comment items |

## Verification

1. `bun run db:generate && bunx --bun prisma db push` (additive), run backfill SQL.
2. `bun run typecheck && bun run build`.
3. Comment with 3 images: preview shows KB after compression, Cloudinary stores `image/webp`, grid + lightbox render in thread; image-only comment posts.
4. Post a second comment right after an image comment without leaving the page → composer is empty, exactly 1 upload per file in Network (no re-upload), no images attached to the new comment.
5. Delete a comment with images **and an imaged reply** → both assets gone (DB cascade takes both rows).
6. Delete a post whose comments/replies have images → post + all comment assets gone; same via admin "resolve report → delete" for both a comment report and a post report.
7. `@` alone lists followed users; typing filters by prefix; a non-followed existing user never appears; `@exact` of non-followed user links after post; `@nobody_here_x` stays plain text and comment still posts.
8. `EXPLAIN` the suggest query: `user_username_key` range scan + follow PK; no seq scan on `follow`.
9. Old comments (backfilled) still render their `@links`.
10. Image-only comment notifies the post author as "posted an image" (`notifImagePost`), not an empty bubble.
11. Attach 3 images on mobile: the **last** comment (and last reply) is fully visible above the grown composer bar, on a screen with `safe-area-inset-bottom` too.

## Accepted limits

- Suggest endpoint has no rate limit (repo has none anywhere); debounce + prefix index keep it ~1 query per 200ms per typist on ≤1,000 users.
- `email@domain.com` can link if `domain.com` is a real username — same false-positive class Instagram has; the mentions set keeps it honest only for real accounts.
- A username ending in `.` can never be mentioned (the pattern forces an alnum/`_` last char so prose like `@alice.` works). Same rule Instagram applies; the API still allows such usernames.
- Posts still do not render `@mentions` (not asked); `MentionText` is ready if wanted later.
- No mention notifications.
