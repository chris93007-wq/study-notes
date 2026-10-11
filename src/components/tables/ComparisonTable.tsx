import type { CSSProperties, ReactNode } from 'react';
import { ch, type Chapter } from '../types';

/** Generic data table (bundle comparisons, design-choice grids, solution tables): chapter-tinted header row, alternate rows in a lighter tint of the same color, visible column lines. */
export interface ComparisonTableProps {
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' | 'center'; width?: string }>;
  rows: Array<Record<string, ReactNode>>;
  /** Which chapter color (1-13) tints the header row and alternate rows */
  chapter: Chapter;
  /** Tighter row padding, to fit long tables (e.g. a ranked appendix) on one sheet */
  dense?: boolean;
}

export function ComparisonTable({ columns, rows, chapter, dense = false }: ComparisonTableProps) {
  const wrap: CSSProperties = { columnSpan: 'all', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden', fontFamily: 'var(--font-body)' };
  const table: CSSProperties = { width: '100%', borderCollapse: 'collapse' };
  const th: CSSProperties = { textAlign: 'left', padding: 'var(--space-3) var(--space-4)', background: ch(chapter, 100), color: ch(chapter, 900), fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, borderRight: '1px solid var(--border-default)' };
  const td: CSSProperties = { padding: dense ? 'var(--space-1) var(--space-4)' : 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-body)', color: 'var(--ink-900)', borderTop: '1px solid var(--border-default)', borderRight: '1px solid var(--border-default)' };
  const trAlt: CSSProperties = { background: `color-mix(in srgb, ${ch(chapter, 100)} 45%, var(--surface-card))` };
  return (
    <div data-wide style={wrap}>
      <table style={table}>
        <thead><tr>{columns.map((c, i) => <th key={i} style={{ ...th, textAlign: c.align ?? 'left', width: c.width }}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={i % 2 ? trAlt : undefined}>
              {columns.map((c, j) => <td key={j} style={{ ...td, textAlign: c.align ?? 'left' }}>{r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
