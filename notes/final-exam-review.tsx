import {
  Aside, Callout, CheatSheetPage, ComparisonTable, ConceptCard, ContentsPage, CoverPage, Flowchart, FormulaSheetPage, Full,
  GlossaryPage, KeyTermsTable, Matrix, NotesDocument, NotesPage, QuizPage, Section, SectionTitle, Split, Tex,
  TopicHeader, TopicMapPage, WorkedExample, type Chapter,
} from '@notes';

/**
 * FIN 294 Final Exam Review — rebuilt from the exported PDF (Final_Exam_Consolidated_Review) with the current
 * design system: 11pt body, "one step down" boxed content, tighter spacing, one color per topic.
 */
const C: Record<number, Chapter> = { 1: 7, 2: 11, 3: 4, 4: 13, 5: 2, 6: 10, 7: 3, 8: 9, 9: 6, 10: 8, 11: 12, 12: 5, 13: 13, 14: 1, 15: 7 };
const OVERVIEW: Chapter = 1;

const Trap = ({ chapter, children }: { chapter: Chapter; children: React.ReactNode }) => (
  <Callout chapter={chapter} label="EXAM TRAP">{children}</Callout>
);
const Memory = ({ chapter, children }: { chapter: Chapter; children: React.ReactNode }) => (
  <Callout chapter={chapter} label="MEMORY AID">{children}</Callout>
);

export default function FinalExamReview() {
  return (
    <NotesDocument
      meta={{
        title: 'Final Exam Review',
        subtitle: 'Advanced Corporate Finance — 15 Concepts, Consolidated',
        course: 'FIN 294 · TEMBA · PROF. ANDRES ALMAZAN',
        week: 'Final Exam',
        author: 'Christine John',
        brandChapter: 1,
      }}
    >
      <CoverPage title={'Final Exam\nReview'} dots={[7, 11, 4, 13]} />
      <ContentsPage />

      {/* ───────────── Topic Map & exam format ───────────── */}
      <TopicMapPage
        toc={{ title: 'Topic Map & Exam Format', chapter: OVERVIEW }}
        subtitle="15 concepts, built up one friction at a time — no taxes/distress/info frictions → one at a time → real capital structure"
        cards={[
          { title: '1–3 · M-M Foundations', chapter: 7, definition: 'No taxes, no distress, no info frictions: capital structure is irrelevant.', why: 'Every later topic adds back exactly one friction at a time.' },
          { title: '4–7 · Taxes & Distress', chapter: 4, definition: 'Corporate + personal taxes favor debt; bankruptcy costs push back.', why: 'The classic trade-off theory of capital structure.' },
          { title: '8–12 · Agency & Strategy', chapter: 9, definition: 'Debt overhang, asset substitution, strategic costs, LBOs, short-termism.', why: 'How debt distorts investment decisions, for better or worse.' },
          { title: '13–15 · Information & Signaling', chapter: 8, definition: 'Dilution, the lemons problem, convertibles as backdoor equity.', why: 'What a financing choice reveals when managers know more than the market.' },
        ]}
      >
        <SectionTitle chapter={OVERVIEW}>Exam format (per class, Oct 5–6)</SectionTitle>
        <Aside>
          <Callout chapter={OVERVIEW} label="KEY INSIGHT">
          Every topic in this packet is a variation on one question: does this change grow the total pie, or just redistribute it among claimants? M-M says capital structure alone never grows the pie. Taxes, distress costs, and information frictions are the only things that do.
          </Callout>
          <Callout chapter={OVERVIEW} label="NOTES">
          Part 1’s 7-question / best-6 structure and Part 2’s 4-exercise / best-3 structure mean you can afford to skip your weakest topic in each part — but with 15 topics compressed into 11 scored items, know enough breadth that no single topic is a total blank.
          </Callout>
        </Aside>
        <p>Two parts. <strong>Part 1</strong> — 7 qualitative questions (10 pts each, best 6 of 7 count, max 60 pts). <strong>Part 2</strong> — 4 numerical exercises (20 pts each, best 3 of 4 count, max 60 pts). Maximum score 120. Show your work — generous partial credit even if the final number is off. 2 hours (more time than needed).</p>
        <p>Formulas will be provided — the exam tests knowing <em>when and how</em> to apply them, not memorizing them from scratch. No math questions on Lecture 9 (conceptual only — see Topic 15). Posted sample questions show question type, not exact content. “Rationalize the numbers” means sanity-check/interpret the answer, not just compute it.</p>
      </TopicMapPage>

      {/* ───────────── 1 ───────────── */}
      <NotesPage toc={{ title: '1 · M-M, Arbitrage & Leverage', chapter: C[1] }}>
        <TopicHeader topicNumber={1} title="M-M, Arbitrage & Leverage" kicker="L1 Slides 21-23, 31 · HW1 Q1, Q6" />
        <Aside>
          <Memory chapter={C[1]}>“Same pie, different slices.” If you ever compute a different total firm value from two capital structures with no taxes/distress/info frictions, you made an arithmetic error, not a discovery.</Memory>
          <Trap chapter={C[1]}>When verifying M-M Prop I across a restructuring, <strong className="trap">don’t compute firm value as just equity value</strong> — always add V(debt) + V(equity) to check the total, not just the share price.</Trap>
        </Aside>
        <p>In a world with no taxes, no bankruptcy costs, and no information asymmetries, total firm value is independent of capital structure. If two otherwise-identical firms are priced differently once you account for leverage, an investor can combine long and short positions (“home-made leverage”) to capture a riskless arbitrage profit.</p>
          <ConceptCard chapter={C[1]} term="M-M Proposition I" definition="The total value of a firm is independent of its capital structure — debt vs. equity is just slicing the same pie differently." formulas={['V(\\text{firm}) = V(\\text{debt}) + V(\\text{equity})']} why="If two firms with identical underlying assets are priced differently once leverage is accounted for, buying the cheap one and shorting the expensive one (in matched proportions) nets a riskless profit today with zero net cash flow in every future state — competition erases that mispricing." />
        <Section wide chapter={C[1]} title="Worked Example — HW1 Q1">
          <WorkedExample
            chapter={C[1]}
            title="Arbitraging Two Identical Firms"
            setup="Firm X: 1,000 shares @ $10 + 100 bonds @ $100 (V = $20,000). Firm Y: 2,000 shares @ $8 + 50 bonds @ $100 (V = $21,000). Both hold identical assets; bonds are risk-free zero-coupons at 10%."
            table={{ columns: ['Trade', 'Cash flow today'], rows: [['Buy 50 shares of X (5%)', '−$500'], ['Buy 5 bonds of X (5%)', '−$500'], ['Short 100 shares of Y (5%)', '+$800'], ['Short 2.5 bonds of Y (5%)', '+$250']] }}
            steps={[{ label: 'Net cash flow today', lines: ['−500 − 500 + 800 + 250 = +$50 arbitrage profit'] }, { label: 'Net cash flow at t = 1, every state', lines: ['Long and short positions exactly cancel = $0'] }]}
            answer={{ value: '+$50', label: 'Riskless arbitrage profit' }}
            soWhat="The arbitrage only works because X and Y hold identical underlying assets — you’re exploiting a pricing error, not creating value. This is the textbook M-M Prop I proof."
          />
        </Section>
      </NotesPage>

      {/* ───────────── 2 ───────────── */}
      <NotesPage toc={{ title: '2 · Undoing Firms’ Actions', chapter: C[2] }}>
        <TopicHeader topicNumber={2} title="Can Investors “Undo” Firms’ Financial Actions?" kicker="L1 Slides 24-25 · HW1 Sample Question" />
        <Aside>
          <Memory chapter={C[2]}>“If the firm won’t give you the leverage you want, borrow it yourself.” This ‘clientele doesn’t matter’ argument reinforces Topic 1 — financing mix alone can’t be a value source if investors can personally undo it.</Memory>
        </Aside>
        <p>If a firm changes its own capital structure, any shareholder who preferred the old structure can costlessly re-create their original risk/return profile by borrowing or lending on their own account (“home-made leverage”) — provided they can borrow/lend at the same risk-free rate the firm does, with no frictions.</p>
        <Section wide chapter={C[2]} title="The Two Replicating Trades">
          <Matrix chapter={C[2]} rowLabels={['Firm delevers', 'Firm issues new debt']} colLabels={['Investor wants old leverage back']} cells={[['Buy more shares, financed by personal borrowing'], ['Sell some shares, buy some of the new debt in the same proportion']]} />
        </Section>
        <Section wide chapter={C[2]} title="Worked Example — HW1 Sample Question">
          <WorkedExample
            chapter={C[2]}
            title="Replicating a Levered Payoff From an Unlevered Firm"
            setup="Firms U (all-equity, $500 stock) and L ($400 risk-free debt @ 10%) are identical, paying $150 boom / $50 slump (50/50 each). You hold $20 of L’s stock — replicate the same payoff using U instead."
            steps={[{ label: 'L’s claim', lines: ['$20 of stock buys a residual claim after $40 interest is paid'] }, { label: 'Replicate with U + personal borrowing', lines: ['Buy a larger stake in U, financed partly by borrowing at the risk-free rate', 'This re-creates L’s leverage synthetically (“home-made leverage”)'] }]}
            answer={{ value: 'M-M Prop II holds', label: 'Expected return on replica = L’s equity return' }}
            soWhat="The exam version cares about mechanics: specify shares bought/sold and the exact dollar amount borrowed or lent — not just ‘it can be replicated.’"
          />
        </Section>
      </NotesPage>

      {/* ───────────── 3 ───────────── */}
      <NotesPage toc={{ title: '3 · M-M and Risky Debt', chapter: C[3] }}>
        <TopicHeader topicNumber={3} title="M-M and Risky Debt" kicker="L1 Slides 24-25 · HW1 Q3, Q4" />
        <Aside>
          <Memory chapter={C[3]}>Always build a state-by-state table (good/bad × each claim) before computing any single number. If the three claim values don’t sum to the same total before and after, that’s an arithmetic error — M-M Prop I is your check digit.</Memory>
          <Trap chapter={C[3]}><strong className="trap">Don’t value new senior debt at face value</strong> when the firm’s assets could fall short of even the senior claim in the worst state — always verify the worst state covers the promised payment before calling the debt riskless.</Trap>
        </Aside>
        <p>M-M Prop I still holds even when debt is risky (can default) — total firm value is still independent of capital structure — but risky debt opens the door to wealth transfers between old debtholders, new debtholders, and equity when new claims are issued without protective covenants. The pie’s size doesn’t change; who gets which slice can.</p>
        <ConceptCard chapter={C[3]} term="Value of a Risky Claim" definition="A risky claim is worth its expected (probability-weighted) payoff across states — never its promised face value." formulas={['V(\\text{claim}) = \\sum_{\\text{states}} p(\\text{state}) \\times \\min(\\text{promised},\\ \\text{available cash after senior claims})']} why="Face value only matters in states where the firm can fully pay it; in every other state the claim gets whatever cash is left after more senior claims are satisfied." />
        <Section wide chapter={C[3]} title="Worked Example — HW1 Q4">
          <WorkedExample
            chapter={C[3]}
            title="New Senior Debt Transfers Wealth From Old Debt to Equity"
            setup="Old zero-coupon debt promises $100 at t = 1. Assets will be worth $200 / $100 / $50 (each p = 1/3). Firm issues new debt senior to the old, promising $50, and pays the proceeds out as a special dividend."
            steps={[{ label: 'New debt (riskless)', lines: ['Paid $50 in every state → V(new debt) = $50'] }, { label: 'Old debt (now junior)', lines: ['Payoff becomes High $100 / Mid $50 / Low $0', 'V(old debt) after = 1/3(100)+1/3(50)+1/3(0) = $50 (down from $83.33)'] }, { label: 'Check: total firm value', lines: ['Unchanged at $116.67 (M-M holds)'] }]}
            answer={{ value: '−$33.33 / +$33.33', label: 'Old debt’s loss = equity’s gain' }}
            soWhat="No covenants = no protection. This is the textbook case for why bond covenants exist: without them, equity can enrich itself at existing bondholders’ expense by issuing new senior claims, even though total firm value never moves."
          />
        </Section>
      </NotesPage>

      {/* ───────────── 4 ───────────── */}
      <NotesPage toc={{ title: '4 · Corporate Taxes', chapter: C[4] }}>
        <TopicHeader topicNumber={4} title="Corporate Taxes: Can Investors Undo Them?" kicker="L2 Slides 14-15 — the pivot topic" />
        <Aside>
          <Memory chapter={C[4]}>“You can borrow for yourself, but you can’t deduct YOUR interest against the CORPORATION’s taxes.” That’s the whole reason personal home-made leverage stops substituting for corporate leverage once corporate taxes exist.</Memory>
        </Aside>
        <p>Once corporate taxes exist, M-M Prop I breaks: interest is tax-deductible, so debt shields income from corporate tax, and that saving is a real, permanent cash flow. Unlike the no-tax case, individual investors cannot personally undo this by borrowing on their own account — a personal loan doesn’t give the investor a corporate tax shield, only the corporation’s own interest payments are deductible against corporate income.</p>
          <ConceptCard chapter={C[4]} term="M-M With Corporate Taxes" definition="Debt adds value to the firm equal to the corporate tax rate times the amount of debt, because interest is tax-deductible every period." formulas={['V_L = V_U + T_C \\times D']} why="This is the single biggest conceptual pivot in the course: Topics 1–3 showed capital structure is irrelevant; here it starts to matter, because the ‘undo it yourself’ trade from Topic 2 stops working once the government is a stakeholder in the firm’s income." />
      </NotesPage>

      {/* ───────────── 5 ───────────── */}
      <NotesPage toc={{ title: '5 · Who Gets the Tax Benefit?', chapter: C[5] }}>
        <TopicHeader topicNumber={5} title="Who Gets the Tax Benefits of Debt?" kicker="L2 Slides 16-17" />
        <Aside>
          <Memory chapter={C[5]}>Announcement date = value date. Execution date = just paperwork (assuming no new information arrives between the two). Exam questions often separate “value right after announcement” from “value after the deal is completed” — no additional value is created at execution.</Memory>
        </Aside>
        <p>The <Tex tex="T_C \times D = \text{tax shield}" /> is captured by whoever holds the firm’s securities at the moment the capital-structure change is announced — not necessarily management, not necessarily future shareholders. A debt-for-equity swap announcement moves the share price immediately, pricing in the full benefit before the exchange is even executed.</p>
          <ConceptCard chapter={C[5]} term="Value Impact on Announcement" definition="Firm value jumps by the tax shield on the change in debt the moment the plan is announced — not when it’s executed." formulas={['\\Delta V_{\\text{firm}} = T_C \\times \\Delta D']} why="Debt is typically repurchased or issued at fair value, so debt’s own value doesn’t move — the entire benefit hits equity value immediately on announcement." />
      </NotesPage>

      {/* ───────────── 6 ───────────── */}
      <NotesPage toc={{ title: '6 · Personal Taxes (Miller)', chapter: C[6] }}>
        <TopicHeader topicNumber={6} title="Personal Taxes and Capital Structure (Miller Model)" kicker="L2 Slides 18-20 · HW2 Q2 — the most-tested formula" />
        <Aside>
          <Memory chapter={C[6]}>Say g out loud: “1 minus the two-tax product over the one-tax survivor.” (1−T_C)(1−T_E), all over (1−T_D).</Memory>
          <Trap chapter={C[6]}>A REIT (T_C = 0) <strong className="trap">is not automatically g = 0</strong> — it still has personal taxes on both sides. Plug T_C = 0 into g and it collapses toward (T_D − T_E)/(1−T_D), which is near zero or slightly negative when T_E ≈ T_D, not automatically zero.</Trap>
        </Aside>
        <p>Adding personal taxes on interest income (<Tex tex="T_D" />) and equity income (<Tex tex="T_E" />) alongside the corporate tax (<Tex tex="T_C" />) shrinks debt’s net tax advantage to a single number, <em>g</em> — which can even turn negative.</p>
          <ConceptCard chapter={C[6]} term="Miller’s g" definition="The net value a dollar of debt adds to the firm after all three taxes — corporate, personal debt, and personal equity — are netted out." formulas={['g = 1 - \\dfrac{(1-T_C)(1-T_E)}{1-T_D}', 'V_L = V_U + g \\times D']} why="If T_D is high relative to T_C and T_E (interest taxed more heavily at the personal level), g shrinks — debt’s corporate-level advantage is partly or fully offset by investors demanding higher pre-tax yields on taxable bonds." />
        <Section wide chapter={C[6]} title="Worked Example — HW2 Q2">
          <WorkedExample
            chapter={C[6]}
            title="Reducing Debt When g Is Positive"
            setup="E0 = $500M, D0 = $500M, 10M shares. Firm issues $250M new equity, uses proceeds to repurchase $250M debt. T_C = 35%, T_E = 10%, T_D = 20%."
            steps={[
              { label: 'Compute g', lines: ['g = 1 − [(0.65)(0.90)/(0.80)] = 1 − 0.73125 = 26.875%'] },
              { label: 'Value impact of reducing debt', lines: ['ΔV = g × ΔD = 0.26875 × (−$250M) = −$67.1875M'] },
              { label: 'New equity value & price', lines: ['Equity = $500M − $67.1875M = $432.8125M', 'Price/share = $432.8125M / 10M = $43.28 (down from $50)'] },
              { label: 'Check at execution', lines: ['New shares issued ≈ 5,776,173', 'After execution: $682.8125M / 15,776,173 shares ≈ $43.28/share — UNCHANGED'] },
            ]}
            answer={{ value: 'g = 26.875%', label: 'Debt still has a net tax advantage' }}
            soWhat="The share price before and after execution must match (only the announcement moves price) — a built-in self-check for this whole problem type."
          />
        </Section>
      </NotesPage>

      {/* ───────────── 7 ───────────── */}
      <NotesPage toc={{ title: '7 · Who Bears Bankruptcy Costs?', chapter: C[7] }}>
        <TopicHeader topicNumber={7} title="Who Bears Bankruptcy Costs?" kicker="L2 Slides 31-32 · HW1 Q5, HW2 Q1" />
        <Aside>
          <Memory chapter={C[7]}>Bankruptcy costs shrink the pie; M-M Prop I only holds when there are NO bankruptcy costs. Once a problem has distress costs, stop expecting before/after totals to match.</Memory>
        </Aside>
        <p>Distress costs (direct: legal/administrative fees; indirect: lost customers, distressed-sale losses, management distraction) shrink the total pie available to all claimants.</p>
        <Split
          left={{ title: 'Direct Bearer', chapter: C[7], items: ['Debtholders, in the state where default happens', 'They recover less than going-concern value', 'Observable in that state’s snapshot'] }}
          right={{ title: 'Indirect / Ex-Ante Bearer', chapter: C[7], items: ['Equityholders, before default ever happens', 'Rational bondholders price the expected distress cost in at issuance', 'Equity pays through a higher required yield on debt'] }}
        />
        <Section wide chapter={C[7]} title="Worked Example — HW2 Q1">
          <WorkedExample
            chapter={C[7]}
            title="Implied Distress Costs From Observed Market Values"
            setup="Good Time Co.: boom (p=.6) pays $250M, recession (p=.4) pays $100M. Required debt repayment = $150M. Actual observed market values: equity = $60M, debt = $125M."
            steps={[{ label: 'No-distress-cost prediction', lines: ['V(debt) = 0.6(150) + 0.4(100) = $130M', 'V(equity) = 0.6(100) + 0.4(0) = $60M', 'Total = $190M'] }, { label: 'Actual observed total', lines: ['$60M + $125M = $185M'] }, { label: 'Implied distress cost', lines: ['$190M − $185M = $5M'] }]}
            answer={{ value: '$5M', label: 'Implied distress cost — all absorbed by debt' }}
            soWhat="Equity’s value is unchanged ($60M matches prediction exactly — it already gets $0 in recession). The entire shortfall shows up in debt’s value, because debt bears it directly in the state where it happens."
          />
        </Section>
      </NotesPage>

      {/* ───────────── 8 ───────────── */}
      <NotesPage toc={{ title: '8 · Debt Overhang', chapter: C[8] }}>
        <TopicHeader topicNumber={8} title="Debt Overhang" kicker="L4 Slides 6-17 · HW3 Q2–5 — heaviest-weighted topic" />
        <Aside>
          <Memory chapter={C[8]}>Checklist: (1) confirm the project’s own NPV is positive — that’s what makes the result surprising; (2) compute the max residual available to new money after existing senior claims; (3) compare to the amount needed.</Memory>
          <Trap chapter={C[8]}><strong className="trap">Don’t assume a positive-NPV project always gets financed</strong> — debt overhang is specifically the case where it can’t, because existing senior claimholders capture part of the upside for free.</Trap>
        </Aside>
        <p>A firm with risky debt outstanding may be unable to raise funds for a genuinely positive-NPV project, because existing debtholders capture part of the project’s upside for free — their existing claim gets safer when new money comes in — leaving too little value for new investors to recoup their investment.</p>
        <Section wide chapter={C[8]} title="Maximum Raisable, by Instrument">
          <KeyTermsTable chapter={C[8]} terms={[
            { term: 'New equity', explanation: 'E[max(future CF − existing senior debt face, 0)]', why: 'New equity only gets the residual after existing claims are paid' },
            { term: 'New junior debt', explanation: 'Same ceiling as equity, no matter the promised face value', why: 'Junior claims sit behind existing senior debt in every state' },
            { term: 'New debt, equal seniority', explanation: 'Solve for face value F so expected pro-rata repayment (shared with old debt) equals the amount needed', why: 'Equal-rank debt shares the recovery pool with old debt in default states' },
          ]} />
        </Section>
        <Section wide chapter={C[8]} title="Worked Example — HW3 Q2">
          <WorkedExample
            chapter={C[8]}
            title="A Positive-NPV Project That Can’t Get Financed"
            setup="Longhorn has $70M senior debt outstanding. New project costs $100M, pays $90M (p=.5) or $210M (p=.5) — NPV = +$50M, genuinely positive. Can it raise the $100M needed?"
            table={{ columns: ['Route', 'Max raisable', 'Enough?'], rows: [['(a) New equity', 'E[max(CF−70,0)] = 0.5(20)+0.5(140) = $80M', 'No'], ['(b) New junior debt', 'Same $80M ceiling', 'No'], ['(c) New senior debt, F=$120', '0.5(56.84)+0.5(120) = $88.42M', 'No'], ['(d) New senior debt, F=$140', '0.5(60)+0.5(140) = $100M', 'Yes']] }}
            answer={{ value: 'Only route (d) works', label: 'Equal-seniority debt at F = $140M' }}
            soWhat="Equity is squeezed to $0 in both states; even the OLD $70M senior debt is diluted (now recovers only an expected $50M). A genuinely positive-NPV project ($50M!) still can’t get funded through equity or junior debt at ANY terms — that’s the whole debt overhang result."
          />
        </Section>
      </NotesPage>

      {/* ───────────── 9 ───────────── */}
      <NotesPage toc={{ title: '9 · Asset Substitution', chapter: C[9] }}>
        <TopicHeader topicNumber={9} title="Asset Substitution" kicker="L4 Slides 19-21 · HW3 Q7" />
        <Aside>
          <Memory chapter={C[9]}>Debt overhang = equity underinvests (walks away from positive NPV). Asset substitution = equity overinvests in risk (switches to negative NPV). Same root cause — equity’s option-like payoff plus debt’s fixed claim — opposite-looking symptom.</Memory>
          <Trap chapter={C[9]}>If the question gives a <strong className="trap">choice between two projects</strong> at a given debt level, it’s asset substitution. If it asks whether <strong className="trap">new money can be raised at all</strong>, it’s debt overhang. Don’t confuse the two on a quick read.</Trap>
        </Aside>
        <p>Once debt is in place, equityholders — who keep all the upside above the debt’s face value but are protected by limited liability on the downside — have an incentive to switch to a riskier project even if it has lower (or negative) expected value, because the extra variance benefits the option-like equity claim at debtholders’ expense.</p>
          <ConceptCard chapter={C[9]} term="Equity’s Project Choice Under Debt" definition="Equity picks whichever project maximizes its own residual, not whichever maximizes total firm value." formulas={['\\max_{\\text{project}}\\ \\mathbb{E}[\\max(CF - F,\\ 0)]']} why="If the riskier project wins on this metric even with lower/negative NPV, rational lenders anticipate the switch and price debt (or ration credit) accordingly — which can prevent even a genuinely good, safer project from being financed." />
        <Section wide chapter={C[9]} title="Worked Example — HW3 Q3C">
          <WorkedExample
            chapter={C[9]}
            title="Risk-Shifting Poisons Financing for the Good Project Too"
            setup="Project 1: $300 (p=.5) / $120 (p=.5), NPV=+$10. Project 2: $600 (p=.2) / $80 (p=.8), NPV=−$16. No binding commitment — can the firm raise $200 in the bond market for either?"
            steps={[{ label: 'If F ≤ 112.5', lines: ['Equity prefers Project 1 (safe, positive-NPV)', 'Max raisable while keeping Project 1 = $112.50 — short of $200'] }, { label: 'If F > 112.5', lines: ['Equity switches to Project 2 (risk-shifting) despite negative NPV', 'Max E[repayment] capped at 0.2(600)+0.8(80) = $184 — still short of $200'] }]}
            answer={{ value: 'No', label: 'Cannot raise $200 for either project' }}
            soWhat="Anticipated asset substitution poisons financing even for the genuinely good project. Compute equity’s payoff under each project at the proposed face value — don’t just compare the two projects’ raw NPVs."
          />
        </Section>
      </NotesPage>

      {/* ───────────── 10 ───────────── */}
      <NotesPage toc={{ title: '10 · Strategic Costs', chapter: C[10] }}>
        <TopicHeader topicNumber={10} title="Strategic Costs of Financial Distress" kicker="L5 Slides 6-10 · HW3 Q8 (G&T 17.5)" />
        <Aside>
          <Memory chapter={C[10]}>“It’s not just lawyers’ fees — it’s suppliers getting nervous, customers walking, and your best people updating their resumes.”</Memory>
        </Aside>
        <p>Beyond direct legal/administrative bankruptcy costs, financial distress imposes strategic/indirect costs through relationships with non-financial stakeholders: suppliers tighten credit terms, customers avoid a firm that might not honor warranties, key employees leave, competitors prey on a weakened rival. These costs can be large even without an actual filing — simply from the increased risk of distress.</p>
        <Section wide chapter={C[10]} title="Worked Example — HW3 Q8 / G&T 17.5">
          <WorkedExample
            chapter={C[10]}
            title="Weighing a Tax Shield Against a Relationship Cost"
            setup="BCD repurchases 40% of stock funded by $1B new debt @ 12%, T_C = 40%. Suppliers threaten to revoke net-30 credit terms, costing 2% on $1.5B inventory."
            steps={[{ label: 'Tax shield gained', lines: ['$1,000M × 12% × 40% = $48M'] }, { label: 'Strategic/indirect cost', lines: ['2% × $1,500M = $30M (lost favorable trade credit)'] }, { label: 'Net benefit', lines: ['$48M − $30M = +$18M → proceed with the repurchase'] }]}
            answer={{ value: '+$18M', label: 'Net benefit — proceed' }}
            soWhat="A complete capital-structure analysis weighs the tax benefit against ALL costs of leverage — the $30M strategic cost may even understate the true relationship risk, since it’s harder to quantify precisely than the tax savings."
          />
        </Section>
      </NotesPage>

      {/* ───────────── 11 ───────────── */}
      <NotesPage toc={{ title: '11 · LBOs', chapter: C[11] }}>
        <TopicHeader topicNumber={11} title="LBOs" kicker="L6 Slides 21-28 · HW3 Q9" />
        <Aside>
          <Callout chapter={C[11]} label="NOTES">Underwriting red flags to recognize: DSCR &lt; 1.25 and debt ratio &gt; 0.60.</Callout>
          <Memory chapter={C[11]}>Leverage amplifies outcomes, it doesn’t improve the average outcome. If a pitch is just “we used more debt so returns look bigger,” that’s the Return Leverage Fallacy, not value creation.</Memory>
          <Trap chapter={C[11]}><strong className="trap">Don’t treat a high IRR achieved mostly through leverage as proof of skill</strong> — always ask whether EV grew through one of the 4 real sources or just the mechanical leverage-amplification fallacy.</Trap>
        </Aside>
        <p>A leveraged buyout acquires a company using a large proportion of debt relative to the sponsor’s equity check. Genuine LBO value creation comes from four real sources — not from two popular fallacies that merely redistribute risk/return without creating value.</p>
        <Section wide chapter={C[11]} title="Real Value Sources">
          <KeyTermsTable chapter={C[11]} terms={[
            { term: 'Governance engineering', explanation: 'Concentrated ownership, management equity stakes', why: 'Sharper incentives than diffuse public ownership' },
            { term: 'Operational engineering', explanation: 'Cost cuts, efficiency improvements', why: 'Real cash-flow gains, not financial engineering' },
            { term: 'Financial/tax engineering', explanation: 'The debt tax shield, ~10–20% of EV', why: 'Same T_C × D logic as Topic 4' },
            { term: 'Deal-making / timing', explanation: 'Buying and selling at the right market moments', why: 'Skill in identifying mispriced opportunities' },
          ]} />
        </Section>
        <Section wide chapter={C[11]} title="Fallacies — No Real Value">
          <KeyTermsTable chapter={C[11]} terms={[
            { term: 'Return Leverage Fallacy', explanation: 'Leverage mechanically amplifies gains AND losses', why: 'A $100M asset at +50%/−10% unlevered becomes +90%/−30% at 50% debt — net value created = $0' },
            { term: 'Multiple Expansion Fallacy', explanation: 'Assuming exit at a higher multiple than entry, with no operational change to justify it', why: 'Multiples can mean-revert — this is a bet, not value creation' },
          ]} />
        </Section>
      </NotesPage>

      {/* ───────────── 12 ───────────── */}
      <NotesPage toc={{ title: '12 · Short-Termism', chapter: C[12] }}>
        <TopicHeader topicNumber={12} title="Is Short-Termism Good or Bad?" kicker="L7 Slides 27-30 — conceptual, no math" />
        <Aside>
          <Callout chapter={C[12]} label="KEY INSIGHT">Short-termism is bad when it sacrifices real long-run value for an easily-verified near-term number; it can be rational when near-term performance is a genuinely useful (if imperfect) signal of execution quality.</Callout>
        </Aside>
        <p>Managers (or the market) over-weight near-term earnings/cash flows relative to longer-term value, sometimes rejecting projects with a worse near-term profile but a much better long-term payoff. Whether this is “bad” depends on why it happens.</p>
        <Section wide chapter={C[12]} title="Project A vs. Project B (class example)">
          <Flowchart chapter={C[12]} root={{
            label: 'Can the market eventually verify true long-run value?', shape: 'diamond',
            children: [
              { label: 'No', to: { label: 'Short-term signal (B’s strong near-term number) can rationally win, even if A has equal/better eventual value' } },
              { label: 'Yes', to: { label: 'Excessive short-termism destroys value by picking the inferior long-run project to look good today' } },
            ],
          }} />
        </Section>
        <Section chapter={C[12]} title="Exam Approach">
          <p className="prose-sm">Usually tested as a conceptual short-answer (“is short-termism good or bad, explain”) rather than a numeric problem — be ready to argue both directions and identify the condition (<strong>verifiability of long-run value</strong>) that decides which way it goes.</p>
        </Section>
      </NotesPage>

      {/* ───────────── 13 ───────────── */}
      <NotesPage toc={{ title: '13 · Dilution & Equity Issuances', chapter: C[13] }}>
        <TopicHeader topicNumber={13} title="Dilution & Equity Issuances" kicker="L8 Slides 20-22, 27-28 — a named MCQ/short-answer trap" />
        <Aside>
          <Memory chapter={C[13]}>Ownership dilution: you own a smaller % slice. Value dilution: your slice is worth less in dollars. A fair-priced issuance always dilutes ownership but never dilutes value.</Memory>
          <Trap chapter={C[13]}><strong className="trap">Don’t treat every new equity issuance as automatically bad</strong> for existing shareholders just because “ownership gets diluted” — only a mispriced (below-fair-value) issuance actually transfers value away from them.</Trap>
        </Aside>
        <p>Ownership dilution (your % stake falls) is not the same as value dilution (your $ stake falls). Issuing new equity at a fair price dilutes ownership % but does not destroy value for existing shareholders.</p>
        <Section wide chapter={C[13]} title="Direction of the Wealth Transfer">
          <Matrix chapter={C[13]} rowLabels={['Issue price = true value', 'Issue price > true value', 'Issue price < true value']} colLabels={['Existing shareholders’ $ value']} cells={[['Unchanged — ownership % falls, $ value doesn’t'], ['Gain — new buyers overpay'], ['Lose — new buyers get a bargain (what asymmetric info makes more likely)']]} />
        </Section>
        <Section wide chapter={C[13]} title="Worked Example — HW4 Q5A">
          <WorkedExample
            chapter={C[13]}
            title="A Repurchase at the Wrong Price Transfers Wealth"
            setup="400,000 shares, true value $40/share. Firm repurchases 100,000 shares at $50, $40, or $30."
            table={{ columns: ['Repurchase price', 'Final price/share', 'Who gains'], rows: [['$50 (above true value)', '$36.67', 'Sellers — at remaining holders’ expense'], ['$40 (= true value)', '$40.00', 'No transfer'], ['$30 (below true value)', '$43.33', 'Those who stay — at sellers’ expense']] }}
            answer={{ value: 'Wealth moves toward the better-priced side', label: 'Direction of transfer' }}
            soWhat="Mirror-image logic applies to new issuance (HW4 Q5b): issuing ABOVE true value benefits existing holders; issuing BELOW true value costs them. The transfer always runs toward whichever side got the better price relative to true value."
          />
        </Section>
      </NotesPage>

      {/* ───────────── 14 ───────────── */}
      <NotesPage toc={{ title: '14 · Lemons Problem', chapter: C[14] }}>
        <TopicHeader topicNumber={14} title="The Lemons Problem in Equity Markets (Myers-Majluf)" kicker="L8 Slides 24-32 · HW4 — single largest chunk of HW4, likely a full numeric problem" />
        <Aside>
          <Memory chapter={C[14]}>Low type LOVES being pooled in (sells overvalued shares); high type HATES it (refuses to sell undervalued shares) — this asymmetric preference is exactly what makes separation possible. Debt doesn’t suffer this problem because its payoff is capped, so it’s far less sensitive to uncertainty about firm value.</Memory>
          <Trap chapter={C[14]}><strong className="trap">Don’t assume a firm always takes a positive-NPV project</strong> if it can “technically afford it” via equity — Myers-Majluf shows a firm can rationally walk away from a genuinely good project because the only financing route (underpriced equity) would cost existing shareholders more than the project is worth to them.</Trap>
        </Aside>
        <p>When managers know more about firm value than outside investors, the market can’t tell a high-value firm’s equity issuance apart from a low-value firm’s, and prices any issuance at a pooled (average) value. A high-value firm that issues at this pooled price gives away too much to new investors, so it may rationally refuse to issue even to fund a genuinely positive-NPV project — the underinvestment / lemons result. This underlies the pecking order: retained earnings first, then debt, equity only as a last resort.</p>
        <Section wide chapter={C[14]} title="Worked Example — HW4 Q3">
          <WorkedExample
            chapter={C[14]}
            title="A Separating Equilibrium: Low Type Issues Equity, High Type Issues Debt"
            setup="Company X, all-equity. Assets-in-place: $12,000 (low type) or $16,000 (high type), each p=1/2, insiders know which. Growth opportunity costs $8,000, PV=$12,000 (NPV=+$4,000). Market assumes any equity issuer is the low type."
            table={{ columns: ['Choice', 'Low type keeps', 'High type keeps'], rows: [['Do nothing', '$12,000', '$16,000 (forgoes +$4,000 NPV)'], ['Issue debt (flat −$1,000 cost)', '$15,000', '$19,000'], ['Issue equity (priced as pooled low type)', '$16,000', '$18,667']] }}
            steps={[{ label: 'Low type ranks', lines: ['equity $16,000 > debt $15,000 > nothing $12,000 → CHOOSES EQUITY'] }, { label: 'High type ranks', lines: ['debt $19,000 > equity $18,667 > nothing $16,000 → CHOOSES DEBT'] }]}
            answer={{ value: 'Separating equilibrium', label: 'Low → equity, high → debt — self-fulfilling' }}
            soWhat="This exactly matches the market’s assumption that equity issuers are the low type. If the market instead prices equity at the pooled average (HW4 Q3b), both types prefer equity and the separating equilibrium collapses into a pooling equilibrium — know both versions."
          />
        </Section>
      </NotesPage>

      {/* ───────────── 15 ───────────── */}
      <NotesPage toc={{ title: '15 · Convertibles', chapter: C[15] }}>
        <TopicHeader topicNumber={15} title="Convertibles as “Backdoor Equity”" kicker="L9 Slides 34-38 — conceptual only, no math on this topic" />
        <Aside>
          <Callout chapter={C[15]} label="KEY INSIGHT">Convertibles are the natural “solution” to Topic 14’s lemons problem: if equity issuance is too costly (adverse selection) but pure debt doesn’t let investors share in true upside, convertibles let both sides avoid the worst of each pure instrument’s drawback.</Callout>
          <Memory chapter={C[15]}>A deferred, state-contingent equity sale: debt-like downside protection for investors, delayed-equity upside sharing once the market actually learns the firm’s true value.</Memory>
        </Aside>
        <p>A convertible bond lets the holder convert debt into a fixed number of equity shares, typically when the stock price rises enough. Because conversion only happens in good states, convertibles let a firm effectively issue equity on a delayed, state-contingent basis — raising capital now while deferring the equity dilution (and its adverse-selection discount, see Topic 14) until the firm’s true value is more apparent to the market.</p>
        <ConceptCard chapter={C[15]} term="Convertible Payoff" definition="A convertible behaves like straight debt in bad states and like equity in good states." formulas={['\\text{Payoff} = \\max(\\text{promised debt payment},\\ \\text{value of shares upon conversion})']} why="In bad states it protects the under-informed investor from a lemons-style loss, exactly like straight debt. In good states it shares in the upside once uncertainty resolves favorably, exactly like equity." />
      </NotesPage>

      {/* ───────────── Review pages ───────────── */}
      <CheatSheetPage
        toc={{ title: 'Cheat Sheet', chapter: 2 }}
        columns={[
          { chapter: C[1], title: '1 · M-M & Arbitrage', bullets: ['No taxes/distress/info frictions → capital structure irrelevant', 'Mispricing → riskless arbitrage via long/short', 'Always add V(debt)+V(equity), never just equity'], formula: 'V = V(debt) + V(equity)' },
          { chapter: C[2], title: '2 · Undoing Actions', bullets: ['Investors replicate any capital-structure change themselves', 'Home-made leverage: borrow/lend on personal account', 'Specify exact shares & $ amount, not just “it can be done”'] },
          { chapter: C[3], title: '3 · Risky Debt', bullets: ['Value claims at expected payoff, never face value', 'New senior debt w/o covenants transfers wealth from old debt to equity', 'Total firm value still unchanged (M-M check digit)'] },
          { chapter: C[4], title: '4 · Corporate Taxes', bullets: ['Interest tax-deductible → real, permanent cash flow', 'Investors CANNOT personally replicate a corporate tax shield'], formula: 'V_L = V_U + T_C × D' },
          { chapter: C[5], title: '5 · Who Gets the Benefit', bullets: ['Holders at ANNOUNCEMENT capture the gain', 'Execution just completes the paperwork, no new value'], formula: 'ΔV = T_C × ΔD' },
          { chapter: C[6], title: '6 · Miller Model', bullets: ['Personal taxes shrink or reverse debt’s advantage', 'REIT (T_C=0) still has personal tax effects — g ≠ 0 automatically'], formula: 'g = 1 − (1−T_C)(1−T_E)/(1−T_D)' },
          { chapter: C[7], title: '7 · Bankruptcy Costs', bullets: ['Debt bears costs directly, in the default state', 'Equity bears them ex ante, via yields priced in at issuance', 'Distress costs → totals don’t match before/after'] },
          { chapter: C[8], title: '8 · Debt Overhang', bullets: ['Existing senior debt eats new money’s upside for free', 'Positive-NPV project can still be unfinanceable', 'Equal-seniority debt at high F is sometimes the only way in'] },
          { chapter: C[9], title: '9 · Asset Substitution', bullets: ['Equity switches to riskier/worse project post-financing', 'Choice between 2 projects = substitution; can money be raised at all = overhang'] },
          { chapter: C[10], title: '10 · Strategic Costs', bullets: ['Suppliers, customers, employees react to distress RISK, not just filing', 'Weigh tax shield vs. ALL costs, not just legal bankruptcy costs'] },
          { chapter: C[11], title: '11 · LBOs', bullets: ['4 real sources: governance, operations, tax shield, deal-making', '2 fallacies: Return Leverage, Multiple Expansion', 'Red flags: DSCR<1.25, debt ratio>0.60'] },
          { chapter: C[12], title: '12 · Short-Termism', bullets: ['Bad when it sacrifices verifiable long-run value', 'Can be rational if near-term is a useful signal', 'Conceptual only, no math'] },
          { chapter: C[13], title: '13 · Dilution', bullets: ['Ownership % dilution ≠ value ($) dilution', 'Fair price → ownership dilutes, value doesn’t', 'Mispriced issue → wealth moves to the better-priced side'] },
          { chapter: C[14], title: '14 · Lemons Problem', bullets: ['Market prices any issuance at pooled value', 'High type may refuse even a positive-NPV project', 'Pecking order: retained earnings > debt > equity'] },
          { chapter: C[15], title: '15 · Convertibles', bullets: ['Debt in bad states, equity in good states', 'Defers dilution’s adverse-selection discount', 'Conceptual only, no math'] },
        ]}
      />

      <FormulaSheetPage
        toc={{ title: 'Formula Sheet', chapter: 8 }}
        sections={[
          { chapter: C[1], name: '1 · M-M Prop I', rows: [{ concept: 'Firm Value', decomp: 'Debt value plus equity value — independent of the split', tex: 'V = V_D + V_E' }] },
          { chapter: C[3], name: '3 · Risky Debt', rows: [{ concept: 'Value of a Risky Claim', decomp: 'Expected payoff across states, capped by available cash after senior claims', tex: 'V = \\sum_i p_i \\times \\min(\\text{promised},\\ \\text{cash available})' }] },
          { chapter: C[4], name: '4 · Corporate Taxes', rows: [{ concept: 'Levered Firm Value', decomp: 'Unlevered value plus the corporate tax shield on debt', tex: 'V_L = V_U + T_C D' }] },
          { chapter: C[5], name: '5 · Announcement Effect', rows: [{ concept: 'Value Change on Announcement', decomp: 'Tax rate times the change in debt', tex: '\\Delta V = T_C \\times \\Delta D' }] },
          { chapter: C[6], name: '6 · Miller Model', rows: [
            { concept: 'Net Tax Advantage of Debt (g)', decomp: 'One minus the two-tax survival product over the one-tax survivor', tex: 'g = 1 - \\dfrac{(1-T_C)(1-T_E)}{1-T_D}' },
            { concept: 'Levered Firm Value', decomp: 'Unlevered value plus g times debt', tex: 'V_L = V_U + gD' },
          ] },
          { chapter: C[7], name: '7 · Implied Distress Cost', rows: [{ concept: 'Implied Cost', decomp: 'No-distress prediction minus actual observed total value', tex: '\\text{Cost} = (V_D^{pred} + V_E^{pred}) - (V_D^{act} + V_E^{act})' }] },
          { chapter: C[8], name: '8 · Debt Overhang', rows: [{ concept: 'Max Raisable via New Equity/Junior Debt', decomp: 'Expected residual after existing senior debt is paid', tex: '\\mathbb{E}[\\max(CF - D_{senior},\\ 0)]' }] },
          { chapter: C[9], name: '9 · Asset Substitution', rows: [{ concept: 'Equity’s Project Choice', decomp: 'Equity maximizes its own expected residual at face value F, not total NPV', tex: '\\max_{\\text{project}}\\ \\mathbb{E}[\\max(CF - F,\\ 0)]' }] },
          { chapter: C[13], name: '13 · Mispriced Issuance', rows: [{ concept: 'Wealth Transfer', decomp: 'Moves toward whichever side (old vs. new holders) got the better price relative to true value', tex: '\\Delta\\text{wealth} \\propto (\\text{price} - \\text{true value})' }] },
          { chapter: C[14], name: '14 · Lemons / Pooled Pricing', rows: [{ concept: 'Fraction Sold Under Fair Pricing', decomp: 'Capital needed divided by post-money true value', tex: '\\alpha = \\dfrac{\\text{amount raised}}{\\text{post-money value}}' }] },
        ]}
      />

      <QuizPage
        toc={{ title: 'Practice Questions', chapter: 6 }}
        chapter={6}
        kicker="Answers printed right under each question — qualitative first, then numerical"
        questions={[
          { q: 'A firm with existing risky debt is offered a genuinely positive-NPV project but can’t raise financing for it through equity or junior debt at any terms. What is this called, and why does it happen?', a: <><strong>Debt overhang.</strong> Existing senior debtholders capture part of the new project’s upside for free (their claim becomes safer), leaving too little residual value for new investors to recoup their investment — even though the project grows the total pie.</> },
          { q: 'A firm with debt outstanding switches from a safer, positive-NPV project to a riskier, negative-NPV one. What is this called, and why does equity prefer it?', a: <><strong>Asset substitution (risk-shifting).</strong> Equity’s payoff is capped below by limited liability but unlimited above the debt’s face value — extra variance benefits that option-like claim even when it lowers total firm value.</> },
          { q: 'A firm announces it will issue new equity at a price equal to its true per-share value. Does this hurt existing shareholders?', a: <><strong>No.</strong> A fair-priced issuance dilutes ownership percentage but not dollar value — existing shareholders own a smaller slice of a proportionally bigger pie. Only a below-fair-value issuance transfers real wealth away from them.</> },
          { q: 'Why might a genuinely high-value firm refuse to issue equity to fund a positive-NPV project?', a: <><strong>Myers-Majluf:</strong> the market can’t distinguish a high-value issuer from a low-value one, so it prices any issuance at the pooled average. A truly high-value firm would be selling undervalued shares, which can cost existing shareholders more than the project is worth — so it rationally passes.</> },
          { q: 'Why do convertible bonds get called “backdoor equity”?', a: <>Conversion only happens in good states, so a convertible behaves like debt when things go badly (protecting under-informed investors) and like equity when things go well (sharing the upside) — effectively a delayed, state-contingent equity sale that defers the lemons-problem discount.</> },
          { q: 'Numerical: Debt promises $100 at t=1. Firm value will be $200, $100, or $50, each with probability 1/3. What is this debt actually worth today (ignore discounting)?', a: <>(1/3)(100) + (1/3)(100) + (1/3)(50) = <strong>$83.33</strong> — the $100 promise is only fully paid in the two states where firm value ≥ $100; in the $50 state, debt gets only $50.</> },
          { q: 'Numerical: T_C = 35%, T_E = 10%, T_D = 20%. What is Miller’s g, and does debt still add value to the firm?', a: <>g = 1 − [(0.65)(0.90)/(0.80)] = 1 − 0.73125 = <strong>26.875%</strong>. Since g &gt; 0, debt still adds value — Value gained = g × D for any increase in debt.</> },
          { q: 'Numerical: A firm has $70M senior debt. A new project costs $100M and pays $90M or $210M (each p=.5), NPV=+$50M. Can new equity alone raise the $100M?', a: <><strong>No.</strong> Max raisable via new equity = E[max(CF−70,0)] = 0.5(20)+0.5(140) = $80M, which is less than the $100M needed — classic debt overhang.</> },
          { q: 'Numerical: 400,000 shares outstanding, true value $40/share. The firm repurchases 100,000 shares at $50. What happens to the remaining shareholders’ per-share value?', a: <>It falls to about <strong>$36.67/share</strong>. Buying back overvalued shares (above true value) transfers wealth away from the shareholders who remain.</> },
        ]}
      />

      <GlossaryPage
        toc={{ title: 'Glossary', chapter: 12 }}
        chapter={6}
        entries={[
          { term: 'Arbitrage (Home-Made Leverage)', def: 'Combining long and short positions in mispriced, otherwise-identical claims to capture a riskless profit with zero net future cash flow.' },
          { term: 'Asset Substitution', def: 'Equity switches to a riskier, lower/negative-NPV project because the extra variance benefits its option-like, capped-downside claim.' },
          { term: 'Convertible Bond', def: 'Debt that can convert into equity shares, behaving like debt in bad states and equity in good states — a deferred, state-contingent equity sale.' },
          { term: 'Debt Overhang', def: 'Existing risky debt captures part of a new project’s upside for free, which can prevent financing even for genuinely positive-NPV projects.' },
          { term: 'Lemons Problem (Myers-Majluf)', def: 'When the market can’t tell issuer quality apart, it prices any equity issuance at a pooled average — which can make high-value firms refuse to issue even for good projects.' },
          { term: 'M-M Proposition I', def: 'Total firm value is independent of capital structure, absent taxes, distress costs, and information frictions.' },
          { term: 'Miller’s g', def: 'The net tax advantage of debt after corporate, personal-debt, and personal-equity taxes are all netted out.' },
          { term: 'Pecking Order', def: 'Financing preference order — retained earnings, then debt, then equity as a last resort — driven by information asymmetry.' },
          { term: 'Return Leverage Fallacy', def: 'Mistaking leverage’s mechanical amplification of both gains and losses for genuine LBO value creation.' },
          { term: 'Separating Equilibrium', def: 'An equilibrium where different firm types choose different, self-revealing actions (e.g. low type issues equity, high type issues debt).' },
          { term: 'Short-Termism', def: 'Over-weighting near-term performance relative to long-run value — rational when near-term results are a verifiable signal, destructive otherwise.' },
          { term: 'Strategic Costs of Distress', def: 'Indirect costs from stakeholder reactions to financial distress risk — supplier terms, customer loyalty, employee retention — distinct from direct legal bankruptcy costs.' },
          { term: 'Tax Shield (T_C × D)', def: 'The corporate tax saving from deductible interest payments, captured by security holders at the moment a capital-structure change is announced.' },
          { term: 'Value Dilution vs. Ownership Dilution', def: 'Ownership dilution is a smaller % stake; value dilution is a smaller $ stake. A fair-priced issuance causes the former but never the latter.' },
        ]}
      />
    </NotesDocument>
  );
}
