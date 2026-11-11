import type { CSSProperties, ReactNode } from 'react';
import { ch, type Chapter } from '../types';

/** Compact inline sequence or equivalence chain — pill boxes linked by a connector glyph (e.g. "MaxDiff → Binary data → TURF"). Lighter than StepPipeline: no numbers, no body copy. */
export interface ChainProps {
  items: string[];
  /** Which chapter color (1-13) tints the pills */
  chapter: Chapter;
  /** Glyph drawn between items */
  connector?: '→' | '=' | '+' | '⇒';
}

export function Chain({ items, chapter, connector = '→' }: ChainProps) {
  const wrap: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)', fontFamily: 'var(--font-body)', breakInside: 'avoid' };
  const box: CSSProperties = { padding: '6.9px 15.4px', borderRadius: 'var(--radius-pill)', border: `1.5px solid ${ch(chapter, 500)}`, background: ch(chapter, 100), color: ch(chapter, 900), fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' };
  const glyph: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--ink-300)', fontWeight: 600 };
  const nodes: ReactNode[] = [];
  items.forEach((it, i) => {
    nodes.push(<span key={`b${i}`} style={box}>{it}</span>);
    if (i < items.length - 1) nodes.push(<span key={`c${i}`} style={glyph}>{connector}</span>);
  });
  return <div data-chain style={wrap}>{nodes}</div>;
}
