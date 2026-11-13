# 03. `/post/[id]` — Post Detail & 2-Tier Comments (Mobile `390x844`)

```text
Mobile web screen (390x844) for a single post detail page with 2-tier nested comments (Threads-style).
Top Bar: Back arrow button on left (Phosphor ph-arrow-left), title "Post" centered, 1px bottom border #E5E5E5 light / #2A2A2A dark.
Main Post Section:
- Author row: 40px circular avatar, display name + "@username", and timestamp "2h ago" in monospace (#777777).
- Full post text (16px, #101010 light / #F3F5F7 dark, comfortable line-height) + one rounded-xl (12px) attached photo.
- Metadata & Action Bar: Phosphor Heart icon (filled #FE0000 red) + "64 likes", Comment icon (ph-chat-circle) + "14 replies", separated by 1px #E5E5E5 / #2A2A2A dividers.
2-Tier Comments Section:
- Tier 1 Comment: 32px circular avatar with a vertical 2px #E5E5E5 / #2A2A2A thread connector line running down the left side; username, timestamp "1h", comment text, and a small "Reply" text button (#FF7300 on hover/active).
- Tier 2 Reply (indented under Tier 1, connected by the vertical thread line): 28px circular avatar, username, timestamp "45m", reply text. No further nesting beyond Tier 2, no "Reply" button on Tier 2.
- Another Tier 1 Comment below with its own 1px top divider.
Bottom Sticky Reply Bar (#FFFFFF light / #101010 dark, 1px top border #E5E5E5 / #2A2A2A):
- Compact 32px user avatar + text input "Reply to @username..." (#F5F5F5 / #222222 fill) + "Reply" pill button (#FF7300 orange fill, #FFFFFF text).
```
