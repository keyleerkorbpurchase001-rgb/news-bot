import { randomUUID } from "node:crypto";
export const categories = [
  "Trade",
  "Research",
  "Education",
  "Culture & arts",
  "Politics",
  "Events",
];
export function summarize(text) {
  const clean = String(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > 230
    ? clean.slice(0, 227).replace(/\s+\S*$/, "") + "…"
    : clean;
}
export function classify(text, bot) {
  if (bot === "robotics")
    return /robot|cobot|automat|drone|humanoid/i.test(text)
      ? "Robotics"
      : "Technology";
  const rules = [
    ["Events", /event|conference|webinar|festival|summit/i],
    [
      "Education",
      /school|universit|student|scholarship|education|daad|study|bachelor|master|graduate/i,
    ],
    ["Research", /research|science|innovation/i],
    ["Culture & arts", /art|culture|film|music|goethe/i],
    ["Politics", /minister|diploma|government|politic/i],
  ];
  return rules.find(([, re]) => re.test(text))?.[0] || "Trade";
}
export function calendar(event) {
  const escape = (s) =>
    String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const dt = (s) =>
    new Date(s)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bridge//Newsroom//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@bridge.local`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(event.start)}`,
    `DTEND:${dt(event.end)}`,
    `SUMMARY:${escape(event.title)}`,
    `LOCATION:${escape(event.location)}`,
    `DESCRIPTION:${escape(event.summary + " " + event.url)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
export const makeId = () => randomUUID();
// Calendar day (YYYY-MM-DD) in India time.
export const indiaDay = (d = new Date()) =>
  new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
// A story's day: when it was published, or first collected if the source
// gives no date (website headlines).
export const storyDay = (n) => indiaDay(n.published || n.created);
// Bot date filter: "today", a chosen "date", or "all".
export function matchesDate(bot, n, today = indiaDay()) {
  if (bot.dateFilter === "all") return true;
  return storyDay(n) === (bot.dateFilter === "date" ? bot.filterDate : today);
}
