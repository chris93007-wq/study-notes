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
