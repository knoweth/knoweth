// Import React dependencies.
import React, { useEffect, useMemo } from "react";
// Import the Slate editor factory.
import { createEditor, Node, Editor, Transforms } from "slate";

// Import the Slate components and React plugin.
import { Slate, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { generateCardId } from "./card-id";
import {
  addRow,
  BalloonToolbar,
  BoldPlugin,
  deleteRow,
  deleteTable,
  EditablePlugins,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_TD,
  ELEMENT_TR,
  ExitBreakPlugin,
  HeadingPlugin,
  HeadingToolbar,
  insertTable,
  ItalicPlugin,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  ParagraphPlugin,
  pipe,
  SoftBreakPlugin,
  TablePlugin,
  ToolbarElement,
  ToolbarMark,
  ToolbarTable,
  UnderlinePlugin,
  withTable,
  ListPlugin,
  ELEMENT_UL,
  ELEMENT_LI,
  ToolbarList,
  withList,
  CodePlugin,
  withInlineVoid,
  ELEMENT_OL,
  ToolbarImage,
  ToolbarButton,
} from "@udecode/slate-plugins";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  BorderAll,
  BorderTop,
  BorderBottom,
  BorderClear,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  Payments,
  FormatListNumbered,
  FormatListBulleted,
  Equalizer,
} from "@styled-icons/material";
import { renderTdWithOcclusion, renderTrWithCardId } from "./render-table-row";
import { onKeyDownTable, renderTable } from "./render-table";
import PaperContainer from "./paper-container";
import styled from "styled-components";
import { KATEX_EDITABLE_VOID } from "./katex/type";
import KatexEditableVoidPlugin from "./katex/katex-editable-void-plugin";
import { promptFormula } from "./katex/katex-void-element";

const StickyFormattingControls = styled.div`
  // Stick to the top of the viewport when scrolling past
  position: sticky;
  top: 0;

  * {
    background-color: white;
  }
`;

function toggleFlashcard(editor: Editor) {
  const currentNoteHasFlashcard = (function currentNoteHasFlashcard() {
    const currentLoc = editor.selection?.anchor.path;
    if (!currentLoc) {
      return false;
    }

    let node: Node = editor;
    // Traverse the tree until we find a q-note to enable flashcards.
    for (let i = 0; i < currentLoc.length; i++) {
      const path = currentLoc.slice(0, i + 1);
      node = node.children[currentLoc[i]];

      // If we find a note, set the data to include its card ID
      if (node.type === ELEMENT_TR) {
        return node.cardId !== undefined;
      }
    }
    return false;
  })();

  const currentLoc = editor.selection.anchor.path;
  let node: Node = editor;
  // Traverse the tree until we find a q-note to enable flashcards.
  for (let i = 0; i < currentLoc.length; i++) {
    const path = currentLoc.slice(0, i + 1);
    node = node.children[currentLoc[i]];

    // If we find a note, set the data to include its card ID
    if (node.type === ELEMENT_TR) {
      Transforms.setNodes(
        editor,
        {
          cardId: currentNoteHasFlashcard ? undefined : generateCardId(),
        },
        { at: path }
      );
    }
  }
}

const plugins = [
  ParagraphPlugin(),
  HeadingPlugin(),
  BoldPlugin(),
  ItalicPlugin(),
  UnderlinePlugin(),
  SoftBreakPlugin({
    rules: [
      { hotkey: "shift+enter" },
      {
        hotkey: "enter",
        query: {
          allow: [ELEMENT_TD],
        },
      },
    ],
  }),
  ExitBreakPlugin({
    rules: [
      {
        hotkey: "mod+enter",
      },
      {
        hotkey: "mod+shift+enter",
        before: true,
      },
      {
        hotkey: "enter",
        query: {
          start: true,
          end: true,
          allow: [ELEMENT_H1],
        },
      },
    ],
  }),
  TablePlugin(),
  ListPlugin(),
  KatexEditableVoidPlugin(),
];
const withPlugins = [
  withReact,
  withHistory,
  withTable(),
  withList(),
  // Mark all inline/void types specified by plugins as such
  withInlineVoid({
    plugins,
  }),
] as const;

export default function SlateEditor({
  interactive,
  value,
  onChange,
}: {
  interactive: boolean;
  value: Node[];
  onChange?: (value: Node[]) => void;
}) {
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate editor={editor} value={value} onChange={onChange || (() => {})}>
      {interactive && (
        <>
          <BalloonToolbar theme="dark" direction="top">
            <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
            <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
            <ToolbarTable transform={toggleFlashcard} icon={<Payments />} />
          </BalloonToolbar>

          <StickyFormattingControls>
            <HeadingToolbar>
              <ToolbarElement type={ELEMENT_H1} icon={<LooksOne />} />
              <ToolbarElement type={ELEMENT_H2} icon={<LooksTwo />} />
              <ToolbarElement type={ELEMENT_H3} icon={<Looks3 />} />
              <ToolbarElement type={ELEMENT_H4} icon={<Looks4 />} />
              <ToolbarElement type={ELEMENT_H5} icon={<Looks5 />} />
              <ToolbarElement type={ELEMENT_H6} icon={<Looks6 />} />
              <ToolbarButton
                onMouseDown={() => {
                  const formula = promptFormula();
                  editor.insertNode({
                    type: KATEX_EDITABLE_VOID,
                    formula,
                    children: [{ text: "" }],
                  });
                }}
                icon={<Equalizer />}
              />
              <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
              <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
              <ToolbarMark type={MARK_UNDERLINE} icon={<FormatUnderlined />} />
              <ToolbarList
                typeList={ELEMENT_UL}
                icon={<FormatListBulleted />}
              />
              <ToolbarList
                typeList={ELEMENT_OL}
                icon={<FormatListNumbered />}
              />
              <ToolbarTable icon={<BorderAll />} transform={insertTable} />
              <ToolbarTable icon={<BorderBottom />} transform={addRow} />
              <ToolbarTable icon={<BorderTop />} transform={deleteRow} />
              <ToolbarTable icon={<BorderClear />} transform={deleteTable} />
            </HeadingToolbar>
          </StickyFormattingControls>
        </>
      )}
      <PaperContainer>
        <EditablePlugins
          readOnly={!interactive}
          plugins={plugins}
          renderElement={[
            renderTable,
            renderTrWithCardId,
            renderTdWithOcclusion,
          ]}
          onKeyDown={[onKeyDownTable]}
        />
      </PaperContainer>
    </Slate>
  );
}
