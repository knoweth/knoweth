import { getRenderElement, setDefaults } from "@udecode/slate-plugins";
import React from "react";
import { RenderElementProps } from "slate-react";
import KatexVoidElement from "./katex-void-element";
import { KATEX_EDITABLE_VOID } from "./type";

export default function renderKatexVoid(options: RenderElementProps) {
  if (options.element.type === KATEX_EDITABLE_VOID) {
    return <KatexVoidElement {...options} />;
  }
}
