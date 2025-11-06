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
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { Extension, type Range, type Editor as TiptapEditor } from '@tiptap/core';
import DOMPurify from 'isomorphic-dompurify';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Link2,
  Table as TableIcon,
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

type RequestImageUrlHandler = (params: { apply: (url: string) => void }) => void;
type LinkDialogMode = 'link' | 'embed';
type LinkDialogState = {
  open: boolean;
  value: string;
  allowUnset: boolean;
  mode: LinkDialogMode;
};
type RequestLinkUrlHandler = (params: {
  initialValue: string | null;
  allowUnset: boolean;
  mode?: LinkDialogMode;
  apply: (url: string | null) => void;
}) => void;

const defaultRequestImageUrl: RequestImageUrlHandler = ({ apply }) => {
  if (typeof window === 'undefined') return;
  const url = window.prompt('Enter image URL');
  if (!url) return;
  apply(url);
};

const defaultRequestLinkUrl: RequestLinkUrlHandler = ({ initialValue, allowUnset, mode = 'link', apply }) => {
  if (typeof window === 'undefined') return;
  const promptMessage = mode === 'embed' ? 'Enter an embed URL' : 'Enter URL';
  const url = window.prompt(promptMessage, initialValue ?? '');
  if (url === null) return;
  if (url.trim() === '') {
    if (allowUnset) {
      apply(null);
    }
    return;
  }
  apply(url.trim());
};

let requestImageUrl: RequestImageUrlHandler = defaultRequestImageUrl;
let requestLinkUrl: RequestLinkUrlHandler = defaultRequestLinkUrl;

const SlashCommandItems: SlashCommandItem[] = [
  {
    title: 'Text',
    description: 'Start with a plain paragraph block',
    icon: Text,
    keywords: ['paragraph', 'p', 'plain', 'text'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Create a large section heading',
    icon: Heading1,
    keywords: ['h1', 'heading', 'title'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Create a medium section heading',
    icon: Heading2,
    keywords: ['h2', 'heading', 'subtitle'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Create a small section heading',
    icon: Heading3,
    keywords: ['h3', 'heading', 'subheading'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a memorable quote',
    icon: Quote,
    keywords: ['blockquote', 'quote'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Checklist',
    description: 'Track tasks with checkboxes',
    icon: CheckSquare,
    keywords: ['todo', 'task', 'checkbox'],
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
    title: 'Code Block',
    description: 'Capture a multi-line code snippet',
    icon: Code,
    keywords: ['code', 'snippet', 'pre'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: 'Inline Code',
    description: 'Highlight short code inline',
    icon: Code,
    keywords: ['code', 'inline'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCode().run();
    },
  },
  {
    title: 'Divider',
    description: 'Visually separate sections',
    icon: Minus,
    keywords: ['hr', 'divider', 'horizontal'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      editor.commands.enter();
    },
  },
  {
    title: 'Image',
    description: 'Embed an image from a URL',
    icon: ImageIcon,
    keywords: ['image', 'media', 'photo'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      requestImageUrl({
        apply: (url) => {
          if (!url) return;
          editor.chain().focus().setImage({ src: url }).run();
          editor.commands.enter();
        },
      });
    },
  },
  {
    title: 'Table',
    description: 'Insert a 3 x 3 table layout',
    icon: TableIcon,
    keywords: ['table', 'grid', 'rows', 'columns'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: 'Embed Link',
    description: 'Preview external content from a URL',
    icon: Link2,
    keywords: ['embed', 'link', 'preview', 'external'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      requestLinkUrl({
        initialValue: '',
        allowUnset: false,
        mode: 'embed',
        apply: (url) => {
          if (!url) {
            return;
          }
          const resolved = url.trim();
          if (!resolved) {
            return;
          }
          editor
            .chain()
            .focus()
            .insertContent([
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: resolved,
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: resolved,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        },
                      },
                    ],
                  },
                ],
              },
            ])
            .run();
          editor.commands.enter();
        },
      });
    },
  },
  {
    title: 'Link',
    description: 'Attach a link to the selected text',
    icon: LinkIcon,
    keywords: ['link', 'anchor', 'url'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const previousUrl = editor.getAttributes('link').href as string | null;
      requestLinkUrl({
        initialValue: previousUrl,
        allowUnset: Boolean(previousUrl),
        mode: 'link',
        apply: (url) => {
          if (!url) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        },
      });
    },
  },
];

const SlashCommandList = ({
  items,
  selectedIndex,
  onSelect,
  onHighlight,
}: SlashCommandListProps) => {
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items]);

  useEffect(() => {
    const activeNode = itemRefs.current[selectedIndex];
    if (activeNode) {
      activeNode.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, items]);

  return (
    <div
      className={cn(
        'z-50 min-w-[260px] max-w-[320px] rounded-xl border border-border/60 bg-popover p-2 shadow-lg backdrop-blur-md',
        'motion-safe:animate-in fade-in slide-in-from-top-2'
      )}
    >
      <Command shouldFilter={false} className="bg-transparent p-0 text-foreground">
        <ScrollArea className="max-h-64 overflow-y-auto px-1">
          <CommandList className="flex flex-col gap-1 p-1">
            {items.length === 0 ? (
              <div className="px-3 py-5 text-center text-sm text-muted-foreground">
                Tidak ada command yang cocok.
              </div>
            ) : (
              items.map((item, index) => {
                const Icon = item.icon;
                const isActive = index === selectedIndex;
                return (
                  <CommandItem
                    key={item.title}
                    value={item.title}
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    data-selected={isActive}
                    className={cn(
                      'group flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-150',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                    onSelect={() => onSelect(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onMouseEnter={() => onHighlight(index)}
                  >
                    <Icon
                      className={cn(
                        'mt-0.5 h-4 w-4 text-muted-foreground transition-colors',
                        isActive && 'text-accent-foreground',
                        'group-hover:text-accent-foreground'
                      )}
                    />
                    <span className="flex flex-col">
                      <span className="font-medium leading-none">{item.title}</span>
                      <span
                        className={cn(
                          'text-xs text-muted-foreground transition-colors group-hover:text-accent-foreground/80',
                          isActive && 'text-accent-foreground/80'
                        )}
                      >
                        {item.description}
                      </span>
                    </span>
                  </CommandItem>
                );
              })
            )}
          </CommandList>
        </ScrollArea>
      </Command>
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
            return SlashCommandItems;
          }
          return SlashCommandItems.filter((item) => {
            const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
            const descriptionMatch = item.description.toLowerCase().includes(normalizedQuery);
            const keywordMatch = item.keywords?.some((keyword) =>
              keyword.toLowerCase().includes(normalizedQuery)
            );
            return titleMatch || descriptionMatch || keywordMatch;
          });
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

          const handleSelect = (index: number) => {
            if (!items.length || !command) return;
            const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
            const item = items[clampedIndex];
            if (item) {
              command(item);
            }
          };

          const handleHighlight = (index: number) => {
            selectedIndex = index;
            updateComponentProps();
          };

          const destroy = () => {
            component?.destroy();
            component = null;
            if (popup) {
              popup.remove();
              popup = null;
            }
            items = [];
            command = null;
            selectedIndex = 0;
          };

          const updateComponentProps = () => {
            component?.updateProps({
              items,
              selectedIndex,
              onSelect: handleSelect,
              onHighlight: handleHighlight,
            });
          };

          const updatePosition = (props: SuggestionProps<SlashCommandItem>) => {
            const rect = props.clientRect?.();
            if (!popup || !rect) return;
            const viewportPadding = 12;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const popupRect = popup.getBoundingClientRect();
            const popupWidth = popupRect.width || popup.offsetWidth;
            const popupHeight = popupRect.height || popup.offsetHeight;

            const clamp = (value: number, min: number, max: number) =>
              Math.min(Math.max(value, min), max);

            const maxLeft = viewportWidth - popupWidth - viewportPadding;
            const left = clamp(rect.left, viewportPadding, Math.max(viewportPadding, maxLeft));

            const maxTop = viewportHeight - popupHeight - viewportPadding;
            let preferredTop = rect.bottom + 8;
            if (preferredTop + popupHeight + viewportPadding > viewportHeight) {
              preferredTop = rect.top - popupHeight - 8;
            }
            const top = clamp(preferredTop, viewportPadding, Math.max(viewportPadding, maxTop));

            popup.style.left = `${left}px`;
            popup.style.top = `${top}px`;
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
                  onSelect: handleSelect,
                  onHighlight: handleHighlight,
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
                selectedIndex = 0;
                updateComponentProps();
                updatePosition(props);
                return;
              }

              if (selectedIndex >= items.length) {
                selectedIndex = items.length - 1;
              }

              if (selectedIndex < 0) {
                selectedIndex = 0;
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
  const linkActionRef = useRef<(value: string | null) => void>(() => {});
  const imageActionRef = useRef<(value: string) => void>(() => {});
  const [linkDialogState, setLinkDialogState] = useState<LinkDialogState>({
    open: false,
    value: '',
    allowUnset: false,
    mode: 'link',
  });
  const [imageDialogState, setImageDialogState] = useState<{ open: boolean; value: string }>({
    open: false,
    value: '',
  });

  const openImageDialog = useCallback((initialValue: string | null, apply: (url: string) => void) => {
    imageActionRef.current = apply;
    setImageDialogState({ open: true, value: initialValue ?? '' });
  }, []);

  const openLinkDialog = useCallback(
    ({
      initialValue,
      allowUnset,
      mode = 'link',
      apply,
    }: {
      initialValue: string | null;
      allowUnset: boolean;
      mode?: LinkDialogMode;
      apply: (url: string | null) => void;
    }) => {
      linkActionRef.current = apply;
      setLinkDialogState({ open: true, value: initialValue ?? '', allowUnset, mode });
    },
    []
  );

  const handleImageDialogOpenChange = useCallback((open: boolean) => {
    setImageDialogState((prev) => ({ ...prev, open }));
  }, []);

  const handleLinkDialogOpenChange = useCallback((open: boolean) => {
    setLinkDialogState((prev) => ({ ...prev, open }));
  }, []);

  const handleConfirmImage = useCallback(() => {
    const trimmed = imageDialogState.value.trim();
    if (!trimmed) {
      toast.error('Image URL is required.');
      return;
    }
    imageActionRef.current(trimmed);
    setImageDialogState((prev) => ({ ...prev, open: false }));
  }, [imageDialogState.value]);

  const handleConfirmLink = useCallback(() => {
    const trimmed = linkDialogState.value.trim();
    if (!trimmed) {
      toast.error('Link URL is required.');
      return;
    }
    linkActionRef.current(trimmed);
    setLinkDialogState((prev) => ({ ...prev, open: false }));
  }, [linkDialogState.value]);

  const handleRemoveLink = useCallback(() => {
    linkActionRef.current(null);
    setLinkDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const customRequestImageUrl = useCallback<RequestImageUrlHandler>(
    ({ apply }) => {
      openImageDialog(null, apply);
    },
    [openImageDialog]
  );

  const customRequestLinkUrl = useCallback<RequestLinkUrlHandler>(
    ({ initialValue, allowUnset, mode = 'link', apply }) => {
      openLinkDialog({ initialValue, allowUnset, mode, apply });
    },
    [openLinkDialog]
  );

  useEffect(() => {
    requestImageUrl = customRequestImageUrl;
    requestLinkUrl = customRequestLinkUrl;
    return () => {
      if (requestImageUrl === customRequestImageUrl) {
        requestImageUrl = defaultRequestImageUrl;
      }
      if (requestLinkUrl === customRequestLinkUrl) {
        requestLinkUrl = defaultRequestLinkUrl;
      }
    };
  }, [customRequestImageUrl, customRequestLinkUrl]);

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
      Table.configure({
        HTMLAttributes: {
          class: 'tiptap-table w-full overflow-hidden rounded-lg border border-border bg-background text-sm',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-muted/60 px-3 py-2 text-left font-medium uppercase tracking-wide text-xs',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'px-3 py-2 align-top',
        },
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
    <>
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

      <AlertDialog open={linkDialogState.open} onOpenChange={handleLinkDialogOpenChange}>
        <AlertDialogContent className="bg-white dark:bg-slate-950">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {linkDialogState.mode === 'embed'
                ? 'Embed link'
                : linkDialogState.allowUnset
                  ? 'Update link'
                  : 'Insert link'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {linkDialogState.mode === 'embed'
                ? 'Paste the URL to embed inside the document.'
                : 'Paste the URL that should be attached to the selected text.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Input
              autoFocus
              type="url"
              placeholder={
                linkDialogState.mode === 'embed'
                  ? 'https://example.com/embed'
                  : 'https://example.com'
              }
              value={linkDialogState.value}
              onChange={(event) =>
                setLinkDialogState((prev) => ({
                  ...prev,
                  value: event.target.value,
                }))
              }
            />
          </div>
          <AlertDialogFooter>
            {linkDialogState.allowUnset && (
              <Button type="button" variant="ghost" onClick={handleRemoveLink}>
                Remove link
              </Button>
            )}
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLink}>
              {linkDialogState.mode === 'embed' ? 'Embed link' : 'Save link'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={imageDialogState.open} onOpenChange={handleImageDialogOpenChange}>
        <AlertDialogContent className="bg-white dark:bg-slate-950">
          <AlertDialogHeader>
            <AlertDialogTitle>Embed an image</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a direct image URL to insert it into the notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Input
              autoFocus
              type="url"
              placeholder="https://example.com/topology.png"
              value={imageDialogState.value}
              onChange={(event) =>
                setImageDialogState((prev) => ({
                  ...prev,
                  value: event.target.value,
                }))
              }
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImage}>
              Insert image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
