import type { ReactNode } from 'react';
import { Page } from '../document/Page';
import type { TocSpec } from '../document/NotesDocument';

export interface NotesPageProps {
  toc?: TocSpec;
  /** PageBadge label */
  badge?: string;
  orientation?: 'portrait' | 'landscape';
  /**
   * Text columns (default 2, the textbook grid): at 11pt a half-width column is ~50 characters, inside the
   * 50–75 character measure textbooks use. Tables, diagrams, worked examples and headings span both columns.
   * Use 1 for pages that arrange their own side-by-side blocks with <Columns>.
   */
  columns?: 1 | 2 | 3;
  /**
   * 'margin' (default): main text column ~55% wide (≈68 characters) with callouts in the right margin via <Aside>;
   * wide blocks (worked examples, tables, Matrix, Split) span the page. 'columns': equal columns for reference-style pages.
   * 'single': one full-width column. Passing `columns` (2/3 → 'columns', 1 → 'single') overrides the default.
   */
  layout?: 'margin' | 'columns' | 'single';
  /**
   * A short topic shares the sheet with the topic before it when it fits in the space left (24pt below it), instead of
   * starting a new sheet. Default true; set false to force a fresh sheet. Topics that don't fit start a new sheet as before.
   */
  join?: boolean;
  /**
   * Dense per-topic lecture notes: TopicHeader, paragraphs, Sections, ConceptCards, WorkedExamples,
   * Callouts, tables, diagrams. Plain <p> children get the notes body style. Use <Columns> for 2-col asides.
   */
  children?: ReactNode;
}

/** A real per-topic notes page — flows onto as many sheets as the content needs. */
export function NotesPage({ toc, badge = 'Notes Page', orientation = 'portrait', columns, layout, join = true, children }: NotesPageProps) {
  return (
    <Page join={join} toc={toc} badge={badge} orientation={orientation} layout={layout ?? (columns == null ? 'margin' : columns > 1 ? 'columns' : 'single')} columns={columns ?? 2} className="notes-flow">
      {children}
    </Page>
  );
}
