/**
 * Short topics share a sheet. Pages that opted in (data-joinable) are measured at their rendered height; when one fits
 * in what is left of the sheet its predecessor (or predecessor group) occupies, plus a 24pt gap, it gets data-join and
 * print.css lets it continue on that sheet instead of starting a new one. Only single-sheet predecessors qualify, and a
 * safety margin covers differences between this measurement and the print layout.
 */
const GAP = 32;     // 24pt
const SAFETY = 28;
const SAFETY_DEFAULT = 0; // simulation vs print: a topic counts as one sheet only if it fits with this much to spare (the PDF script raises it per topic if the print disagrees)

/** Height of the laid-out content (including floated margin notes), ignoring the min-height of a screen sheet. */
export function contentHeight(page: Element): number {
  const body = page.querySelector('.page-body');
  if (!body) return 0;
  const top = body.getBoundingClientRect().top;
  let bottom = top;
  body.querySelectorAll(':scope > *').forEach((c) => { bottom = Math.max(bottom, c.getBoundingClientRect().bottom); });
  return bottom - top;
}

const sheetOf = (page: HTMLElement) => (page.dataset.orientation === 'landscape' ? 8.5 : 11) * 96 - 96;
const biasOf = (page: HTMLElement) => SAFETY_DEFAULT + (window.__FIT_BIAS__?.[[...document.querySelectorAll('section.page')].indexOf(page)] ?? 0);

/**
 * Whitespace fitter. A margin note taller than the text beside it leaves a blank hole in the main column (the next
 * full-width block has to clear it), and that is often what pushes a topic onto a second sheet. For each notes page,
 * try moving margin notes — last one first — out of the margin to the end of the topic, and keep a move only when it
 * saves a sheet or at least 40px. A page-break simulation (blocks that must not split jump to the next sheet) stands
 * in for the printer.
 */
const MIN_SAVING = 40;
const WASTE_LIMIT = 0.3;

function simulate(page: HTMLElement): { height: number; sheets: number } {
  const body = page.querySelector<HTMLElement>('.page-body');
  if (!body) return { height: 0, sheets: 1 };
  const sheet = (page.dataset.orientation === 'landscape' ? 8.5 : 11) * 96 - 96;
  const top = body.getBoundingClientRect().top;
  let offset = 0;
  let end = 0;
  for (const c of Array.from(body.children) as HTMLElement[]) {
    if (c.hidden || c.classList.contains('aside')) continue;
    const r = c.getBoundingClientRect();
    let t = r.top - top + offset;
    let b = r.bottom - top + offset;
    const avoid = c.hasAttribute('data-wide') || getComputedStyle(c).breakInside === 'avoid';
    if (avoid && b - t <= sheet && Math.floor(t / sheet) !== Math.floor((b - 1) / sheet)) {
      const push = Math.floor((b - 1) / sheet) * sheet - t;
      offset += push; t += push; b += push;
    }
    end = Math.max(end, b);
  }
  body.querySelectorAll<HTMLElement>(':scope > .aside').forEach((a) => { end = Math.max(end, a.getBoundingClientRect().bottom - top + offset + (a.children.length ? parseFloat(getComputedStyle(a).marginBottom) || 0 : 0)); });
  return { height: end, sheets: end <= sheet - biasOf(page) ? 1 : Math.max(2, Math.ceil(end / sheet)) };
}

/** Fraction of a one-sheet topic's printable area (24px grid) that no block covers — empty margin and empty foot of the sheet. */
function wasteOf(page: HTMLElement): number {
  const body = page.querySelector<HTMLElement>('.page-body');
  if (!body) return 0;
  const b = body.getBoundingClientRect();
  const H = sheetOf(page);
  const W = b.width;
  const cell = 24;
  const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
  const grid = new Uint8Array(cols * rows);
  const mark = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const x0 = Math.max(0, Math.floor((r.left - b.left) / cell)), x1 = Math.min(cols - 1, Math.floor((r.right - b.left - 1) / cell));
    const y0 = Math.max(0, Math.floor((r.top - b.top) / cell)), y1 = Math.min(rows - 1, Math.floor((r.bottom - b.top - 1) / cell));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y * cols + x] = 1;
  };
  Array.from(body.children).forEach((c) => {
    if ((c as HTMLElement).hidden) return;
    if (c.classList.contains('aside')) Array.from(c.children).forEach(mark); else mark(c);
  });
  let empty = 0;
  for (let i = 0; i < grid.length; i++) if (!grid[i]) empty++;
  return empty / grid.length;
}

/** Two boxes (concept card, worked example) with nothing between them: returns the second one. */
function adjacentBoxes(body: HTMLElement): HTMLElement | null {
  const isBox = (el: Element) => el.hasAttribute('data-box') || !!el.querySelector(':scope > [data-box]');
  const kids = (Array.from(body.children) as HTMLElement[]).filter((c) => !c.hidden && !c.classList.contains('aside') && !c.classList.contains('box-divider'));
  for (let i = 1; i < kids.length; i++) if (isBox(kids[i - 1]) && isBox(kids[i])) return kids[i];
  return null;
}

/** Shrink ladder: boxes scale (type, spacing, strokes together) from 100% to 80%, then the gaps tighten. */
const LADDER: Array<{ bs: number; compact: '' | '1' | '2'; label: string }> = [
  { bs: 1, compact: '', label: 'boxes at 100%' },
  { bs: 0.95, compact: '', label: 'boxes at 95%' },
  { bs: 0.9, compact: '', label: 'boxes at 90%' },
  { bs: 0.85, compact: '', label: 'boxes at 85%' },
  { bs: 0.8, compact: '', label: 'boxes at 80%' },
  { bs: 0.8, compact: '1', label: 'boxes at 80% + tighter gaps' },
  { bs: 0.8, compact: '2', label: 'boxes at 80% + tightest gaps' },
];

type Place = 'margin' | 'main' | 'between' | 'end' | 'endwide';

interface Item { el: HTMLElement; home: 'margin' | 'main'; ph: Comment }
interface FitState { items: Item[]; synthetic: HTMLElement; between: HTMLElement | null; combos: Place[][]; level: number; name: string }
const states = new WeakMap<HTMLElement, FitState>();

function stateFor(page: HTMLElement): FitState | null {
  if (states.has(page)) return states.get(page)!;
  const body = page.querySelector<HTMLElement>('.page-body');
  if (!body || page.dataset.layout !== 'margin' || !page.dataset.joinable) return null;
  const items: Item[] = [];
  const track = (el: HTMLElement, home: 'margin' | 'main') => {
    const ph = document.createComment('slot');
    el.parentNode!.insertBefore(ph, el);
    items.push({ el, home, ph });
  };
  const between = adjacentBoxes(body);
  body.querySelectorAll<HTMLElement>(':scope > .aside > *').forEach((el) => track(el, 'margin'));
  body.querySelectorAll<HTMLElement>(':scope > [data-movable]').forEach((el) => track(el, 'main'));
  const header = Array.from(body.children).find((c) => c.querySelector('h2') || c.tagName === 'H2') as HTMLElement | undefined;
  const synthetic = document.createElement('aside');
  synthetic.className = 'aside';
  if (header?.nextSibling) body.insertBefore(synthetic, header.nextSibling); else body.appendChild(synthetic);
  const options = (it: Item): Place[] => {
    if (it.home === 'main') return ['main', 'margin'];
    const o: Place[] = ['margin'];
    if (between) o.push('between');
    o.push('end', 'endwide');
    return o;
  };
  let combos: Place[][] = [[]];
  for (const it of items) { const prev = combos; combos = []; for (const c of prev) for (const o of options(it)) combos.push([...c, o]); }
  const st = { items, synthetic, between, combos, level: 0, name: page.querySelector('h2')?.textContent ?? 'page' };
  states.set(page, st);
  return st;
}

function applyConfig(page: HTMLElement, st: FitState, combo: Place[], level: number) {
  const body = page.querySelector<HTMLElement>('.page-body')!;
  const { bs, compact } = LADDER[level];
  if (bs === 1) page.style.removeProperty('--bs-page'); else page.style.setProperty('--bs-page', String(bs));
  if (compact) page.setAttribute('data-compact', compact); else page.removeAttribute('data-compact');
  st.items.forEach((it) => { it.ph.parentNode!.insertBefore(it.el, it.ph); it.el.removeAttribute('data-wide'); });
  combo.forEach((pl, i) => {
    const { el, home } = st.items[i];
    if (pl === 'margin' && home === 'main') st.synthetic.appendChild(el);
    else if (pl === 'between' && st.between) body.insertBefore(el, st.between);
    else if (pl === 'end') body.appendChild(el);
    else if (pl === 'endwide') { el.setAttribute('data-wide', ''); body.appendChild(el); }
  });
  st.level = level;
}

/**
 * Search placements (margin / main / between two boxes / end / full-width at the end, for every movable element) ×
 * box scale (levels fromLevel..toLevel of the shrink ladder) for the fewest printed sheets, then apply the winner.
 * Ties break on: least shrinking, a note separating two adjacent boxes, fewest elements moved from where they were
 * authored, shortest. Returns the applied layout's simulated height and sheets.
 */
function fitPage(page: HTMLElement, fromLevel = 0, toLevel = LADDER.length - 1): { sheets: number; height: number; level: number; moved: Place[] } | null {
  const st = stateFor(page);
  if (!st) return null;
  let best: { key: number[]; level: number; combo: Place[]; sheets: number; height: number } | null = null;
  for (let level = fromLevel; level <= toLevel; level++) {
    for (const combo of st.combos) {
      applyConfig(page, st, combo, level);
      const r = simulate(page);
      const separated = st.between && combo.includes('between') ? 0 : 1;
      const moved = combo.filter((c, i) => c !== st.items[i].home && !(c === 'main' && st.items[i].home === 'main')).length;
      const waste = r.sheets === 1 ? wasteOf(page) : 0;
      const key = [r.sheets, waste > WASTE_LIMIT ? 1 : 0, level, st.between ? separated : 0, moved, Math.round(waste * 100), Math.round(r.height)];
      let better = !best;
      if (best) for (let i = 0; i < key.length; i++) { if (key[i] !== best.key[i]) { better = key[i] < best.key[i]; break; } }
      if (better) best = { key, level, combo, sheets: r.sheets, height: r.height };
    }
    if (best && best.sheets === 1 && best.key[1] === 0) break;
  }
  if (!best) return null;
  applyConfig(page, st, best.combo, best.level);
  const moved = best.combo.map((c, i) => (c === st.items[i].home ? '' : c)).filter(Boolean) as Place[];
  return { sheets: best.sheets, height: best.height, level: best.level, moved };
}

const describe = (moved: Place[]) => moved.map((m) => (m === 'endwide' ? 'full-width at the end' : m === 'between' ? 'between boxes' : m === 'end' ? 'to the end' : 'to the margin')).join(', ');

/** Solo fit of every notes page. */
export function fitNotePages(): string[] {
  const log: string[] = [];
  document.querySelectorAll<HTMLElement>('section.page').forEach((page) => {
    const r = fitPage(page);
    if (r && (window as unknown as { __FIT_DEBUG__?: boolean }).__FIT_DEBUG__) log.push(`[debug] ${states.get(page)!.name}: sheets=${r.sheets} height=${Math.round(r.height)} level=${r.level}`);
    if (r && (r.level > 0 || r.moved.length)) {
      const parts: string[] = [];
      if (r.moved.length) parts.push(`moved ${describe(r.moved)}`);
      if (r.level > 0) parts.push(LADDER[r.level].label);
      log.push(`${states.get(page)!.name}: ${parts.join('; ')} → ${r.sheets} sheet${r.sheets > 1 ? 's' : ''}`);
    }
  });
  return log;
}

/**
 * Whitespace rule: a sheet may waste about 30% (counting empty margins). A short topic that leaves its sheet under 70%
 * full shares it with the next topic when the two fit together — shrinking the boxes of both (down to 80%) if that is
 * what it takes. Footers and badges adapt (a joined topic has no sheet of its own).
 */
export function packPages(): string[] {
  const log: string[] = [];
  const pages = [...document.querySelectorAll<HTMLElement>('section.page')];
  pages.forEach((p) => p.removeAttribute('data-join'));
  const height = (p: HTMLElement) => (states.has(p) ? simulate(p).height : contentHeight(p));
  const single = (p: HTMLElement) => (states.has(p) ? simulate(p).sheets === 1 : contentHeight(p) <= sheetOf(p) - biasOf(p));
  let group: HTMLElement[] = [];
  const used = () => group.reduce((n, p, i) => n + height(p) + (i ? GAP : 0), 0);

  for (const el of pages) {
    const sheet = sheetOf(el);
    if ((window as unknown as { __FIT_DEBUG__?: boolean }).__FIT_DEBUG__) log.push(`[debug] pack ${states.get(el)?.name ?? el.querySelector('h1,h2')?.textContent ?? el.dataset.page}: group=${group.length} used=${Math.round(used())} h=${Math.round(height(el))} single=${single(el)} joinable=${!!el.dataset.joinable}`);
    if (group.length && el.dataset.joinable && el.dataset.page === group[0].dataset.page && single(el) && used() < 0.7 * sheet) {
      const members = [...group, el];
      const before = members.map((m) => (states.has(m) ? states.get(m)!.level : 0));
      el.setAttribute('data-join', '1');
      let ok = false;
      for (let level = Math.max(...before); level < LADDER.length && !ok; level++) {
        for (const m of members) if (states.has(m)) fitPage(m, level, level);
        const total = members.reduce((n, m, i) => n + height(m) + (i ? GAP : 0), 0);
        ok = members.every((m) => (states.has(m) ? simulate(m).sheets === 1 : true)) && total + SAFETY + biasOf(el) - SAFETY_DEFAULT <= sheet;
      }
      if (ok) {
        const lv = states.get(el)?.level ?? 0;
        log.push(`${states.get(el)?.name ?? 'page'}: shares the sheet with the topic before it${lv > 0 ? ` (boxes at ${Math.round(LADDER[lv].bs * 100)}%)` : ''}`);
        group = members;
        continue;
      }
      el.removeAttribute('data-join');
      members.forEach((m, i) => { if (states.has(m)) fitPage(m, before[i], before[i]); });
    }
    group = single(el) ? [el] : [];
  }
  return log;
}

/** Clean up after fitting, and put a hairline divider between boxes that still touch (it takes over the gap: no added height). */
export function finalizeFits(): string[] {
  const log: string[] = [];
  document.querySelectorAll<HTMLElement>('section.page').forEach((page) => {
    const st = states.get(page);
    const body = page.querySelector<HTMLElement>('.page-body');
    if (!body) return;
    if (st) st.items.forEach((it) => it.ph.remove());
    body.querySelectorAll(':scope > .aside:empty').forEach((a) => a.remove());
    for (let guard = 0; guard < 6; guard++) {
      const second = adjacentBoxes(body);
      if (!second) break;
      const rule = document.createElement('div');
      rule.className = 'box-divider';
      rule.setAttribute('aria-hidden', 'true');
      if (second.hasAttribute('data-wide') || second.querySelector(':scope > [data-wide]')) rule.setAttribute('data-wide', '');
      body.insertBefore(rule, second);
      log.push(`${st?.name ?? 'page'}: divider between two boxes`);
    }
  });
  return log;
}

/**
 * Source info ("L2 Slides 18-20 · HW2 Q2") lives in the page footer, not under the title. Every topic's kicker is hidden
 * before fitting (so the layout is measured without it) and a page of its own gets a named @page whose footer centre
 * carries the text on every sheet of the topic. A topic that shares a sheet (data-join) can't have its own footer, so it
 * keeps its kicker under the title.
 */
export function hideKickers(): void {
  document.querySelectorAll<HTMLElement>('section.page .topic-kicker').forEach((k) => { k.style.display = 'none'; });
}

export function sourcesToFooter(): void {
  const rules: string[] = [];
  document.querySelectorAll<HTMLElement>('section.page').forEach((page, i) => {
    const kicker = page.querySelector<HTMLElement>('.topic-kicker');
    if (!kicker) return;
    const text = kicker.textContent?.trim();
    if (!text || page.hasAttribute('data-join') || page.dataset.page !== 'portrait') { kicker.style.display = ''; return; }
    const id = `src-${i}`;
    const css = `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    rules.push(`@page ${id}{@bottom-center{content:${css};vertical-align:top;padding-top:13px;border-top:1px solid var(--line);font-family:var(--font-body);font-size:var(--text-xs);letter-spacing:0.02em;color:var(--ink-500);text-align:center;white-space:nowrap;overflow:hidden}}`);
    page.style.setProperty('page', id);
  });
  if (rules.length) {
    const style = document.createElement('style');
    style.textContent = rules.join('\n');
    document.head.appendChild(style);
  }
}

/** What the fitter predicts, per Contents entry: the sheet count of each topic (joined topics are skipped), read by scripts/pdf.ts to check the print agrees. */
export function predictedSheets(): Record<number, { index: number; sheets: number }> {
  const out: Record<number, { index: number; sheets: number }> = {};
  [...document.querySelectorAll<HTMLElement>('section.page')].forEach((p, index) => {
    const m = /^toc-(\d+)$/.exec(p.id);
    if (!m || p.hasAttribute('data-join') || !states.has(p)) return;
    out[Number(m[1])] = { index, sheets: simulate(p).sheets };
  });
  return out;
}
