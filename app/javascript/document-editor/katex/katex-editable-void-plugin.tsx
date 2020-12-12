import { SlatePlugin } from "@udecode/slate-plugins";
import renderKatexVoid from "./render-katex-void";
import { KATEX_EDITABLE_VOID } from "./type";

export default function KatexEditableVoidPlugin(options?: any): SlatePlugin {
  return {
    renderElement: renderKatexVoid,
    voidTypes: [KATEX_EDITABLE_VOID],
    inlineTypes: [KATEX_EDITABLE_VOID],
  };
}
