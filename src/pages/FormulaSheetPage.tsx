import { Fragment, type CSSProperties } from 'react';
import { Page } from '../document/Page';
import { useDocument } from '../document/context';
import type { TocSpec } from '../document/NotesDocument';
import { Tex } from '../components/math/Tex';
import { ch, type Chapter } from '../components/types';

export interface FormulaSheetSection {
  chapter: Chapter;
  name: string;
  rows: Array<{ concept: string; decomp: string; tex: string }>;
}

export interface FormulaSheetPageProps {
  toc?: TocSpec;
  /** Defaults to "Formula Sheet — {document title}" */
  title?: string;
  sections: FormulaSheetSection[];
}

/** Formulas + variables only: a Concept / Decomposition / Formula table grouped under chapter-colored section bands. */
export function FormulaSheetPage({ toc, title, sections }: FormulaSheetPageProps) {
  const doc = useDocument();
  const h1: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 25.9, margin: '0 0 15.4px', lineHeight: 'var(--leading-tight)' };
  const colHead: CSSProperties = { textAlign: 'left', padding: '5.2px 12.1px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', borderBottom: '2px solid var(--ink-900)' };
  const td1: CSSProperties = { padding: '8.8px 12.1px', fontSize: 'var(--text-sm)', fontWeight: 600, verticalAlign: 'top', width: '20%' };
  const td2: CSSProperties = { padding: '8.8px 12.1px', fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 'var(--leading-compact)', verticalAlign: 'top', width: '34%' };
  const td3: CSSProperties = { padding: '8.8px 12.1px', verticalAlign: 'top' };
  return (
    <Page toc={toc} badge="Formula Sheet">
      <h1 style={h1}>{title ?? `Formula Sheet — ${doc?.meta.title ?? ''}`}</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={{ ...colHead, width: '20%' }}>Concept</th>
          <th style={{ ...colHead, width: '34%' }}>Decomposition</th>
          <th style={colHead}>Formula</th>
        </tr></thead>
        <tbody>
          {sections.map((s, si) => (
            <Fragment key={si}>
              <tr style={{ background: ch(s.chapter, 100), color: ch(s.chapter, 900), fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', breakAfter: 'avoid' }}>
                <td style={{ padding: '5.2px 12.1px' }} colSpan={3}>{s.name}</td>
              </tr>
              {s.rows.map((r, i) => (
                <tr key={i} style={i === s.rows.length - 1 ? undefined : { borderBottom: '1px solid var(--line)' }}>
                  <td style={td1}>{r.concept}</td>
                  <td style={td2}>{r.decomp}</td>
                  <td style={td3}><Tex tex={r.tex} style={{ fontSize: 'var(--text-sm)' }} /></td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </Page>
  );
}
