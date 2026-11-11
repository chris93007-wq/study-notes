---
name: christines-notes
description: Write a new ADHD-friendly study-notes packet (PDF) for Christine using this repo's design system — from slides, readings, lecture notes or a topic. Use when asked to make notes, a study guide, cheat sheet, formula sheet, practice questions or glossary for a class week.
user-invocable: true
---

You are writing a notes packet as a `.tsx` file in `notes/`, rendered to PDF with this repo's design system.

1. Read `docs/AUTHORING.md` (the rules and the component/page list) and skim `notes/week-03-preference-measurement.tsx` as the reference packet (it shows every page type; its page list is not a template).
2. Gather the source material the user gave you. If the course, week, topics, what the notes are for (exam review, case prep, one reading, quick reference) or which page types they want are unclear, ask before writing.

   **Standing rule — answer every prep question, don't just list it.** Search every source for assigned questions, not just topics: slides, a "Case Preparation Questions" file, discussion questions embedded in or appended to a case or reading, end-of-chapter review questions. Every one tied to this week's material gets a real answer grounded in the source text (the case, article or slide it comes from): never reprinted as a prompt for later, never dropped because it reads like "discussion prep". If a case-prep file exists for the week's case(s) and wasn't in the sources you were given, find it and read it before writing. Give the answers their own place (a titled section on that case's topic page, or a short "Case Discussion Prep" notes page when several cases each have a substantial set; it is content, not an optional supplement). An open-ended question still gets a well-reasoned worked answer built from specific facts in the source, not a restatement or a vague "consider X, Y, Z".

3. **Decide what the packet contains. Only the Notes pages are core.** Cover, Contents, Map, Cheat Sheet, Formula Sheet, Practice Questions, Glossary and Appendix are optional supplements: include one only when it adds value to what these notes are for (`docs/AUTHORING.md` → "What to include": a value test per page and typical recipes). A single topic needs no Map or Contents; case notes need no Formula Sheet unless the analysis is quantitative; a multi-topic exam review usually wants Cover, Contents, Map, Cheat Sheet, Formula Sheet (if quantitative), Practice Questions, Glossary (if term-heavy). A Map (`TopicMapPage`, `MapPage`, or a `ProcessMap` inside a notes page, `flow="arrows"` for a sequence) is for 3+ related topics or any structured process, ladder, framework or timeline; it flexes rows, columns and card density to fit one sheet, and a small process belongs inside its notes page. Say in your hand-off what you left out and why. Never add a page just to fill out the packet.
   Then `npm run new -- week-NN-topic "Title" --with <only the pages you chose>` (e.g. `--with cover,contents,map,cheat`; no `--with` = Notes pages only), and replace every TODO.
4. Follow the rules strictly: one contrasting chapter color per topic used everywhere for that topic; red/green/yellow never as chapter colors; `<mark>` is the only highlight (yellow); `strong.trap` red / `strong.tip` green; callouts only KEY INSIGHT / NOTES / MEMORY AID; every concept has definition + formula (KaTeX or in words) + why; nothing hidden — everything printable.
5. Keep numbers exact and show their formula. No emoji. Third person, plain and direct.
6. Run `npm run typecheck` and `npm run pdf -- week-NN`. Fix every ⚠ overflow warning and ✗ error, then rasterize a few pages (`pdftoppm -r 60 -png`) and look at them before handing over `out/<name>.pdf`.

**When the material comes from NotebookLM** (report .md, flashcards, quizzes, JSON tree), treat it as input, not finished content, and verify it against the original sources first:
- Check every number, and spot-check quotes and examples, against text extracted from the slides and readings. Read slide images (charts, diagrams) yourself, since text extraction misses them.
- Every example keeps its source tag. Drop anything not in the course sources (outside facts, added dates, invented case details) instead of keeping it with a label.
- Never copy infographic text; use its layout only.
- Where slides only pose a case's questions (no facts), answer them with the course frameworks, say plainly that the sources give no case facts, and add none.
- Keep the Gemini short paragraphs (case write-ups, how-it-is-tested notes) as the narrative, with tables, cards and diagrams around them.

**Layout lessons**
- Break paragraphs with visual elements: no more than one or two short paragraphs in a row, then a table, WorkedExample, ConceptCard, Split, Chain or StepPipeline.
- Put exam cues, traps and memory aids in margin callouts inside `Aside`. This fills the margin; paragraphs stacked in the main column leave it empty and fail the whitespace rule.
- Adding one paragraph can push a whole block onto a near-empty extra sheet. After each addition, re-render and check the page count; trim rather than pile on.
- Pages that rely on a big Flowchart waste space; prefer a Chain when the diagram is a simple sort.
