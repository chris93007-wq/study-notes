import type { CSSProperties, ReactNode } from 'react';
import {
  Callout, Chain, ChapterHeader, ComparisonTable, ConceptCard, ContentsPage, CoverPage, FlashcardGrid, Flowchart,
  FormulaTree, Image, KeyTermsTable, Matrix, NotesDocument, Page, PageBadge, PageFooter, Section, SectionTitle,
  ProcessMap, Split, StepPipeline, Tex, TopicHeader, WorkedExample, type Chapter,
} from '@notes';

/**
 * The design system as a printable spec — the Claude Design "Design System" tab (guidelines/ + component
 * cards), one specimen per card, grouped the same way.
 */

function Specimen({ name, subtitle, children }: { name: string; subtitle?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24.2 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8.8, marginBottom: 8.8, borderBottom: '1px solid var(--line)', paddingBottom: 5.2, breakAfter: 'avoid' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>{name}</span>
        {subtitle && <span style={{ fontSize: 10.3, color: 'var(--ink-500)' }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

const H = ({ children }: { children: ReactNode }) => <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24.2, margin: '0 0 17.3px' }}>{children}</h1>;
const mono: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-700)' };

const hues: Array<[string, Chapter | '']> = [
  ['red', ''], ['pink', 4], ['purple', 10], ['deep-purple', 6], ['indigo', 1], ['blue', 13], ['light-blue', 8], ['cyan', 11], ['teal', 3],
  ['green', ''], ['light-green', 12], ['lime', 5], ['yellow', ''], ['amber', 7], ['orange', 2], ['deep-orange', 9], ['brown', ''], ['grey', ''], ['blue-grey', ''],
];
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

function Palette() {
  const row: CSSProperties = { display: 'grid', gridTemplateColumns: `24px 90px repeat(${steps.length}, 1fr)`, gap: 1.8, alignItems: 'center', marginBottom: 1.8 };
  return (
    <div style={{ ...mono, fontSize: 8.6 }}>
      <div style={{ ...row, marginBottom: 3.3 }}><span /><span />{steps.map((s) => <span key={s} style={{ textAlign: 'center' }}>{s}</span>)}</div>
      {hues.map(([n, c]) => (
        <div key={n} style={row}>
          <span style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{c}</span>
          <span>{n}</span>
          {steps.map((s) => <div key={s} style={{ height: 22, background: `var(--${n}-${s})` }} />)}
        </div>
      ))}
    </div>
  );
}

const swatch = (bg: string, label: string, dark = false): ReactNode => (
  <div style={{ flex: 1, background: bg, display: 'flex', alignItems: 'flex-end', padding: 5.2, color: dark ? 'var(--ink-900)' : '#fff', border: dark ? '1px solid var(--line)' : undefined }}>{label}</div>
);

function MiniPage({ w, h, cols, label }: { w: number; h: number; cols: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3.3, alignItems: 'center' }}>
      <div style={{ width: w, height: h, border: '2px solid var(--chapter-1-500)', borderRadius: 3, display: 'flex', padding: 4.4, gap: 2.6 }}>
        {Array.from({ length: cols }, (_, i) => <div key={i} style={{ flex: 1, background: 'var(--chapter-1-100)' }} />)}
      </div>
      <span style={{ ...mono, fontSize: 8.6, color: 'var(--ink-500)' }}>{label}</span>
    </div>
  );
}

const bar = (span: number | string, key: number, c = 1) => <div key={key} style={{ gridColumn: typeof span === 'number' ? `span ${span}` : span, height: 16, background: `var(--chapter-${c}-100)`, borderRadius: 4 }} />;

export default function DesignSystem() {
  return (
    <NotesDocument meta={{ title: "Christine's Notes", subtitle: 'Design System — tokens, type, layout & components', course: 'ADHD-friendly study notes', week: 'Spec', footerLabel: "Christine's Notes · Design System", brandChapter: 1 }}>
      <CoverPage title={"Christine's Notes\nDesign System"} credit={['Bright, pastel, printable', 'Material palette · Merriweather / Lexend / Fira Code']} dots={[3, 8, 11, 5]} />
      <ContentsPage />

      {/* Colors */}
      <Page badge="Colors" toc={{ title: 'Colors', chapter: 1 }}>
        <H>Colors</H>
        <Specimen name="Palette" subtitle="Full Material-UI system, 50–900. Numbers mark the 13 chapter hues; red / yellow / green are reserved.">
          <Palette />
        </Specimen>
        <Specimen name="Neutrals & Paper" subtitle="Ink scale (black-based), paper tones, border line">
          <div style={{ display: 'flex', height: 80, ...mono }}>
            {swatch('var(--ink-900)', 'ink-900')}{swatch('var(--ink-700)', 'ink-700')}{swatch('var(--ink-500)', 'ink-500')}
            {swatch('var(--ink-300)', 'ink-300', true)}{swatch('var(--paper-100)', 'paper-100', true)}{swatch('var(--paper-0)', 'paper-0', true)}{swatch('var(--line)', 'line', true)}
          </div>
        </Specimen>
        <Specimen name="Pairing Rule" subtitle="Every chapter color: pastel -100 fill with dark -900 ink — never an alpha-muted tint">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 3.3 }}>
            {Array.from({ length: 13 }, (_, i) => (
              <div key={i} style={{ background: `var(--chapter-${i + 1}-100)`, color: `var(--chapter-${i + 1}-900)`, borderTop: `4px solid var(--chapter-${i + 1}-500)`, borderRadius: 6, padding: '6.9px 0', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11.2 }}>{i + 1}</div>
            ))}
          </div>
        </Specimen>
      </Page>

      {/* Type */}
      <Page badge="Type" toc={{ title: 'Type', chapter: 13 }}>
        <H>Type</H>
        <Specimen name="Display — Merriweather" subtitle="Chapter & topic titles, pill labels">
          <div style={{ fontFamily: 'var(--font-display)', display: 'flex', flexDirection: 'column', gap: 5.2 }}>
            <div style={{ fontSize: 34.5, fontWeight: 600, lineHeight: 1.2 }}>Preference Measurement</div>
            <div style={{ fontSize: 22.4, fontWeight: 600, color: 'var(--chapter-5-500)' }}>MaxDiff & TURF</div>
            <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--ink-700)' }}>Conjoint Analysis · Fundamentals</div>
          </div>
        </Specimen>
        <Specimen name="Body — Lexend" subtitle="Paragraph text at three weights, 1.65 line height">
          <div style={{ fontSize: 14.6, lineHeight: 1.65 }}>
            <p style={{ marginBottom: 5.2 }}>Both tools exist because direct questions fail — stated preferences cost the respondent nothing, so people ask for everything.</p>
            <p style={{ marginBottom: 5.2, fontWeight: 600 }}>Forcing a real trade-off and observing the choice is what reveals true value.</p>
            <p style={{ fontWeight: 700, color: 'var(--ink-700)' }}>Conjoint = Consider + Jointly</p>
          </div>
        </Specimen>
        <Specimen name="Mono — Fira Code" subtitle="Formulas in words, page numbers, data values">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.8, display: 'flex', flexDirection: 'column', gap: 6.9 }}>
            <div>U_profile = β0 + β1x1 + β2x2 + ... + βkxk + ε</div>
            <div style={{ color: 'var(--ink-500)' }}>Preference Measurement &nbsp;5 / 17</div>
          </div>
        </Specimen>
        <Specimen name="Math — KaTeX" subtitle="Real formulas, bundled locally — used in ConceptCard and the Formula Sheet">
          <Tex tex={"WTP = \\dfrac{\\text{attribute's utility}}{\\text{utils per dollar}}"} style={{ fontSize: 19 }} />
        </Specimen>
        <Specimen name="Type Scale" subtitle="xs through 3xl, each set in the font it's used in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3.3, lineHeight: 1.3 }}>
            <div style={{ fontSize: 'var(--text-xs)' }}>xs · 8.8pt · Lexend — fine print, pill labels</div>
            <div style={{ fontSize: 'var(--text-sm)' }}>sm · 9.9pt · Lexend — table cells, captions</div>
            <div style={{ fontSize: 'var(--text-base)' }}>base · 11pt (body) · Lexend — paragraph body</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>lg · 13.2pt · Merriweather — subtitles</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600 }}>xl · 16.5pt · Merriweather — card headings</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>2xl · 22pt · Merriweather — topic titles</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600 }}>3xl · 28.6pt · Merriweather — chapter titles</div>
          </div>
        </Specimen>
      </Page>

      {/* Spacing, radius, shadow, brand */}
      <Page badge="Foundations" toc={{ title: 'Spacing, Shape & Brand', chapter: 3 }}>
        <H>Spacing, Shape & Brand</H>
        <Specimen name="Spacing Scale" subtitle="4px base grid, space-1 through space-10">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4.4, ...mono }}>
            {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((px, i) => (
              <div key={px} style={{ display: 'flex', alignItems: 'center', gap: 6.9 }}><div style={{ width: px, height: 12, background: 'var(--chapter-5-500)' }} /><span>space-{i + 1} · {px}px</span></div>
            ))}
          </div>
        </Specimen>
        <Specimen name="Spacing In Use" subtitle="Breathing room is the ADHD-friendly choice">
          <div style={{ background: 'var(--chapter-1-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', color: 'var(--chapter-1-900)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11.2, letterSpacing: '0.06em' }}>space-6 padding, space-3 internal gap</div>
            <div style={{ fontSize: 13, lineHeight: 1.65 }}>Boxes never crowd their text — padding is always space-5 or space-6, line height is always 1.65, so dense topics stay easy to scan.</div>
          </div>
        </Specimen>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20.9 }}>
          <Specimen name="Corner Radii" subtitle="Rounded, never sharp">
            <div style={{ display: 'flex', gap: 10.3, ...mono }}>
              {([['sm · 8px', 'sm', 1], ['md · 14px', 'md', 11], ['lg · 13.2pt', 'lg', 5], ['pill', 'pill', 3]] as const).map(([l, r, c]) => (
                <div key={r}><div style={{ width: 60, height: 60, background: `var(--chapter-${c}-100)`, borderRadius: `var(--radius-${r})` }} /><div style={{ marginTop: 3.3 }}>{l}</div></div>
              ))}
            </div>
          </Specimen>
          <Specimen name="Shadow Elevation" subtitle="Soft, ink-tinted">
            <div style={{ display: 'flex', gap: 13.8, padding: 12.1, background: 'var(--paper-100)', ...mono }}>
              {['sm', 'card', 'md'].map((s) => <div key={s} style={{ flex: 1, height: 60, background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: `var(--shadow-${s})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>shadow-{s}</div>)}
            </div>
          </Specimen>
        </div>
        <Specimen name="Text Badges (No Icon Set)" subtitle='Iconography is bold all-caps text — never a drawn icon or emoji. class="badge ch-N"'>
          <div style={{ display: 'flex', gap: 6.9, flexWrap: 'wrap' }}>
            <span className="badge ch-1">Key Insight</span><span className="badge ch-11">Notes</span><span className="badge ch-5">Memory Aid</span><span className="badge ch-3">Worked Example</span><span className="badge ch-8">Best Use Case</span>
          </div>
        </Specimen>
        <Specimen name="Highlighter Marks" subtitle="<mark> yellow highlight, <strong> bold, .trap bold red, .tip bold green — never a border or underline">
          <p style={{ fontSize: 13.8, lineHeight: 1.65 }}>
            Net choice score = Most% − Least%, <mark>counted over every appearance</mark> — not just the times it was selected. <strong>Always check the denominator first.</strong>{' '}
            <strong className="trap">Trap: don’t divide by selections only.</strong> <strong className="tip">Tip: count every appearance.</strong>
          </p>
        </Specimen>
        <Specimen name="Page Footer Specimen" subtitle="Breadcrumb left, mono page count right, thin top line — printed on every sheet">
          <PageFooter chapterLabel="Preference Measurement" page={5} totalPages={17} />
        </Specimen>
      </Page>

      {/* Layout */}
      <Page badge="Layout" toc={{ title: 'Layout', chapter: 8 }}>
        <H>Layout</H>
        <Specimen name="Grid & Breakpoints" subtitle="Material-style 4/8/12-column grid — on paper, notes use the 12-column Expanded grid">
          <ComparisonTable chapter={1} columns={[{ key: 'b', label: 'Breakpoint' }, { key: 'c', label: 'Columns' }, { key: 'm', label: 'Margin' }, { key: 'g', label: 'Gutter' }]} rows={[
            { b: 'Compact', c: '4', m: '16px', g: '16px' },
            { b: 'Medium', c: '8', m: '32px', g: '24px' },
            { b: 'Expanded (print)', c: '12', m: '0.5in', g: '24px' },
          ]} />
        </Specimen>
        <Specimen name="Page Columns & Orientation" subtitle="US Letter, 0.5in margins all round — 8.5 × 11in portrait, 11 × 8.5in landscape">
          <div style={{ display: 'flex', gap: 13.8, alignItems: 'flex-end', marginBottom: 8.8 }}>
            <MiniPage w={60} h={80} cols={1} label="1 col · portrait" />
            <MiniPage w={60} h={80} cols={2} label="2 col · portrait" />
            <MiniPage w={78} h={60} cols={3} label="3 col · landscape" />
            <MiniPage w={78} h={60} cols={4} label="4 col · landscape" />
          </div>
          <div style={{ fontSize: 11.2, lineHeight: 1.6, color: 'var(--ink-700)' }}>
            <div style={{ marginBottom: 3.3 }}><strong>Portrait (default):</strong> 1 column for prose/callouts; 2 columns once content is short, scannable blocks (definitions, tables, flashcards).</div>
            <div><strong>Landscape:</strong> reflow to 3-4 columns to use the extra width — cheat sheets, comparison tables, dense reference pages (Appendix).</div>
          </div>
        </Specimen>
        <Specimen name="Mixed Rows" subtitle="Full-width rows alternate with rows split into 2-4 columns — <Grid> + <Span cols>">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6.9 }}>
            {[bar('1 / -1', 0), bar(6, 1), bar(6, 2), bar(4, 3), bar(4, 4), bar(4, 5), bar('1 / -1', 6)]}
          </div>
        </Specimen>
        <Specimen name="Inside Cards & Sections" subtitle="The same column logic one level down — a card or Section body can split too">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5.2 }}>
            <div style={{ border: '1.5px solid var(--chapter-4-500)', borderRadius: 6, padding: 6.9, display: 'flex', flexDirection: 'column', gap: 3.3 }}><div style={{ height: 6, width: '30%', background: 'var(--chapter-4-500)', borderRadius: 2 }} /><div style={{ height: 16, background: 'var(--chapter-4-100)', borderRadius: 3 }} /></div>
            <div style={{ display: 'flex', gap: 10.3 }}>
              <div style={{ flex: 1, border: '1.5px solid var(--chapter-4-500)', borderRadius: 6, padding: 6.9, display: 'flex', flexDirection: 'column', gap: 3.3 }}><div style={{ height: 6, width: '40%', background: 'var(--chapter-4-500)', borderRadius: 2 }} /><div style={{ height: 16, background: 'var(--chapter-4-100)', borderRadius: 3 }} /></div>
              <div style={{ flex: 1, border: '1.5px solid var(--chapter-4-500)', borderRadius: 6, padding: 6.9, display: 'flex', flexDirection: 'column', gap: 5.2 }}>
                <div style={{ height: 6, width: '40%', background: 'var(--chapter-4-500)', borderRadius: 2 }} />
                <div style={{ height: 16, background: 'var(--chapter-4-100)', borderRadius: 3 }} />
                <div style={{ display: 'flex', gap: 5.2 }}><div style={{ flex: 1, height: 16, background: 'var(--chapter-4-100)', borderRadius: 3 }} /><div style={{ flex: 1, height: 16, background: 'var(--chapter-4-100)', borderRadius: 3 }} /></div>
              </div>
            </div>
          </div>
        </Specimen>
        <Specimen name="Printable Always" subtitle="Rule">
          <p style={{ fontSize: 12.1, lineHeight: 1.6, color: 'var(--ink-700)' }}>Every element must print: nothing hidden, collapsed, hover-only or in a tooltip. Quiz answers are printed in a muted strip right under each question.</p>
        </Specimen>
      </Page>

      {/* Components */}
      <Page badge="Components" toc={{ title: 'Components — Structure & Callouts', chapter: 2 }}>
        <H>Components</H>
        <Specimen name="Chapter Title" subtitle="ChapterHeader — week badge + label on one row, display title, subtitle">
          <ChapterHeader chapterNumber={1} week="Week 3" chapter="Overview" title="1. Preference Measurement" subtitle="MaxDiff, TURF & Conjoint Analysis" />
        </Specimen>
        <Specimen name="Page Badge & Topic Header" subtitle="PageBadge on every content page except the cover; TopicHeader divides a chapter">
          <PageBadge label="Notes Page" />
          <TopicHeader topicNumber={2} title="MaxDiff (Best-Worst Scaling)" kicker="Concept, design rules, worked example, key terms" />
        </Specimen>
        <Specimen name="Section" subtitle="SectionTitle + content, consistently spaced">
          <Section chapter={13} title="Introduction">
            <p style={{ fontSize: 12.1, lineHeight: 1.6 }}>One concept this time: the overall score for one specific product configuration.</p>
          </Section>
          <SectionTitle chapter={2}>Section Title alone</SectionTitle>
        </Specimen>
        <Specimen name="Callout" subtitle="Only three kinds: Key Insight, Notes, Memory Aid — colored by the chapter they sit in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10.3 }}>
            <Callout chapter={1} label="KEY INSIGHT">Two tools, one agenda: MaxDiff answers “what matters most”; Conjoint answers “how much, in dollars.”</Callout>
            <Callout chapter={11} label="NOTES">Quiz 2 is rescoped to CBC interpretation only — see Week 4 Pre-Class Notes for the official scope.</Callout>
            <Callout chapter={5} label="MEMORY AID">“Most minus Least, over every appearance” — never divide by selections only.</Callout>
          </div>
        </Specimen>
      </Page>

      <Page badge="Components" toc={{ title: 'Components — Concepts', chapter: 6 }}>
        <Specimen name="Concept Card" subtitle="Definition, KaTeX formula, breakdown diagram, and the why">
          <ConceptCard
            chapter={1}
            term="Willingness to Pay (WTP)"
            definition="The dollar amount a consumer's trade-offs say they'd pay for one upgrade. Comes from the model, not asked directly."
            formulas={["WTP = \\dfrac{\\text{attribute's utility}}{\\text{utils per dollar}}", 'WTP_i = \\dfrac{u_i}{\\beta_{price}}']}
            breakdown={{ value: '$5,892', label: 'Willingness to Pay', filled: true, op: '×', children: [
              { value: '11.85 utils', label: "Attribute's Utility" },
              { value: '$497/util', label: '$ Per Util Rate', tint: true, op: '÷', children: [{ value: '$30,000', label: 'Price Range' }, { value: '60.34 utils', label: 'Utility Range' }] },
            ] }}
            why={<>Price is the only attribute measured in <mark>real dollars</mark>. β_price converts a dollar into utils, so dividing by it undoes that conversion — turning utils back into dollars.</>}
          />
        </Specimen>
        <Specimen name="Flashcards" subtitle="Mini definition / formula-in-words / why — for the Topic Map">
          <FlashcardGrid cards={[
            { title: 'MaxDiff', definition: 'Repeatedly pick the Most and Least important item from a small set.', formula: 'Net score = Most% − Least%, over every appearance.', why: 'Forces a real trade-off instead of a rating everyone inflates.' },
            { title: 'TURF', definition: 'Finds the bundle that reaches the most people under a budget.', formula: 'Reach = share covered by at least one item in the bundle.', why: 'Only new reach counts — overlapping coverage adds nothing.' },
          ]} />
        </Specimen>
      </Page>

      <Page badge="Components" toc={{ title: 'Components — Worked Example', chapter: 11 }}>
        <Specimen name="Worked Example" subtitle="Badge + title, setup with context figure, data table, show-the-work steps, highlighted answer, so-what">
          <WorkedExample
            chapter={11}
            title="Handheld GPS Device"
            setup="Four binary attributes — Accuracy (5ft vs. 50ft), Battery (32hr vs. 12hr), Display (3D vs. 2D), Price ($150 vs. $250). All 16 profiles shown; each rated 1–100."
            context={<div style={{ width: 110, height: 44, borderRadius: 6, background: 'var(--chapter-11-100)', border: '1.5px solid var(--chapter-11-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--chapter-11-900)' }}>2⁴ = 16 profiles</div>}
            table={{ columns: ['Variable', 'Partworth (β)'], rows: [['Intercept', '2.7'], ['5ft vs. 50ft (Accuracy)', '9.6'], ['32hr vs. 12hr (Battery)', '30.4'], ['3D vs. 2D (Display)', '14.9'], ['$150 vs. $250 (Price)', '40.6']] }}
            steps={[{ label: 'Compare swings', lines: ['Price: 40.6 (largest)', 'Battery: 30.4', 'Display: 14.9', 'Accuracy: 9.6'] }]}
            answer={{ value: '40.6', label: 'Price Partworth — Largest Swing' }}
            soWhat="Price drives choice more than any single feature upgrade — a $100 discount beats any one improvement."
          />
        </Specimen>
      </Page>

      <Page badge="Components" toc={{ title: 'Components — Diagrams', chapter: 4 }}>
        <Specimen name="Formula Tree" subtitle="Recursive calculation breakdown">
          <FormulaTree chapter={1} root={{ value: '$5,892', label: 'Willingness to Pay', filled: true, op: '×', children: [
            { value: '11.85 utils', label: "Attribute's Utility" },
            { value: '$497/util', label: '$ Per Util Rate', tint: true, op: '÷', children: [{ value: '$30,000', label: 'Price Range' }, { value: '60.34 utils', label: 'Utility Range' }] },
          ] }} />
        </Specimen>
        <Specimen name="Chain" subtitle="Inline sequence or equivalence">
          <Chain chapter={5} items={['Conjoint', 'Consider', 'Jointly']} connector="→" />
        </Specimen>
        <Specimen name="Split" subtitle="Two-sided comparison, centered headers, dotted bullets">
          <Split
            left={{ title: 'Stated Preference', chapter: 11, items: ['“What do you want?”', 'Costs the respondent nothing', 'Everyone asks for everything'] }}
            right={{ title: 'Revealed Preference', chapter: 5, items: ['Forced trade-off choice', 'Reveals true value', 'What MaxDiff & Conjoint measure'] }}
          />
        </Specimen>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20.9 }}>
          <Specimen name="Matrix" subtitle="Row × column framework">
            <Matrix chapter={5} rowLabels={['MaxDiff', 'Conjoint', 'TURF']} colLabels={['Ranks', '$ value', 'Bundle']} cells={[['✓', '–', '–'], ['–', '✓', '–'], ['–', '–', '✓']]} />
          </Specimen>
          <Specimen name="Flowchart" subtitle="Branching decision tree">
            <Flowchart chapter={1} root={{ label: 'Need a ranking or a $ value?', shape: 'diamond', children: [{ label: 'Ranking', to: { label: 'Use MaxDiff', filled: true } }, { label: '$ Value', to: { label: 'Use Conjoint', filled: true } }] }} />
          </Specimen>
        </div>
      </Page>

      <Page badge="Components" toc={{ title: 'Components — Flow, Tables & Media', chapter: 9 }}>
        <Specimen name="Step Pipeline" subtitle="Numbered process flow; number and title on one line">
          <StepPipeline chapter={4} steps={[
            { label: 'Score & rank', body: 'Run a MaxDiff study to score the full item list' },
            { label: 'Convert to binary', body: 'Turn scores into top-choice binary data' },
            { label: 'Optimal bundle', body: 'Run TURF to find the widest-reach mix' },
          ]} />
        </Specimen>
        <Specimen name="Process Map" subtitle="ProcessMap — cards in a grid whose rows and columns flex to the room; flow='arrows' numbers them and points to the next. A Topic Map is the same map of a packet's topics, on a page of its own">
          <ProcessMap flow="arrows" chapter={4} nodes={[
            { title: 'Net income', definition: 'What is left for owners after every expense, interest and tax.' },
            { title: 'Add back taxes', definition: 'Taxes depend on jurisdiction, not operations.', formula: 'EBT = Net income + Taxes' },
            { title: 'Add back interest', definition: 'Interest reflects financing, not operations.', formula: 'EBIT = EBT + Interest' },
            { title: 'Add back D&A', definition: 'Non-cash charges spread over time.', formula: 'EBITDA = EBIT + D&A' },
          ]} />
        </Specimen>
        <Specimen name="Tables" subtitle="KeyTermsTable + ComparisonTable — chapter header, lighter alternate rows, visible column lines">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13.8 }}>
            <KeyTermsTable chapter={1} terms={[
              { term: 'MaxDiff', explanation: 'Repeatedly pick the most/least-important item from a small set', why: 'Forces a real trade-off', example: '4 card perks, several rounds' },
              { term: 'Net choice score', explanation: 'Most% − Least%, over every appearance', why: 'Ranks by revealed preference', example: 'Groceries: 50.3% − 6.5%' },
            ]} />
            <ComparisonTable chapter={3} columns={[{ key: 'bundle', label: 'Bundle' }, { key: 'perks', label: 'Four Perks' }, { key: 'cost', label: 'Cost/Year' }, { key: 'reach', label: 'Reach' }]} rows={[
              { bundle: 'A', perks: 'Groceries, gas/EV, intro APR, foreign fees', cost: '$70', reach: '87%' },
              { bundle: 'B', perks: 'Groceries, intro APR, foreign fees, fraud alerts', cost: '$59', reach: '80%' },
            ]} />
          </div>
        </Specimen>
        <Specimen name="Image" subtitle="Frame + caption, chapter-tinted placeholder until a src is given">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13.8 }}>
            <Image chapter={4} ratio="16/9" alt="Conjoint profile card" caption="Fig. 1 — A full product profile shown to respondents." />
            <Image chapter={11} ratio="16/9" alt="TURF bundle diagram" caption="Fig. 2 — Reach overlap across three candidate bundles." />
          </div>
        </Specimen>
      </Page>
    </NotesDocument>
  );
}
