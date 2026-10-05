# Bridge · two WhatsApp news bots

A local newsroom for Indo–German news in India and a separate Robotics & Technology bot. One QR login powers both bots. Each bot has its own selected WhatsApp groups, sources, categories, and schedule.

## Run

Requires Node.js 24 or later.

```sh
npm install
npm start
```

Open http://localhost:3000. Use the bot selector to switch workspaces. Connect WhatsApp, generate a QR code, and scan it from WhatsApp → Linked devices. Select real groups, check sources or import stories, review summaries, approve stories, and send or enable daily delivery.

`npm install` installs the Chromium browser used by whatsapp-web.js. If Chromium is unavailable, set `CHROME_PATH` to your Chrome executable before starting, for example on macOS:

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm start
```

## What works

- One shared persistent WhatsApp Web QR authentication for both bots.
- Real group discovery and separate group selection; no example groups are send targets.
- Indo–German categories: Trade, Research, Education, Culture & arts, Politics, Events. Messages end with a "Auto-collected from public sources. Not verified by a human." disclaimer.
- Robotics bot categories: Robotics and Technology. It collects industry news from LinkedIn company pages only (Boston Dynamics, Universal Robots, FANUC America, Agility Robotics, Figure AI, The Robot Report). Its messages carry a "not verified by a human" disclaimer.
- Public RSS feeds and website headline collection, source management, and deduplication.
- LinkedIn post import with source link, pasted summary, and optional direct media URL.
- Direct public LinkedIn company/post/article HTML collection, including available photos and video URLs; no search API or API key.
- Review queue with summary editing and explicit approval.
- Delete button on every story (card and review dialog, with a confirm click). Deleted stories are not collected again; importing the same link manually brings it back.
- Stories collected without a photo (LinkedIn and website) get the page's own photo from its preview image, or a LinkedIn video post's cover. This runs in the background after startup and after each source check; the dashboard shows new photos as they arrive. LinkedIn's generic "Posted on LinkedIn" image is ignored, and text-only posts stay without a photo. If a photo can't be downloaded at send time, the story goes out as text.
- Photos/videos (direct public URLs, maximum 16 MB); plain text when no media is present.
- Event ICS downloads and WhatsApp document attachments when event dates are entered.
- Source checking every 30 minutes; daily sending in Asia/Kolkata. Server must stay running.
- Per-story, per-group successful-delivery tracking, with retry of remaining groups after failures.
- Local JSON persistence and real delivery history.

## Operational limits

WhatsApp integration uses **unofficial whatsapp-web.js**, not the Meta Business API. WhatsApp may restrict accounts using unofficial automation. Only pair accounts and send to groups you are authorized to manage. The shared connection and live sending require your QR scan and have not been verified without an account.

LinkedIn collection fetches public HTML directly from configured company, post, or article URLs. The initial LinkedIn sources are the Indo-German Chamber of Commerce and Boston Dynamics company pages. Edit them or add more in Sources using a public company page or individual post link. A company’s main page may expose public posts even when its dedicated /posts/ page requires sign-in. The LinkedIn homepage is not a news source. The parser reads structured post data, guest post cards, and public post metadata, then fetches up to six linked posts per scan. It collects text, source links, dates, photos, and direct video URLs when the page exposes them. No external search API or API key is used.

LinkedIn frequently blocks automated requests or requires authentication. The collector does not bypass login walls, CAPTCHAs, or verification. Blocked pages show an actionable source error. Public HTML markup and media availability can change. This is a best-effort public collector, not a guarantee of complete LinkedIn coverage. Manual import remains available.

Website collection extracts candidate linked headlines and categorizes them with keyword rules. It is not a semantic article summarizer and can collect navigation links. Review against the source before sending. RSS summaries are truncated source excerpts; manual summaries can be edited. The displayed initial cards are clearly labeled illustrative examples, not factual current news or sendable stories.

Event dates are entered by the editor, not inferred from collected headlines. Calendar files work with Google Calendar, Apple Calendar, and Outlook via import; WhatsApp does not have a native interactive “Add to calendar” button. Public media must be available and licensed for sharing. Video support depends on the connected WhatsApp client and browser codecs.

This is a single-user local application. It listens on 127.0.0.1 only. Do not expose it on a public network without authentication, HTTPS, and deployment hardening. Data and WhatsApp sessions live in `data/` and are excluded from Git. Protect that directory. Public source URLs are checked for private addresses, but production networking should additionally block private egress to defend against DNS rebinding.

Daily automation attempts approved deliveries at or after the configured time and records completion once per India-time calendar day. New stories stay drafts until approved. Both bots can be separately scheduled. There is no durable job queue or exact-once guarantee if the process crashes between delivery and recording it; run one server process only. Server logs and the activity view show operational state; source failures are shown on the sources page.

## Test

```sh
npm test
```

Checks summary limits, category routing, event ICS formatting, separate bot settings, group validation, shared session views, and calendar API downloads. Browser checks in `tests/ui-check.mjs` also verify menus and mobile layout. `tests/qr-check.mjs` generates a QR on the running server and checks that both bot views share it, without scanning or sending. Live QR pairing and actual group delivery require a WhatsApp account and are not covered by offline tests.

# news-bot

# news-bot
