import type { CSSProperties, ReactNode } from 'react';
import { ch, type Chapter } from '../types';

/** Horizontal numbered step flow (e.g. MaxDiff → Conversion → TURF) connected by arrow glyphs; number and title share one line. Wraps on narrow widths. */
export interface StepPipelineProps {
  steps: Array<{ label: string; body?: string }>;
  /** Which chapter color (1-13) fills the number badges, matching the surrounding section */
  chapter: Chapter;
}

export function StepPipeline({ steps, chapter }: StepPipelineProps) {
  const wrap: CSSProperties = { columnSpan: 'all', display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 'var(--space-3)', breakInside: 'avoid' };
  const stepBox: CSSProperties = { flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', background: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' };
  const headRow: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-2)' };
  const num: CSSProperties = { width: 31, height: 31, flexShrink: 0, borderRadius: '50%', background: ch(chapter, 500), color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const label: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--ink-900)', lineHeight: 1.3 };
  const body: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 'var(--leading-body)' };
  const arrow: CSSProperties = { display: 'flex', alignItems: 'center', fontSize: 'var(--text-xl)', color: 'var(--ink-300)', padding: '0 1.8px' };
  const nodes: ReactNode[] = [];
  steps.forEach((s, i) => {
    nodes.push(
      <div key={`s${i}`} style={stepBox}>
        <div style={headRow}><span style={num}>{i + 1}</span><span style={label}>{s.label}</span></div>
        {s.body && <span style={body}>{s.body}</span>}
      </div>,
    );
    if (i < steps.length - 1) nodes.push(<div key={`a${i}`} style={arrow}>→</div>);
  });
  return <div style={wrap}>{nodes}</div>;
}
