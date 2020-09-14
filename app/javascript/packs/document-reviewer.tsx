import Knowledge from "../data/knowledge";
import DocumentReviewer from "../document-reviewer/document-reviewer";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import moment from "moment";

const root = document.getElementById("document-reviewer");

const docContent = JSON.parse(root.dataset.documentContent);
const documentId = +root.dataset.documentId;
// Here, we will parse the knowledge from rails into a more amenable mapping
const priorKnowledgeFromRails = JSON.parse(
  root.dataset.priorKnowledge
);
const priorKnowledge = new Map<string, Knowledge>();

for (const k of priorKnowledgeFromRails) {
  priorKnowledge.set(k.card_id, {
    easeFactor: k.easeFactor,
    interval: moment.duration(k.interval_s, "seconds"),
    learningStep: k.learning_step,
    repetitions: k.repetitions,
    lastReview: moment(k.last_review),
  });
}

ReactDOM.render(
  // Use strict mode for better futureproofness
  <StrictMode>
    <DocumentReviewer
      docContent={docContent}
      priorKnowledge={priorKnowledge}
      documentId={documentId}
    />
  </StrictMode>,
  root
);
