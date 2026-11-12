/**
 * Figure numbering and the figure-reference check (runs in the browser before the fitter).
 *
 * Every <Figure> gets "Fig. N" in reading order across the document, each <Fig id> reference is filled with the
 * matching number, and a figure that no sentence names is reported — a numbered figure the text never points at
 * is decoration, not an exhibit. Warnings are printed by scripts/pdf.ts as "⚠ figures: …".
 */

const clean = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

function pageName(page: Element, i: number): string {
  const h2 = page.querySelector('[data-topic-header] h2, h2');
  return h2 ? `"${clean(h2.textContent).slice(0, 40)}"` : `page template ${i + 1}`;
}

/** Number the figures, resolve the references, and return the warnings. */
export function numberFigures(): string[] {
  const out: string[] = [];
  const byId = new Map<string, number>();
  const figs = Array.from(document.querySelectorAll<HTMLElement>('figure[data-fig]'));
  figs.forEach((f, i) => {
    const n = i + 1;
    const slot = f.querySelector<HTMLElement>('.fig-n');
    if (slot) slot.textContent = `Fig. ${n}`;
    f.dataset.figN = String(n);
    const id = f.dataset.figId;
    if (!id) return;
    if (byId.has(id)) out.push(`two figures share id "${id}" — references resolve to the first (Fig. ${byId.get(id)})`);
    else byId.set(id, n);
  });
  document.querySelectorAll<HTMLElement>('[data-fig-ref]').forEach((ref) => {
    const id = ref.dataset.figRef ?? '';
    const n = byId.get(id);
    if (n) ref.textContent = `Fig. ${n}`;
    else out.push(`<Fig id="${id}"> matches no <Figure id> — the reference prints as "Fig. ?"`);
  });
  // The check: each figure's number appears in its page's text at least once outside its own caption.
  document.querySelectorAll<HTMLElement>('section.page').forEach((page, pi) => {
    const text = clean((page as HTMLElement).innerText ?? page.textContent);
    page.querySelectorAll<HTMLElement>('figure[data-fig]').forEach((f) => {
      const n = f.dataset.figN;
      if (!n) return;
      const hits = text.split(`Fig. ${n}`).length - 1;
      if (hits <= 1) {
        const cap = clean(f.querySelector('figcaption')?.textContent).replace(/^▲\s*Fig\. \d+\s*—\s*/, '').slice(0, 36);
        out.push(`Fig. ${n} ("${cap}…") on ${pageName(page, pi)} is never named in the text — point a sentence at it ("… as Fig. ${n} shows", or <Fig id=…/>)`);
      }
    });
  });
  return out;
}
