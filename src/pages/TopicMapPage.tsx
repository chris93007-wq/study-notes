import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Aside } from '../layout/Aside';
import { Callout } from '../components/callouts/Callout';
import { trackPending } from '../document/pending';
import { contentHeight } from '../document/joinPages';
import { Page } from '../document/Page';
import { useDocument } from '../document/context';
import type { TocSpec } from '../document/NotesDocument';
import { ChapterHeader } from '../components/structure/ChapterHeader';
import { FlashcardGrid, type FlashcardGridProps } from '../components/flashcards/FlashCard';
import type { Chapter } from '../components/types';

export interface TopicMapPageProps {
  toc?: TocSpec;
  /** Mono label next to the week badge */
  label?: string;
  /** Defaults to the document title */
  title?: string;
  subtitle?: string;
  /** Week-badge color; defaults to the brand chapter */
  chapterNumber?: Chapter;
  /** One flashcard per topic in the packet */
  cards: FlashcardGridProps['cards'];
  cardColumns?: number;
  /**
   * Where the per-topic cards go. 'auto' (default) tries, in order, margin notes (title + bullets beside the introduction),
   * a 2-column card grid, then a 4-column grid, and keeps the first that fits one sheet. Force one with 'margin' | 'grid'.
   */
  cardPlacement?: 'auto' | 'margin' | 'grid';
  /**
   * Introduction content on the margin layout: SectionTitle, paragraphs in the main column, callouts inside <Aside>.
   */
  children?: ReactNode;
}

/** Chapter overview: ChapterHeader, then the introduction (first) in a space-saving 2-column grid, then a flashcard per topic — sized to fit one sheet. */
export function TopicMapPage({ toc, label = 'Overview', title, subtitle, chapterNumber, cards, cardColumns = 2, cardPlacement = 'auto', children }: TopicMapPageProps) {
  const doc = useDocument();
  const ref = useRef<HTMLSpanElement>(null);
  type Mode = 'margin' | 'grid' | 'grid4';
  const [mode, setMode] = useState<Mode>(cardPlacement === 'grid' ? 'grid' : 'margin');
  useEffect(() => {
    if (cardPlacement !== 'auto') return;
    const frames = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    trackPending((async () => {
      await document.fonts.ready;
      for (const m of ['margin', 'grid', 'grid4'] as Mode[]) {
        setMode(m);
        await frames();
        const page = ref.current?.closest('section.page');
        if (page && contentHeight(page) <= 960 - 24) break;
      }
    })());
  }, [cardPlacement]);
  return (
    <Page toc={toc} layout="margin">
      <span ref={ref} hidden />
      <ChapterHeader compact chapterNumber={chapterNumber ?? doc?.meta.brandChapter ?? 1} week={doc?.meta.week} chapter={label} title={title ?? doc?.meta.title ?? ''} subtitle={subtitle} />
      {/* Introduction first, then a flashcard per topic. Chromium ignores break-inside on grid rows, so the intro block is kept together as a whole. */}
      {children}
      {mode === 'margin' ? (
        <Aside>
          {cards.map((c, i) => (
            <Callout key={i} chapter={c.chapter ?? (((i % 5) + 1) as Chapter)} label={`${String(c.number ?? i + 1).padStart(2, '0')} · ${c.title}`} items={[c.definition, ...(c.formula ? [c.formula] : []), c.why]} />
          ))}
        </Aside>
      ) : (
        <div data-wide style={{ marginTop: 'var(--space-3)' }}><FlashcardGrid cards={cards} columns={mode === 'grid4' ? 4 : cardColumns} /></div>
      )}
    </Page>
  );
}
