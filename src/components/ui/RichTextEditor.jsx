import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import SandpackExtension from './SandpackExtension';
import {
    Bold, Italic, Strikethrough, Code,
    Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon
} from 'lucide-react';

const RichTextEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write your brilliant thoughts here. Tell a story, share some code...',
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-purple-400 underline decoration-purple-500/30 hover:decoration-purple-500 transition-colors cursor-pointer',
                },
            }),
            SandpackExtension,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-purple max-w-none focus:outline-none min-h-[300px] text-lg md:text-xl text-gray-300 font-paragraph leading-relaxed marker:text-purple-500 prose-headings:text-white prose-blockquote:border-purple-500 prose-blockquote:bg-purple-500/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-a:text-purple-400 prose-code:bg-white/10 prose-code:text-purple-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const toggleLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="relative w-full group">
            <style>
                {`
                .tiptap p.is-editor-empty:first-child::before {
                    color: #4b5563;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                `}
            </style>

            <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-white/5 rounded-t-xl overflow-x-auto scrollbar-hide">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('bold') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('italic') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('strike') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <Strikethrough size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('code') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <Code size={18} />
                </button>

                <div className="w-px h-6 bg-white/10 mx-2 shrink-0" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <Heading1 size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <Heading2 size={18} />
                </button>

                <div className="w-px h-6 bg-white/10 mx-2 shrink-0" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('bulletList') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <List size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('orderedList') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <ListOrdered size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('blockquote') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <Quote size={18} />
                </button>

                <div className="w-px h-6 bg-white/10 mx-2 shrink-0" />

                <button
                    type="button"
                    onClick={toggleLink}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${editor.isActive('link') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <LinkIcon size={18} />
                </button>

                <div className="w-px h-6 bg-white/10 mx-2 shrink-0" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().insertContent('<div data-type="sandpack"></div>').run()}
                    className="px-3 py-1.5 rounded-lg transition-colors shrink-0 text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                >
                    + Insert Dev Sandbox
                </button>
            </div>

            {/* BubbleMenu functionality kept for floating interactions */}
            {editor && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    className="flex items-center gap-1 p-2 rounded-xl bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 shadow-2xl z-50 transition-opacity"
                >
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        title="Bold"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        title="Italic"
                    >
                        <Italic size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleLink()}
                        className={`p-2 rounded-lg transition-colors ${editor.isActive('link') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        title="Link"
                    >
                        <LinkIcon size={18} />
                    </button>
                </BubbleMenu>
            )}

            <div className="w-full h-full min-h-[400px] p-6 bg-[#0f0f11]/50 rounded-b-xl border border-t-0 border-white/5 shadow-inner">
                <EditorContent editor={editor} className="w-full h-full focus:outline-none" />
            </div>
        </div>
    );
};

export default RichTextEditor;
