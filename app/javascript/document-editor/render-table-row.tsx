import { ELEMENT_TR } from "@udecode/slate-plugins";
import { RenderElementProps } from "slate-react";
import styled, { css } from "styled-components";
import React from "react";

const NoteRow = styled.tr<{ isNote: boolean }>`
  ${(props) =>
    props.isNote &&
    css`
      // Must be wildcarded because slate sets background color for some reason
      * {
        background-color: yellow;
      }
    `}
`;

/**
 * Renders a table row with a highlight for rows that are marked to be
 * flashcards
 */
export function renderTrWithCardId({
  attributes,
  ...props
}: RenderElementProps) {
  if (props.element.type === ELEMENT_TR) {
    return (
      <NoteRow
        isNote={props.element.cardId !== undefined}
        {...attributes}
        {...props}
      />
    );
  }
}
