import {
  Aside, Callout, ComparisonTable, ConceptCard, NotesDocument, NotesPage, Section, StepPipeline, TopicHeader, WorkedExample, type Chapter,
} from '@notes';

/**
 * Reference for notes on ONE case, in textbook rhythm.
 *
 * Only the Notes page is here: a Cover, Contents, Map, Cheat Sheet or Formula Sheet would add nothing to a single case.
 * The page alternates short paragraph blocks (1–2 short paragraphs) with the element that makes each one concrete, the
 * way a textbook does — it is not one block of prose followed by a stack of boxes:
 *
 *   source (a NotebookLM write-up)        →  in the notes
 *   intro + "The Deal & Setup"            →  2 short paragraphs   →  table: the deal at a glance
 *   "EBITDA Alchemy" (what was found)     →  1 short paragraph    →  table: what the reviews found
 *   the capitalizing mechanism            →  1 short paragraph    →  worked example (illustrative numbers)
 *   "The Implosion & Aftermath"           →  1 short paragraph    →  3 steps: what followed
 *   closing sentence of the write-up      →  1 short paragraph    →  concept card: EBITDA as a cash-flow proxy
 *
 * The write-up's closing question ("Would you like to analyze…?") is chat residue and is dropped.
 */
const C = { case: 3 } satisfies Record<string, Chapter>;

export default function SchurFlexibles() {
  return (
    <NotesDocument meta={{ title: 'Schur Flexibles', subtitle: 'When EBITDA was engineered', course: 'SAMPLE · Case notes', week: 'Case', author: 'Christine John' }}>
      <NotesPage toc={{ title: 'Schur Flexibles: When EBITDA Was Engineered', chapter: C.case }}>
        <TopicHeader title="Schur Flexibles: When EBITDA Was Engineered" kicker="Source: NotebookLM write-up of the 2021 buyout; figures as reported there" />

        <Aside>
          <Callout chapter={C.case} label="EXAM TRAP">
            The criminal probe covers <strong className="trap">alleged</strong> misdeeds. Write “alleged”, and state no outcome the sources do not give.
          </Callout>
        </Aside>
        <p>
          The 2021 buyout of Schur Flexibles, an Austrian packaging manufacturer, is a cautionary tale about trusting <strong>engineered EBITDA</strong>.
          The price, the debt and the deal terms all rested on one reported number, and it collapsed within months.
        </p>
        <p>
          In 2021 the US private equity firm Lindsay Goldberg sold a majority stake in its portfolio company to Vienna-based B&amp;C Group. Three numbers frame the deal.
        </p>

        <Section chapter={C.case} title="The deal at a glance" wide>
          <ComparisonTable
            chapter={C.case}
            columns={[{ key: 'item', label: 'Item', width: '22%' }, { key: 'what', label: 'What the write-up reports' }]}
            rows={[
              { item: 'Price', what: 'Enterprise value of about €900 million (over $1 billion at the time)' },
              { item: 'Funding', what: 'A fresh debt package plus roughly $300 million of B&C equity' },
              { item: 'Valuation anchor', what: 'Reported EBITDA: the valuation, debt terms and price were heavily anchored on it' },
            ]}
          />
        </Section>

        <Aside>
          <Callout chapter={C.case} label="KEY INSIGHT">
            A cost moved onto the balance sheet never touches EBITDA, but <mark>the cash still leaves</mark>.
          </Callout>
        </Aside>
        <p>
          B&amp;C closed after an accelerated due diligence. Later accounting reviews found reported EBITDA inflated by aggressive bookkeeping:
          costs pushed onto the balance sheet, losses moved out of the earnings buyers saw.
        </p>

        <Section chapter={C.case} title="What the reviews found" wide>
          <ComparisonTable
            chapter={C.case}
            columns={[{ key: 'f', label: 'Finding', width: '20%' }, { key: 'did', label: 'What happened' }, { key: 'eff', label: 'What it did to EBITDA' }]}
            rows={[
              { f: '1 · Capitalized operating costs', did: 'Testing, maintaining and relocating machinery, executive bonuses and consulting contracts were booked as capital expenditure', eff: 'The cost skipped the income statement, so EBITDA never carried it' },
              { f: '2 · Parked losses', did: 'Certain operating losses were reclassified as the results of discontinued operations', eff: 'The losses left the earnings metrics shown to prospective buyers' },
              { f: '3 · Internal messages', did: 'Legal filings surfaced executives’ messages shortly before the sale: “After all, everybody believes that the EBITDA is real…”', eff: 'The business was burning cash while the metric looked healthy' },
            ]}
          />
        </Section>

        <p>
          The first finding shows why EBITDA is easy to flatter. A capitalized cost is spread over several years of depreciation, and EBITDA ignores depreciation,
          so the expense never reduces EBITDA at all while the cash has already gone out.
        </p>

        <WorkedExample
          chapter={C.case}
          title="Expensed or capitalized: the same cash, a different EBITDA"
          setup="Illustrative numbers, not Schur’s. A plant spends €10 million to test and relocate machinery. EBITDA before this cost is €30 million."
          steps={[
            { label: 'Expense it now', lines: ['EBITDA = €30m − €10m = €20m', 'Cash out: €10m'] },
            { label: 'Capitalize it, write it down over 5 years', lines: ['EBITDA = €30m (the cost is not in it)', 'Depreciation = €10m ÷ 5 = €2m a year', 'Cash out: still €10m'] },
          ]}
          answer={{ value: '+€10m', label: 'EBITDA gained by capitalizing' }}
          soWhat="The cash is identical, yet EBITDA is half as high again. A buyer who pays a multiple of EBITDA pays for cash that has already left."
        />

        <p>
          The unwinding was fast: within a year of closing, B&amp;C had lost both control of Schur and its entire equity investment.
        </p>

        <Aside>
          <Callout chapter={C.case} label="MEMORY AID">
            Ask where the cost went: <strong className="tip">expensed</strong> (it hits EBITDA) or capitalized (it skips EBITDA).
          </Callout>
        </Aside>
        <Section chapter={C.case} title="What followed" wide>
          <StepPipeline
            chapter={C.case}
            steps={[
              { label: 'Restatement', body: 'Months after closing, creditors are alerted. Schur restates 2020 EBITDA down two-thirds (−66%); KPMG recommends cuts for prior years too.' },
              { label: 'Wipeout of equity', body: 'Banks freeze credit lines and the debt slumps. B&C hands ownership to an Apollo-led lender group; its $300 million of equity is wiped out.' },
              { label: 'Probes and lawsuits', body: 'Austrian prosecutors open a criminal probe into alleged misdeeds and waste; B&C takes legal action to recoup its losses.' },
            ]}
          />
        </Section>

        <p>
          The lesson is structural, not about one company. EBITDA ignores depreciation and lets management choose what is capitalized and what is expensed, so
          reported EBITDA can <mark>make a loss-making business look like a cash generator</mark>.
        </p>

        <ConceptCard
          chapter={C.case}
          term="EBITDA as a cash-flow proxy"
          definition="Operating profit with the two big non-cash charges (depreciation and amortization) added back, often read as a stand-in for the cash a business generates."
          formulas={['\\text{EBITDA} = \\text{EBIT} + \\text{Depreciation} + \\text{Amortization}']}
          why="It is only a proxy. It ignores the cash spent on equipment, and any cost moved onto the balance sheet never reaches it, so check operating cash flow minus capex before trusting it."
        />
      </NotesPage>
    </NotesDocument>
  );
}
