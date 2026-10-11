import type { CSSProperties } from 'react';
import { math } from '../components/math/Tex';
import { Page } from '../document/Page';
import { useDocument } from '../document/context';
import type { TocSpec } from '../document/NotesDocument';
import { ch, type Chapter } from '../components/types';

export interface GlossaryPageProps {
  toc?: TocSpec;
  title?: string;
  /** Any order — sorted and grouped by first letter automatically */
  entries: Array<{ term: string; def: string }>;
  /** Letter-heading color; defaults to the brand chapter */
  chapter?: Chapter;
}

/** 2-column alphabetical dictionary layout, grouped by letter. */
export function GlossaryPage({ toc, title = 'Glossary', entries, chapter }: GlossaryPageProps) {
  const doc = useDocument();
  const c = chapter ?? doc?.meta.brandChapter ?? 1;
  const groups = new Map<string, GlossaryPageProps['entries']>();
  [...entries]
    .sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }))
    .forEach((e) => {
      const letter = /^[a-z]/i.test(e.term) ? e.term[0].toUpperCase() : '#';
      groups.set(letter, [...(groups.get(letter) ?? []), e]);
    });

  const h1: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24.2, margin: '0 0 17.3px' };
  const letterHead: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: ch(c, 500), letterSpacing: '0.06em', margin: '12.1px 0 1.8px', breakAfter: 'avoid' };
  const entry: CSSProperties = { breakInside: 'avoid', padding: '6.1px 0' };
  const divider = '1px solid var(--line)';

  // Rows are separated by a hairline, but never after the last row of a column: split the sorted terms into two
  // balanced columns by estimated height when the glossary fits one sheet; otherwise flow in CSS columns.
  const flat = [...groups].flatMap(([letter, items]) => items.map((it, i) => ({ letter, it, first: i === 0 })));
  const weight = (e: (typeof flat)[number]) => 30 + Math.ceil(e.it.def.length / 52) * 15 + (e.first ? 26 : 0);
  const total = flat.reduce((n, e) => n + weight(e), 0);
  const fitsOneSheet = total <= 820;
  let cut = flat.length;
  if (fitsOneSheet) {
    let acc = 0;
    cut = flat.findIndex((e) => (acc += weight(e)) >= total / 2) + 1;
  }
  const renderCol = (list: typeof flat, lastBorder: boolean) =>
    list.map((e, i) => (
      <div key={e.it.term}>
        {(e.first || i === 0) && <div style={letterHead}>{e.letter}</div>}
        <div style={{ ...entry, borderBottom: i === list.length - 1 && !lastBorder ? 'none' : divider }}>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', display: 'block' }}>{math(e.it.term)}</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 'var(--leading-compact)' }}>{math(e.it.def)}</span>
        </div>
      </div>
    ));
  return (
    <Page toc={toc} badge="Glossary">
      <h1 style={h1}>{title}</h1>
      {fitsOneSheet ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', columnGap: 30.8, alignItems: 'start' }}>
          <div>{renderCol(flat.slice(0, cut), false)}</div>
          <div>{renderCol(flat.slice(cut), false)}</div>
        </div>
      ) : (
        <div style={{ columnCount: 2, columnGap: 30.8 }}>{renderCol(flat, false)}</div>
      )}
    </Page>
  );
}
