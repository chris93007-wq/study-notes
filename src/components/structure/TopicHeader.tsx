import type { CSSProperties } from 'react';

/** Numbered topic heading that divides a chapter into its sub-topics, with an optional one-line kicker. */
export interface TopicHeaderProps {
  topicNumber?: number;
  title: string;
  kicker?: string;
}

export function TopicHeader({ topicNumber, title, kicker }: TopicHeaderProps) {
  const wrap: CSSProperties = { columnSpan: 'all', display: 'flex', flexDirection: 'column', gap: '3.3px', padding: '5.3px 0 var(--space-4)', breakAfter: 'avoid', breakInside: 'avoid' };
  const h2: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--ink-900)', margin: 0, display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', lineHeight: 'var(--leading-tight)' };
  const kick: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)' };
  return (
    <div data-wide style={wrap}>
      <h2 style={h2}>{topicNumber != null && <span style={{ color: 'var(--ink-300)' }}>{String(topicNumber).padStart(2, '0')}</span>}{title}</h2>
      {kicker && <span style={kick}>{kicker}</span>}
    </div>
  );
}
