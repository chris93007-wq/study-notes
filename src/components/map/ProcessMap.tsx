import type { CSSProperties } from 'react';
import { FlashCard, type FlashCardProps } from '../flashcards/FlashCard';
import { densityStyle, type Density } from '../density';
import { ch, type Chapter } from '../types';

/**
 * One node of a map: a title and any of definition / formula in words / why / free content. Chapter color defaults to
 * the map's `chapter`, else cycles through the palette.
 */
export type MapNode = Omit<FlashCardProps, 'chapter' | 'step'> & { chapter?: Chapter };

export interface ProcessMapProps {
  nodes: MapNode[];
  /**
   * 'none' (default): independent cards — a topic overview, a framework, the parts of a whole.
   * 'arrows': the nodes are a sequence — each card carries a step number and an arrow points to the next one in the
   * same row (a process, a ladder, a timeline, a pipeline).
   */
  flow?: 'none' | 'arrows';
  /**
   * Cards per row. A number pins it. 'auto' (default) lets rows and columns flex: with flow 'none' the grid fits as many
   * cards per row as the width allows (see `minWidth`); with 'arrows' it is up to 4 per row. A MapPage chooses the
   * shape that fits one sheet.
   */
  columns?: number | 'auto';
  /** Narrowest a card may get in 'auto' mode (px at comfortable density). Default 168. */
  minWidth?: number;
  /** One color for every node without its own chapter */
  chapter?: Chapter;
  /** Span the full page width on a margin-layout page (default). false keeps it in the main column. */
  wide?: boolean;
  /** Card density: "comfortable" 100% (default), "cozy" 90%, "compact" 80%, or 0.8–1. Everything inside shrinks together and the cards re-flow into the room. */
  density?: Density;
}

/**
 * A map of a structured thing: nodes as cards in a grid whose rows and columns flex to the room available, with optional
 * numbered steps and arrows for a sequence. Use it for a topic overview, a process, a ladder (net income → EBIT → EBITDA),
 * a framework (the three drivers of ROE) or a timeline — anywhere the structure is the point. As a block it can sit in
 * any notes page; MapPage / TopicMapPage wrap it in a one-sheet page that picks the rows × columns and density that fit.
 */
export function ProcessMap({ nodes, flow = 'none', columns = 'auto', minWidth = 168, chapter, wide = true, density }: ProcessMapProps) {
  const n = nodes.length;
  const c = typeof columns === 'number' ? Math.max(1, Math.min(columns, n)) : flow === 'arrows' ? Math.min(n, 4) : 0; // 0 = CSS auto-fit
  const grid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: c ? `repeat(${c}, minmax(0, 1fr))` : `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
    gap: 'var(--space-4)',
    alignItems: 'stretch',
    breakInside: 'avoid',
  };
  const chip = (color: Chapter): CSSProperties => ({ position: 'absolute', zIndex: 1, width: 20, height: 20, borderRadius: '50%', background: 'var(--surface-page)', border: `1px solid ${ch(color, 300)}`, color: ch(color, 700), fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xs)', lineHeight: '18px', textAlign: 'center', pointerEvents: 'none' });
  const cell = (node: MapNode, i: number) => {
    const color = (node.chapter ?? chapter ?? (((i % 5) + 1) as Chapter)) as Chapter;
    const { chapter: _own, ...rest } = node;
    void _own;
    const sameRow = flow === 'arrows' && c > 1 && i < n - 1 && i % c !== c - 1;
    const down = flow === 'arrows' && c === 1 && i < n - 1;
    return (
      <div key={i} style={{ position: 'relative', minWidth: 0 }}>
        <FlashCard {...rest} chapter={color} step={flow === 'arrows' ? i + 1 : undefined} number={flow === 'arrows' ? undefined : (node.number ?? i + 1)} />
        {sameRow && <span aria-hidden style={{ ...chip(color), top: 13, right: 'calc(var(--space-4) / -2 - 10px)' }}>→</span>}
        {down && <span aria-hidden style={{ ...chip(color), left: '50%', bottom: 'calc(var(--space-4) / -2 - 10px)', transform: 'translateX(-50%)' }}>↓</span>}
      </div>
    );
  };
  // With a fixed column count each row is its own grid, so a map that cannot fit one sheet can break between rows
  // (Chromium moves a whole grid to the next sheet rather than splitting its rows). Auto-fit stays one grid.
  const rows = c ? Array.from({ length: Math.ceil(n / c) }, (_, r) => nodes.slice(r * c, r * c + c).map((node, k) => cell(node, r * c + k))) : null;
  return (
    <div data-map data-wide={wide || undefined}>
      <div className="card-density" style={densityStyle(density)}>
        {rows ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {rows.map((r, i) => <div key={i} style={grid}>{r}</div>)}
          </div>
        ) : (
          <div style={grid}>{nodes.map(cell)}</div>
        )}
      </div>
    </div>
  );
}
