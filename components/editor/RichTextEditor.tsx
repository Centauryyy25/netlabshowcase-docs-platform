'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

import { Button } from '@/components/ui/button';

type RichTextEditorProps = {
  value?: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: true }),
      Image.configure({ inline: true }),
      Placeholder.configure({
        placeholder: 'Write detailed notes or configuration explanations here...',
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert min-h-[250px] max-h-[600px] overflow-y-auto p-4 border border-input rounded-md focus-visible:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && typeof value === 'string' && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return <p>Loading editor...</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          B
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          I
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          • List
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const url = window.prompt('URL') || '';
            if (!url) return;
            editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          🔗
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const src = window.prompt('Image URL') || '';
            if (!src) return;
            editor.chain().focus().setImage({ src }).run();
          }}
        >
          🖼️
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
