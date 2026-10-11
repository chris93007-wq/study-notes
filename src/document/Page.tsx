import type { CSSProperties, ReactNode } from 'react';
import { PageBadge } from '../components/structure/PageBadge';
import { PageFooter } from '../components/structure/PageFooter';
import type { TocSpec } from './NotesDocument';
import { useDocument, usePageSlot } from './context';

export interface PageProps {
  /** Portrait (default) or landscape US Letter */
  orientation?: 'portrait' | 'landscape';
  /** Show the breadcrumb + page-number footer (default true) */
  footer?: boolean;
  /** PageBadge label (e.g. "Notes Page"). Every content page except the Cover gets one. Omit for none. */
  badge?: string;
  /** Text of the pill in the badge row (e.g. "Lecture 4" or the chapter title). Defaults to the document's week. */
  pill?: string;
  /** List this page on the Contents page */
  toc?: TocSpec;
  /** Text columns for the page body (default 1). 2 = the textbook grid: prose and cards flow in two columns; tables, diagrams, worked examples and headings span both. */
  columns?: 1 | 2 | 3;
  /**
   * Page layout. 'margin': main column (~55%, ≤70 chars/line) with a margin for <Aside> notes; 'columns': equal text columns
   * (`columns`, default 2) for reference pages; 'single': one full-width column. Default: 'columns' when `columns` > 1, else 'single'.
   */
  layout?: 'margin' | 'columns' | 'single';
  /** Let this page continue on the previous sheet when it fits in the space left there (decided at render time). */
  join?: boolean;
  /** Full-bleed page with no margins (Cover only) */
  cover?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * One page template = one or more printed sheets. Content flows onto extra sheets automatically; every
 * template starts on a fresh sheet. Use directly for custom pages, or via the ready-made templates.
 */
export function Page({ orientation = 'portrait', footer = true, badge, pill, toc, columns = 1, layout, join = false, cover = false, className, style, children }: PageProps) {
  const doc = useDocument();
  const slot = usePageSlot();
  const mode = layout ?? (columns > 1 ? 'columns' : 'single');
  const cols = mode === 'columns' ? Math.max(columns, 2) : 1;
  const name = cover ? 'cover' : footer ? (orientation === 'landscape' ? 'landscape' : 'portrait') : `${orientation}-bare`;
  return (
    <section id={slot?.tocEntry ? `toc-${slot.tocEntry.n}` : undefined} className={['page', className].filter(Boolean).join(' ')} data-page={name} data-orientation={orientation} data-cols={cols} data-layout={mode} data-joinable={join || undefined} style={style}>
      {slot?.tocEntry && <span className="toc-marker" aria-hidden="true">TOCMARK-{slot.tocEntry.n}-</span>}
      <div className="page-body">
        {(badge || pill) && <PageBadge label={badge ?? ''} week={pill} chapter={pill && toc ? toc.chapter : undefined} />}
        {children}
      </div>
      {footer && !cover && (
        <div className="screen-only screen-footer">
          <PageFooter chapterLabel={doc?.meta.footerLabel ?? doc?.meta.title} page={slot?.index ?? 1} totalPages="…" />
        </div>
      )}
    </section>
  );
}
