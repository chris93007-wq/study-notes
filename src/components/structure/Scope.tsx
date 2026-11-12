import { Fragment, type CSSProperties, type ReactNode } from 'react';

/**
 * Marks a range of content as outside (or beyond) the exam scope, like a textbook's "CHEMISTRY ONLY … END OF
 * CHEMISTRY ONLY" banners: a slim start band with a filled chip, the content unchanged, and a closing rule.
 * Red is the reserved warning color, and scope is a warning about what is examined. The bands are siblings of the
 * content (not a wrapper box), so the margin layout, margin notes and the fitter keep working inside the range.
 */
export interface ScopeProps {
  /** Band text (default "Extension — not examined"). Keep it to what the syllabus says. */
  label?: string;
  children?: ReactNode;
}

const RULE: CSSProperties = { flex: 1, height: 1, background: 'var(--red-300, #e57373)' };

function Band({ label, end }: { label: string; end?: boolean }) {
  const wrap: CSSProperties = { columnSpan: 'all', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', breakInside: 'avoid', breakAfter: end ? undefined : 'avoid' };
  const chip: CSSProperties = { background: 'var(--red-700)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 10px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' };
  const endText: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--red-700)', whiteSpace: 'nowrap' };
  return (
    <div data-wide data-scope-band style={wrap}>
      {end ? (
        <>
          <span style={RULE} />
          <span style={endText}>End · {label}</span>
        </>
      ) : (
        <>
          <span style={chip}>{label}</span>
          <span style={RULE} />
        </>
      )}
    </div>
  );
}

export function Scope({ label = 'Extension — not examined', children }: ScopeProps) {
  return (
    <Fragment>
      <Band label={label} />
      {children}
      <Band label={label} end />
    </Fragment>
  );
}
