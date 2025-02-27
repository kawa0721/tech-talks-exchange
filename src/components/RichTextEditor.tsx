import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Check,
  X,
  Highlighter,
  Palette
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'ここに本文を入力してください...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('画像のURLを入力してください');

    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md">
      <div className="bg-muted/40 p-1 border-b flex flex-wrap gap-1 items-center">
        <ToggleGroup type="multiple" className="flex flex-wrap">
          <ToggleGroupItem
            value="bold"
            aria-label="太字"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-state={editor.isActive('bold') ? 'on' : 'off'}
          >
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          
          <ToggleGroupItem
            value="italic"
            aria-label="斜体"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-state={editor.isActive('italic') ? 'on' : 'off'}
          >
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          
          <ToggleGroupItem
            value="underline"
            aria-label="下線"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            data-state={editor.isActive('underline') ? 'on' : 'off'}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToggleGroupItem>

          <ToggleGroupItem
            value="code"
            aria-label="コード"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            data-state={editor.isActive('code') ? 'on' : 'off'}
          >
            <Code className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-6" />

        <ToggleGroup type="single" className="flex flex-wrap">
          <ToggleGroupItem
            value="h1"
            aria-label="見出し1"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            data-state={editor.isActive('heading', { level: 1 }) ? 'on' : 'off'}
          >
            <Heading1 className="h-4 w-4" />
          </ToggleGroupItem>
          
          <ToggleGroupItem
            value="h2"
            aria-label="見出し2"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            data-state={editor.isActive('heading', { level: 2 }) ? 'on' : 'off'}
          >
            <Heading2 className="h-4 w-4" />
          </ToggleGroupItem>
          
          <ToggleGroupItem
            value="h3"
            aria-label="見出し3"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            data-state={editor.isActive('heading', { level: 3 }) ? 'on' : 'off'}
          >
            <Heading3 className="h-4 w-4" />
          </ToggleGroupItem>
          
          <ToggleGroupItem
            value="quote"
            aria-label="引用"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            data-state={editor.isActive('blockquote') ? 'on' : 'off'}
          >
            <Quote className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-6" />

        <ToggleGroup type="single" className="flex flex-wrap">
          <ToggleGroupItem
            value="bulletList"
            aria-label="箇条書き"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-state={editor.isActive('bulletList') ? 'on' : 'off'}
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          
          <ToggleGroupItem
            value="orderedList"
            aria-label="番号付きリスト"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-state={editor.isActive('orderedList') ? 'on' : 'off'}
          >
            <ListOrdered className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-6" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className={cn(
              "flex h-8 w-8 p-0 data-[state=open]:bg-muted",
              editor.isActive('link') && "bg-muted"
            )}>
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="grid gap-1 p-2">
              <div className="grid grid-cols-3 items-center gap-2">
                <Input 
                  id="link" 
                  placeholder="https://example.com"
                  defaultValue={editor.isActive('link') ? editor.getAttributes('link').href : ''}
                  className="col-span-2 h-8"
                />
                <div className="flex">
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 mr-1"
                    onClick={() => {
                      const input = document.getElementById('link') as HTMLInputElement;
                      if (input.value) {
                        editor.chain().focus().extendMarkRange('link')
                          .setLink({ href: input.value }).run();
                      }
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm" 
                    variant="destructive" 
                    className="h-8 w-8 p-0"
                    onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={addTable}>
          <TableIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="grid grid-cols-5 gap-1">
              {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
                '#ff00ff', '#00ffff', '#800000', '#008000', '#000080', 
                '#808000', '#800080', '#008080', '#808080', '#ff8080'].map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-md"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="grid grid-cols-5 gap-1">
              {['#ffff00', '#a5ffaf', '#ffd8a5', '#a5d8ff', '#d8a5ff', 
                '#ffa5d8', '#e0e0e0', '#ffc7c7', '#c7ffc7', '#c7c7ff'].map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-md"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1"></div>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} className="prose prose-sm dark:prose-invert min-h-[200px] max-w-none p-4" />
    </div>
  );
};

export default RichTextEditor;
