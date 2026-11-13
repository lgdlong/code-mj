const I18N = {
  vi: {
    forYou: "Dành cho bạn",
    following: "Đang theo dõi",
    whatsNew: "Có gì mới?",
    postBtn: "Đăng",
    cancel: "Hủy",
    newThread: "Bài viết mới",
    addImage: "Thêm 1 ảnh (tự nén WebP)",
    compressedHint: "Đã nén WebP: 214 KB (gốc 4.2 MB)",
    threadDetail: "Bài viết",
    replies: "Bình luận",
    replyAction: "Trả lời",
    replyPlaceholder: "Viết bình luận...",
    replyingTo: "Đang trả lời",
    profilePosts: "Bài viết",
    follow: "Theo dõi",
    followingBtn: "Đang theo dõi",
    editProfile: "Chỉnh sửa hồ sơ",
    followers: "người theo dõi",
    followingCount: "đang theo dõi",
    loginTitle: "Cortis Fandom",
    loginSub: "Không gian riêng tư cho fandom Cortis. Đăng nhập Google để xem bài viết và thảo luận.",
    capLabel: "348 / 1.000 thành viên",
    googleBtn: "Tiếp tục bằng Google",
    loginNote: "Chỉ dành cho thành viên đã đăng nhập. Tối đa 1 ảnh/bài.",
    adminTitle: "Quản trị Fandom",
    adminCap: "Giới hạn thành viên",
    banUser: "Khóa nick",
    unbanUser: "Mở khóa",
    bannedBadge: "Đã khóa",
    deletePost: "Xóa bài viết",
    editPost: "Chỉnh sửa bài viết",
    editThread: "Chỉnh sửa",
    saveBtn: "Lưu",
    updatedToast: "Đã cập nhật bài viết",
    deleteCommentBtn: "Xóa",
    deletedCommentToast: "Đã xóa bình luận",
    editedTag: "(đã chỉnh sửa)",
    reportPost: "Báo cáo bài viết",
    reportComment: "Báo cáo bình luận",
    close: "Đóng",
    deletedToast: "Đã xóa bài viết",
    reportedToast: "Đã gửi báo cáo tới Admin",
    postedToast: "Đã đăng bài viết mới",
    emptyFollowing: "Bạn chưa theo dõi ai. Hãy bấm dấu + trên avatar để theo dõi!",
    tier2Hint: "Tối đa 2 tầng bình luận",
    menuAppearance: "Giao diện",
    menuThemeDark: "Tối",
    menuThemeLight: "Sáng",
    menuLanguage: "Ngôn ngữ",
    menuAdmin: "Quản trị Fandom",
    menuLogout: "Đăng xuất",
    searchPlaceholder: "Tìm kiếm",
    searchEmpty: "Không tìm thấy kết quả"
  },
  en: {
    forYou: "For you",
    following: "Following",
    whatsNew: "What's new?",
    postBtn: "Post",
    cancel: "Cancel",
    newThread: "New post",
    addImage: "Add 1 image (auto WebP)",
    compressedHint: "Compressed WebP: 214 KB (was 4.2 MB)",
    threadDetail: "Post",
    replies: "Replies",
    replyAction: "Reply",
    replyPlaceholder: "Write a reply...",
    replyingTo: "Replying to",
    profilePosts: "Posts",
    follow: "Follow",
    followingBtn: "Following",
    editProfile: "Edit profile",
    followers: "followers",
    followingCount: "following",
    loginTitle: "Cortis Fandom",
    loginSub: "Private space for Cortis fandom. Sign in with Google to view posts and join discussions.",
    capLabel: "348 / 1,000 members",
    googleBtn: "Continue with Google",
    loginNote: "Members only. Max 1 image per post.",
    adminTitle: "Fandom Admin",
    adminCap: "Member cap",
    banUser: "Ban",
    unbanUser: "Unban",
    bannedBadge: "Banned",
    deletePost: "Delete post",
    editPost: "Edit post",
    editThread: "Edit post",
    saveBtn: "Save",
    updatedToast: "Post updated",
    deleteCommentBtn: "Delete",
    deletedCommentToast: "Comment deleted",
    editedTag: "(edited)",
    reportPost: "Report post",
    reportComment: "Report comment",
    close: "Close",
    previewLogin: "Preview Login",
    deletedToast: "Post deleted",
    reportedToast: "Reported to Admin",
    postedToast: "Published new post",
    emptyFollowing: "Not following anyone yet. Tap + on an avatar to follow!",
    tier2Hint: "Max 2 comment levels",
    menuAppearance: "Appearance",
    menuThemeDark: "Dark",
    menuThemeLight: "Light",
    menuLanguage: "Language",
    menuAdmin: "Fandom Admin",
    menuLogout: "Log out",
    searchPlaceholder: "Search",
    searchEmpty: "No results found"
  }
};

const state = {
  lang: "vi",
  theme: "dark",
  menuOpen: false,
  route: "home", // home | post | profile | admin | login | search
  searchQuery: "",
  recentSearches: [
    { type: "keyword", value: "photocard" },
    { type: "user", value: "cortis_minh" },
    { type: "keyword", value: "rehearsal" }
  ],
  feedTab: "forYou", // forYou | following
  actionTargetPostId: null,
  actionTargetComment: null,
  editingPostId: null,
  composeDraftText: "",
  selectedUsername: "cortis_minh",
  replyingToCommentId: null,
  composeImageAttached: false,
  actionTargetPostId: null,
  me: {
    username: "ban_fan",
    name: "Bạn (Fan #348)",
    bio: "Cortis OT5 forever. Thích chụp fancam và sưu tầm photocard.",
    role: "admin",
    color: "linear-gradient(135deg, #FF7300, #FE0000)"
  },
  users: [
    { username: "cortis_minh", name: "Minh Cortis", bio: "Admin fandom Cortis VN. Cập nhật lịch trình mỗi ngày.", role: "admin", followers: 412, following: 28, followed: false, banned: false, color: "linear-gradient(135deg, #FDC101, #FF7300)" },
    { username: "linh.bias", name: "Linh", bio: "Đi concert hết mình 🧡", role: "user", followers: 128, following: 64, followed: true, banned: false, color: "linear-gradient(135deg, #FF7300, #FE0000)" },
    { username: "huy_cam", name: "Huy Fancam", bio: "Chụp ảnh sự kiện Cortis.", role: "user", followers: 289, following: 19, followed: false, banned: false, color: "linear-gradient(135deg, #2b2b2b, #555)" },
    { username: "spam_bot99", name: "Spammer", bio: "Link lạ...", role: "user", followers: 2, following: 150, followed: false, banned: true, color: "#444" }
  ],
  posts: [
    {
      id: 1,
      username: "cortis_minh",
      timeVi: "12 phút",
      timeEn: "12m",
      contentVi: "Ảnh rehearsal hôm nay của Cortis nét căng luôn mọi người ơi!! Ai đi offline cuối tuần nhớ mang lightstick nhé 🧡",
      contentEn: "Cortis rehearsal shots from today look insane!! Bring your lightsticks for this weekend's offline meetup 🧡",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
      likes: 162,
      liked: false,
      comments: [
        {
          id: 101,
          username: "linh.bias",
          timeVi: "8 phút",
          timeEn: "8m",
          textVi: "Trời ơi visual đỉnh quá, mình đăng ký 2 slot offline rồi!",
          textEn: "Visuals are unreal, already registered 2 slots for the meetup!",
          replies: [
            { id: 201, username: "cortis_minh", timeVi: "5 phút", timeEn: "5m", textVi: "Hẹn gặp bạn ở cổng B lúc 14h nha!", textEn: "See you at Gate B at 2 PM!" }
          ]
        },
        {
          id: 102,
          username: "huy_cam",
          timeVi: "3 phút",
          timeEn: "3m",
          textVi: "Ảnh nén lên web vẫn giữ được độ nét ghê.",
          textEn: "Even compressed, the photo still looks super crisp.",
          replies: []
        }
      ]
    },
    {
      id: 2,
      username: "linh.bias",
      timeVi: "1 giờ",
      timeEn: "1h",
      contentVi: "Mới unbox xong album bản limited, trúng ngay bias luôn huhu không uổng công đợi 2 tuần.",
      contentEn: "Just unboxed the limited album and pulled my bias! Worth the 2-week wait.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
      likes: 76,
      liked: true,
      comments: [
        { id: 103, username: "ban_fan", timeVi: "40 phút", timeEn: "40m", textVi: "Xin vía!!", textEn: "Manifesting this luck!!", replies: [] }
      ]
    },
    {
      id: 3,
      username: "huy_cam",
      timeVi: "3 giờ",
      timeEn: "3h",
      contentVi: "Mọi người nhớ tắt flash khi quay sân khấu tối nay để tránh làm chói mắt nhóm nha.",
      contentEn: "Remember to turn off flash while filming tonight's stage!",
      image: null,
      likes: 119,
      liked: false,
      comments: []
    }
    ,
    {
      id: 4,
      username: "ban_fan",
      timeVi: "5 giờ",
      timeEn: "5h",
      contentVi: "Góc check-in nhẹ trước giờ G, nay trời đẹp mà vibe khu vực fanmeeting cháy quá!",
      contentEn: "Quick check-in before showtime, great weather and the fanmeeting vibe is unreal!",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
      likes: 48,
      liked: true,
      comments: [
        { id: 104, username: "linh.bias", timeVi: "4 giờ", timeEn: "4h", textVi: "Đỉnh quá bạn ơi, giữ chỗ đẹp nha!", textEn: "Awesome! Save a good spot!", replies: [] }
      ]
    },
    {
      id: 5,
      username: "ban_fan",
      timeVi: "1 ngày",
      timeEn: "1d",
      contentVi: "Nghe lại nguyên album debut từ sáng tới giờ vẫn chưa chán bài nào luôn.",
      contentEn: "Been replaying the debut album all morning and still zero skips.",
      image: null,
      likes: 31,
      liked: false,
      comments: []
    },
    {
      id: 6,
      username: "ban_fan",
      timeVi: "3 ngày",
      timeEn: "3d",
      contentVi: "Bộ photocard đợt này in giấy dày dặn thích thật sự, may mà trade đủ set OT5 rồi.",
      contentEn: "The cardstock quality on this batch of photocards is so good—finally traded for the full OT5 set!",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
      likes: 94,
      liked: true,
      comments: []
    }
  ]
};

const t = (key) => I18N[state.lang][key] || key;

function getUser(username) {
  if (username === state.me.username) return { ...state.me, followers: 84, following: 12, followed: false };
  return state.users.find((u) => u.username === username) || state.users[0];
}

function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

function renderAvatar(user, isLarge = false, showPlus = false) {
  const initial = (user.name || user.username)[0].toUpperCase();
  const plusHtml = showPlus
    ? `<button class="follow-plus-badge" onclick="event.stopPropagation(); toggleFollow('${user.username}')" aria-label="Follow"><i class="ph-bold ph-plus"></i></button>`
    : "";
  return `
    <div class="avatar-wrap ${isLarge ? "avatar-lg" : ""}" onclick="event.stopPropagation(); openProfile('${user.username}')">
      <div class="avatar ${isLarge ? "avatar-lg" : ""}" style="background:${user.color}">${initial}</div>
      ${plusHtml}
    </div>
  `;
}

function renderPostCard(post) {
  const author = getUser(post.username);
  const showPlus = post.username !== state.me.username && !author.followed;
  const timeText = state.lang === "vi" ? post.timeVi : post.timeEn;
  const contentText = state.lang === "vi" ? post.contentVi : post.contentEn;
  const totalComments = post.comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  return `
    <article class="post-card" onclick="openPost(${post.id})">
      ${renderAvatar(author, false, showPlus)}
      <div class="post-main">
        <div class="post-header">
          <div class="post-author-row" onclick="event.stopPropagation(); openProfile('${author.username}')">
            <span class="post-username">${author.username}</span>
            <span class="post-time">${timeText}</span>
          </div>
          <button class="post-more-btn" onclick="event.stopPropagation(); openMoreSheet(${post.id})" aria-label="More">
            <i class="ph ph-dots-three"></i>
          </button>
        </div>
        <div class="post-content">${contentText}</div>
        ${post.image ? `<div class="post-image-wrap"><img src="${post.image}" alt="Post image" loading="lazy" /></div>` : ""}
        <div class="post-actions">
          <button class="action-btn ${post.liked ? "liked" : ""}" onclick="event.stopPropagation(); toggleLike(${post.id})">
            <i class="${post.liked ? "ph-fill" : "ph"} ph-heart"></i>
            <span>${post.likes}</span>
          </button>
          <button class="action-btn" onclick="event.stopPropagation(); openPost(${post.id})">
            <i class="ph ph-chat-circle"></i>
            <span>${totalComments}</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderTopHeader() {
  return `
    <header class="top-header">
      <div class="header-bar">
        <button class="brand-mark" onclick="goHome()">
          <span class="brand-wordmark">marjames</span>
        </button>
        <button class="header-icon-btn" onclick="openSearch()" aria-label="Search">
          <i class="ph ph-magnifying-glass"></i>
        </button>
      </div>
    </header>
  `;
}

function renderHome() {
  return `
    ${renderTopHeader(false)}
    <div class="inline-composer" onclick="openComposer()">
      ${renderAvatar(state.me)}
      <div class="inline-composer-meta">
        <span class="inline-composer-user">${state.me.username}</span>
        <span class="inline-composer-prompt">${t("whatsNew")}</span>
      </div>
      <span class="btn-post-sm">${t("postBtn")}</span>
    </div>
    ${state.posts.map(renderPostCard).join("")}
  `;
}

function renderPostDetail() {
  const post = state.posts.find((p) => p.id === state.selectedPostId) || state.posts[0];
  const replyTarget = post.comments.find((c) => c.id === state.replyingToCommentId);

  const commentsHtml = post.comments
    .map((c) => {
      const cAuthor = getUser(c.username);
      const hasReplies = c.replies.length > 0;
      const repliesHtml = c.replies
        .map((r) => {
          const rAuthor = getUser(r.username);
          return `
            <div class="comment-row">
              ${renderAvatar(rAuthor)}
              <div class="post-main">
                <div class="post-author-row">
                  <span class="post-username">${rAuthor.username}</span>
                  <span class="post-time">${state.lang === "vi" ? r.timeVi : r.timeEn}</span>
                  <button class="post-more-btn" style="margin-left:auto;" onclick="openCommentSheet(${post.id}, ${c.id}, ${r.id})" aria-label="More"><i class="ph-bold ph-dots-three"></i></button>
                </div>
                <div class="post-content">${state.lang === "vi" ? r.textVi : r.textEn}</div>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="comment-block">
          <div class="comment-row">
            <div class="comment-thread-col">
              ${renderAvatar(cAuthor)}
              ${hasReplies ? `<div class="thread-line"></div>` : ""}
            </div>
            <div class="post-main">
              <div class="post-author-row">
                <span class="post-username">${cAuthor.username}</span>
                <span class="post-time">${state.lang === "vi" ? c.timeVi : c.timeEn}</span>
                <button class="post-more-btn" style="margin-left:auto;" onclick="openCommentSheet(${post.id}, ${c.id}, null)" aria-label="More"><i class="ph-bold ph-dots-three"></i></button>
              </div>
              <div class="post-content">${state.lang === "vi" ? c.textVi : c.textEn}</div>
              <button class="reply-inline-btn" onclick="startReply(${c.id})">${t("replyAction")}</button>
              ${hasReplies ? `<div class="comment-replies">${repliesHtml}</div>` : ""}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="subpage-header">
      <button class="back-btn" onclick="goHome()"><i class="ph ph-arrow-left"></i></button>
      <span class="subpage-title">${t("threadDetail")}</span>
    </div>
    ${renderPostCard(post)}
    <div class="comments-section-title">${t("replies")} · <span style="color:var(--muted); font-weight:400;">${t("tier2Hint")}</span></div>
    <div>${commentsHtml}</div>
    <form class="comment-composer-bar" onsubmit="submitComment(event, ${post.id})">
      <input id="commentInput" class="comment-input" placeholder="${
        replyTarget ? `${t("replyingTo")} @${replyTarget.username}...` : t("replyPlaceholder")
      }" required />
      <button class="btn-post-sm" type="submit">${t("postBtn")}</button>
    </form>
  `;
}

function renderProfile() {
  const u = getUser(state.selectedUsername);
  const isSelf = u.username === state.me.username;
  const userPosts = state.posts.filter((p) => p.username === u.username);

  return `
    <div class="subpage-header">
      <button class="back-btn" onclick="goHome()"><i class="ph ph-arrow-left"></i></button>
      <span class="subpage-title">@${u.username}</span>
    </div>
    <section class="profile-header">
      <div class="profile-top">
        <div>
          <h1 class="profile-name">${u.name}</h1>
          <div class="profile-handle-row">
            <span class="profile-handle">@${u.username}</span>
            ${u.role === "admin" ? `<span class="role-pill">Admin</span>` : ""}
          </div>
        </div>
        ${renderAvatar(u, true)}
      </div>
      <p class="profile-bio">${u.bio}</p>
      <div class="profile-stats">
        <span><strong>${u.followers}</strong> ${t("followers")}</span>
        <span><strong>${u.following}</strong> ${t("followingCount")}</span>
      </div>
      <div class="profile-btn-row">
        ${
          isSelf
            ? `<button class="btn-full btn-soft" onclick="showToast('${t("editProfile")}')">${t("editProfile")}</button>`
            : `<button class="btn-full ${u.followed ? "btn-outline" : "btn-solid"}" onclick="toggleFollow('${u.username}')">${u.followed ? t("followingBtn") : t("follow")}</button>`
        }
      </div>
    </section>
    ${userPosts.map(renderPostCard).join("")}
  `;
}

function renderSearchResultsHtml() {
  const q = state.searchQuery.trim().toLowerCase();
  if (!q) {
    const recents = state.recentSearches.slice(0, 3);
    if (!recents.length) return "";
    return recents
      .map((item) => {
        if (item.type === "keyword") {
          return `
            <div class="search-row" onclick="applySearchKeyword('${item.value}')">
              <div class="search-row-left">
                <div class="search-keyword-icon"><i class="ph ph-magnifying-glass"></i></div>
                <div class="search-meta">
                  <div class="search-username">${item.value}</div>
                </div>
              </div>
              <button class="search-remove" onclick="event.stopPropagation(); removeSearchItem('keyword', '${item.value}')" aria-label="Remove">
                <i class="ph ph-x"></i>
              </button>
            </div>
          `;
        }
        const u = state.users.find((x) => x.username === item.value);
        if (!u) return "";
        const sub = u.followed ? `${u.name} · ${t("followingBtn")}` : u.name;
        return `
          <div class="search-row" onclick="openProfile('${u.username}')">
            <div class="search-row-left">
              ${renderAvatar(u)}
              <div class="search-meta">
                <div class="search-username">@${u.username}</div>
                <div class="search-sub">${sub}</div>
              </div>
            </div>
            <button class="search-remove" onclick="event.stopPropagation(); removeSearchItem('user', '${u.username}')" aria-label="Remove">
              <i class="ph ph-x"></i>
            </button>
          </div>
        `;
      })
      .join("");
  }

  const userQ = q.startsWith("@") ? q.slice(1) : q;
  const matchedUsers = state.users
    .filter((u) => !u.banned && (u.username.toLowerCase().includes(userQ) || u.name.toLowerCase().includes(userQ)))
    .slice(0, 3);

  const matchedPosts = state.posts.filter((p) => {
    const text = `${p.contentVi} ${p.contentEn}`.toLowerCase();
    return text.includes(q);
  });

  if (!matchedUsers.length && !matchedPosts.length) {
    return `<div style="padding:32px 16px; text-align:center; color:var(--muted); font-size:14px;">${t("searchEmpty")}</div>`;
  }

  const usersHtml = matchedUsers
    .map((u) => {
      const sub = u.followed ? `${u.name} · ${t("followingBtn")}` : u.name;
      return `
        <div class="search-row" onclick="openProfile('${u.username}')">
          <div class="search-row-left">
            ${renderAvatar(u)}
            <div class="search-meta">
              <div class="search-username">@${u.username}</div>
              <div class="search-sub">${sub}</div>
            </div>
          </div>
          <button class="search-remove" onclick="event.stopPropagation(); clearSearchQuery()" aria-label="Clear">
            <i class="ph ph-x"></i>
          </button>
        </div>
      `;
    })
    .join("");

  const postsHtml = matchedPosts.map(renderPostCard).join("");
  return `${usersHtml}${postsHtml}`;
}

function renderSearch() {
  return `
    <div class="search-header">
      <div class="search-box">
        <i class="ph ph-magnifying-glass"></i>
        <input id="searchInput" class="search-input" value="${state.searchQuery}" placeholder="${t("searchPlaceholder")}" oninput="onSearchInput(this.value)" autofocus />
      </div>
      <button class="search-cancel" onclick="goHome()">${t("cancel")}</button>
    </div>
    <div id="searchResults" class="search-list">
      ${renderSearchResultsHtml()}
    </div>
  `;
}

function renderAdmin() {
  return `
    <div class="subpage-header">
      <button class="back-btn" onclick="goHome()"><i class="ph ph-arrow-left"></i></button>
      <span class="subpage-title">${t("adminTitle")}</span>
    </div>
    <div class="admin-banner">
      <div>
        <div style="font-size:13px; color:var(--muted);">${t("adminCap")}</div>
        <div style="font-size:20px; font-weight:700;">348 / 1.000</div>
      </div>
      <span class="cap-badge"><i class="ph-fill ph-seal-check"></i> Active</span>
    </div>
    ${state.users
      .map(
        (u) => `
      <div class="admin-user-row">
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          ${renderAvatar(u)}
          <div style="min-width:0;">
            <div style="font-weight:600; font-size:14px;">@${u.username} ${u.banned ? `<span class="role-pill" style="background:var(--red-soft); color:var(--red);">${t("bannedBadge")}</span>` : ""}</div>
            <div style="font-size:12px; color:var(--muted);">${u.name}</div>
          </div>
        </div>
        ${
          u.role !== "admin"
            ? `<button class="btn-post-sm" style="color:${u.banned ? "var(--ink)" : "var(--red)"}; border-color:${u.banned ? "var(--border)" : "var(--red)"};" onclick="toggleBan('${u.username}')">${u.banned ? t("unbanUser") : t("banUser")}</button>`
            : `<span class="role-pill">Admin</span>`
        }
      </div>
    `
      )
      .join("")}
  `;
}

function renderLogin() {
  return `
    <div class="login-screen">
      <div style="display:flex; justify-content:flex-end; gap:6px;">
        <button class="icon-pill" onclick="toggleLang()"><i class="ph ph-globe"></i><span>${state.lang.toUpperCase()}</span></button>
        <button class="icon-pill" onclick="toggleTheme()"><i class="ph ${state.theme === "dark" ? "ph-sun" : "ph-moon"}"></i></button>
      </div>
      <div class="login-center">
        <div class="login-wordmark">marjames</div>
        <button class="google-btn" onclick="goHome()">
          <i class="ph-bold ph-google-logo"></i>
          <span>${t("googleBtn")}</span>
        </button>
      </div>
      <span></span>
    </div>
  `;
}

function renderCompose() {
  const isEdit = Boolean(state.editingPostId);
  return `
    <div class="modal-top">
      <button onclick="goHome()" style="font-size:15px; text-align:left;">${t("cancel")}</button>
      <strong style="font-size:15px; text-align:center;">${isEdit ? t("editThread") : t("newThread")}</strong>
      <button onclick="publishPost()" class="btn-post-primary" style="justify-self:end;">${isEdit ? t("saveBtn") : t("postBtn")}</button>
    </div>
    <div class="modal-body">
      ${renderAvatar(state.me)}
      <div style="flex:1; min-width:0;">
        <div class="compose-username">${state.me.username}</div>
        <textarea id="composeText" rows="1" class="compose-textarea" placeholder="${t("whatsNew")}" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'">${state.composeDraftText}</textarea>
        <div id="composePreview" style="display:${state.composeImageAttached ? "block" : "none"}; margin-bottom:8px;">
          <div class="post-image-wrap compose-preview-wrap">
            <img src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80" alt="Preview" />
            <button type="button" class="compose-remove-img" onclick="toggleComposeImage()" aria-label="Remove image">
              <i class="ph-bold ph-x"></i>
            </button>
          </div>
          <span class="compress-chip"><i class="ph-fill ph-check-circle"></i> ${t("compressedHint")}</span>
        </div>
        <button type="button" class="compose-attach-btn" onclick="toggleComposeImage()" aria-label="Add image">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="5.5" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15.5l-4.2-4.2a2 2 0 0 0-2.8 0L6 19.3" />
          </svg>
        </button>
      </div>
    </div>
  `;
}

function renderNav() {
  if (state.route === "login" || state.route === "compose" || state.route === "post") return "";
  const themeLabel = state.theme === "dark" ? t("menuThemeDark") : t("menuThemeLight");
  const langLabel = state.lang === "vi" ? "Tiếng Việt" : "English";
  return `
    ${
      state.menuOpen
        ? `
        <div class="dropdown-backdrop" onclick="closeMenu()"></div>
        <div class="header-dropdown" onclick="event.stopPropagation()">
          <button class="dropdown-item" onclick="toggleTheme()">
            <span>${t("menuAppearance")}</span>
            <span class="dropdown-meta">${themeLabel} <i class="ph ph-caret-right"></i></span>
          </button>
          <button class="dropdown-item" onclick="toggleLang()">
            <span>${t("menuLanguage")}</span>
            <span class="dropdown-meta">${langLabel} <i class="ph ph-caret-right"></i></span>
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" onclick="closeMenu(); openLogin()">
            <span>${t("menuLogout")}</span>
          </button>
        </div>
      `
        : ""
    }
    <nav class="bottom-nav" aria-label="Primary">
      <button class="nav-item ${state.route === "home" ? "active" : ""}" onclick="goHome()" aria-label="Home">
        <i class="${state.route === "home" ? "ph-fill" : "ph"} ph-house-simple"></i>
      </button>
      <button class="nav-item" onclick="openComposer()" aria-label="Create">
        <span class="nav-create-box"><i class="ph ph-plus"></i></span>
      </button>
      <button class="nav-item ${state.route === "profile" ? "active" : ""}" onclick="openProfile('${state.me.username}')" aria-label="Profile">
        <i class="${state.route === "profile" ? "ph-fill" : "ph"} ph-user"></i>
      </button>
      <button class="nav-item ${state.menuOpen || state.route === "admin" ? "active" : ""}" onclick="toggleMenu(event)" aria-label="Menu">
        <i class="ph-bold ph-equals"></i>
      </button>
    </nav>
  `;
}

function render() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const app = document.getElementById("app");
  if (state.route === "login") {
    app.innerHTML = renderLogin();
    return;
  }

  let content = "";
  if (state.route === "home") content = renderHome();
  else if (state.route === "post") content = renderPostDetail();
  else if (state.route === "profile") content = renderProfile();
  else if (state.route === "admin") content = renderAdmin();
  else if (state.route === "search") content = renderSearch();
  else if (state.route === "compose") content = renderCompose();

  app.innerHTML = `
    <div class="app-shell">
      <main class="main-column">${content}</main>
      ${renderNav()}
    </div>
  `;
}


window.goHome = () => { state.route = "home"; state.replyingToCommentId = null; render(); window.scrollTo(0, 0); };
window.openPost = (id) => { state.route = "post"; state.selectedPostId = id; state.replyingToCommentId = null; render(); window.scrollTo(0, 0); };
window.openProfile = (username) => { state.route = "profile"; state.selectedUsername = username; render(); window.scrollTo(0, 0); };
window.openAdmin = () => { state.route = "admin"; render(); window.scrollTo(0, 0); };
window.openLogin = () => { state.route = "login"; render(); window.scrollTo(0, 0); };
window.openSearch = () => { state.route = "search"; state.searchQuery = ""; render(); setTimeout(() => document.getElementById("searchInput")?.focus(), 0); };
window.onSearchInput = (val) => {
  state.searchQuery = val;
  const el = document.getElementById("searchResults");
  if (el) el.innerHTML = renderSearchResultsHtml();
};
window.applySearchKeyword = (kw) => {
  state.searchQuery = kw;
  const input = document.getElementById("searchInput");
  if (input) input.value = kw;
  const el = document.getElementById("searchResults");
  if (el) el.innerHTML = renderSearchResultsHtml();
};
window.clearSearchQuery = () => {
  state.searchQuery = "";
  const input = document.getElementById("searchInput");
  if (input) { input.value = ""; input.focus(); }
  const el = document.getElementById("searchResults");
  if (el) el.innerHTML = renderSearchResultsHtml();
};
window.removeSearchItem = (type, value) => {
  state.recentSearches = state.recentSearches.filter((item) => !(item.type === type && item.value === value));
  const el = document.getElementById("searchResults");
  if (el) el.innerHTML = renderSearchResultsHtml();
};
window.setFeedTab = (tab) => { state.feedTab = tab; render(); };
window.toggleMenu = (e) => { e?.stopPropagation(); state.menuOpen = !state.menuOpen; render(); };
window.closeMenu = () => { state.menuOpen = false; render(); };
window.toggleTheme = () => { state.theme = state.theme === "dark" ? "light" : "dark"; render(); };
window.toggleLang = () => { state.lang = state.lang === "vi" ? "en" : "vi"; render(); };

window.toggleLike = (id) => {
  const p = state.posts.find((x) => x.id === id);
  if (!p) return;
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  render();
};

window.toggleFollow = (username) => {
  const u = state.users.find((x) => x.username === username);
  if (!u) return;
  u.followed = !u.followed;
  u.followers += u.followed ? 1 : -1;
  render();
};

window.toggleBan = (username) => {
  const u = state.users.find((x) => x.username === username);
  if (!u) return;
  u.banned = !u.banned;
  render();
};

window.startReply = (commentId) => {
  state.replyingToCommentId = commentId;
  render();
  document.getElementById("commentInput")?.focus();
};

window.submitComment = (e, postId) => {
  e.preventDefault();
  const input = document.getElementById("commentInput");
  const val = input.value.trim();
  if (!val) return;
  const post = state.posts.find((p) => p.id === postId);
  if (state.replyingToCommentId) {
    const parent = post.comments.find((c) => c.id === state.replyingToCommentId);
    if (parent) {
      parent.replies.push({ id: Date.now(), username: state.me.username, timeVi: "Vừa xong", timeEn: "Just now", textVi: val, textEn: val });
    }
    state.replyingToCommentId = null;
  } else {
    post.comments.push({ id: Date.now(), username: state.me.username, timeVi: "Vừa xong", timeEn: "Just now", textVi: val, textEn: val, replies: [] });
  }
  render();
};

window.openComposer = () => {
  state.route = "compose";
  state.editingPostId = null;
  state.composeDraftText = "";
  state.composeImageAttached = false;
  render();
  window.scrollTo(0, 0);
  setTimeout(() => document.getElementById("composeText")?.focus(), 0);
};

window.toggleComposeImage = () => {
  state.composeImageAttached = !state.composeImageAttached;
  const el = document.getElementById("composePreview");
  if (el) el.style.display = state.composeImageAttached ? "block" : "none";
};

window.publishPost = () => {
  const text = document.getElementById("composeText")?.value.trim() || "";
  if (!text && !state.composeImageAttached) return;
  if (state.editingPostId) {
    const target = state.posts.find((p) => p.id === state.editingPostId);
    if (target) {
      target.contentVi = text;
      target.contentEn = text;
      target.image = state.composeImageAttached
        ? (target.image || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80")
        : null;
    }
    state.editingPostId = null;
    state.route = "home";
    render();
    showToast(t("updatedToast"));
    return;
  }
  state.posts.unshift({
    id: Date.now(),
    username: state.me.username,
    timeVi: "Vừa xong",
    timeEn: "Just now",
    contentVi: text || "Ảnh mới 🧡",
    contentEn: text || "New photo 🧡",
    image: state.composeImageAttached ? "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80" : null,
    likes: 1,
    liked: true,
    comments: []
  });
  state.route = "home";
  render();
  showToast(t("postedToast"));
};

window.deleteComment = (postId, commentId) => {
  const post = state.posts.find((p) => p.id === postId);
  if (!post) return;
  post.comments = post.comments.filter((c) => c.id !== commentId);
  render();
  showToast(t("deletedCommentToast"));
};

window.deleteReply = (postId, commentId, replyId) => {
  const post = state.posts.find((p) => p.id === postId);
  const comment = post?.comments.find((c) => c.id === commentId);
  if (!comment) return;
  comment.replies = comment.replies.filter((r) => r.id !== replyId);
  render();
  showToast(t("deletedCommentToast"));
};

window.openMoreSheet = (postId) => {
  state.actionTargetPostId = postId;
  state.actionTargetComment = null;
  const post = state.posts.find((p) => p.id === postId);
  const isOwner = post && post.username === state.me.username;
  document.getElementById("sheetEditBtn").style.display = isOwner ? "flex" : "none";
  document.getElementById("sheetDeleteBtn").style.display = isOwner ? "flex" : "none";
  document.getElementById("sheetReportBtn").style.display = isOwner ? "none" : "flex";
  document.getElementById("sheetEditLabel").textContent = t("editPost");
  document.getElementById("sheetDeleteLabel").textContent = t("deletePost");
  document.getElementById("sheetReportLabel").textContent = t("reportPost");
  document.getElementById("sheetCloseLabel").textContent = t("close");
  document.getElementById("moreSheet").classList.add("open");
};

window.openCommentSheet = (postId, commentId, replyId) => {
  state.actionTargetPostId = null;
  state.actionTargetComment = { postId, commentId, replyId };
  const post = state.posts.find((p) => p.id === postId);
  const comment = post?.comments.find((c) => c.id === commentId);
  const reply = replyId ? comment?.replies.find((r) => r.id === replyId) : null;
  const author = reply ? reply.username : comment?.username;
  const canDelete = Boolean(post && (post.username === state.me.username || author === state.me.username));
  document.getElementById("sheetEditBtn").style.display = "none";
  document.getElementById("sheetDeleteBtn").style.display = canDelete ? "flex" : "none";
  document.getElementById("sheetReportBtn").style.display = canDelete ? "none" : "flex";
  document.getElementById("sheetDeleteLabel").textContent = t("deleteCommentBtn");
  document.getElementById("sheetReportLabel").textContent = t("reportComment");
  document.getElementById("sheetCloseLabel").textContent = t("close");
  document.getElementById("moreSheet").classList.add("open");
};

window.editTargetPost = () => {
  const post = state.posts.find((p) => p.id === state.actionTargetPostId);
  closeMoreSheet();
  if (!post) return;
  state.editingPostId = post.id;
  state.composeDraftText = state.lang === "vi" ? post.contentVi : post.contentEn;
  state.composeImageAttached = Boolean(post.image);
  state.route = "compose";
  render();
  window.scrollTo(0, 0);
  setTimeout(() => {
    const ta = document.getElementById("composeText");
    if (ta) { ta.style.height = "auto"; ta.style.height = `${ta.scrollHeight}px`; ta.focus(); }
  }, 0);
};

window.closeMoreSheet = () => document.getElementById("moreSheet").classList.remove("open");

window.deleteTargetPost = () => {
  if (state.actionTargetComment) {
    const { postId, commentId, replyId } = state.actionTargetComment;
    state.actionTargetComment = null;
    closeMoreSheet();
    if (replyId) deleteReply(postId, commentId, replyId);
    else deleteComment(postId, commentId);
    return;
  }
  state.posts = state.posts.filter((p) => p.id !== state.actionTargetPostId);
  closeMoreSheet();
  if (state.route === "post") state.route = "home";
  render();
  showToast(t("deletedToast"));
};

window.reportTargetPost = () => {
  state.actionTargetComment = null;
  state.actionTargetPostId = null;
  closeMoreSheet();
  showToast(t("reportedToast"));
};

if (window.location.hash.startsWith("#post-")) {
  const targetId = Number(window.location.hash.replace("#post-", ""));
  if (targetId) { state.route = "post"; state.selectedPostId = targetId; }
}

render();
