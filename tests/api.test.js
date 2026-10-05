import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
let child, dir;
const root = "http://127.0.0.1:3456/api/";
async function req(route, data, method = "POST") {
  const r = await fetch(root + route, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  return { status: r.status, body: await r.json() };
}
before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "bridge-test-"));
  child = spawn(process.execPath, ["server.js"], {
    env: {
      ...process.env,
      PORT: "3456",
      BRIDGE_DATA_FILE: path.join(dir, "state.json"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(Error("Server startup timed out")),
      10000,
    );
    child.stdout.once("data", () => {
      clearTimeout(timeout);
      resolve();
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(Error("Server exited: " + code));
    });
  });
});
after(async () => {
  if (child) {
    child.kill("SIGTERM");
    await new Promise((resolve) => child.once("exit", resolve));
  }
  await rm(dir, { recursive: true, force: true });
});
test("both bot views share one disconnected WhatsApp account", async () => {
  const { body } = await req("state", undefined, "GET");
  assert.deepEqual(body.sessions.indo, body.sessions.robotics);
  assert.equal(body.sessions.indo.status, "disconnected");
  assert.equal(body.news.length, 0);
});
test("schedules and categories remain independent", async () => {
  assert.equal(
    (await req("bots/robotics", { time: "11:45", autoTrigger: true }, "PATCH"))
      .status,
    200,
  );
  const { body } = await req("state", undefined, "GET");
  assert.equal(body.bots[0].time, "09:00");
  assert.equal(body.bots[1].time, "11:45");
  assert.equal(body.bots[0].autoTrigger, false);
  assert.equal(
    (await req("bots/indo", { time: "25:99" }, "PATCH")).status,
    400,
  );
  assert.equal(
    (await req("bots/robotics", { categories: ["Trade"] }, "PATCH")).status,
    400,
  );
});
test("fake groups cannot become delivery targets", async () => {
  assert.equal(
    (await req("bots/indo", { selectedGroups: ["fake@g.us"] }, "PATCH")).status,
    400,
  );
  assert.equal((await req("bots/indo/send", {})).status, 400);
});
test("private source addresses are rejected", async () => {
  const { status, body } = await req("sources", {
    bot: "indo",
    name: "Private",
    type: "rss",
    url: "http://127.0.0.1/private",
  });
  assert.equal(status, 400);
  assert.match(body.error, /Private/);
});
test("manual event creates a draft and a calendar download", async () => {
  const { status, body } = await req("news", {
    bot: "indo",
    title: "Test India–Germany conference",
    summary: "Research connections across two countries.",
    url: "https://example.com/event",
    category: "Events",
    start: "2026-10-10T03:30:00Z",
    end: "2026-10-10T04:30:00Z",
    location: "Delhi",
  });
  assert.equal(status, 200);
  assert.equal(body.status, "draft");
  const r = await fetch(root + "news/" + body.id + "/calendar");
  assert.equal(r.status, 200);
  assert.match(await r.text(), /DTSTART:20261010T033000Z/);
  assert.equal(
    (await req("news/" + body.id, { status: "approved" }, "PATCH")).body.status,
    "approved",
  );
});

test("LinkedIn sources need a public company or post URL", async () => {
  const { status, body } = await req("sources", {
    bot: "robotics",
    name: "LinkedIn test",
    type: "linkedin",
    url: "https://www.linkedin.com/",
  });
  assert.equal(status, 400);
  assert.match(body.error, /homepage/);
  const { body: state } = await req("state", undefined, "GET");
  assert.equal(state.integrations.linkedinCollection, "public-html");
});

test("Robotics bot only accepts LinkedIn sources", async () => {
  const { status, body } = await req("sources", {
    bot: "robotics",
    name: "RSS test",
    type: "rss",
    url: "https://spectrum.ieee.org/feeds/topic/robotics.rss",
  });
  assert.equal(status, 400);
  assert.match(body.error, /only collects from LinkedIn/);
  const { body: state } = await req("state", undefined, "GET");
  const robotics = state.sources.filter((s) => s.bot === "robotics");
  assert.ok(robotics.length > 1);
  assert.ok(robotics.every((s) => s.type === "linkedin"));
});

test("each bot keeps its own news date filter", async () => {
  const { body: state } = await req("state", undefined, "GET");
  assert.ok(state.bots.every((b) => b.dateFilter === "today"));
  assert.equal(
    (
      await req(
        "bots/indo",
        { dateFilter: "date", filterDate: "2026-10-01" },
        "PATCH",
      )
    ).body.filterDate,
    "2026-10-01",
  );
  assert.equal(
    (await req("bots/robotics", { dateFilter: "all" }, "PATCH")).body
      .dateFilter,
    "all",
  );
  assert.equal(
    (await req("bots/robotics", { dateFilter: "yesterday" }, "PATCH")).status,
    400,
  );
  assert.equal(
    (
      await req(
        "bots/robotics",
        { dateFilter: "date", filterDate: "" },
        "PATCH",
      )
    ).status,
    400,
  );
});

test("deleting a story removes it", async () => {
  const { body: n } = await req("news", {
    bot: "indo",
    title: "Story to delete",
    summary: "Short summary.",
    category: "Trade",
    url: "https://example.com/delete-me",
  });
  assert.equal((await req("news/" + n.id, undefined, "DELETE")).status, 200);
  const { body: state } = await req("state", undefined, "GET");
  assert.ok(!state.news.some((x) => x.id === n.id));
  assert.equal((await req("news/" + n.id, undefined, "DELETE")).status, 404);
});
