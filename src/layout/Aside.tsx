import type { ReactNode } from 'react';

/**
 * The margin column. On a margin-layout notes page (the NotesPage default) it floats into the right-hand margin beside
 * the text that follows it, so place it just BEFORE the paragraph/card/section it annotates. It holds callouts
 * (Key Insight, Notes, Memory Aid, Exam Trap), short marginalia paragraphs (a plain <p>: a side gloss, a caveat, an
 * attribution — set one step down like a textbook side note), and small elements (a narrow table or chart with
 * `wide={false}`). Several stack. On other layouts it is a plain stacked block.
 */
export function Aside({ children }: { children?: ReactNode }) {
  return <aside className="aside">{children}</aside>;
}

/** Span the full page width on a margin-layout page (tables, diagrams, worked examples). Clears any margin notes above. */
export function Wide({ children }: { children?: ReactNode }) {
  return <div data-wide>{children}</div>;
}
