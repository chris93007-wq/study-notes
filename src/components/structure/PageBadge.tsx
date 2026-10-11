import type { CSSProperties } from 'react';
import { useDocument } from '../../document/context';
import { ch, type Chapter } from '../types';

/**
 * Top-of-page identity badge on every content page except the Cover — a week/session pill plus a mono
 * page-type label (e.g. "WEEK 3" + "APPENDIX"). Always the document's brand chapter color.
 * Inside a NotesDocument, `week` and `chapter` default to the document meta.
 */
export interface PageBadgeProps {
  /** Mono uppercase page-type label (e.g. "Contents", "Appendix", "Cheat Sheet") */
  label: string;
  /** Week/session pill text */
  week?: string;
  /** Chapter color (1-13) — use the document's brand chapter, not the per-section topic color */
  chapter?: Chapter;
}

export function PageBadge({ label, week, chapter }: PageBadgeProps) {
  const doc = useDocument();
  const wk = week ?? doc?.meta.week;
  const c = chapter ?? doc?.meta.brandChapter ?? 1;
  const row: CSSProperties = { columnSpan: 'all', display: 'flex', alignItems: 'center', gap: 10.3, marginBottom: 'var(--space-2)' };
  const pill: CSSProperties = { background: ch(c, 100), color: ch(c, 900), fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.08em', padding: '4.4px 12.1px', borderRadius: 'var(--radius-pill)', textTransform: 'uppercase', flexShrink: 0 };
  const mono: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)', letterSpacing: '0.04em', textTransform: 'uppercase' };
  return (
    <div data-wide style={row}>
      {wk && <span style={pill}>{wk}</span>}
      <span style={mono}>{label}</span>
    </div>
  );
}
