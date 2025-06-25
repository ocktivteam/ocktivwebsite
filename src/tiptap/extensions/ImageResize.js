// src/tiptap/extensions/ImageResize.js

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableImage from './ResizableImage.jsx'

// This extension adds resizable handles to images in Tiptap.
export const ImageResize = Node.create({
  name: 'image',

  group: 'inline',
  inline: false,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      inline: false,
      allowBase64: false,
    }
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: 'auto' },
      height: { default: 'auto' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: el => {
          return {
            src: el.getAttribute('src'),
            alt: el.getAttribute('alt'),
            title: el.getAttribute('title'),
            width: el.getAttribute('width') || 'auto',
            height: el.getAttribute('height') || 'auto',
          }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage)
  },
})
