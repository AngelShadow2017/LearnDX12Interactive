# Custom activity components

Put chapter-specific interaction components here and import them from the matching MDX file. Prefer SVG/Canvas for diagrams and controls. Use `SceneViewport` for a Three.js scene that needs orbiting or spatial manipulation.

## The shared frame

`ActivityFrame.tsx` is the skeleton every interaction uses, so all of them have the same four states:

1. **先预测** — a multiple-choice prediction with per-answer feedback. `correctNote` explains *why you were right*, `wrongNote` names the misconception. Both are required.
2. **动手操作** — `children`. Locked until the prediction is submitted (or skipped), so nobody drags a slider without committing to an expectation first.
3. **检查我的推演** — `check()` returns `{ passed, feedback }`. Wrong answers must explain the cause, not just say "incorrect". Passing marks the activity complete.
4. **为什么会这样 / 回到代码** — `explanation` (the reasoning) and `apply` (how it shows up in the C++ samples).

`onReset` restores the widget's initial state and clears the last check result.

## Math

All calculations go through `@/activities/math`. It is deliberately small, pure, and independently testable — `math.test.ts` pins the conventions down so a number shown in a lesson always matches the C++ sample.

- Matrices are **row-major** and multiplied on the right: `v · M`. Translation lives in the last row, matching `XMMatrixTranslation`.
- Left-handed, camera looks along **+z** in view space.
- D3D12 clipping is **`0 ≤ z ≤ w`**, so normalized depth is `[0, 1]`.

## Controls

`controls.tsx` holds the small building blocks: `Slider`, `Choice` (segmented radio), `Toggle`, `NumberField`, `Readout`, `OrderList`, `MatrixGrid`, `PlaneGrid`, and the `svgPoint` / `svgToMath` helpers.

`OrderList` uses up/down buttons rather than drag-and-drop on purpose — drag-only reordering is unusable with a keyboard or a screen reader.

## Three.js

`SceneViewport` owns renderer creation, resize handling, frame timing, hidden-tab pause, cleanup, and WebGL fallback. Its default camera is at the origin looking down Three.js `-z`, which corresponds to positive view-space z after `dxToThreeVector`. Pass a memoized `setup` callback to populate its scene and camera; the callback's fourth argument, `invalidate`, redraws after user input when reduced motion disables the animation loop. An optional memoized `onFrame` callback animates. Dispose resources you create outside the supplied scene in the callback returned by `setup`.

The book uses Direct3D's left-handed convention. `dxToThreeVector(x, y, z)` reflects z for Three.js's right-handed view. That reflection reverses triangle winding; `dxToThreeTriangle(a, b, c)` returns the corrected order. Keep matrix conversions explicit in each lesson instead of passing a DirectXMath matrix directly to Three.js.

## Accessibility

Every interaction must be usable with a keyboard alone, and colour must never be the only channel carrying information — pair it with a symbol, a label, or a number. Draggable handles are focusable and respond to arrow keys. `prefers-reduced-motion` is respected globally in `styles.css`.
