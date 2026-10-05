import puppeteer from "puppeteer";
const base = "http://localhost:3000";
const name = "UI source verification " + Date.now();
const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base, { waitUntil: "networkidle2" });
  await page.locator('[data-page="sources"]').click();
  await page.locator('[data-action="source"]').click();
  await page.type('#source-form [name="name"]', name);
  await page.select('#source-form [name="type"]', "linkedin");
  await page.type(
    '#source-form [name="url"]',
    "https://www.linkedin.com/company/boston-dynamics/",
  );
  await page.locator('#source-form button[type="submit"]').click();
  await page.waitForFunction(
    (name) =>
      [...document.querySelectorAll(".source-card h3")].some(
        (el) => el.textContent === name,
      ),
    {},
    name,
  );
  const card = await page.$eval(
    ".list-grid",
    (el, name) =>
      [...el.querySelectorAll(".source-card")]
        .find((el) => el.querySelector("h3").textContent === name)
        .querySelector("[data-source-edit]").dataset.sourceEdit,
    name,
  );
  await page.locator(`[data-source-edit="${card}"]`).click();
  const form = await page.$eval("#source-form", (el) => ({
    name: el.elements.name.value,
    url: el.elements.url.value,
    type: el.elements.type.value,
    disabled: el.elements.type.disabled,
  }));
  if (form.name !== name || form.type !== "linkedin" || !form.disabled)
    throw Error("Source editor did not populate");
  await page.$eval(
    '#source-form [name="name"]',
    (el, name) => (el.value = name + " edited"),
    name,
  );
  await page.locator('#source-form button[type="submit"]').click();
  await page.waitForFunction(
    (name) =>
      [...document.querySelectorAll(".source-card h3")].some(
        (el) => el.textContent === name + " edited",
      ),
    {},
    name,
  );
  const state = await (await fetch(base + "/api/state")).json();
  if (
    state.sources.filter((s) => s.id === card && s.name === name + " edited")
      .length !== 1
  )
    throw Error("Source edit did not update the original");
  if (errors.length) throw Error(errors.join(";"));
  console.log(
    "Source UI verified: add public LinkedIn URL, edit in place, no API-key controls, no browser errors.",
  );
} finally {
  const state = await (await fetch(base + "/api/state")).json();
  for (const s of state.sources.filter(
    (s) => s.name === name || s.name === name + " edited",
  ))
    await fetch(base + "/api/sources/" + s.id, { method: "DELETE" });
  await browser.close();
}
