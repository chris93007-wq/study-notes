/** Public API — everything a notes document needs. */
export type { Chapter, Step } from './components/types';
export { ch } from './components/types';

export { Callout } from './components/callouts/Callout';
export { ConceptCard } from './components/concepts/ConceptCard';
export { WorkedExample } from './components/concepts/WorkedExample';
export { Chain } from './components/diagrams/Chain';
export { Flowchart } from './components/diagrams/Flowchart';
export { FormulaTree } from './components/diagrams/FormulaTree';
export { Matrix } from './components/diagrams/Matrix';
export { Mermaid } from './components/diagrams/Mermaid';
export { BarChart, type BarDatum } from './components/charts/BarChart';
export { LineChart, type LineSeries } from './components/charts/LineChart';
export { ScatterPlot, type ScatterPoint } from './components/charts/ScatterPlot';
export { Split } from './components/diagrams/Split';
export { FlashCard, FlashcardGrid } from './components/flashcards/FlashCard';
export { StepPipeline } from './components/flow/StepPipeline';
export { Image } from './components/media/Image';
export { Tex } from './components/math/Tex';
export { ChapterHeader } from './components/structure/ChapterHeader';
export { PageBadge } from './components/structure/PageBadge';
export { PageFooter } from './components/structure/PageFooter';
export { Section } from './components/structure/Section';
export { SectionTitle } from './components/structure/SectionTitle';
export { TopicHeader } from './components/structure/TopicHeader';
export { ComparisonTable } from './components/tables/ComparisonTable';
export { KeyTermsTable } from './components/tables/KeyTermsTable';

export { Grid, Span, Columns, Full, Stack } from './layout/Grid';
export { Aside, Wide } from './layout/Aside';

export { NotesDocument, type TocSpec } from './document/NotesDocument';
export { Page } from './document/Page';
export type { DocumentMeta } from './document/context';

export { CoverPage } from './pages/CoverPage';
export { ContentsPage } from './pages/ContentsPage';
export { TopicMapPage } from './pages/TopicMapPage';
export { NotesPage } from './pages/NotesPage';
export { CheatSheetPage } from './pages/CheatSheetPage';
export { FormulaSheetPage } from './pages/FormulaSheetPage';
export { QuizPage } from './pages/QuizPage';
export { AppendixPage } from './pages/AppendixPage';
export { GlossaryPage } from './pages/GlossaryPage';
