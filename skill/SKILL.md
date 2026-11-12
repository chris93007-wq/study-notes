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
2. Collect what the user gave you: slides, readings, notes, topics. **Open every tab of every workbook** (reference tabs such as "Ratio Descriptions", and the ratio block on each company sheet), because the course's own metric list lives there and defines what the packet must cover. Never mark a source unavailable until you have checked the uploads copy of each file. Before delivering, list every metric and term in those reference tabs and confirm each is in the packet or deliberately left out and said so in the hand-off. If the course, week, topics, what the notes are for (exam review, case prep, one reading, quick reference) or the wanted page types are unclear, ask first.

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
4. Follow the rules strictly: topics are numbered automatically with one single number (Contents badge = page pill = TopicHeader; never type numbers into titles; only subsections use 3.1-style numbers via `toc.sub`); one contrasting chapter color per topic, used everywhere that topic appears; red/green/yellow never as chapter colors; `<mark>` is the only highlight and marks the one thing to remember (≤ 1 per paragraph, ~3 per page, 3–12 words), bold green `tip` = what to do / the clue to the right answer, bold red `trap` = what not to do, plain bold = first-use key terms (full table in `AUTHORING.md`); callouts only KEY INSIGHT / NOTES / MEMORY AID / EXAM TRAP / HINT / REMINDER (always with `see="Topic N · …"` naming where it was explained) / DID YOU KNOW (≤1 per packet) / LOOKING AHEAD, and always inside `<Aside>` in the margin (placed just before the text they annotate; the margin is a real column, so an `<Aside>` can also hold a short marginalia paragraph — a side gloss or caveat as a plain `<p>` — or a narrow element passed `wide={false}`, and any table, pipeline or flowchart can likewise sit in the main column instead of full width), with every example (worked or not) in a `WorkedExample` card (`label="Example"` for non-numeric ones, diagram in `context`), and tables and diagrams in `<Section wide>`; every concept has definition + formula + why; everything printable (nothing hidden); exact numbers with their formula; no emoji.

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
- **Ask NotebookLM for component-shaped content, not an essay.** After the pyramid tree exists, request per topic, in one scoped chat query: *"Return ONLY JSON for topic '<branch>'. { narrative: 2–4 paragraphs ≤60 words each; hooks: 2 concrete surprising facts; margin: [{kind: hint|reminder|trap|insight, text, source}]; minis: [{title, lines[]}] for each small calculation; worked: {title, setup, steps, answer, soWhat}; questions: [{q, a, parts?, skill, level 1–5, marks}] easy→hard; scope: which of the above the sources mark as beyond the exam. Use only these sources; tag every item with its source."* The pieces land directly in component props; verify them against the sources as above before using any of it.

### Layout lessons

- Break paragraphs with visual elements: no more than one or two short paragraphs in a row, then a table, WorkedExample, ConceptCard, Split, Chain or StepPipeline.
- The reverse holds too: no more than two elements in a row without a short paragraph between them. Each topic runs block → element → block → element, with a lead-in before and a takeaway after every card, table or diagram.
- Put exam cues, traps and memory aids in margin callouts inside Aside. This fills the margin; paragraphs stacked in the main column leave it empty and fail the whitespace rule.
- Adding one paragraph can push a whole block onto a near-empty extra sheet. After each addition, re-render and check the page count; trim rather than pile on.
- Pages that rely on a big Flowchart waste space; prefer a Chain when the diagram is a simple sort.

### Charts, diagrams and images

- Numbers → `BarChart` / `LineChart` / `ScatterPlot`. Simple trees → `Flowchart` / `FormulaTree`. Merging/looping diagrams, sequences, Gantt → `Mermaid` (text in, themed SVG out). See `AUTHORING.md`.
- Images: if Canva tools are available (`generate-image`), you may generate a flat pastel illustration for a topic. Canva only returns a link, a media ID and a small preview, which is NOT print quality. Tell the user to open the link, download the full-size image and save it to `notes/assets/`, then reference it with `<Image src={…}>`. Never embed the thumbnail as if it were final. If Canva isn't available, use an `<Image>` placeholder frame (no `src`) with a clear alt text, or draw the idea with Mermaid/SVG components.

## 2b. Packet rules learned from Session 4 (apply every time)

- **The tree is the packet's skeleton.** Before writing, derive from the Pyramid tree: node questions → the `Objectives` panel (rephrased as can-do sentences; the panel opens the packet, on the Topic Map page or the first notes page); branches → the topics, in tree order, and the cheat-sheet columns; leaves → the ConceptCards; leaf examples → the worked examples; leaf questions → Practice Questions. Nodes the sources mark as beyond the exam become `{ text, extension: true }` objectives and `<Scope>` ranges — never silently dropped, never silently mixed in.
- **Topic shape.** Hook facts first, mechanism in short blocks, the formal ConceptCard *after* the intuition, method taught by several `MiniExample`s, then one exam-style `WorkedExample`. A dependency on an earlier topic gets a REMINDER callout with `see`.
- **Figures are exhibits.** Wrap charts/diagrams/images in `<Figure id caption>` (auto-numbered) and name each one in the prose (`<Fig id/>`); fix every `⚠ figures:` line.
- **Tag the practice.** Order questions easy → hard with `level` pips, `skill` tags and `marks`; use `parts` for a/b/c questions and `bank` for fill-in-the-blank recall.
- **Topic Map = the content tree, not a chain.** Build the source's Pyramid-Principle tree first (use the `pyramid-structure` skill when listed), then draw it with the `tree` prop of `TopicMapPage` (no `cards`): shapes for the root and the branches, bulleted lists for the leaves, in the design system's own boxes and colors. Pass the Pyramid tree's JSON as the `TreeNode` (strings are leaves; a node with `children` becomes a smaller shape with its own bullets) and give each top-level branch the `chapter` color of the topic it belongs to. `heading="How Session N is structured"` puts a section title above it. Only reach for `Mermaid` when the structure merges or loops; its `{{ch:N:S}}` tokens resolve to chapter colors (e.g. `classDef bmi fill:{{ch:9:100}},stroke:{{ch:9:500}},color:{{ch:9:900}}`).
- **Every topic page opens with an Introduction.** After `TopicHeader` and the `<Aside>` margin note, put `<SectionTitle chapter={C.topic}>Introduction</SectionTitle>` and then the first paragraph. Never a blank spacer div: the paragraph must be top-aligned with the margin note.
- **Margin note first.** When a `SectionTitle` follows an `<Aside>`, both headers sit level (built into print.css). The title rule stops at the 62% main column.
- **No Source key / legend table.** No inline source citations in the text (no [Slides], [VI], [CNMS] tags, including ones NotebookLM adds): strip them. Sources appear only in the TopicHeader kicker / page footer.
- **Highlights on every short paragraph.** Each paragraph carries one `<mark>` fact (≤12 words); use `tip` (green) for what to do and `trap` (red) for what not to do.
- **Break paragraphs with visuals.** Paragraph, element, paragraph, element. Gemini/NotebookLM short paragraphs are kept (shortened) as the paragraph blocks.
- **The answer strip states a real result.** One value with a plain label on one line; never two numbers like "50% / +40%" without a label saying what each is.
- **Only facts in the sources.** Drop details NotebookLM added that the slides/readings do not contain; answer case-prep questions with frameworks only when the sources hold no case facts, and say so.

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
