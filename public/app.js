const paths = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  news: "M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h3 M14 15h2 M8 18h3 M14 18h2",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.9 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M3 12h18 M12 3c-5 5-5 13 0 18 M12 3c5 5 5 13 0 18",
  bolt: "M13 2 4 14h7l-1 8 10-12h-7z",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3l-1 3-3 1-2 3 2 2v3l3 1 1 3h4l1-3 3-1 2-3-2-2V7l-3-1-1-3z",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  plus: "M12 5v14 M5 12h14",
  refresh: "M20 7v5h-5 M4 17v-5h5 M6 6a8 8 0 0 1 14 6 M18 18a8 8 0 0 1-14-6",
  send: "m22 2-7 20-4-9-9-4z M22 2 11 13",
  check: "m5 12 4 4L19 6",
  double: "m2 12 4 4L16 6 M10 15l2 2L22 7",
  arrow: "M5 12h14 m-5-5 5 5-5 5",
  external: "M14 3h7v7 M10 14 21 3 M10 3H3v18h18v-7",
  calendar: "M4 5h16v16H4z M16 3v4 M8 3v4 M4 10h16 M8 14h2 M14 14h2 M8 17h2",
  image: "M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 5 M16 7h.01",
  video: "M3 5h12v14H3z m12 5 6-3v10l-6-3",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
  help: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4 M12 17h.01",
  logout: "M9 3H3v18h6 M8 12h13 m-4-4 4 4-4 4",
  link: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2",
  shield: "M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7z m-4 9 3 3 5-5",
  search: "M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0 m-2 6 6 6",
  qr: "M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h2v2h4v4h-6v-2 M3 12h6 M12 3v6 M12 12h3 M18 12h3 M12 18v3",
  robot:
    "M5 7h14v13H5z M9 3h6 M12 3v4 M8 12h1 M15 12h1 M9 16h6 M2 11v5 M22 11v5",
  bridge: "M3 20V7 M21 20V7 M3 13c5-9 13-9 18 0 M3 16h18 M8 11v5 M16 11v5",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  trash: "M3 6h18 M5 6l1 15h12l1-15 M9 6V3h6v3 M10 10v7 M14 10v7",
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.news}"/></svg>`;
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const safeLink = (url) => {
  try {
    const u = new URL(url);
    return ["https:", "http:"].includes(u.protocol) ? esc(u.href) : "#";
  } catch {
    return "#";
  }
};
const photos = {
  trade:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
  research:
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=85",
  education:
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85",
  culture:
    "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=85",
  robotics:
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=85",
  technology:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85",
};
const samples = {
  indo: [
    {
      id: "sample1",
      title: "Building stronger business bridges between India and Germany",
      summary:
        "Explore bilateral trade, new partnerships, and opportunities for businesses in both countries.",
      source: "Indo-German Chamber of Commerce",
      category: "Trade",
      media: photos.trade,
      url: "https://indien.ahk.de/",
      status: "example",
    },
    {
      id: "sample2",
      title: "A shared future, powered by research and innovation",
      summary:
        "Follow collaborations connecting Indian and German researchers across science and technology.",
      source: "Research in Germany",
      category: "Research",
      media: photos.research,
      url: "https://www.research-in-germany.org/",
      status: "example",
    },
    {
      id: "sample3",
      title: "Opening doors to education in Germany",
      summary:
        "Discover student exchanges, scholarship opportunities, and university partnerships.",
      source: "DAAD India",
      category: "Education",
      media: photos.education,
      url: "https://www.daad.in/en/",
      status: "example",
    },
    {
      id: "sample4",
      title: "Where cultures meet and ideas come alive",
      summary:
        "Stay close to exhibitions, film screenings, and cultural exchanges across India.",
      source: "Goethe-Institut India",
      category: "Culture & arts",
      media: photos.culture,
      url: "https://www.goethe.de/ins/in/en/index.html",
      status: "example",
    },
  ],
  robotics: [
    {
      id: "sample5",
      title: "The next chapter of human–robot collaboration",
      summary:
        "Follow advances in collaborative robots, industrial automation, and intelligent machines.",
      source: "IEEE Spectrum",
      category: "Robotics",
      media: photos.robotics,
      url: "https://spectrum.ieee.org/topic/robotics/",
      status: "example",
    },
    {
      id: "sample6",
      title: "Small chips. Bigger possibilities.",
      summary:
        "Track the technology powering smarter systems, connected devices, and the next wave of innovation.",
      source: "Technology newsroom",
      category: "Technology",
      media: photos.technology,
      url: "https://spectrum.ieee.org/",
      status: "example",
    },
  ],
};
let state,
  active = localStorage.getItem("bridge-bot") || "indo",
  page = "overview",
  filter = "All",
  modal = null,
  previewId = null,
  working = false;
const $ = (s) => document.querySelector(s),
  b = () => state.bots.find((x) => x.id === active),
  session = () => state.sessions[active],
  news = () =>
    state.news
      .filter((x) => x.bot === active)
      .sort(
        (a, b) =>
          Date.parse(b.published || b.created) -
          Date.parse(a.published || a.created),
      ),
  sources = () => state.sources.filter((x) => x.bot === active),
  groups = () => session().groups;
const date = (s) =>
  new Date(s).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
// Same date rules as the server (lib.js): India-time day of publish/collection.
const indiaDay = (d = new Date()) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
  matchesDate = (n) =>
    b().dateFilter === "all" ||
    indiaDay(n.published || n.created) ===
      (b().dateFilter === "date" ? b().filterDate : indiaDay());
const time = (s) =>
  new Date(s).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(
    () => $("#toast").classList.remove("show"),
    5000,
  );
}
async function api(url, data, method = "POST") {
  const r = await fetch("/api/" + url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const result = await r.json();
  if (!r.ok) throw Error(result.error || "Request failed");
  return result;
}
// Changes when any story gains a photo, so polling can redraw the cards.
const mediaSignature = () =>
  state.news.map((n) => n.id + (n.media || "")).join();
let renderedMedia = "";
async function load(renderPage = true) {
  const r = await fetch("/api/state");
  state = await r.json();
  if (!b()) active = "indo";
  if (renderPage) render();
}
const navItems = [
  ["overview", "grid", "Overview"],
  ["news", "news", "News queue"],
  ["groups", "users", "WhatsApp groups"],
  ["sources", "globe", "Sources"],
  ["automation", "bolt", "Automation"],
  ["activity", "clock", "Activity log"],
];
function render() {
  const bot = b(),
    s = session();
  $("#app").innerHTML =
    `<div class="shell"><aside class="sidebar"><a class="brand" href="#" data-page="overview"><span class="brand-mark">${icon("bridge")}</span>bridge<span class="brand-dot">.</span></a><div class="workspace-label">YOUR BOTS</div><div class="bot-picker"><div class="bot-icon">${active === "indo" ? "🇮🇳" : icon("robot")}</div><div><strong>${esc(bot.name)}</strong><small>${active === "indo" ? "India × Germany" : "Innovation, delivered"}</small></div>${icon("down")}<select id="bot-select" aria-label="Select bot"><option value="indo" ${active === "indo" ? "selected" : ""}>Indo–German</option><option value="robotics" ${active === "robotics" ? "selected" : ""}>Robotics & Tech</option></select></div><nav class="nav">${navItems.map(([id, i, label]) => `<button data-page="${id}" class="${page === id ? "active" : ""}">${icon(i)}${label}${id === "news" ? `<span class="count">${news().filter((n) => n.status === "draft" || n.status === "approved").length}</span>` : ""}</button>`).join("")}<div class="nav-divider"></div><button data-page="settings" class="${page === "settings" ? "active" : ""}">${icon("settings")}Settings</button><button data-action="help">${icon("help")}Help & getting started</button></nav><div class="sidebar-bottom"><div class="connection-mini"><div class="status-line"><span class="dot ${s.status === "connected" ? "online" : ""}"></span>WhatsApp ${s.status === "connected" ? "connected" : "not connected"}</div><p>${s.status === "connected" ? "Your bot is ready to reach your communities." : "Link your account to start delivering news to your groups."}</p><button data-action="connect">${icon(s.status === "connected" ? "check" : "qr")}${s.status === "connected" ? "Manage connection" : "Connect WhatsApp"}${icon("arrow")}</button></div><div class="user"><div class="avatar">BW</div><div><strong>My workspace</strong><small>Local installation</small></div>${icon("settings")}</div></div></aside><main class="main"><header class="topbar"><div class="breadcrumbs"><button class="mobile-menu" data-action="mobile">${icon("menu")}</button>${esc(bot.name)}${icon("chevron")}<strong>${navItems.find((n) => n[0] === page)?.[2] || "Settings"}</strong></div><div class="topbar-right"><span class="local-badge"><span class="dot online"></span>Local workspace</span><button data-page="activity" aria-label="View activity">${icon("bell")}</button><div class="avatar">BW</div></div></header><div class="content">${pageContent()}<footer><span>${icon("bridge")}Bringing communities closer, one update at a time.</span><span>Made for meaningful connections<span style="color:#819b68">✳</span></span></footer></div></main></div>`;
  renderedMedia = mediaSignature();
  bind();
}
function heading(title, subtitle, actions = "") {
  return `<div class="heading"><div><div class="eyebrow">${active === "indo" ? "THE INDO–GERMAN CONNECTION" : "THE FUTURE, IN YOUR FEED"}</div><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
}
const actionButton = (label, action, i = "plus", primary = false) =>
  `<button class="btn ${primary ? "primary" : ""}" data-action="${action}">${icon(i)}${label}</button>`;
function pageContent() {
  if (page === "overview") return overview();
  if (page === "news")
    return (
      heading(
        "Your news, ready to travel.",
        "Review, approve, and send concise updates to your communities.",
        actionButton("Import story", "story") +
          actionButton("Send approved", "send", "send", true),
      ) +
      `<div class="notice">Only approved stories in enabled categories are sent. Each delivery includes the source link; events include a calendar file when dates are provided.</div>${filterBar()}<div class="stories">${storyList(false)}</div>`
    );
  if (page === "groups")
    return (
      heading(
        "The right news. The right people.",
        "Choose the WhatsApp groups this bot will send to.",
        actionButton("Connect WhatsApp", "connect", "qr", true),
      ) +
      `<div class="notice">Group selections are saved separately for each bot. Connect your WhatsApp account to load your real groups.</div><div class="list-grid">${
        groups().length
          ? groups()
              .map(
                (g) =>
                  `<label class="group-select-card"><span class="source-logo">${icon("users")}</span><div><h3>${esc(g.name)}</h3><p>${g.members} members</p></div><input type="checkbox" data-group="${esc(g.id)}" ${b().selectedGroups.includes(g.id) ? "checked" : ""}></label>`,
              )
              .join("")
          : session().groupsError
            ? `<div class="empty">${icon("shield")}${esc(session().groupsError)}<br>${actionButton("Retry loading groups", "reload-groups", "refresh", true)}</div>`
            : session().groupsLoading
              ? `<div class="empty">${icon("refresh", "progress-spin")}Loading your WhatsApp groups…</div>`
              : `<div class="empty">${icon("users")}Your communities will appear here after QR pairing.<br>${actionButton("Link your WhatsApp", "connect", "qr", true)}</div>`
      }</div>`
    );
  if (page === "sources")
    return (
      heading(
        "Good news starts at the source.",
        active === "robotics"
          ? "Industry news collected from LinkedIn company pages only."
          : "Follow official websites, RSS feeds, and imported LinkedIn stories.",
        actionButton("Check sources", "scan", "refresh") +
          actionButton("Add source", "source", "plus", true),
      ) +
      `<div class="list-grid">${sources()
        .map(
          (s) =>
            `<article class="source-card"><div class="source-type"><span class="source-logo">${icon(s.type === "linkedin" ? "link" : "globe")}</span><button class="switch ${s.enabled ? "on" : ""}" data-source-toggle="${s.id}" aria-label="Toggle ${esc(s.name)}" aria-pressed="${s.enabled}"><span></span></button></div><h3>${esc(s.name)}</h3><a class="url" href="${safeLink(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a><p>${s.type === "rss" ? "RSS feed · Automatic collection" : s.type === "linkedin" ? "LinkedIn · Direct public collection" : "Official website · Headlines collected for review"}</p>${s.error ? `<p class="error-text">${esc(s.error)}</p>` : ""}<div class="card-bottom"><span>${s.lastChecked ? "Checked " + date(s.lastChecked) : "Not checked yet"}</span><button data-source-edit="${s.id}" style="margin-left:auto;margin-right:10px">Edit</button><button data-source-delete="${s.id}" aria-label="Delete source">${icon("trash")}</button></div></article>`,
        )
        .join(
          "",
        )}</div><div class="tips">LinkedIn collection reads public company posts and individual post pages directly. Add their URL as a source. Sign-in-only or blocked pages will show an error; manual import remains available. Website collection extracts headlines; verify the summary and category before approval.</div>`
    );
  if (page === "automation") return automationPage();
  if (page === "activity")
    return (
      heading(
        "Every delivery, accounted for.",
        "A record of stories successfully delivered to your groups.",
      ) +
      `${b().lastError ? `<div class="notice">Last automation error: ${esc(b().lastError)}</div>` : ""}` +
      `<div class="table-wrap"><table><thead><tr><th>STORY</th><th>GROUP</th><th>DELIVERED · IST</th><th>STATUS</th></tr></thead><tbody>${
        state.history
          .filter((x) => x.bot === active)
          .map(
            (h) =>
              `<tr><td>${esc(h.title)}</td><td>${esc(h.group)}</td><td>${date(h.time)} · ${time(h.time)}</td><td><span class="status-pill sent">Delivered</span></td></tr>`,
          )
          .join("") ||
        '<tr><td colspan="4" style="text-align:center;padding:55px">Your first successful delivery will appear here.</td></tr>'
      }</tbody></table></div>`
    );
  return settingsPage();
}
function overview() {
  const ns = news(),
    approved = ns.filter((n) => n.status === "approved").length;
  return (
    heading(
      "A little news. A stronger connection.",
      `Your ${active === "indo" ? "Indo–German" : "robotics and technology"} newsroom, all in one place.`,
      actionButton("Check sources", "scan", "refresh") +
        actionButton("Import story", "story", "plus", true),
    ) +
    `<div class="stats"><div class="stat"><div class="stat-top">Stories collected${icon("news")}</div><div class="stat-number">${ns.length}</div><div class="stat-bottom">${icon("globe")}${sources().filter((s) => s.enabled).length} active sources</div></div><div class="stat"><div class="stat-top">Ready to send${icon("send")}</div><div class="stat-number">${approved.toString().padStart(2, "0")}</div><div class="stat-bottom ${approved ? "good" : ""}">${icon("check")}${approved ? "Reviewed and approved" : "Awaiting your first approval"}</div></div><div class="stat"><div class="stat-top">Selected groups${icon("users")}</div><div class="stat-number">${b().selectedGroups.length.toString().padStart(2, "0")}</div><div class="stat-bottom">${icon("link")}${session().status === "connected" ? "WhatsApp connected" : "Connect to select groups"}</div></div><div class="stat"><div class="stat-top">Next delivery${icon("clock")}</div><div class="stat-number" style="font-size:25px">${b().autoSend ? displayTime(b().time) : "Not set"}<span style="font-size:10px;font-weight:500;color:#8e9a83;letter-spacing:0;margin-left:5px">${b().autoSend ? "IST" : ""}</span></div><div class="stat-bottom">${icon("bolt")}${b().autoSend ? "Daily automatic delivery" : "Automatic sending is off"}</div></div></div><div class="workspace"><div class="left-column"><section class="hero"><div><div class="eyebrow" style="color:#7d9268;font-size:9px;margin-bottom:7px">TWO COUNTRIES. ENDLESS POSSIBILITIES.</div><h2>${active === "indo" ? "Keeping India & Germany<br>closer, every day." : "Tomorrow’s technology.<br>In your community, today."}</h2><p>Curated updates. Meaningful conversations. Delivered on WhatsApp.</p></div><div class="hero-art"><div class="art-orbit"></div><div class="art-card">${icon("news")}</div><div class="art-bubble">${icon("send")}</div><div class="art-small">${icon("check")}</div></div></section><div class="section-title"><h2>Latest in your newsroom</h2><span class="note">${icon("refresh")}${b().lastScan ? "Checked " + time(b().lastScan) : "Ready for your first source check"}</span></div>${filterBar()}${ns.length ? "" : `<div class="sample-note">${icon("help")}Example layouts · Collect or import stories to fill your newsroom.</div>`}<div class="stories">${storyList(true)}</div><button class="text-link" data-page="news">Open your news queue ${icon("arrow")}</button></div><aside class="right-column">${automationPanel()}${previewPanel()}${groupPanel()}</aside></div>`
  );
}
function displayTime(value) {
  const [h, m] = value.split(":");
  return `${Number(h) % 12 || 12}:${m} ${Number(h) < 12 ? "AM" : "PM"}`;
}
function filterBar() {
  const mode = b().dateFilter || "today";
  return `<div class="date-filter">${icon("calendar")}<select id="date-filter" aria-label="News date">${[
    ["today", "Today’s news"],
    ["date", "Selected date"],
    ["all", "All dates"],
  ]
    .map(
      ([v, l]) =>
        `<option value="${v}" ${mode === v ? "selected" : ""}>${l}</option>`,
    )
    .join(
      "",
    )}</select>${mode === "date" ? `<input type="date" id="filter-date" value="${esc(b().filterDate)}" max="${indiaDay()}" aria-label="Selected date">` : ""}<span>${mode === "all" ? "Showing and sending stories from every date." : "Only stories published on this date are shown and sent."}</span></div><div class="filters">${["All", ...(active === "indo" ? ["Trade", "Research", "Education", "Culture & arts", "Politics", "Events"] : ["Robotics", "Technology"])].map((c) => `<button class="filter ${filter === c ? "active" : ""}" data-filter="${esc(c)}">${esc(c)}</button>`).join("")}</div>`;
}
function storyList(examples) {
  const all = news().filter((n) => n.status !== "archived");
  let list = all.filter(matchesDate);
  if (!all.length && examples) list = samples[active];
  list = list.filter((n) => filter === "All" || n.category === filter);
  if (page === "overview") list = list.slice(0, 4);
  return (
    list.map(storyCard).join("") ||
    (all.length
      ? `<div class="empty">${icon("calendar")}No stories from this date.<br>Choose another date or “All dates” above.</div>`
      : "") ||
    `<div class="empty">${icon("news")}No stories here yet.<br>Check your sources or import a story to get started.<br>${actionButton("Import story", "story")}</div>`
  );
}
function storyCard(n) {
  return `<article class="story"><div class="story-photo">${n.media && n.mediaType !== "video" ? `<img src="${safeLink(n.media)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<div class="no-photo">${icon(n.mediaType === "video" ? "video" : "news")}</div>`}<span class="category-tag">${esc(n.category)}</span>${n.media ? `<span class="media-badge">${icon(n.mediaType === "video" ? "video" : "image")}${n.mediaType === "video" ? "Video" : "Photo"}</span>` : ""}</div><div class="story-body"><div class="source-line"><span class="source-icon">${n.source === "LinkedIn" ? "in" : esc(n.source[0])}</span>${esc(n.source)}<time>${n.status === "example" ? "Example" : date(n.published || n.created)}</time></div><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p>${n.start ? `<a class="event-link" href="/api/news/${n.id}/calendar">${icon("calendar")}Add to calendar · ${date(n.start)}</a>` : ""}<div class="story-footer"><span class="status-pill ${n.status}">${n.status === "draft" ? "Needs review" : n.status === "approved" ? "Ready to send" : n.status === "sent" ? "Sent" : "Example story"}</span><span class="story-actions">${n.status === "example" ? "" : `<button class="danger-btn" data-delete="${n.id}" aria-label="Delete story">${icon("trash")}Delete</button>`}<button data-preview="${n.id}">${n.status === "draft" ? "Review story" : "Preview"}${icon("arrow")}</button></span></div></div></article>`;
}
function toggleRow(title, subtitle, key) {
  return `<div class="toggle-row"><div><strong>${title}</strong><small>${subtitle}</small></div><button class="switch ${b()[key] ? "on" : ""}" data-toggle="${key}" aria-label="${title}" aria-pressed="${b()[key]}"><span></span></button></div>`;
}
function automationPanel() {
  return `<section class="panel"><div class="panel-title">${icon("bolt")}<h3>On autopilot. On your terms.</h3></div><p class="panel-subtitle">Keep your groups up to date, automatically.</p>${toggleRow("Auto-send", "Deliver approved news on schedule", "autoSend")}${toggleRow("Auto-trigger", "Check your sources every 30 minutes", "autoTrigger")}<div class="schedule">${icon("clock")}Daily at <strong>${displayTime(b().time)}</strong><span>IST</span><button data-action="schedule">Edit</button></div>${b().lastError ? `<p class="error-text">${esc(b().lastError)}</p>` : ""}</section>`;
}
function chosenStory() {
  return (
    [...news(), ...samples[active]].find((n) => n.id === previewId) ||
    news().find((n) => n.status !== "archived") ||
    samples[active][0]
  );
}
function previewPanel() {
  const n = chosenStory();
  return `<section class="panel preview-panel"><div class="panel-title">${icon("send")}<h3>A peek inside WhatsApp</h3></div><p class="panel-subtitle">Short, simple, and easy to share.</p><div class="phone-preview"><div class="chat-head"><div class="chat-avatar">${active === "indo" ? "🇮🇳" : "⚙"}</div><div><strong>${active === "indo" ? "Indo–German updates" : "Robotics & Tech updates"}</strong><small>Message preview</small></div>${icon("down")}</div><div class="chat-body"><div class="chat-date"><span>${n.status === "example" ? "EXAMPLE MESSAGE" : "TODAY"}</span></div><div class="bubble">${n.media && n.mediaType !== "video" ? `<img src="${safeLink(n.media)}" alt="" referrerpolicy="no-referrer">` : ""}<h4>${esc(n.title)}</h4><p>${esc(n.summary)}</p><a class="chat-url" href="${safeLink(n.url)}" target="_blank" rel="noopener">${esc(new URL(n.url).hostname)} ${icon("external")}</a>${n.start ? `<a href="/api/news/${n.id}/calendar" class="event-link">${icon("calendar")}Add to your calendar</a>` : ""}<p><em>⚠️ Disclaimer: Auto-collected from ${active === "robotics" ? "LinkedIn" : "public sources"}. Not verified by a human.</em></p><div class="chat-time">09:00 ${icon("double")}</div></div></div></div><p class="preview-caption">${n.status === "example" ? "Illustrative example · no message has been sent" : "Preview only · review before sending"}</p></section>`;
}
function groupPanel() {
  const selected = groups().filter((g) => b().selectedGroups.includes(g.id));
  return `<section class="panel groups-mini"><div class="panel-title">${icon("users")}<h3>Your communities</h3><span class="tag" style="margin-left:auto">${selected.length}</span></div>${
    selected.length
      ? selected
          .slice(0, 3)
          .map(
            (g) =>
              `<div class="group-mini"><span class="group-avatar">${icon("users")}</span><div><strong>${esc(g.name)}</strong><small>${g.members} members</small></div><span class="check">${icon("check")}</span></div>`,
          )
          .join("")
      : `<p class="panel-subtitle">Choose the groups that matter to this bot.</p>`
  }<button class="text-link" data-page="groups">Manage group selection ${icon("arrow")}</button></section>`;
}
function automationPage() {
  return (
    heading(
      "A rhythm that works for you.",
      "Control when news is collected and when it reaches your groups.",
    ) +
    `<div class="workspace"><section class="panel wide-panel"><h2>Delivery & discovery</h2><p class="panel-subtitle">These settings apply only to ${esc(b().name)}. Keep this server running for automations to work.</p>${toggleRow("Auto-send", "Send approved stories once daily, using India Standard Time.", "autoSend")}${toggleRow("Auto-trigger", "Collect new stories every 30 minutes. New stories enter the review queue.", "autoTrigger")}<div class="field" style="margin-top:24px"><label for="schedule-time">Daily send time · Asia/Kolkata</label><input type="time" id="schedule-time" value="${b().time}"></div><h3 style="margin:24px 0 8px">Include these categories</h3>${(active === "indo" ? ["Trade", "Research", "Education", "Culture & arts", "Politics", "Events"] : ["Robotics", "Technology"]).map((c) => `<label class="check-group"><input type="checkbox" data-category="${esc(c)}" ${b().categories.includes(c) ? "checked" : ""}>${esc(c)}</label>`).join("")}<div class="tips">Auto-trigger collects drafts. Review and approve them before delivery. Auto-send retries if WhatsApp is disconnected, and skips groups that already received a story.</div>${actionButton("Send approved now", "send", "send", true)}${b().lastError ? `<p class="error-text">Last error: ${esc(b().lastError)}</p>` : ""}</section><aside>${groupPanel()}</aside></div>`
  );
}
function settingsPage() {
  return (
    heading(
      "Your bot, your preferences.",
      "Connection and message settings for this workspace.",
    ) +
    `<div class="panel wide-panel"><h2>WhatsApp connection</h2><p class="panel-subtitle">One shared WhatsApp login powers both bots. Group selections and schedules stay separate.</p><div class="toggle-row"><div><strong>${esc(b().name)}</strong><small>${esc(session().status)} · ${groups().length} available groups</small></div>${actionButton(session().status === "connected" ? "Manage connection" : "Connect account", "connect", "qr", true)}</div><div class="settings-list"><h2>LinkedIn discovery</h2><div class="toggle-row"><div><strong>Direct public-page collection</strong><small>Collect public company posts, text, photos, and available video URLs. No API key needed.</small></div><span class="tag">Enabled</span></div><h2 style="margin-top:25px">Message format</h2><div class="toggle-row"><div><strong>Minimal news updates</strong><small>Headline + a short summary of up to 230 characters + source link</small></div><span class="tag">Enabled</span></div><div class="toggle-row"><div><strong>Photos & videos</strong><small>Included when a public media URL is available (up to 16 MB)</small></div><span class="tag">Supported</span></div><div class="toggle-row"><div><strong>Event calendar files</strong><small>ICS attachment for events with a start and end date</small></div><span class="tag">Supported</span></div></div><div class="tips">WhatsApp pairing uses the unofficial WhatsApp Web client. Your session is stored locally in data/sessions. The dashboard listens on localhost and does not expose your account to the internet.</div></div>`
  );
}
function openModal(type, n = null) {
  modal = { type, id: n?.id };
  if (type === "connect") {
    renderConnection();
    return;
  }
  const titles = {
    story: "Add a story",
    source: "Follow a new source",
    schedule: "Set your daily rhythm",
    help: "Welcome to Bridge",
    review: "Make it ready to share",
    send: "Send your approved stories",
  };
  let body = "";
  if (type === "story")
    body = `<p>Import a website or LinkedIn story. Keep the summary to one or two short lines.</p><form id="story-form"><div class="field"><label>Headline</label><input name="title" required maxlength="220" placeholder="A headline worth sharing"></div><div class="field"><label>Short summary</label><textarea name="summary" required maxlength="230" placeholder="The key update in one or two lines…"></textarea><small>Maximum 230 characters. Include only verified information.</small></div><div class="fields-two"><div class="field"><label>Category</label><select name="category" id="story-category">${b()
      .categories.map((c) => `<option>${esc(c)}</option>`)
      .join(
        "",
      )}</select></div><div class="field"><label>Media format</label><select name="mediaType"><option value="image">Photo</option><option value="video">Video</option></select></div></div><div class="field"><label>Source link</label><input name="url" type="url" required placeholder="https://linkedin.com/posts/…"></div><div class="field"><label>Photo or video URL · optional</label><input name="media" type="url" placeholder="https://example.com/photo.jpg"><small>Use a direct public URL for media you have permission to share.</small></div><div id="event-fields" hidden><div class="fields-two"><div class="field"><label>Starts · your device time zone</label><input name="start" type="datetime-local"></div><div class="field"><label>Ends · your device time zone</label><input name="end" type="datetime-local"></div></div><div class="field"><label>Location</label><input name="location" placeholder="Venue, city or meeting link"></div></div><div class="modal-footer"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary" type="submit">${icon("plus")}Add to review queue</button></div></form>`;
  if (type === "source")
    body = `<p>Collect from public RSS feeds and official websites. LinkedIn sources collect directly from public company, post, or article pages.</p><form id="source-form"><div class="field"><label>Source name</label><input name="name" required placeholder="e.g. German Embassy India"></div><div class="field"><label>Source type</label><select name="type">${active === "robotics" ? "" : '<option value="website">Official website</option><option value="rss">RSS feed</option>'}<option value="linkedin">LinkedIn · public page</option></select></div><div class="field"><label>Public URL</label><input name="url" required type="url" placeholder="https://…"></div><div class="tips">For LinkedIn, use a company posts URL such as https://www.linkedin.com/company/company-name/posts/ or an individual public post URL. The homepage cannot be used as a news source.</div><div class="modal-footer"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary" type="submit">Add source</button></div></form>`;
  if (type === "schedule")
    body = `<p>Send reviewed stories to your selected groups every day. The schedule uses India Standard Time.</p><form id="schedule-form"><div class="field"><label>Daily delivery time · IST</label><input name="time" type="time" required value="${b().time}"></div><div class="tips">Keep auto-send enabled and the server running. Only approved stories in your enabled categories will be sent.</div><div class="modal-footer"><button class="btn" type="button" data-close>Cancel</button><button class="btn primary">Save schedule</button></div></form>`;
  if (type === "help")
    body = `<p>Your two newsrooms share one WhatsApp login, with separate sources, groups, and schedules.</p><ol class="instructions"><li>Switch between bots in the sidebar.</li><li>Connect WhatsApp and scan the QR code.</li><li>Choose groups from the group selection menu.</li><li>Add sources, then check for stories.</li><li>Import LinkedIn posts using their text and link.</li><li>Review stories and approve them.</li><li>Enable auto-send and choose a daily time.</li></ol><div class="tips">For event stories, choose Events and provide start and end dates. Recipients receive an .ics file they can add to their calendar.</div><div class="modal-footer"><button class="btn primary" data-close>Got it</button></div>`;
  if (type === "review")
    body = `<p>${esc(n.source)} · ${esc(n.category)}</p>${n.media && n.mediaType !== "video" ? `<img src="${safeLink(n.media)}" alt="" style="width:100%;height:170px;object-fit:cover;border-radius:8px;margin-bottom:16px">` : ""}<h3 style="line-height:1.7">${esc(n.title)}</h3><div class="field" style="margin-top:18px"><label>Message summary</label><textarea id="review-summary" maxlength="230" ${n.status === "example" ? "readonly" : ""}>${esc(n.summary)}</textarea></div><a class="event-link" href="${safeLink(n.url)}" target="_blank" rel="noopener">${icon("external")}Open original source</a>${n.category === "Events" && n.status !== "example" ? `<div class="fields-two"><div class="field"><label>Event starts · your device time</label><input type="datetime-local" id="review-start" value="${n.start ? new Date(new Date(n.start) - new Date(n.start).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}"></div><div class="field"><label>Event ends · your device time</label><input type="datetime-local" id="review-end" value="${n.end ? new Date(new Date(n.end) - new Date(n.end).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}"></div></div><div class="field"><label>Event location</label><input id="review-location" value="${esc(n.location)}"></div>` : ""}${n.status === "example" ? '<div class="tips">This is a sample layout, not a collected news story. Use Check sources or Import story to add real news.</div>' : ""}<div class="modal-footer"><button class="btn" data-close>Close</button>${n.status === "example" ? "" : `<button class="btn danger-btn" data-delete="${n.id}">${icon("trash")}Delete</button>`}${n.status === "draft" || n.status === "approved" ? `<button class="btn" data-archive="${n.id}">Archive</button><button class="btn primary" data-approve="${n.id}">${icon("check")}Approve story</button>` : ""}</div>`;
  if (type === "send") {
    const items = news().filter(
        (n) =>
          n.status === "approved" &&
          b().categories.includes(n.category) &&
          matchesDate(n),
      ),
      selected = groups().filter((g) => b().selectedGroups.includes(g.id));
    body = `<p>Send ${items.length} approved ${items.length === 1 ? "story" : "stories"} to ${selected.length} selected ${selected.length === 1 ? "group" : "groups"} from ${esc(b().name)}.</p><div class="tips">${selected.map((g) => esc(g.name)).join("<br>") || "No groups selected. Connect WhatsApp and select groups first."}</div>${items.length ? `<ul class="instructions">${items.map((n) => `<li>${esc(n.title)}</li>`).join("")}</ul>` : "<p>Approve a story from the news queue first.</p>"}<div class="modal-footer"><button class="btn" data-close>Cancel</button><button class="btn primary" data-confirm-send ${!items.length || !selected.length || session().status !== "connected" ? "disabled" : ""}>${icon("send")}Send now</button></div>`;
  }
  $("#modal-root").innerHTML =
    `<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-label="${titles[type]}"><div class="modal-header"><h2>${titles[type]}</h2><button data-close aria-label="Close">✕</button></div>${body}</section></div>`;
  if (type === "source" && n) {
    const form = $("#source-form");
    for (const key of ["name", "type", "url"])
      form.elements[key].value = n[key];
    form.elements.type.disabled = true;
  }
  bindModal();
}
function closeModal() {
  modal = null;
  $("#modal-root").innerHTML = "";
}
function renderConnection() {
  if (modal?.type !== "connect") return;
  const s = session();
  $("#modal-root").innerHTML =
    `<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-label="Connect WhatsApp"><div class="modal-header"><h2>${s.status === "connected" ? "You’re connected." : "Connect your WhatsApp"}</h2><button data-close aria-label="Close">✕</button></div><p>Scan once to connect both bots to the same WhatsApp account. Your session is stored on your computer.</p><div class="qr-wrap">${s.qr ? `<img src="${s.qr}" alt="WhatsApp pairing QR code">` : `<div class="waiting">${icon(s.status === "connected" ? "check" : s.status === "starting" ? "refresh" : "qr", s.status === "starting" ? "progress-spin" : "")}<br>${s.status === "connected" ? "Account linked successfully" : s.status === "starting" ? "Starting WhatsApp Web…<br>The QR code will appear here." : s.status === "error" ? esc(s.error) : "Generate a QR code to link your account."}</div>`}</div>${s.status !== "connected" ? `<ol class="instructions"><li>Open WhatsApp on your phone.</li><li>Go to Settings → Linked devices.</li><li>Tap Link a device and scan this code.</li></ol>` : s.groupsError ? `<div class="tips">${esc(s.groupsError)}</div>${actionButton("Retry loading groups", "reload-groups", "refresh", true)}` : s.groupsLoading ? `<div class="waiting">${icon("refresh", "progress-spin")}<br>Linked. Loading your groups…</div>` : `<div class="tips">${groups().length} groups available. Select the groups you want this bot to reach.</div>`}<div class="modal-footer"><button class="btn" data-close>Close</button>${s.status === "connected" ? '<button class="btn danger-btn" data-action="disconnect">Disconnect both bots</button><button class="btn primary" data-action="go-groups">Select groups</button>' : `<button class="btn primary" data-action="start-connect" ${["starting", "qr"].includes(s.status) ? "disabled" : ""}>${icon("qr")}${s.status === "error" ? "Retry connection" : "Generate QR code"}</button>`}</div></section></div>`;
  bindModal();
}
async function guarded(fn) {
  try {
    await fn();
  } catch (e) {
    toast(e.message);
  }
}
async function patchBot(values) {
  await api("bots/" + active, values, "PATCH");
  await load();
}
function bind() {
  document.querySelectorAll("img").forEach(
    (img) =>
      (img.onerror = () => {
        img.style.display = "none";
        img.parentElement.classList.add("no-photo");
      }),
  );
  document.querySelectorAll("[data-page]").forEach(
    (el) =>
      (el.onclick = (e) => {
        e.preventDefault();
        page = el.dataset.page;
        filter = "All";
        render();
      }),
  );
  $("#bot-select").onchange = (e) => {
    active = e.target.value;
    localStorage.setItem("bridge-bot", active);
    filter = "All";
    previewId = null;
    closeModal();
    render();
  };
  document
    .querySelectorAll("[data-action]")
    .forEach((el) => (el.onclick = () => action(el.dataset.action)));
  if ($("#date-filter"))
    $("#date-filter").onchange = (e) =>
      guarded(() =>
        patchBot({
          dateFilter: e.target.value,
          ...(e.target.value === "date" && !b().filterDate
            ? { filterDate: indiaDay() }
            : {}),
        }),
      );
  if ($("#filter-date"))
    $("#filter-date").onchange = (e) =>
      e.target.value && guarded(() => patchBot({ filterDate: e.target.value }));
  document.querySelectorAll("[data-filter]").forEach(
    (el) =>
      (el.onclick = () => {
        filter = el.dataset.filter;
        render();
      }),
  );
  document.querySelectorAll("[data-preview]").forEach(
    (el) =>
      (el.onclick = () => {
        previewId = el.dataset.preview;
        const n = chosenStory();
        openModal("review", n);
      }),
  );
  document
    .querySelectorAll("[data-toggle]")
    .forEach(
      (el) =>
        (el.onclick = () =>
          guarded(() =>
            patchBot({ [el.dataset.toggle]: !b()[el.dataset.toggle] }),
          )),
    );
  document.querySelectorAll("[data-group]").forEach(
    (el) =>
      (el.onchange = () =>
        guarded(() =>
          patchBot({
            selectedGroups: [
              ...document.querySelectorAll("[data-group]:checked"),
            ].map((el) => el.dataset.group),
          }),
        )),
  );
  document.querySelectorAll("[data-category]").forEach(
    (el) =>
      (el.onchange = () =>
        guarded(() =>
          patchBot({
            categories: [
              ...document.querySelectorAll("[data-category]:checked"),
            ].map((el) => el.dataset.category),
          }),
        )),
  );
  if ($("#schedule-time"))
    $("#schedule-time").onchange = (e) =>
      guarded(() => patchBot({ time: e.target.value }));
  document.querySelectorAll("[data-source-toggle]").forEach(
    (el) =>
      (el.onclick = () =>
        guarded(async () => {
          const s = sources().find((x) => x.id === el.dataset.sourceToggle);
          await api("sources/" + s.id, { enabled: !s.enabled }, "PATCH");
          await load();
        })),
  );
  document.querySelectorAll("[data-source-edit]").forEach(
    (el) =>
      (el.onclick = () =>
        openModal(
          "source",
          sources().find((s) => s.id === el.dataset.sourceEdit),
        )),
  );
  document.querySelectorAll("[data-source-delete]").forEach(
    (el) =>
      (el.onclick = () =>
        guarded(async () => {
          await api("sources/" + el.dataset.sourceDelete, undefined, "DELETE");
          await load();
          toast("Source removed");
        })),
  );
  bindDelete();
}
async function action(action) {
  if (["story", "source", "schedule", "help", "send"].includes(action))
    return openModal(action);
  if (action === "connect") return openModal("connect");
  if (action === "mobile") return $(".sidebar").classList.toggle("open");
  if (action === "go-groups") {
    closeModal();
    page = "groups";
    render();
    return;
  }
  if (action === "scan") {
    if (working) return;
    working = true;
    document.querySelectorAll('[data-action="scan"]').forEach((el) => {
      el.disabled = true;
      el.innerHTML = icon("refresh", "progress-spin") + "Checking sources…";
    });
    await guarded(async () => {
      const r = await api("bots/" + active + "/scan", {});
      await load();
      toast(
        `${r.added} new stories collected${r.errors.length ? ` · ${r.errors.length} sources need attention` : ""}`,
      );
    });
    working = false;
    render();
    return;
  }
  if (action === "start-connect")
    return guarded(async () => {
      await api("bots/" + active + "/connect", {});
      await load();
      renderConnection();
    });
  if (action === "reload-groups")
    return guarded(async () => {
      const el = document.querySelector('[data-action="reload-groups"]');
      if (el) el.disabled = true;
      await api("bots/" + active + "/groups", {});
      await load();
      renderConnection();
      toast("Groups reloaded");
    });
  if (action === "disconnect")
    return guarded(async () => {
      await api("bots/" + active + "/disconnect", {});
      await load();
      renderConnection();
      toast("WhatsApp disconnected");
    });
}
// First click asks for confirmation; the second deletes the story.
function bindDelete() {
  document.querySelectorAll("[data-delete]").forEach(
    (el) =>
      (el.onclick = () => {
        if (!el.dataset.confirm) {
          el.dataset.confirm = "1";
          el.innerHTML = icon("trash") + "Confirm delete";
          setTimeout(() => {
            if (!el.isConnected) return;
            delete el.dataset.confirm;
            el.innerHTML = icon("trash") + "Delete";
          }, 4000);
          return;
        }
        guarded(async () => {
          await api("news/" + el.dataset.delete, undefined, "DELETE");
          if (previewId === el.dataset.delete) previewId = null;
          closeModal();
          await load();
          toast("Story deleted");
        });
      }),
  );
}
function bindModal() {
  document
    .querySelectorAll("[data-close]")
    .forEach((el) => (el.onclick = closeModal));
  document
    .querySelectorAll("#modal-root [data-action]")
    .forEach((el) => (el.onclick = () => action(el.dataset.action)));
  const overlay = $(".modal-overlay");
  if (overlay)
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
  for (const type of ["story", "source", "schedule"]) {
    const form = $("#" + type + "-form");
    if (form)
      form.onsubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const button =
          form.querySelector('button[type="submit"]') ||
          form.querySelector(".primary");
        button.disabled = true;
        guarded(async () => {
          if (type === "story") {
            data.bot = active;
            if (data.category !== "Events") {
              delete data.start;
              delete data.end;
              delete data.location;
            } else if (data.start && data.end) {
              data.start = new Date(data.start).toISOString();
              data.end = new Date(data.end).toISOString();
            }
            await api("news", data);
          } else if (type === "source")
            await api(
              modal.id ? "sources/" + modal.id : "sources",
              { ...data, bot: active, enabled: true },
              modal.id ? "PATCH" : "POST",
            );
          else await api("bots/" + active, data, "PATCH");
          closeModal();
          await load();
          toast(
            type === "story"
              ? "Story added to your review queue"
              : type === "source"
                ? "Source saved"
                : "Schedule saved",
          );
        }).finally(() => (button.disabled = false));
      };
  }
  if ($("#story-category")) {
    const update = () => {
      $("#event-fields").hidden = $("#story-category").value !== "Events";
    };
    $("#story-category").onchange = update;
    update();
  }
  document.querySelectorAll("[data-approve]").forEach(
    (el) =>
      (el.onclick = () =>
        guarded(async () => {
          await api(
            "news/" + el.dataset.approve,
            {
              status: "approved",
              summary: $("#review-summary").value,
              ...($("#review-start")
                ? {
                    start: $("#review-start").value
                      ? new Date($("#review-start").value).toISOString()
                      : null,
                    end: $("#review-end").value
                      ? new Date($("#review-end").value).toISOString()
                      : null,
                    location: $("#review-location").value,
                  }
                : {}),
            },
            "PATCH",
          );
          closeModal();
          await load();
          toast("Story approved and ready to send");
        })),
  );
  bindDelete();
  document.querySelectorAll("[data-archive]").forEach(
    (el) =>
      (el.onclick = () =>
        guarded(async () => {
          await api(
            "news/" + el.dataset.archive,
            { status: "archived" },
            "PATCH",
          );
          closeModal();
          await load();
          toast("Story archived");
        })),
  );
  if ($("[data-confirm-send]"))
    $("[data-confirm-send]").onclick = () => {
      const el = $("[data-confirm-send]");
      el.disabled = true;
      el.textContent = "Sending…";
      guarded(async () => {
        const r = await api("bots/" + active + "/send", {});
        closeModal();
        await load();
        toast(`${r.sent} deliveries completed`);
      }).finally(() => {
        el.disabled = false;
        el.textContent = "Send now";
      });
    };
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
await load();
setInterval(async () => {
  if (working) return;
  try {
    await load(false);
    if (!modal && mediaSignature() !== renderedMedia) render();
    if (modal?.type === "connect") {
      renderConnection();
      if (session().status === "connected" && !window.connectionNotified) {
        window.connectionNotified = true;
        toast("WhatsApp linked. Your groups are ready.");
      }
    }
  } catch {}
}, 3000);
