import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Aside } from '../layout/Aside';
import { Callout } from '../components/callouts/Callout';
import { densityValue, type Density } from '../components/density';
import { trackPending } from '../document/pending';
import { contentHeight, earlyLog } from '../document/joinPages';
import { Page } from '../document/Page';
import { useDocument } from '../document/context';
import type { TocSpec } from '../document/NotesDocument';
import { ChapterHeader } from '../components/structure/ChapterHeader';
import { SectionTitle } from '../components/structure/SectionTitle';
import { ProcessMap, type MapNode } from '../components/map/ProcessMap';
import { Tree, type TreeNode } from '../components/diagrams/Tree';
import type { Chapter } from '../components/types';

export interface MapPageProps {
  toc?: TocSpec;
  /** Mono label next to the week badge (default "Map") */
  label?: string;
  /** Defaults to the document title */
  title?: string;
  subtitle?: string;
  /** Badge color; defaults to the brand chapter */
  chapterNumber?: Chapter;
  /** The nodes of the map: topics, steps, stages, parts of a framework … Leave out when the map is a `tree`. */
  nodes?: MapNode[];
  /**
   * The map as a content tree instead of cards: shapes for the root and the branches, bulleted lists for the leaves (see
   * Tree). A Pyramid-Principle tree of the session is the natural Topic Map. Drawn under the introduction.
   */
  tree?: TreeNode;
  /** 'none' (default): independent cards. 'arrows': a sequence — numbered cards with arrows between neighbours in a row. */
  flow?: 'none' | 'arrows';
  /** Cards per row. 'auto' (default): the page picks the rows × columns that fit one sheet. A number pins it. */
  columns?: number | 'auto';
  /** Pin the card density (comfortable 100% / cozy 90% / compact 80% / 0.8–1). Default: the lightest density that fits one sheet. */
  density?: Density;
  /** Optional heading above the map (a section divider), e.g. "The earnings ladder" */
  heading?: string;
  /** One color for every node without its own */
  chapter?: Chapter;
  /**
   * 'auto' (default): rows × columns flex to fit one sheet, and for an unordered map (flow 'none') nodes may become margin
   * notes (title + bullets) beside the introduction when nothing else fits. 'grid': never margin notes.
   */
  placement?: 'auto' | 'grid' | 'margin';
  /** Introduction on the margin layout: SectionTitle, paragraphs in the main column, callouts inside <Aside>. */
  children?: ReactNode;
}

const LEVELS = [1, 0.95, 0.9, 0.85, 0.8];

/** Cards per row to try, most readable first. Unordered: roughly square (all in a row when 3 or fewer), even rows first. Sequence: as many per row as fit (≤ 4), even rows first. */
function shapeOrder(n: number, flow: 'none' | 'arrows'): number[] {
  const cs = Array.from({ length: Math.max(1, Math.min(n, 4)) }, (_, i) => i + 1);
  const even = (c: number) => (n % c === 0 ? 0 : 1);
  const target = n <= 3 ? n : Math.round(Math.sqrt(n));
  const key = (c: number): number[] => (c === 1 && n > 2 ? [2, 0, 0] : flow === 'arrows' ? [0, even(c), -c] : [0, even(c), Math.abs(c - target)]);
  return cs.sort((a, b) => {
    const ka = key(a), kb = key(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    return 0;
  });
}

type Cfg = { d: number; c: number | 'margin' };

/**
 * A one-sheet page for any structured process or overview: header, an introduction, then a ProcessMap. Rows × columns and
 * card density flex until it all fits one sheet (the lightest density first, the most readable shape first); a topic overview
 * can fall back to margin notes. Set `flow="arrows"` for a sequence.
 */
export function MapPage({ toc, label = 'Map', title, subtitle, chapterNumber, nodes = [], tree, flow = 'none', columns = 'auto', density, heading, chapter, placement = 'auto', children }: MapPageProps) {
  const doc = useDocument();
  const ref = useRef<HTMLSpanElement>(null);
  const pinnedD = densityValue(density);
  const pinnedC = typeof columns === 'number' ? columns : null;
  const marginOk = flow === 'none' && placement !== 'grid';
  const shapes = pinnedC != null ? [pinnedC] : shapeOrder(nodes.length, flow);
  const [cfg, setCfg] = useState<Cfg>({ d: pinnedD ?? 1, c: placement === 'margin' && marginOk ? 'margin' : shapes[0] });

  useEffect(() => {
    if (nodes.length === 0 || placement === 'margin' || (pinnedD != null && pinnedC != null)) return; // a tree has no cards to flex
    trackPending((async () => {
      await document.fonts.ready;
      const page = ref.current?.closest('section.page');
      if (!page) return;
      const room = 960 - 24; // printable height of a sheet, with a little to spare
      const name = title ?? label;
      const note = (t: Cfg, sheets: number) => {
        const rows = typeof t.c === 'number' ? Math.ceil(nodes.length / t.c) : 0;
        const shape = t.c === 'margin' ? 'as margin notes' : `${t.c} per row (${rows} row${rows > 1 ? 's' : ''})`;
        const dens = t.d === 1 ? 'comfortable' : t.d >= 0.9 ? `${Math.round(t.d * 100)}%` : t.d > 0.8 ? `${Math.round(t.d * 100)}%` : 'compact 80%';
        earlyLog.push(`${name}: ${nodes.length} nodes ${shape}${t.c === 'margin' ? '' : `, ${dens}`} → ${sheets} sheet${sheets > 1 ? 's' : ''}`);
      };
      const ds = pinnedD != null ? [pinnedD] : LEVELS;
      const trials: Cfg[] = [];
      ds.forEach((d, i) => {
        shapes.forEach((c) => trials.push({ d, c }));
        if (marginOk && i === Math.min(2, ds.length - 1)) trials.push({ d: 1, c: 'margin' });
      });
      const seen: Array<{ t: Cfg; h: number }> = [];
      for (const t of trials) {
        flushSync(() => setCfg(t));
        const h = contentHeight(page);
        seen.push({ t, h });
        if (h <= room) { note(t, 1); return; }
      }
      // nothing fits one sheet: the fewest sheets, then the lightest density, then the shortest
      const best = seen.reduce((a, b) => {
        const ka = [Math.ceil(a.h / 960), -a.t.d, a.h], kb = [Math.ceil(b.h / 960), -b.t.d, b.h];
        for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] < kb[i] ? a : b;
        return a;
      });
      flushSync(() => setCfg(best.t));
      note(best.t, Math.ceil(best.h / 960));
    })());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = chapterNumber ?? doc?.meta.brandChapter ?? 1;
  return (
    <Page toc={toc} layout="margin" style={{ '--d-page': cfg.d } as CSSProperties}>
      <span ref={ref} hidden />
      <ChapterHeader compact chapterNumber={color} week={doc?.meta.week} chapter={label} title={title ?? doc?.meta.title ?? ''} subtitle={subtitle} />
      {children}
      {heading && <div data-wide style={{ marginTop: 'var(--space-3)' }}><SectionTitle chapter={color}>{heading}</SectionTitle></div>}
      {tree && <Tree root={tree} chapter={color} />}
      {nodes.length === 0 ? null : cfg.c === 'margin' ? (
        <Aside>
          {nodes.map((node, i) => (
            <Callout key={i} chapter={node.chapter ?? chapter ?? (((i % 5) + 1) as Chapter)} label={/^\d/.test(node.title) ? node.title : `${node.number ?? i + 1} · ${node.title}`} items={[node.definition, node.formula, node.why].filter((x) => x != null)} />
          ))}
        </Aside>
      ) : (
        <ProcessMap nodes={nodes} flow={flow} columns={cfg.c} chapter={chapter} density={pinnedD ?? undefined} />
      )}
    </Page>
  );
}
