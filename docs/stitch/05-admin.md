# 05. `/admin` — Minimal Moderation Panel (Mobile `390x844` / Desktop `1024px`)

```text
Clean minimal admin moderation view for "Cortis" fandom (mobile-first 390px, scales to 720px centered container).
Top Bar: Back arrow (Phosphor ph-arrow-left), title "Moderation", monospace badge "ADMIN" (#8A5A00 text on #FFF8E1 yellow tint light / #FDC101 on #2A2105 dark with 1px #FDC101 border).
Summary Strip (2 compact stat blocks side by side, 1px #E5E5E5 / #2A2A2A border, #F5F5F5 / #222222 fill):
- "Members": "842 / 1,000" in monospace (#FF7300 orange highlight)
- "Banned": "3" in monospace (#FE0000 red)
Segmented Filter Tabs: "Recent Posts" (active with #FF7300 indicator) | "Users".
Moderation List (flat rows with 1px #E5E5E5 / #2A2A2A dividers):
- Row 1: Small avatar + "@username" + timestamp + 2-line post preview + small thumbnail if image attached. Right side: two compact action buttons — "Delete Post" (outline #E5E5E5 / #2A2A2A, #101010 / #F3F5F7 text) and "Ban User" (outline #FE0000, #FE0000 red text).
- Row 2 & Row 3: Similar clean moderation rows with clear 44px minimum tap height.
No charts, no complex analytics widgets, no dark-mode neon dashboards.
```
