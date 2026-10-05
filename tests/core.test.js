import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize, classify, calendar } from "../lib.js";
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
