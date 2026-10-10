import {
  Callout, Chain, CheatSheetPage, Columns, ComparisonTable, ConceptCard, ContentsPage, CoverPage,
  FormulaSheetPage, Flowchart, Full, GlossaryPage, Image, KeyTermsTable, Matrix, NotesDocument, NotesPage, QuizPage,
  Section, SectionTitle, Split, Stack, StepPipeline, TopicHeader, TopicMapPage, WorkedExample, type Chapter,
} from '@notes';

/**
 * Week 3 — Preference Measurement (MKT 282). Content from Christine's Week 3 class notes, as excerpted in the
 * Claude Design handoff (project/ui_kits/study-notes).
 *
 * One chapter color per topic, used everywhere that topic appears (Contents badge, flashcard, notes page,
 * cheat-sheet column, formula-sheet band).
 */
const C = {
  overview: 1,
  maxdiff: 7,
  turf: 11,
  pipeline: 4,
  conjoint: 13,
  cheat: 9,
  formulas: 5,
  practice: 10,
  glossary: 6,
} satisfies Record<string, Chapter>;

export default function Week03() {
  return (
    <NotesDocument
      meta={{
        title: 'Preference Measurement',
        subtitle: 'MaxDiff, TURF & Conjoint Analysis',
        course: 'MKT 282 · Marketing Analytics',
        week: 'Week 3',
        author: 'Christine John',
        brandChapter: 1,
      }}
    >
      <CoverPage title={'Preference\nMeasurement'} dots={[C.maxdiff, C.turf, C.pipeline, C.conjoint]} />

      <ContentsPage />

      {/* ───────────── Topic Map ───────────── */}
      <TopicMapPage
        toc={{ title: 'Topic Map (Overview)', chapter: C.overview }}
        subtitle="Measuring & quantifying consumer preferences · Conjoint = Consider + Jointly"
        cards={[
          { title: 'MaxDiff', chapter: C.maxdiff, definition: 'Repeatedly pick the Most and Least important item from a small set.', formula: 'Net score = Most% − Least%, over every appearance.', why: 'Forces a real trade-off instead of a rating everyone inflates.' },
          { title: 'TURF', chapter: C.turf, definition: 'Finds the bundle that reaches the most people under a budget.', formula: 'Reach = share covered by at least one item in the bundle.', why: 'Only new reach counts — overlapping coverage adds nothing.' },
          { title: 'The Pipeline', chapter: C.pipeline, definition: 'Score and rank with MaxDiff, then run TURF for the optimal bundle.', why: 'Each tool answers a different question; chaining them answers both.' },
          { title: 'Conjoint Analysis', chapter: C.conjoint, definition: 'Turns trade-off choices into willingness-to-pay, in real dollars.', formula: 'WTP = attribute’s utility ÷ utils per dollar.', why: 'Price is the only attribute in real dollars, so dividing by it converts utils back to dollars.' },
        ]}
      >
        <Full style={{ margin: '6.9px 0 0' }}>
          <SectionTitle chapter={C.overview}>Introduction</SectionTitle>
        </Full>
        <Full><p className="prose">
          Both tools exist because direct questions fail — stated preferences (“what do you want?”) and stated importance ratings (“rate this 1–9”) both cost the respondent nothing, so people either ask for everything or rate everything as important.{' '}
          <mark>Forcing a real trade-off and observing the choice is what reveals true value.</mark>
        </p></Full>

        <Callout chapter={C.overview} label="KEY INSIGHT">
            Two tools, one agenda: MaxDiff answers “what matters most” (a ranking); Conjoint Analysis answers “how much does it matter, in dollars” (willingness-to-pay).
        </Callout>
        <Callout chapter={C.overview} label="NOTES">
            Quiz 2 moved to Session 4, rescoped to CBC interpretation only — the MaxDiff/TURF/ratings-conjoint material in this packet is still core course content.
        </Callout>
      </TopicMapPage>

      {/* ───────────── Topic 2 · MaxDiff ───────────── */}
      <NotesPage columns={1} toc={{ title: 'MaxDiff (Best-Worst Scaling)', chapter: C.maxdiff }}>
        <TopicHeader topicNumber={2} title="MaxDiff (Best-Worst Scaling)" kicker="Concept, design rules, the Pecan Street Bank scoring walkthrough, key terms" />
        <div style={{ height: 16 }} />
        <p>
          Respondents see a small set of items (4–5 typical) and pick the ONE they like most and the ONE they like least — items in the middle stay unranked for that question; repetition across questions, with different item pairings, is what produces a full ranking.
        </p>
        <Columns count={2}>
          <Stack gap={12}>
            <span className={`badge ch-${C.maxdiff}`}>Best use case</span>
            <p className="prose-sm">8–30 features/benefits/ideas where you need to know which ones matter most, without rating-scale bias.</p>
          </Stack>
          <Callout chapter={C.maxdiff} label="MEMORY AID">“Most minus Least, over every appearance” — never divide by selections only.</Callout>
        </Columns>

        <Section chapter={C.maxdiff} title="Why not just ask?">
          <Split
            left={{ title: 'Stated Preference', chapter: C.maxdiff, items: ['“What do you want?”', 'Costs the respondent nothing', 'Everyone asks for everything'] }}
            right={{ title: 'Revealed Preference', chapter: C.maxdiff, items: ['Forced trade-off choice', 'Reveals true value', 'What MaxDiff & Conjoint measure'] }}
          />
        </Section>

        <Section chapter={C.maxdiff} title="Common Mistake">
          <p className="prose-sm">
            The denominator trap: if an item appeared 3 times and was picked Most twice, <strong className="trap">the rate is 2 ÷ 3 = 66.7% — not 2 ÷ 2</strong>. “Neither selected” still counts as an appearance. <strong className="tip">Tip: always count every appearance.</strong>
          </p>
        </Section>

        <ConceptCard
          chapter={C.maxdiff}
          term="Net Choice Score"
          definition="How much more often an item is picked as Most important than as Least important, across every time it was shown."
          formulas={['\\text{Net} = \\dfrac{\\text{times Most}}{\\text{appearances}} - \\dfrac{\\text{times Least}}{\\text{appearances}}']}
          breakdown={{
            value: '+43.8pp', label: 'Net Choice Score (Groceries)', filled: true, op: '−',
            children: [
              { value: '50.3%', label: 'Picked Most', tint: true },
              { value: '6.5%', label: 'Picked Least' },
            ],
          }}
          why={<>Subtracting Least from Most cancels out items that are merely <em>visible</em> a lot. Dividing by <mark>every appearance</mark> puts items shown different numbers of times on the same scale.</>}
        />

        <Section chapter={C.maxdiff} title="Key Terms">
          <KeyTermsTable
            chapter={C.maxdiff}
            terms={[
              { term: 'MaxDiff / Best-Worst Scaling', explanation: 'Repeatedly pick the most- and least-important item from a small set', why: 'Forces a real trade-off, unlike a 1–9 importance rating', example: 'Choosing your favorite and least-favorite of 4 card perks, several times over' },
              { term: 'Net choice score', explanation: 'Most% − Least%, over every appearance', why: 'Ranks items by revealed preference, not stated importance', example: 'Groceries: 50.3% − 6.5% = +43.8pp' },
            ]}
          />
        </Section>
      </NotesPage>

      {/* ───────────── Topic 3 · TURF ───────────── */}
      <NotesPage columns={1} toc={{ title: 'TURF', chapter: C.turf }}>
        <TopicHeader topicNumber={3} title="TURF (Total Unduplicated Reach & Frequency)" kicker="Picking the bundle under a $60/year budget" />
        <div style={{ height: 16 }} />
        <p>
          Continuing Topic 2’s Pecan Street Bank case: MaxDiff scored and ranked all 12 perks by net choice score. Now TURF narrows that ranking to the 4-perk bundle that reaches the most people under a $60/year cost cap.
        </p>
        <Callout chapter={C.turf} label="KEY INSIGHT">
          Only <mark>new</mark> people count toward reach at each step — someone already reached by an earlier item doesn’t add again when a later item also covers them.
        </Callout>
        <Section chapter={C.turf} title="Candidate Bundles">
          <ComparisonTable
            chapter={C.turf}
            columns={[{ key: 'bundle', label: 'Bundle', width: '12%' }, { key: 'perks', label: 'Four Perks' }, { key: 'cost', label: 'Cost/Year', width: '16%' }, { key: 'reach', label: 'Reach', width: '14%' }]}
            rows={[
              { bundle: 'A', perks: 'Groceries, gas/EV, intro APR, foreign fees', cost: '$70', reach: '87%' },
              { bundle: 'B', perks: 'Groceries, intro APR, foreign fees, fraud alerts', cost: '$59', reach: <strong>80%</strong> },
              { bundle: 'C', perks: 'Groceries, gas/EV, foreign fees, late-fee forgiveness', cost: '$54', reach: '70.5%' },
              { bundle: 'D', perks: 'Groceries, gas/EV, foreign fees, travel insurance', cost: '$60', reach: '69.5%' },
            ]}
          />
          <p className="prose-sm">
            Bundle A reaches the most people but <strong className="trap">breaks the $60 budget</strong>. <strong>Bundle B is the answer</strong>: the widest reach that stays under the cap.
          </p>
        </Section>
      </NotesPage>

      {/* ───────────── Topic 4 · Pipeline ───────────── */}
      <NotesPage columns={1} toc={{ title: 'MaxDiff → TURF Pipeline', chapter: C.pipeline }}>
        <TopicHeader topicNumber={4} title="The MaxDiff → TURF Pipeline" kicker="A single pipeline, run in sequence" />
        <div style={{ height: 20 }} />
        <StepPipeline
          chapter={C.pipeline}
          steps={[
            { label: 'Score & rank', body: 'Run a MaxDiff study to score and rank the full item list' },
            { label: 'Convert to binary', body: 'Convert MaxDiff scores into binary top-choice/threshold data' },
            { label: 'Optimal bundle', body: 'Run TURF on that binary data to find the mix with the widest reach' },
          ]}
        />
        <Section chapter={C.pipeline} title="In One Line">
          <Chain chapter={C.pipeline} items={['MaxDiff scores', 'Binary top-choice data', 'TURF bundle']} connector="→" />
        </Section>
        <Section chapter={C.pipeline} title="Which Tool?">
          <Flowchart
            chapter={C.pipeline}
            root={{
              label: 'Need a ranking or a $ value?', shape: 'diamond',
              children: [
                { label: 'Ranking', to: { label: 'Use MaxDiff', filled: true } },
                { label: '$ Value', to: { label: 'Use Conjoint Analysis', filled: true } },
              ],
            }}
          />
        </Section>
        <Section chapter={C.pipeline} title="What Each Tool Answers">
          <Matrix
            chapter={C.pipeline}
            rowLabels={['MaxDiff', 'Conjoint', 'TURF']}
            colLabels={['Ranks items', 'Gives $ value', 'Picks a bundle']}
            cells={[['✓', '–', '–'], ['–', '✓', '–'], ['–', '–', '✓']]}
          />
        </Section>
      </NotesPage>

      {/* ───────────── Topic 5 · Conjoint ───────────── */}
      <NotesPage columns={1} toc={{ title: 'Conjoint Analysis', chapter: C.conjoint }}>
        <TopicHeader topicNumber={5} title="Conjoint Analysis" kicker="Part-worths, utility, and willingness to pay" />
        <div style={{ margin: '13.8px 0' }}><span className={`badge ch-${C.conjoint}`}>Ratings-based conjoint</span></div>
        <Columns count={2} style={{ marginBottom: 15.4 }}>
          <p className="prose-sm">
            Conjoint analysis shows respondents full product profiles — several attributes bundled together, like a camera with a resolution, battery life, and price — and asks them to rate or choose between profiles. Because every attribute moves at once, the trade-offs respondents are forced to make reveal how much each attribute level is actually worth, rather than how important they say it is.
          </p>
          <Image chapter={C.conjoint} ratio="4/3" alt="Conjoint profile card example" caption="Fig. 1 — A full product profile shown to respondents." />
        </Columns>
        <Section chapter={C.conjoint} title="Part-Worths & Utility">
          <p className="prose-sm">
            Each attribute level (e.g. “50ft range” vs. “5ft range”) gets its own part-worth — a number representing how much that level alone contributes to a respondent’s overall liking. A profile’s total utility is just the sum of the part-worths for its levels.
          </p>
        </Section>
        <Columns count={2} style={{ margin: '15.4px 0' }}>
          <ConceptCard
            chapter={C.conjoint}
            term="Utility"
            definition="The overall attractiveness score for one specific product configuration."
            formulas={['U = \\sum \\text{part-worths}']}
            why="Because attributes combine additively, you can compare any two configurations just by adding up their parts — no need to re-survey every combination."
          />
          <ConceptCard
            chapter={C.conjoint}
            term="Willingness to Pay"
            definition="The dollar amount a consumer’s trade-offs imply they’d pay for one upgrade."
            formulas={['WTP_i = \\dfrac{u_i}{\\beta_{price}}']}
            why={<>Price is the only attribute measured in <mark>real dollars</mark>. Dividing the upgrade’s utility by the price part-worth’s slope converts utils back into dollars.</>}
          />
        </Columns>
        <Callout chapter={C.conjoint} label="MEMORY AID">
          Think of the price part-worth as an exchange rate — “utils per dollar” — and dividing by it is just converting currency.
        </Callout>
        <Section chapter={C.conjoint} title="Worked Example">
          <WorkedExample
            chapter={C.conjoint}
            title="Converting Utility Into Willingness to Pay"
            setup="Four binary attributes — Accuracy (5ft vs. 50ft), Battery (12hr vs. 32hr), Display (LCD vs. OLED), Price ($199 vs. $249) — fit with OLS regression on 300 ranked profiles."
            context={
              <ComparisonTable
                chapter={C.conjoint}
                columns={[{ key: 'v', label: 'Variable' }, { key: 'b', label: 'Partworth (β)', align: 'right' }]}
                rows={[
                  { v: '5ft → 50ft range', b: '11.85 utils' },
                  { v: '$199 → $249', b: '−60.34 utils' },
                ]}
              />
            }
            steps={[
              { label: 'Accuracy utility gained', lines: ['11.85 utils'] },
              { label: 'Convert the price slope to a rate', lines: ['60.34 utils over a $50 span', '60.34 ÷ 50 = 1.207 utils per $1 → $0.829 per util'] },
              { label: 'Apply the rate', lines: ['WTP = 11.85 utils × $0.829/util'] },
            ]}
            answer={{ value: '$9.83', label: 'Willingness to Pay' }}
            soWhat="A 50ft range upgrade is worth under $10 to the average respondent — not enough to justify a $30 price increase on its own."
          />
        </Section>
      </NotesPage>

      {/* ───────────── Review pages ───────────── */}
      <CheatSheetPage
        toc={{ title: 'Cheat Sheet', chapter: C.cheat }}
        columns={[
          { chapter: C.maxdiff, title: 'MaxDiff', bullets: ['Pick Most & Least from a small set, repeated', 'Forces trade-offs — no scale inflation', '4–5 items per set; 8–30 items total'], formula: 'Net score = Most% − Least%,\nover every appearance' },
          { chapter: C.turf, title: 'TURF', bullets: ['Finds the bundle with widest reach', 'Only NEW reach counts per step', 'Constrained by a budget or item count'], formula: 'Reach = % covered by\n≥1 item in the bundle' },
          { chapter: C.pipeline, title: 'The Pipeline', bullets: ['1. MaxDiff scores & ranks items', '2. Convert to binary top-choice data', '3. TURF finds the optimal bundle'] },
          { chapter: C.conjoint, title: 'Conjoint', bullets: ['Rate/choose full product profiles', 'Reveals $ value, not just rank', 'Utility = sum of part-worths'], formula: 'WTP = attribute utility\n÷ utils-per-dollar rate' },
        ]}
      />

      <FormulaSheetPage
        toc={{ title: 'Formula Sheet', chapter: C.formulas }}
        sections={[
          { chapter: C.maxdiff, name: 'MaxDiff (Best-Worst Scaling)', rows: [
            { concept: 'Net Choice Score', decomp: 'Most% minus Least%, counted over every appearance of the item', tex: '\\text{Net} = \\text{Most\\%} - \\text{Least\\%}' },
            { concept: 'Most / Least %', decomp: 'Times picked, divided by total appearances', tex: '\\%\\text{Most} = \\dfrac{\\text{times picked Most}}{\\text{appearances}}' },
          ] },
          { chapter: C.turf, name: 'TURF', rows: [
            { concept: 'Reach', decomp: 'Share of respondents covered by at least one bundle item', tex: '\\text{Reach} = \\dfrac{\\text{respondents covered}}{\\text{total respondents}}' },
            { concept: 'Incremental Reach', decomp: 'New reach added by one more item — overlap does not count twice', tex: '\\Delta\\text{Reach} = \\text{Reach}(A\\cup B) - \\text{Reach}(A)' },
          ] },
          { chapter: C.conjoint, name: 'Conjoint Analysis', rows: [
            { concept: 'Utility', decomp: 'Sum of part-worths for every attribute level in one profile', tex: 'U = \\sum \\text{part-worths}' },
            { concept: 'Price Rate', decomp: 'Utility span over the price span it was measured across', tex: '\\text{rate} = \\dfrac{\\Delta \\text{utility}}{\\Delta \\text{price}}' },
            { concept: 'Willingness to Pay', decomp: 'Attribute’s utility, converted to dollars via the price rate', tex: '\\text{WTP} = \\dfrac{\\text{attribute utility}}{\\text{price rate}}' },
          ] },
        ]}
      />

      <QuizPage
        toc={{ title: 'Practice Questions', chapter: C.practice }}
        chapter={C.practice}
        kicker="Answers are printed right under each question"
        questions={[
          { q: 'An item appeared in 4 choice sets, was picked Most once and Least once. What is its net choice score?', a: '1/4 − 1/4 = 25% − 25% = 0pp. The denominator is every appearance (4), not just the 2 times it was selected.' },
          { q: 'Bundle A reaches 60% of respondents. Adding Item X, which only appeals to people Bundle A already reaches, changes reach by how much?', a: '0 percentage points — TURF only counts NEW reach; fully overlapping coverage adds nothing.' },
          { q: 'A part-worth of 20 utils for a feature, with a price slope of 2 utils per dollar, gives what willingness to pay?', a: '$10 — WTP = attribute utility ÷ utils-per-dollar rate = 20 ÷ 2.' },
          { q: 'Why does MaxDiff ask for Most AND Least, instead of just “pick your favorite”?', a: 'Picking only a favorite wastes the rest of the choice set — forcing a Least pick extracts information about every item shown, not just the winner.' },
        ]}
      />

      <GlossaryPage
        toc={{ title: 'Glossary', chapter: C.glossary }}
        chapter={C.glossary}
        entries={[
          { term: 'Conjoint Analysis', def: 'Infers part-worth utilities from trade-off choices, rather than asking importance directly.' },
          { term: 'MaxDiff', def: 'Repeatedly picks the most/least-important item from a small set to reveal a ranking.' },
          { term: 'Net Choice Score', def: 'Most% minus Least%, over every appearance — not just the times it was picked at all.' },
          { term: 'Part-Worth', def: 'The utility value one attribute level contributes to a product’s total utility.' },
          { term: 'Reach', def: 'Share of respondents who’d pick at least one item from a given bundle.' },
          { term: 'TURF', def: 'Finds the bundle reaching the widest audience under a cost or count cap.' },
          { term: 'Utility', def: 'The overall score for one product configuration — sum of its part-worths.' },
          { term: 'Willingness to Pay (WTP)', def: 'The dollar amount trade-offs imply a consumer would pay for one upgrade.' },
        ]}
      />
    </NotesDocument>
  );
}
