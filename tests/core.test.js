import { test } from "node:test";
import assert from "node:assert/strict";
import {
  summarize,
  classify,
  calendar,
  indiaDay,
  matchesDate,
} from "../lib.js";
test("summaries strip markup and stay short", () => {
  assert.equal(summarize("<p> India   and Germany </p>"), "India and Germany");
  assert.ok(summarize("hello ".repeat(80)).length <= 230);
});
test("bot categories classify relevant stories", () => {
  assert.equal(classify("DAAD scholarships for students", "indo"), "Education");
  assert.equal(
    classify("German robotics conference in India", "indo"),
    "Events",
  );
  assert.equal(
    classify("Collaborative robots in manufacturing", "robotics"),
    "Robotics",
  );
});
test("calendar exports UTC event times and escapes fields", () => {
  const ics = calendar({
    id: "test",
    title: "Research, India; Germany",
    start: "2026-10-10T09:00:00+05:30",
    end: "2026-10-10T10:00:00+05:30",
    location: "Delhi\nHall 2",
    summary: "New research",
    url: "https://example.com",
  });
  assert.match(ics, /DTSTART:20261010T033000Z/);
  assert.match(ics, /SUMMARY:Research\\, India\\; Germany/);
  assert.match(ics, /LOCATION:Delhi\\nHall 2/);
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
});

test("date filter matches India-time publish day, falling back to collection", () => {
  const today = indiaDay(new Date("2026-10-05T10:00:00Z"));
  assert.equal(today, "2026-10-05");
  // 20:00 UTC on Oct 4 is already Oct 5 in India.
  const late = { published: "2026-10-04T20:00:00Z" };
  assert.equal(matchesDate({ dateFilter: "today" }, late, today), true);
  const old = { published: "2026-10-01T08:00:00Z" };
  assert.equal(matchesDate({ dateFilter: "today" }, old, today), false);
  assert.equal(
    matchesDate({ dateFilter: "date", filterDate: "2026-10-01" }, old, today),
    true,
  );
  assert.equal(matchesDate({ dateFilter: "all" }, old, today), true);
  const undated = { published: null, created: "2026-10-05T03:00:00Z" };
  assert.equal(matchesDate({ dateFilter: "today" }, undated, today), true);
});
