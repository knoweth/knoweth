import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import DocumentEditor from "../document-editor/document-editor";

ReactDOM.render(
  <StrictMode>
    <DocumentEditor />
  </StrictMode>,
  document.getElementById("document-editor")
);
