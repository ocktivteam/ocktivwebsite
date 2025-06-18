// src/tiptap/extensions/ResizableImage.jsx
import { Node, mergeAttributes } from "@tiptap/core";

export const ResizableImage = Node.create({
  name: "resizableImage",
  group: "inline",      // Fix for inline content
  inline: true,         // Fix for inline content
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: "350px" },
      height: { default: "auto" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: el => ({
          src: el.getAttribute("src"),
          alt: el.getAttribute("alt"),
          title: el.getAttribute("title"),
          width: el.getAttribute("width"),
          height: el.getAttribute("height"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        style: `
          width: ${HTMLAttributes.width || "350px"};
          height: ${HTMLAttributes.height || "auto"};
          max-width: 100%;
          display: inline-block;
          border-radius: 10px;
          margin: 12px 0;
        `,
      }),
    ];
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: options,
            })
            .run(),
    };
  },
});
