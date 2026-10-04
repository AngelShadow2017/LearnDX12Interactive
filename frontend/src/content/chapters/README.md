# Chapter MDX

One file per route, named `ch01.mdx` through `ch23.mdx`, plus `intro.mdx` and `appendix.mdx`. The page shell supplies the chapter title, goals, time estimate, sample repository link, full-book TOC, progress state, image viewer, and previous/next navigation. MDX owns only the lesson body.

Use the catalog section IDs exactly so the persistent TOC links land at the right headings — write them as raw tags because MDX headings do not carry IDs:

```mdx
<section className="lesson-section" id="s13">
<h2>1.3 点积</h2>
```

## Components available in MDX

- `<Figure src="images/Fig1-1.jpg" alt="..." figureNumber="图 1.1" caption="..." />` places a source figure inline and opens it in the shared zoom viewer. `src` must be the original file name under `images/`.
- `<Activity id="ch01-vector-frame" chapterId="ch01" title="..." prompt="..." hint="..." explanation="...">` provides a reusable prediction / manipulation / explanation frame. For a scored activity, pass a `check` function from a small React component in `src/activities/`.
- `<MiniQuiz id="ch01-q1" chapterId="ch01" question="..." options={[...]} answer={0} explanation="..." />` provides a saved multiple-choice checkpoint.
- `<Callout tone="note|tip|warning">...</Callout>` provides a restrained teaching note.
- `<Checkpoint chapterId="ch01" questions={[{ id, question, options, answer, explanation }]} />` renders the end-of-chapter application questions. 80 % correct automatically marks the chapter concept-passed.
- `<Practice chapterId="ch01" title="..." goal="..." steps={[...]} expected="..." verify={[...]} />` renders the end-of-chapter Windows practice card. Omit `repoPath` when the chapter has no project (chapters 3 and 5) and pass `fallbackNote` instead.
- `<CodeSample title="..." code={`...`} input={...} keyLines={[{ code, note }]} output={...} pitfalls={[...]} />` renders a code block that always carries input, key lines, expected output, and pitfalls.
- `<div className="math-block">`, `<div className="figure-pair">`, `<div className="step-list">` — the typographic blocks the stylesheet provides.

## Writing chapter-specific interactions

Build a focused React component under `src/activities/<chapter>/` and import it into MDX. Every interaction should use `ActivityFrame` from `src/activities/ActivityFrame.tsx` so all four states (predict / manipulate / reset / explain) stay present and the wrong-answer feedback always names the misconception.

Keep calculations in small pure functions so they can be reviewed — and tested — independently. `src/activities/math.ts` is the shared core: row-major matrices, row vectors (`v · M`), left-handed, matching DirectXMath exactly. `src/activities/math.test.ts` pins that convention down.

## MDX gotchas

These have all cost a build cycle; check them first when MDX fails to compile:

- JSX is **not** allowed inside `{...}` expressions. A literal like `answer={<p>…</p>}` fails with `Could not parse expression with acorn`. Move such data into a `.tsx` module and import it (`src/content/appendixExercises.tsx` does this).
- A lone `<` or `>` in prose starts a tag. Write `n·L 小于 0` instead of `n·L < 0`, and `大于 0` instead of `> 0`.
- `*` inside `<sub>` / `<em>` is parsed as emphasis. Use `{'i,*'}` for literal asterisk.
- Keep `<section>` / `</section>` balanced. `Checkpoint` and `Practice` belong **inside** the final section, not after its closing tag.
