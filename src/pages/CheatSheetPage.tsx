import type { CSSProperties } from 'react';
import { Page } from '../document/Page';
import type { TocSpec } from '../document/NotesDocument';
import { ch, type Chapter } from '../components/types';

export interface CheatSheetColumn {
  chapter: Chapter;
  title: string;
  bullets: string[];
  /** Formula in words (monospace box); "\n" for line breaks */
  formula?: string;
}

export interface CheatSheetPageProps {
  toc?: TocSpec;
  columns: CheatSheetColumn[];
  /** Portrait by default; landscape gives 3 wider columns per row. */
  orientation?: 'portrait' | 'landscape';
  /** Topic columns per row, 1–3 (default 3, or fewer when there are fewer topics). Never more than 3. */
  perRow?: 1 | 2 | 3;
}

/**
 * Recap of every topic — one chapter-topped column per topic, at most 3 across, with a vertical rule between
 * columns. Type never drops below 9pt; a long cheat sheet simply continues onto a second sheet (rows never split).
 */
export function CheatSheetPage({ toc, columns, orientation = 'portrait', perRow }: CheatSheetPageProps) {
  const per = Math.min(perRow ?? 3, 3, columns.length) as 1 | 2 | 3;
  const rows: CheatSheetColumn[][] = [];
  for (let i = 0; i < columns.length; i += per) rows.push(columns.slice(i, i + per));

  const bullet: CSSProperties = { fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-compact)', color: 'var(--ink-900)', margin: 0, paddingLeft: 14, position: 'relative' };
  return (
    <Page toc={toc} badge="Cheat Sheet" orientation={orientation}>
      {rows.map((row, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${per}, minmax(0, 1fr))`, breakInside: 'avoid', marginBottom: 'var(--space-5)' }}>
          {Array.from({ length: per }, (_, i) => row[i]).map((c, i) => (
            <div key={i} style={{ padding: i === 0 ? '0 var(--space-4) 0 0' : i === per - 1 ? '0 0 0 var(--space-4)' : '0 var(--space-4)', borderLeft: i > 0 ? '1px solid var(--line)' : undefined, minWidth: 0 }}>
              {c && (
                <div style={{ borderTop: `4px solid ${ch(c.chapter, 500)}`, paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', lineHeight: 'var(--leading-tight)', color: ch(c.chapter, 900), margin: 0 }}>{c.title}</h3>
                  {c.bullets.map((t, j) => (
                    <p key={j} style={bullet}><span style={{ position: 'absolute', left: 0, color: ch(c.chapter, 500) }}>•</span>{t}</p>
                  ))}
                  {c.formula && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: ch(c.chapter, 900), background: ch(c.chapter, 100), borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', lineHeight: 'var(--leading-compact)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{c.formula}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </Page>
  );
}
