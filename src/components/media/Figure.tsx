import type { CSSProperties, ReactNode } from 'react';
import { math } from '../math/Tex';

/**
 * A numbered figure, like a textbook's "▲ Figure 5.10 — …": wrap any visual (a chart, a Mermaid diagram, an Image,
 * a Split) and give it a caption. Numbers are assigned automatically in reading order when the document renders, so
 * never type one. Reference it from the prose with <Fig id="…"/> ("as Fig. 3 shows") — `npm run pdf` warns about a
 * numbered figure that no sentence names. Don't pass the wrapped component its own `caption` too.
 */
export interface FigureProps {
  /** Short slug used by <Fig id> references, e.g. "solubility-curve". Optional for a figure nothing references. */
  id?: string;
  /** Caption without any number — "Fig. N —" is added automatically */
  caption: ReactNode;
  /** Span the full page width (default). false keeps it in the current column — main, or the margin inside an <Aside>. */
  wide?: boolean;
  children?: ReactNode;
}

export function Figure({ id, caption, wide = true, children }: FigureProps) {
  const fig: CSSProperties = { columnSpan: wide ? 'all' : undefined, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', breakInside: 'avoid' };
  const cap: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)', lineHeight: 'var(--leading-body)' };
  const num: CSSProperties = { fontWeight: 700, color: 'var(--ink-700)' };
  return (
    <figure data-fig data-fig-id={id} data-wide={wide || undefined} style={fig}>
      {children}
      <figcaption style={cap}>
        <span aria-hidden>▲ </span>
        <span className="fig-n" style={num} />
        <span> — </span>
        {typeof caption === 'string' ? math(caption) : caption}
      </figcaption>
    </figure>
  );
}

/** Inline reference to a <Figure id="…">: renders "Fig. N" with the figure's assigned number. */
export function Fig({ id }: { id: string }) {
  return <span data-fig-ref={id} style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Fig.&nbsp;?</span>;
}
