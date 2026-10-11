import { Children, isValidElement, useEffect, useMemo, type ReactElement, type ReactNode } from 'react';
import type { Chapter } from '../components/types';
import { allSettled } from './pending';
import { finalizeFits, fitNotePages, hideKickers, packPages, predictedSheets, sourcesToFooter } from './joinPages';
import { DocumentContext, PageSlotContext, type DocumentMeta, type PageSlotValue, type TocEntry } from './context';

declare global {
  interface Window {
    /** Injected by scripts/pdf.ts on the second pass: Contents entry number → printed page number. */
    __TOC_PAGES__?: Record<number, number>;
    /** Set once fonts are loaded and the document has rendered; scripts/pdf.ts waits for it. */
    __NOTES_READY__?: boolean;
    /** What the whitespace fitter changed (read by scripts/pdf.ts). */
    __FIT_LOG__?: string[];
    /** Extra safety margin (px) per document page index, raised by scripts/pdf.ts when the print needs more sheets than predicted. */
    __FIT_BIAS__?: number[];
    /** Predicted sheets per Contents entry (read by scripts/pdf.ts). */
    __FIT_PRED__?: Record<number, { index: number; sheets: number }>;
  }
}

/** Any page template accepts `toc` to be listed on the Contents page. */
export interface TocSpec {
  /** Title without any number — numbering is automatic */
  title: string;
  chapter: Chapter;
  /**
   * NotesPages are numbered 1, 2, 3 … automatically (one single number per topic) and the same number is used on the
   * Contents badge, the page pill and the TopicHeader. Override with a number (or "3.1") only if you must.
   */
  number?: number | string;
  /** Make this a subsection of the preceding topic: numbered 3.1, 3.2 … and indented in the Contents. */
  sub?: boolean;
}

export interface NotesDocumentProps {
  meta: DocumentMeta;
  /** Page templates (CoverPage, ContentsPage, NotesPage, …) or custom <Page>s, in print order */
  children: ReactNode;
}

const cssString = (s: string) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;

/**
 * Root of a printable notes packet. Collects the Contents from each page's `toc` prop, provides document
 * meta to every page (week badge, brand color, footer label), and sets the footer text used on every
 * printed sheet.
 */
export function NotesDocument({ meta, children }: NotesDocumentProps) {
  const pages = Children.toArray(children).filter(isValidElement) as ReactElement<{ toc?: TocSpec }>[];

  const { toc, slots } = useMemo(() => {
    const toc: TocEntry[] = [];
    let topic = 0;
    let sub = 0;
    const slots: PageSlotValue[] = pages.map((el, i) => {
      const spec = el.props.toc;
      if (!spec) return { index: i + 1 };
      let number: string | undefined;
      const numbered = (el.type as { numberedTopic?: boolean }).numberedTopic === true;
      if (spec.number != null) {
        number = String(spec.number);
        const m = /^(\d+)(?:\.(\d+))?$/.exec(number);
        if (m) { topic = Number(m[1]); sub = m[2] ? Number(m[2]) : 0; }
      } else if (numbered && spec.sub && topic > 0) number = `${topic}.${++sub}`;
      else if (numbered) { number = String(++topic); sub = 0; }
      const entry: TocEntry = { n: toc.length + 1, title: spec.title, chapter: spec.chapter, number, level: number?.includes('.') ? 1 : 0 };
      toc.push(entry);
      return { index: i + 1, tocEntry: entry };
    });
    return { toc, slots };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const value = useMemo(
    () => ({ meta: { brandChapter: 1 as Chapter, ...meta }, toc, tocPages: (typeof window !== 'undefined' && window.__TOC_PAGES__) || {} }),
    [meta, toc],
  );

  useEffect(() => {
    document.title = meta.week ? `${meta.title} — ${meta.week}` : meta.title;
    let cancelled = false;
    document.fonts.ready.then(allSettled).then(() => document.fonts.ready).then(() => {
      if (!cancelled) { hideKickers(); window.__FIT_LOG__ = [...fitNotePages(), ...packPages()]; window.__FIT_PRED__ = predictedSheets(); window.__FIT_LOG__.push(...finalizeFits()); sourcesToFooter(); }
      if (!cancelled) window.__NOTES_READY__ = true;
    });
    return () => {
      cancelled = true;
      window.__NOTES_READY__ = false;
    };
  }, [meta.title, meta.week]);

  // The label rule must be re-cancelled for footer-less pages: later @page rules win over the named ones in print.css.
  const bare = '{@bottom-left{content:none;border:none}@bottom-center{content:none;border:none}@bottom-right{content:none;border:none}}';
  const footerCss = `@page{@bottom-left{content:${cssString(meta.footerLabel ?? meta.title)}}}` + ['portrait-bare', 'landscape-bare', 'cover'].map((n) => `@page ${n}${bare}`).join('');

  return (
    <DocumentContext.Provider value={value}>
      <style>{footerCss}</style>
      <div className="doc">
        {pages.map((el, i) => (
          <PageSlotContext.Provider key={i} value={slots[i]}>
            {el}
          </PageSlotContext.Provider>
        ))}
      </div>
    </DocumentContext.Provider>
  );
}
