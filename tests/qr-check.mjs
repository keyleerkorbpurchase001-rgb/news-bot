const root = "http://127.0.0.1:3000/api/";
await Promise.all(
  ["indo", "robotics"].map((bot) =>
    fetch(root + "bots/" + bot + "/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }),
  ),
);
const deadline = Date.now() + 45000;
let passed = false;
while (Date.now() < deadline) {
  const state = await (await fetch(root + "state")).json();
  const a = state.sessions.indo,
    b = state.sessions.robotics;
  if (a.status === "error") throw Error(a.error);
  if (a.status === "qr" && a.qr) {
    if (a.qr !== b.qr || a.status !== b.status)
      throw Error("Bots have different login sessions");
    console.log(
      "Verified: one real pairing QR is shared by both bot views. No login or messages sent.",
    );
    passed = true;
    break;
  }
  if (a.status === "connected") {
    if (b.status !== a.status) throw Error("Session mismatch");
    passed = true;
    console.log("Shared WhatsApp account already connected.");
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
if (!passed) throw Error("QR was not generated within 45 seconds");
