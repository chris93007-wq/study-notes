import type { ReactNode } from 'react';
import type { TocSpec } from '../document/NotesDocument';
import type { MapNode } from '../components/map/ProcessMap';
import type { TreeNode } from '../components/diagrams/Tree';
import type { Chapter } from '../components/types';
import { MapPage } from './MapPage';

export interface TopicMapPageProps {
  toc?: TocSpec;
  /** Mono label next to the week badge */
  label?: string;
  /** Defaults to the document title */
  title?: string;
  subtitle?: string;
  /** Week-badge color; defaults to the brand chapter */
  chapterNumber?: Chapter;
  /** One card per topic in the packet. Leave out when the map is a `tree`. */
  cards?: MapNode[];
  /**
   * The packet's content tree (Pyramid-Principle), drawn as shapes for the root and branches and bullets for the leaves.
   * Give each top-level branch its topic's `chapter`. Use it instead of `cards` when the topics have a structure worth showing.
   */
  tree?: TreeNode;
  /** Optional heading above the tree or the cards, e.g. "How Session 4 is structured" */
  heading?: string;
  /** Pin the cards per row. Default: the page picks the rows × columns that fit one sheet. */
  cardColumns?: number;
  /**
   * Where the per-topic cards go. 'auto' (default): rows × columns and card density flex until the page fits one sheet,
   * with margin notes (title + bullets beside the introduction) as a last resort. 'grid': always cards. 'margin': always margin notes.
   */
  cardPlacement?: 'auto' | 'margin' | 'grid';
  /** Introduction on the margin layout: SectionTitle, paragraphs in the main column, callouts inside <Aside>. */
  children?: ReactNode;
}

/**
 * Chapter overview — a MapPage whose nodes are the packet's topics: header, introduction, then a card per topic, flexed to one
 * sheet. Optional: a single topic, or topics with no relationship worth drawing, don't need one. For any other structured
 * process (steps, a ladder, a framework) use MapPage directly.
 */
export function TopicMapPage({ toc, label = 'Overview', title, subtitle, chapterNumber, cards = [], tree, heading, cardColumns, cardPlacement = 'auto', children }: TopicMapPageProps) {
  return (
    <MapPage toc={toc} label={label} title={title} subtitle={subtitle} chapterNumber={chapterNumber} nodes={cards} tree={tree} heading={heading} flow="none" columns={cardColumns ?? 'auto'} placement={cardPlacement}>
      {children}
    </MapPage>
  );
}
