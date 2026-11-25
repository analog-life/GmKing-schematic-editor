# @edahelper/schematic

Circuit editing, rendering, connectivity, and symbolic analysis for browser hosts. This guide applies to the 1.0.1-beta release.

| Export | Purpose |
| --- | --- |
| `/core` | Portable document codec, topology, and SVG rendering |
| `/viewer` | Readonly viewer |
| `/editor` | Single-document editor and host interfaces |
| `/web` | Browser workspace |
| `/workspace` | Snapshot persistence and storage interfaces |
| `/analysis` | Symbolic analysis |

```ts
import { renderSchematicTab, initSchematicEditor } from "@edahelper/schematic/web";
import "@edahelper/schematic/styles/web.css";

root.innerHTML = renderSchematicTab();
const editor = initSchematicEditor(root);
// On unmount:
await editor?.destroy();
```

The Web workspace defaults to localStorage; pass `{ workspace }` for host storage. `/editor` requires host services and `styles/editor.css`. Formula display uses the host's MathJax v4 runtime. The standalone Web app registers the lazy loader in [apps/web/mathjax.ts](../../apps/web/mathjax.ts).

Use editor commands or `transact` for edits and `createSchematicDocument` for new circuits. Stable pin and wire connection IDs determine connectivity; equal coordinates alone do not connect objects. Edits support Undo/Redo. Save status is `pending`, `saved`, or `failed`; await asynchronous persistence before treating content as durable.

The single-sheet format identifier remains `adc-helper/schematic`. Hierarchical projects use a separate v2 project package. Use the current codecs when reading and writing either format. The default symbol template is Razavi; Abidi is reserved and unavailable. Switch/SPNT symbols have no symbolic-analysis model.

MIT © 2026 RarityBrown. Third-party dependencies retain their licenses.
