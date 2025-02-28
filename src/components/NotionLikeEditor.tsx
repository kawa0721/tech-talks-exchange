
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import js from 'highlight.js/lib/languages/javascript';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface NotionLikeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// スラッシュコマンド機能のカスタム拡張機能
const SlashCommand = (props: any) => {
  // 実際のExtensionはここでは実装せず、keyDownHandlerを使って代用します
  return {
    name: 'slashCommand',
    // 他の設定...
  };
};

const NotionLikeEditor: React.FC<NotionLikeEditorProps> = ({
  value,
  onChange,
  placeholder = "/'を入力して書式を選択するか、マークダウン記法を使用してください..."
}) => {
  const [selectionEmpty, setSelectionEmpty] = useState(true);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashCommandsPosition, setSlashCommandsPosition] = useState({ top: 0, left: 0 });
  
  const lowlight = createLowlight();
  
  // Register languages for syntax highlighting
  lowlight.register('js', js);

  const editor = useEditor({
    extensions: [
      // 基本的な機能
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // カスタムのコードブロックを使用するため無効化
      }),
      // マークダウンライクなプレースホルダー
      Placeholder.configure({
        placeholder,
        // 見出しなどでカスタムプレースホルダーを表示
        emptyNodeClass: 'is-empty',
        showOnlyWhenEditable: true,
      }),
      // 表機能
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      // 画像
      Image,
      // リンク
      Link.configure({
        openOnClick: false,
      }),
      // テキストスタイル
      TextStyle,
      Color,
      Highlight,
      // シンタックスハイライト付きコードブロック
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      setSelectionEmpty(editor.state.selection.empty);
    },
    // マークダウン入力をリッチテキストに変換するキーマップ
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert min-h-[200px] max-w-none p-4 focus:outline-none',
      },
      handleKeyDown: (view, event) => {
        // スラッシュが押された時、スラッシュコマンドメニューを表示
        if (event.key === '/') {
          const { state } = view;
          const { selection } = state;
          const { $from, empty } = selection;

          if (!empty) return false;

          // 行の先頭または空白の後の '/' のみ反応するようにする
          const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
          if (textBefore === '' || textBefore.endsWith(' ')) {
            // スラッシュコマンドメニューを表示する位置を計算
            const coords = view.coordsAtPos($from.pos);
            setSlashCommandsPosition({
              top: coords.bottom,
              left: coords.left,
            });
            
            setShowSlashCommands(true);
            return false; // イベントをキャプチャしない（'/'を入力させる）
          }
        }
        
        // Escキーでスラッシュコマンドメニューを閉じる
        if (event.key === 'Escape' && showSlashCommands) {
          setShowSlashCommands(false);
          return true;
        }

        // スペースキーが押された時、マークダウン記法を変換
        if (event.key === ' ') {
          const { state } = view;
          const { selection } = state;
          const { $from, from, empty } = selection;

          if (!empty) return false;

          const textBefore = $from.doc.textBetween(
            $from.start(), 
            from, 
            '\n', 
            '\ufffc'
          );

          // 見出し変換
          const headingMatch = textBefore.match(/^(#{1,3})\s$/);
          if (headingMatch) {
            const level = headingMatch[1].length;
            view.dispatch(state.tr
              .delete($from.start(), from)
              .setBlockType(
                $from.pos, 
                $from.pos, 
                view.state.schema.nodes.heading, 
                { level }
              )
            );
            return true;
          }

          // 箇条書きリスト変換
          if (textBefore.match(/^-\s$/)) {
            view.dispatch(state.tr
              .delete($from.start(), from)
              .setBlockType(
                $from.pos, 
                $from.pos, 
                view.state.schema.nodes.bulletList
              )
              .insert(
                $from.pos, 
                view.state.schema.nodes.listItem.create(
                  null, 
                  view.state.schema.nodes.paragraph.create()
                )
              )
            );
            return true;
          }

          // 番号付きリスト変換
          if (textBefore.match(/^1\.\s$/)) {
            view.dispatch(state.tr
              .delete($from.start(), from)
              .setBlockType(
                $from.pos, 
                $from.pos, 
                view.state.schema.nodes.orderedList
              )
              .insert(
                $from.pos, 
                view.state.schema.nodes.listItem.create(
                  null, 
                  view.state.schema.nodes.paragraph.create()
                )
              )
            );
            return true;
          }

          // 引用変換
          if (textBefore.match(/^>\s$/)) {
            view.dispatch(state.tr
              .delete($from.start(), from)
              .setBlockType(
                $from.pos, 
                $from.pos, 
                view.state.schema.nodes.blockquote
              )
            );
            return true;
          }

          // コードブロック変換
          if (textBefore.match(/^```\s$/)) {
            view.dispatch(state.tr
              .delete($from.start(), from)
              .setBlockType(
                $from.pos, 
                $from.pos, 
                view.state.schema.nodes.codeBlock
              )
            );
            return true;
          }
        }

        return false;
      },
    },
  });

  const addImage = () => {
    const url = window.prompt('画像のURLを入力してください');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  };

  const setLink = () => {
    if (editor) {
      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('リンクURL', previousUrl);
      
      // キャンセルされた場合
      if (url === null) return;
      
      // 空の場合はリンクを解除
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }
      
      // リンクを設定
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const executeSlashCommand = (command: string) => {
    if (!editor) return;

    switch (command) {
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'table':
        addTable();
        break;
      case 'image':
        addImage();
        break;
      default:
        break;
    }

    // スラッシュ文字（'/'）を削除
    const { state } = editor.view;
    const { selection } = state;
    const { $from } = selection;
    
    if ($from.textBefore.endsWith('/')) {
      editor.commands.deleteRange({
        from: $from.pos - 1,
        to: $from.pos,
      });
    }
    
    setShowSlashCommands(false);
  };

  // クリックイベントを処理
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSlashCommands) {
        setShowSlashCommands(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSlashCommands]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md relative">
      {/* スラッシュメニュー代わりのドロップダウン */}
      <div className="bg-muted/40 p-1 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-auto px-2">
              / 書式を選択
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="h-4 w-4 mr-2" />
              見出し 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="h-4 w-4 mr-2" />
              見出し 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="h-4 w-4 mr-2" />
              見出し 3
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List className="h-4 w-4 mr-2" />
              箇条書きリスト
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered className="h-4 w-4 mr-2" />
              番号付きリスト
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote className="h-4 w-4 mr-2" />
              引用
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
              <Code className="h-4 w-4 mr-2" />
              コードブロック
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addTable}>
              <TableIcon className="h-4 w-4 mr-2" />
              表
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addImage}>
              <ImageIcon className="h-4 w-4 mr-2" />
              画像
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* スラッシュコマンドメニュー */}
      {showSlashCommands && editor && (
        <div 
          className="absolute z-50 bg-background border rounded-md shadow-md overflow-hidden"
          style={{
            top: slashCommandsPosition.top + 'px',
            left: slashCommandsPosition.left + 'px',
          }}
          onClick={(e) => e.stopPropagation()} // クリックイベントの伝播を停止
        >
          <div className="py-1">
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center"
              onClick={() => executeSlashCommand('heading1')}
            >
              <Heading1 className="h-4 w-4 mr-2" />
              <span>見出し 1</span>
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center"
              onClick={() => executeSlashCommand('heading2')}
            >
              <Heading2 className="h-4 w-4 mr-2" />
              <span>見出し 2</span>
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center"
              onClick={() => executeSlashCommand('heading3')}
            >
              <Heading3 className="h-4 w-4 mr-2" />
              <span>見出し 3</span>
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center"
              onClick={() => executeSlashCommand('bulletList')}
            >
              <List className="h-4 w-4 mr-2" />
              <span>箇条書きリスト</span>
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center"
              onClick={() => executeSlashCommand('orderedList')}
            >
              <ListOrdered className="h-4 w-4 mr-2" />
              <span>番号付きリスト</span>
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center"
              onClick={() => executeSlashCommand('blockquote')}
            >
              <Quote className="h-4 w-4 mr-2" />
              <span>引用</span>
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center"
              onClick={() => executeSlashCommand('codeBlock')}
            >
              <Code className="h-4 w-4 mr-2" />
              <span>コードブロック</span>
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center"
              onClick={() => executeSlashCommand('table')}
            >
              <TableIcon className="h-4 w-4 mr-2" />
              <span>表</span>
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center"
              onClick={() => executeSlashCommand('image')}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              <span>画像</span>
            </button>
          </div>
        </div>
      )}

      {/* テキスト選択時に表示されるバブルメニュー */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor }) => !editor.state.selection.empty}
        >
          <div className="bg-background border rounded-md shadow-md flex p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleBold().run()}
              data-active={editor.isActive('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              data-active={editor.isActive('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleCode().run()}
              data-active={editor.isActive('code')}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={setLink}
              data-active={editor.isActive('link')}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* エディタ本体 */}
      <EditorContent editor={editor} className="notion-like-editor" />

      <style>
        {`
        .notion-like-editor .is-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .notion-like-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .notion-like-editor [data-active="true"] {
          background-color: rgba(0, 0, 0, 0.1);
        }
        .dark .notion-like-editor [data-active="true"] {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}
      </style>
    </div>
  );
};

export default NotionLikeEditor;
