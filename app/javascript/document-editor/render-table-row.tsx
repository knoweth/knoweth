import { ELEMENT_TD, ELEMENT_TR } from "@udecode/slate-plugins";
import { RenderElementProps } from "slate-react";
import React from "react";

export function NoteCell({
  hidden,
  children,
}: {
  hidden: boolean;
  children: React.ReactChild;
}) {
  if (hidden) {
    return (
      <td
        data-cell-hidden="true"
        className="p-3 text-muted bg-light user-select-none text-center"
      >
        Answer hidden
      </td>
    );
  }

  return <td data-cell-hidden="false">{children}</td>;
}

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
      <tr
        className={props.element.cardId !== undefined ? "bg-secondary" : ""}
        title={
          props.element.cardId !== undefined
            ? `Flashcard ID: ${props.element.cardId}`
            : undefined
        }
        {...attributes}
        {...props}
      />
    );
  }
}

/**
 * Render a hidden td, e.g. one shown while reviewing
 */
export function renderTdWithOcclusion({
  attributes,
  ...props
}: RenderElementProps) {
  if (props.element.type === ELEMENT_TD) {
    return (
      <NoteCell
        hidden={props.element.hidden == true}
        // Used for auto-scrolling behavior (document scrolls to hidden cell in reviewer)
        children={props.children}
      />
    );
  }
}
