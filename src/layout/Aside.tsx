import type { ReactNode } from 'react';

/**
 * Margin note. On a margin-layout notes page (the NotesPage default) it floats into the right-hand margin beside
 * the text that follows it, so place it just BEFORE the paragraph/card/section it annotates. Put every callout
 * (Key Insight, Notes, Memory Aid, Exam Trap) in an Aside so the main column stays continuous prose.
 * Several callouts in one Aside stack in the margin. On other layouts it is a plain stacked block.
 */
export function Aside({ children }: { children?: ReactNode }) {
  return <aside className="aside">{children}</aside>;
}

/** Span the full page width on a margin-layout page (tables, diagrams, worked examples). Clears any margin notes above. */
export function Wide({ children }: { children?: ReactNode }) {
  return <div data-wide>{children}</div>;
}
