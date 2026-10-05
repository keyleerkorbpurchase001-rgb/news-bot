import * as cheerio from "cheerio";
import { summarize } from "./lib.js";
export function linkedinUrl(raw, base = "https://www.linkedin.com/") {
  try {
    const u = new URL(raw, base);
    if (
      u.protocol !== "https:" ||
      !(u.hostname === "linkedin.com" || u.hostname.endsWith(".linkedin.com"))
    )
      return null;
    u.search = "";
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}
export function validateLinkedinSource(raw) {
  const url = linkedinUrl(raw);
  if (!url) throw Error("Use a public LinkedIn HTTPS URL");
  const u = new URL(url);
  if (
    !/^\/(company\/[^/]+(?:\/posts\/?)?|posts\/[^/]+|feed\/update\/urn:li:activity:\d+\/?|pulse\/[^/]+)\/?$/.test(
      u.pathname,
    )
  )
    throw Error(
      "Enter a public LinkedIn company, post, or article URL; the LinkedIn homepage is not a news source",
    );
  return url;
}
const postUrl = (raw) => {
  const url = linkedinUrl(raw);
  return url &&
    /^\/(posts\/|feed\/update\/urn:li:activity:|pulse\/)/.test(
      new URL(url).pathname,
    )
    ? url
    : null;
};
const mediaUrl = (raw, base) => {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const u = new URL(raw, base);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
};
export function parseLinkedin(html, url) {
  const $ = cheerio.load(html),
    items = new Map(),
    links = new Set();
  const add = (item) => {
    const canonical = postUrl(item.url || url);
    if (!canonical || !item.summary?.trim()) return;
    const current = items.get(canonical);
    if (!current || item.summary.length > current.summary.length)
      items.set(canonical, {
        ...item,
        url: canonical,
        title: summarize(item.title || item.summary).slice(0, 160),
        summary: summarize(item.summary),
        media: item.media || null,
        mediaType: item.mediaType || "image",
      });
  };
  const walk = (node) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    const types = [node["@type"]].flat();
    if (
      types.some((type) =>
        [
          "SocialMediaPosting",
          "Article",
          "BlogPosting",
          "NewsArticle",
        ].includes(type),
      )
    ) {
      const image = [node.image].flat()[0],
        video = [node.video].flat()[0];
      add({
        url:
          node.url ||
          node.mainEntityOfPage?.["@id"] ||
          (typeof node.mainEntityOfPage === "string"
            ? node.mainEntityOfPage
            : url),
        title: node.headline || node.name,
        summary:
          node.articleBody || node.text || node.description || node.headline,
        published: node.datePublished || null,
        media: mediaUrl(
          video?.contentUrl ||
            (typeof image === "string"
              ? image
              : image?.url || image?.contentUrl),
          url,
        ),
        mediaType: video?.contentUrl ? "video" : "image",
      });
    }
    for (const value of Object.values(node))
      if (value && typeof value === "object") walk(value);
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      walk(JSON.parse($(el).text()));
    } catch {}
  });
  $(
    '[data-id^="urn:li:activity:"], article, .base-main-card, .feed-shared-update-v2',
  ).each((_, el) => {
    const card = $(el);
    const activity = card.attr("data-id");
    const link =
      postUrl(
        card
          .find(
            'a[href*="/posts/"], a[href*="/feed/update/"], a[href*="/pulse/"]',
          )
          .first()
          .attr("href"),
      ) ||
      (activity
        ? postUrl("https://www.linkedin.com/feed/update/" + activity + "/")
        : null);
    const text = card
      .find(
        '.attributed-text-segment-list__content, .feed-shared-update-v2__description, .update-components-text, [data-test-id="main-feed-activity-card__commentary"], .main-feed-activity-card__commentary',
      )
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();
    if (!link || !text) return;
    const image = card
      .find(
        "img[data-delayed-url], .feed-images-content img, .update-components-image img",
      )
      .first();
    const video = card
      .find("video source[src], video[src]")
      .first()
      .attr("src");
    add({
      url: link,
      title: text.split(/(?<=[.!?])\s|\n/)[0],
      summary: text,
      published: card.find("time[datetime]").attr("datetime") || null,
      media: mediaUrl(
        video || image.attr("data-delayed-url") || image.attr("src"),
        url,
      ),
      mediaType: video ? "video" : "image",
    });
  });
  $("a[href]").each((_, el) => {
    const link = postUrl($(el).attr("href"));
    if (link) links.add(link);
  });
  if (postUrl(url) && !items.size) {
    const title = $('meta[property="og:title"]').attr("content"),
      description = $('meta[property="og:description"]').attr("content");
    if (
      description &&
      !/sign in|join linkedin|log in to linkedin/i.test(
        (title || "") + " " + description,
      )
    ) {
      const video = $(
        'meta[property="og:video:secure_url"], meta[property="og:video"]',
      )
        .first()
        .attr("content");
      add({
        url,
        title,
        summary: description,
        media: mediaUrl(
          video || $('meta[property="og:image"]').attr("content"),
          url,
        ),
        mediaType: video ? "video" : "image",
      });
    }
  }
  const blocked =
    !items.size &&
    !links.size &&
    (/authwall|checkpoint|captcha|sign in to (?:view|see)|join linkedin to (?:view|see)/i.test(
      html,
    ) ||
      /sign in|login/i.test($("title").text()));
  return {
    items: [...items.values()],
    links: [...links].slice(0, 12),
    blocked,
  };
}
export async function scrapeLinkedin(source, fetchHtml) {
  const url = validateLinkedinSource(source.url);
  let parsed = parseLinkedin(await fetchHtml(url), url);
  const items = new Map(parsed.items.map((i) => [i.url, i]));
  if (parsed.blocked)
    throw Error(
      "LinkedIn requires sign-in or verification for this page. Public collection is unavailable.",
    );
  let failed = 0;
  for (const link of parsed.links
    .filter((link) => !items.has(link))
    .slice(0, 6)) {
    try {
      const post = parseLinkedin(await fetchHtml(link), link);
      if (post.blocked) {
        failed++;
        continue;
      }
      for (const item of post.items) items.set(item.url, item);
    } catch {
      failed++;
    }
  }
  if (!items.size)
    throw Error(
      failed
        ? "LinkedIn blocked the public post pages. Import the posts manually or use another public source."
        : "No public post text was available in this page. Use a company posts page or an individual public post URL.",
    );
  return [...items.values()].slice(0, 20);
}
