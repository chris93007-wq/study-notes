import type { CSSProperties, ReactNode } from 'react';
import { math } from '../components/math/Tex';
import { Page } from '../document/Page';
import type { TocSpec } from '../document/NotesDocument';
import { TopicHeader } from '../components/structure/TopicHeader';
import { ch, type Chapter } from '../components/types';

/** A sub-question of a multi-part question: its own prompt, answer and optional marks. */
export interface QuizPart {
  q: ReactNode;
  a: ReactNode;
  marks?: number;
}

export interface QuizQuestion {
  q: ReactNode;
  /** The answer. Leave out when the question is all `parts`. */
  a?: ReactNode;
  /** Sub-questions a, b, c …, each answered on its own strip (exam-style multi-part) */
  parts?: QuizPart[];
  /** Skill exercised, like a textbook's tags: "analysis", "interpretation", "problem solving", "reasoning", "critical thinking" */
  skill?: string;
  /** Difficulty 1 (recall) to 5 (hardest transfer), drawn as filled pips. Order the questions easy -> hard. */
  level?: 1 | 2 | 3 | 4 | 5;
  /** Marks for the whole question (or give per-part marks) */
  marks?: number;
  /** Word bank for a fill-in-the-blank question (write blanks as ____ in `q`); answers still go in `a` */
  bank?: string[];
}

export interface QuizPageProps {
  toc?: TocSpec;
  /** Practice Questions is a chapter of its own - one chapter color for every question number */
  chapter: Chapter;
  /** Chapter title shown at the top (default "Practice Questions") */
  title?: string;
  /** One-line kicker under the title */
  kicker?: string;
  /** Optional topic number shown before the title, like the other topic pages */
  topicNumber?: number;
  questions: QuizQuestion[];
}

/**
 * Practice questions with the answer printed right under each one in a light-green strip - nothing hidden
 * or collapsed, so the page is fully printable. Questions may carry a skill tag, difficulty pips (1-5) and marks,
 * have sub-parts a/b/c with their own answers, or offer a word bank for fill-in-the-blank recall. Order questions
 * easy -> hard. Opens with the chapter title; no PageBadge and no footer.
 */
export function QuizPage({ toc, chapter, title = 'Practice Questions', kicker, topicNumber, questions }: QuizPageProps) {
  const q: CSSProperties = { fontSize: 'var(--text-base)', lineHeight: 'var(--leading-body)', color: 'var(--ink-900)', margin: '3.3px 0 var(--space-3)' };
  const qNum: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: ch(chapter, 500), fontWeight: 700, marginRight: 6.9 };
  const strip: CSSProperties = { background: 'var(--light-green-200)', borderRadius: 'var(--radius-sm)', padding: '6.9px 10.3px', display: 'flex', gap: 6.9, alignItems: 'baseline' };
  const aLabel: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-900)', flexShrink: 0 };
  const aText: CSSProperties = { fontSize: 'var(--text-sm)', color: 'var(--ink-900)', lineHeight: 'var(--leading-compact)' };
  const meta: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' };
  const skillChip: CSSProperties = { background: ch(chapter, 100), color: ch(chapter, 900), fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '1px 8px', borderRadius: 'var(--radius-pill)' };
  const marksStyle: CSSProperties = { marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' };
  const partQ: CSSProperties = { ...q, margin: '0 0 var(--space-2)' };
  const partLetter: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: ch(chapter, 700), marginRight: 5 };
  const bankWrap: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', margin: '0 0 var(--space-3)' };
  const bankWord: CSSProperties = { border: `1px solid ${ch(chapter, 300)}`, background: ch(chapter, 50), color: 'var(--ink-900)', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'var(--text-xs)', padding: '1px 8px', borderRadius: 'var(--radius-pill)' };

  const pips = (level: number) => (
    <span aria-label={`difficulty ${level} of 5`} style={{ display: 'inline-flex', gap: 2.5, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((p) => <span key={p} style={{ width: 5, height: 5, borderRadius: '50%', background: p <= level ? ch(chapter, 500) : ch(chapter, 200) }} />)}
    </span>
  );
  const answer = (label: string, a: ReactNode, marks?: number) => (
    <div style={strip}>
      <span style={aLabel}>{label}</span>
      <span style={aText}>{math(a)}{marks != null && <span style={{ color: 'var(--ink-500)' }}> ({marks})</span>}</span>
    </div>
  );

  return (
    <Page toc={toc} footer={false} layout="columns" columns={2}>
      <TopicHeader topicNumber={topicNumber} title={title} kicker={kicker} />
      <div style={{ height: 17, columnSpan: 'all' }} />
      {questions.map((it, i) => (
        <div key={i} style={{ marginBottom: 'var(--para-gap)', breakInside: 'avoid' }}>
          {(it.skill || it.level || it.marks != null) && (
            <div style={meta}>
              {it.skill && <span style={skillChip}>{it.skill}</span>}
              {it.level && pips(it.level)}
              {it.marks != null && <span style={marksStyle}>({it.marks} mark{it.marks === 1 ? '' : 's'})</span>}
            </div>
          )}
          <p style={q}><span style={qNum}>Q{i + 1}</span>{math(it.q)}</p>
          {it.bank && <div style={bankWrap}>{it.bank.map((w, k) => <span key={k} style={bankWord}>{w}</span>)}</div>}
          {it.parts ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingLeft: 'var(--space-4)' }}>
              {it.parts.map((p, k) => {
                const letter = String.fromCharCode(97 + k);
                return (
                  <div key={k}>
                    <p style={partQ}><span style={partLetter}>{letter}</span>{math(p.q)}</p>
                    {answer(`A${i + 1}${letter}.`, p.a, p.marks)}
                  </div>
                );
              })}
            </div>
          ) : (
            it.a != null && answer(`A${i + 1}.`, it.a)
          )}
        </div>
      ))}
    </Page>
  );
}
