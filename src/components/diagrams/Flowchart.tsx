import type { CSSProperties } from 'react';
import { ch, type Chapter } from '../types';

/** Top-down branching flowchart — box or diamond (decision) nodes joined by arrows, each edge optionally labeled ("Yes"/"No"). */
export interface FlowchartNode {
  label: string;
  /** 'box' (default, a statement/action) or 'diamond' (a decision point) */
  shape?: 'box' | 'diamond';
  /** Solid dark accent fill — use on a terminal/outcome node */
  filled?: boolean;
  children?: Array<{ label?: string; to: FlowchartNode }>;
}
export interface FlowchartProps {
  root: FlowchartNode;
  /** Which chapter color (1-13) tints the nodes */
  chapter: Chapter;
}

function Shape({ node, chapter }: { node: FlowchartNode; chapter: Chapter }) {
  const base: CSSProperties = { fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: ch(chapter, 900), textAlign: 'center', lineHeight: 1.35 };
  if (node.shape === 'diamond') {
    // grows with the question so long labels fit inside the diamond
    const size = Math.min(220, Math.max(120, 56 + node.label.length * 3.6));
    return (
      <div style={{ width: size, height: size, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: ch(chapter, 100), border: `1.5px solid ${ch(chapter, 500)}`, transform: 'rotate(45deg) scale(0.72)', borderRadius: 6 }} />
        <div style={{ ...base, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10.3 }}>{node.label}</div>
      </div>
    );
  }
  const box: CSSProperties = { ...base, maxWidth: 250, padding: '8.8px 15.4px', borderRadius: 'var(--radius-md)', background: node.filled ? ch(chapter, 900) : ch(chapter, 100), color: node.filled ? '#fff' : ch(chapter, 900), border: node.filled ? 'none' : `1.5px solid ${ch(chapter, 500)}` };
  return <div style={box}>{node.label}</div>;
}

const LINE = 'var(--ink-300)';

/** Vertical drop with an optional edge label and an arrowhead into the child. */
function Arrow({ label }: { label?: string }) {
  const wrap: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
  const lbl: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '1.8px 0' };
  const seg = (h: number): CSSProperties => ({ width: 2, height: h, background: LINE });
  return (
    <div style={wrap}>
      <div style={seg(10)} />
      {/* unlabeled edges reserve the same height, so sibling branches always line up */}
      <span style={{ ...lbl, visibility: label ? 'visible' : 'hidden' }}>{label || '\u00A0'}</span>
      <div style={seg(8)} />
      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${LINE}`, marginTop: -1.1 }} />
    </div>
  );
}

function FlowNode({ node, chapter }: { node: FlowchartNode; chapter: Chapter }) {
  const col: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
  const kids = node.children ?? [];
  return (
    <div style={col}>
      <Shape node={node} chapter={chapter} />
      {kids.length > 0 && (
        <>
          {/* stem from the parent down to the branching bar */}
          <div style={{ width: 2, height: 16, background: LINE }} />
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {kids.map((edge, i) => (
              <div key={i} style={{ ...col, position: 'relative', padding: '0 var(--space-3)' }}>
                {/* horizontal bar: spans the branch, but starts/ends at its center for the outermost branches */}
                {kids.length > 1 && <div style={{ position: 'absolute', top: 0, height: 2, background: LINE, left: i === 0 ? '50%' : 0, right: i === kids.length - 1 ? '50%' : 0 }} />}
                <Arrow label={edge.label} />
                <FlowNode node={edge.to} chapter={chapter} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Flowchart({ root, chapter }: FlowchartProps) {
  const wrap: CSSProperties = { columnSpan: 'all', display: 'flex', justifyContent: 'center', padding: 'var(--space-4) 0', breakInside: 'avoid' };
  return <div style={wrap}><FlowNode node={root} chapter={chapter} /></div>;
}
