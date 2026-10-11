import {
  Aside, Callout, CheatSheetPage, ConceptCard, ContentsPage, CoverPage, FormulaSheetPage, GlossaryPage, NotesDocument,
  NotesPage, QuizPage, Section, SectionTitle, TopicHeader, TopicMapPage, WorkedExample, type Chapter,
} from '@notes';

/**
 * Starter packet — copied by `npm run new -- <name>`. Replace the TODO content.
 * Rules of the system: docs/AUTHORING.md.
 */

// One chapter color per topic — used on its Contents badge, flashcard, notes page and review columns.
// Pick contrasting hues (1 indigo · 2 orange · 3 teal · 4 pink · 5 lime · 6 deep purple · 7 amber ·
// 8 light blue · 9 deep orange · 10 purple · 11 cyan · 12 light green · 13 blue).
const C = {
  overview: 1,
  topicA: 7,
  topicB: 11,
  cheat: 9,
  formulas: 5,
  practice: 10,
  glossary: 6,
} satisfies Record<string, Chapter>;

export default function Notes() {
  return (
    <NotesDocument meta={{ title: '__TITLE__', subtitle: 'TODO subtitle', course: 'TODO COURSE · Course name', week: 'Week N', author: 'Christine John', brandChapter: 1 }}>
      <CoverPage dots={[C.topicA, C.topicB]} />
      <ContentsPage />

      <TopicMapPage
        toc={{ title: 'Topic Map (Overview)', chapter: C.overview }}
        subtitle="TODO one-line hook"
        cards={[
          { title: 'Topic A', chapter: C.topicA, definition: 'TODO plain-language definition.', formula: 'TODO formula, in words.', why: 'TODO the why.' },
          { title: 'Topic B', chapter: C.topicB, definition: 'TODO plain-language definition.', why: 'TODO the why.' },
        ]}
      >
        <SectionTitle chapter={C.overview}>Introduction</SectionTitle>
        <Aside><Callout chapter={C.overview} label="KEY INSIGHT">TODO</Callout></Aside>
        <p>TODO intro paragraph. <mark>The one sentence to remember.</mark></p>
      </TopicMapPage>

      <NotesPage toc={{ title: 'Topic A', chapter: C.topicA }}>
        <TopicHeader topicNumber={2} title="Topic A" kicker="TODO what this page covers" />
        {/* Callouts go in the margin: an <Aside> just before the text it annotates. */}
        <Aside>
          <Callout chapter={C.topicA} label="MEMORY AID">TODO</Callout>
          <Callout chapter={C.topicA} label="EXAM TRAP">TODO</Callout>
        </Aside>
        <p>TODO dense notes paragraph.</p>
        <ConceptCard chapter={C.topicA} term="TODO term" definition="TODO" formulas={['a = \\dfrac{b}{c}']} why="TODO" />
                <WorkedExample chapter={C.topicA} title="TODO" setup="TODO" steps={[{ label: 'TODO', lines: ['TODO'] }]} answer={{ value: 'TODO', label: 'TODO' }} soWhat="TODO" />
      </NotesPage>

      <NotesPage toc={{ title: 'Topic B', chapter: C.topicB }}>
        <TopicHeader topicNumber={3} title="Topic B" />
        <p>TODO</p>
      </NotesPage>

      <CheatSheetPage
        toc={{ title: 'Cheat Sheet', chapter: C.cheat }}
        columns={[
          { chapter: C.topicA, title: 'Topic A', bullets: ['TODO'], formula: 'TODO' },
          { chapter: C.topicB, title: 'Topic B', bullets: ['TODO'] },
        ]}
      />
      <FormulaSheetPage
        toc={{ title: 'Formula Sheet', chapter: C.formulas }}
        sections={[{ chapter: C.topicA, name: 'Topic A', rows: [{ concept: 'TODO', decomp: 'TODO in words', tex: 'a = b + c' }] }]}
      />
      <QuizPage toc={{ title: 'Practice Questions', chapter: C.practice }} chapter={C.practice} kicker="TODO one line" questions={[{ q: 'TODO question?', a: 'TODO answer.' }]} />
      <GlossaryPage toc={{ title: 'Glossary', chapter: C.glossary }} chapter={C.glossary} entries={[{ term: 'TODO', def: 'TODO' }]} />
    </NotesDocument>
  );
}
