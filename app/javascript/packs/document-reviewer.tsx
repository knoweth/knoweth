import React, { StrictMode } from "react";
import ReactDOM from "react-dom";

const root = document.getElementById("document-reviewer");

ReactDOM.render(
  // Use strict mode for better futureproofness
  <StrictMode>
    <p>Hello!</p>
  </StrictMode>,
  root
);
