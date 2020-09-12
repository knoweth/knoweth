import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import DocumentEditor from "../document-editor/document-editor";

const root = document.getElementById("document-editor");

const initialContent = root.dataset.initialContent;

ReactDOM.render(
  // Use strict mode for better futureproofness
  <StrictMode>
    <DocumentEditor initialContent={initialContent} />
  </StrictMode>,
  root
);
