import { Node } from "slate";
import { createUnreviewedKnowledge } from "algorithm/anki";
import Knowledge from "data/knowledge";

/**
 * A flashcard to review
 */
export type Card = {
  cardId: string;
  left: string;
  right: string;
  knowledge: Knowledge;
};

export default function parseDocument(docNodes: Node[]) {
  // Hello, breadth-first search.
  const data: Card[] = [];
  const queue: Node[] = [];
  queue.push(...docNodes);

  while (queue.length !== 0) {
    const cur = queue.shift();
    const cardId: string | undefined = (cur as any).cardId;
    const children: Node[] | undefined = cur.children as Node[];
    if (cardId !== undefined) {
      // LADIES, GENTLEMEN, AND NONBINARY INDIVIDUALS, we have reached a
      // flashcard.
      data.push({
        cardId,
        // TODO this is a little hacky in that it won't work at all
        // with formatting.
        left: children[0].children[0].text as string,
        right: children[1].children[0].text as string,
        knowledge: createUnreviewedKnowledge(),
      });
    }

    if (children !== undefined) {
      queue.push(...children);
    }
  }

  return data;
}
