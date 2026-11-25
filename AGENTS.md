# Schematic Project Guidelines

These rules apply to the independent schematic library, standalone Web workspace, and Obsidian plugin.

## Maintenance

- The release baseline is `1.0.1-beta`. Start by checking the branch, Git status, and existing changes. In the Analog Tools workspace, read `docs/schematic-editor/handoff.md` from the outer repository.
- Make the smallest change that fully resolves the request. Use the existing entry points and shared models. Keep unrelated refactors, formatting, dependency upgrades, schema changes, and generated artifacts out of the patch.
- Run the focused checks for the behavior you changed, including affected hosts. Expand coverage for shared paths or release work. Report the checks you ran and any scenarios you could not verify.
- Keep Web assets local and relative-path safe. Preserve lazy MathJax and JointJS chunk cache stability. Sync `app/schematic/` in the outer repository only when site release work is in scope.

## Architecture

- Keep editor UI and host adapters, schematic document and connectivity models, rendering, and symbolic analysis in separate modules. Keep renderer-specific details in rendering modules; do not put JointJS cell construction, SVG serialization, or symbolic analysis into catalog definitions.
- The interactive schematic editor uses JointJS. Do not replace it with hand-written Canvas rendering unless the architecture is explicitly revisited.
- Keep the portable core independent from browser storage, DOM globals, and ADChelper application modules.
- Reuse the shared component visual model for the JointJS editor, readonly viewer, and SVG export so the same component has consistent geometry across hosts.

## Document and connectivity model

- Schematic Editor is in closed beta. Document formats may change directly without legacy import compatibility or migrations. Update current readers, writers, validation, and tests together, and revisit this policy before public release.

- Every component definition must declare explicit pins with stable IDs, labels, and roles. Preserve those IDs in saved documents and netlists.
- Component values and editable display settings are part of the document model. Serialize them through the document codec and preserve them when changing component variants or hosts.
- All component positions, pin endpoints, and wire nodes snap to the 10 px grid (`GRID_SIZE`). Symbol geometry uses a separate 20 px design unit (`SYMBOL_GRID_SIZE`); changing snapping density must not resize symbols. Wire geometry may use either `orthogonal` or `freeAngle` through the existing `routeMode` field; do not introduce a second wire data shape.

## Editor interaction

- Preserve the existing selection, placement, and wiring conventions.
- User-editable state must provide Undo and Redo. Reuse the shared history utilities where practical, expose toolbar controls, and support `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, and `Ctrl/Cmd+Y` while preserving native text editing inside focused inputs.
- Host integrations must preserve the host's history semantics. Obsidian Markdown editing uses its CodeMirror history; the embedded schematic editor must not create a competing history stack for the same document change.

## Formula display

- Use MathJax for UI formula display. Prefer TeX in `\(...\)` or `\[...\]` and call `packages/schematic/src/shared/mathjax.ts` after inserting or updating formula DOM. Avoid hand-written HTML subscripts for mathematical definitions.

## Symbols and rendering

- New symbol definitions should use the shared terminal-class geometry helpers in `packages/schematic/src/schematic/catalog.ts` so two-, three-, and four-terminal parts keep consistent pin spacing and graphic scale.
