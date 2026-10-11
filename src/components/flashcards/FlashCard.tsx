import type { CSSProperties } from 'react';
import { ch, type Chapter } from '../types';

/** Small top-bordered mini explainer for one concept — definition, optional formula in words, and the why. A compact preview before the full ConceptCard treatment. */
export interface FlashCardProps {
  number?: number;
  title: string;
  /** Plain-language definition — no jargon, no formula */
  definition: string;
  /** The formula spelled out in words, not symbols. Omit if the concept has none. */
  formula?: string;
  /** The underlying logic that makes the formula make sense */
  why: string;
  /** Which chapter color (1-13) tints the top border, title, and formula box */
  chapter: Chapter;
}

export function FlashCard({ number, title, definition, formula, why, chapter }: FlashCardProps) {
  const card: CSSProperties = { border: '1px solid var(--line)', borderTop: `3px solid ${ch(chapter, 500)}`, borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', breakInside: 'avoid' };
  const titleStyle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', color: ch(chapter, 900) };
  const label: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-500)' };
  const body: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-900)', lineHeight: 'var(--leading-compact)' };
  const formulaBox: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: ch(chapter, 900), background: ch(chapter, 100), borderRadius: 'var(--radius-sm)', padding: '6.9px 8.8px', whiteSpace: 'pre-wrap', lineHeight: 'var(--leading-compact)' };
  const section: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2.6 };
  return (
    <div style={card}>
      <span style={titleStyle}>{number != null ? `${String(number).padStart(2, '0')} · ${title}` : title}</span>
      <div style={section}><span style={label}>Definition</span><span style={body}>{definition}</span></div>
      {formula && <div style={section}><span style={label}>Formula, in words</span><div style={formulaBox}>{formula}</div></div>}
      <div style={section}><span style={label}>Why</span><span style={body}>{why}</span></div>
    </div>
  );
}

/** Grid of FlashCards, one per concept, for an overview page. Cards without a chapter cycle through chapters 1-5. */
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
