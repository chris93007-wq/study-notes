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

export function fitNotePages(): string[] {
  const log: string[] = [];
  document.querySelectorAll<HTMLElement>('section.page[data-joinable][data-layout="margin"]').forEach((page) => {
    const body = page.querySelector<HTMLElement>('.page-body');
    if (!body) return;
    const notes = Array.from(body.querySelectorAll<HTMLElement>(':scope > .aside > *')).reverse();
    let cur = simulate(page);
    for (const note of notes) {
      if (cur.sheets === 1 && cur.height < 0.6 * 960) break;
      const parent = note.parentElement!;
      const next = note.nextSibling;
      body.appendChild(note);
      const after = simulate(page);
      if (after.sheets < cur.sheets || (after.sheets === cur.sheets && cur.height - after.height >= MIN_SAVING)) {
        log.push(`${page.querySelector('h2')?.textContent ?? 'page'}: moved a margin note into the text (${cur.sheets} → ${after.sheets} sheet${after.sheets > 1 ? 's' : ''}, ${Math.round(cur.height)} → ${Math.round(after.height)}px)`);
        cur = after;
      } else {
        parent.insertBefore(note, next);
      }
    }
    // A topic that spills a small tail onto a second sheet: tighten the gaps (never the type size) and keep it if that saves the sheet.
    if (cur.sheets > 1) {
      const sheet = (page.dataset.orientation === 'landscape' ? 8.5 : 11) * 96 - 96;
      const tail = cur.height - Math.floor((cur.height - 1) / sheet) * sheet;
      if (cur.sheets === 2 && tail < 0.4 * sheet) {
        for (const level of ['1', '2']) {
          page.setAttribute('data-compact', level);
          const after = simulate(page);
          if (after.sheets < cur.sheets) {
            log.push(`${page.querySelector('h2')?.textContent ?? 'page'}: tightened spacing (level ${level}) to keep the topic on one sheet`);
            break;
          }
          page.removeAttribute('data-compact');
        }
      }
    }
    body.querySelectorAll(':scope > .aside:empty').forEach((a) => a.remove());
  });
  return log;
}
