import type { CSSProperties, ReactNode } from 'react';
import { Page } from '../document/Page';
import type { TocSpec } from '../document/NotesDocument';
import { TopicHeader } from '../components/structure/TopicHeader';
import { ch, type Chapter } from '../components/types';

export interface QuizPageProps {
  toc?: TocSpec;
  /** Practice Questions is a chapter of its own — one chapter color for every question number */
  chapter: Chapter;
  /** Chapter title shown at the top (default "Practice Questions") */
  title?: string;
  /** One-line kicker under the title */
  kicker?: string;
  /** Optional topic number shown before the title, like the other topic pages */
  topicNumber?: number;
  questions: Array<{ q: ReactNode; a: ReactNode }>;
}

/**
 * Practice questions with the answer printed right under each one in a light-green strip — nothing hidden
 * or collapsed, so the page is fully printable. Opens with the chapter title; no PageBadge and no footer.
 */
export function QuizPage({ toc, chapter, title = 'Practice Questions', kicker, topicNumber, questions }: QuizPageProps) {
  const q: CSSProperties = { fontSize: 'var(--text-base)', lineHeight: 'var(--leading-body)', color: 'var(--ink-900)', margin: '3.3px 0 var(--space-3)' };
  const qNum: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: ch(chapter, 500), fontWeight: 700, marginRight: 6.9 };
  const strip: CSSProperties = { background: 'var(--light-green-200)', borderRadius: 'var(--radius-sm)', padding: '6.9px 10.3px', display: 'flex', gap: 6.9, alignItems: 'baseline' };
  const aLabel: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-900)', flexShrink: 0 };
  const aText: CSSProperties = { fontSize: 'var(--text-sm)', color: 'var(--ink-900)', lineHeight: 'var(--leading-compact)' };
  return (
    <Page toc={toc} footer={false} layout="columns" columns={2}>
      <TopicHeader topicNumber={topicNumber} title={title} kicker={kicker} />
      <div style={{ height: 17, columnSpan: 'all' }} />
      {questions.map((it, i) => (
        <div key={i} style={{ marginBottom: 'var(--para-gap)', breakInside: 'avoid' }}>
          <p style={q}><span style={qNum}>Q{i + 1}</span>{it.q}</p>
          <div style={strip}><span style={aLabel}>A{i + 1}.</span><span style={aText}>{it.a}</span></div>
        </div>
      ))}
    </Page>
  );
}
