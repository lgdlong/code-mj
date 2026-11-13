const ADMIN_I18N = {
  vi: {
    desktopOnlyTitle: "Chỉ hỗ trợ trên máy tính",
    desktopOnlyDesc: "Trang quản trị marjames chỉ hiển thị ở độ rộng màn hình ≥ 1024px.",
    overview: "Tổng quan",
    posts: "Quản lý bài viết",
    comments: "Quản lý bình luận",
    users: "Quản lý người dùng",
    backToApp: "Về trang chủ",
    searchPlaceholder: "Tìm theo @username hoặc nội dung...",
    statUsers: "Thành viên (trần 1.000)",
    statPosts: "Tổng bài viết",
    statComments: "Tổng bình luận",
    statBanned: "Tài khoản bị khóa",
    colAuthor: "Tác giả",
    colContent: "Nội dung",
    colStats: "Tương tác",
    colTime: "Thời gian",
    colAction: "Hành động",
    colTier: "Cấp độ",
    colRole: "Vai trò",
    colStatus: "Trạng thái",
    deleteBtn: "Xóa",
    banBtn: "Khóa",
    unbanBtn: "Mở khóa",
    activeStatus: "Hoạt động",
    bannedStatus: "Đã khóa",
    tier1: "Tầng 1",
    tier2: "Trả lời (Tầng 2)",
    dailyTitle: "Thống kê 5 ngày gần nhất",
    colDate: "Ngày",
    colNewPosts: "Bài mới",
    colNewComments: "Bình luận mới",
    colNewLikes: "Tim mới",
    colNewUsers: "Thành viên mới",
    colPost: "Bài viết gốc",
    statLikes: "Tổng lượt thả tim",
    statMediaRatio: "Bài viết có ảnh",
    statStorage: "Cloudinary (ước tính)",
    statActive7d: "Hoạt động 7 ngày",
    topPostsTitle: "Top bài viết tương tác cao",
    viewPost: "Xem bài",
    reports: "Quản lý báo cáo",
    reportTypePost: "Bài viết",
    reportTypeComment: "Bình luận",
    colReporter: "Người báo cáo",
    colTarget: "Nội dung bị báo cáo",
    colReason: "Lý do",
    statusPending: "Chờ xử lý",
    statusResolved: "Đã xử lý",
    statusDismissed: "Đã bỏ qua",
    resolveDelete: "Xóa nội dung",
    resolveBan: "Khóa user",
    dismissBtn: "Bỏ qua",
    empty: "Không có dữ liệu phù hợp."
  },
  en: {
    desktopOnlyTitle: "Desktop Only",
    desktopOnlyDesc: "marjames Admin requires a desktop viewport (≥ 1024px).",
    overview: "Overview",
    posts: "Posts",
    comments: "Comments",
    users: "Users",
    backToApp: "Back to App",
    searchPlaceholder: "Search @username or content...",
    statUsers: "Members (1,000 cap)",
    statPosts: "Total Posts",
    statComments: "Total Comments",
    statBanned: "Banned Accounts",
    colAuthor: "Author",
    colContent: "Content",
    colStats: "Engagement",
    colTime: "Time",
    colAction: "Action",
    colTier: "Tier",
    colRole: "Role",
    colStatus: "Status",
    deleteBtn: "Delete",
    banBtn: "Ban",
    unbanBtn: "Unban",
    activeStatus: "Active",
    bannedStatus: "Banned",
    tier1: "Tier 1",
    tier2: "Reply (Tier 2)",
    dailyTitle: "Last 5 Days Activity",
    colDate: "Date",
    colNewPosts: "New Posts",
    colNewComments: "New Comments",
    colNewLikes: "New Likes",
    colNewUsers: "New Members",
    colPost: "Parent Post",
    statLikes: "Total Likes",
    statMediaRatio: "Posts with Image",
    statStorage: "Cloudinary (est.)",
    statActive7d: "7-Day Active",
    topPostsTitle: "Top Engaged Posts",
    viewPost: "View post",
    reports: "Reports",
    reportTypePost: "Post",
    reportTypeComment: "Comment",
    colReporter: "Reporter",
    colTarget: "Reported Content",
    colReason: "Reason",
    statusPending: "Pending",
    statusResolved: "Resolved",
    statusDismissed: "Dismissed",
    resolveDelete: "Delete content",
    resolveBan: "Ban user",
    dismissBtn: "Dismiss",
    empty: "No matching records."
  }
};

const adminState = {
  lang: "vi",
  theme: "dark",
  tab: "overview", // overview | posts | comments | users
  query: "",
  dailyStats: [
    { date: "14/11", posts: 24, comments: 96, likes: 312, users: 11 },
    { date: "13/11", posts: 31, comments: 118, likes: 405, users: 14 },
    { date: "12/11", posts: 19, comments: 74, likes: 228, users: 8 },
    { date: "11/11", posts: 28, comments: 105, likes: 360, users: 19 },
    { date: "10/11", posts: 22, comments: 88, likes: 279, users: 12 }
  ],
  users: [
    { id: 1, username: "cortis_minh", name: "Minh Cortis", role: "admin", posts: 42, banned: false },
    { id: 2, username: "linh.bias", name: "Linh", role: "user", posts: 18, banned: false },
    { id: 3, username: "huy_cam", name: "Huy Fancam", role: "user", posts: 27, banned: false },
    { id: 4, username: "ban_fan", name: "Bạn (Fan #348)", role: "user", posts: 3, banned: false },
    { id: 5, username: "spam_bot99", name: "Spammer", role: "user", posts: 1, banned: true }
  ],
  posts: [
    { id: 101, username: "cortis_minh", content: "Ảnh rehearsal hôm nay của Cortis nét căng luôn mọi người ơi!!", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=70", likes: 162, comments: 3, time: "12 phút trước" },
    { id: 102, username: "linh.bias", content: "Mới unbox xong album bản limited, trúng ngay bias luôn.", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=70", likes: 76, comments: 1, time: "1 giờ trước" },
    { id: 103, username: "huy_cam", content: "Mọi người nhớ tắt flash khi quay sân khấu tối nay nha.", image: null, likes: 119, comments: 0, time: "3 giờ trước" },
    { id: 104, username: "spam_bot99", content: "Click link nhận vé miễn phí ngay...", image: null, likes: 0, comments: 0, time: "5 giờ trước" }
  ],
  comments: [
    { id: 201, postId: 101, username: "linh.bias", content: "Trời ơi visual đỉnh quá, mình đăng ký 2 slot offline rồi!", tier: 1, time: "8 phút trước" },
    { id: 202, postId: 101, username: "cortis_minh", content: "Hẹn gặp bạn ở cổng B lúc 14h nha!", tier: 2, time: "5 phút trước" },
    { id: 203, postId: 101, username: "huy_cam", content: "Ảnh nén lên web vẫn giữ được độ nét ghê.", tier: 1, time: "3 phút trước" },
    { id: 204, postId: 102, username: "ban_fan", content: "Xin vía!!", tier: 1, time: "40 phút trước" }
  ],
  reports: [
    { id: 301, type: "post", targetId: 104, postId: 104, targetAuthor: "spam_bot99", reporter: "linh.bias", content: "Click link nhận vé miễn phí ngay...", reason: "Spam / lừa đảo", status: "pending", time: "10 phút trước" },
    { id: 302, type: "comment", targetId: 204, postId: 102, targetAuthor: "ban_fan", reporter: "huy_cam", content: "Xin vía!!", reason: "Bình luận không phù hợp", status: "pending", time: "25 phút trước" }
  ]
};

const at = (k) => ADMIN_I18N[adminState.lang][k] || k;

function renderOverview() {
  const totalUsers = 348;
  const bannedCount = adminState.users.filter((u) => u.banned).length;
  const pct = Math.round((totalUsers / 1000) * 100);
  const imgPosts = adminState.posts.filter((p) => p.image).length;
  const imgPct = adminState.posts.length ? Math.round((imgPosts / adminState.posts.length) * 100) : 0;
  const topPosts = [...adminState.posts].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments)).slice(0, 3);

  return `
    <h1 class="page-title">${at("overview")}</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label"><span>${at("statUsers")}</span><i class="ph ph-users"></i></div>
        <div class="stat-value">${totalUsers} / 1.000</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>${at("statPosts")}</span><i class="ph ph-article"></i></div>
        <div class="stat-value">${adminState.posts.length + 1280}</div>
        <div class="stat-sub">+24 hôm nay</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>${at("statComments")}</span><i class="ph ph-chat-circle"></i></div>
        <div class="stat-value">${adminState.comments.length + 4908}</div>
        <div class="stat-sub">+96 hôm nay</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>${at("statBanned")}</span><i class="ph ph-prohibit"></i></div>
        <div class="stat-value" style="color:var(--red);">${bannedCount}</div>
        <div class="stat-sub">Spam / vi phạm</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>${at("statLikes")}</span><i class="ph ph-heart"></i></div>
        <div class="stat-value">18.420</div>
        <div class="stat-sub">+312 hôm nay</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>${at("statMediaRatio")}</span><i class="ph ph-image"></i></div>
        <div class="stat-value">${imgPct}%</div>
        <div class="stat-sub">${imgPosts} / ${adminState.posts.length} bài mẫu</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>${at("statStorage")}</span><i class="ph ph-cloud"></i></div>
        <div class="stat-value">184 MB</div>
        <div class="progress-bar"><div class="progress-fill" style="width:4%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span>${at("statActive7d")}</span><i class="ph ph-pulse"></i></div>
        <div class="stat-value">289</div>
        <div class="stat-sub">83% thành viên</div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-head-bar"><span>${at("dailyTitle")}</span></div>
      <table>
        <thead>
          <tr>
            <th>${at("colDate")}</th>
            <th>${at("colNewPosts")}</th>
            <th>${at("colNewComments")}</th>
            <th>${at("colNewLikes")}</th>
            <th>${at("colNewUsers")}</th>
          </tr>
        </thead>
        <tbody>
          ${adminState.dailyStats
            .map(
              (d) => `
            <tr>
              <td><strong>${d.date}</strong></td>
              <td>${d.posts}</td>
              <td>${d.comments}</td>
              <td>${d.likes}</td>
              <td>+${d.users}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="table-card">
      <div class="table-head-bar"><span>${at("topPostsTitle")}</span></div>
      <table>
        <thead>
          <tr>
            <th>${at("colAuthor")}</th>
            <th>${at("colContent")}</th>
            <th>${at("colStats")}</th>
            <th>${at("colAction")}</th>
          </tr>
        </thead>
        <tbody>
          ${topPosts
            .map(
              (p) => `
            <tr>
              <td><strong>@${p.username}</strong></td>
              <td style="max-width:440px;">${p.content}</td>
              <td><i class="ph ph-heart"></i> ${p.likes} · <i class="ph ph-chat-circle"></i> ${p.comments}</td>
              <td>
                <a class="btn-action btn-neutral" href="./index.html#post-${p.id}" target="_blank">
                  <i class="ph ph-arrow-square-out"></i> ${at("viewPost")}
                </a>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPostsTable() {
  const q = adminState.query.trim().toLowerCase();
  const rows = adminState.posts.filter(
    (p) => p.username.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
  );
  return `
    <h1 class="page-title">${at("posts")} (${rows.length})</h1>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>${at("colAuthor")}</th>
            <th>${at("colContent")}</th>
            <th>${at("colStats")}</th>
            <th>${at("colTime")}</th>
            <th>${at("colAction")}</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map(
                    (p) => `
              <tr>
                <td><strong>@${p.username}</strong></td>
                <td>
                  <div style="display:flex; align-items:center; gap:10px; max-width:440px;">
                    ${p.image ? `<img class="thumb" src="${p.image}" alt="" />` : ""}
                    <span>${p.content}</span>
                  </div>
                </td>
                <td><i class="ph ph-heart"></i> ${p.likes} · <i class="ph ph-chat-circle"></i> ${p.comments}</td>
                <td style="color:var(--muted);">${p.time}</td>
                <td>
                  <button class="btn-action btn-danger" onclick="adminDeletePost(${p.id})">
                    <i class="ph ph-trash"></i> ${at("deleteBtn")}
                  </button>
                </td>
              </tr>
            `
                  )
                  .join("")
              : `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:28px;">${at("empty")}</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderCommentsTable() {
  const q = adminState.query.trim().toLowerCase();
  const rows = adminState.comments.filter(
    (c) => c.username.toLowerCase().includes(q) || c.content.toLowerCase().includes(q)
  );
  return `
    <h1 class="page-title">${at("comments")} (${rows.length})</h1>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>${at("colAuthor")}</th>
            <th>${at("colContent")}</th>
            <th>${at("colPost")}</th>
            <th>${at("colTier")}</th>
            <th>${at("colTime")}</th>
            <th>${at("colAction")}</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map((c) => {
                    const parentPost = adminState.posts.find((p) => p.id === c.postId);
                    const postLabel = parentPost
                      ? `#${parentPost.id} · ${parentPost.content.slice(0, 32)}…`
                      : `#${c.postId}`;
                    return `
              <tr>
                <td><strong>@${c.username}</strong></td>
                <td style="max-width:340px;">${c.content}</td>
                <td>
                  <a class="btn-action btn-neutral" href="./index.html#post-${c.postId}" target="_blank" title="${at("viewPost")}">
                    <i class="ph ph-arrow-square-out"></i> ${postLabel}
                  </a>
                </td>
                <td><span class="badge badge-neutral">${c.tier === 1 ? at("tier1") : at("tier2")}</span></td>
                <td style="color:var(--muted);">${c.time}</td>
                <td>
                  <button class="btn-action btn-danger" onclick="adminDeleteComment(${c.id})">
                    <i class="ph ph-trash"></i> ${at("deleteBtn")}
                  </button>
                </td>
              </tr>
            `;
                  })
                  .join("")
              : `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:28px;">${at("empty")}</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderUsersTable() {
  const q = adminState.query.trim().toLowerCase();
  const rows = adminState.users.filter(
    (u) => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
  );
  return `
    <h1 class="page-title">${at("users")} (${rows.length})</h1>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>${at("colAuthor")}</th>
            <th>${at("colRole")}</th>
            <th>${at("posts")}</th>
            <th>${at("colStatus")}</th>
            <th>${at("colAction")}</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map(
                    (u) => `
              <tr>
                <td>
                  <div><strong>@${u.username}</strong></div>
                  <div style="font-size:12px; color:var(--muted);">${u.name}</div>
                </td>
                <td><span class="badge badge-neutral">${u.role}</span></td>
                <td>${u.posts}</td>
                <td>
                  <span class="badge ${u.banned ? "badge-red" : "badge-green"}">
                    ${u.banned ? at("bannedStatus") : at("activeStatus")}
                  </span>
                </td>
                <td>
                  ${
                    u.role !== "admin"
                      ? `<button class="btn-action ${u.banned ? "btn-neutral" : "btn-danger"}" onclick="adminToggleBan(${u.id})">
                          ${u.banned ? at("unbanBtn") : at("banBtn")}
                        </button>`
                      : `<span style="color:var(--muted); font-size:12px;">—</span>`
                  }
                </td>
              </tr>
            `
                  )
                  .join("")
              : `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:28px;">${at("empty")}</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}
function renderReportsTable() {
  const q = adminState.query.trim().toLowerCase();
  const rows = adminState.reports.filter(
    (r) =>
      r.targetAuthor.toLowerCase().includes(q) ||
      r.reporter.toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q)
  );
  return `
    <h1 class="page-title">${at("reports")} (${rows.length})</h1>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>${at("colTarget")}</th>
            <th>${at("colReporter")}</th>
            <th>${at("colReason")}</th>
            <th>${at("colStatus")}</th>
            <th>${at("colAction")}</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map((r) => {
                    const badgeCls =
                      r.status === "pending" ? "badge-red" : r.status === "resolved" ? "badge-green" : "badge-neutral";
                    const statusText =
                      r.status === "pending"
                        ? at("statusPending")
                        : r.status === "resolved"
                        ? at("statusResolved")
                        : at("statusDismissed");
                    return `
              <tr>
                <td style="max-width:340px;">
                  <div style="display:flex; gap:6px; align-items:center; margin-bottom:4px;">
                    <span class="badge badge-neutral">${r.type === "post" ? at("reportTypePost") : at("reportTypeComment")}</span>
                    <strong>@${r.targetAuthor}</strong>
                    <span style="color:var(--muted); font-size:12px;">· ${r.time}</span>
                  </div>
                  <div style="font-size:13px;">${r.content}</div>
                </td>
                <td>@${r.reporter}</td>
                <td>${r.reason}</td>
                <td><span class="badge ${badgeCls}">${statusText}</span></td>
                <td>
                  <div style="display:flex; gap:6px; flex-wrap:wrap;">
                    <a class="btn-action btn-neutral" href="./index.html#post-${r.postId}" target="_blank">
                      <i class="ph ph-arrow-square-out"></i> ${at("viewPost")}
                    </a>
                    ${
                      r.status === "pending"
                        ? `
                      <button class="btn-action btn-danger" onclick="adminResolveReport(${r.id}, 'delete')">
                        <i class="ph ph-trash"></i> ${at("resolveDelete")}
                      </button>
                      <button class="btn-action btn-danger" onclick="adminResolveReport(${r.id}, 'ban')">
                        <i class="ph ph-prohibit"></i> ${at("resolveBan")}
                      </button>
                      <button class="btn-action btn-neutral" onclick="adminResolveReport(${r.id}, 'dismiss')">
                        ${at("dismissBtn")}
                      </button>
                    `
                        : ""
                    }
                  </div>
                </td>
              </tr>
            `;
                  })
                  .join("")
              : `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:28px;">${at("empty")}</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminApp() {
  document.documentElement.setAttribute("data-theme", adminState.theme);
  const pendingReports = adminState.reports.filter((r) => r.status === "pending").length;
  let bodyHtml = "";
  if (adminState.tab === "overview") bodyHtml = renderOverview();
  else if (adminState.tab === "posts") bodyHtml = renderPostsTable();
  else if (adminState.tab === "comments") bodyHtml = renderCommentsTable();
  else if (adminState.tab === "reports") bodyHtml = renderReportsTable();
  else if (adminState.tab === "users") bodyHtml = renderUsersTable();
  document.getElementById("adminApp").innerHTML = `
    <div class="mobile-blocker">
      <i class="ph ph-desktop" style="font-size:40px; color:var(--muted);"></i>
      <h2>${at("desktopOnlyTitle")}</h2>
      <p style="color:var(--muted); max-width:300px;">${at("desktopOnlyDesc")}</p>
    </div>

    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <strong>marjames</strong>
          <span>Admin</span>
        </div>
        <nav class="sidebar-nav">
          <button class="side-btn ${adminState.tab === "overview" ? "active" : ""}" onclick="setAdminTab('overview')">
            <i class="ph ph-chart-bar"></i> ${at("overview")}
          </button>
          <button class="side-btn ${adminState.tab === "posts" ? "active" : ""}" onclick="setAdminTab('posts')">
            <i class="ph ph-article"></i> ${at("posts")}
          </button>
          <button class="side-btn ${adminState.tab === "comments" ? "active" : ""}" onclick="setAdminTab('comments')">
            <i class="ph ph-chat-circle"></i> ${at("comments")}
          </button>
          <button class="side-btn ${adminState.tab === "reports" ? "active" : ""}" onclick="setAdminTab('reports')">
            <i class="ph ph-flag"></i> ${at("reports")}
            ${pendingReports ? `<span class="badge badge-red" style="margin-left:auto;">${pendingReports}</span>` : ""}
          </button>
          <button class="side-btn ${adminState.tab === "users" ? "active" : ""}" onclick="setAdminTab('users')">
            <i class="ph ph-users"></i> ${at("users")}
          </button>
        </nav>
        <a href="./index.html" class="side-btn">
          <i class="ph ph-arrow-left"></i> ${at("backToApp")}
        </a>
      </aside>

      <div class="main-area">
        <header class="topbar">
          <div class="search-wrap">
            <i class="ph ph-magnifying-glass"></i>
            <input id="adminSearchInput" value="${adminState.query}" placeholder="${at("searchPlaceholder")}" oninput="onAdminSearch(this.value)" />
          </div>
          <div class="topbar-actions">
            <button class="pill-btn" onclick="toggleAdminLang()">
              <i class="ph ph-globe"></i> ${adminState.lang.toUpperCase()}
            </button>
            <button class="pill-btn" onclick="toggleAdminTheme()">
              <i class="ph ${adminState.theme === "dark" ? "ph-sun" : "ph-moon"}"></i>
            </button>
          </div>
        </header>
        <main id="adminBody" class="content">${bodyHtml}</main>
      </div>
    </div>
  `;
}

window.setAdminTab = (tab) => { adminState.tab = tab; adminState.query = ""; renderAdminApp(); };
window.toggleAdminTheme = () => { adminState.theme = adminState.theme === "dark" ? "light" : "dark"; renderAdminApp(); };
window.toggleAdminLang = () => { adminState.lang = adminState.lang === "vi" ? "en" : "vi"; renderAdminApp(); };
window.onAdminSearch = (val) => {
  adminState.query = val;
  const el = document.getElementById("adminBody");
  if (!el) return;
  if (adminState.tab === "posts") el.innerHTML = renderPostsTable();
  else if (adminState.tab === "comments") el.innerHTML = renderCommentsTable();
  else if (adminState.tab === "reports") el.innerHTML = renderReportsTable();
  else if (adminState.tab === "users") el.innerHTML = renderUsersTable();
};
window.adminDeletePost = (id) => {
  adminState.posts = adminState.posts.filter((p) => p.id !== id);
  adminState.comments = adminState.comments.filter((c) => c.postId !== id);
  renderAdminApp();
};
window.adminDeleteComment = (id) => {
  adminState.comments = adminState.comments.filter((c) => c.id !== id);
  renderAdminApp();
};
window.adminToggleBan = (id) => {
  const u = adminState.users.find((x) => x.id === id);
  if (u) u.banned = !u.banned;
  renderAdminApp();
};
window.adminResolveReport = (reportId, action) => {
  const r = adminState.reports.find((x) => x.id === reportId);
  if (!r) return;
  if (action === "delete") {
    if (r.type === "post") {
      adminState.posts = adminState.posts.filter((p) => p.id !== r.targetId);
      adminState.comments = adminState.comments.filter((c) => c.postId !== r.targetId);
    } else {
      adminState.comments = adminState.comments.filter((c) => c.id !== r.targetId);
    }
    r.status = "resolved";
  } else if (action === "ban") {
    const u = adminState.users.find((x) => x.username === r.targetAuthor);
    if (u) u.banned = true;
    r.status = "resolved";
  } else if (action === "dismiss") {
    r.status = "dismissed";
  }
  renderAdminApp();
};
renderAdminApp();
