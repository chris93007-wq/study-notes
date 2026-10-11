import { Children, Fragment, isValidElement, type CSSProperties, type ReactNode } from 'react';
import { math } from '../math/Tex';
import { ch, type Chapter } from '../types';

/**
 * Margin note: a chapter-colored title over a short bullet list — no box, no fill. Four kinds exist in notes —
 * "KEY INSIGHT", "NOTES", "MEMORY AID" and "EXAM TRAP". Pass `items` for explicit bullets; otherwise the children are
 * split into one bullet per sentence (inline <strong>/<mark> are kept).
 */
export interface CalloutProps {
  /** Which chapter color (1-13) tints the rule, title and bullets — always pass this */
  chapter: Chapter;
  /** All-caps title, typed by hand (e.g. "KEY INSIGHT", "NOTES", "MEMORY AID", "EXAM TRAP") */
  label?: string;
  /** Explicit bullets (each may contain inline markup). Overrides children. */
  items?: ReactNode[];
  children?: ReactNode;
}

/** Split text children into one bullet per sentence, carrying inline elements along with the sentence they sit in. */
export function toBullets(children: ReactNode): ReactNode[][] {
  const bullets: ReactNode[][] = [[]];
  const push = (n: ReactNode) => bullets[bullets.length - 1].push(n);
  const walk = (node: ReactNode) => {
    Children.forEach(node, (c) => {
      if (typeof c === 'string' || typeof c === 'number') {
        const parts = String(c).split(/(?<=[.?!][”"’)]?)\s+/);
        parts.forEach((p, i) => {
          if (i > 0) bullets.push([]);
          if (p) push(math(p));
        });
      } else if (isValidElement(c) && c.type === Fragment) {
        walk((c.props as { children?: ReactNode }).children);
      } else push(c);
    });
  };
  walk(children);
  return bullets.filter((b) => b.some((x) => typeof x !== 'string' || x.trim()));
}

export function Callout({ chapter, label, items, children }: CalloutProps) {
  const dark = ch(chapter, 900);
  const wrap: CSSProperties = { breakInside: 'avoid' };
  const rule: CSSProperties = { height: 2, background: ch(chapter, 500), borderRadius: 1 };
  const title: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase', color: dark, whiteSpace: 'nowrap' };
  const head: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: '0 0 var(--space-2)' };
  const list: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' };
  const li: CSSProperties = { position: 'relative', paddingLeft: 14, fontFamily: 'var(--font-body)', fontSize: 'var(--box-text)', lineHeight: 'var(--leading-compact)', color: 'var(--ink-900)' };
  const rows = items ? items.map((i) => [math(i)]) : toBullets(children);
  return (
    <div style={wrap}>
      {label && (
        <div style={head}>
          <span style={{ ...rule, width: 12 }} />
          <span style={title}>{label}</span>
          <span style={{ ...rule, flex: 1 }} />
        </div>
      )}
      <ul style={list}>
        {rows.map((b, i) => (
          <li key={i} style={li}><span aria-hidden style={{ position: 'absolute', left: 0, color: ch(chapter, 500) }}>•</span>{b}</li>
        ))}
      </ul>
    </div>
  );
}
