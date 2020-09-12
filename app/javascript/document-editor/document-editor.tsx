// Import React dependencies.
import ReactDOM from "react-dom";
import React, { useMemo, useState, useRef, useEffect } from "react";
// Import the Slate editor factory.
import { createEditor, Node, Editor, Transforms, Text, Range } from "slate";

// Import the Slate components and React plugin.
import {
  Slate,
  Editable,
  withReact,
  RenderLeafProps,
  RenderElementProps,
  useSlate,
  ReactEditor,
} from "slate-react";
import { withHistory } from "slate-history";
import styled from "styled-components";
import { generateCardId } from "./card-id";
import DocumentSaver from "./document-saver";

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  toggleBoldMark(editor: Editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },
};

const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

const StyledToolbar = styled.div`
  padding: 8px 7px 6px;
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;
  margin-top: -6px;
  opacity: 0;
  background-color: #222;
  border-radius: 4px;
  transition: opacity 0.75s;
  color: white;
`;

const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement | null>();
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      el.removeAttribute("style");
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = "1";
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  });

  return (
    <Portal>
      <StyledToolbar ref={ref}>
        <p>
          <button
            onClick={() => {
              const currentLoc = editor.selection.anchor.path;
              let node: Node = editor;
              // Traverse the tree until we find a q-note to enable flashcards.
              for (let i = 0; i < currentLoc.length; i++) {
                const path = currentLoc.slice(0, i + 1);
                node = node.children[currentLoc[i]];

                // If we find a note, set the data to include its card ID
                if (node.type === "q-note") {
                  Transforms.setNodes(
                    editor,
                    { cardId: generateCardId() },
                    { at: path }
                  );
                }
              }
            }}
          >
            Create flashcard
          </button>
        </p>
      </StyledToolbar>
    </Portal>
  );
};

const ReviewTable = styled.table`
  td:nth-child(1) {
    width: 30%;
  }
  td:nth-child(2) {
    width: 70%;
  }
`;

// Render block elements.
const Element = ({ attributes, children, element }: RenderElementProps) => {
  const editor = useSlate();
  switch (element.type) {
    // Headings
    case "h1":
      return <h1 {...attributes}>{children}</h1>;
    case "h2":
      return <h2 {...attributes}>{children}</h2>;
    case "h3":
      return <h3 {...attributes}>{children}</h3>;
    case "h4":
      return <h4 {...attributes}>{children}</h4>;
    case "h5":
      return <h5 {...attributes}>{children}</h5>;
    case "h6":
      return <h6 {...attributes}>{children}</h6>;
    case "q-table":
      return (
        <div {...attributes}>
          <ReviewTable className="table">
            <tbody>
              <tr contentEditable={false}>
                <th>Question</th>
                <th>Answer</th>
              </tr>
              {children}
            </tbody>
          </ReviewTable>
          <div contentEditable={false}>
            <button
              className="btn btn-primary"
              onClick={() => {
                // Add a new row to the table
                const path = ReactEditor.findPath(editor, element);
                // Push as the last entry in the path to this new node the #
                // of current rows in the table
                // This effectively adds the new row below all the others
                path.push(children.props.node.children.length);
                Transforms.insertNodes(
                  editor,
                  {
                    type: "q-note",
                    children: [
                      {
                        type: "q-cell",
                        children: [{ text: "" }],
                      },
                      {
                        type: "q-cell",
                        children: [{ text: "" }],
                      },
                    ],
                  },
                  { at: path, mode: "lowest" }
                );
              }}
            >
              +
            </button>
          </div>
        </div>
      );
    case "q-note":
      return (
        <tr
          className={(element as any).cardId ? "table-warning" : ""}
          {...attributes}
        >
          {children}
        </tr>
      );
    case "q-cell":
      return <td {...attributes}>{children}</td>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

// Define a React component to render leaves with bold text.
const Leaf = (props: RenderLeafProps) => {
  if (props.leaf.bold) {
    return <strong {...props.attributes}>{props.children}</strong>;
  } else {
    return <span {...props.attributes}>{props.children}</span>;
  }
};

const renderElement = (props) => <Element {...props} />;
const renderLeaf = (props) => <Leaf {...props} />;

export default ({ initialContent }: { initialContent: string }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
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
        <HoveringToolbar />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (event.key === "Delete") {
              console.log("deletage");
              console.log(editor.selection);
              Transforms.delete(editor, { at: editor.selection });
            }
            if (event.key === "Tab") {
              Transforms.move(editor, { distance: 1, unit: "offset" });
            }
            if (!event.ctrlKey) {
              return;
            }

            switch (event.key) {
              // Bold
              case "b": {
                event.preventDefault();
                CustomEditor.toggleBoldMark(editor);
                break;
              }
              // Undo
              case "z": {
                event.preventDefault();
                editor.undo();
              }
              // Redo
              case "y": {
                event.preventDefault();
                editor.redo();
              }
            }
          }}
        />
      </Slate>
    </>
  );
};
