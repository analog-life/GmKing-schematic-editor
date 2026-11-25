import { NOTE_BACKGROUND_COLOR_PRESETS } from "../../../src/shared/color";
import { describe, expect, it } from "vitest";
import { querySchematicEditorMountElements, renderSchematicTabShell } from "../../../src/schematic/schematicTabShell";

const MOUNT_SELECTORS = [
  "[data-schematic-shell]",
  "[data-schematic-document-tabs]",
  "[data-schematic-paper]",
  "[data-schematic-palette]",
  "[data-schematic-property-editor]",
  "[data-schematic-status]",
  "[data-schematic-analysis-panel]"
] as const;

class FakeRoot {
  constructor(private readonly elements: Map<string, HTMLElement>) {}

  querySelector<T extends HTMLElement>(selector: string): T | null {
    return (this.elements.get(selector) as T | undefined) ?? null;
  }
}

function mountElements() {
  return new Map<string, HTMLElement>(MOUNT_SELECTORS.map((selector) => [selector, { selector } as unknown as HTMLElement]));
}

function valuesFor(html: string, attribute: string) {
  return [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, "g"))].map((match) => match[1]);
}

describe("renderSchematicTabShell", () => {
  it("contains the schematic editor mount anchors", () => {
    const shell = renderSchematicTabShell();

    MOUNT_SELECTORS.forEach((selector) => {
      expect(shell).toContain(selector.slice(1, -1));
    });
    [
      "schematic-paper",
      "schematic-document-tabs",
      "schematic-palette",
      "schematic-property-editor",
      "schematic-status",
      "analysis-panel"
    ].forEach((id) => expect(shell).not.toContain(`id="${id}"`));
  });

  it("provides a browser-style schematic document tab strip", () => {
    const shell = renderSchematicTabShell();

    expect(shell).toContain('role="tablist"');
    expect(shell).toContain("data-schematic-document-tab-list");
    expect(shell).toContain("data-schematic-document-new");
    expect(shell).toContain('aria-label="New schematic"');
  });

  it("places accessible Import, Paste, and Export controls in order after the new-tab button", () => {
    const shell = renderSchematicTabShell();
    const createIndex = shell.indexOf("data-schematic-document-new");
    const importIndex = shell.indexOf("data-schematic-document-import");
    const pasteIndex = shell.indexOf("data-schematic-document-paste");
    const exportIndex = shell.indexOf("data-schematic-document-export");

    expect(createIndex).toBeGreaterThan(-1);
    expect(importIndex).toBeGreaterThan(createIndex);
    expect(pasteIndex).toBeGreaterThan(importIndex);
    expect(exportIndex).toBeGreaterThan(pasteIndex);
    const importButton = shell.match(/<button[^>]+data-schematic-document-import[^>]*>/)?.[0];
    expect(importButton).toContain('aria-label="Import schematic"');
    expect(importButton).toContain('title="Import schematic"');
    const pasteButton = shell.match(/<button[^>]+data-schematic-document-paste[^>]*>/)?.[0];
    expect(pasteButton).toContain('aria-label="Paste schematic JSON from clipboard into a new tab"');
    expect(pasteButton).toContain('title="Paste schematic JSON from clipboard into a new tab"');
    const dialogId = shell.match(/data-schematic-document-export[^>]*aria-label="Export schematic"[^>]*aria-haspopup="dialog" aria-controls="([^"]+)"/)?.[1];
    expect(dialogId).toBeTruthy();
    expect(shell).toContain(`<dialog class="schematic-dialog schematic-document-export-dialog" id="${dialogId}"`);
    expect(shell).toContain("data-schematic-export-hidden");
    expect(shell).toMatch(
      /<input id="schematic-shell-\d+-document-import-input" type="file" accept="\.json,application\/json" data-schematic-document-import-input hidden \/>/
    );
    expect(shell).not.toContain("data-schematic-document-import-input multiple");
  });

  it("provides independent close and storage notice regions", () => {
    const shell = renderSchematicTabShell();

    expect(shell).toContain("data-schematic-close-snackbar");
    expect(shell).toContain("data-schematic-close-message");
    expect(shell).toContain("data-schematic-close-undo");
    expect(shell).toContain('role="status" aria-live="polite"');
    expect(shell).toContain("data-schematic-storage-error");
    expect(shell).toContain("data-schematic-storage-error-message");
    expect(shell).toContain("data-schematic-storage-error-dismiss");
    expect(shell).toContain('role="alert"');
  });

  it("keeps the focusable paper and initial status text unchanged", () => {
    const shell = renderSchematicTabShell();

    expect(shell).toMatch(/<div class="schematic-paper" tabindex="0" aria-label="Schematic canvas"[^>]*data-schematic-paper><\/div>/);
    expect(shell).toMatch(/<div class="schematic-status" aria-live="polite" data-schematic-status[^>]*>Select a tool or press i to add an instance\.<\/div>/);
  });

  it("keeps the four symbolic analysis net selectors and pick buttons", () => {
    const shell = renderSchematicTabShell();
    const ports = ["inputP", "inputN", "outputP", "outputN"];

    expect(valuesFor(shell, "data-net-select")).toEqual(ports);
    expect(valuesFor(shell, "data-pick-net")).toEqual(ports);
  });

  it("keeps analysis compute, progress, diagnostics, and result hooks", () => {
    const shell = renderSchematicTabShell();

    expect(shell).toContain('data-analysis="compute"');
    expect(shell).toContain("data-analysis-progress");
    expect(shell).toContain("data-analysis-progress-text");
    expect(shell).toContain("data-analysis-diagnostics");
    expect(shell).toContain("data-analysis-transfer");
    expect(shell).toContain("data-analysis-zin");
    expect(shell).toContain("data-analysis-zout");
  });

  it("keeps property panel hooks and note swatches", () => {
    const shell = renderSchematicTabShell();

    expect(shell).toContain("data-property-empty");
    expect(shell).toContain("data-property-component-form");
    expect(shell).toContain("data-property-cell");
    expect(shell).toContain("data-property-ref");
    expect(shell).toContain("data-property-component-color");
    expect(shell).toContain("data-property-network-color");
    expect(valuesFor(shell, "data-network-color-swatch")).toEqual([
      "default",
      "#ff0000",
      "#0000ff",
      "#008000",
      "#800080",
      "#ffffff",
      "#0072b2",
      "#d55e00",
      "#009e73",
      "#cc79a7",
      "#56b4e9",
      "#e69f00",
      "#a0a0a0"
    ]);
    expect(valuesFor(shell, "data-component-color-swatch")).toEqual([
      "default",
      "#ff0000",
      "#0000ff",
      "#008000",
      "#800080",
      "#ffffff",
      "#0072b2",
      "#d55e00",
      "#009e73",
      "#cc79a7",
      "#56b4e9",
      "#e69f00",
      "#a0a0a0"
    ]);
    expect(shell.match(/title="Black \(default\)"/g)).toHaveLength(3);
    expect(valuesFor(shell, "data-note-text-color-swatch")).toContain("#111111");
    expect(shell).toMatch(/role="group" aria-label="Gain polarity"[^>]*data-property-gain-polarity/);
    expect(valuesFor(shell, "data-property-gain-polarity-value")).toEqual(["default", "positive", "negative"]);
    expect(shell).toContain('data-property-gain-polarity-value="negative">−</button>');
    expect(shell).toContain("data-property-value-row");
    expect(shell).toContain("data-property-value-label");
    expect(shell).toContain("data-property-value");
    expect(shell).toContain("data-property-value-unit");
    expect(shell).toContain("data-property-variant-row");
    expect(shell).toContain("data-property-variant");
    expect(shell).toContain("data-property-pin-visibility-row");
    expect(shell).toContain("data-property-note-form");
    expect(shell).toContain("data-property-note-background-row");
    expect(shell).toContain("data-property-note-background");
    expect(shell).toContain("data-property-note-background-swatches");
    expect(shell).toContain("data-property-note-font-size-row");
    expect(shell).toContain("data-property-note-font-size");
    expect(shell).not.toContain("data-property-note-format");
    expect(shell).toContain("data-property-note-anchor");
    expect(shell).toContain("data-property-note-text");
    expect(shell).not.toContain("data-property-note-editor-mode");
    expect(shell).not.toContain("data-property-note-editor-mode-segmented");
    expect(shell).not.toContain(">WYSIWYG<");
    expect(shell).not.toContain(">Source<");
    expect(valuesFor(shell, "data-note-background-swatch")).toEqual([
      "default",
      ...NOTE_BACKGROUND_COLOR_PRESETS.map(preset => preset.color).filter(color => color !== "#ffffff")
    ]);
    expect(shell.indexOf("data-property-network-color />"))
      .toBeGreaterThan(shell.lastIndexOf("data-network-color-swatch"));
    expect(shell.indexOf("data-property-component-color />"))
      .toBeGreaterThan(shell.lastIndexOf("data-component-color-swatch"));
    expect(shell.indexOf("data-property-note-background />"))
      .toBeGreaterThan(shell.lastIndexOf("data-note-background-swatch"));
  });

  it("keeps key toolbar command hooks", () => {
    const shell = renderSchematicTabShell();
    const commands = valuesFor(shell, "data-command");
    const label = shell.match(/<button[^>]*data-command="label"[^>]*>([\s\S]*?)<\/button>/)?.[1];

    expect(commands.slice(0, 4)).toEqual(["library", "instance", "wire", "label"]);
    expect(commands).not.toContain("diagnostics");
    expect(commands).not.toContain("log");
    expect(label).toContain(">abc</text>");
    expect(label).toContain('<line x1="3" y1="18" x2="21" y2="18"');

    [
      "instance",
      "wire",
      "note",
      "rotate",
      "mirror-x",
      "mirror-y",
      "delete",
      "temp-delete",
      "presentation",
      "fit",
      "reset",
      "undo",
      "redo"
    ].forEach((command) => {
      expect(shell).toContain(`data-command="${command}"`);
    });
  });

  it("starts the toolbar with Options, ends with AI after Help, and puts the template in Options", () => {
    const shell = renderSchematicTabShell();
    const toolbar = shell.match(/<div[^>]+class="schematic-toolbar"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    expect(toolbar?.trimStart()).toMatch(/^<button[^>]+data-schematic-open-options/);
    expect(toolbar).toContain('aria-keyshortcuts="O"');
    expect(toolbar).toContain('title="Options (O)"');
    expect(toolbar?.trimEnd()).toMatch(/<a[^>]+href="\.\/manual\.html"[^>]+target="_blank"[^>]+data-schematic-help[\s\S]*?<\/a><button[^>]+data-schematic-open-agent[\s\S]*<\/button>$/);
    const agentId = toolbar?.match(/data-schematic-open-agent[^>]+aria-controls="([^"]+)"/)?.[1];
    expect(agentId).toBeTruthy();
    expect(shell).toContain(`id="${agentId}" class="schematic-dialog schematic-agent-dialog"`);
    const optionsId = toolbar?.match(/data-schematic-open-options[^>]+aria-controls="([^"]+)"/)?.[1];
    const options = shell.match(/<dialog[^>]+data-schematic-options-dialog[^>]*>[\s\S]*?<\/dialog>/)?.[0];
    expect(optionsId).toBeTruthy();
    expect(options).toContain(`id="${optionsId}"`);
    expect([...options!.matchAll(/<select[^>]*? (data-schematic-[\w-]+|data-netlist-process|data-symbol-template)(?=[ >])/g)].map(match => match[1])).toEqual([
      "data-schematic-language-select", "data-schematic-theme-select", "data-schematic-text-font",
      "data-netlist-process", "data-symbol-template", "data-schematic-wire-crossings", "data-schematic-wire-angle"
    ]);
    expect(shell).toContain('class="schematic-sidebar-heading">Schematic Editor</h2>');
    expect(shell.match(/<select[^>]+data-symbol-template/g)).toHaveLength(1);
  });

  it("defaults to English and follows the system theme with both overrides available", () => {
    const shell = renderSchematicTabShell();
    const language = shell.match(/<select[^>]+data-schematic-language-select[^>]*>(.*?)<\/select>/)?.[1];
    const theme = shell.match(/<select[^>]+data-schematic-theme-select[^>]*>(.*?)<\/select>/)?.[1];

    expect(language).toMatch(/<option value="en" selected[^>]*>English<\/option>/);
    expect(language).toMatch(/<option value="zh"[^>]*>中文<\/option>/);
    expect(theme).toMatch(/<option value="system" selected[^>]*>Follow system<\/option>/);
    expect(theme).toMatch(/<option value="light"[^>]*>Light<\/option>/);
    expect(theme).toMatch(/<option value="dark"[^>]*>Dark<\/option>/);
    expect(language).not.toContain("disabled");
    expect(theme).not.toContain("disabled");
  });

  it("assigns translation keys to display options and font overrides", () => {
    const shell = renderSchematicTabShell();
    for (const key of [
      "options.wireCrossings", "options.crossingPlain", "options.crossingHop",
      "options.defaultTextFont", "options.colorMode", "options.system",
      "textFont.label", "textFont.inherit", "textFont.sans", "textFont.serif", "textFont.mono"
    ]) {
      expect(shell).toContain(`&quot;key&quot;:&quot;${key}&quot;`);
    }
  });

  it("shows the reflection axis and keyboard shortcut for each mirror command", () => {
    const shell = renderSchematicTabShell();
    const mirrorX = shell.match(/<button[^>]*data-command="mirror-x"[^>]*>[\s\S]*?<\/button>/)?.[0];
    const mirrorY = shell.match(/<button[^>]*data-command="mirror-y"[^>]*>[\s\S]*?<\/button>/)?.[0];

    expect(mirrorX).toContain('aria-label="Mirror X (Ctrl+R)"');
    expect(mirrorX).toContain('d="M34 100 L166 100"');
    expect(mirrorY).toContain('aria-label="Mirror Y (Shift+R)"');
    expect(mirrorY).toContain('d="M100 34 L100 166"');
  });

  it("namespaces ARIA targets independently for repeated shells", () => {
    const firstIds = new Set(valuesFor(renderSchematicTabShell(), "id"));
    const secondIds = new Set(valuesFor(renderSchematicTabShell(), "id"));

    expect(firstIds.size).toBeGreaterThanOrEqual(5);
    expect(secondIds.size).toBe(firstIds.size);
    expect([...firstIds].filter((id) => secondIds.has(id))).toEqual([]);
  });

  it("uses persistent resize rails instead of separate panel toggle buttons", () => {
    const shell = renderSchematicTabShell();

    expect(valuesFor(shell, "data-schematic-panel-toggle")).toEqual([]);
    expect(valuesFor(shell, "data-schematic-panel-resizer")).toEqual(["left", "right"]);
    expect(shell.match(/aria-valuemin="0"/g)).toHaveLength(2);
    expect(shell).toContain("data-schematic-panel-backdrop");
  });
});

describe("querySchematicEditorMountElements", () => {
  it("returns null if any mount anchor is missing", () => {
    MOUNT_SELECTORS.forEach((missingSelector) => {
      const elements = mountElements();
      elements.delete(missingSelector);

      expect(querySchematicEditorMountElements(new FakeRoot(elements) as unknown as HTMLElement)).toBeNull();
    });
  });

  it("returns the exact instance-scoped mount elements", () => {
    const elements = mountElements();
    elements.set("[data-selection-summary]", { selector: "[data-selection-summary]" } as unknown as HTMLElement);
    const result = querySchematicEditorMountElements(new FakeRoot(elements) as unknown as HTMLElement);

    expect(result).toEqual({
      shellEl: elements.get("[data-schematic-shell]"),
      documentTabsEl: elements.get("[data-schematic-document-tabs]"),
      paperEl: elements.get("[data-schematic-paper]"),
      paletteEl: elements.get("[data-schematic-palette]"),
      propertyEl: elements.get("[data-schematic-property-editor]"),
      statusEl: elements.get("[data-schematic-status]"),
      analysisEl: elements.get("[data-schematic-analysis-panel]"),
      selectionSummaryEl: elements.get("[data-selection-summary]")
    });
  });

  it("allows the optional selection summary mount to be absent", () => {
    const elements = mountElements();

    expect(querySchematicEditorMountElements(new FakeRoot(elements) as unknown as HTMLElement))
      .toMatchObject({ selectionSummaryEl: undefined });
  });
});
