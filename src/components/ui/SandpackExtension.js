import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import SandpackNode from './SandpackNode';

export default Node.create({
    name: 'sandpack',

    group: 'block',

    atom: true,

    draggable: true,

    addAttributes() {
        return {
            template: {
                default: 'react',
            },
            code: {
                default: `export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Hello from BLOQ Space!</h1>
      <p>Edit this interactive code block to see changes instantly.</p>
    </div>
  )
}`,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="sandpack"]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'sandpack' })]
    },

    addNodeView() {
        return ReactNodeViewRenderer(SandpackNode)
    },
});
