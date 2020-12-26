import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { processRepetition } from "../algorithm/anki";
import ReviewQuality from "../algorithm/review-quality";
import Knowledge from "../data/knowledge";
import { Card } from "./card-parser";

function ReviewTime({
  knowledge,
  quality,
}: {
  knowledge: Knowledge;
  quality: ReviewQuality;
}) {
  const { interval } = processRepetition(knowledge, quality, 0);

  return <small>{interval.humanize()}</small>;
}

/**
 * A floating reviewing overlay used on the review page.
 */
export default function ReviewOverlay({
  currentCard,
  onReveal,
  onFeedback,
}: {
  currentCard: Card | undefined;
  onReveal: () => void;
  onFeedback: (quality: ReviewQuality) => void;
}) {
  const [answerRevealed, setAnswerRevealed] = useState(false);
  function revealAnswer() {
    setAnswerRevealed(true);
    onReveal();
  }

  // Un-reveal answer if card changes
  useEffect(() => {
    setAnswerRevealed(false);
  }, [currentCard]);

  // Listen for keypresses Anki-style
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === " ") {
        e.preventDefault();
        revealAnswer();
      } else if (answerRevealed) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            onFeedback(ReviewQuality.AGAIN);
            break;
          case "2":
            e.preventDefault();
            onFeedback(ReviewQuality.HARD);
            break;
          case "3":
            e.preventDefault();
            onFeedback(ReviewQuality.GOOD);
            break;
          case "4":
            e.preventDefault();
            onFeedback(ReviewQuality.EASY);
            break;
        }
      }
    }

    if (currentCard !== undefined) {
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [currentCard, answerRevealed]);

  return (
    <div
      className="fixed bottom-4 right-0 left-0 mx-auto w-max z-10 opacity-80
                 p-3 bg-gray-300 rounded shadow"
    >
      {currentCard === undefined ? (
        <strong>There are no more cards to review!</strong>
      ) : (
        <div className="text-center">
          {!answerRevealed && (
            <p>
              <button
                className="btn bg-blue-600 text-blue-100"
                onClick={() => revealAnswer()}
              >
                Show Answer
              </button>
            </p>
          )}
          {answerRevealed && (
            <>
              <div className="btn-group">
                <button
                  className="btn bg-red-700 text-red-100"
                  onClick={() => onFeedback(ReviewQuality.AGAIN)}
                >
                  Again
                  <br />
                  <ReviewTime
                    knowledge={currentCard.knowledge}
                    quality={ReviewQuality.AGAIN}
                  />
                </button>{" "}
                <button
                  className="btn bg-yellow-700 text-yellow-100"
                  onClick={() => onFeedback(ReviewQuality.HARD)}
                >
                  Hard
                  <br />
                  <ReviewTime
                    knowledge={currentCard.knowledge}
                    quality={ReviewQuality.HARD}
                  />
                </button>{" "}
                <button
                  className="btn bg-green-700 text-green-100"
                  onClick={() => onFeedback(ReviewQuality.GOOD)}
                >
                  Good
                  <br />
                  <ReviewTime
                    knowledge={currentCard.knowledge}
                    quality={ReviewQuality.GOOD}
                  />
                </button>{" "}
                <button
                  className="btn bg-blue-700 text-blue-100"
                  onClick={() => onFeedback(ReviewQuality.EASY)}
                >
                  Easy
                  <br />
                  <ReviewTime
                    knowledge={currentCard.knowledge}
                    quality={ReviewQuality.EASY}
                  />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
