import type { CSSProperties, ReactNode } from 'react';
import { SectionTitle } from './SectionTitle';
import type { Chapter } from '../types';

/** A labeled content block: a chapter-tinted SectionTitle followed by its body content, spaced consistently. */
export interface SectionProps {
  /** Which chapter color (1-13) tints the section title */
  chapter: Chapter;
  /** The section's label (e.g. "Introduction", "Worked Example") */
  title: string;
  /** In the margin layout, span the full page width (use for sections holding worked examples, tables, diagrams) */
  wide?: boolean;
  children?: ReactNode;
}

export function Section({ chapter, title, wide, children }: SectionProps) {
  const wrap: CSSProperties = { margin: 'var(--space-4) 0' };
  const content: CSSProperties = { marginTop: 'var(--space-3)' };
  return (
    <div data-wide={wide || undefined} style={wrap}>
      <SectionTitle chapter={chapter}>{title}</SectionTitle>
      <div className="stack-3" style={content}>{children}</div>
    </div>
  );
}
