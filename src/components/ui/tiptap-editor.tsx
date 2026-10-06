import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'lucide-react';
import { useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import UnderlineExt from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { sanitizePastedHtml } from '@/utils/clipboard';
import { fileToDataUrl, validateImageFile } from '@/utils/images';
import '@/components/ui/tiptap.css';

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** 'boxed' renders the bordered card; 'plain' makes the page itself the form. */
  chrome?: 'boxed' | 'plain';
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40',
        active && 'bg-accent text-accent-foreground',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  plain = false,
  onInsertImage,
}: {
  editor: Editor;
  plain?: boolean;
  onInsertImage: () => void;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-0.5 px-2 py-1',
        plain ? 'rounded-md bg-secondary/60' : 'border-b border-border',
      )}
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="size-3.5" />
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <Underline className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHighlight({ color: '#fef08a' })
            .run()
        }
        active={editor.isActive('highlight')}
        title="Highlight (Ctrl+Shift+H)"
      >
        <Highlighter className="size-3.5" />
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="size-3.5" />
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet list"
      >
        <List className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Ordered list"
      >
        <ListOrdered className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Code block"
      >
        <Code className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertImage} title="Insert image">
        <ImagePlus className="size-3.5" />
      </ToolbarButton>
    </div>
  );
}

export function TiptapEditor({
  content = '',
  onChange,
  placeholder = 'Start writing…',
  autoFocus = false,
  chrome = 'boxed',
}: TiptapEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Embed image files as data URLs. Returns true when files were handled. */
  function insertFiles(files: FileList | File[] | undefined | null): boolean {
    const editor = editorRef.current;
    if (!editor || !files || files.length === 0) return false;
    const images = [...files].filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return false;
    void (async () => {
      for (const file of images) {
        const problem = validateImageFile(file);
        if (problem === 'too-large') {
          toast.error('Image too large (max 3 MB)');
          continue;
        }
        if (problem) continue;
        try {
          const src = await fileToDataUrl(file);
          editor.chain().focus().setImage({ src }).run();
        } catch {
          toast.error('Could not insert image');
        }
      }
    })();
    return true;
  }

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus,
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      UnderlineExt,
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onCreate: ({ editor: e }) => {
      editorRef.current = e;
    },
    onUpdate: ({ editor: e }) => {
      editorRef.current = e;
      onChange?.(e.getHTML());
    },
    onDestroy: () => {
      editorRef.current = null;
    },
    editorProps: {
      attributes: {
        class:
          chrome === 'plain'
            ? 'tiptap min-h-[220px] px-1 py-2 text-[15px] leading-relaxed focus:outline-none'
            : 'tiptap min-h-[120px] px-3 py-2 text-sm leading-relaxed focus:outline-none',
      },
      // External sources often paste `color: #000` / `color: black` inline
      // styles that turn invisible in dark mode. Strip text color on paste
      // so pasted content inherits the theme foreground.
      transformPastedHTML: (html) => sanitizePastedHtml(html),
      handlePaste: (_view, event) => insertFiles(event.clipboardData?.files),
      handleDrop: (_view, event) => insertFiles(event.dataTransfer?.files),
    },
  });

  const plain = chrome === 'plain';

  return (
    <div
      className={
        plain
          ? 'flex flex-col gap-2'
          : 'overflow-hidden rounded-md border border-input bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring'
      }
    >
      {editor && (
        <Toolbar editor={editor} plain={plain} onInsertImage={() => fileInputRef.current?.click()} />
      )}
      <div className={plain ? undefined : 'max-h-[300px] overflow-y-auto'}>
        <EditorContent editor={editor} />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          insertFiles(e.target.files);
          // Reset so the same file can be picked again.
          e.target.value = '';
        }}
      />
    </div>
  );
}
