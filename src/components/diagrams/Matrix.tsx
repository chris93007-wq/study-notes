import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { ch, type Chapter } from '../types';

/** Row × column grid for 2D frameworks (e.g. method vs. use-case fit) — tinted row/column headers in one chapter color, plain cells. */
export interface MatrixProps {
  rowLabels: string[];
  colLabels: string[];
  /** 2D array, cells[row][col] */
  cells: ReactNode[][];
  /** Which chapter color (1-13) tints the headers */
  chapter: Chapter;
}

export function Matrix({ rowLabels, colLabels, cells, chapter }: MatrixProps) {
  const wrap: CSSProperties = { columnSpan: 'all', display: 'grid', width: 'fit-content', maxWidth: '100%', gridTemplateColumns: `140px repeat(${colLabels.length}, 1fr)`, border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden', fontFamily: 'var(--font-body)', breakInside: 'avoid' };
  const corner: CSSProperties = { background: 'var(--paper-100)', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' };
  const head: CSSProperties = { background: ch(chapter, 100), color: ch(chapter, 900), fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.04em', textTransform: 'uppercase', padding: 'var(--space-3)', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' };
  const cell: CSSProperties = { padding: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--ink-900)', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)', textAlign: 'center' };
  return (
    <div data-wide style={wrap}>
      <div style={corner} />
      {colLabels.map((c, i) => <div key={`c${i}`} style={{ ...head, textAlign: 'center' }}>{c}</div>)}
      {rowLabels.map((r, ri) => (
        <Fragment key={`r${ri}`}>
          <div style={head}>{r}</div>
          {colLabels.map((_, ci) => <div key={`cell${ri}-${ci}`} style={cell}>{(cells[ri] || [])[ci]}</div>)}
        </Fragment>
      ))}
    </div>
  );
}
