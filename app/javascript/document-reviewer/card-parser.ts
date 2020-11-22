import { Node, Path } from "slate";
import { createUnreviewedKnowledge } from "../algorithm/anki";
import Knowledge from "../data/knowledge";

/**
 * A flashcard to review
 */
export type Card = {
  cardId: string;
  path: Path;
  knowledge: Knowledge;
};

function processTree(
  node: Node,
  curPath: Path,
  priorKnowledge: Map<string, Knowledge>,
  data: Card[]
) {
  const cardId = node.cardId as string | undefined;
  const children = node.children as Node[] | undefined;

  // Base case
  if (cardId !== undefined) {
    // LADIES, GENTLEMEN, AND NONBINARY INDIVIDUALS, we have reached a
    // flashcard.
    data.push({
      cardId,
      path: curPath,
      // Here's where the knowledge gets made.
      knowledge: priorKnowledge.has(cardId)
        ? priorKnowledge.get(cardId)
        : createUnreviewedKnowledge(),
    });
    return;
  }

  // Recursive case
  if (children !== undefined) {
    for (let i = 0; i < children.length; i++) {
      processTree(children[i], curPath.concat(i), priorKnowledge, data);
    }
  }
}

export default function parseDocument(
  docNodes: Node[],
  priorKnowledge: Map<string, Knowledge>
) {
  // Hello, recursive search.
  const data: Card[] = [];
  for (let i = 0; i < docNodes.length; i++) {
    processTree(docNodes[i], [i], priorKnowledge, data);
  }

  return data;
}

export function getCells(
  cardPath: Path
): { questionPath: Path; answerPath: Path } {
  return { questionPath: cardPath.concat(0), answerPath: cardPath.concat(1) };
}
