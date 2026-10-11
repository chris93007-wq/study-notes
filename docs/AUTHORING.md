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
  never mix on one page; the pill at the top of the page matches too.
- Pick contrasting hues for neighbouring topics (opposite sides of the wheel), not color-wheel order:
  1 indigo · 2 orange · 3 teal · 4 pink · 5 lime · 6 deep purple · 7 amber · 8 light blue · 9 deep orange ·
  10 purple · 11 cyan · 12 light green · 13 blue.
- **Red, green and yellow are reserved.** Never use them as a chapter color.
- **One hue per chapter.** Every shade of a chapter (-50 … -900) is generated from that chapter's -500 hue (same hue, different lightness), so a chapter never drifts into a neighbouring Material hue (amber -900 no longer turns orange). Don't mix hues from different palette families inside one component.
- Text on color always uses the chapter's pastel **-100 fill with -900 ink**, never a translucent tint.
- The `PageBadge` pill on a notes page shows the lecture or chapter title (`NotesPage lecture="…"`, default the Contents title); other pages show the week. Its color is the topic's color (the page's `toc.chapter`); on other pages it is the document `brandChapter`.
- The full Material palette is also available directly: `var(--green-100)`, `var(--deep-orange-700)` and so on.

**Spacing**
- Spacing tokens (`--space-1` … `--space-10`: 3.3 · 6.9 · 10.3 · 13.8 · 17.3 · 20.9 · 27.5 · 34.1 · 41.8 · 55 px) were scaled with the type. Use the tokens, not hard-coded gaps.

**Type size**
- Body text is **11 pt**. The whole scale is in `src/styles/tokens/typography.css` (xs 9pt · sm 9.9pt · base 11pt · lg 13.2pt · xl 16.5pt · 2xl 22pt · 3xl 28.6pt). Use these tokens rather than hard-coded sizes, so changing the scale changes everything together.

**Reading layout** (ADHD-friendly, textbook-informed; settled with Christine):
- **Measure:** reading text is 50–70 characters per line. Notes pages use the **margin layout** (the `NotesPage` default): a main column about 62% wide (≈60 characters at 11 pt) and a margin about 34% wide. Reference pages (`QuizPage`, `GlossaryPage`, or `<NotesPage layout="columns">`) use 2 equal columns (≈60 characters). Use `layout="single"` only for exceptions.
- **Margin notes are a title and bullets, not cards.** `Callout` renders a colored title, with a rule running through its middle like a section title (only when it has a title), over a short bullet list, one bullet per sentence (or pass `items`). **Callouts live in the margin.** All four kinds (Key Insight, Notes, Memory Aid, Exam Trap) go inside `<Aside>`, placed just *before* the paragraph, card or section they annotate, so the main column stays continuous prose. Several callouts in one `<Aside>` stack.
- **Balance the two columns.** Decide per page what sits in the margin so both columns end at about the same height: usually the callouts in the margin and the concept card in the main column under the intro; move the card into the `<Aside>` only when the intro prose is long. An empty margin or an empty main column beside a tall neighbour is wasted space.
- **A worked example is not wrapped in a `Section`**: its card is already labelled, so a second title line would repeat it.
- **Short topics share a sheet.** A `NotesPage` that fits in what is left of the previous sheet (plus a 24 pt gap) continues there instead of starting a new one (`join={false}` to opt out). Topics that don't fit start a new sheet.
- **Topic Map cards:** `TopicMapPage` tries margin notes beside the introduction, then a 2-column grid, then a 4-column grid, and keeps the first that fits on one sheet.
- **Wide blocks span the page:** worked examples, tables, Matrix, Split, headers and any `<Section wide>` / `<Wide>`. They clear the margin notes above them, so put the `<Aside>` above the text it belongs with, not above a wide block.
- **Leading:** 1.5 for reading text (prose, definition and why text in cards, callouts); 1.35 for compact items (table cells, formula rows, steps, glossary entries, cheat-sheet bullets); headings 1.2.
- **Paragraph spacing:** a full 2× the font size (`--para-gap`, 22 pt) between paragraphs of running prose. Bullets, table cells and glossary entries stay tight.
- **Labels:** small uppercase labels are never smaller than 9 pt (`--text-xs`).
- **Cheat sheet:** at most 3 columns, with a vertical rule between them; type stays ≥ 9 pt; a long one continues on a second sheet.
- **Hierarchy:** title 28.6 pt → section/topic 22 pt → subsection 13–16.5 pt → body 11 pt → captions and notes 9–9.9 pt. One serif display face for titles, one sans face for text; hierarchy comes from size and weight, not more fonts.
- **Space inside boxes:** don't stack labelled parts in one tall column where there is room. Worked examples put Setup beside the data table and the work beside the answer and the so-what.

**Boxed content (Concept cards, Worked examples, Callouts) is set "one step down" from the body**, the way textbooks set
sidebars and boxed examples. With body size B (11 pt): text 0.9 B, labels 9 pt (floor), box title 1.2 B, leading 1.5 for reading text and 1.35 for compact items, padding about 1 em of the box's own text, gaps about 0.75 em,
and one ring only (1.5 px border plus a 4 px accent on top; inner tinted boxes get a 1 px hairline). All of it is in
`src/styles/tokens/box.css` as `--box-*` tokens. Tune the values there, never inside a component.

**Emphasis** (plain HTML, no components). Each style has one job; when in doubt, use less.

| Style | Markup | Use it for | Limits |
|---|---|---|---|
| Yellow highlight | `<mark>…</mark>` | **The one thing to remember**: the single phrase a reader must not leave the page without (the definition's key phrase, the rule, the answer to "so what?"). It's the only highlight color. | At most **one per paragraph and about three per page**. A phrase, not a sentence: 3–12 words. Never in titles, callout titles, tables or on a term that is already bold. |
| Bold green | `<strong className="tip">…</strong>` | **What to do**: the action, shortcut or clue that points to the right answer ("always build the state table first", "clue: a riskless payoff means arbitrage"). The positive twin of a trap. | Up to 8 words. Pair it with a red trap where one exists (do / don't). |
| Bold red | `<strong className="trap">…</strong>` | **What not to do**: the mistake, trap or wrong move, usually inside an Exam Trap or Common Mistake. | Up to 12 words, no fill. |
| Plain bold | `<strong>…</strong>` | A key term the first time it is defined, a label inside running text, or a number the reader must find again. | Not whole sentences. |
| Badge | `<span className="badge ch-7">Best use case</span>` | A short all-caps label in the chapter color. Text badges are the system's only "icons". No emoji, no drawn icons. | One or two words. |

Never stack styles (no bold red inside a highlight, no highlighted green). Colour is never the only signal: red and green phrases always sit in a sentence that says "don't …" or "always …", so the page still reads in black and white.

**Callouts**
- There are four: `KEY INSIGHT`, `NOTES`, `MEMORY AID` and `EXAM TRAP`. All four go in the margin (`<Aside>`). A worked example or other
  content is a regular `<Section>` or a dedicated component.

**Pages**
- US Letter with 0.5in margins on every page. Content flows onto extra sheets automatically, and each
  template starts on a new sheet.
- The Cover is plain: no badge, no footer. Contents and Practice Questions have no footer.
  Every other content page gets a `PageBadge` and the footer (breadcrumb + `page / total`).
- Everything must be printable. Nothing hidden, collapsed or tooltip-only. Quiz answers are printed under each
  question.
- Use the layouts above (margin for notes, 2 equal columns for reference pages). Never run text full-width across a portrait page (≈125 characters is too long to track).

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
| `NotesPage` | portrait* | Notes Page | ✓ | margin layout by default (`layout` = margin / columns / single); plain `<p>` gets notes body style; callouts in `<Aside>` |
| `CheatSheetPage` | portrait | Cheat Sheet | ✓ | one column per topic: bullets + formula in words. At most 3 columns with dividers, ≥ 9 pt, may run to two sheets |
| `FormulaSheetPage` | portrait | Formula Sheet | ✓ | Concept / Decomposition / KaTeX formula, chapter bands |
| `QuizPage` | portrait | — | — | 2 equal columns; one chapter color; light-green answer strip |
| `AppendixPage` | landscape* | Appendix | ✓ | **Optional.** Only for real reference material that would clutter the topic pages (big data tables, derivations). label badge, TopicHeader, intro, then a wide table |
| `GlossaryPage` | portrait | Glossary | ✓ | auto-sorted 2-column dictionary |
| `Page` | either | optional | optional | build any custom page |

\* `orientation` prop to change.

Any template takes `toc={{ title, chapter }}` to appear on the Contents page.

## Components

| Component | Use |
|---|---|
| `Callout` | Key Insight / Notes / Memory Aid / Exam Trap box; label sits in the border notch |
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
| `Aside`, `Wide` | margin note (callouts) / full-width block on a margin-layout page |
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
