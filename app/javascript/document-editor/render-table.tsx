import React from "react";
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TR,
  getAboveByType,
  isNodeTypeIn,
} from "@udecode/slate-plugins";
import { RenderElementProps } from "slate-react";
import styled from "styled-components";
import { Editor, Transforms } from "slate";

const StyledTable = styled.table`
  td:nth-child(1) {
    width: 30%;
  }
  td:nth-child(2) {
    width: 70%;
  }
`;

/**
 * Renders a table as a Bootstrap table with fixed Q : A ratio
 */
export function renderTable({ attributes, ...props }: RenderElementProps) {
  if (props.element.type === ELEMENT_TABLE) {
    return (
      <StyledTable className="table" {...attributes}>
        <tbody>{props.children}</tbody>
      </StyledTable>
    );
  }
}

function isSelectionInTableCell(editor: Editor) {
  return editor.selection && isNodeTypeIn(editor, ELEMENT_TD);
}

/**
 * Overrides tab key implementation so that it moves to the next table
 * cell/row instead in a table.
 */
export function onKeyDownTable(e: KeyboardEvent, editor: Editor) {
  if (e.key === "Tab" && isSelectionInTableCell(editor)) {
    console.log("Moving selection");
    Transforms.move(editor, { distance: 1, unit: "line" });
    e.preventDefault();
  }
}
