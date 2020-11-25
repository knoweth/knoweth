import React, { useEffect, useState } from "react";
import ReviewQuality from "../algorithm/review-quality";
import { Card } from "./card-parser";

export default function ReviewOverlay({
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
