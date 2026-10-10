import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { Tex } from '../math/Tex';
import { FormulaTree, type FormulaTreeNode } from '../diagrams/FormulaTree';
import { ch, type Chapter } from '../types';

/**
 * Three-part explainer for one concept: plain-language definition, the formula(s) rendered as real math
 * (KaTeX), an optional calculation breakdown diagram, and the underlying "why" that makes the formula make sense.
 */
export interface ConceptCardProps {
  term: string;
  /** Plain-language definition — no jargon, no formula */
  definition: ReactNode;
  /** One or more LaTeX strings, joined with "or" when more than one */
  formulas?: string[];
  /** Optional value-box diagram walking a worked example (see FormulaTree) */
  breakdown?: FormulaTreeNode;
  /** The underlying logic/intuition for why the formula works — not just a fact to memorize */
  why: ReactNode;
  /** Which chapter color (1-13) tints the card */
  chapter: Chapter;
  /** Span both page columns. Default: automatic — on when a formula is long enough that it would not fit a half-width card. */
  wide?: boolean;
}

/** Parts sit side by side when the card is wide enough for two ~230px columns, and stack in a half-width column. */
const GRID = 'repeat(auto-fit, minmax(230px, 1fr))';

export function ConceptCard({ term, definition, formulas = [], breakdown, why, chapter, wide }: ConceptCardProps) {
  const spanAll = wide ?? (formulas.some((f) => f.length > 52) || !!breakdown);
  const accent = ch(chapter, 500);
  const wrap: CSSProperties = { columnSpan: spanAll ? 'all' : undefined, border: `var(--box-border) solid ${accent}`, borderTop: `var(--box-accent) solid ${accent}`, borderRadius: 'var(--box-radius)', background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', fontFamily: 'var(--font-body)', breakInside: 'avoid' };
  const body: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--box-gap)', padding: 'var(--box-pad)' };
  const head: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' };
  const badge: CSSProperties = { display: 'inline-flex', background: accent, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-label)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 'var(--radius-pill)' };
  const grid: CSSProperties = { display: 'grid', gridTemplateColumns: GRID, gap: 'var(--box-gap) var(--space-5)', alignItems: 'start' };
  const section: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', minWidth: 0 };
  const label: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-label)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-500)' };
  const termStyle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-title)', color: 'var(--ink-900)', margin: 0, lineHeight: 'var(--leading-tight)' };
  const text: CSSProperties = { fontSize: 'var(--box-text)', lineHeight: 'var(--box-leading)', color: 'var(--ink-900)', margin: 0 };
  const formulaBox: CSSProperties = { border: `1px solid ${ch(chapter, 300)}`, background: ch(chapter, 100), borderRadius: 'var(--box-inner-radius)', padding: 'var(--box-inner-pad)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', fontSize: 'var(--text-base)' };
  const orStyle: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--box-label)', color: 'var(--ink-500)', fontStyle: 'italic' };
  const Part = ({ title, children }: { title: string; children: ReactNode }) => (
    <div style={section}><span style={label}>{title}</span>{children}</div>
  );
  const hasFormula = formulas.length > 0;
  // A long formula needs the card's full width; short ones sit beside the definition.
  const longFormula = formulas.some((f) => f.length > 52);
  const formula = hasFormula && (
    <Part title="Formula">
      <div style={formulaBox}>
        {formulas.map((f, i) => (
          <Fragment key={i}>
            {i > 0 && <span style={orStyle}>or</span>}
            <Tex tex={f} />
          </Fragment>
        ))}
      </div>
    </Part>
  );
  const whyPart = <Part title="Why It Works"><p style={text}>{why}</p></Part>;
  return (
    <div style={wrap}>
      <div style={body}>
        <div style={head}><span style={badge}>Concept</span><h3 style={termStyle}>{term}</h3></div>
        {longFormula ? (
          <>
            {/* definition beside the why, then the long formula across the full card */}
            <div style={grid}>
              <Part title="Definition"><p style={text}>{definition}</p></Part>
              {whyPart}
            </div>
            {formula}
          </>
        ) : (
          <>
            {/* definition beside the formula (or beside the why when there is no formula) */}
            <div style={grid}>
              <Part title="Definition"><p style={text}>{definition}</p></Part>
              {hasFormula ? formula : whyPart}
            </div>
            {breakdown && <FormulaTree root={breakdown} chapter={chapter} />}
            {hasFormula && whyPart}
          </>
        )}
        {longFormula && breakdown && <FormulaTree root={breakdown} chapter={chapter} />}
      </div>
    </div>
  );
}
