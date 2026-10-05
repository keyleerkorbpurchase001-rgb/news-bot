import puppeteer from "puppeteer";
const original = await (await fetch("http://localhost:3000/api/state")).json();
const originalTime = original.bots.find((b) => b.id === "robotics").time;
const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewport({ width: 1440, height: 1050 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "artifacts/dashboard.png", fullPage: true });
  await page.select("#bot-select", "robotics");
  if (!(await page.$eval("h1", (el) => el.textContent)).includes("connection"))
    throw Error("Overview did not render");
  await page.locator('[data-page="groups"]').click();
  if (
    !(await page.$eval("h1", (el) => el.textContent)).includes("right people")
  )
    throw Error("Groups failed");
  await page.locator('[data-page="automation"]').click();
  await page.$eval("#schedule-time", (el) => {
    el.value = "10:30";
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForNetworkIdle({ idleTime: 500 });
  await page.waitForFunction(
    () => document.querySelector("#schedule-time")?.value === "10:30",
  );
  await page.locator('[data-page="settings"]').click();
  if (
    !(await page.$eval(".panel-subtitle", (el) => el.textContent)).includes(
      "shared WhatsApp",
    )
  )
    throw Error("Shared-login text missing");
  await page.select("#bot-select", "indo");
  await page.locator('[data-page="overview"]').click();
  await page.setViewport({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/mobile.png", fullPage: true });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  if (overflow) throw Error("Mobile overflow");
  if (errors.length) throw Error(errors.join("; "));
  console.log(
    "UI checks passed: two workspaces, groups, schedule, shared login, mobile layout; no browser errors.",
  );
} finally {
  await fetch("http://localhost:3000/api/bots/robotics", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time: originalTime }),
  });
  await browser.close();
}
