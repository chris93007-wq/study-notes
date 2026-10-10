import type { CSSProperties, ReactNode } from 'react';
import { ch, type Chapter } from '../types';

/** Two-sided comparison with a center divider — for contrasting a pair of concepts (e.g. Stated vs Revealed Preference). Each side has its own centered title, chapter color, and dotted bullet list. */
export interface SplitSide {
  title: string;
  items?: ReactNode[];
  /** Which chapter color (1-13) tints this side's title and bullet dots */
  chapter: Chapter;
}
export interface SplitProps {
  left: SplitSide;
  right: SplitSide;
}

function Side({ side }: { side: SplitSide }) {
  const col: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' };
  const head: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: ch(side.chapter, 900), margin: 0, textAlign: 'center' };
  const list: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', margin: 0, padding: 0, listStyle: 'none' };
  const item: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-body)', color: 'var(--ink-900)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' };
  const dot: CSSProperties = { width: 6, height: 6, borderRadius: '50%', background: ch(side.chapter, 500), flexShrink: 0, marginTop: 7.5 };
  return (
    <div style={col}>
      <h4 style={head}>{side.title}</h4>
      <ul style={list}>{(side.items || []).map((t, i) => <li key={i} style={item}><span style={dot} /><span>{t}</span></li>)}</ul>
    </div>
  );
}

export function Split({ left, right }: SplitProps) {
  const wrap: CSSProperties = { columnSpan: 'all', display: 'grid', gridTemplateColumns: '1fr 2px 1fr', gap: 'var(--space-6)', alignItems: 'start', breakInside: 'avoid' };
  return (
    <div style={wrap}>
      <Side side={left} />
      <div style={{ background: 'var(--line)', alignSelf: 'stretch' }} />
      <Side side={right} />
    </div>
  );
}
