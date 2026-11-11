# Christine's Notes — PDF study-notes generator

Generates printable, ADHD-friendly study notes from **Christine's Notes design system**. The system has
bright Material chapter colors, pastel fills with dark ink, Merriweather / Lexend / Fira Code type, and KaTeX
math. A notes packet is written as a small React file of page templates and components and rendered to a
US Letter PDF that mixes portrait and landscape pages.

```bash
git clone https://github.com/chris93007-wq/study-notes
cd study-notes
npm install
npm run dev                        # live preview at http://localhost:5173 (pick a document)
npm run pdf                        # build + render every notes/*.tsx → out/*.pdf
npm run pdf -- week-03             # just the matching document(s)
npm run skill:zip                  # build the Claude desktop-app skill zip
npm run new -- week-04-segmentation "Segmentation" --with cover,contents,map,cheat   # start a packet; only the Notes pages are core, the rest is chosen with --with
npm run typecheck
```

`npm run pdf` needs Chromium or Google Chrome. It uses `$CHROMIUM_PATH`, then a Playwright-managed Chromium,
then an installed Chrome. Fonts and KaTeX are bundled, so rendering works offline.

## Use it in the Claude desktop app (chat and Cowork)

The repo packages itself as a **skill**: one zip containing a `SKILL.md` plus the whole generator. Once uploaded, you can ask Claude for notes (or type `/christines-notes`) and it writes the packet and runs `npm run pdf` for you.

**1. Build the zip** (on your computer, from the cloned repo):

```bash
npm install            # first time only
npm run skill:zip      # → skill-dist/christines-notes.zip
```

(`zip` must be on your PATH. It is on macOS and Linux by default.) Rebuild the zip any time you change the generator, components or notes, then re-upload it.

**2. Upload it** in the Claude desktop app:

1. Open **Settings → Capabilities → Skills**. The menu name can differ a little between app versions.
2. Use the upload option there (an upload or “+” button; the exact label varies) and select `skill-dist/christines-notes.zip`. Upload the **zip itself**, not the unzipped folder.
3. Make sure the skill is switched **on**. If a `christines-notes` skill is already listed, remove it or replace it with the new upload.

**3. Use it:** in Claude chat or Cowork, say something like *“Make a Week 4 packet on customer segmentation from these slides”* or type `/christines-notes`. Claude writes `notes/<name>.tsx`, runs `npm run pdf`, and hands you `out/<name>.pdf`. In Cowork, pick the folder you want the PDF saved to.

**What the app's environment needs:** Node 18 or newer, access to the npm registry (for `npm install`), and a Chromium or Chrome browser for the PDF step. If any of these is missing, the skill tells you, still writes the `.tsx` notes file, and you render it on your computer with `npm run pdf`. It never claims to have made a PDF it didn't.

**Claude Code instead?** Start a session in this repo. `.claude/skills/christines-notes` loads automatically; run `/christines-notes`.

## What's here

| Path | |
|---|---|
| `notes/week-03-preference-measurement.tsx` | Sample packet with all 9 page types: Cover, Contents, Topic Map, 4 Notes pages, Cheat Sheet, Formula Sheet, Practice Questions, Appendix, Glossary |
| `notes/design-system.tsx` | The design system as a printable spec: palette, type, spacing, brand, layout, every component |
| `notes/_template.tsx` | Starter packet used by `npm run new`: the Notes pages, plus optional blocks (cover, contents, map, cheat, formulas, quiz, glossary, appendix) kept only when you ask for them with `--with` |
| `src/styles/` | Tokens (Material palette, chapter aliases, type, spacing, radius/shadow), base + highlighter/badge CSS, print geometry |
| `src/components/` | The design-system components, typed: callouts, cards, tables, diagrams, charts, Mermaid, media |
| `src/pages/` | Page templates |
| `src/document/` | `NotesDocument` (meta, Contents, footer) and `Page` |
| `src/layout/` | 12-column `Grid`/`Span`, `Columns`, `Full`, `Stack` |
| `scripts/pdf.ts` | Renderer: two-pass PDF with Contents page numbers, overflow check, bookmarks |
| `docs/AUTHORING.md` | **How to write notes, and the design rules** |
| `.claude/skills/christines-notes/` | Claude Code skill for writing new packets with these rules |
| `skill/SKILL.md`, `scripts/package-skill.ts` | Source and packager for the desktop-app skill zip (`npm run skill:zip`) |
| `project/`, `chats/`, `HANDOFF.md` | The original Claude Design handoff bundle (reference only) |

## How printing works

- Page geometry is real print CSS. `@page` sets US Letter with 0.5in margins. Named pages (`landscape`,
  `portrait-bare`, `cover`) switch orientation and footers per template.
- The footer (breadcrumb + `page / total`) is drawn in `@page` margin boxes, so it repeats on every printed
  sheet with correct numbers.
- Content flows across sheets. Cards, callouts, table rows and diagrams avoid splitting.
- On screen each template is drawn as a sheet, so the preview matches the printable width exactly.
  Browser *Print → Save as PDF* gives the same result as `npm run pdf`, except that Contents page numbers
  only come from `npm run pdf`.
