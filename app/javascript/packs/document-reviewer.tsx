import DocumentReviewer from "document-reviewer/document-reviewer";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";

const root = document.getElementById("document-reviewer");

const docContent = JSON.parse(root.dataset.documentContent);
const documentId = +root.dataset.documentId;

ReactDOM.render(
  // Use strict mode for better futureproofness
  <StrictMode>
    <DocumentReviewer
      docContent={docContent}
      initialReviews={[]}
      documentId={documentId}
    />
  </StrictMode>,
  root
);
