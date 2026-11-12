import {
  Aside, AppendixPage, Callout, CheatSheetPage, ComparisonTable, ConceptCard, ContentsPage, CoverPage, FormulaSheetPage, GlossaryPage,
  NotesDocument, NotesPage, Objectives, QuizPage, SectionTitle, TopicHeader, TopicMapPage, WorkedExample, type Chapter,
} from '@notes';

/**
 * Starter packet — copied by `npm run new -- <name> "Title" --with cover,contents,map,…`.
 *
 * Only the Notes pages are core. Every other page is a supplement that is kept only when it adds value to what these notes are
 * for; `npm run new` strips the optional blocks you don't ask for. Rules of the system: docs/AUTHORING.md.
 * Every topic reads like a textbook page: short paragraph blocks alternating with cards, tables and diagrams (see Topic A).
 *
 *   cover     a packet that will be printed or shared (about 4+ sheets)           skip for a short note
 *   contents  4+ sheets or 3+ topics, so a reader can jump                        skip for 1–3 sheets
 *   map       3+ topics whose order / relationship helps, or a process, ladder     skip for a single topic
 *             or framework worth seeing at a glance (also: <ProcessMap> inside a notes page)
 *   cheat     exam prep / quick recall across 2+ topics                           skip for a single topic or a case
 *   formulas  3+ formulas the reader must recall or apply                         skip for qualitative or case notes
 *   quiz      the source has questions, or the goal is self-testing               skip for plain reading / case notes
 *   glossary  about 8+ new terms                                                  skip otherwise (define them in the notes)
 *   appendix  reference data or a derivation that would clutter the topics        skip otherwise
 */

// One chapter color per topic — used on its Contents badge, map card, notes page and review columns.
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
  appendix: 3,
} satisfies Record<string, Chapter>;

export default function Notes() {
  return (
    <NotesDocument meta={{ title: '__TITLE__', subtitle: 'TODO subtitle', course: 'TODO COURSE · Course name', week: 'Week N', author: 'Christine John', brandChapter: 1 }}>
      {/* @optional cover */}
      <CoverPage dots={[C.topicA, C.topicB]} />
      {/* @end cover */}
      {/* @optional contents */}
      <ContentsPage />
      {/* @end contents */}

      {/* @optional map */}
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
        {/* Can-do sentences from the content tree's node questions; mark beyond-exam items { text, extension: true }. */}
        <Objectives chapter={C.overview} items={['TODO can-do sentence.', 'TODO can-do sentence.']} />
      </TopicMapPage>
      {/* For a process, ladder or framework instead of a topic overview: <MapPage flow="arrows" nodes={[…]} /> (a page) or <ProcessMap …/> (inside a notes page). */}
      {/* @end map */}

      <NotesPage toc={{ title: 'Topic A', chapter: C.topicA }}>
        <TopicHeader title="Topic A" kicker="TODO what this page covers" />
        {/* Callouts go in the margin: an <Aside> just before the text it annotates. */}
        <Aside>
          <Callout chapter={C.topicA} label="MEMORY AID">TODO</Callout>
          <Callout chapter={C.topicA} label="EXAM TRAP">TODO</Callout>
        </Aside>
        {/* Textbook rhythm: a short paragraph block (1–2 paragraphs, about 60 words each), then an element, then a block, then an element. */}
        <p>TODO lead-in: what this topic is and why it matters.</p>
        <ConceptCard chapter={C.topicA} term="TODO term" definition="TODO" formulas={['a = \\dfrac{b}{c}']} why="TODO" />
        <p>TODO bridge: what to notice in the example below.</p>
        <WorkedExample chapter={C.topicA} title="TODO" setup="TODO" steps={[{ label: 'TODO', lines: ['TODO'] }]} answer={{ value: 'TODO', label: 'TODO' }} soWhat="TODO" />
        <p>TODO takeaway, one sentence. <mark>The one thing to remember.</mark></p>
      </NotesPage>

      <NotesPage toc={{ title: 'Topic B', chapter: C.topicB }}>
        <TopicHeader title="Topic B" />
        <p>TODO</p>
      </NotesPage>

      {/* @optional cheat */}
      <CheatSheetPage
        toc={{ title: 'Cheat Sheet', chapter: C.cheat }}
        columns={[
          { chapter: C.topicA, title: 'Topic A', bullets: ['TODO'], formula: 'TODO' },
          { chapter: C.topicB, title: 'Topic B', bullets: ['TODO'] },
        ]}
      />
      {/* @end cheat */}
      {/* @optional formulas */}
      <FormulaSheetPage
        toc={{ title: 'Formula Sheet', chapter: C.formulas }}
        sections={[{ chapter: C.topicA, name: 'Topic A', rows: [{ concept: 'TODO', decomp: 'TODO in words', tex: 'a = b + c' }] }]}
      />
      {/* @end formulas */}
      {/* @optional quiz */}
      {/* Order easy → hard; tag skill/level/marks; use parts for a/b/c, bank for fill-in-the-blank. */}
      <QuizPage toc={{ title: 'Practice Questions', chapter: C.practice }} chapter={C.practice} kicker="TODO one line" questions={[
        { q: 'TODO recall question?', a: 'TODO answer.', skill: 'recall', level: 1 },
        { q: 'TODO applied question', skill: 'analysis', level: 3, parts: [{ q: 'TODO part a?', a: 'TODO.', marks: 2 }, { q: 'TODO part b?', a: 'TODO.', marks: 4 }] },
      ]} />
      {/* @end quiz */}
      {/* @optional glossary */}
      <GlossaryPage toc={{ title: 'Glossary', chapter: C.glossary }} chapter={C.glossary} entries={[{ term: 'TODO', def: 'TODO' }]} />
      {/* @end glossary */}
      {/* @optional appendix */}
      <AppendixPage toc={{ title: 'Appendix', chapter: C.appendix }} label="Appendix A" title="TODO reference data" intro="TODO one line on what this is and why it is here.">
        <ComparisonTable chapter={C.appendix} columns={[{ key: 'a', label: 'TODO' }, { key: 'b', label: 'TODO' }]} rows={[{ a: 'TODO', b: 'TODO' }]} />
      </AppendixPage>
      {/* @end appendix */}
    </NotesDocument>
  );
}
