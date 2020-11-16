import React from "react";
import { ELEMENT_TABLE } from "@udecode/slate-plugins";
import { RenderElementProps } from "slate-react";
import styled from "styled-components";

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
    console.log(props);
    return (
      <StyledTable className="table" {...attributes}>
        <tbody>{props.children}</tbody>
      </StyledTable>
    );
  }
}
