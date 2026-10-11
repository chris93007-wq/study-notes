import type { CSSProperties, ReactNode } from 'react';
import { math } from '../math/Tex';
import { ch, type Chapter } from '../types';

/**
 * Full worked-example walkthrough in a card: "Worked Example" badge + title, a Setup sentence (with an
 * optional supporting figure), an optional data table, a "Show the Work" step box, a highlighted final
 * answer, and a "So what" takeaway.
 */
export interface WorkedExampleStep {
  label?: string;
  lines?: string[];
}
export interface WorkedExampleProps {
  /** Full page width on a margin-layout page (default). Pass `wide={false}` to set the card in the main column (≈62%) beside the margin notes, which suits short examples with no big table. */
  wide?: boolean;
  title: string;
  /** Badge text: 'Worked Example' (default) for numeric walk-throughs, or 'Example' for any other example (a scenario, a diagram, a comparison). Every example goes in this card. */
  label?: string;
  /** One sentence describing the scenario, shown after a bold "Setup:" label */
  setup?: ReactNode;
  /** A supporting diagram/figure shown beside the setup text — any ReactNode you provide */
  context?: ReactNode;
  /** Optional data table — first column left-aligned, rest right-aligned */
  table?: { columns: string[]; rows: (string | number)[][] };
  /** "Show the Work" steps — short label + monospace lines per step */
  steps?: WorkedExampleStep[];
  /** The highlighted final result */
  answer?: { value: string; label: string };
  /** The takeaway — why this result matters, shown after a bold "So what:" label */
  soWhat?: ReactNode;
  /** Which chapter color (1-13) tints the card */
  chapter: Chapter;
}

const GRID = 'repeat(auto-fit, minmax(250px, 1fr))';

export function WorkedExample({ title, label = 'Worked Example', setup, context, table, steps = [], answer, soWhat, chapter, wide }: WorkedExampleProps) {
  const accent = ch(chapter, 500);
  const ink = ch(chapter, 900);
  const card: CSSProperties = { columnSpan: 'all', border: `var(--box-border) solid ${accent}`, borderTop: `var(--box-accent) solid ${accent}`, borderRadius: 'var(--box-radius)', background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)', padding: 'var(--box-pad)' };
  const wrap: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--box-gap)', fontFamily: 'var(--font-body)' };
  const head: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', breakAfter: 'avoid' };
  const badge: CSSProperties = { display: 'inline-flex', background: accent, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-label)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 'var(--radius-pill)' };
  const titleStyle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-title)', color: 'var(--ink-900)', margin: 0, lineHeight: 'var(--leading-tight)' };
  const row: CSSProperties = { display: 'grid', gridTemplateColumns: GRID, gap: 'var(--box-gap) var(--space-5)', alignItems: 'start' };
  const setupStyle: CSSProperties = { fontSize: 'var(--box-text)', lineHeight: 'var(--box-prose-leading)', color: 'var(--ink-900)', margin: 0 };
  const tableWrap: CSSProperties = { border: '1px solid var(--line)', borderRadius: 'var(--box-inner-radius)', overflow: 'hidden', breakInside: 'avoid' };
  const tableEl: CSSProperties = { width: '100%', borderCollapse: 'collapse' };
  const th: CSSProperties = { padding: 'var(--space-1) var(--space-3)', background: ch(chapter, 100), color: ink, fontFamily: 'var(--font-display)', fontSize: 'var(--box-label)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 };
  const td: CSSProperties = { padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--box-text)', lineHeight: 'var(--box-leading)', color: 'var(--ink-900)', borderTop: '1px solid var(--line)' };
  const stepsBox: CSSProperties = { border: `1px solid ${ch(chapter, 300)}`, background: ch(chapter, 100), borderRadius: 'var(--box-inner-radius)', padding: 'var(--box-inner-pad)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', breakInside: 'avoid' };
  const stepsLabel: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-label)', letterSpacing: '0.06em', textTransform: 'uppercase', color: ink };
  const stepLabel: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-text)', color: ink };
  const lines: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 'var(--box-label)', color: 'var(--ink-900)', lineHeight: 'var(--box-leading)', marginTop: 1.8, overflowWrap: 'anywhere' };
  const step: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 1.8 };
  const answerBox: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, padding: 'var(--space-3)', borderRadius: 'var(--box-inner-radius)', background: ink, color: '#fff', breakInside: 'avoid' };
  const answerValue: CSSProperties = { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-xl)', lineHeight: 1.2 };
  const answerLabel: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--box-label)', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.85 };
  const soWhatBox: CSSProperties = { borderLeft: `3px solid ${accent}`, paddingLeft: 'var(--space-3)', fontSize: 'var(--box-text)', lineHeight: 'var(--box-prose-leading)', color: 'var(--ink-900)', breakInside: 'avoid' };

  const setupBlock = (setup || context) && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 0 }}>
      {setup && <p style={setupStyle}><span style={{ fontWeight: 700 }}>Setup: </span>{math(setup)}</p>}
      {context}
    </div>
  );
  const tableBlock = table && (
    <div style={tableWrap}>
      <table style={tableEl}>
        <thead><tr>{table.columns.map((c, i) => <th key={i} style={{ ...th, textAlign: i === 0 ? 'left' : 'right' }}>{c}</th>)}</tr></thead>
        <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j} style={{ ...td, textAlign: j === 0 ? 'left' : 'right' }}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
  const stepsBlock = steps.length > 0 && (
    <div style={stepsBox}>
      <span style={stepsLabel}>Show the Work</span>
      {steps.map((s, i) => (
        <div key={i} style={step}>
          <span style={stepLabel}>Step {i + 1}{s.label ? ` — ${s.label}` : ''}</span>
          <div style={lines}>{(s.lines || []).map((l, j) => <div key={j}>{l}</div>)}</div>
        </div>
      ))}
    </div>
  );
  const answerBlock = answer && <div style={answerBox}><span style={answerValue}>{answer.value}</span><span style={answerLabel}>{answer.label}</span></div>;
  const soWhatBlock = soWhat && <div style={soWhatBox}><span style={{ fontWeight: 700 }}>So what: </span>{math(soWhat)}</div>;
  const stack = (answerBlock || soWhatBlock) && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--box-gap)', minWidth: 0 }}>{answerBlock}{soWhatBlock}</div>
  );

  return (
    <div data-wide={wide === false ? undefined : true} style={{ ...card, breakInside: 'avoid' }}>
      <div style={wrap}>
        <div style={head}><span style={badge}>{label}</span><h3 style={titleStyle}>{title}</h3></div>
        {/* setup beside the data table; the work beside the answer and the so-what */}
        {/* no steps: the answer and so-what move up under the setup, filling the space beside a tall table */}
        {!stepsBlock && tableBlock && (setupBlock || stack) ? (
          <div style={row}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--box-gap)', minWidth: 0 }}>{setupBlock}{stack}</div>
            {tableBlock}
          </div>
        ) : (
          (setupBlock || tableBlock) && <div style={row}>{setupBlock}{tableBlock}</div>
        )}
        {(stepsBlock || (stack && !(tableBlock && !stepsBlock && (setupBlock || stack)))) && (
          <div style={row}>
            {stepsBlock}
            {stack ?? null}
          </div>
        )}
      </div>
    </div>
  );
}
