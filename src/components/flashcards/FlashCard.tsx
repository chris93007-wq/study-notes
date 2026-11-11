import type { CSSProperties, ReactNode } from 'react';
import { math } from '../math/Tex';
import { ch, type Chapter } from '../types';

/**
 * Small top-bordered card for one node of a map: a title with up to three parts (definition, formula in words, the why)
 * and any extra content. The building block of a Topic Map and, more generally, of a ProcessMap (steps, ladders,
 * frameworks). Every part is optional, so a node can be as small as a title and one line.
 */
export interface FlashCardProps {
  /** Position prefix: "1 · Title". Skipped when the title already starts with a number. */
  number?: number | string;
  /** Order badge for a process (a numbered circle before the title) */
  step?: number | string;
  title: string;
  /** Plain-language definition — no jargon, no formula */
  definition?: ReactNode;
  /** The formula spelled out in words, not symbols. Omit if the concept has none. */
  formula?: string;
  /** The underlying logic that makes the formula make sense */
  why?: ReactNode;
  /** Anything else the node needs (a short list, a mini table …), shown after the parts above */
  children?: ReactNode;
  /** Which chapter color (1-13) tints the top border, title, and formula box */
  chapter: Chapter;
}

export function FlashCard({ number, step, title, definition, formula, why, children, chapter }: FlashCardProps) {
  const card: CSSProperties = { border: '1px solid var(--line)', borderTop: `3px solid ${ch(chapter, 500)}`, borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', breakInside: 'avoid', height: '100%' };
  const head: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-2)' };
  const badge: CSSProperties = { width: 22, height: 22, flexShrink: 0, borderRadius: '50%', background: ch(chapter, 500), color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const titleStyle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', color: ch(chapter, 900) };
  const label: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-500)' };
  const body: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-900)', lineHeight: 'var(--leading-compact)' };
  const formulaBox: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: ch(chapter, 900), background: ch(chapter, 100), borderRadius: 'var(--radius-sm)', padding: '6.9px 8.8px', whiteSpace: 'pre-wrap', lineHeight: 'var(--leading-compact)' };
  const section: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2.6 };
  return (
    <div style={card}>
      <div style={head}>
        {step != null && <span style={badge}>{step}</span>}
        <span style={titleStyle}>{number != null && !/^\d/.test(title) ? `${number} · ${title}` : title}</span>
      </div>
      {definition != null && <div style={section}><span style={label}>Definition</span><span style={body}>{math(definition)}</span></div>}
      {formula && <div style={section}><span style={label}>Formula, in words</span><div style={formulaBox}>{formula}</div></div>}
      {why != null && <div style={section}><span style={label}>Why</span><span style={body}>{math(why)}</span></div>}
      {children != null && <div style={body}>{children}</div>}
    </div>
  );
}

/** Grid of FlashCards, one per concept, for an overview page. Cards without a chapter cycle through chapters 1-5. (A ProcessMap does the same with flexing columns and optional arrows.) */
export interface FlashcardGridProps {
  cards: Array<Omit<FlashCardProps, 'chapter'> & { chapter?: Chapter }>;
  columns?: number;
}

export function FlashcardGrid({ cards, columns = 2 }: FlashcardGridProps) {
  const grid: CSSProperties = { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 13.8 };
  return (
    <div style={grid}>
      {cards.map((c, i) => (
        <FlashCard key={i} {...c} number={c.number ?? i + 1} chapter={c.chapter ?? (((i % 5) + 1) as Chapter)} />
      ))}
    </div>
  );
}
