---
name: "christines-notes"
description: "Turn slides, readings or lecture notes into an ADHD-friendly, printable PDF study packet in Christine's design system."
---

# Christine's Notes — PDF study-packet generator

This skill folder contains a complete generator in `generator/` (React + Vite + a headless-Chromium PDF renderer). Calling the skill means: write the packet's content file, then **run `npm run pdf`** to produce the PDF.

## 0. Check the environment (30 seconds)

Run these. The build needs all three to pass:

```bash
node -v                      # Node 18 or newer
npm ping                     # can reach the npm registry
ls /opt/pw-browsers 2>/dev/null; which chromium chromium-browser google-chrome 2>/dev/null   # a Chromium/Chrome
```

If something is missing, say so plainly and stop. Don't fake a PDF. Tell the user which piece is missing and offer the fallback in "If it can't run here" below.

## 1. Set up a working copy

The skill folder may be read-only, so work on a copy:

```bash
cp -r <this skill folder>/generator ./christines-notes-work
cd christines-notes-work && npm install
```

(If the Chromium path differs from the defaults, export `CHROMIUM_PATH=/path/to/chrome`.)

## 2. Learn the rules, then write the packet

1. Read `AUTHORING.md` (in this skill folder) and skim `generator/notes/week-03-preference-measurement.tsx`, the reference packet (it shows every page type; its page list is not a template), and `generator/notes/case-schur-flexibles.tsx`, notes on a single case in textbook rhythm (a narrative write-up turned into short paragraphs between elements).
2. Collect what the user gave you: slides, readings, notes, topics. If the course, week, topics, what the notes are for (exam review, case prep, one reading, quick reference) or the wanted page types are unclear, ask first.

   **Standing rule — answer every prep question, don't just list it.** Actively search
   every source for this week (slides, a "Case Preparation Questions" file, discussion
   questions embedded in or appended to a case/reading, review/study questions at the
   end of a chapter) for assigned questions — not just topics. ANY case-prep question
   or slide-embedded question tied to this week's material must be answered with real
   content in the notes, grounded in the actual source text (the case, article, or
   slide content it's based on) — never just reprinted as a prompt for the student to
   answer later, and never silently dropped because it reads like "discussion prep"
   rather than "tested content." If a case-prep file exists for the week's case(s) and
   wasn't already in the source list the user gave you, go find it and read it before
   writing the packet — do not wait to be told it exists.

   Give these answered questions their own place in the packet (a dedicated subsection
   on that case's topic page, or a short "Case Discussion Prep" page if there are many
   across several cases) rather than folding them silently into general topic notes,
   so they're easy to find before class. If a question is genuinely open-ended/
   opinion-based with no single right answer (e.g. "evaluate this founder's
   performance"), still write out a real, well-reasoned answer grounded in specific
   facts from the source — a worked example of how to answer it — not a restatement
   of the question or a vague "consider X, Y, Z" placeholder.

3. **Decide what the packet contains. Only the Notes pages are core.** Cover, Contents, Map, Cheat Sheet, Formula Sheet, Practice Questions, Glossary and Appendix are optional supplements: include one only when it adds value to what *these* notes are for, and leave it out otherwise (`AUTHORING.md` → "What to include" has the value test for each page and typical recipes). For example:
   - a single topic → Notes only (no Map, no Contents); a case → Notes, and no Formula Sheet unless the analysis is quantitative; a multi-topic exam review → Cover, Contents, Map, Notes, Cheat Sheet, Formula Sheet if quantitative, Practice Questions, Glossary if term-heavy.
   - A **Map** is for 3+ topics whose order or relationship helps (`TopicMapPage`), or for any structured process, ladder, framework or timeline (`MapPage`, or a `ProcessMap` inside a notes page; `flow="arrows"` for a sequence). Its rows, columns and card density flex to fit one sheet on their own. A small process goes inside the notes page it explains, not on a page of its own.
   - An **Appendix** only when there is real reference material (a big data table, a full derivation) that would clutter the topic pages.
   - Answered case-prep questions (standing rule above) are content, not a supplement: they go on the notes page of the case they belong to, as their own titled section. When several cases in the same week each have a substantial set, a dedicated "Case Discussion Prep" notes page (a `SectionTitle` per case, each question answered; `toc.sub` pages only if it runs over a sheet) is also earned. Don't force all of it onto the topic pages if it would crowd them.
   - Say in your hand-off what you left out and why, and offer to add it. Never add a page, appendix or map just to fill out the packet.

   Then `npm run new -- week-NN-topic "Title" --with <only the pages you chose>` (for example `--with cover,contents,map,cheat`; `--with all` for every page; without `--with` you get the Notes pages only) creates `notes/week-NN-topic.tsx` from the template. Replace every TODO.
4. Follow the rules strictly: topics are numbered automatically with one single number (Contents badge = page pill = TopicHeader; never type numbers into titles; only subsections use 3.1-style numbers via `toc.sub`); one contrasting chapter color per topic, used everywhere that topic appears; red/green/yellow never as chapter colors; `<mark>` is the only highlight and marks the one thing to remember (≤ 1 per paragraph, ~3 per page, 3–12 words), bold green `tip` = what to do / the clue to the right answer, bold red `trap` = what not to do, plain bold = first-use key terms (full table in `AUTHORING.md`); callouts only KEY INSIGHT / NOTES / MEMORY AID / EXAM TRAP, and always inside `<Aside>` in the margin (placed just before the text they annotate), with every example (worked or not) in a `WorkedExample` card (`label="Example"` for non-numeric ones, diagram in `context`), and tables and diagrams in `<Section wide>`; every concept has definition + formula + why; everything printable (nothing hidden); exact numbers with their formula; no emoji.

**Textbook rhythm.** Every topic alternates short paragraph blocks (1–2 paragraphs, about 60 words each) with elements (concept and example cards, tables, diagrams, steps): a lead-in paragraph before an element and a one-sentence takeaway after it. Never 3 elements or 3 paragraphs in a row, and never a page of boxes with no running text. `AUTHORING.md` → "Textbook rhythm" has the rules and how to turn a narrative source into notes.

Spacing is one even rhythm (paragraph = box = box gaps) and two boxes should be separated by a margin note moved into the text; cards (concept, example) have a density — comfortable 100%, cozy 90%, compact 80%, everything inside shrinking together — which the generator picks automatically (pin it with `density` only if you must), and card width (margin / main / full) and margin-note placement are chosen automatically too (see `AUTHORING.md`).

Layout is fixed by the rules in `AUTHORING.md`: notes pages use the margin layout (main column ≈68 characters), reference pages use 2 equal columns, the cheat sheet has at most 3 columns and a 9 pt minimum, labels are never below 9 pt, reading text has 1.5 leading and 2× paragraph spacing. Don't override these to squeeze pages.

### When the material comes from NotebookLM

NotebookLM files (report .md, flashcards, quizzes, JSON tree) are inputs, not finished content. Before authoring, verify them against the original sources:

- Check every number, and spot-check quotes and examples, against text extracted from the slides and readings. Read slide images (charts, diagrams) yourself, since text extraction misses them.
- Every example keeps its source tag. Drop anything not in the course sources (outside facts, added dates, invented case details) instead of keeping it with a label.
- Never copy infographic text. Use its layout only.
- Where slides only pose a case's questions (no facts), answer them with the course frameworks, say plainly that the sources give no case facts, and add none.
- Keep the Gemini short paragraphs (case write-ups, how-it-is-tested notes) as the narrative, and use tables, cards and diagrams around them. Go section by section: a short paragraph, then the table, steps or card that holds that section's facts (the mapping is in `AUTHORING.md` → "Textbook rhythm"). Drop the write-up's closing question and any emoji.

### Layout lessons

- Break paragraphs with visual elements: no more than one or two short paragraphs in a row, then a table, WorkedExample, ConceptCard, Split, Chain or StepPipeline.
- The reverse holds too: no more than two elements in a row without a short paragraph between them. Each topic runs block → element → block → element, with a lead-in before and a takeaway after every card, table or diagram.
- Put exam cues, traps and memory aids in margin callouts inside Aside. This fills the margin; paragraphs stacked in the main column leave it empty and fail the whitespace rule.
- Adding one paragraph can push a whole block onto a near-empty extra sheet. After each addition, re-render and check the page count; trim rather than pile on.
- Pages that rely on a big Flowchart waste space; prefer a Chain when the diagram is a simple sort.

### Charts, diagrams and images

- Numbers → `BarChart` / `LineChart` / `ScatterPlot`. Simple trees → `Flowchart` / `FormulaTree`. Merging/looping diagrams, sequences, Gantt → `Mermaid` (text in, themed SVG out). See `AUTHORING.md`.
- Images: if Canva tools are available (`generate-image`), you may generate a flat pastel illustration for a topic. Canva only returns a link, a media ID and a small preview, which is NOT print quality. Tell the user to open the link, download the full-size image and save it to `notes/assets/`, then reference it with `<Image src={…}>`. Never embed the thumbnail as if it were final. If Canva isn't available, use an `<Image>` placeholder frame (no `src`) with a clear alt text, or draw the idea with Mermaid/SVG components.

## 3. Render

```bash
npm run typecheck
npm run pdf -- week-NN
```

Read the output: `✓ <name>.pdf — N pages` is success. Lines starting `↳ fitted —` are layout fixes the generator already applied (margin notes moved into the text, spacing tightened). Lines starting `✗ whitespace rule:` mean a printed sheet wastes more than 30% of its area (empty margins count) and the command exits non-zero: fix by merging short topics (subsections via `toc.sub`), adding the missing material, or trimming a topic that spills a small tail; re-render, up to three rounds; deliver the PDF anyway and say which sheets could not be fixed. Source info (`kicker`) is printed in the footer automatically. Lines starting `⚠ whitespace:` come from an audit of the finished PDF and name sheets that are partly empty or topics that spill a small tail onto a second sheet: fix those following the "Whitespace" section of `AUTHORING.md` (shorten a margin note, trim words, split a long example), then re-render, up to three rounds, and tell the user about any that remain. Lines starting `⚠ rhythm:` name a topic whose paragraphs and elements do not alternate (3+ elements or 3+ paragraphs in a row, a paragraph over 75 words, or elements with no paragraph at all): add a one- or two-sentence lead-in or takeaway, split a long paragraph around an element, or put an element into a wall of text, then re-render, up to two rounds, and tell the user about any that remain. Fix every `⚠ … overflows` warning and every `✗` error, then re-run. Spot-check by rasterizing a few pages (`pdftoppm -r 50 -png out/<name>.pdf pg`) and looking at them if the tools allow it.

## 4. Deliver

Copy `out/<name>.pdf` to wherever the app lets the user get files (the outputs folder; in Cowork, the folder the user selected) and tell them the path, page count, and any unresolved warnings.

## Re-rendering an existing packet

If the user only wants a re-render or small edit, skip step 2's authoring: edit the file in `notes/`, run `npm run pdf -- <name>`, deliver.

## If it can't run here

If there's no Node, no network for `npm install`, or no Chromium, the PDF cannot be built in this environment. Do the authoring anyway, deliver the `notes/<name>.tsx` file, and tell the user to render it on their own machine: clone `https://github.com/chris93007-wq/study-notes, put the file in `notes/`, then `npm install && npm run pdf`. Say clearly that you did not produce a PDF.
