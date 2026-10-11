import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ch, type Chapter } from '../types';
import { trackPending } from '../../document/pending';

/**
 * Any Mermaid diagram — flowcharts that merge or loop, sequence diagrams, state machines, Gantt charts, ER
 * diagrams, mind maps — laid out automatically from text, then themed in the chapter's colors and the system fonts.
 * Use `Flowchart` / `FormulaTree` when a simple top-down tree is enough; reach for this when you need merges,
 * loops, swimlanes or other layouts. Rendered to static SVG, so it prints sharply.
 */
export interface MermaidProps {
  /** Mermaid source, e.g. "flowchart LR\n  A[Score] --> B[Convert] --> C[TURF]" */
  code: string;
  /** Which chapter color (1-13) tints the nodes */
  chapter: Chapter;
  caption?: string;
  /** Max width in px (default: fill the column) */
  maxWidth?: number;
}

/** Resolve a CSS variable to hex/rgb — chapter shades are oklch() relative colors, which Mermaid's color parser can't read. */
const cssVar = (name: string) => {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  if (!/^(rgb|#)/.test(resolved) || !resolved) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!resolved && raw) return raw;
  }
  if (/^rgb/.test(resolved)) return resolved;
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const g = cv.getContext('2d')!; g.fillStyle = resolved || '#000'; g.fillRect(0, 0, 1, 1);
  const [r, gg, b] = g.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${gg}, ${b})`;
};

// Mermaid keeps global config, so renders run one at a time.
let queue: Promise<unknown> = Promise.resolve();

async function renderMermaid(id: string, code: string, chapter: Chapter): Promise<string> {
  const { default: mermaid } = await import('mermaid');
  const run = async () => {
    const c = (step: number) => cssVar(`--chapter-${chapter}-${step}`);
    const body = cssVar('--font-body');
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: body,
      themeVariables: {
        fontFamily: body,
        fontSize: '14.5px',
        background: '#ffffff',
        primaryColor: c(100),
        primaryBorderColor: c(500),
        primaryTextColor: c(900),
        secondaryColor: c(50),
        secondaryBorderColor: c(300),
        secondaryTextColor: c(900),
        tertiaryColor: '#ffffff',
        tertiaryBorderColor: c(300),
        tertiaryTextColor: c(900),
        lineColor: cssVar('--ink-500'),
        textColor: cssVar('--ink-900'),
        mainBkg: c(100),
        nodeBorder: c(500),
        clusterBkg: c(50),
        clusterBorder: c(300),
        edgeLabelBackground: '#ffffff',
        noteBkgColor: c(100),
        noteBorderColor: c(500),
        noteTextColor: c(900),
        actorBkg: c(100),
        actorBorder: c(500),
        actorTextColor: c(900),
        signalColor: cssVar('--ink-700'),
        signalTextColor: cssVar('--ink-900'),
        labelBoxBkgColor: c(100),
        labelBoxBorderColor: c(500),
        labelTextColor: c(900),
        loopTextColor: c(900),
        activationBkgColor: c(200),
        sectionBkgColor: c(100),
        altSectionBkgColor: '#ffffff',
        taskBkgColor: c(300),
        taskBorderColor: c(500),
        taskTextColor: c(900),
        taskTextLightColor: c(900),
        activeTaskBkgColor: c(500),
        activeTaskBorderColor: c(900),
        gridColor: cssVar('--line'),
        doneTaskBkgColor: c(200),
        doneTaskBorderColor: c(500),
      },
    });
    const { svg } = await mermaid.render(id, code);
    return svg;
  };
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

export function Mermaid({ code, chapter, caption, maxWidth }: MermaidProps) {
  const rid = 'mmd' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const live = useRef(true);

  useEffect(() => {
    live.current = true;
    trackPending(
      renderMermaid(rid, code, chapter)
        .then((s) => { if (live.current) { setSvg(s); setError(null); } })
        .catch((e: unknown) => {
          const msg = e instanceof Error ? e.message : String(e);
          // Mermaid leaves a half-rendered error node in <body> on failure
          document.getElementById('d' + rid)?.remove();
          console.error(`Mermaid diagram failed: ${msg.split('\n')[0]}`);
          if (live.current) setError(msg);
        }),
    );
    return () => { live.current = false; };
  }, [code, chapter, rid]);

  const fig: CSSProperties = { margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', breakInside: 'avoid' };
  const box: CSSProperties = { display: 'flex', justifyContent: 'center', maxWidth, width: '100%', alignSelf: 'center' };
  return (
    <figure style={fig}>
      {error ? (
        <pre style={{ margin: 0, padding: 10.3, border: '1.5px solid var(--red-700)', borderRadius: 'var(--radius-md)', color: 'var(--red-900)', background: 'var(--red-50)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', whiteSpace: 'pre-wrap' }}>Mermaid error: {error.split('\n')[0]}</pre>
      ) : (
        <div style={box} dangerouslySetInnerHTML={{ __html: svg ?? '' }} />
      )}
      {caption && <figcaption style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-500)', lineHeight: 'var(--leading-body)' }}>{caption}</figcaption>}
    </figure>
  );
}
