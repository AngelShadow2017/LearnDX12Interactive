# Frontend framework handoff

This is the React/TypeScript learning workbench. The MDX lessons under `src/content/chapters/` are served through one application entry; chapter navigation uses a `?page=` query so the build does not recreate separate legacy HTML pages.

## Run it

Install the dependencies at the repository root, then run:

```powershell
npm run dev
```

Vite serves the app on `http://127.0.0.1:4173`. A production build cleans `frontend/dist/` and emits one `index.html`, bundled assets, and the existing `images/` assets. Preview the build over HTTP with `npm run preview:build` or use the VS Code `DX12 中文教材：启动预览` launch configuration; opening `frontend/dist/index.html` directly as a `file://` URL is not supported.

```powershell
npm run build          # tsc -b && vite build
npm test               # vitest：数学与状态核心逻辑的确定性测试
npm run check:figures  # 核对 EPUB 插图清单是否都已放进 MDX
```

## Content

One MDX file per page lives under `src/content/chapters/`: `intro.mdx`, `appendix.mdx`, and `ch01.mdx` through `ch23.mdx`. The page frame, title, goals, sidebar, progress marks, image viewer, and chapter navigation come from the shared shell and catalog. Keep the existing section IDs in `src/content/catalog.ts` and `src/content/pages.ts` so section links and the full-book TOC remain valid.

`src/content/chapters/README.md` documents the available MDX components. Chapter-specific interactions live in `src/activities/` and keep their math helpers pure and small.

## Framework pieces

- `src/content/catalog.ts`: chapter metadata, section anchors, goals, estimates, and sample-code links. Chapters 3 and 5 deliberately have no `samplePath` — the example repository has no standalone project for them.
- `src/content/routes.ts`: maps logical chapter IDs to query URLs on the single static entry.
- `src/content/pages.ts`: `intro.html` / `appendix.html` metadata and section anchors.
- `src/content/appendixExercises.tsx`: appendix D exercises; answers live here because MDX cannot hold JSX inside `{...}` expressions.
- `src/app/App.tsx`: homepage, reader shell, route selection, chapter header, progress display.
- `src/components/TableOfContents.tsx`: all-book navigation and current-section tracking.
- `src/components/InlineFigure.tsx`: inline figure and shared zoom viewer with keyboard navigation.
- `src/components/LearningActivity.tsx`: reusable activity frame and multiple-choice checkpoint.
- `src/components/ActivityFrame` (in `src/activities/`): the predict → manipulate → explain → apply frame every chapter interaction uses.
- `src/components/ChapterCheckpoint.tsx`: end-of-chapter application questions; 80 % correct marks the chapter as concept-passed.
- `src/components/PracticeCard.tsx`: end-of-chapter Windows practice card.
- `src/components/CodeSample.tsx`: code block that always carries input, key lines, expected output, and pitfalls.
- `src/activities/math.ts`: pure math core. Row-major, row-vector, left-handed — the same convention as DirectXMath, so every number shown in the lessons matches the C++ samples.
- `src/progress/ProgressProvider.tsx`: local progress, v1 checkbox migration, export/import support.

## Known facts worth keeping

- **DirectXMath has no library to link.** It is header-only and fully inline; D3D12 projects link `d3d12.lib`, `dxgi.lib`, and `dxguid.lib`. Chapter 1 and the introduction both call this out explicitly.
- **D3D12 clipping is `0 ≤ z ≤ w`**, so normalized depth lands in `[0, 1]` — not OpenGL's `[−1, 1]`. Chapter 5 states this and the projection activity makes it measurable.
- The example repository has no `Chapter 3` or `Chapter 5` directory, so those practice cards point at existing projects instead of inventing links.

The app does not run Direct3D in the browser. Web interactions teach the model; linked Windows projects remain the place to run D3D12 code.
