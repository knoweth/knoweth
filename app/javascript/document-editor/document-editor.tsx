// Import React dependencies.
import React, { useMemo, useState } from "react";
// Import the Slate editor factory.
import { createEditor, Node, Editor, Transforms, Text } from "slate";

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
        <>
          <table className="table">
            <tbody {...attributes}>{children}</tbody>
          </table>
          <div>
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
        </>
      );
    case "q-note":
      return <tr {...attributes}>{children}</tr>;
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

export default () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState<Node[]>([
    {
      type: "h1",
      children: [
        {
          text: "Test Question",
        },
      ],
    },
    {
      type: "q-table",
      children: [
        {
          type: "q-note",
          children: [
            {
              type: "q-cell",
              children: [{ text: "test" }],
            },
            {
              type: "q-cell",
              children: [{ text: "test" }],
            },
          ],
        },
      ],
    },
  ]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
      }}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
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
  );
};
