import { processRepetition, shouldReviewToday } from "../algorithm/anki";
import ReviewQuality from "../algorithm/review-quality";
import Knowledge from "../data/knowledge";
import { cloneDeep, shuffle } from "lodash";
import React, { useEffect, useReducer, useState } from "react";
import { Editor, Node, Path, Transforms } from "slate";
import parseDocument, { Card, getCells } from "./card-parser";
import moment from "moment";
import produce from "immer";
import ReviewSaver from "./review-saver";
import SlateEditor from "../document-editor/slate-editor";

function ReviewOverlay({
  currentCard,
  onReveal,
  onFeedback,
}: {
  currentCard: Card;
  onReveal: () => void;
  onFeedback: (quality: ReviewQuality) => void;
}) {
  const [answerShown, setAnswerShown] = useState(false);
  function showAnswer() {
    setAnswerShown(true);
    onReveal();
  }

  useEffect(() => {
    setAnswerShown(false);
  }, [currentCard]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === " ") {
        showAnswer();
      } else if (answerShown) {
        switch (e.key) {
          case "1":
            onFeedback(ReviewQuality.AGAIN);
            break;
          case "2":
            onFeedback(ReviewQuality.HARD);
            break;
          case "3":
            onFeedback(ReviewQuality.GOOD);
            break;
          case "4":
            onFeedback(ReviewQuality.EASY);
            break;
        }
      }
    }

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [answerShown]);

  return (
    <div className="card">
      <div className="card-body text-center">
        {!answerShown && (
          <p>
            <button className="btn btn-secondary" onClick={() => showAnswer()}>
              Show Answer
            </button>
          </p>
        )}
        {answerShown && (
          <>
            <div className="btn-group">
              <button
                className="btn btn-danger"
                onClick={() => onFeedback(ReviewQuality.AGAIN)}
              >
                Again
              </button>
              <button
                className="btn btn-warning"
                onClick={() => onFeedback(ReviewQuality.HARD)}
              >
                Hard
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onFeedback(ReviewQuality.GOOD)}
              >
                Good
              </button>
              <button
                className="btn btn-success"
                onClick={() => onFeedback(ReviewQuality.EASY)}
              >
                Easy
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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

  const reviewableCards = shuffle(
    cards.filter((card) => shouldReviewToday(moment(), card.knowledge))
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

  return (
    // A note: review saver should always exist so that it can push the latest
    // changes.
    <>
      <ReviewSaver cards={cards} documentId={documentId} />
      {currentCard !== undefined && (
        <ReviewOverlay
          currentCard={currentCard}
          // Rerender the card if our knowledge about it changes - that means we
          // clicked an answer button.
          key={JSON.stringify(currentCard.knowledge)}
          onReveal={() => {
            setIsHidingCard(false);
          }}
          onFeedback={(q) => {
            dispatch({
              type: "review",
              payload: { quality: q, cardId: currentCard.cardId },
            });
            setIsHidingCard(true);
          }}
        />
      )}
      {currentCard === undefined && (
        // We reviewed the whole thing!
        <p>There are no more cards to review!</p>
      )}

      <SlateEditor interactive={false} value={content} />
    </>
  );
}
