import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { serveDist, launchBrowser, openPage, navigate, clickSelector, waitFor, evaluate } from "./browser-smoke.mjs";
import { createSchematicDocument, contentFromDocument } from "../packages/schematic/dist/schematic/document/documentModel.js";

const fixture = contentFromDocument(createSchematicDocument({
  components: [
    { id: "V1", type: "voltageSource", ref: "V1", x: 260, y: 240, rotation: 0, mirrored: false,
      variantId: "pulse", values: { "vsource:pulse:riseTime": "2n" } },
    { id: "R1", type: "resistor", ref: "R1", x: 440, y: 240, rotation: 0, mirrored: false, values: { main: "1k" } }
  ],
  notes: [{ id: "note", x: 180, y: 340, width: 160, height: 42, anchor: "upperLeft", text: "Note α 原文" }]
}));
const server = await serveDist(fileURLToPath(new URL("../apps/web/dist", import.meta.url)));
let browser, page, manual;
try {
  browser = await launchBrowser();
  page = await openPage(browser.baseUrl, "about:blank");
  await size(1600);
  await system("light");
  await navigate(page, server.url);
  await waitFor(page, () => Boolean(document.querySelector("[data-schematic-paper] svg")), "editor did not mount");
  await evaluate(page, (documentContent) => {
    localStorage.setItem("schematic-workspace", JSON.stringify({
      activeDocumentId: "locale", documents: [{ id: "locale", title: "User α 原理图" }]
    }));
    localStorage.setItem("adc-helper-schematic:locale", JSON.stringify({
      format: "adc-helper/schematic-workspace-snapshot",
      state: { document: documentContent, zoom: 1, viewTranslate: { x: 0, y: 0 }, presentationMode: false }
    }));
  }, fixture);
  await navigate(page, new URL("?fixture", server.url).href);
  await waitFor(page, () => Boolean(document.querySelector("[model-id='V1']")), "pulse source did not restore");
  const documentBefore = await savedContent();

  await clickSelector(page, "[data-command='netlist']");
  await waitFor(page, () => document.querySelector("[data-netlist-code]")?.textContent.includes("V1"), "fixture netlist did not generate");
  const netlistBefore = await netlistText();
  assert.match(netlistBefore, /V1.*PULSE/);
  await clickSelector(page, "[data-netlist-format='spectre']");
  const spectreBefore = await netlistText();
  assert.match(spectreBefore, /V1.*vsource pulse/);
  await clickSelector(page, "[data-netlist-format='spice']");
  await clickSelector(page, "[data-command='netlist']");
  await evaluate(page, () => document.querySelector("[data-schematic-paper]").focus());
  await key("o", "KeyO", 79);
  await waitFor(page, () => document.querySelector("[data-schematic-options-dialog]")?.open, "O shortcut did not open Options");
  assert.match(await evaluate(page, () => document.querySelector("[data-schematic-open-options]").title), /\(O\)/);
  await clickSelector(page, "[data-schematic-options-close]");
  await options();
  assert.deepEqual(await preferences(), { language: "en", mode: "system", effective: "light" });
  await system("dark");
  await waitFor(page, () => document.documentElement.dataset.effectiveTheme === "dark", "system dark did not apply");
  await choose("[data-schematic-theme-select]", "light");
  assert.deepEqual(await preferences(), { language: "en", mode: "light", effective: "light" });
  await choose("[data-schematic-language-select]", "zh");
  await choose("[data-schematic-theme-select]", "dark");
  assert.deepEqual(await preferences(), { language: "zh-CN", mode: "dark", effective: "dark" });
  const localizedOptions = await evaluate(page, () => document.querySelector("[data-schematic-options-dialog]").innerText);
  for (const caption of ["选项", "Language", "颜色模式", "跟随系统", "暗色", "符号模板", "默认文字字体"]) {
    assert(localizedOptions.includes(caption), `Options is missing ${caption}`);
  }
  await contrast("[data-schematic-options-dialog] select");
  await capture("options-dark-zh");
  await clickSelector(page, "[data-schematic-options-close]");

  await clickSelector(page, "[data-sidebar-tab='library']");
  assert.match(await evaluate(page, () => document.querySelector("[data-library-item='resistor']").innerText), /电阻/);
  await evaluate(page, () => document.querySelector("[data-schematic-paper]").focus());
  await key("i", "KeyI");
  await waitFor(page, () => document.querySelector("[data-schematic-instance-browser]")?.hidden === false, "i browser did not open");
  await evaluate(page, () => {
    const search = document.querySelector("[data-browser-cell-search]");
    search.value = "电压源";
    search.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await waitFor(page, () => Boolean(document.querySelector("[data-cell-item='voltageSource']")), "Chinese library search did not find the voltage source");
  await contrast("[data-browser-cell-search]");
  await key("Escape", "Escape");

  await clickSelector(page, "[data-sidebar-tab='layers']");
  assert.match(await evaluate(page, () => document.querySelector("[data-layer-select='layer-1']").textContent), /图层 1/);
  await clickSelector(page, "[data-layer-object-select='V1']");
  await clickSelector(page, "[data-sidebar-tab='properties']");
  const riseTime = "[data-property-vsource-field='vsource:pulse:riseTime']";
  await waitFor(page, selector => document.querySelector(selector)?.value === "2n", "source parameters did not render", { args: [riseTime] });
  assert.equal(await evaluate(page, selector => document.querySelector(selector).getAttribute("aria-label"), riseTime), "上升时间");
  assert.match(await evaluate(page, () => document.querySelector(".property-editor").innerText), /源类型/);
  await contrast(riseTime);
  await contrast(".property-editor");
  assert(await evaluate(page, () => {
    const paper = document.querySelector(".joint-paper-background");
    const cells = document.querySelector(".joint-cells-layer");
    const note = document.querySelector(".schematic-note-layer");
    return getComputedStyle(paper).backgroundColor === "rgb(25, 24, 21)"
      && getComputedStyle(cells).filter.includes("invert(1)")
      && getComputedStyle(note).filter.includes("invert(1)")
      && note.textContent.includes("Note α 原文");
  }), "paper, cell, or note dark style is missing");
  await capture("properties-dark-zh");
  await options();
  await choose("[data-schematic-language-select]", "en");
  assert.equal(await evaluate(page, selector => document.querySelector(selector).getAttribute("aria-label"), riseTime), "Rise time");
  await choose("[data-schematic-language-select]", "zh");
  await clickSelector(page, "[data-schematic-options-close]");

  await clickSelector(page, "[data-command='netlist']");
  assert.match(await evaluate(page, () => document.querySelector(".netlist-diagnostic-message").textContent), /未连接/);
  assert.equal(await netlistText(), netlistBefore);
  await clickSelector(page, "[data-netlist-format='spectre']");
  assert.equal(await netlistText(), spectreBefore);
  await clickSelector(page, "[data-right-view='analysis']");
  assert.equal(await evaluate(page, () => document.querySelector("[data-net-select] option").textContent), "选择网络");
  await clickSelector(page, "[data-schematic-help]");
  const helpUrl = new URL("manual.html", server.url).href;
  for (let attempts = 0; attempts < 30 && !manual; attempts++) {
    const targets = await (await fetch(`${browser.baseUrl}/json/list`)).json();
    const target = targets.find(item => item.url === helpUrl);
    if (target) manual = await page.constructor.connect(target.webSocketDebuggerUrl);
    else await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert(manual, "Help did not open in a new tab");
  await waitFor(manual, () => document.documentElement?.lang === "zh-CN"
    && document.documentElement.dataset.effectiveTheme === "dark", "manual did not restore preferences");
  assert.match(await evaluate(manual, () => document.body.innerText), /颜色模式/);

  await size(375);
  await system("light");
  await navigate(page, new URL("?reload", server.url).href);
  await waitFor(page, () => Boolean(document.querySelector("[model-id='V1']")), "mobile editor did not restore schematic");
  assert.deepEqual(await preferences(), { language: "zh-CN", mode: "dark", effective: "dark" });
  await clickSelector(page, "[data-schematic-open-agent]");
  assert.deepEqual(await agentActions(), ["交给 AI 修改"]);
  assert(await evaluate(page, () => document.querySelector(".schematic-agent-status-divider")?.nextElementSibling
    ?.matches("[data-agent-state]")), "AI status divider is missing");
  assert.equal(await evaluate(page, () => document.querySelector("[data-agent-state]").textContent), "当前状态：人工编辑");
  await clickSelector(page, "[data-agent-connect]");
  assert.deepEqual(await agentActions(), ["复制文本", "暂停连接", "取消连接"]);
  await waitFor(page, () => document.querySelector("[data-agent-state]")?.textContent === "当前状态：本机连接器离线",
    "AI status did not follow the offline connector");
  assert.equal(await evaluate(page, () => document.querySelector("[data-agent-state]").textContent), "当前状态：本机连接器离线");
  assert.match(await agentText(), /"sheetId": "top"/);
  assert(!(await agentText()).includes("Note α 原文"));
  await contrast("[data-agent-prompt]");
  assert(await evaluate(page, () => {
    const dialog = document.querySelector("[data-schematic-agent-dialog]");
    const bounds = dialog.getBoundingClientRect();
    return innerWidth === 375 && bounds.left >= 0 && bounds.right <= innerWidth && dialog.scrollWidth <= dialog.clientWidth;
  }), "mobile AI dialog overflows");
  await capture("mobile-agent-dark-zh");
  await clickSelector(page, "[data-agent-disconnect]");
  await clickSelector(page, "[data-agent-close]");
  await options();
  assert(await evaluate(page, () => {
    const dialog = document.querySelector("[data-schematic-options-dialog]");
    const rect = dialog.getBoundingClientRect();
    return innerWidth === 375 && rect.left >= 0 && rect.right <= innerWidth && dialog.scrollWidth <= dialog.clientWidth;
  }), "mobile Options overflows");
  await capture("mobile-options-dark-zh");
  await choose("[data-schematic-theme-select]", "system");
  assert.deepEqual(await preferences(), { language: "zh-CN", mode: "system", effective: "light" });
  await choose("[data-schematic-language-select]", "en");
  await waitFor(manual, () => document.documentElement?.lang === "en", "manual did not follow the editor's language change");
  assert.equal(await savedContent(), documentBefore);
  console.log("Web preferences passed — live English/Chinese, dark/light/system, 375px, persisted settings, Help, AI pairing prompt, and unchanged schematic and netlist.");

  function agentActions() {
    return evaluate(page, () => [...document.querySelectorAll(".schematic-agent-actions button:not([hidden])")]
      .map(button => button.textContent));
  }
  function agentText() {
    return evaluate(page, () => document.querySelector("[data-agent-prompt]").value);
  }
  function size(width) {
    return page.send("Emulation.setDeviceMetricsOverride", { width, height: 980, deviceScaleFactor: 1, mobile: width < 600 });
  }
  function system(value) {
    return page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value }] });
  }
  function preferences() {
    return evaluate(page, () => ({
      language: document.documentElement.lang,
      mode: document.querySelector("[data-schematic-theme-select]").value,
      effective: document.documentElement.dataset.effectiveTheme
    }));
  }
  function choose(selector, value) {
    return evaluate(page, (selector, value) => {
      const select = document.querySelector(selector);
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }, selector, value);
  }
  async function options() {
    await clickSelector(page, "[data-schematic-open-options]");
    await waitFor(page, () => document.querySelector("[data-schematic-options-dialog]")?.open, "Options did not open");
  }
  function savedContent() {
    return evaluate(page, () => JSON.stringify(JSON.parse(localStorage.getItem("adc-helper-schematic:locale")).state.document));
  }
  function netlistText() {
    return evaluate(page, () => Array.from(document.querySelectorAll(".netlist-line-text"), line => line.textContent).join("\n"));
  }
  async function key(key, code, windowsVirtualKeyCode) {
    await page.send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode });
    await page.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
  }
  async function contrast(selector) {
    const colors = await evaluate(page, selector => {
      const style = getComputedStyle(document.querySelector(selector));
      return [style.color, style.backgroundColor];
    }, selector);
    const luminance = color => color.match(/\d+(?:\.\d+)?/g).slice(0, 3).map(Number)
      .map(value => value / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
      .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
    const [dark, light] = colors.map(luminance).sort((left, right) => left - right);
    assert((light + 0.05) / (dark + 0.05) >= 4.5, `${selector} has insufficient contrast: ${colors.join(" on ")}`);
  }
  async function capture(name) {
    const dir = process.env.SCHEMATIC_SMOKE_ARTIFACTS;
    if (!dir) return;
    const { data } = await page.send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(path.join(dir, `${name}.png`), Buffer.from(data, "base64"));
  }
} finally {
  manual?.close();
  page?.close();
  await browser?.close();
  await server.close();
}
