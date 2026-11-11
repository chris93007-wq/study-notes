import { Aside, Callout, NotesDocument, SectionTitle, TopicMapPage, type Chapter, type TreeNode } from '@notes';

/**
 * Reference for a Topic Map drawn as the content tree (the Pyramid-Principle tree of the session): shapes for the root and the
 * branches, bulleted lists for the leaves, a sub-branch that has children of its own (Six paths) as a smaller shape with its own
 * bullets. Each top-level branch takes the chapter color of the topic it belongs to.
 */
const C = { overview: 1, errc: 4, paths: 10, canvas: 11, model: 9 } satisfies Record<string, Chapter>;

const tree: TreeNode = {
  label: 'Creating new value',
  children: [
    { label: 'Increase buyer value', chapter: C.errc, children: ['Raise', 'Create', { label: 'Six paths', chapter: C.paths, children: ['1 Substitutes', '2 Strategic groups', '3 Buyer chain', '4 Complements', '5 Function-emotion', '6 Time'] }] },
    { label: 'Lower cost', chapter: C.errc, children: ['Eliminate', 'Reduce'] },
    { label: 'Strategy canvas', chapter: C.canvas, children: ['Value curve'] },
    { label: 'Business model innovation', chapter: C.model, children: ['1 Analogize, combine', '2 What-if', '3 Reconfigure value net', '4 Continuous morphing'] },
  ],
};

export default function Session4TopicMap() {
  return (
    <NotesDocument meta={{ title: 'Creating New Value', subtitle: 'Break the value-cost trade-off', course: 'SAMPLE · Topic map as a tree', week: 'Session 4', author: 'Christine John' }}>
      <TopicMapPage
        toc={{ title: 'Topic Map (Overview)', chapter: C.overview }}
        subtitle="Break the value-cost trade-off · look across boundaries · keep rotating"
        heading="How Session 4 is structured"
        tree={tree}
      >
        <SectionTitle chapter={C.overview}>Introduction</SectionTitle>
        <Aside><Callout chapter={C.overview} label="KEY INSIGHT">Value innovation is the idea; the other topics are tools for finding and sustaining it.</Callout></Aside>
        <p>Conventional strategy treats the industry as given and fights for share inside it. <mark>Value innovators reshape the industry instead</mark>, by asking what buyers value and how to offer it at much lower cost.</p>
      </TopicMapPage>
    </NotesDocument>
  );
}
