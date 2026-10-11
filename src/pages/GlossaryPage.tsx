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
  const entry: CSSProperties = { breakInside: 'avoid', padding: '6.1px 0', borderBottom: '1px solid var(--line)' };
  return (
    <Page toc={toc} badge="Glossary">
      <h1 style={h1}>{title}</h1>
      <div style={{ columnCount: 2, columnGap: 30.8 }}>
        {[...groups].map(([letter, items]) => (
          <div key={letter}>
            <div style={letterHead}>{letter}</div>
            {items.map((it, i) => (
              <div key={i} style={entry}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', display: 'block' }}>{math(it.term)}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 'var(--leading-compact)' }}>{math(it.def)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Page>
  );
}
