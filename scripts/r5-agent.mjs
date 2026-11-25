import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { clickSelector, evaluate, launchBrowser, navigate, openPage, serveDist, waitFor } from "./browser-smoke.mjs";

const endpoint = "http://127.0.0.1:43765/agent";
const connector = spawn(process.execPath, [fileURLToPath(new URL("../tools/schematic-agent/connector.mjs", import.meta.url))],
  { windowsHide: true, stdio: ["ignore", "pipe", "inherit"] });
const server = await serveDist(fileURLToPath(new URL("../apps/web/dist", import.meta.url)));
let browser, page, token;

try {
  await Promise.race([
    once(connector.stdout, "data"),
    once(connector, "exit").then(([code]) => { throw new Error("Connector exited: " + code); })
  ]);
  browser = await launchBrowser();
  page = await openPage(browser.baseUrl, "about:blank");
  await page.send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 980, deviceScaleFactor: 1, mobile: false });
  await navigate(page, server.url);
  await waitFor(page, () => !!document.querySelector("[data-schematic-paper] svg"), "Editor did not initialize");
  await page.send("Browser.grantPermissions", {
    origin: new URL(server.url).origin, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"]
  });
  const bootstrap = await beginPairing();
  assert.equal(bootstrap.site, server.url);
  assert.equal(bootstrap.sheetId, "top");
  assert(bootstrap.projectId);
  await clickSelector(page, "[data-agent-copy]");
  await waitFor(page, () => document.querySelector("[data-agent-feedback]").textContent === "Text copied.", "Clipboard copy failed");
  const clipboard = await evaluate(page, () => navigator.clipboard.readText());
  assert(clipboard.includes(bootstrap.code) && !clipboard.includes('"components":'));
  const wrongCode = bootstrap.code.slice(0, -1) + (bootstrap.code.endsWith("a") ? "b" : "a");
  assert.equal((await rpc({ method: "pair", code: wrongCode })).code, "PAIRING_INVALID");
  const pair = await rpc({ method: "pair", code: bootstrap.code });
  assert(pair.ok && pair.token);
  token = pair.token;
  assert.equal((await rpc({ method: "pair", code: bootstrap.code })).code, "PAIRING_INVALID");
  await waitFor(page, () => document.querySelector("[data-agent-banner]").dataset.agentStatus === "connected", "AI did not connect");
  assert.equal(await evaluate(page, () => document.querySelector("[data-agent-state]").textContent), "Current status: AI connected");
  assert.equal(await evaluate(page, () => document.querySelector("[data-agent-prompt]").value), "");
  await clickSelector(page, "[data-agent-close]");

  const top = bootstrap.sheetId;
  const resistor = { op: "add-component", sheetId: top, component: { type: "resistor", id: "agent-r1", ref: "R1", x: 450, y: 300, values: { main: "1k" } } };
  assert.equal((await transact("no-read", 0, [resistor])).code, "READ_REQUIRED");
  const empty = await snapshot();
  const def = empty.catalog.find(item => item.type === "resistor");
  const pin = def.pins[0];
  const start = { x: resistor.component.x + pin.x, y: resistor.component.y + pin.y };
  const end = { x: start.x - 70, y: start.y };
  const actions = [
    resistor,
    { op: "add-wire", sheetId: top, id: "agent-wire", points: [end, start] },
    { op: "add-net-label", sheetId: top, label: { name: "In", point: end } },
    { op: "add-sheet", id: "agent-child", name: "buffer" },
    { op: "set-port", sheetId: "agent-child", port: { id: "agent-pin", name: "In", type: "input", direction: "left", x: 300, y: 300 } },
    { op: "add-sheet-instance", sheetId: top, targetSheetId: "agent-child", id: "agent-instance", ref: "X1", x: 780, y: 320 }
  ];
  const failed = await transact("invalid", empty.revision, [resistor, { op: "add-wire", sheetId: top, points: [] }]);
  assert.equal(failed.opIndex, 1, JSON.stringify(failed));
  assert.equal((await snapshot()).sheets[0].components.length, 0);
  const preview = await transact("preview", empty.revision, actions, true);
  assert(preview.ok && !preview.applied && preview.changes.some(change => change.sheetAdded), JSON.stringify(preview));
  assert.equal(preview.revision, empty.revision);
  const receipt = await transact("apply", empty.revision, actions);
  assert(receipt.ok && receipt.applied && receipt.origin === "agent", JSON.stringify(receipt));
  assert.equal(receipt.revision, empty.revision + 1);
  assert.deepEqual(await transact("apply", empty.revision, actions), receipt);
  assert.equal((await transact("apply", empty.revision, [resistor])).code, "REQUEST_ID_REUSED");
  await waitFor(page, () => !!document.querySelector('[model-id="agent-r1"]'), "AI device did not render");
  assert.match(await evaluate(page, () => document.querySelector("[data-schematic-status]").textContent), /AI transaction applied/);
  const drawn = await snapshot();
  const sheet = drawn.sheets.find(item => item.id === top);
  assert.equal(sheet.components.find(item => item.id === "agent-r1").pins[0].net, "In");
  assert.equal(drawn.sheets.find(item => item.id === "agent-child").ports[0].name, "In");
  assert(sheet.components.find(item => item.id === "agent-instance").pins.length);

  await clickSelector(page, '[data-command="wire"]');
  const setValue = { op: "set-values", sheetId: top, componentId: "agent-r1", values: { main: "2k" } };
  assert.equal((await transact("busy", drawn.revision, [setValue])).code, "HUMAN_BUSY");
  await moveWorld(440, 390, true);
  await moveWorld(560, 390, false);
  await key("Enter", 13);
  await key("Escape", 27);
  const conflict = await transact("stale", drawn.revision, [setValue]);
  assert.equal(conflict.code, "REVISION_CONFLICT");
  assert.equal(conflict.revision, drawn.revision + 1);
  const afterHuman = await snapshot();
  assert.equal(afterHuman.sheets.find(item => item.id === top).wires.length, 2);

  await clickSelector(page, '[data-command="undo"]');
  await clickSelector(page, '[data-command="undo"]');
  const reverted = await snapshot();
  assert.equal(reverted.sheets.length, 1);
  assert.equal(reverted.sheets[0].components.length, 0);
  assert.equal(reverted.sheets[0].wires.length, 0);
  await clickSelector(page, '[data-command="redo"]');
  const restored = await snapshot();
  assert.equal(restored.sheets.length, 2);
  assert.equal(restored.sheets.find(item => item.id === top).components.length, 2);
  assert((await transact("retry", restored.revision, [setValue])).applied);

  await clickSelector(page, "[data-agent-banner-suspend]");
  assert.equal((await rpc({ method: "snapshot", token })).code, "SUSPENDED");
  await clickSelector(page, "[data-agent-banner-suspend]");
  assert.equal((await snapshot()).sheets.find(item => item.id === top).components.find(item => item.id === "agent-r1").values.main, "2k");
  await clickSelector(page, "[data-agent-reclaim]");
  await waitFor(page, () => document.querySelector("[data-agent-banner]").hidden, "Reclaim did not return to manual editing");
  assert(["PAGE_OFFLINE", "UNAUTHORIZED", "SESSION_CLOSED"].includes((await rpc({ method: "snapshot", token })).code));

  const agentDisconnect = await beginPairing();
  const disconnectedPair = await rpc({ method: "pair", code: agentDisconnect.code });
  assert((await rpc({ method: "disconnect", token: disconnectedPair.token })).disconnected);
  await waitFor(page, () => document.querySelector("[data-agent-banner]").hidden, "Agent disconnect did not release editing");
  await clickSelector(page, "[data-agent-close]");

  const expired = await beginPairing();
  await evaluate(page, () => {
    const now = Date.now.bind(Date);
    window.advanceAgentClock = offset => { Date.now = () => now() + offset; };
    window.advanceAgentClock(121_000);
  });
  await waitFor(page, () => document.querySelector("[data-agent-banner]").hidden, "Pairing code did not expire");
  assert(["PAGE_OFFLINE", "SESSION_EXPIRED", "SESSION_CLOSED"].includes((await rpc({ method: "pair", code: expired.code })).code));
  await clickSelector(page, "[data-agent-close]");
  const expiredSession = await beginPairing();
  const expiringPair = await rpc({ method: "pair", code: expiredSession.code });
  assert(expiringPair.ok);
  const lifetime = 2 * 60 * 60_000;
  const remaining = expiringPair.expiresAt - await evaluate(page, () => Date.now());
  assert(remaining <= lifetime && remaining > lifetime - 5000, "Session must have a two-hour lifetime");
  await evaluate(page, duration => window.advanceAgentClock(121_000 + duration - 60_000), lifetime);
  assert((await rpc({ method: "snapshot", token: expiringPair.token })).ok, "Session expired before two hours");
  await evaluate(page, duration => window.advanceAgentClock(121_000 + duration + 5000), lifetime);
  await waitFor(page, () => document.querySelector("[data-agent-banner]").hidden, "Paired session did not expire");
  assert(["PAGE_OFFLINE", "SESSION_EXPIRED", "SESSION_CLOSED"].includes(
    (await rpc({ method: "snapshot", token: expiringPair.token })).code));
  const denied = await fetch(endpoint, { method: "POST", headers: { Origin: "https://example.com", "Content-Type": "application/json" },
    body: JSON.stringify({ method: "snapshot", token }) });
  assert.equal(denied.status, 403);
  console.log("R5 Agent passed: local pairing, clipboard, snapshot topology, dry run, rollback, atomic history, revision conflict, human writer, suspend, reclaim and expiration.");
} finally {
  page?.close();
  await browser?.close();
  await server.close();
  if (connector.exitCode === null) {
    const stopped = once(connector, "exit");
    connector.kill();
    await stopped;
  }
}

async function beginPairing() {
  await clickSelector(page, "[data-schematic-open-agent]");
  await clickSelector(page, "[data-agent-connect]");
  await waitFor(page, () => document.querySelector("[data-agent-banner]").dataset.agentStatus === "waiting", "Loopback connector did not become ready");
  const text = await evaluate(page, () => document.querySelector("[data-agent-prompt]").value);
  return JSON.parse(text.slice(text.lastIndexOf("\n{")));
}
async function rpc(body) {
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(12000) });
  return response.json();
}
async function snapshot() {
  const result = await rpc({ method: "snapshot", token });
  assert(result.ok, JSON.stringify(result));
  return result;
}
function transact(requestId, baseRevision, operations, dryRun = false) {
  return rpc({ method: "transact", token, transaction: { apiVersion: "1.0", requestId, baseRevision, operations, dryRun } });
}
async function key(key, windowsVirtualKeyCode) {
  for (const type of ["keyDown", "keyUp"]) await page.send("Input.dispatchKeyEvent", { type, key, code: key, windowsVirtualKeyCode });
}
async function moveWorld(x, y, click) {
  const at = await evaluate(page, (x, y) => {
    const matrix = document.querySelector('[model-id="agent-wire"] [joint-selector="line"]').getScreenCTM();
    const point = new DOMPoint(x, y).matrixTransform(matrix);
    return { x: point.x, y: point.y };
  }, x, y);
  await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...at });
  if (!click) return;
  await page.send("Input.dispatchMouseEvent", { type: "mousePressed", ...at, button: "left", clickCount: 1 });
  await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...at, button: "left", clickCount: 1 });
}
