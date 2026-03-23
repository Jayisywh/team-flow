import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { all, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Placeholder } from "@tiptap/extensions";

const lowlight = createLowlight(all);
export const baseExtensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  CodeBlockLowlight.configure({
    lowlight,
  }),
];

export const editorExtensions = [
  ...baseExtensions,
  Placeholder.configure({
    placeholder: "Type your message",
  }),
];
