import katex from 'katex';
import { Fragment, useMemo, type CSSProperties, type ReactNode } from 'react';

export interface TexProps {
  /** LaTeX source, rendered with KaTeX (e.g. "WTP = \\dfrac{u_i}{\\beta_{price}}") */
  tex: string;
  /** Display mode (block, centered) instead of inline */
  display?: boolean;
  style?: CSSProperties;
}

/** KaTeX math, rendered synchronously so it is in the DOM before the PDF is printed. */
export function Tex({ tex, display = false, style }: TexProps) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, displayMode: display, output: 'html' }), [tex, display]);
  return <span style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Inline math inside plain text: wrap LaTeX in double dollars, e.g. "Set $$T_C = 0$$ and …". Single dollars stay money
 * ("$500M"). Works on strings and on nested React nodes; other nodes pass through untouched.
 */
export function math(node: ReactNode): ReactNode {
  if (typeof node === 'string') {
    if (!node.includes('$$')) return node;
    return node.split(/\$\$(.+?)\$\$/s).map((part, i) => (i % 2 ? <Tex key={i} tex={part} /> : part));
  }
  if (Array.isArray(node)) return node.map((n, i) => <Fragment key={i}>{math(n)}</Fragment>);
  return node;
}
