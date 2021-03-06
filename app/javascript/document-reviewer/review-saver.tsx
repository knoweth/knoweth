import React from "react";
import csrfToken from "../util/csrf-token";
import useServerSync from "../syncing/use-server-sync";
import { Card } from "./card-parser";
import SyncBadge from "../syncing/sync-badge";

export default function ReviewSaver({
  cards,
  documentId,
}: {
  cards: Card[];
  documentId: number;
}) {
  const syncStatus = useServerSync(
    cards,
    async (newCards, abortController) => {
      await fetch("/knowledge/upsert", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          knowledges: newCards.map((c) => ({
            card_id: c.cardId,
            document_id: documentId,
            // Plus is required here because in rails, this is stored as a
            // decimal, which when serialized becomes a string.
            ease_factor: c.knowledge.easeFactor,
            interval_s: c.knowledge.interval.asSeconds(),
            learning_step: c.knowledge.learningStep,
            repetitions: c.knowledge.repetitions,
            last_review: c.knowledge.lastReview,
          })),
        }),
        signal: abortController.signal,
      }).then((res) => {
        if (!res.ok) {
          throw new Error("nak");
        }
      });
    },
    1000
  );

  return <SyncBadge status={syncStatus} />;
}
