# GmKing Schematic Editor

The current release baseline is **1.0.1-beta**. Draw circuits with connected wires, editable symbols, hierarchical sheets and buses, layers, and plain-text notes with TeX. The Web editor provides SPICE and Spectre netlists, symbolic analysis, JSON import/export, and SVG/PNG export.

- **Web editor:** `apps/web`; browser-local storage and JSON import/export.
- **Embeddable library:** `packages/schematic`; [API and embedding](packages/schematic/README.md).
- **Obsidian plugin:** `apps/obsidian`; desktop only, Obsidian 1.13.4+.

## Run

Node.js 22.13+ and npm 10+:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:8001`. After library changes, run `npm run build:lib` and reload. `npm run build` builds all three packages; `npm run typecheck`, `npm test`, and `npm run test:browser` verify them. The browser check needs Chrome/Chromium or Edge.

`npm run lint` runs the official Obsidian ESLint rules across the workspace. Outstanding findings are reported; lint currently runs as an advisory CI step.

## Obsidian

Build with `npm run build`. Copy `main.js`, `styles.css`, and `manifest.json` from `apps/obsidian/dist` into `<vault>/.obsidian/plugins/schematic-editor/`, then enable **GmKing** in Community plugins. Run **GmKing: Insert schematic** in the command palette; edit the inserted block in Live Preview. Circuit data stays in the note's JSON code block.

## Hosting and data

Host `apps/web/dist` on a static server using relative asset paths. Web documents stay in that browser; export JSON for backups or transfer. Web formula rendering loads a bundled MathJax 4.1.3 script from the same origin when first needed. The Obsidian plugin uses Obsidian's rendering APIs. Clipboard features depend on host permissions; Web clipboard access generally needs HTTPS or localhost.

The standalone Web build defaults to English and follows the system color scheme. Press **O** or use the gear to open **Options**, which controls language, color mode, text font, process, symbol template, wire crossings, and wire angle. Language and color preferences are stored in the browser and shared with the bundled manual. The Analog Tools site has its own deployment shell and defaults to Simplified Chinese.

Optional AI collaboration uses a local loopback connector launched with `npm run agent:connector`. Pair with the editor's **AI** panel. Its **Current status** line follows manual editing, pairing, connection, suspension, and offline states. The page keeps the schematic and applies revision-checked edits through its existing undo history.

## Development

Read [AGENTS.md](AGENTS.md) for maintenance requirements. In the Analog Tools workspace, see `docs/schematic-editor/handoff.md` in the outer repository for release status, targeted tests, and site deployment. Use `npm run test:note` for TeX notes and `npm run test:web-performance` for Web chunking and lazy formula loading.

MIT © 2026 RarityBrown. Dependencies retain their own licenses; see [third-party notices](THIRD_PARTY_NOTICES.md).
