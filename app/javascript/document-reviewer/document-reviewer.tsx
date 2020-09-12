import ReviewQuality from "algorithm/review-quality";
import Knowledge from "data/knowledge";
import React, { useEffect, useState } from "react";
import { Node } from "slate";
import parseDocument, { Card } from "./card-parser";

function CardRenderer({
  currentCard,
  onFeedback,
}: {
  currentCard: Card;
  onFeedback: (quality: ReviewQuality) => void;
}) {
  const [answerShown, setAnswerShown] = useState(false);

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

export default function DocumentReviewer({
  docContent,
  initialReviews,
}: {
  docContent: Node[];
  initialReviews: Knowledge[];
}) {
  const cards = parseDocument(docContent);
  return (
    <CardRenderer currentCard={cards[0]} onFeedback={(q) => console.log(q)} />
  );
}
