// Import React dependencies.
import React, { useMemo, useState, useCallback } from "react";
import ReactDOM from "react-dom";
// Import the Slate editor factory.
import { createEditor, Node, Editor, Transforms, Text } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, RenderLeafProps } from "slate-react";
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

// Define a React component to render leaves with bold text.
const Leaf = (props: RenderLeafProps) => {
  if (props.leaf.bold) {
    return <strong {...props.attributes}>{props.children}</strong>;
  } else {
    return <span {...props.attributes}>{props.children}</span>;
  }
};

const App = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState<Node[]>([
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ]);

  // Define a leaf rendering function that is memoized with `useCallback`.
  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
      }}
    >
      <Editable
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

ReactDOM.render(<App />, document.getElementById("document-editor"));
