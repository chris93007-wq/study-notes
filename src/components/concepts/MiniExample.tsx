import type { CSSProperties, ReactNode } from 'react';
import { math } from '../math/Tex';
import { ch, type Chapter } from '../types';

/**
 * A small run-in worked example, the way a textbook's calculation chapters teach: a bold one-line heading
 * ("To find the Mr of CuSO4·5H2O") and a few lines of working under a thin chapter-colored rule — no card, no badge.
 * Use several of these in a row to teach a method step by step, and keep the one exam-style walkthrough in a
 * WorkedExample card. Sits in the main column; lines take $$…$$ math.
 */
export interface MiniExampleProps {
  /** One line naming what is being worked out, e.g. "Finding the number of moles in 54 g of water" */
  title: ReactNode;
  /** The working, one line each (strings may contain $$…$$ math) */
  lines: ReactNode[];
  /** Optional one-line remark after the working (a check, a unit note) — set in muted italic */
  note?: ReactNode;
  /** Which chapter color (1-13) tints the rule */
  chapter: Chapter;
}

export function MiniExample({ title, lines, note, chapter }: MiniExampleProps) {
  const wrap: CSSProperties = { breakInside: 'avoid', fontFamily: 'var(--font-body)' };
  const head: CSSProperties = { fontWeight: 600, fontSize: 'var(--text-base)', lineHeight: 'var(--leading-tight)', color: 'var(--ink-900)', margin: 0 };
  const body: CSSProperties = { marginTop: 'var(--space-2)', paddingLeft: 'var(--space-4)', borderLeft: `2px solid ${ch(chapter, 300)}`, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' };
  const line: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-compact)', color: 'var(--ink-900)', overflowWrap: 'anywhere' };
  const noteStyle: CSSProperties = { fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--ink-500)', lineHeight: 'var(--leading-compact)' };
  return (
    <div data-mini style={wrap}>
      <p style={head}>{typeof title === 'string' ? math(title) : title}</p>
      <div style={body}>
        {lines.map((l, i) => <div key={i} style={line}>{typeof l === 'string' ? math(l) : l}</div>)}
        {note && <div style={noteStyle}>{typeof note === 'string' ? math(note) : note}</div>}
      </div>
    </div>
  );
}
