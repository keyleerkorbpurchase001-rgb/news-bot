import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseLinkedin,
  scrapeLinkedin,
  postImage,
  validateLinkedinSource,
} from "../linkedin.js";
const url = "https://www.linkedin.com/posts/example_activity-1234567890-test/";
test("structured LinkedIn posts include text, date and media without an API", () => {
  const html = `<script type="application/ld+json">${JSON.stringify({ "@type": "SocialMediaPosting", url, headline: "Research collaboration", articleBody: "Indian and German teams collaborate on robotics research.", datePublished: "2026-10-05", image: { url: "https://media.licdn.com/photo.jpg" } })}</script>`;
  const { items } = parseLinkedin(html, url);
  assert.equal(items.length, 1);
  assert.equal(items[0].media, "https://media.licdn.com/photo.jpg");
  assert.equal(items[0].published, "2026-10-05");
  assert.match(items[0].summary, /Indian and German/);
});
test("public guest company cards extract canonical links and delayed images", () => {
  const html = `<article data-id="urn:li:activity:1234567890"><a href="${url}?tracking=abc">Read</a><div class="attributed-text-segment-list__content">New robot developed for Indian manufacturing.</div><img data-delayed-url="https://media.licdn.com/robot.jpg"><time datetime="2026-10-05"></time></article>`;
  const result = parseLinkedin(
    html,
    "https://www.linkedin.com/company/example/posts/",
  );
  assert.equal(result.items[0].url, url);
  assert.equal(result.items[0].media, "https://media.licdn.com/robot.jpg");
});
test("public individual posts use Open Graph descriptions and video URLs", () => {
  const html =
    '<meta property="og:title" content="A new robot"><meta property="og:description" content="A short robotics update."><meta property="og:video:secure_url" content="https://media.licdn.com/demo.mp4">';
  const { items } = parseLinkedin(html, url);
  assert.equal(items[0].mediaType, "video");
  assert.equal(items[0].media, "https://media.licdn.com/demo.mp4");
});
test("missing media stays null and sign-in descriptions are not news", () => {
  const { items } = parseLinkedin(
    '<meta property="og:description" content="Research news.">',
    url,
  );
  assert.equal(items[0].media, null);
  assert.equal(
    parseLinkedin(
      '<title>Sign In | LinkedIn</title><meta property="og:description" content="Sign in to LinkedIn">',
      url,
    ).blocked,
    true,
  );
});
test("collector follows public post links directly and reports auth walls", async () => {
  const visited = [];
  const result = await scrapeLinkedin(
    { url: "https://www.linkedin.com/company/example/posts/" },
    async (link) => {
      visited.push(link);
      return visited.length === 1
        ? `<a href="${url}">Read update</a>`
        : '<meta property="og:description" content="Research update from India.">';
    },
  );
  assert.equal(visited.length, 2);
  assert.equal(result.length, 1);
  assert.ok(visited.every((v) => v.startsWith("https://www.linkedin.com/")));
  await assert.rejects(
    () =>
      scrapeLinkedin({ url }, async () => "<title>Sign In | LinkedIn</title>"),
    /sign-in/,
  );
});
test("source URLs reject homepages, login routes and foreign hosts", () => {
  assert.throws(
    () => validateLinkedinSource("https://www.linkedin.com/"),
    /homepage/,
  );
  assert.throws(() => validateLinkedinSource("https://www.linkedin.com/login"));
  assert.throws(() =>
    validateLinkedinSource("https://linkedin.com.example.net/posts/fake"),
  );
  assert.equal(
    validateLinkedinSource(
      "https://www.linkedin.com/company/example/posts/?x=1",
    ),
    "https://www.linkedin.com/company/example/posts/",
  );
});

test("post photo comes from the page preview, never LinkedIn's placeholder", () => {
  const url = "https://www.linkedin.com/posts/acme_launch-activity-1";
  assert.equal(
    postImage(
      '<meta property="og:image" content="https://media.licdn.com/dms/image/v2/abc/feedshare-shrink_800/0/1?e=1&amp;v=beta">',
      url,
    ),
    "https://media.licdn.com/dms/image/v2/abc/feedshare-shrink_800/0/1?e=1&v=beta",
  );
  assert.equal(
    postImage(
      '<meta property="og:image" content="https://static.licdn.com/aero-v1/sc/h/c45fy346jw096z9pbphyyhdz7">',
      url,
    ),
    null,
  );
  assert.equal(postImage("<html></html>", url), null);
  assert.equal(
    postImage(
      '<meta property="og:image" content="https://static.licdn.com/aero-v1/sc/h/x"><main><div class="share-native-video"><video data-poster-url="https://media.licdn.com/dms/image/v2/a/videocover-high/0/1"></video></div></main>',
      url,
    ),
    "https://media.licdn.com/dms/image/v2/a/videocover-high/0/1",
  );
});
