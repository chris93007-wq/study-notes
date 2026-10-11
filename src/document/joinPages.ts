/**
 * Layout fitter for notes pages (runs in the browser, before printing).
 *
 * Three jobs:
 *  1. fitNotePages — search each topic's layout for the fewest printed sheets: where every movable element sits
 *     (margin note → margin beside any block, between two boxes, end of the topic, or full width at the end; concept
 *     card → margin / main column / full width; example → main column / full width) × card density (100% → 80%).
 *  2. packPages — a topic that leaves its sheet under 70% full shares the sheet with the next one when both fit.
 *  3. finalizeFits — clean up, and put a hairline divider between cards that would otherwise touch.
 *
 * A page-break simulation (blocks that must not split jump to the next sheet) stands in for the printer; scripts/pdf.ts
 * checks the real print against it and makes it more cautious for a topic where they disagree.
 */
const GAP = 32; // 24pt between topics that share a sheet
const SAFETY = 28;
const SAFETY_DEFAULT = 16; // a topic counts as one sheet only if it fits with this much to spare
const WASTE_LIMIT = 0.3;
const COMBO_LIMIT = 300; // exhaustive search up to this many layouts per density level, coordinate descent beyond

const debug = () => !!(window as unknown as { __FIT_DEBUG__?: boolean }).__FIT_DEBUG__;

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

/** break-inside: avoid is static per element — read it once. */
const avoidCache = new WeakMap<Element, boolean>();
const avoids = (el: HTMLElement) => {
  let v = avoidCache.get(el);
  if (v === undefined) { v = getComputedStyle(el).breakInside === 'avoid'; avoidCache.set(el, v); }
  return v;
};

/** Simulated end of the content, with blocks that must not split pushed to the next sheet; and the resulting sheet count. */
function simulate(page: HTMLElement): { height: number; sheets: number } {
  const body = page.querySelector<HTMLElement>('.page-body');
  if (!body) return { height: 0, sheets: 1 };
  const sheet = sheetOf(page);
  const top = body.getBoundingClientRect().top;
  let offset = 0;
  let end = 0;
  for (const c of Array.from(body.children) as HTMLElement[]) {
    if (c.hidden || c.style.display === 'none' || c.classList.contains('aside')) continue;
    const r = c.getBoundingClientRect();
    let t = r.top - top + offset;
    let b = r.bottom - top + offset;
    const avoid = c.hasAttribute('data-wide') || avoids(c);
    if (avoid && b - t <= sheet && Math.floor(t / sheet) !== Math.floor((b - 1) / sheet)) {
      const push = Math.floor((b - 1) / sheet) * sheet - t;
      offset += push; t += push; b += push;
    }
    end = Math.max(end, b);
  }
  body.querySelectorAll<HTMLElement>(':scope > .aside').forEach((a) => {
    if (a.style.display === 'none' || !a.children.length) return;
    // margin items that must not split jump to the next sheet too
    for (const c of Array.from(a.children) as HTMLElement[]) {
      const r = c.getBoundingClientRect();
      const t = r.top - top + offset;
      const b = r.bottom - top + offset;
      if (avoids(c) && b - t <= sheet && Math.floor(t / sheet) !== Math.floor((b - 1) / sheet)) end = Math.max(end, Math.floor((b - 1) / sheet) * sheet + (b - t));
    }
    end = Math.max(end, a.getBoundingClientRect().bottom - top + offset + (parseFloat(getComputedStyle(a).marginBottom) || 0));
  });
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
    if ((c as HTMLElement).hidden || (c as HTMLElement).style.display === 'none') return;
    if (c.classList.contains('aside')) Array.from(c.children).forEach(mark); else mark(c);
  });
  let empty = 0;
  for (let i = 0; i < grid.length; i++) if (!grid[i]) empty++;
  return empty / grid.length;
}

const isBox = (el: Element) => el.hasAttribute('data-box') || !!el.querySelector(':scope > [data-box]');

/** Flow children of the page body (no margin asides). Dividers are included: they separate. */
const flowKids = (body: HTMLElement) => (Array.from(body.children) as HTMLElement[]).filter((c) => !c.hidden && c.style.display !== 'none' && !c.classList.contains('aside'));

/** Two cards with nothing between them (not even a divider): returns the second one. */
function adjacentBoxes(body: HTMLElement): HTMLElement | null {
  const kids = flowKids(body);
  for (let i = 1; i < kids.length; i++) if (isBox(kids[i - 1]) && isBox(kids[i])) return kids[i];
  return null;
}

/** A formula that wraps onto a second line (KaTeX breaks after relations/operators): detected by a base starting left of the previous one. */
function formulaWraps(card: HTMLElement): boolean {
  for (const f of Array.from(card.querySelectorAll('.katex-html'))) {
    const bases = Array.from(f.querySelectorAll(':scope > .base'));
    for (let i = 1; i < bases.length; i++) if (bases[i].getBoundingClientRect().left < bases[i - 1].getBoundingClientRect().left + 1) return true;
  }
  return false;
}

/** Density ladder: cards from comfortable (100%) down to compact (80%), then the gaps around boxes tighten. */
const LADDER: Array<{ d: number; compact: '' | '1' | '2'; label: string }> = [
  { d: 1, compact: '', label: 'cards comfortable (100%)' },
  { d: 0.95, compact: '', label: 'cards at 95%' },
  { d: 0.9, compact: '', label: 'cards cozy (90%)' },
  { d: 0.85, compact: '', label: 'cards at 85%' },
  { d: 0.8, compact: '', label: 'cards compact (80%)' },
  { d: 0.8, compact: '1', label: 'cards compact + tighter gaps' },
  { d: 0.8, compact: '2', label: 'cards compact + tightest gaps' },
];

/** Where an element sits. home = authored. */
type Pos =
  | { t: 'home' }
  | { t: 'flow'; wide: boolean } // card: authored place, width forced
  | { t: 'margin'; a: number } // in a margin aside placed before content block a (0 = right under the title)
  | { t: 'between' }
  | { t: 'end' }
  | { t: 'endwide' };

interface Item { el: HTMLElement; kind: 'note' | 'card'; ph: Comment; homeWide: boolean; auto: boolean; concept: boolean; name: string }
interface FitState { items: Item[]; level: number; name: string; header: HTMLElement | null; blocks: number }
const states = new WeakMap<HTMLElement, FitState>();

const setWide = (el: HTMLElement, wide: boolean) => { if (wide) el.setAttribute('data-wide', ''); else el.removeAttribute('data-wide'); };

function stateFor(page: HTMLElement): FitState | null {
  if (states.has(page)) return states.get(page)!;
  const body = page.querySelector<HTMLElement>('.page-body');
  if (!body || page.dataset.layout !== 'margin' || !page.dataset.joinable) return null;
  const items: Item[] = [];
  const track = (el: HTMLElement, kind: 'note' | 'card') => {
    const ph = document.createComment('slot');
    el.parentNode!.insertBefore(ph, el);
    const label = kind === 'note' ? el.querySelector('div > span')?.textContent : el.querySelector('h3')?.textContent;
    items.push({ el, kind, ph, homeWide: el.hasAttribute('data-wide'), auto: el.hasAttribute('data-width-auto'), concept: el.hasAttribute('data-concept'), name: (label || (kind === 'note' ? 'note' : 'card')).trim().slice(0, 28) });
  };
  body.querySelectorAll<HTMLElement>(':scope > .aside > *').forEach((el) => track(el, 'note'));
  body.querySelectorAll<HTMLElement>(':scope > [data-box]').forEach((el) => track(el, 'card'));
  const header = (Array.from(body.children) as HTMLElement[]).find((c) => !!c.querySelector('h2')) ?? null;
  const kids = flowKids(body);
  const blocks = Math.max(0, kids.length - (header ? kids.indexOf(header) + 1 : 0));
  const st = { items, level: 0, name: page.querySelector('h2')?.textContent ?? 'page', header, blocks };
  states.set(page, st);
  return st;
}

/** Lay the page out as `cfg` says at density level `level`. */
function applyConfig(page: HTMLElement, st: FitState, cfg: Pos[], level: number) {
  const body = page.querySelector<HTMLElement>('.page-body')!;
  const { d, compact } = LADDER[level];
  if (d === 1) page.style.removeProperty('--d-page'); else page.style.setProperty('--d-page', String(d));
  if (compact) page.setAttribute('data-compact', compact); else page.removeAttribute('data-compact');

  // 1. everything back to its authored place and width; drop the margin asides made for earlier layouts
  body.querySelectorAll(':scope > .aside[data-synthetic]').forEach((a) => { while (a.firstChild) a.firstChild.remove(); a.remove(); });
  st.items.forEach((it) => { it.ph.parentNode!.insertBefore(it.el, it.ph); setWide(it.el, it.homeWide); });
  // 2. card widths
  cfg.forEach((pos, i) => {
    const it = st.items[i];
    if (it.kind !== 'card') return;
    if (pos.t === 'flow') setWide(it.el, pos.wide);
    else if (pos.t === 'margin') setWide(it.el, false);
  });
  // 3. pull out what leaves its authored place
  const out = cfg.map((pos, i) => ({ pos, it: st.items[i] })).filter(({ pos, it }) => pos.t === 'margin' && (it.kind === 'card' || pos.a >= 0) || pos.t === 'between' || pos.t === 'end' || pos.t === 'endwide');
  out.forEach(({ it }) => it.el.remove());
  // 4. content blocks now in the flow (after the title), then place what was pulled out
  const kids = flowKids(body);
  const blocks = kids.slice(st.header ? kids.indexOf(st.header) + 1 : 0);
  const asides = new Map<number, HTMLElement>();
  const asideFor = (a: number) => {
    const key = Math.min(a, blocks.length);
    if (!asides.has(key)) {
      const el = document.createElement('aside');
      el.className = 'aside';
      el.dataset.synthetic = '1';
      if (key < blocks.length) body.insertBefore(el, blocks[key]); else body.appendChild(el);
      asides.set(key, el);
    }
    return asides.get(key)!;
  };
  for (const { pos, it } of out) {
    if (pos.t === 'margin') asideFor(pos.a).appendChild(it.el);
    else if (pos.t === 'between') { const second = adjacentBoxes(body); if (second) body.insertBefore(it.el, second); else body.appendChild(it.el); }
    else if (pos.t === 'end') body.appendChild(it.el);
    else if (pos.t === 'endwide') { setWide(it.el, true); body.appendChild(it.el); }
  }
  // an authored aside with nothing left in it must not leave a float behind
  body.querySelectorAll<HTMLElement>(':scope > .aside').forEach((a) => { a.style.display = a.children.length ? '' : 'none'; });
  st.level = level;
}

interface Measure { sheets: number; height: number; waste: number; moved: number; unseparated: number; invalid: boolean }

function measure(page: HTMLElement, st: FitState, cfg: Pos[], level: number): Measure {
  applyConfig(page, st, cfg, level);
  const body = page.querySelector<HTMLElement>('.page-body')!;
  const r = simulate(page);
  // a card squeezed narrower than authored must still hold its formula on one line and not clip anything
  let invalid = false;
  cfg.forEach((pos, i) => {
    const it = st.items[i];
    if (it.kind !== 'card') return;
    const narrowed = pos.t === 'margin' || (pos.t === 'flow' && !pos.wide && it.homeWide);
    if (!narrowed) return;
    const inner = it.el.querySelector<HTMLElement>('.card-density');
    if (formulaWraps(it.el) || (inner && inner.scrollWidth > inner.clientWidth + 1)) invalid = true;
  });
  const moved = cfg.filter((p) => p.t !== 'home').length;
  return { sheets: r.sheets, height: r.height, waste: r.sheets === 1 ? wasteOf(page) : 0, moved, unseparated: adjacentBoxes(body) ? 1 : 0, invalid };
}

/** Lower is better. Fewer sheets; while over one sheet, shorter; then within the whitespace limit; cards separated by a note; fewest moves; less waste; shorter. */
const keyOf = (m: Measure): number[] => [m.sheets, m.sheets > 1 ? Math.round(m.height) : 0, m.waste > WASTE_LIMIT ? 1 : 0, m.unseparated, m.moved, Math.round(m.waste * 100), Math.round(m.height)];
const less = (a: number[], b: number[]) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };

function optionsFor(it: Item, st: FitState): Pos[] {
  const home: Pos = { t: 'home' };
  const anchors: Pos[] = Array.from({ length: Math.min(5, st.blocks + 1) }, (_, a) => ({ t: 'margin', a }));
  if (it.kind === 'note') return [home, ...anchors, { t: 'between' }, { t: 'end' }, { t: 'endwide' }];
  if (!it.auto) return [home];
  const flip: Pos = { t: 'flow', wide: !it.homeWide };
  return it.concept ? [home, flip, ...anchors] : [home, flip];
}

/**
 * Best layout at one density level. `exhaustive` tries every layout when there are few enough; otherwise (or when not
 * asked) coordinate descent from the authored layout: improve one element at a time until nothing improves.
 */
function searchLevel(page: HTMLElement, st: FitState, level: number, exhaustive: boolean): { cfg: Pos[]; m: Measure } | null {
  const opts = st.items.map((it) => optionsFor(it, st));
  const total = opts.reduce((n, o) => n * o.length, 1);
  let best: { cfg: Pos[]; m: Measure; key: number[] } | null = null;
  const consider = (cfg: Pos[]) => {
    const m = measure(page, st, cfg, level);
    if (m.invalid) return false;
    const key = keyOf(m);
    if (!best || less(key, best.key)) { best = { cfg, m, key }; return true; }
    return false;
  };
  if (exhaustive && total <= COMBO_LIMIT) {
    const walk = (i: number, cur: Pos[]) => {
      if (i === opts.length) { consider(cur.slice()); return; }
      for (const o of opts[i]) { cur[i] = o; walk(i + 1, cur); }
    };
    walk(0, []);
  } else {
    consider(st.items.map((): Pos => ({ t: 'home' })));
    for (let pass = 0; pass < 3 && best; pass++) {
      let improved = false;
      st.items.forEach((_, i) => {
        for (const o of opts[i]) {
          const cfg = (best as { cfg: Pos[] }).cfg.slice();
          cfg[i] = o;
          if (consider(cfg)) improved = true;
        }
      });
      if (!improved) break;
    }
  }
  const b = best as { cfg: Pos[]; m: Measure } | null;
  if (!b) return null;
  // Still more than one sheet and no sheet saved by moving things: keep the layout as authored rather than a reshuffle that gains nothing.
  const homeCfg = st.items.map((): Pos => ({ t: 'home' }));
  const homeM = measure(page, st, homeCfg, level);
  if (!homeM.invalid && homeM.sheets > 1 && b.m.sheets >= homeM.sheets) return { cfg: homeCfg, m: homeM };
  return { cfg: b.cfg, m: b.m };
}

const describe = (st: FitState, cfg: Pos[]): string[] => cfg.map((p, i) => {
  const n = st.items[i].name;
  if (p.t === 'home') return '';
  if (p.t === 'margin') return `${n} → margin${p.a ? ` beside block ${p.a}` : ''}`;
  if (p.t === 'between') return `${n} → between the cards`;
  if (p.t === 'end') return `${n} → end of the topic`;
  if (p.t === 'endwide') return `${n} → full width at the end`;
  return `${n} → ${p.wide ? 'full width' : 'main column'}`;
}).filter(Boolean);

interface Fit { sheets: number; height: number; level: number; cfg: Pos[] }

/**
 * Fewest sheets across placements × density levels fromLevel..toLevel; at equal sheets the least density change wins.
 * Quick descent finds the first level that fits, then exhaustive searches at that level and the ones above it check that
 * no lighter density would have done. Applies the winner.
 */
function fitPage(page: HTMLElement, fromLevel = 0, toLevel = LADDER.length - 1): Fit | null {
  const st = stateFor(page);
  if (!st) return null;
  type Cand = { level: number; cfg: Pos[]; m: Measure; key: number[] };
  const mk = (level: number, res: { cfg: Pos[]; m: Measure }): Cand => ({ level, cfg: res.cfg, m: res.m, key: [res.m.sheets, level, ...keyOf(res.m).slice(1)] });
  let best: Cand | null = null;
  let fitLevel = -1;
  for (let level = fromLevel; level <= toLevel; level++) {
    const res = searchLevel(page, st, level, fromLevel === toLevel);
    if (!res) continue;
    const c = mk(level, res);
    if (!best || less(c.key, best.key)) best = c;
    if (res.m.sheets === 1) { fitLevel = level; break; }
  }
  if (best && fitLevel >= 0 && fromLevel !== toLevel) {
    // polish: exhaustive at the level found, and at lighter levels in case the quick search missed a layout
    for (let level = fitLevel; level >= fromLevel; level--) {
      const res = searchLevel(page, st, level, true);
      if (!res) break;
      const c = mk(level, res);
      if (res.m.sheets === 1 && less(c.key, best.key)) best = c;
      else if (level < fitLevel && res.m.sheets !== 1) break;
    }
  }
  if (!best) return null;
  applyConfig(page, st, best.cfg, best.level);
  return { sheets: best.m.sheets, height: best.m.height, level: best.level, cfg: best.cfg };
}

/** Solo fit of every notes page. */
export function fitNotePages(): string[] {
  const log: string[] = [];
  document.querySelectorAll<HTMLElement>('section.page').forEach((page) => {
    const r = fitPage(page);
    if (!r) return;
    const st = states.get(page)!;
    if (debug()) log.push(`[debug] ${st.name}: sheets=${r.sheets} height=${Math.round(r.height)} level=${r.level}`);
    const moves = describe(st, r.cfg);
    if (r.level > 0 || moves.length) {
      const parts = [...moves];
      if (r.level > 0) parts.push(LADDER[r.level].label);
      log.push(`${st.name}: ${parts.join('; ')} → ${r.sheets} sheet${r.sheets > 1 ? 's' : ''}`);
    }
  });
  return log;
}

/**
 * Whitespace rule: a sheet may waste about 30% (counting empty margins). A short topic that leaves its sheet under 70%
 * full shares it with the next topic when the two fit together — at a denser card setting for both if that is what it
 * takes. Footers and badges adapt (a joined topic has no sheet of its own).
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
        log.push(`${states.get(el)?.name ?? 'page'}: shares the sheet with the topic before it${lv > 0 ? ` (${LADDER[lv].label})` : ''}`);
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

/** Clean up after fitting, and put a hairline divider between cards that still touch (it takes over the gap: no added height). */
export function finalizeFits(): string[] {
  const log: string[] = [];
  document.querySelectorAll<HTMLElement>('section.page').forEach((page) => {
    const st = states.get(page);
    const body = page.querySelector<HTMLElement>('.page-body');
    if (!body) return;
    if (st) st.items.forEach((it) => it.ph.remove());
    body.querySelectorAll(':scope > .aside').forEach((a) => { if (!a.children.length) a.remove(); });
    for (let guard = 0; guard < 10; guard++) {
      const second = adjacentBoxes(body);
      if (!second) break;
      const rule = document.createElement('div');
      rule.className = 'box-divider';
      rule.setAttribute('aria-hidden', 'true');
      if (second.hasAttribute('data-wide') || second.querySelector(':scope > [data-wide]')) rule.setAttribute('data-wide', '');
      body.insertBefore(rule, second);
      log.push(`${st?.name ?? 'page'}: divider between two cards`);
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
