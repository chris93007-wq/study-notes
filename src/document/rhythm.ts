/**
 * Textbook-rhythm audit (runs in the browser on the authored DOM, before the fitter moves anything).
 *
 * A notes topic should read like a textbook page: short paragraph blocks (1–2 paragraphs) alternating with elements
 * (concept and example cards, tables, diagrams, charts, steps, maps) — not all the prose at the top followed by a stack
 * of boxes, and not a wall of text. Margin notes (<Aside>) are neither: they annotate the text beside them.
 *
 * Reported per topic as warnings (what to write is a content decision); scripts/pdf.ts prints them as "⚠ rhythm: …".
 * The rule and how to fix each warning: docs/AUTHORING.md, "Textbook rhythm".
 */

/** A paragraph longer than this many words is no longer "short" (about 7 lines in the main column). */
export const MAX_PARAGRAPH_WORDS = 75;
/** Paragraphs (or lists) allowed in a row: one block is 1–2 paragraphs. */
export const MAX_TEXT_RUN = 2;
/** Elements allowed in a row before some text has to come back. */
export const MAX_ELEMENT_RUN = 2;

interface Block { kind: 'text' | 'element'; el: HTMLElement; /** title of the Section it sits in */ title?: string }

const TEXT_TAGS = new Set(['P', 'UL', 'OL', 'DL', 'BLOCKQUOTE']);
/** Anything that contains one of these is an element, not running text. */
const VISUAL = '[data-box],[data-map],table,svg,figure,img,canvas';

/** Not part of the reading flow: hidden nodes, margin notes, dividers, headings and page furniture. */
const neutral = (el: HTMLElement) =>
  el.hidden || el.style.display === 'none' || el.tagName === 'ASIDE' || /^H[1-6]$/.test(el.tagName) ||
  el.classList.contains('aside') || el.classList.contains('box-divider') || el.classList.contains('page-badge') || el.classList.contains('toc-marker') ||
  el.hasAttribute('data-topic-header') || el.hasAttribute('data-section-title');

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Words in an element's text, counting each formula once (KaTeX renders its text twice: MathML and HTML). */
function wordsOf(el: HTMLElement): number {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.katex-mathml').forEach((n) => n.remove());
  return clean(clone.textContent ?? '').split(' ').filter(Boolean).length;
}

/** A wrapper whose children are all paragraphs, lists, headings or badges is running text; any other structure (Split, Matrix, a grid of cards) is an element. */
function plainText(el: HTMLElement): boolean {
  const kids = Array.from(el.children) as HTMLElement[];
  return kids.length > 0 && kids.every((k) => TEXT_TAGS.has(k.tagName) || /^H[1-6]$/.test(k.tagName) || k.classList.contains('badge'));
}

/** The topic's content in authored order, with Sections flattened (their title is neutral, their content counts). */
function collect(parent: Element, out: Block[], title?: string): void {
  for (const el of Array.from(parent.children) as HTMLElement[]) {
    if (neutral(el)) continue;
    if (TEXT_TAGS.has(el.tagName)) { out.push({ kind: 'text', el, title }); continue; }
    if (el.classList.contains('section')) { collect(el.querySelector(':scope > .stack-3') ?? el, out, clean(el.querySelector('[data-section-title]')?.textContent ?? '') || undefined); continue; }
    if (el.matches(VISUAL) || el.querySelector(VISUAL)) { out.push({ kind: 'element', el, title }); continue; }
    if (plainText(el)) { out.push({ kind: 'text', el, title }); continue; } // a wrapper (<Wide>, <Stack>) around plain text
    const words = wordsOf(el);
    if (!words) continue; // a spacer
    if (words <= 6 && el.querySelector('.badge')) continue; // a badge row
    out.push({ kind: 'element', el, title }); // a chain of pills, a grid of cards, any other component
  }
}

const snippet = (el: HTMLElement, n: number) => clean(el.textContent ?? '').slice(0, n);

/** "concept card "EBITDA"", "table "What the reviews found"" — enough to find the element in the source. */
function describe(b: Block): string {
  const el = b.el;
  const kind = el.matches('[data-concept]') || el.querySelector('[data-concept]') ? 'concept card'
    : el.matches('[data-box]') || el.querySelector('[data-box]') ? 'example card'
    : el.matches('[data-map]') || el.querySelector('[data-map]') ? 'map'
    : el.matches('[data-steps]') || el.querySelector('[data-steps]') ? 'steps'
    : el.matches('[data-chain]') || el.querySelector('[data-chain]') ? 'chain'
    : el.matches('table') || el.querySelector('table') ? 'table'
    : el.matches('figure,img') || el.querySelector('figure,img') ? 'figure'
    : el.matches('svg') || el.querySelector('svg') ? 'diagram'
    : 'element';
  let label = b.title ?? '';
  if (!label && kind === 'table') label = Array.from(el.querySelectorAll('th')).slice(0, 3).map((th) => clean(th.textContent ?? '')).join(' / ');
  if (!label) label = (el.innerText ?? '').split('\n').map(clean).find((l) => l && !/^(worked example|concept|example)$/i.test(l) && /[a-z]/i.test(l)) ?? '';
  label = label.length > 34 ? `${label.slice(0, 33)}…` : label;
  return label ? `${kind} "${label}"` : kind;
}

function topicName(page: Element, i: number): string {
  const h2 = page.querySelector('[data-topic-header] h2');
  if (h2) {
    const num = clean(h2.querySelector('span')?.textContent ?? '');
    const title = clean((h2.textContent ?? '').slice(num.length));
    return `topic ${num ? `${num} · ` : ''}${title}`;
  }
  return `page template ${i + 1}`;
}

/** One line per problem, without a prefix. Empty when every topic alternates short paragraph blocks and elements. */
export function auditRhythm(): string[] {
  const out: string[] = [];
  document.querySelectorAll<HTMLElement>('section.page.notes-flow').forEach((page, i) => {
    const body = page.querySelector<HTMLElement>('.page-body');
    if (!body) return;
    const name = topicName(page, i);
    const blocks: Block[] = [];
    collect(body, blocks);
    const elements = blocks.filter((b) => b.kind === 'element');
    if (elements.length === 0 && blocks.length <= MAX_TEXT_RUN) return;

    const hasParagraph = blocks.some((b) => b.kind === 'text' && (b.el.tagName === 'P' || !!b.el.querySelector('p')));
    const noText = elements.length >= 2 && !hasParagraph;

    let run: Block[] = [];
    const flush = () => {
      if (!run.length) return;
      if (run[0].kind === 'element' && run.length > MAX_ELEMENT_RUN && !noText) {
        const shown = run.slice(0, 4).map(describe).join(', ') + (run.length > 4 ? ', …' : '');
        out.push(`${name}: ${run.length} elements in a row with no paragraph between them (${shown}). Put a short lead-in paragraph before the second one, and a one-sentence takeaway after the last, so text and elements alternate.`);
      } else if (run[0].kind === 'text' && run.length > MAX_TEXT_RUN) {
        out.push(`${name}: ${run.length} paragraphs/lists in a row ("${snippet(run[0].el, 36)}…"). Keep a text block to 1–2 paragraphs and put an element (table, card, diagram, steps) between the blocks.`);
      }
      run = [];
    };
    for (const b of blocks) {
      if (run.length && run[0].kind !== b.kind) flush();
      run.push(b);
    }
    flush();

    for (const b of blocks) {
      const n = b.el.tagName === 'P' ? wordsOf(b.el) : 0;
      if (n > MAX_PARAGRAPH_WORDS) out.push(`${name}: a paragraph of ${n} words ("${snippet(b.el, 36)}…"). Keep paragraphs to about 60 words: split it and put an element between the halves, or cut it to its one main point.`);
    }

    if (noText) out.push(`${name}: ${elements.length} elements and no paragraph at all. Add a short lead-in before the first element and a takeaway after the last, so the topic reads like a textbook page.`);
  });
  return out;
}
