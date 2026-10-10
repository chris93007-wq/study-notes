# Authoring notes

A notes packet is one `.tsx` file in `notes/`. It default-exports a component that returns a
`<NotesDocument>` whose children are page templates, in print order. Everything is imported from `@notes`.

```tsx
import { NotesDocument, CoverPage, ContentsPage, NotesPage, TopicHeader, Callout } from '@notes';

export default function Week04() {
  return (
    <NotesDocument meta={{ title: 'Segmentation', subtitle: '…', course: 'MKT 282 · Marketing Analytics', week: 'Week 4', author: 'Christine John' }}>
      <CoverPage />
      <ContentsPage />
      <NotesPage toc={{ title: 'Cluster Analysis', chapter: 7 }}>
        <TopicHeader topicNumber={2} title="Cluster Analysis" />
        <p>…</p>
      </NotesPage>
    </NotesDocument>
  );
}
```

Start from the template with `npm run new -- week-04-segmentation "Segmentation"`, preview with `npm run dev`,
and print with `npm run pdf -- week-04`.

## The rules

These are the design decisions settled in the design sessions. Keep to them.

**Color**
- Color comes from **chapter numbers 1–13** only. There are no per-type colors: a Callout, table or card takes
  the color of the chapter it sits in.
- **One color per topic, everywhere.** Pick one chapter number per topic and use it on that topic's Contents
  entry (`toc.chapter`), flashcard, notes page, cheat-sheet column and formula-sheet band. Two topic colors
  never mix on one page; the week badge matches too.
- Pick contrasting hues for neighbouring topics (opposite sides of the wheel), not color-wheel order:
  1 indigo · 2 orange · 3 teal · 4 pink · 5 lime · 6 deep purple · 7 amber · 8 light blue · 9 deep orange ·
  10 purple · 11 cyan · 12 light green · 13 blue.
- **Red, green and yellow are reserved.** Never use them as a chapter color.
- Text on color always uses the chapter's pastel **-100 fill with -900 ink**, never a translucent tint.
- The `PageBadge` on every page uses the document's `brandChapter`, not the topic color.
- The full Material palette is also available directly: `var(--green-100)`, `var(--deep-orange-700)` and so on.

**Spacing**
- Spacing tokens (`--space-1` … `--space-10`: 3.3 · 6.9 · 10.3 · 13.8 · 17.3 · 20.9 · 27.5 · 34.1 · 41.8 · 55 px) were scaled with the type. Use the tokens, not hard-coded gaps.

**Type size**
- Body text is **11 pt**. The whole scale is in `src/styles/tokens/typography.css` (xs 8.8pt · sm 9.9pt · base 11pt · lg 13.2pt · xl 16.5pt · 2xl 22pt · 3xl 28.6pt). Use these tokens rather than hard-coded sizes, so changing the scale changes everything together.

**Boxed content (Concept cards, Worked examples, Callouts) is set "one step down" from the body**, the way textbooks set
sidebars and boxed examples, so a box reads as an aside and several fit on a page. With body size B (11 pt): text 0.9 B,
labels 0.8 B, box title 1.2 B, leading 1.5 (body 1.65), padding about 1 em of the box's own text, gaps about 0.75 em,
and one ring only (1.5 px border plus a 4 px accent on top; inner tinted boxes get a 1 px hairline). All of it is in
`src/styles/tokens/box.css` as `--box-*` tokens. Tune the values there, never inside a component.

**Emphasis** (plain HTML, no components)
- `<mark>…</mark>` is the yellow highlighter. **It's the only highlight color.**
- `<strong>…</strong>` is plain bold.
- `<strong className="trap">…</strong>` is bold red with no fill. Use it for traps and common mistakes.
- `<strong className="tip">…</strong>` is bold green with no fill. Use it for tips and clues.
- `<span className="badge ch-7">Best use case</span>` is an all-caps text badge in the chapter-500 color.
  Text badges are the system's only "icons". No emoji, no drawn icons.

**Callouts**
- There are only three: `KEY INSIGHT`, `NOTES` and `MEMORY AID`. Everything else, such as a common mistake, an
  exam note or a worked example, is a regular `<Section>` or a dedicated component.

**Pages**
- US Letter with 0.5in margins on every page. Content flows onto extra sheets automatically, and each
  template starts on a new sheet.
- The Cover is plain: no badge, no footer. Contents and Practice Questions have no footer.
  Every other content page gets a `PageBadge` and the footer (breadcrumb + `page / total`).
- Everything must be printable. Nothing hidden, collapsed or tooltip-only. Quiz answers are printed under each
  question.
- Use space-saving layouts: 2 columns (`<Columns>`) for short paired blocks in portrait, and landscape
  with 3–4 columns for dense reference pages. The Cheat Sheet picks its own orientation: portrait when it's small, landscape when it's big.

**Concepts**
- Every concept gets a plain-language definition, the formula (KaTeX in `ConceptCard`, *in words* in
  `FlashCard`), and the **why**: the logic that makes the formula make sense.

## Page templates

Not every packet needs every page. The Appendix in particular is optional: add one only when there is reference material that would clutter the topic pages, never just to fill the packet.

| Template | Orientation | Badge | Footer | Notes |
|---|---|---|---|---|
| `CoverPage` | portrait | — | — | title/eyebrow from `meta`; `dots` = topic chapters |
| `ContentsPage` | portrait | Contents | — | built from every page's `toc`; page numbers filled by `npm run pdf` |
| `TopicMapPage` | portrait | ChapterHeader | ✓ | flashcard per topic + 2-col intro (`<Full>` spans both columns) |
| `NotesPage` | portrait* | Notes Page | ✓ | free content; plain `<p>` gets notes body style |
| `CheatSheetPage` | auto: portrait if small, landscape if dense | Cheat Sheet | ✓ | one column per topic: bullets + formula in words. Portrait = 2 columns, regular type; landscape (>4 topics or >16 bullets) = 4 columns, ultra-dense. Override with `orientation` / `perRow` |
| `FormulaSheetPage` | portrait | Formula Sheet | ✓ | Concept / Decomposition / KaTeX formula, chapter bands |
| `QuizPage` | portrait | — | — | one chapter color; light-green answer strip |
| `AppendixPage` | landscape* | Appendix | ✓ | **Optional.** Only for real reference material that would clutter the topic pages (big data tables, derivations). label badge, TopicHeader, intro, then a wide table |
| `GlossaryPage` | portrait | Glossary | ✓ | auto-sorted 2-column dictionary |
| `Page` | either | optional | optional | build any custom page |

\* `orientation` prop to change.

Any template takes `toc={{ title, chapter }}` to appear on the Contents page.

## Components

| Component | Use |
|---|---|
| `Callout` | Key Insight / Notes / Memory Aid box; label sits in the border notch |
| `ConceptCard` | definition + KaTeX formulas + optional `breakdown` tree + why |
| `WorkedExample` | setup (+ `context` figure), data table, show-the-work steps, highlighted answer, so-what |
| `FlashCard`, `FlashcardGrid` | mini definition / formula in words / why |
| `FormulaTree` | calculation broken down into connected value boxes |
| `Chain` | `A → B → C` or `A = B + C` pills |
| `Split` | two-sided comparison |
| `Matrix` | row × column framework grid |
| `Flowchart` | decision tree with box/diamond nodes |
| `StepPipeline` | numbered process steps with arrows |
| `KeyTermsTable` | Term / Simple Explanation / Why It Matters / Example |
| `ComparisonTable` | any data table (`columns[].align`, `columns[].width`) |
| `Image` | figure + caption; placeholder frame until `src` is set (import images from `notes/assets/`) |
| `ChapterHeader`, `TopicHeader`, `Section`, `SectionTitle`, `PageBadge`, `PageFooter` | structure |
| `BarChart` | ranked/compared values; horizontal (long labels, negatives) or vertical; values printed on bars |
| `LineChart` | 1–4 series; direct end-of-line labels + dash/marker shapes so it reads in black-and-white |
| `ScatterPlot` | labeled points, optional dashed quadrant lines (importance vs. performance, perceptual maps) |
| `Mermaid` | auto-laid-out diagrams from text: flowcharts that merge/loop, sequence, state, Gantt, ER, mind maps; themed to the chapter |
| `Tex` | inline KaTeX anywhere |
| `Grid` / `Span`, `Columns`, `Full`, `Stack` | 12-column layout, N columns, full-width row, vertical stack |

Prop types are in each component's source file (`src/components/**`), with JSDoc on every prop.

## Charts and diagrams

- Data → `BarChart` / `LineChart` / `ScatterPlot` (SVG, chapter colors, values printed — nothing relies on hover).
  Give them a `caption` ("Fig. 2 — …"); size with `width`/`height` (a half-width column is about 340 px).
- Simple top-down trees and decisions → `Flowchart` / `FormulaTree`. Anything that merges, loops or needs swimlanes → `Mermaid`:

```tsx
<Mermaid chapter={4} caption="Fig. 3 — Survey loop" code={`flowchart TD
  A[Draft survey] --> B{Pilot ok?}
  B -- no --> A
  B -- yes --> C[Field MaxDiff]`} />
```

A Mermaid syntax error prints a red error box and makes `npm run pdf` fail, so a broken diagram is never silently dropped.
Wide Gantt charts shrink to fit the column, so keep them short or use landscape.

## Images

**Generated images (Canva).** Where the Canva connector is available, Claude can generate an illustration with
Canva's `generate-image` (flat, pastel, no text works best). Canva returns a link and a media ID plus only a
small preview, which is too small to print. For print quality, open the "Open generated image" link, download the full-size
file, and save it into `notes/assets/`. Then use it as below. Claude should say this plainly rather than embed the thumbnail.

Put files in `notes/assets/` and import them so Vite bundles them:

```tsx
import profileCard from './assets/profile-card.png';
<Image chapter={13} src={profileCard} alt="Conjoint profile card" caption="Fig. 1 — …" ratio="4/3" fit="contain" />
```

## Checks `npm run pdf` does for you
- Warns when something is wider than the printable area and would be clipped. It names the page and the text.
- Fails on React/runtime errors.
- Fills in the Contents page numbers in a second pass and warns if they shift.

## Using it in the Claude desktop app (Claude chat / Cowork)

`npm run skill:zip` builds `skill-dist/christines-notes.zip`: a self-contained skill (SKILL.md + the whole generator).
Upload it in the app under Settings → Capabilities → Skills, then ask for notes or type `/christines-notes`.
The environment it runs in needs Node 18+, access to the npm registry, and a Chromium/Chrome. If any is missing the
skill says so and delivers the `.tsx` source to render on your own machine instead.
