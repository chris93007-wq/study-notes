import { Children, isValidElement, useEffect, useMemo, type ReactElement, type ReactNode } from 'react';
import type { Chapter } from '../components/types';
import { allSettled } from './pending';
import { joinShortPages } from './joinPages';
import { DocumentContext, PageSlotContext, type DocumentMeta, type PageSlotValue, type TocEntry } from './context';

declare global {
  interface Window {
    /** Injected by scripts/pdf.ts on the second pass: Contents entry number → printed page number. */
    __TOC_PAGES__?: Record<number, number>;
    /** Set once fonts are loaded and the document has rendered; scripts/pdf.ts waits for it. */
    __NOTES_READY__?: boolean;
  }
}

/** Any page template accepts `toc` to be listed on the Contents page. */
export interface TocSpec {
  title: string;
  chapter: Chapter;
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
    const slots: PageSlotValue[] = pages.map((el, i) => {
      const spec = el.props.toc;
      if (!spec) return { index: i + 1 };
      const entry = { n: toc.length + 1, title: spec.title, chapter: spec.chapter };
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
      if (!cancelled) joinShortPages();
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
