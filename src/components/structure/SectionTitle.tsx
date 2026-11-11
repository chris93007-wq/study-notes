import type { CSSProperties, ReactNode } from 'react';
import { ch, type Chapter } from '../types';

/** Slim inline section divider — a short dash, an all-caps label, and a rule filling the remaining width, all in the chapter color. */
export interface SectionTitleProps {
  /** Which chapter color (1-13) tints the dash, label, and rule */
  chapter: Chapter;
  children?: ReactNode;
}

export function SectionTitle({ chapter, children }: SectionTitleProps) {
  const color = ch(chapter, 500);
  const wrap: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', breakAfter: 'avoid' };
  const dash: CSSProperties = { width: 14, height: 2, background: color, flexShrink: 0 };
  const label: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase', color, whiteSpace: 'nowrap' };
  const line: CSSProperties = { flex: 1, height: 1, background: color };
  return (
    <div data-section-title style={wrap}>
      <span style={dash} />
      <span style={label}>{children}</span>
      <span style={line} />
    </div>
  );
}
