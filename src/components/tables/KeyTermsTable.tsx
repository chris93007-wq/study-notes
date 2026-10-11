import type { CSSProperties, ReactNode } from 'react';
import { math } from '../math/Tex';
import { ch, type Chapter } from '../types';

/** Glossary recap table (Term / Simple Explanation / Why It Matters / Example) for a topic's key terms. The Example column is dropped when no row has one. */
export interface KeyTermsTableProps {
  terms: Array<{ term: ReactNode; explanation: ReactNode; why: ReactNode; example?: ReactNode }>;
  /** Which chapter color (1-13) tints the header row and alternate rows */
  chapter: Chapter;
}

export function KeyTermsTable({ terms, chapter }: KeyTermsTableProps) {
  const wrap: CSSProperties = { columnSpan: 'all', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden', fontFamily: 'var(--font-body)' };
  const table: CSSProperties = { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' };
  const th: CSSProperties = { textAlign: 'left', padding: 'var(--space-3) var(--space-4)', background: ch(chapter, 100), color: ch(chapter, 900), fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, borderRight: '1px solid var(--border-default)', verticalAlign: 'bottom' };
  const td: CSSProperties = { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-compact)', color: 'var(--ink-900)', borderTop: '1px solid var(--border-default)', borderRight: '1px solid var(--border-default)', verticalAlign: 'top', overflowWrap: 'break-word' };
  const trAlt: CSSProperties = { background: `color-mix(in srgb, ${ch(chapter, 100)} 45%, var(--surface-card))` };
  const hasExamples = terms.some((t) => t.example);
  return (
    <div data-wide style={wrap}>
      <table style={table}>
        <thead><tr>
          <th style={{ ...th, width: '20%' }}>Term</th>
          <th style={{ ...th, width: hasExamples ? '24%' : '32%' }}>Simple Explanation</th>
          <th style={{ ...th, width: hasExamples ? '32%' : '48%' }}>Why It Matters</th>
          {hasExamples && <th style={{ ...th, width: '24%' }}>Example / Analogy</th>}
        </tr></thead>
        <tbody>
          {terms.map((t, i) => (
            <tr key={i} style={i % 2 ? trAlt : undefined}>
              <td style={{ ...td, fontWeight: 700 }}>{t.term}</td>
              <td style={td}>{math(t.explanation)}</td>
              <td style={td}>{math(t.why)}</td>
              {hasExamples && <td style={td}>{t.example}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
