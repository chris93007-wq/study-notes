import type { CSSProperties } from 'react';

/**
 * Card density, in the sense of Material's "comfortable / cozy / compact" views: the same card, shrunk as a whole — type
 * (labels, step lines, formulas), spacing, strokes, radii — and laid out again in the room it has, so it fills its
 * column (margin, main or full width) with more content per inch. Only cards (ConceptCard, WorkedExample) have density;
 * running paragraphs and margin notes stay as they are.
 *
 *   comfortable  100%  the default
 *   cozy          90%
 *   compact       80%  the floor
 *
 * Any number from 0.8 to 1 works too (the whitespace fitter uses 95% and 85% as in-between steps).
 */
export type Density = 'comfortable' | 'cozy' | 'compact' | number;

export const DENSITY_VALUES = { comfortable: 1, cozy: 0.9, compact: 0.8 } as const;
export const MIN_DENSITY = 0.8;

export const DENSITY_DOC = 'Card density: "comfortable" (100%, default), "cozy" (90%) or "compact" (80%), or a number from 0.8 to 1. Everything inside the card shrinks together and the card is laid out again for the room it has. Leave it out and the whitespace fitter picks the least density that makes the topic fit.';

export function densityValue(d?: Density): number | undefined {
  if (d == null) return undefined;
  const v = typeof d === 'number' ? d : DENSITY_VALUES[d];
  return Math.min(1, Math.max(MIN_DENSITY, v));
}

/**
 * Style for the card's zoomed inner element. An authored density is a pin; otherwise the page-level density the
 * fitter sets (--d-page) applies. Zoom lives on an inner element so the card's outer margins (the even block gap) don't shrink with it.
 */
export function densityStyle(d?: Density): CSSProperties {
  const v = densityValue(d);
  return { zoom: v == null ? 'var(--d-page, 1)' : v };
}
