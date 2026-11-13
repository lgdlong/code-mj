# 02. `/` — Home Feed & Quick Composer (Mobile `390x844`)

```text
Mobile web screen (390x844) for "Cortis" Threads-style social feed.
Top Sticky Header (#FFFFFF light / #101010 dark with 1px bottom border #E5E5E5 / #2A2A2A):
- Minimal centered "CORTIS" wordmark with a subtle #FF7300 orange dot + theme toggle & profile icon on right (Phosphor Icons).
- Two equal-width feed tabs below: "All" (active, #101010 / #F3F5F7 bold text with 2px #FF7300 orange bottom indicator) and "Following" (#777777 text).
Quick Composer Strip (top of feed, separated by 1px #E5E5E5 / #2A2A2A divider):
- Left: 36px circular user avatar.
- Right: Single-line prompt input "Share something with Cortis..." (#F5F5F5 / #222222 fill, focus ring #FF7300) with a compact image-attach icon button (ph-image) and a small pill "Post" button (#FF7300 orange fill, #FFFFFF text).
Feed List (vertical stack separated by 1px #E5E5E5 / #2A2A2A full-width dividers, no outer card boxes):
- Post 1 (Text + 1 Image): 36px circular avatar on left, username "@minji_cortis" + relative timestamp "12m" in monospace on top row; clean 15px body text; one rounded-xl (12px radius) landscape photo below text; bottom action row with outline Phosphor Heart icon (ph-heart) + count "48", Comment bubble icon (ph-chat-circle) + count "9".
- Post 2 (Text-only, liked state): Same structure without image; Heart icon filled (ph-fill ph-heart) in #FE0000 red with count "132" in #FE0000.
- Post 3 (Text + 1 Image, partially visible at bottom).
Bottom Fixed Navigation Bar (56px height, #FFFFFF / #101010, 1px top border #E5E5E5 / #2A2A2A):
- 4 evenly spaced minimal Phosphor icons (44px tap targets): Home (ph-fill ph-house, active #FF7300 orange), Compose (ph-plus-circle), Profile (ph-user), and Admin shield icon (ph-shield, subtle).
```
