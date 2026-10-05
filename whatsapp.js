// WhatsApp Web session management for whatsapp-web.js.
// One shared client (LocalAuth profile "shared") powers both bots.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import QRCode from "qrcode";

const require = createRequire(import.meta.url);
const { WAState } = require("whatsapp-web.js/src/util/Constants");

const CONNECTED = "connected";
const ACTIVE = ["starting", "qr", CONNECTED];
const GROUPS_TIMEOUT_MS = 60000;
const sessions = new Map();

export function sessionPath(dataFile) {
  return path.join(path.dirname(dataFile), "sessions", "session-shared");
}

// CHROME_PATH wins, then a system Chrome/Chromium, then the Chromium bundled with Puppeteer.
export function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter(Boolean);
  const found = candidates.find((p) => fs.existsSync(p));
  if (found) return found;
  try {
    const puppeteer = require("whatsapp-web.js/node_modules/puppeteer");
    const bundled = puppeteer.executablePath?.();
    if (bundled && fs.existsSync(bundled)) return bundled;
  } catch {}
  return null;
}

// Client errors come from minified WhatsApp Web code ("r: r"); make them readable.
export function sessionError(code, message) {
  if (code === "CHROME_MISSING")
    return "No Chrome or Chromium browser was found. Set CHROME_PATH to a Chrome executable and restart the server.";
  if (/Browser was not found|Target closed|Protocol error/i.test(message))
    return "The WhatsApp browser stopped unexpectedly. Generate a new QR code to reconnect.";
  if (/executable doesn't exist|spawn .* ENOENT/i.test(message))
    return "The configured Chrome executable could not be started. Check CHROME_PATH and restart the server.";
  return /^[a-zA-Z_$][\w$]*(:.*)?$/.test(message || "")
    ? "WhatsApp Web rejected the login (internal error: " + message + ")."
    : message;
}

export function sessionView() {
  const s = sessions.get("shared");
  return {
    status: s?.status || "disconnected",
    qr: s?.qr || null,
    error: s?.error || null,
    groups: s?.groups || [],
    groupsLoading: !!s?.loadingGroups,
    groupsError: s?.groupsError || null,
    version: s?.version || null,
  };
}

export function isConnected() {
  const s = sessions.get("shared");
  return s?.status === CONNECTED && !!s.client;
}

// The live client, for sending. Only call when isConnected() is true.
export function getClient() {
  const s = sessions.get("shared");
  if (s?.status !== CONNECTED || !s.client) throw Error("Not connected");
  return s.client;
}

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(Error("Timed out")), ms).unref(),
    ),
  ]);

// Fully tear down a client: log out of WhatsApp, then make sure no Chrome
// process is left holding the profile directory.
async function stopClient(client) {
  if (!client) return;
  if (client.pupBrowser?.isConnected?.()) {
    // logout() unlinks the device and wipes the LocalAuth profile.
    await withTimeout(client.logout(), 15000).catch(() => {});
  }
  if (client.pupBrowser?.isConnected?.())
    await client.pupBrowser.close().catch(() => {});
  await client.destroy().catch(() => {});
  // destroy() closes the browser, but fall back to killing the process tree if
  // Chrome ignored the graceful close.
  const proc = client.pupBrowser?.process?.();
  if (proc && proc.exitCode === null && !proc.killed) {
    try {
      proc.kill("SIGKILL");
    } catch {}
  }
}

async function restartCurrent() {
  const s = sessions.get("shared");
  if (!s?.client) return;
  await stopClient(s.client);
  if (sessions.get("shared") === s) sessions.set("shared", undefined);
}

// WhatsApp Web sets both start and end events; debounce so groups are read once per transition.
let lastState = null;
function scheduleGroups(s, delay = 3000) {
  clearTimeout(s.timer);
  s.timer = setTimeout(() => {
    if (sessions.get("shared") === s) refreshGroups().catch(() => {});
  }, delay).unref();
}

export async function refreshGroups() {
  const s = sessions.get("shared");
  if (!s?.client || s.status !== CONNECTED) return sessionView();
  if (s.loadingGroups) return sessionView();
  s.loadingGroups = true;
  try {
    const list = await withTimeout(s.client.getChats(), GROUPS_TIMEOUT_MS);
    s.groups = list
      .filter((c) => c.isGroup)
      .map((c) => ({
        id: c.id._serialized,
        name: c.name,
        members: c.participants?.length || 0,
      }));
    s.groupsError = null;
  } catch (e) {
    console.error("WhatsApp groups:", e);
    s.groupsError = sessionError("GROUPS_FAILED", e.message);
  } finally {
    s.loadingGroups = false;
  }
  return sessionView();
}

export async function connectWhatsApp(dataFile) {
  const s = sessions.get("shared");
  if (s && ACTIVE.includes(s.status)) return sessionView();
  await restartCurrent();
  const next = { status: "starting", groups: [], version: null };
  sessions.set("shared", next);
  try {
    const w = await import("whatsapp-web.js");
    const { Client, LocalAuth } = w.default;
    const chrome = chromePath();
    if (!chrome) {
      next.status = "error";
      next.error = sessionError("CHROME_MISSING");
      return sessionView();
    }
    const sessionDir = sessionPath(dataFile);
    fs.mkdirSync(path.dirname(sessionDir), { recursive: true });
    next.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "shared",
        dataPath: path.dirname(sessionDir),
      }),
      authTimeoutMs: 5 * 60 * 1000,
      puppeteer: {
        headless: true,
        args: ["--disable-dev-shm-usage"],
        executablePath: chrome,
      },
    });
    const client = next.client;
    client.on("qr", async (qr) => {
      next.qr = await QRCode.toDataURL(qr);
      next.status = "qr";
      next.error = null;
    });
    client.on("ready", async () => {
      next.status = CONNECTED;
      next.qr = null;
      next.error = null;
      try {
        next.version = await client.getWWebVersion();
      } catch {}
      refreshGroups().catch(() => {});
    });
    client.on("auth_failure", (message) => {
      next.status = "error";
      next.qr = null;
      next.error = message || "WhatsApp rejected the login";
    });
    client.on("disconnected", (reason) => {
      if (sessions.get("shared") !== next) return;
      next.status = "disconnected";
      next.qr = null;
      next.groups = [];
      next.groupsError = null;
      next.unpaired = String(reason).toUpperCase().includes("LOGOUT");
    });
    client.on("change_state", (state) => {
      if (sessions.get("shared") !== next || state === lastState) return;
      lastState = state;
      if (state === WAState.UNPAIRED || state === WAState.UNPAIRED_IDLE)
        next.unpaired = true;
      if (state === WAState.CONNECTED && next.status === CONNECTED)
        scheduleGroups(next);
    });
    client.initialize().catch((e) => {
      if (sessions.get("shared") !== next) return;
      next.status = "error";
      next.qr = null;
      next.error = sessionError("INIT_FAILED", e.message);
    });
  } catch (e) {
    next.status = "error";
    next.qr = null;
    next.error = sessionError("INIT_FAILED", e.message);
  }
  return sessionView();
}

export async function clearSession(dataFile) {
  const s = sessions.get("shared");
  if (s?.client) await stopClient(s.client);
  fs.rmSync(sessionPath(dataFile), { recursive: true, force: true });
  sessions.set("shared", undefined);
  return sessionView();
}

export async function disconnectWhatsApp(dataFile) {
  return clearSession(dataFile);
}
