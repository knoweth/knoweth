import React from "react";
import { RenderElementProps, useEditor } from "slate-react";
// Import KaTeX CSS & katex rendering element
import "katex/dist/katex.min.css";
import TeX from "@matejmazur/react-katex";
import { Editor, Transforms } from "slate";

export function promptFormula(oldFormula?: string) {
  return prompt("Enter a LaTeX formula:", oldFormula);
}

export default function KatexVoidElement({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const formula = element.formula as string;
  const editor = useEditor();

  return (
    <span
      {...attributes}
      contentEditable={false}
      onClick={() => {
        // Ask for a new formula
        const newFormula = promptFormula(formula);

        if (newFormula === null) {
          // Don't set an empty formula
          return;
        }

        // Find this math element's path in the tree
        const [match] = Editor.nodes(editor, {
          match: (n) => n === element,
        });
        const path = match[1];

        Transforms.setNodes(editor, { formula: newFormula }, { at: path });
      }}
    >
      <TeX math={formula} />
      {children}
    </span>
  );
}
