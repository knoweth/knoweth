import { processRepetition, shouldReviewToday } from "../algorithm/anki";
import ReviewQuality from "../algorithm/review-quality";
import Knowledge from "../data/knowledge";
import { shuffle } from "lodash";
import React, { useEffect, useReducer, useState } from "react";
import { Node, Path } from "slate";
import parseDocument, { Card, getCells } from "./card-parser";
import moment from "moment";
import produce from "immer";
import ReviewSaver from "./review-saver";
import SlateEditor from "../document-editor/slate-editor";
import ReviewOverlay from "./review-overlay";

function reviewerReducer(
  state: Card[],
  action: {
    type: "review";
    payload: { quality: ReviewQuality; cardId: string };
  }
) {
  // Use immer to return a new state while being able to modify it mutably
  return produce(state, (draftState) => {
    switch (action.type) {
      case "review":
        const { quality, cardId } = action.payload;
        const cardIndex = draftState.findIndex((c) => c.cardId === cardId);
        const k = draftState[cardIndex].knowledge;

        const newK = processRepetition(
          k,
          quality,
          moment().diff(k.lastReview.add(k.interval), "days")
        );
        console.log("new card knowledge:", newK);
        draftState[cardIndex].knowledge = newK;
        break;
      default:
        throw new Error();
    }
  });
}

function toggleCardVisibility(
  doc: Node[],
  cardPath: Path,
  hidden: boolean
): Node[] {
  const { answerPath } = getCells(cardPath);

  // Set the answer to be hidden or not
  return produce(doc, (draft) => {
    let cur: Node = draft[answerPath[0]];
    for (let i = 1; i < answerPath.length; i++) {
      cur = cur.children[answerPath[i]];
    }

    cur.hidden = hidden;
  });
}

function getElementOffset(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
  };
}

export default function DocumentReviewer({
  docContent,
  priorKnowledge,
  documentId,
}: {
  docContent: Node[];
  // Map card id to knowledge known before
  priorKnowledge: Map<string, Knowledge>;
  documentId: number;
}) {
  const [content, setContent] = useState(docContent);
  const [isHidingCard, setIsHidingCard] = useState(true);
  const [cards, dispatch] = useReducer(
    reviewerReducer,
    parseDocument(docContent, priorKnowledge)
  );

  const reviewableCards = cards.filter((card) =>
    shouldReviewToday(moment(), card.knowledge)
  );

  const currentCard = reviewableCards[0];

  useEffect(() => {
    if (currentCard !== undefined) {
      console.log("Toggling card visibility", docContent, isHidingCard);
      setContent(
        toggleCardVisibility(docContent, currentCard.path, isHidingCard)
      );
    }
  }, [docContent, currentCard, isHidingCard]);

  // Scroll to hidden card
  useEffect(() => {
    const hiddenAns: HTMLElement = document.querySelector(
      "[data-cell-hidden=true]"
    );
    console.log("Hidden el:", hiddenAns);
    if (hiddenAns !== null) {
      const { top } = getElementOffset(hiddenAns);
      console.log("Scrolling to", top);
      window.scroll({ top, behavior: "smooth" });
    }
  }, [content]);

  return (
    // A note: review saver should always exist so that it can push the latest
    // changes.
    <>
      <ReviewSaver cards={cards} documentId={documentId} />
      <ReviewOverlay
        currentCard={currentCard}
        key={currentCard?.cardId}
        onReveal={() => {
          setIsHidingCard(false);
        }}
        onFeedback={(q) => {
          console.log("Dispatching review: ", currentCard);
          dispatch({
            type: "review",
            payload: { quality: q, cardId: currentCard.cardId },
          });
          setIsHidingCard(true);
        }}
      />

      <SlateEditor interactive={false} value={content} />
    </>
  );
}
