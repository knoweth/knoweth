import { processRepetition, shouldReviewToday } from "../algorithm/anki";
import ReviewQuality from "../algorithm/review-quality";
import Knowledge from "../data/knowledge";
import { shuffle } from "lodash";
import React, { useEffect, useReducer, useState } from "react";
import { Node } from "slate";
import parseDocument, { Card } from "./card-parser";
import moment from "moment";
import produce from "immer";
import ReviewSaver from "./review-saver";

function CardRenderer({
  currentCard,
  onFeedback,
}: {
  currentCard: Card;
  onFeedback: (quality: ReviewQuality) => void;
}) {
  const [answerShown, setAnswerShown] = useState(false);

  useEffect(() => {
    setAnswerShown(false);
  }, [currentCard]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === " ") {
        setAnswerShown(true);
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
        <p>{currentCard.left}</p>

        {!answerShown && (
          <p>
            <button
              className="btn btn-secondary"
              onClick={() => setAnswerShown(true)}
            >
              Show Answer
            </button>
          </p>
        )}
        {answerShown && (
          <>
            <hr />
            <p>{currentCard.right}</p>
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
    return draftState;
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
  const [cards, dispatch] = useReducer(
    reviewerReducer,
    parseDocument(docContent, priorKnowledge)
  );

  const reviewableCards = shuffle(
    cards.filter((card) => shouldReviewToday(moment(), card.knowledge))
  );

  const currentCard = reviewableCards[0];

  return (
    // A note: review saver should always exist so that it can push the latest
    // changes.
    <>
      <ReviewSaver cards={cards} documentId={documentId} />
      {currentCard !== undefined && (
        <CardRenderer
          currentCard={currentCard}
          // Rerender the card if our knowledge about it changes - that means we
          // clicked an answer button.
          key={JSON.stringify(currentCard.knowledge)}
          onFeedback={(q) =>
            dispatch({
              type: "review",
              payload: { quality: q, cardId: currentCard.cardId },
            })
          }
        />
      )}
      {currentCard === undefined && (
        // We reviewed the whole thing!
        <p>There are no more cards to review!</p>
      )}
    </>
  );
}
