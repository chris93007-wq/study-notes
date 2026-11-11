---
name: christines-notes
description: Write a new ADHD-friendly study-notes packet (PDF) for Christine using this repo's design system — from slides, readings, lecture notes or a topic. Use when asked to make notes, a study guide, cheat sheet, formula sheet, practice questions or glossary for a class week.
user-invocable: true
---

You are writing a notes packet as a `.tsx` file in `notes/`, rendered to PDF with this repo's design system.

1. Read `docs/AUTHORING.md` (the rules and the component/page list) and skim `notes/week-03-preference-measurement.tsx` as the reference packet (it shows every page type; its page list is not a template).
2. Gather the source material the user gave you. If the course, week, topics, what the notes are for (exam review, case prep, one reading, quick reference) or which page types they want are unclear, ask before writing.
3. **Decide what the packet contains. Only the Notes pages are core.** Cover, Contents, Map, Cheat Sheet, Formula Sheet, Practice Questions, Glossary and Appendix are optional supplements: include one only when it adds value to what these notes are for (`docs/AUTHORING.md` → "What to include": a value test per page and typical recipes). A single topic needs no Map or Contents; case notes need no Formula Sheet unless the analysis is quantitative; a multi-topic exam review usually wants Cover, Contents, Map, Cheat Sheet, Formula Sheet (if quantitative), Practice Questions, Glossary (if term-heavy). A Map (`TopicMapPage`, `MapPage`, or a `ProcessMap` inside a notes page, `flow="arrows"` for a sequence) is for 3+ related topics or any structured process, ladder, framework or timeline; it flexes rows, columns and card density to fit one sheet, and a small process belongs inside its notes page. Say in your hand-off what you left out and why. Never add a page just to fill out the packet.
   Then `npm run new -- week-NN-topic "Title" --with <only the pages you chose>` (e.g. `--with cover,contents,map,cheat`; no `--with` = Notes pages only), and replace every TODO.
4. Follow the rules strictly: one contrasting chapter color per topic used everywhere for that topic; red/green/yellow never as chapter colors; `<mark>` is the only highlight (yellow); `strong.trap` red / `strong.tip` green; callouts only KEY INSIGHT / NOTES / MEMORY AID; every concept has definition + formula (KaTeX or in words) + why; nothing hidden — everything printable.
5. Keep numbers exact and show their formula. No emoji. Third person, plain and direct.
6. Run `npm run typecheck` and `npm run pdf -- week-NN`. Fix every ⚠ overflow warning and ✗ error, then rasterize a few pages (`pdftoppm -r 60 -png`) and look at them before handing over `out/<name>.pdf`.
