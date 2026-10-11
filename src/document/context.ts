import { createContext, useContext } from 'react';
import type { Chapter } from '../components/types';

export interface DocumentMeta {
  /** Main title, e.g. "Preference Measurement" */
  title: string;
  /** e.g. "MaxDiff, TURF & Conjoint Analysis" */
  subtitle?: string;
  /** e.g. "MKT 282 · Marketing Analytics" */
  course?: string;
  /** Week/session badge text, e.g. "Week 3" */
  week?: string;
  /** e.g. "Christine John" — shown on the cover */
  author?: string;
  /** Footer breadcrumb on every page; defaults to `title` */
  footerLabel?: string;
  /**
   * The document's primary chapter color. Used by PageBadge on every page so the packet reads as one
   * document, independent of the topic colors used inside page bodies. Defaults to 1.
   */
  brandChapter?: Chapter;
}

export interface TocEntry {
  /** 1-based position in the Contents list */
  n: number;
  title: string;
  chapter: Chapter;
  /** Topic number shown on the Contents badge, the page pill and the TopicHeader — one number per topic ("3"), or "3.1" for a subsection. Undefined for unnumbered pages (Topic Map, Cheat Sheet, …). */
  number?: string;
  /** 0 = topic / unnumbered page, 1 = subsection (indented in the Contents) */
  level: 0 | 1;
}

export interface DocumentContextValue {
  meta: DocumentMeta;
  toc: TocEntry[];
  /** Printed page number per toc entry, filled in by the PDF script's first pass (empty on screen). */
  tocPages: Record<number, number>;
}

export const DocumentContext = createContext<DocumentContextValue | null>(null);
export const useDocument = () => useContext(DocumentContext);

/** Per-page info NotesDocument hands to each page template. */
export interface PageSlotValue {
  /** 1-based position of the page template in the document */
  index: number;
  /** Set when this page appears in the Contents */
  tocEntry?: TocEntry;
}
export const PageSlotContext = createContext<PageSlotValue | null>(null);
export const usePageSlot = () => useContext(PageSlotContext);
