import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { processRepetition } from "../algorithm/anki";
import ReviewQuality from "../algorithm/review-quality";
import Knowledge from "../data/knowledge";
import { Card } from "./card-parser";

const FloatingCard = styled.div`
  position: fixed;
  bottom: 2em;
  right: 0;
  left: 0;
  margin: 0 auto;

  // Fit content, don't stretch across whole viewport
  width: max-content;

  // Mildly see-through
  opacity: 80%;
  backdrop-filter: blur(5px);

  // Show above everything
  z-index: 1;
`;

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
    <FloatingCard className="card">
      {currentCard === undefined ? (
        <div className="card-body">
          <strong>There are no more cards to review!</strong>
        </div>
      ) : (
        <div className="card-body text-center">
          {!answerRevealed && (
            <p>
              <button
                className="btn btn-secondary"
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
                  className="btn btn-danger"
                  onClick={() => onFeedback(ReviewQuality.AGAIN)}
                >
                  Again
                  <br />
                  <ReviewTime
                    knowledge={currentCard.knowledge}
                    quality={ReviewQuality.AGAIN}
                  />
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => onFeedback(ReviewQuality.HARD)}
                >
                  Hard
                  <br />
                  <ReviewTime
                    knowledge={currentCard.knowledge}
                    quality={ReviewQuality.HARD}
                  />
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => onFeedback(ReviewQuality.GOOD)}
                >
                  Good
                  <br />
                  <ReviewTime
                    knowledge={currentCard.knowledge}
                    quality={ReviewQuality.GOOD}
                  />
                </button>
                <button
                  className="btn btn-success"
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
    </FloatingCard>
  );
}
