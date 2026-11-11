import type { CSSProperties, ReactNode } from 'react';
import { math } from '../math/Tex';
import { useDocument } from '../../document/context';
import { ch, type Chapter } from '../types';

/**
 * One node of a Tree. A plain string is a leaf. `name` is accepted for `label`, and `question` / `source` / `examples`
 * are carried along but not drawn, so a Pyramid-Principle JSON tree ({ name, question, source, children, examples })
 * can be pasted in as it is.
 */
export interface TreeNode {
  /** The node's text; strings may contain $$…$$ math */
  label?: ReactNode;
  name?: string;
  /** Children, in reading order. A plain string is a leaf. */
  children?: Array<TreeNode | string>;
  /** Branch color (1–13). A top-level branch takes its topic's chapter color and everything under it inherits it. */
  chapter?: Chapter;
  /** How this node is drawn. Default: a node with children is a box, a leaf is a bullet. */
  as?: 'box' | 'bullet';
  /** A short italic tag after the label, drawn as "(new)" */
  tag?: string;
  question?: string;
  source?: string;
  examples?: unknown[];
}

export interface TreeProps {
  /** The top of the tree: its children are the branches, drawn left to right */
  root: TreeNode;
  /** Color of the root (default: the document's brand color). Each branch takes its own `chapter`, else the root's. */
  chapter?: Chapter;
  /** Deepest level drawn as boxes (default 3: root, branches, sub-branches). Deeper nodes with children become bullets with nested bullets. */
  boxDepth?: number;
}

const LINE = 'var(--ink-300)';
const STROKE = 2; // the same connector the Flowchart draws
const GAP = 20; // between neighbouring branches

const norm = (n: TreeNode | string): TreeNode => (typeof n === 'string' ? { label: n } : n);

function Label({ node }: { node: TreeNode }) {
  const text = node.label ?? node.name ?? '';
  return (
    <>
      {typeof text === 'string' ? math(text) : text}
      {node.tag && <em style={{ marginLeft: '0.3em', color: 'var(--ink-500)', fontStyle: 'italic', fontWeight: 400 }}>({node.tag})</em>}
    </>
  );
}

/** The bullets (and sub-boxes) under a box: a node with children of its own is a smaller box, a leaf is a dot and a line of text. */
function Items({ items, color, depth, boxDepth }: { items: Array<TreeNode | string>; color: Chapter; depth: number; boxDepth: number }) {
  const list: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', margin: 0, padding: 0, listStyle: 'none' };
  return (
    <ul style={list}>
      {items.map((raw, i) => <Item key={i} node={norm(raw)} color={color} depth={depth} boxDepth={boxDepth} />)}
    </ul>
  );
}

function Item({ node, color: inherited, depth, boxDepth }: { node: TreeNode; color: Chapter; depth: number; boxDepth: number }) {
  const color = node.chapter ?? inherited; // a sub-branch that is a topic of its own brings its color
  const kids = node.children ?? [];
  const asBox = node.as ? node.as === 'box' : kids.length > 0 && depth <= boxDepth;
  const text: CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-body)', color: 'var(--ink-900)', minWidth: 0 };
  if (asBox) {
    const sub: CSSProperties = { alignSelf: 'flex-start', maxWidth: '100%', padding: 'var(--space-1) var(--space-3)', border: `1px solid ${ch(color, 300)}`, borderRadius: 'var(--radius-sm)', background: ch(color, 50), color: ch(color, 900), fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-tight)' };
    return (
      <li style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={sub}><Label node={node} /></div>
        {kids.length > 0 && <div style={{ paddingLeft: 'var(--space-3)' }}><Items items={kids} color={color} depth={depth + 1} boxDepth={boxDepth} /></div>}
      </li>
    );
  }
  const dot: CSSProperties = { width: 6, height: 6, borderRadius: '50%', background: ch(color, depth > 2 ? 300 : 500), flexShrink: 0, marginTop: 7.5 };
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
      <span style={dot} />
      <span style={text}>
        <Label node={node} />
        {kids.length > 0 && <span style={{ display: 'block', marginTop: 'var(--space-2)' }}><Items items={kids} color={color} depth={depth + 1} boxDepth={boxDepth} /></span>}
      </span>
    </li>
  );
}

/**
 * A content tree that mixes shapes with bulleted lists: the root and each branch are boxes joined by hairline connectors,
 * and what hangs under a branch is a bulleted list. A node that has children of its own (a sub-branch) is a smaller box
 * with its own bullets; a leaf is a bullet. Use it for a Topic Map built from a Pyramid-Principle tree, or any hierarchy
 * (issue tree, framework, taxonomy) of about 3–5 branches. A branch takes its topic's chapter color.
 */
export function Tree({ root, chapter, boxDepth = 3 }: TreeProps) {
  const doc = useDocument();
  const top = norm(root);
  const rootColor = top.chapter ?? chapter ?? doc?.meta.brandChapter ?? 1;
  const branches = (top.children ?? []).map(norm);
  const n = branches.length;

  const wrap: CSSProperties = { columnSpan: 'all', display: 'flex', flexDirection: 'column', alignItems: 'stretch', breakInside: 'avoid', fontFamily: 'var(--font-body)' };
  const rootBox: CSSProperties = { alignSelf: 'center', maxWidth: '70%', padding: 'var(--space-3) var(--space-7)', borderRadius: 'var(--radius-md)', background: ch(rootColor, 900), color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-tight)', textAlign: 'center' };
  const head = (color: Chapter): CSSProperties => ({ alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', border: `1.5px solid ${ch(color, 500)}`, background: ch(color, 100), color: ch(color, 900), fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-base)', lineHeight: 'var(--leading-tight)', textAlign: 'center' });

  return (
    <div data-wide data-tree style={wrap}>
      <div style={rootBox}><Label node={top} /></div>
      {n > 0 && <div style={{ width: STROKE, height: 16, background: LINE, alignSelf: 'center' }} />}
      {n > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: 'auto auto auto', alignItems: 'start' }}>
          {branches.map((b, i) => {
            const color = b.chapter ?? rootColor;
            const kids = b.children ?? [];
            return (
              <div key={i} style={{ position: 'relative', minWidth: 0, padding: `0 ${GAP / 2}px`, display: 'grid', gridTemplateRows: 'subgrid' /* stub, head and list rows shared: equal heads, level lists */, gridRow: 'span 3', alignItems: 'start' }}>
                {/* the bar joining the branches: it starts or ends at the centre of the outermost ones */}
                {n > 1 && <div style={{ position: 'absolute', top: 0, height: STROKE, background: LINE, left: i === 0 ? '50%' : 0, right: i === n - 1 ? '50%' : 0 }} />}
                <div style={{ width: STROKE, height: 18, background: LINE, justifySelf: 'center' }} />
                <div style={head(color)}><Label node={b} /></div>
                {kids.length > 0 ? <div style={{ marginTop: 'var(--space-4)', padding: '0 var(--space-1)' }}><Items items={kids} color={color} depth={2} boxDepth={boxDepth} /></div> : <span />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
