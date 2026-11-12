import type { CSSProperties, ReactNode } from 'react';
import { math } from '../math/Tex';
import { ch, type Chapter } from '../types';

/** One objective: a sentence, or { text, extension: true } for an item beyond the exam scope (it gets an EXT chip). */
export type Objective = ReactNode | { text: ReactNode; extension?: boolean };

export interface ObjectivesProps {
  /** Which chapter color (1-13) tints the panel — the topic's color, or the brand color on an overview page */
  chapter: Chapter;
  /** Panel label (default "What you must be able to do") */
  title?: string;
  /** The objectives, as can-do sentences ("Calculate the WTP implied by a part-worth"). From the content tree's node questions. */
  items: Objective[];
  /** Span the full page width (default). false keeps it in the main column. */
  wide?: boolean;
}

/**
 * Learning-objectives panel for the start of a packet or a topic, like a textbook chapter opener: a tinted panel of
 * can-do sentences in up to two columns. Write each item as what the reader can do afterwards, not a topic label —
 * the content tree's node questions, rephrased. Items marked `extension` carry an EXT chip (beyond the exam scope).
 */
export function Objectives({ chapter, title = 'What you must be able to do', items, wide = true }: ObjectivesProps) {
  const panel: CSSProperties = { columnSpan: wide ? 'all' : undefined, border: `1px solid ${ch(chapter, 300)}`, borderRadius: 'var(--radius-md)', background: ch(chapter, 50), padding: 'var(--space-4) var(--space-5)', breakInside: 'avoid', fontFamily: 'var(--font-body)' };
  const head: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' };
  const dash: CSSProperties = { width: 12, height: 2, background: ch(chapter, 500), borderRadius: 1, flexShrink: 0 };
  const label: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase', color: ch(chapter, 900) };
  const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-2) var(--space-6)', margin: 0, padding: 0, listStyle: 'none' };
  const li: CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-compact)', color: 'var(--ink-900)' };
  const sq: CSSProperties = { width: 6, height: 6, borderRadius: 2, background: ch(chapter, 500), flexShrink: 0, marginTop: 6 };
  const ext: CSSProperties = { display: 'inline-block', marginLeft: 'var(--space-2)', padding: '0 5px', border: '1px solid var(--red-700)', borderRadius: 'var(--radius-pill)', color: 'var(--red-700)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.04em', verticalAlign: '1px' };
  return (
    <div data-objectives data-wide={wide || undefined} style={panel}>
      <div style={head}><span style={dash} /><span style={label}>{title}</span></div>
      <ul style={grid}>
        {items.map((raw, i) => {
          const it = raw != null && typeof raw === 'object' && 'text' in (raw as object) ? (raw as { text: ReactNode; extension?: boolean }) : { text: raw as ReactNode };
          return (
            <li key={i} style={li}>
              <span style={sq} />
              <span>{typeof it.text === 'string' ? math(it.text) : it.text}{it.extension && <span style={ext}>EXT</span>}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
