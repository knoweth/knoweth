import { createUnreviewedKnowledge } from "algorithm/anki";
import Knowledge from "data/knowledge";
import React from "react";
import { Node } from "slate";

function generateInitialKnowledge(content: Node[]) {
  // Hello, breadth-first search.
  const knowledgeMap = new Map<string, Knowledge>();
  const queue: Node[] = [];
  queue.push(...content);

  while (queue.length !== 0) {
    const cur = queue.shift();
    const cardId: string | undefined = (cur as any).cardId;
    if (cardId !== undefined) {
      knowledgeMap.set(cardId, createUnreviewedKnowledge());
    }

    if (cur.children !== undefined) {
      queue.push(...(cur.children as Node[]));
    }
  }

  return knowledgeMap;
}

export default function DocumentReviewer({
  docContent,
  initialReviews,
}: {
  docContent: Node[];
  initialReviews: Knowledge[];
}) {
  console.log(generateInitialKnowledge(docContent));
  return <></>;
}
