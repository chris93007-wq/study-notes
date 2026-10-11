import type { CSSProperties } from 'react';
import { ch, type Chapter } from '../types';

/** Big chapter/overview title band — week badge (chapter-colored) and mono chapter label on one row, display-font title, optional subtitle, optional numbered topic list. */
export interface ChapterHeaderProps {
  /** Week/session badge text (e.g. "Week 3"), shown as a pastel pill tinted by chapterNumber */
  week?: string;
  /** Which chapter color (1-13) tints the week badge and (cycling) the topic-list numbers */
  chapterNumber: Chapter;
  /** Mono label beside the badge, e.g. "Overview" */
  chapter?: string;
  /** Extra mono text after the chapter label */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Renders a numbered list of every topic covered */
  topics?: string[];
  /** Less vertical padding, for pages that must fit a lot (e.g. a one-sheet Topic Map) */
  compact?: boolean;
}

export function ChapterHeader({ week, chapterNumber, chapter = 'Chapter 1', eyebrow, title, subtitle, topics = [], compact = false }: ChapterHeaderProps) {
  const wrap: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: compact ? 'var(--space-2) 0 var(--space-4)' : 'var(--space-7) 0 var(--space-6)', breakInside: 'avoid' };
  const badge: CSSProperties = { background: ch(chapterNumber, 100), color: ch(chapterNumber, 900), fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.08em', padding: '4.4px 12.1px', borderRadius: 'var(--radius-pill)', width: 'fit-content', textTransform: 'uppercase' };
  const mono: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)', letterSpacing: '0.04em' };
  const h1: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-3xl)', color: 'var(--ink-900)', lineHeight: 'var(--leading-tight)', margin: 0 };
  const sub: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--ink-700)', margin: 0 };
  const topicList: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' };
  const topicRow: CSSProperties = { display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--ink-900)' };
  const topicNum: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', minWidth: 22 };
  return (
    <div data-wide style={wrap}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10.3 }}>
        {week && <span style={badge}>{week}</span>}
        <span style={mono}>{chapter}</span>
        {eyebrow && <span style={mono}>{eyebrow}</span>}
      </div>
      <h1 style={h1}>{title}</h1>
      {subtitle && <p style={sub}>{subtitle}</p>}
      {topics.length > 0 && (
        <div style={topicList}>
          {topics.map((t, i) => (
            <div key={i} style={topicRow}>
              <span style={{ ...topicNum, color: ch(((chapterNumber - 1 + i) % 13) + 1, 500) }}>{String(i + 1).padStart(2, '0')}</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
