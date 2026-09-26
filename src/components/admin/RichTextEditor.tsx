"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const toggleBtnClass = (isActive: boolean) =>
    `p-2 rounded-lg transition-colors ${
      isActive
        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
    }`;

  const colors = [
    { name: "مشکی", value: "#000000" },
    { name: "خاکستری", value: "#6B7280" },
    { name: "قرمز", value: "#EF4444" },
    { name: "نارنجی", value: "#F97316" },
    { name: "زرد", value: "#EAB308" },
    { name: "سبز", value: "#22C55E" },
    { name: "آبی", value: "#3B82F6" },
    { name: "بنفش", value: "#A855F7" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={toggleBtnClass(editor.isActive("bold"))}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={toggleBtnClass(editor.isActive("italic"))}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={toggleBtnClass(editor.isActive("underline"))}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={toggleBtnClass(editor.isActive("strike"))}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={toggleBtnClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={toggleBtnClass(editor.isActive({ textAlign: 'right' }))}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={toggleBtnClass(editor.isActive({ textAlign: 'center' }))}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={toggleBtnClass(editor.isActive({ textAlign: 'left' }))}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={toggleBtnClass(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={toggleBtnClass(editor.isActive("orderedList"))}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={toggleBtnClass(editor.isActive("blockquote"))}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

      {/* Colors */}
      <div className="flex items-center gap-1 px-1">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            title={color.name}
            onClick={() => editor.chain().focus().setColor(color.value).run()}
            className={`w-5 h-5 rounded-full border-2 transition-all ${
              editor.isActive("textStyle", { color: color.value })
                ? "border-violet-500 scale-110"
                : "border-transparent hover:scale-110"
            }`}
            style={{ backgroundColor: color.value }}
          />
        ))}
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-1"
        >
          حذف رنگ
        </button>
      </div>
    </div>
  );
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none w-full min-h-[150px] p-4 focus:outline-none text-gray-900 dark:text-white',
        dir: 'rtl',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl transition-all focus-within:ring-2 focus-within:ring-violet-500 overflow-hidden">
      <MenuBar editor={editor} />
      <div className="max-h-[500px] overflow-y-auto">
         <EditorContent editor={editor} />
      </div>
    </div>
  );
}
