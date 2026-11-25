import { refreshSchematicMessages, type SchematicLanguage } from "./schematicI18n";
import { parseWireAngle, type WireAngle } from "./wire/wireAngle";

type ColorMode = "system" | "light" | "dark";

export function bindSchematicWebOptions(root: HTMLElement, onLanguageChange: () => void, onWireAngleChange: (angle: WireAngle) => void) {
  const { ownerDocument } = root;
  const view = ownerDocument.defaultView;
  const dialog = root.querySelector<HTMLDialogElement>("[data-schematic-options-dialog]");
  if (!view || !dialog) return () => {};
  const html = ownerDocument.documentElement;
  const controller = new view.AbortController();
  const { signal } = controller;
  const colorPreference = view.matchMedia?.("(prefers-color-scheme: dark)");
  const languageSelect = dialog.querySelector<HTMLSelectElement>("[data-schematic-language-select]");
  const themeSelect = dialog.querySelector<HTMLSelectElement>("[data-schematic-theme-select]");
  const wireAngleSelect = dialog.querySelector<HTMLSelectElement>("[data-schematic-wire-angle]");
  const languageKey = "at-lang";
  const themeKey = "at-theme";
  const wireAngleKey = "at-schematic-wire-angle";
  let mode: ColorMode = "system";

  const read = (key: string) => {
    try { return view.localStorage.getItem(key); } catch { return null; }
  };
  const store = (key: string, value: string | null) => {
    try {
      if (value === null) view.localStorage.removeItem(key);
      else view.localStorage.setItem(key, value);
    } catch {
      // Apply the preference in memory for this tab.
    }
  };
  const setLanguage = (language: SchematicLanguage, notify: boolean) => {
    const changed = html.dataset.schematicLanguage !== language;
    html.dataset.schematicLanguage = language;
    html.lang = language === "zh" ? "zh-CN" : "en";
    if (languageSelect) languageSelect.value = language;
    if (changed || !notify) refreshSchematicMessages(root);
    if (changed && notify) onLanguageChange();
  };
  const applyTheme = () => {
    if (mode === "system") delete html.dataset.theme;
    else html.dataset.theme = mode;
    html.dataset.effectiveTheme = mode === "system" ? (colorPreference?.matches ? "dark" : "light") : mode;
    if (themeSelect) themeSelect.value = mode;
  };
  const readTheme = () => {
    const stored = read(themeKey);
    mode = stored === "dark" || stored === "light" ? stored : "system";
    applyTheme();
  };
  const applyWireAngle = (angle: WireAngle) => {
    if (wireAngleSelect) wireAngleSelect.value = angle;
    onWireAngleChange(angle);
  };
  setLanguage(read(languageKey) === "zh" ? "zh" : "en", false);
  readTheme();
  applyWireAngle(parseWireAngle(read(wireAngleKey)));
  languageSelect?.addEventListener("change", () => {
    const language = languageSelect.value === "zh" ? "zh" : "en";
    store(languageKey, language);
    setLanguage(language, true);
  }, { signal });
  themeSelect?.addEventListener("change", () => {
    const selected = themeSelect.value;
    mode = selected === "dark" || selected === "light" ? selected : "system";
    store(themeKey, mode === "system" ? null : mode);
    applyTheme();
  }, { signal });
  wireAngleSelect?.addEventListener("change", () => {
    const angle = parseWireAngle(wireAngleSelect.value);
    store(wireAngleKey, angle);
    applyWireAngle(angle);
  }, { signal });
  colorPreference?.addEventListener("change", applyTheme, { signal });
  view.addEventListener("storage", event => {
    if (!event.key || event.key === languageKey) setLanguage(read(languageKey) === "zh" ? "zh" : "en", true);
    if (!event.key || event.key === themeKey) readTheme();
    if (!event.key || event.key === wireAngleKey) applyWireAngle(parseWireAngle(read(wireAngleKey)));
  }, { signal });

  const openOptions = () => {
    if (!dialog.open) dialog.showModal();
  };
  root.querySelector("[data-schematic-open-options]")?.addEventListener("click", openOptions, { signal });
  view.addEventListener("keydown", event => {
    if (event.defaultPrevented || event.repeat || event.isComposing || event.key.toLowerCase() !== "o"
      || event.ctrlKey || event.metaKey || event.altKey || root.querySelector("dialog[open]")) return;
    const target = event.target as Element | null;
    if (target && target !== ownerDocument.body && target !== html) {
      if (!root.contains(target) || target.closest('input, select, textarea, [contenteditable="true"]')) return;
    }
    event.preventDefault();
    event.stopPropagation();
    openOptions();
  }, { signal });
  dialog.querySelector("[data-schematic-options-close]")?.addEventListener("click", () => dialog.close(), { signal });
  dialog.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    dialog.close();
  }, { signal });
  return () => {
    controller.abort();
    if (dialog.open) dialog.close();
  };
}
