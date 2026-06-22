import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { EditorToolbar } from '@/features/journal/components/EditorToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write something…',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-prose',
      },
    },
  });

  // Sync external content changes (e.g. when an existing entry loads)
  // without resetting cursor position unnecessarily.
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      <EditorToolbar editor={editor} />
      <div className="min-h-[320px] rounded-xl border border-(--color-border) bg-(--color-paper-raised) px-4 py-3 focus-within:border-(--color-sage) focus-within:ring-1 focus-within:ring-(--color-sage)/30 transition-colors">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
