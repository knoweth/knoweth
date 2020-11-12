// Import React dependencies.
import ReactDOM from "react-dom";
import React, { useMemo, useState, useRef, useEffect } from "react";
// Import the Slate editor factory.
import { createEditor, Node, Editor, Transforms, Text, Range } from "slate";

// Import the Slate components and React plugin.
import { Slate, withReact, useSlate, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import styled from "styled-components";
import { generateCardId } from "./card-id";
import DocumentSaver from "./document-saver";
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
  ToolbarButton,
  ToolbarElement,
  ToolbarMark,
  ToolbarTable,
  UnderlinePlugin,
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
} from "@styled-icons/material";

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
      if (node.type === "tr") {
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
    if (node.type === "tr") {
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
  HeadingPlugin(),
  ParagraphPlugin(),
  BoldPlugin(),
  ItalicPlugin(),
  UnderlinePlugin(),
  TablePlugin(),
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
          allow: [
            ELEMENT_H1,
            ELEMENT_H2,
            ELEMENT_H3,
            ELEMENT_H4,
            ELEMENT_H5,
            ELEMENT_H6,
          ],
        },
      },
    ],
  }),
];
const withPlugins = [withReact, withHistory] as const;

export default ({ initialContent }: { initialContent: string }) => {
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState<Node[]>(JSON.parse(initialContent));

  return (
    <>
      <DocumentSaver state={value} />
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
        }}
      >
        <BalloonToolbar theme="dark" direction="top">
          <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
          <ToolbarTable transform={toggleFlashcard} icon={<Payments />} />
        </BalloonToolbar>
        <HeadingToolbar>
          <ToolbarElement type={ELEMENT_H1} icon={<LooksOne />} />
          <ToolbarElement type={ELEMENT_H2} icon={<LooksTwo />} />
          <ToolbarElement type={ELEMENT_H3} icon={<Looks3 />} />
          <ToolbarElement type={ELEMENT_H4} icon={<Looks4 />} />
          <ToolbarElement type={ELEMENT_H5} icon={<Looks5 />} />
          <ToolbarElement type={ELEMENT_H6} icon={<Looks6 />} />
          <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
          <ToolbarMark type={MARK_UNDERLINE} icon={<FormatUnderlined />} />
          <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarTable icon={<BorderAll />} transform={insertTable} />
          <ToolbarTable icon={<BorderBottom />} transform={addRow} />
          <ToolbarTable icon={<BorderTop />} transform={deleteRow} />
          <ToolbarTable icon={<BorderClear />} transform={deleteTable} />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} />
      </Slate>
    </>
  );
};
