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
  const kids = (Array.from(body.children) as HTMLElement[]).filter((c) => !c.hidden && !c.classList.contains('aside'));
  for (let i = 1; i < kids.length; i++) if (isBox(kids[i - 1]) && isBox(kids[i])) return kids[i];
  return null;
}

export function fitNotePages(): string[] {
  const log: string[] = [];
  document.querySelectorAll<HTMLElement>('section.page[data-joinable][data-layout="margin"]').forEach((page) => {
    const body = page.querySelector<HTMLElement>('.page-body');
    if (!body) return;
    const name = () => page.querySelector('h2')?.textContent ?? 'page';
    const notes = Array.from(body.querySelectorAll<HTMLElement>(':scope > .aside > *')).reverse();
    let cur = simulate(page);
    const separators: Array<{ note: HTMLElement; parent: HTMLElement; next: ChildNode | null; before: HTMLElement }> = [];
    for (const note of notes) {
      const between = adjacentBoxes(body);
      // Boxes should not sit edge to edge: a margin note moved into the text separates them (as long as it costs no sheet).
      if (cur.sheets === 1 && cur.height < 0.6 * 960 && !between) break;
      const parent = note.parentElement!;
      const next = note.nextSibling;
      if (between) body.insertBefore(note, between); else body.appendChild(note);
      const after = simulate(page);
      const saves = after.sheets < cur.sheets || (after.sheets === cur.sheets && cur.height - after.height >= MIN_SAVING);
      if (saves || (between && after.sheets <= cur.sheets)) {
        log.push(`${name()}: moved a margin note into the text${between ? ' to separate two boxes' : ''} (${cur.sheets} → ${after.sheets} sheet${after.sheets > 1 ? 's' : ''}, ${Math.round(cur.height)} → ${Math.round(after.height)}px)`);
        if (between) separators.push({ note, parent, next, before: between });
        cur = after;
      } else {
        parent.insertBefore(note, next);
      }
    }
    // A topic that spills a small tail onto a second sheet: scale the boxes down (90%, then 80%: type, spacing and
    // strokes together), then tighten the gaps, and keep the first step that saves the sheet.
    if (cur.sheets > 1) {
      const sheet = (page.dataset.orientation === 'landscape' ? 8.5 : 11) * 96 - 96;
      const tail = cur.height - Math.floor((cur.height - 1) / sheet) * sheet;
      if (cur.sheets === 2 && tail < 0.4 * sheet) {
        const tiers: Array<[string, () => void, () => void]> = [
          ['boxes at 90%', () => page.style.setProperty('--bs-page', '0.9'), () => page.style.removeProperty('--bs-page')],
          ['boxes at 80%', () => page.style.setProperty('--bs-page', '0.8'), () => page.style.removeProperty('--bs-page')],
          ['boxes at 80% + tighter gaps', () => { page.style.setProperty('--bs-page', '0.8'); page.setAttribute('data-compact', '1'); }, () => { page.style.removeProperty('--bs-page'); page.removeAttribute('data-compact'); }],
          ['boxes at 80% + tightest gaps', () => { page.style.setProperty('--bs-page', '0.8'); page.setAttribute('data-compact', '2'); }, () => { page.style.removeProperty('--bs-page'); page.removeAttribute('data-compact'); }],
        ];
        const tryTiers = () => {
          for (const [label, apply, undo] of tiers) {
            apply();
            if (simulate(page).sheets < cur.sheets) { log.push(`${name()}: ${label} to keep the topic on one sheet`); return true; }
            undo();
          }
          return false;
        };
        if (!tryTiers() && separators.length) {
          // Keeping one sheet matters more than the separator: put the margin notes back (boxes then sit edge to edge, at the same even gap) and retry.
          for (const sp of [...separators].reverse()) sp.parent.insertBefore(sp.note, sp.next);
          if (tryTiers()) log.push(`${name()}: boxes sit edge to edge — a separating note would have cost the single sheet`);
          else for (const sp of separators) body.insertBefore(sp.note, sp.before);
        }
      }
    }
    body.querySelectorAll(':scope > .aside:empty').forEach((a) => a.remove());
    // Boxes that still touch (no margin note to spare, or moving one would cost the sheet) get a hairline divider: it
    // takes over the gap (half above, half below), so it separates them without adding height.
    for (let guard = 0; guard < 6; guard++) {
      const second = adjacentBoxes(body);
      if (!second) break;
      const rule = document.createElement('div');
      rule.className = 'box-divider';
      rule.setAttribute('aria-hidden', 'true');
      if (second.hasAttribute('data-wide') || second.querySelector(':scope > [data-wide]')) rule.setAttribute('data-wide', '');
      body.insertBefore(rule, second);
      log.push(`${name()}: divider between two boxes`);
    }
  });
  return log;
}
