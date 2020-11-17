import React, { useState } from "react";
import { Node } from "slate";
import DocumentSaver from "./document-saver";
import SlateEditor from "./slate-editor";

export default ({ initialContent }: { initialContent: string }) => {
  const content = JSON.parse(initialContent);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState<Node[]>(content);

  return (
    <>
      <DocumentSaver state={value} />
      <SlateEditor
        interactive
        value={value}
        onChange={(value) => setValue(value)}
      />
    </>
  );
};
