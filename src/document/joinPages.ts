/**
 * Short topics share a sheet. Pages that opted in (data-joinable) are measured at their rendered height; when one fits
 * in what is left of the sheet its predecessor (or predecessor group) occupies, plus a 24pt gap, it gets data-join and
 * print.css lets it continue on that sheet instead of starting a new one. Only single-sheet predecessors qualify, and a
 * safety margin covers differences between this measurement and the print layout.
 */
const GAP = 32;     // 24pt
const SAFETY = 28;

/** Height of the laid-out content (including floated margin notes), ignoring the min-height of a screen sheet. */
export function contentHeight(page: Element): number {
  const body = page.querySelector('.page-body');
  if (!body) return 0;
  const top = body.getBoundingClientRect().top;
  let bottom = top;
  body.querySelectorAll(':scope > *').forEach((c) => { bottom = Math.max(bottom, c.getBoundingClientRect().bottom); });
  return bottom - top;
}

export function joinShortPages(): void {
  const pages = [...document.querySelectorAll<HTMLElement>('section.page')];
  pages.forEach((p) => p.removeAttribute('data-join'));
  let used = 0;
  let prev: HTMLElement | null = null;
  for (const el of pages) {
    const h = contentHeight(el);
    const sheet = (el.dataset.orientation === 'landscape' ? 8.5 : 11) * 96 - 96;
    if (prev && el.dataset.joinable && prev.dataset.page === el.dataset.page && used + GAP + h + SAFETY <= sheet) {
      el.setAttribute('data-join', '1');
      used += GAP + h;
    } else {
      used = h;
    }
    prev = el;
  }
}

/**
 * Whitespace fitter. A margin note taller than the text beside it leaves a blank hole in the main column (the next
 * full-width block has to clear it), and that is often what pushes a topic onto a second sheet. For each notes page,
 * try moving margin notes — last one first — out of the margin to the end of the topic, and keep a move only when it
 * saves a sheet or at least 40px. A page-break simulation (blocks that must not split jump to the next sheet) stands
 * in for the printer.
 */
const MIN_SAVING = 40;

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
  body.querySelectorAll<HTMLElement>(':scope > .aside').forEach((a) => { end = Math.max(end, a.getBoundingClientRect().bottom - top + offset); });
  return { height: end, sheets: Math.max(1, Math.ceil(end / sheet)) };
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

/**
 * Per notes page, search the layout space for the fewest printed sheets. Every movable element (margin notes, and
 * concept cards that aren't full-width) can sit in the margin, in the main column, between two adjacent boxes, at
 * the end of the topic, or across the full width at the end — and how far the boxes shrink is searched too (100% →
 * 80% → tighter gaps). Among layouts with the same number of sheets it prefers, in order: the least shrinking,
 * a note separating two adjacent boxes, the fewest elements moved from where they were authored, the shortest.
 * Page breaks are simulated (blocks that must not split jump to the next sheet).
 */
export function fitNotePages(): string[] {
  const log: string[] = [];
  document.querySelectorAll<HTMLElement>('section.page[data-joinable][data-layout="margin"]').forEach((page) => {
    const body = page.querySelector<HTMLElement>('.page-body');
    if (!body) return;
    const name = page.querySelector('h2')?.textContent ?? 'page';
    const between = adjacentBoxes(body);

    type Item = { el: HTMLElement; home: 'margin' | 'main'; ph: Comment };
    const items: Item[] = [];
    const track = (el: HTMLElement, home: 'margin' | 'main') => {
      const ph = document.createComment('slot');
      el.parentNode!.insertBefore(ph, el);
      items.push({ el, home, ph });
    };
    body.querySelectorAll<HTMLElement>(':scope > .aside > *').forEach((el) => track(el, 'margin'));
    body.querySelectorAll<HTMLElement>(':scope > [data-movable]').forEach((el) => track(el, 'main'));
    if (items.length === 0) return;

    const header = Array.from(body.children).find((c) => c.querySelector('h2') || c.tagName === 'H2') as HTMLElement | undefined;
    const synthetic = document.createElement('aside');
    synthetic.className = 'aside';
    synthetic.dataset.synthetic = '1';
    if (header?.nextSibling) body.insertBefore(synthetic, header.nextSibling); else body.appendChild(synthetic);

    const place = (placements: Place[]) => {
      items.forEach((it) => { it.ph.parentNode!.insertBefore(it.el, it.ph); it.el.removeAttribute('data-wide'); });
      placements.forEach((pl, i) => {
        const { el } = items[i];
        if (pl === 'margin' && items[i].home === 'main') synthetic.appendChild(el);
        else if (pl === 'between' && between) body.insertBefore(el, between);
        else if (pl === 'end') body.appendChild(el);
        else if (pl === 'endwide') { el.setAttribute('data-wide', ''); body.appendChild(el); }
      });
    };
    const setLevel = (i: number) => {
      const { bs, compact } = LADDER[i];
      if (bs === 1) page.style.removeProperty('--bs-page'); else page.style.setProperty('--bs-page', String(bs));
      if (compact) page.setAttribute('data-compact', compact); else page.removeAttribute('data-compact');
    };
    const options = (it: Item): Place[] => {
      const o: Place[] = it.home === 'margin' ? ['margin'] : ['main', 'margin'];
      if (it.home === 'margin') { if (between) o.push('between'); o.push('end', 'endwide'); }
      else if (it.el.querySelector('[data-wide]') === null) { /* cards stay put or go to the margin */ }
      return o;
    };
    let combos: Place[][] = [[]];
    for (const it of items) { const prev = combos; combos = []; for (const c of prev) for (const o of options(it)) combos.push([...c, o]); }

    let best: { key: number[]; level: number; combo: Place[]; sheets: number } | null = null;
    for (let level = 0; level < LADDER.length; level++) {
      setLevel(level);
      for (const combo of combos) {
        place(combo);
        const r = simulate(page);
        const separated = combo.some((c, i) => c === 'between') ? 0 : 1;
        const moved = combo.filter((c, i) => c !== items[i].home && !(c === 'main' && items[i].home === 'main')).length;
        const key = [r.sheets, level, between ? separated : 0, moved, Math.round(r.height)];
        let better = !best;
        if (best) for (let i = 0; i < key.length; i++) { if (key[i] !== best.key[i]) { better = key[i] < best.key[i]; break; } }
        if (better) best = { key, level, combo, sheets: r.sheets };
      }
      if (best && best.sheets === 1) break; // fewest sheets reached at the least shrinking
    }
    if (best) {
      setLevel(best.level);
      place(best.combo);
      const moved = best.combo.map((c, i) => (c === items[i].home || (c === 'main' && items[i].home === 'main') ? '' : c)).filter(Boolean);
      if (best.level > 0 || moved.length > 0) {
        const parts: string[] = [];
        if (moved.length) parts.push(`moved ${moved.map((m) => (m === 'endwide' ? 'full-width at the end' : m === 'between' ? 'between boxes' : m === 'end' ? 'to the end' : 'to the margin')).join(', ')}`);
        if (best.level > 0) parts.push(LADDER[best.level].label);
        log.push(`${name}: ${parts.join('; ')} → ${best.sheets} sheet${best.sheets > 1 ? 's' : ''}`);
      }
    }
    items.forEach((it) => it.ph.remove());
    synthetic.dataset.synthetic = '';
    body.querySelectorAll(':scope > .aside:empty').forEach((a) => a.remove());
    // Boxes that still touch get a hairline divider that takes over the gap (half above, half below): no added height.
    for (let guard = 0; guard < 6; guard++) {
      const second = adjacentBoxes(body);
      if (!second) break;
      const rule = document.createElement('div');
      rule.className = 'box-divider';
      rule.setAttribute('aria-hidden', 'true');
      if (second.hasAttribute('data-wide') || second.querySelector(':scope > [data-wide]')) rule.setAttribute('data-wide', '');
      body.insertBefore(rule, second);
      log.push(`${name}: divider between two boxes`);
    }
  });
  return log;
}
