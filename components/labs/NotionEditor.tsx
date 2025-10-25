'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useEditor,
  EditorContent,
  ReactRenderer,
} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { Extension, type Range, type Editor as TiptapEditor } from '@tiptap/core';
import DOMPurify from 'isomorphic-dompurify';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Quote,
  Text,
  Minus,
  CheckSquare,
  Link as LinkIcon,
  Plus,
  Slash,
  GripVertical,
  Undo2,
  Redo2,
  CopyPlus,
  Copy,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type SlashCommandItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  keywords?: string[];
  command: (props: { editor: TiptapEditor; range: Range }) => void;
};

type SlashCommandListProps = {
  items: SlashCommandItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onHighlight: (index: number) => void;
};

const SlashCommandItems: SlashCommandItem[] = [
  {
    title: 'Text',
    description: 'Start typing with a paragraph block',
    icon: Text,
    keywords: ['paragraph', 'p'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    keywords: ['h1', 'heading'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Sub-section heading',
    icon: Heading2,
    keywords: ['h2', 'heading'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    keywords: ['h3', 'heading'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: 'Code',
    description: 'Inline code for quick snippets',
    icon: Code,
    keywords: ['code', 'inline'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCode().run();
    },
  },
  {
    title: 'Todo List',
    description: 'Track tasks with checkboxes',
    icon: CheckSquare,
    keywords: ['todo', 'task'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleTaskList()
        .run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bulleted list',
    icon: List,
    keywords: ['list', 'ul'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create an ordered list',
    icon: ListOrdered,
    keywords: ['ol', 'ordered'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote',
    icon: Quote,
    keywords: ['blockquote'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Code Block',
    description: 'Capture a code snippet',
    icon: Code,
    keywords: ['code'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: 'Divider',
    description: 'Insert a horizontal divider',
    icon: Minus,
    keywords: ['hr', 'divider', 'horizontal'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: 'Image',
    description: 'Embed an image from a URL',
    icon: ImageIcon,
    keywords: ['image', 'media', 'photo'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const url = window.prompt('Enter image URL');
      if (!url) return;
      editor.chain().focus().setImage({ src: url }).run();
    },
  },
  {
    title: 'Link',
    description: 'Insert or edit a link',
    icon: LinkIcon,
    keywords: ['link', 'a', 'anchor'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const previousUrl = editor.getAttributes('link').href as string | null;
      const url = window.prompt('Enter URL', previousUrl ?? '');
      if (url === null) return;
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    },
  },
];

const SlashCommandList = ({
  items,
  selectedIndex,
  onSelect,
  onHighlight,
}: SlashCommandListProps) => {
  if (!items.length) {
    return (
      <div className="rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
        Type to search commands…
      </div>
    );
  }

  return (
    <div className="w-64 rounded-md border bg-popover shadow-xl">
      <ul className="p-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === selectedIndex;
          return (
            <li key={item.title}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                  isActive && 'bg-muted'
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect(index);
                }}
                onMouseEnter={() => onHighlight(index)}
              >
                <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span className="space-y-0.5">
                  <span className="block font-medium text-foreground">{item.title}</span>
                  <span className="block text-xs text-muted-foreground">{item.description}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const slashCommand = Extension.create({
  name: 'slash-command',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        items: ({ query }: { query: string }) => {
          const normalizedQuery = query.trim().toLowerCase();
          if (!normalizedQuery) {
            return SlashCommandItems.slice(0, 6);
          }
          return SlashCommandItems
            .filter((item) => {
              if (item.title.toLowerCase().includes(normalizedQuery)) {
                return true;
              }
              return item.keywords?.some((keyword) => keyword.includes(normalizedQuery));
            })
            .slice(0, 6);
        },
        command: ({ editor, range, props }) => {
          const payload = (props as { item?: SlashCommandItem })?.item ?? (props as SlashCommandItem | undefined);
          if (!payload) {
            return false;
          }
          payload.command({ editor, range });
          return true;
        },
      } satisfies Partial<SuggestionOptions<SlashCommandItem>>,
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem>({
        editor: this.editor,
        ...this.options.suggestion,
        render: () => {
          let component: ReactRenderer<SlashCommandListProps> | null = null;
          let popup: HTMLElement | null = null;
          let selectedIndex = 0;
          let items: SlashCommandItem[] = [];
          let command: ((item: SlashCommandItem) => void) | null = null;

          const destroy = () => {
            component?.destroy();
            component = null;
            if (popup) {
              popup.remove();
              popup = null;
            }
            items = [];
            command = null;
          };

          const updateComponentProps = () => {
            component?.updateProps({
              items,
              selectedIndex,
            });
          };

          const updatePosition = (props: SuggestionProps<SlashCommandItem>) => {
            const rect = props.clientRect?.();
            if (!popup || !rect) return;
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 8}px`;
          };

          return {
            onStart: (props) => {
              if (!props.editor.isEditable) {
                destroy();
                return;
              }

              items = props.items;
              command = props.command;
              selectedIndex = 0;

              component = new ReactRenderer(SlashCommandList, {
                props: {
                  items,
                  selectedIndex,
                  onSelect: (index: number) => {
                    if (!items.length || !command) return;
                    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
                    const item = items[clampedIndex];
                    if (item) {
                      command(item);
                    }
                  },
                  onHighlight: (index: number) => {
                    selectedIndex = index;
                    updateComponentProps();
                  },
                },
                editor: props.editor,
              });

              popup = document.createElement('div');
              popup.className = 'fixed z-[9999]';
              popup.style.minWidth = '16rem';
              popup.appendChild(component.element);
              document.body.appendChild(popup);

              updatePosition(props);
            },
            onUpdate: (props) => {
              if (!component || !popup) {
                return;
              }

              items = props.items;
              command = props.command;

              if (!items.length) {
                destroy();
                return;
              }

              if (selectedIndex >= items.length) {
                selectedIndex = items.length - 1;
              }

              updateComponentProps();
              updatePosition(props);
            },
            onKeyDown: ({ event }: SuggestionKeyDownProps) => {
              if (!component) {
                return false;
              }

              if (event.key === 'Escape') {
                event.preventDefault();
                destroy();
                return true;
              }

              if (!items.length) {
                return false;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateComponentProps();
                return true;
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                selectedIndex = (selectedIndex + items.length - 1) % items.length;
                updateComponentProps();
                return true;
              }

              if (event.key === 'Enter') {
                event.preventDefault();
                const item = items[selectedIndex];
                if (item && command) {
                  command(item);
                }
                return true;
              }

              return false;
            },
            onExit: destroy,
          };
        },
      }),
    ];
  },
});

type NotionEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  onSave?: (html: string) => Promise<void> | void;
  editable?: boolean;
  isSaving?: boolean;
  className?: string;
};

export default function NotionEditor({
  value = '',
  onChange,
  onSave,
  editable = true,
  isSaving,
  className,
}: NotionEditorProps) {
  const [internalSaving, setInternalSaving] = useState(false);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const blockMenuRef = useRef<HTMLDivElement | null>(null);
  const [blockControls, setBlockControls] = useState<{ visible: boolean; top: number }>({
    visible: false,
    top: 0,
  });
  const [blockMenuMode, setBlockMenuMode] = useState<'quick' | 'actions' | null>(null);

  const extensions = useMemo(() => {
    const base = [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TaskList.configure({
        HTMLAttributes: { class: 'tiptap-tasklist' },
      }),
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Tulis "/" untuk command...',
        includeChildren: true,
      }),
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ];

    if (editable) {
      base.push(slashCommand);
    }

    return base;
  }, [editable]);

  const editor = useEditor({
    editable,
    extensions,
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = DOMPurify.sanitize(editor.getHTML());
      onChange?.(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (typeof value !== 'string') return;
    if (value === editor.getHTML()) return;
    editor.commands.setContent(value);
  }, [editor, value]);

  const saving = typeof isSaving === 'boolean' ? isSaving : internalSaving;

  useEffect(() => {
    if (!editor || !editable) return;

    const updatePosition = () => {
      if (!contentWrapperRef.current) return;
      const { state } = editor;
      const selection = state.selection;

      if (!selection.empty && selection.from !== selection.to) {
        setBlockControls((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        setBlockMenuMode(null);
        return;
      }

      const { $from } = selection;
      const depth = $from.depth;
      if (depth <= 0) {
        setBlockControls((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        setBlockMenuMode(null);
        return;
      }

      try {
        const pos = $from.start(depth);
        const coords = editor.view.coordsAtPos(pos);
        const container = contentWrapperRef.current;
        const containerRect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;
        const rawTop = coords.top - containerRect.top + scrollTop - 4;
        const maxTop = Math.max(container.scrollHeight - 48, 0);
        const clampedTop = Math.max(8, Math.min(rawTop, maxTop));

        setBlockControls({
          visible: true,
          top: clampedTop,
        });
      } catch {
        setBlockControls((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        setBlockMenuMode(null);
      }
    };

    const handleScroll = () => updatePosition();

    updatePosition();
    editor.on('selectionUpdate', updatePosition);
    editor.on('transaction', updatePosition);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('transaction', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [editable, editor]);

  useEffect(() => {
    if (!blockMenuMode) return;
    const handleClick = (event: MouseEvent) => {
      if (blockMenuRef.current?.contains(event.target as Node)) {
        return;
      }
      setBlockMenuMode(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [blockMenuMode]);

  const closeBlockMenu = useCallback(() => setBlockMenuMode(null), []);

  const getCurrentBlockNode = useCallback(() => {
    if (!editor) return null;
    const { state } = editor;
    const { $from } = state.selection;
    const depth = $from.depth;
    if (depth <= 0) return null;
    const node = $from.node(depth);
    if (!node || node.type.name === 'doc') {
      return null;
    }
    return { node, depth, from: $from.before(depth), to: $from.after(depth) };
  }, [editor]);

  const handleDuplicateBlock = useCallback(() => {
    const data = getCurrentBlockNode();
    if (!editor || !data) {
      toast.error('Place the cursor inside a block to duplicate it.');
      return;
    }

    try {
      editor
        .chain()
        .focus()
        .insertContentAt(data.to, data.node.toJSON())
        .run();
      toast.success('Block duplicated');
      closeBlockMenu();
    } catch (error) {
      console.error(error);
      toast.error('Unable to duplicate block');
    }
  }, [closeBlockMenu, editor, getCurrentBlockNode]);

  const handleCopyBlock = useCallback(async () => {
    const data = getCurrentBlockNode();
    if (!data) {
      toast.error('Place the cursor inside a block to copy it.');
      return;
    }

    try {
      const plainText = data.node.textContent || '';
      await navigator.clipboard.writeText(plainText);
      toast.success('Block copied to clipboard');
      closeBlockMenu();
    } catch (error) {
      console.error(error);
      toast.error('Copy failed');
    }
  }, [closeBlockMenu, getCurrentBlockNode]);

  const handleDeleteBlock = useCallback(() => {
    const data = getCurrentBlockNode();
    if (!editor || !data) {
      toast.error('Place the cursor inside a block to delete it.');
      return;
    }

    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.delete(data.from, data.to);
        return true;
      })
      .run();
    toast.success('Block deleted');
    closeBlockMenu();
  }, [closeBlockMenu, editor, getCurrentBlockNode]);

  useEffect(() => {
    if (!blockControls.visible) {
      setBlockMenuMode(null);
    }
  }, [blockControls.visible]);

  const handleInsertSlashCommand = useCallback(() => {
    editor?.chain().focus().insertContent('/').run();
    closeBlockMenu();
  }, [closeBlockMenu, editor]);

  const handlePlusClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setBlockMenuMode((prev) => (prev === 'quick' ? null : 'quick'));
    },
    []
  );

  const handleToggleBlockMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setBlockMenuMode((prev) => (prev === 'actions' ? null : 'actions'));
    },
    []
  );

  const handleInsertSeparator = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().setHorizontalRule().run();
    editor.commands.enter();
    closeBlockMenu();
  }, [closeBlockMenu, editor]);

  const handleInsertCodeBlock = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'codeBlock',
        attrs: { language: 'bash' },
        content: [
          {
            type: 'text',
            text: '# contoh konfigurasi perangkat jaringan\ninterface GigabitEthernet0/0\n description Link ke ISP\n ip address 192.168.1.1 255.255.255.0\n!',
          },
        ],
      })
      .run();
    closeBlockMenu();
  }, [closeBlockMenu, editor]);

  const handleBlockControlMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleSave = async () => {
    if (!editor || !onSave) return;
    try {
      if (typeof isSaving !== 'boolean') {
        setInternalSaving(true);
      }
      const sanitized = DOMPurify.sanitize(editor.getHTML());
      await Promise.resolve(onSave(sanitized));
      toast.success('Changes saved');
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to save changes';
      toast.error(message);
    } finally {
      if (typeof isSaving !== 'boolean') {
        setInternalSaving(false);
      }
    }
  };

  return (
    <Card
      className={cn(
        'relative overflow-visible border border-white/10 bg-slate-950/70 backdrop-blur-sm shadow-2xl ring-1 ring-white/5',
        className
      )}
    >
      {editor && editable && (
        <>
          <BubbleMenu
            editor={editor}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/95 px-2 py-1 shadow-lg backdrop-blur"
          >
            <Button
              size="icon"
              variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
              className="h-8 w-8 rounded-full"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
              className="h-8 w-8 rounded-full"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
              className="h-8 w-8 rounded-full"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
              className="h-8 w-8 rounded-full"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
              className="h-8 w-8 rounded-full"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </Button>
          </BubbleMenu>
        </>
      )}

      <div ref={contentWrapperRef} className="relative">
        {editable && blockControls.visible && (
          <div
            className="pointer-events-none absolute z-[10000] -translate-x-full"
            style={{ top: blockControls.top, left: 12 }}
          >
            <div className="pointer-events-auto flex flex-col items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn(
                  'h-8 w-8 rounded-full border border-white/10 bg-slate-900/90 text-muted-foreground shadow transition hover:text-foreground',
                  blockMenuMode === 'quick' && 'text-foreground'
                )}
                onMouseDown={handleBlockControlMouseDown}
                onClick={handlePlusClick}
                title="Quick insert"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn(
                  'h-8 w-8 rounded-full border border-white/10 bg-slate-900/90 text-muted-foreground shadow transition hover:text-foreground',
                  blockMenuMode === 'actions' && 'text-foreground'
                )}
                onMouseDown={handleBlockControlMouseDown}
                onClick={handleToggleBlockMenu}
                title="Block actions"
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            </div>

            {blockMenuMode && (
              <div
                ref={blockMenuRef}
                className="pointer-events-auto absolute left-12 top-1/2 w-64 -translate-y-1/2 space-y-1 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur"
                onMouseDown={handleBlockControlMouseDown}
              >
                {blockMenuMode === 'quick' ? (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={handleInsertSlashCommand}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Slash className="h-4 w-4" />
                        Slash command
                      </span>
                      <span className="text-xs text-muted-foreground">/</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertSeparator}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Minus className="h-4 w-4" />
                        Separator
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertCodeBlock}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Code snippet
                      </span>
                      <span className="text-xs text-muted-foreground">Ctrl+Shift+C</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={handleDuplicateBlock}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <CopyPlus className="h-4 w-4" />
                        Duplicate block
                      </span>
                      <span className="text-xs text-muted-foreground">Mod+D</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyBlock}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        Copy to clipboard
                      </span>
                      <span className="text-xs text-muted-foreground">Mod+C</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-between rounded-xl px-3 py-2 text-sm text-muted-foreground/60"
                    >
                      <span className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Copy anchor link
                      </span>
                      <span className="text-xs text-muted-foreground/60">Mod+Ctrl+L</span>
                    </button>
                    <div className="h-px bg-white/10" />
                    <button
                      type="button"
                      onClick={handleDeleteBlock}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <span className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete block
                      </span>
                      <span className="text-xs text-red-400">Backspace</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <EditorContent
          editor={editor}
          className={cn(
            'tiptap-editor prose prose-slate dark:prose-invert max-w-none min-h-[320px] px-6 py-5 text-base leading-7 focus:outline-none [&_*]:focus:outline-none',
            editable ? 'cursor-text' : 'cursor-default'
          )}
        />
      </div>

      {editable && onSave && (
        <div className="flex items-center justify-end gap-2 border-t border-white/10 bg-slate-950/60 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => editor?.commands.undo()}
            disabled={!editor?.can().undo()}
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => editor?.commands.redo()}
            disabled={!editor?.can().redo()}
          >
            <Redo2 className="h-4 w-4" />
            Redo
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      )}
    </Card>
  );
}
