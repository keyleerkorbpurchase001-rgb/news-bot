import express from "express";
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import net from "node:net";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import {
  scrapeLinkedin,
  validateLinkedinSource,
  postImage,
} from "./linkedin.js";
import {
  categories,
  summarize,
  classify,
  calendar,
  makeId,
  matchesDate,
} from "./lib.js";
import {
  sessionView,
  connectWhatsApp,
  disconnectWhatsApp,
  refreshGroups,
  sessionPath,
  getClient,
} from "./whatsapp.js";
const app = express(),
  port = Number(process.env.PORT || 3000),
  file = path.resolve(process.env.BRIDGE_DATA_FILE || "data/state.json");
fs.mkdirSync(path.dirname(file), { recursive: true });
const bot = (id, name) => ({
  id,
  name,
  selectedGroups: [],
  autoSend: false,
  autoTrigger: false,
  time: "09:00",
  categories: id === "indo" ? categories : ["Robotics", "Technology"],
  lastScheduled: "",
  lastScan: null,
  dateFilter: "today",
  filterDate: "",
});
// The Robotics bot collects industry news from LinkedIn company pages only.
const roboticsLinkedin = [
  [
    "LinkedIn · Boston Dynamics",
    "https://www.linkedin.com/company/boston-dynamics/",
  ],
  [
    "LinkedIn · Universal Robots",
    "https://www.linkedin.com/company/universal-robots/",
  ],
  [
    "LinkedIn · FANUC America",
    "https://www.linkedin.com/company/fanuc-america-corporation/",
  ],
  [
    "LinkedIn · Agility Robotics",
    "https://www.linkedin.com/company/agility-robotics/",
  ],
  ["LinkedIn · Figure AI", "https://www.linkedin.com/company/figure-ai/"],
  [
    "LinkedIn · The Robot Report",
    "https://www.linkedin.com/company/the-robot-report/",
  ],
];
// Appended to every WhatsApp news message.
const disclaimers = {
  indo: "⚠️ _Disclaimer: Auto-collected from public sources. Not verified by a human._",
  robotics:
    "⚠️ _Disclaimer: Auto-collected from LinkedIn. Not verified by a human._",
};
let db = fs.existsSync(file)
  ? JSON.parse(fs.readFileSync(file, "utf8"))
  : {
      bots: [bot("indo", "Indo–German"), bot("robotics", "Robotics & Tech")],
      sources: [
        {
          id: makeId(),
          bot: "indo",
          name: "Indo-German Chamber of Commerce",
          url: "https://indien.ahk.de/",
          type: "website",
          enabled: true,
        },
        {
          id: makeId(),
          bot: "indo",
          name: "DAAD India",
          url: "https://www.daad.in/en/",
          type: "website",
          enabled: true,
        },
        {
          id: makeId(),
          bot: "indo",
          name: "Goethe-Institut India",
          url: "https://www.goethe.de/ins/in/en/index.html",
          type: "website",
          enabled: true,
        },
        {
          id: makeId(),
          bot: "indo",
          name: "LinkedIn · Indo–German",
          url: "https://www.linkedin.com/company/indo-german-chamber-of-commerce",
          type: "linkedin",
          enabled: true,
        },
        ...roboticsLinkedin.map(([name, url]) => ({
          id: makeId(),
          bot: "robotics",
          name,
          url,
          type: "linkedin",
          enabled: true,
        })),
      ],
      roboticsLinkedinOnly: true,
      news: [],
      history: [],
    };
function save() {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, file);
}
// Replace obsolete search-provider errors with source setup instructions.
for (const source of db.sources.filter((s) => s.type === "linkedin")) {
  delete source.query;
  if (/^https:\/\/(www\.)?linkedin\.com\/?$/.test(source.url)) {
    source.url =
      source.bot === "indo"
        ? "https://www.linkedin.com/company/indo-german-chamber-of-commerce"
        : "https://www.linkedin.com/company/boston-dynamics/";
    source.enabled = true;
    source.error = null;
  } else if (source.error?.includes("BRAVE_SEARCH_API_KEY"))
    source.error = null;
}
// Earlier photo checks marked failed fetches as done; retry them once.
if (!db.imageRecheck) {
  for (const n of db.news) if (!n.media) delete n.mediaChecked;
  db.imageRecheck = true;
}
// LinkedIn's generic placeholder image is not the post's photo.
for (const n of db.news)
  if (/^https:\/\/static\.licdn\.com\//.test(n.media || "")) {
    n.media = null;
    n.mediaType = "image";
  }
// Deleted stories are remembered ("bot url") so scans don't collect them again.
db.deleted ??= [];
// One-time cleanup: the Robotics bot keeps LinkedIn stories only.
if (!db.roboticsNewsCleaned) {
  db.news = db.news.filter(
    (n) =>
      n.bot !== "robotics" ||
      /^https:\/\/([a-z]+\.)?linkedin\.com\//.test(n.url),
  );
  db.roboticsNewsCleaned = true;
}
for (const b of db.bots) {
  b.dateFilter ??= "today";
  b.filterDate ??= "";
}
// One-time migration: drop non-LinkedIn Robotics sources, add industry pages.
if (!db.roboticsLinkedinOnly) {
  db.sources = db.sources.filter(
    (s) => s.bot !== "robotics" || s.type === "linkedin",
  );
  for (const [name, url] of roboticsLinkedin)
    if (!db.sources.some((s) => s.bot === "robotics" && s.url === url))
      db.sources.push({
        id: makeId(),
        bot: "robotics",
        name,
        url,
        type: "linkedin",
        enabled: true,
      });
  db.roboticsLinkedinOnly = true;
}
save();
const busy = new Set();
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  if (
    req.method !== "GET" &&
    req.headers.origin &&
    !["http://localhost:" + port, "http://127.0.0.1:" + port].includes(
      req.headers.origin,
    )
  )
    return res.status(403).json({ error: "Origin not allowed" });
  next();
});
app.use(express.static("public"));
function getBot(id) {
  const b = db.bots.find((x) => x.id === id);
  if (!b) throw Error("Unknown bot");
  return b;
}
app.get("/api/state", (req, res) =>
  res.json({
    ...db,
    integrations: { linkedinCollection: "public-html" },
    sessions: Object.fromEntries(db.bots.map((b) => [b.id, sessionView()])),
  }),
);
app.patch("/api/bots/:id", (req, res) => {
  const b = getBot(req.params.id),
    v = req.body;
  if (v.time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time))
    return res.status(400).json({ error: "Invalid schedule" });
  if (
    v.categories !== undefined &&
    (!Array.isArray(v.categories) ||
      v.categories.some(
        (c) =>
          !(b.id === "indo" ? categories : ["Robotics", "Technology"]).includes(
            c,
          ),
      ))
  )
    return res.status(400).json({ error: "Invalid categories" });
  if (
    v.selectedGroups !== undefined &&
    (!Array.isArray(v.selectedGroups) ||
      v.selectedGroups.some(
        (id) => !sessionView().groups.some((g) => g.id === id),
      ))
  )
    return res
      .status(400)
      .json({ error: "Select groups from a connected WhatsApp account" });
  if (
    v.dateFilter !== undefined &&
    !["today", "date", "all"].includes(v.dateFilter)
  )
    return res.status(400).json({ error: "Invalid date filter" });
  if (
    v.filterDate !== undefined &&
    (typeof v.filterDate !== "string" ||
      (v.filterDate && !/^\d{4}-\d{2}-\d{2}$/.test(v.filterDate)))
  )
    return res.status(400).json({ error: "Invalid date" });
  if (
    (v.dateFilter ?? b.dateFilter) === "date" &&
    !(v.filterDate ?? b.filterDate)
  )
    return res.status(400).json({ error: "Choose a date" });
  for (const key of [
    "selectedGroups",
    "categories",
    "time",
    "dateFilter",
    "filterDate",
  ])
    if (v[key] !== undefined) b[key] = v[key];
  for (const key of ["autoSend", "autoTrigger"])
    if (typeof v[key] === "boolean") b[key] = v[key];
  save();
  res.json(b);
});
app.post("/api/bots/:id/connect", async (req, res, next) => {
  try {
    getBot(req.params.id);
    res.json(await connectWhatsApp(file));
  } catch (e) {
    next(e);
  }
});
// Re-read groups after a failed load, a reconnect, or a manual retry.
app.post("/api/bots/:id/groups", async (req, res, next) => {
  try {
    getBot(req.params.id);
    res.json(await refreshGroups());
  } catch (e) {
    next(e);
  }
});
app.post("/api/bots/:id/disconnect", async (req, res, next) => {
  try {
    getBot(req.params.id);
    await disconnectWhatsApp(file);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
function privateIP(ip) {
  return (
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.|::|fc|fd|fe80)/i.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith("::ffff:")
  );
}
async function safeUrl(raw) {
  const u = new URL(raw);
  if (
    !["https:", "http:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    (u.port && !["80", "443"].includes(u.port))
  )
    throw Error("Use a public HTTP or HTTPS URL");
  if (u.hostname === "localhost")
    throw Error("Private addresses are not allowed");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  const addresses = net.isIP(host)
    ? [{ address: host }]
    : await dns.lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => privateIP(a.address)))
    throw Error("Private addresses are not allowed");
  return u.href;
}
async function fetchPublic(raw) {
  let url = raw;
  for (let i = 0; i < 4; i++) {
    url = await safeUrl(url);
    const r = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "BridgeNewsroom/1.0" },
    });
    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
      url = new URL(r.headers.get("location"), url).href;
      continue;
    }
    if (!r.ok) throw Error("Source returned " + r.status);
    const reader = r.body.getReader();
    let chunks = [],
      size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 3_000_000) {
        await reader.cancel();
        throw Error("Source is too large");
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  throw Error("Too many redirects");
}
app.post("/api/sources", async (req, res, next) => {
  try {
    const { bot, name, url, type } = req.body;
    getBot(bot);
    if (!name?.trim() || !["rss", "website", "linkedin"].includes(type))
      throw Error("Enter a source name and type");
    if (bot === "robotics" && type !== "linkedin")
      throw Error("The Robotics bot only collects from LinkedIn pages");
    await safeUrl(url);
    if (type === "linkedin") validateLinkedinSource(url);
    const s = {
      id: makeId(),
      bot,
      name: name.trim(),
      url,
      type,
      enabled: true,
    };
    db.sources.push(s);
    save();
    res.json(s);
  } catch (e) {
    next(e);
  }
});
app.delete("/api/sources/:id", (req, res) => {
  db.sources = db.sources.filter((s) => s.id !== req.params.id);
  save();
  res.json({ ok: true });
});
app.patch("/api/sources/:id", async (req, res, next) => {
  try {
    const s = db.sources.find((x) => x.id === req.params.id);
    if (!s) return res.status(404).json({ error: "Source not found" });
    if (req.body.url !== undefined) {
      await safeUrl(req.body.url);
      if (s.type === "linkedin") validateLinkedinSource(req.body.url);
      s.url = req.body.url;
      s.error = null;
      s.lastChecked = null;
    }
    if (typeof req.body.name === "string" && req.body.name.trim())
      s.name = req.body.name.trim();
    if (typeof req.body.enabled === "boolean") s.enabled = req.body.enabled;
    save();
    res.json(s);
  } catch (e) {
    next(e);
  }
});
async function scan(id) {
  if (busy.has("scan:" + id)) throw Error("A source scan is already running");
  busy.add("scan:" + id);
  const b = getBot(id),
    errors = [];
  let added = 0;
  try {
    for (const s of db.sources.filter(
      (s) =>
        s.bot === id &&
        s.enabled &&
        (id !== "robotics" || s.type === "linkedin"),
    )) {
      try {
        let items = [];
        if (s.type === "linkedin") {
          items = await scrapeLinkedin(s, fetchPublic);
        } else if (s.type === "rss") {
          const raw = await fetchPublic(s.url);
          const feed = await new Parser({
            customFields: {
              item: [
                ["media:content", "mediaContent"],
                ["media:thumbnail", "thumbnail"],
              ],
            },
          }).parseString(raw);
          items = feed.items.slice(0, 20).map((i) => ({
            title: i.title,
            url: i.link,
            published: i.isoDate || null,
            summary: summarize(i.contentSnippet || i.content || i.title),
            media:
              i.mediaContent?.$?.url ||
              i.thumbnail?.$?.url ||
              (/^(image|video)\//.test(i.enclosure?.type || "")
                ? i.enclosure.url
                : null) ||
              cheerio
                .load(i["content:encoded"] || i.content || "")("img")
                .first()
                .attr("src") ||
              null,
            mediaType: i.enclosure?.type?.startsWith("video")
              ? "video"
              : "image",
          }));
        } else {
          const raw = await fetchPublic(s.url);
          const $ = cheerio.load(raw);
          $("a[href]").each((_, el) => {
            const title = $(el).text().replace(/\s+/g, " ").trim(),
              href = $(el).attr("href");
            if (
              title.length < 45 ||
              title.length > 220 ||
              !href ||
              /^(#|mailto:|javascript:)/.test(href)
            )
              return;
            const url = new URL(href, s.url).href;
            if (new URL(url).hostname !== new URL(s.url).hostname) return;
            const img =
              $(el).find("img").attr("src") ||
              $(el).closest("article").find("img").first().attr("src");
            items.push({
              title: title.replace(/^More on\s+/i, ""),
              url,
              summary: summarize(title.replace(/^More on\s+/i, "")),
              media: img ? new URL(img, s.url).href : null,
              mediaType: "image",
            });
          });
          items = items.slice(0, 15);
        }
        for (const i of items.reverse()) {
          if (!i.title || !i.url || !/^https?:\/\//i.test(i.url)) continue;
          if (db.deleted.includes(id + " " + i.url)) continue;
          const existing = db.news.find((n) => n.bot === id && n.url === i.url);
          if (existing) {
            if (!existing.published && i.published)
              existing.published = i.published;
            if (!existing.media && i.media) {
              existing.media = i.media;
              existing.mediaType = i.mediaType;
            }
            continue;
          }
          db.news.unshift({
            ...i,
            id: makeId(),
            bot: id,
            source: s.name,
            category:
              s.name.includes("DAAD") && classify(i.title, id) === "Trade"
                ? "Education"
                : classify(i.title, id),
            status: "draft",
            created: new Date().toISOString(),
          });
          added++;
        }
        s.lastChecked = new Date().toISOString();
        s.error = null;
      } catch (e) {
        s.error = e.message;
        errors.push(s.name + ": " + e.message);
      }
    }
    b.lastScan = new Date().toISOString();
    save();
    backfillImages();
    return { added, errors };
  } finally {
    busy.delete("scan:" + id);
  }
}
app.post("/api/bots/:id/scan", async (req, res, next) => {
  try {
    res.json(await scan(getBot(req.params.id).id));
  } catch (e) {
    next(e);
  }
});
app.post("/api/news", async (req, res, next) => {
  try {
    const {
      bot,
      title,
      summary,
      url,
      category,
      media,
      mediaType,
      start,
      end,
      location,
    } = req.body;
    const b = getBot(bot);
    if (!title?.trim() || !summary?.trim() || !b.categories.includes(category))
      throw Error("Title, summary and enabled category are required");
    await safeUrl(url);
    if (media) await safeUrl(media);
    if (
      start &&
      (!end ||
        isNaN(Date.parse(start)) ||
        isNaN(Date.parse(end)) ||
        new Date(end) <= new Date(start))
    )
      throw Error("Event end must be after its start");
    const n = {
      id: makeId(),
      bot,
      title: title.trim(),
      summary: summarize(summary),
      url,
      category,
      media: media || null,
      mediaType: mediaType === "video" ? "video" : "image",
      start: start || null,
      end: end || null,
      location: location || "",
      source: url.includes("linkedin.com") ? "LinkedIn" : "Manual import",
      status: "draft",
      created: new Date().toISOString(),
    };
    db.news.unshift(n);
    // A manual import brings back a previously deleted story.
    db.deleted = db.deleted.filter((d) => d !== n.bot + " " + n.url);
    save();
    res.json(n);
  } catch (e) {
    next(e);
  }
});
app.delete("/api/news/:id", (req, res) => {
  const n = db.news.find((n) => n.id === req.params.id);
  if (!n) return res.status(404).json({ error: "Not found" });
  db.news = db.news.filter((x) => x !== n);
  db.deleted.push(n.bot + " " + n.url);
  db.deleted = db.deleted.slice(-5000);
  save();
  res.json({ ok: true });
});
app.patch("/api/news/:id", (req, res) => {
  const n = db.news.find((n) => n.id === req.params.id);
  if (!n) return res.status(404).json({ error: "Not found" });
  if (req.body.summary !== undefined) {
    if (!String(req.body.summary).trim())
      return res.status(400).json({ error: "Summary cannot be empty" });
    n.summary = summarize(req.body.summary);
  }
  if (req.body.start !== undefined || req.body.end !== undefined) {
    const start = req.body.start || null,
      end = req.body.end || null;
    if (
      (start || end) &&
      (!start ||
        !end ||
        isNaN(Date.parse(start)) ||
        isNaN(Date.parse(end)) ||
        new Date(end) <= new Date(start))
    )
      return res
        .status(400)
        .json({ error: "Provide a valid event start and end time" });
    n.start = start;
    n.end = end;
    if (req.body.location !== undefined) n.location = String(req.body.location);
  }
  if (["approved", "draft", "archived"].includes(req.body.status))
    n.status = req.body.status;
  save();
  res.json(n);
});
app.get("/api/news/:id/calendar", (req, res) => {
  const n = db.news.find((n) => n.id === req.params.id);
  if (!n?.start)
    return res.status(404).send("Event date has not been provided");
  res.type("text/calendar").attachment("event.ics").send(calendar(n));
});
async function send(id, ids) {
  const b = getBot(id),
    s = sessionView();
  if (s.status !== "connected") throw Error("Connect WhatsApp before sending");
  if (!b.selectedGroups.length) throw Error("Select at least one group");
  if (busy.has("send:" + id)) throw Error("A send is already running");
  busy.add("send:" + id);
  let count = 0;
  try {
    const w = await import("whatsapp-web.js");
    const client = getClient();
    for (const n of db.news.filter(
      (n) =>
        n.bot === id &&
        n.status === "approved" &&
        b.categories.includes(n.category) &&
        matchesDate(b, n) &&
        (!ids || ids.includes(n.id)),
    )) {
      n.deliveredGroups ??= [];
      for (const group of b.selectedGroups) {
        if (n.deliveredGroups.includes(group)) continue;
        if (!s.groups.some((g) => g.id === group))
          throw Error("A selected group is no longer available");
        const caption = `*${n.title}*\n${n.summary}\n${n.url}\n\n${disclaimers[id]}`;
        n.deliveryProgress ??= {};
        const progress = (n.deliveryProgress[group] ??= {});
        if (!progress.messageSent) {
          if (!n.media && !n.mediaChecked) {
            await addPostImage(n);
            save();
          }
          // Download first; if the photo is unavailable, send text instead.
          const data = n.media
            ? await fetchPublicMedia(n.media).catch((e) => {
                console.error("Media skipped:", n.media, e.message);
                return null;
              })
            : null;
          if (data) {
            const m = new w.default.MessageMedia(
              data.mime,
              data.buffer.toString("base64"),
              n.mediaType === "video" ? "news.mp4" : "news.jpg",
            );
            await client.sendMessage(group, m, { caption });
          } else await client.sendMessage(group, caption);
          progress.messageSent = true;
          save();
        }
        if (n.start && !progress.calendarSent) {
          await client.sendMessage(
            group,
            new w.default.MessageMedia(
              "text/calendar",
              Buffer.from(calendar(n)).toString("base64"),
              "event.ics",
            ),
            { sendMediaAsDocument: true, caption: "Add to your calendar" },
          );
          progress.calendarSent = true;
          save();
        }
        n.deliveredGroups.push(group);
        db.history.unshift({
          id: makeId(),
          bot: id,
          title: n.title,
          group: s.groups.find((g) => g.id === group)?.name || group,
          time: new Date().toISOString(),
        });
        save();
        count++;
      }
      n.status = "sent";
      save();
    }
    return { sent: count };
  } finally {
    busy.delete("send:" + id);
  }
}
// A story's photo from its page's preview image (og:image). The story is
// marked checked only once its page loaded, so failed fetches retry later.
async function addPostImage(n) {
  try {
    const media = postImage(await fetchPublic(n.url), n.url);
    n.mediaChecked = true;
    if (media) {
      n.media = media;
      n.mediaType = "image";
    }
  } catch {}
}
// Fill in photos for stories collected without one, one page at a time.
let backfilling = false;
async function backfillImages() {
  if (backfilling) return;
  backfilling = true;
  try {
    for (const n of db.news.filter(
      (n) => !n.media && !n.mediaChecked && n.status !== "example",
    )) {
      await addPostImage(n);
      if (n.media) save();
      await new Promise((r) => setTimeout(r, 1000));
    }
    save();
  } finally {
    backfilling = false;
  }
}
setTimeout(backfillImages, 5000);
async function fetchPublicMedia(url) {
  url = await safeUrl(url);
  const r = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw Error("Unable to download attachment");
  const mime = (r.headers.get("content-type") || "").split(";")[0];
  if (!/^(image|video)\//.test(mime))
    throw Error("Attachment must be a photo or video");
  const reader = r.body.getReader();
  let chunks = [],
    size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16 * 1024 * 1024) {
      await reader.cancel();
      throw Error("Attachment exceeds 16 MB");
    }
    chunks.push(Buffer.from(value));
  }
  return { mime, buffer: Buffer.concat(chunks) };
}
app.post("/api/bots/:id/send", async (req, res, next) => {
  try {
    if (req.body.ids !== undefined && !Array.isArray(req.body.ids))
      throw Error("Invalid story selection");
    res.json(await send(getBot(req.params.id).id, req.body.ids));
  } catch (e) {
    next(e);
  }
});
let ticking = false;
setInterval(async () => {
  if (ticking) return;
  ticking = true;
  try {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(new Date())
        .map((p) => [p.type, p.value]),
    );
    const day = `${parts.year}-${parts.month}-${parts.day}`,
      time = `${parts.hour}:${parts.minute}`;
    for (const b of db.bots) {
      try {
        if (
          b.autoTrigger &&
          (!b.lastScan || Date.now() - Date.parse(b.lastScan) > 30 * 60 * 1000)
        )
          await scan(b.id);
        if (b.autoSend && time >= b.time && b.lastScheduled !== day) {
          await send(b.id);
          b.lastScheduled = day;
          b.lastError = null;
          save();
        }
      } catch (e) {
        b.lastError = e.message;
      }
    }
  } finally {
    ticking = false;
  }
}, 30000).unref();
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message || "Request failed" });
});
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Bridge newsroom: http://localhost:${port}`);
  if (fs.existsSync(sessionPath(file)))
    connectWhatsApp(file).catch((e) =>
      console.error("WhatsApp reconnect:", e.message),
    );
});
server.on("error", (e) => {
  console.error(e.message);
  process.exit(1);
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    try {
      await getClient().destroy();
    } catch {}
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
