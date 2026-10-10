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
}

export function ConceptCard({ term, definition, formulas = [], breakdown, why, chapter }: ConceptCardProps) {
  const accent = ch(chapter, 500);
  const wrap: CSSProperties = { border: `var(--box-border) solid ${accent}`, borderTop: `var(--box-accent) solid ${accent}`, borderRadius: 'var(--box-radius)', background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', fontFamily: 'var(--font-body)', breakInside: 'avoid' };
  const body: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--box-gap)', padding: 'var(--box-pad)' };
  const badge: CSSProperties = { display: 'inline-flex', alignSelf: 'flex-start', background: accent, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-label)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 'var(--radius-pill)', marginBottom: 'var(--space-1)' };
  const section: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' };
  const label: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-label)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-500)' };
  const termStyle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-title)', color: 'var(--ink-900)', margin: 0, lineHeight: 'var(--leading-tight)' };
  const text: CSSProperties = { fontSize: 'var(--box-text)', lineHeight: 'var(--box-leading)', color: 'var(--ink-900)', margin: 0 };
  const formulaBox: CSSProperties = { border: `1px solid ${ch(chapter, 300)}`, background: ch(chapter, 100), borderRadius: 'var(--box-inner-radius)', padding: 'var(--box-inner-pad)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', fontSize: 'var(--text-base)' };
  const orStyle: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--box-label)', color: 'var(--ink-500)', fontStyle: 'italic' };
  return (
    <div style={wrap}>
      <div style={body}>
        <div>
          <span style={badge}>Concept</span>
          <h3 style={termStyle}>{term}</h3>
        </div>
        <div style={section}><span style={label}>Definition</span><p style={text}>{definition}</p></div>
        {formulas.length > 0 && (
          <div style={section}>
            <span style={label}>Formula</span>
            <div style={formulaBox}>
              {formulas.map((f, i) => (
                <Fragment key={i}>
                  {i > 0 && <span style={orStyle}>or</span>}
                  <Tex tex={f} />
                </Fragment>
              ))}
            </div>
          </div>
        )}
        {breakdown && <FormulaTree root={breakdown} chapter={chapter} />}
        <div style={section}><span style={label}>Why It Works</span><p style={text}>{why}</p></div>
      </div>
    </div>
  );
}
