import { createUnreviewedKnowledge } from "../algorithm/anki";
import parseDocument from "./card-parser";

it("parses a simple tree with no preexisting knowledge", () => {
  const cards = parseDocument(
    [
      {
        type: "q-note",
        cardId: "tess",
        children: [
          {
            type: "q-cell",
            children: [{ text: "hi" }],
          },
          {
            type: "q-cell",
            children: [{ text: "hi" }],
          },
        ],
      },
    ],
    new Map()
  );

  expect(cards.length).toBe(1);
  expect(cards[0].cardId).toBe("tess");
});

it("parses a tree with preexisting knowledge", () => {
  const cards = parseDocument(
    [
      {
        type: "q-note",
        cardId: "tess",
        children: [
          {
            type: "q-cell",
            children: [{ text: "hi" }],
          },
          {
            type: "q-cell",
            children: [{ text: "hi" }],
          },
        ],
      },
    ],
    new Map([["tess", { ...createUnreviewedKnowledge(), easeFactor: 5 }]])
  );

  expect(cards.length).toBe(1);
  expect(cards[0].knowledge.easeFactor).toBe(5);
});
