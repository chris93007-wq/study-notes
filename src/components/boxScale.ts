import type { CSSProperties } from 'react';

/** Smallest scale a box may be set to (80%). */
export const MIN_BOX_SCALE = 0.8;

/**
 * Props every scalable box spreads onto its root: the `box-scale` class (see box.css) and, when a `scale` prop is
 * given, the --bs variable that scales type, spacing and stroke thickness together. Default (undefined) = 100%, or the
 * page-wide scale the whitespace fitter sets.
 */
export function boxScale(scale?: number): { className: string; vars: CSSProperties } {
  const s = scale == null ? undefined : Math.min(1, Math.max(MIN_BOX_SCALE, scale));
  return { className: 'box-scale', vars: s == null ? {} : ({ '--bs': s } as CSSProperties) };
}

export const SCALE_DOC = 'Scale this box between 0.8 and 1 (default 1): type, spacing and line thickness shrink together. Use for tight spots; the whitespace fitter does it automatically when a topic barely overflows.';
