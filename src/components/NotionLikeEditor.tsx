import React, { useEffect, useState, useRef, KeyboardEvent, DragEvent } from 'react';
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
  Table as TableIcon,
  ChevronDown,
  RowsIcon,
  ColumnsIcon,
  Trash2,
  Plus,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// 画面幅を監視するカスタムフック
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

interface NotionLikeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

interface Command {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const NotionLikeEditor: React.FC<NotionLikeEditorProps> = ({
  value,
  onChange,
  placeholder = "/を入力して書式を選択するか、マークダウン記法を使用してください...",
  onImageUpload
}) => {
  const [selectionEmpty, setSelectionEmpty] = useState(true);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashCommandPosition, setSlashCommandPosition] = useState({ top: 0, left: 0 });
  const [slashPosition, setSlashPosition] = useState<{ from: number, to: number } | null>(null);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [isTableSelected, setIsTableSelected] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 画面幅が広いかどうかを検出
  const isWideScreen = useMediaQuery('(min-width: 768px)');
  
  const lowlight = createLowlight();
  
  // Register languages for syntax highlighting
  lowlight.register('js', js);

  // コマンドの定義
  const commands: Command[] = [
    { id: 'paragraph', icon: <span className="h-4 w-4 mr-2 flex items-center justify-center">P</span>, label: '通常テキスト' },
    { id: 'heading1', icon: <Heading1 className="h-4 w-4 mr-2" />, label: '見出し 1' },
    { id: 'heading2', icon: <Heading2 className="h-4 w-4 mr-2" />, label: '見出し 2' },
    { id: 'heading3', icon: <Heading3 className="h-4 w-4 mr-2" />, label: '見出し 3' },
    { id: 'bulletList', icon: <List className="h-4 w-4 mr-2" />, label: '箇条書きリスト' },
    { id: 'orderedList', icon: <ListOrdered className="h-4 w-4 mr-2" />, label: '番号付きリスト' },
    { id: 'blockquote', icon: <Quote className="h-4 w-4 mr-2" />, label: '引用' },
    { id: 'codeBlock', icon: <Code className="h-4 w-4 mr-2" />, label: 'コードブロック' },
    { id: 'table', icon: <TableIcon className="h-4 w-4 mr-2" />, label: '表' },
    { id: 'image', icon: <ImageIcon className="h-4 w-4 mr-2" />, label: '画像' },
  ];

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
      
      // 表が選択されているかをチェック
      setIsTableSelected(editor.isActive('table'));
      
      // 表選択が外れたらメニューを閉じる
      if (!editor.isActive('table')) {
        setShowTableMenu(false);
      }
    },
    // マークダウン入力をリッチテキストに変換するキーマップ
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert min-h-[350px] max-w-none p-4 focus:outline-none',
      },
      handleKeyDown: (view, event) => {
        // スラッシュメニューが表示されている場合、キーボードナビゲーションを処理
        if (showSlashCommands) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedCommandIndex((prev) => (prev < commands.length - 1 ? prev + 1 : prev));
            return true;
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedCommandIndex((prev) => (prev > 0 ? prev - 1 : prev));
            return true;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            executeSlashCommand(commands[selectedCommandIndex].id);
            return true;
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setShowSlashCommands(false);
            setSlashPosition(null);
            return true;
          }
        }

        // スラッシュが押された時、スラッシュコマンドメニューを表示
        if (event.key === '/') {
          if (!editorRef.current) return false;

          const { state } = view;
          const { selection } = state;
          const { $from, empty } = selection;

          // テキスト選択中は何もしない
          if (!empty) return false;

          // エディタの絶対位置を取得
          const editorRect = editorRef.current.getBoundingClientRect();
          
          // カーソル位置の座標を取得
          const coords = view.coordsAtPos($from.pos);
          
          // エディタ内の相対位置に変換
          const top = coords.top - editorRect.top;
          const left = coords.left - editorRect.left;
          
          setSlashCommandPosition({ top, left });
          setShowSlashCommands(true);
          setSelectedCommandIndex(0);
          
          // スラッシュの位置を保存（後で削除するため）
          setSlashPosition({
            from: $from.pos,
            to: $from.pos + 1
          });
          
          return true; // イベントを処理したことを示す
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

  const [isDragging, setIsDragging] = useState(false);

  const addImage = () => {
    const url = window.prompt('画像のURLを入力してください');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        await insertImage(file);
      }
    };
    input.click();
  };

  const insertImage = async (file: File) => {
    if (!editor || !onImageUpload) return;
    
    try {
      // ローディング表示などを実装する場合はここで
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('画像のアップロードに失敗しました', error);
      window.alert('画像のアップロードに失敗しました');
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

  const executeSlashCommand = (commandId: string) => {
    if (!editor || !slashPosition) return;

    // スラッシュを削除
    editor.commands.deleteRange({
      from: slashPosition.from,
      to: slashPosition.to
    });

    // コマンドに対応する処理を実行
    switch (commandId) {
      case 'paragraph':
        // 通常のパラグラフに戻す
        editor.chain().focus().setParagraph().run();
        break;
      case 'heading1':
        // 見出し1を直接適用
        editor.chain().focus().setNode('heading', { level: 1 }).run();
        break;
      case 'heading2':
        // 見出し2を直接適用
        editor.chain().focus().setNode('heading', { level: 2 }).run();
        break;
      case 'heading3':
        // 見出し3を直接適用
        editor.chain().focus().setNode('heading', { level: 3 }).run();
        break;
      case 'bulletList':
        // 箇条書きリストを直接適用
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        // 番号付きリストを直接適用
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        // 引用を直接適用
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'codeBlock':
        // コードブロックを直接適用
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'table':
        // 表の場合は直接表を挿入
        addTable();
        break;
      case 'image':
        // 画像の場合は画像挿入ダイアログを表示
        addImage();
        break;
      default:
        break;
    }
    
    // メニューを閉じる
    setShowSlashCommands(false);
    setSlashPosition(null);
  };

  // メニューが表示されたときに選択インデックスをリセット
  useEffect(() => {
    if (showSlashCommands) {
      setSelectedCommandIndex(0);
    }
  }, [showSlashCommands]);

  // エディタ外でのクリックを監視して表メニューを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // メニューの外側をクリックしたらメニューを閉じる
      if (showTableMenu && editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setShowTableMenu(false);
      }
      
      // スラッシュコマンドメニューの処理（既存コード）
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      
      if (showSlashCommands) {
        setShowSlashCommands(false);
        setSlashPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSlashCommands, showTableMenu]);

  // エディタ外でのキーボードイベントのリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSlashCommands) return;
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);
    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [showSlashCommands]);

  // ドラッグ&ドロップ関連のイベントハンドラ
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    // 複数の画像が一度にドロップされた場合は順番に処理
    for (const file of files) {
      await insertImage(file);
    }
  };

  // 表の行を追加
  const addTableRow = (position: 'before' | 'after') => {
    if (editor && editor.isActive('table')) {
      // カーソルがヘッダー行内にあるかをチェック
      const isInHeader = editor.isActive('tableHeader');
      
      // ヘッダー行内での「上に追加」は無視
      if (position === 'before' && isInHeader) {
        return;
      }
      
      // 現在のカーソル位置を取得
      const { $anchor } = editor.state.selection;
      
      // ヘッダー行直後かどうかを判定する
      let isDirectlyAfterHeader = false;
      
      if (!isInHeader && position === 'before') {
        try {
          // 現在のノードの親（tableRowノード）を取得
          const currentRow = $anchor.parent;
          
          if (currentRow && currentRow.type.name === 'tableRow') {
            // カーソル位置から表のDOMノードを取得
            const tableElement = editor.view.domAtPos($anchor.pos).node as Node;
            let tableNode: HTMLTableElement | null = null;
            
            // 親をたどってテーブル要素を見つける
            let currentNode: Node | null = tableElement;
            while (currentNode && (currentNode as HTMLElement).tagName !== 'TABLE') {
              currentNode = currentNode.parentElement;
            }
            tableNode = currentNode as HTMLTableElement;
            
            if (tableNode) {
              // 現在の行のDOMノードを取得
              let rowElement: HTMLTableRowElement | null = null;
              currentNode = tableElement;
              while (currentNode && (currentNode as HTMLElement).tagName !== 'TR') {
                currentNode = currentNode.parentElement;
              }
              rowElement = currentNode as HTMLTableRowElement;
              
              if (rowElement) {
                // すべての行を取得し、現在の行が何番目かを確認
                const rows = tableNode.querySelectorAll('tr');
                const rowIndex = Array.from(rows).indexOf(rowElement);
                
                // ヘッダー行(0)の次の行(1)かどうか
                isDirectlyAfterHeader = rowIndex === 1;
              }
            }
          }
        } catch (e) {
          console.error("行インデックスの取得に失敗:", e);
        }
      }
      
      // ヘッダー行直後での「上に追加」は「下に追加」に変更
      if (isDirectlyAfterHeader) {
        editor.chain().focus().addRowAfter().run();
      } else {
        // その他の場合は通常の操作
        if (position === 'before') {
          editor.chain().focus().addRowBefore().run();
        } else {
          editor.chain().focus().addRowAfter().run();
        }
      }
    }
  };
  
  // 表の列を追加
  const addTableColumn = (position: 'before' | 'after') => {
    if (editor && editor.isActive('table')) {
      if (position === 'before') {
        editor.chain().focus().addColumnBefore().run();
      } else {
        editor.chain().focus().addColumnAfter().run();
      }
    }
  };
  
  // 表の行を削除
  const deleteTableRow = () => {
    if (editor && editor.isActive('table')) {
      editor.chain().focus().deleteRow().run();
    }
  };
  
  // 表の列を削除
  const deleteTableColumn = () => {
    if (editor && editor.isActive('table')) {
      editor.chain().focus().deleteColumn().run();
    }
  };
  
  // 表を削除
  const deleteTable = () => {
    if (editor && editor.isActive('table')) {
      editor.chain().focus().deleteTable().run();
    }
  };

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // 強制的に内容を更新することで、
      // リッチテキストモードからマークダウンモードに切り替えたときの
      // 表示問題を解決
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div 
      className={`border rounded-md ${isDragging ? 'ring-2 ring-primary' : ''}`} 
      ref={editorRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 書式選択メニュー - 画面幅に応じて表示を切り替え */}
      <div className="bg-muted/40 p-1 border-b">
        {isWideScreen ? (
          // 幅が広い場合はボタンを横に並べて表示
          <div className="flex flex-wrap gap-1">
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={() => editor.chain().focus().setParagraph().run()}
              data-active={editor.isActive('paragraph')}
            >
              <span className="flex items-center justify-center mr-1">P</span>
              <span className="hidden sm:inline">通常テキスト</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              data-active={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">見出し 1</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              data-active={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">見出し 2</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              data-active={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">見出し 3</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              data-active={editor.isActive('bulletList')}
            >
              <List className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">箇条書き</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              data-active={editor.isActive('orderedList')}
            >
              <ListOrdered className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">番号リスト</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              data-active={editor.isActive('blockquote')}
            >
              <Quote className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">引用</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              data-active={editor.isActive('codeBlock')}
            >
              <Code className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">コード</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={addTable}
            >
              <TableIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">表</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="h-8 flex items-center"
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">画像</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={addImage}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  URLから追加
                </DropdownMenuItem>
                {onImageUpload && (
                  <DropdownMenuItem onClick={uploadImage}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    アップロード
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center"
              onClick={setLink}
              data-active={editor.isActive('link')}
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">リンク</span>
            </Button>
          </div>
        ) : (
          // 幅が狭い場合はドロップダウンメニュー
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-8 w-auto px-2 flex items-center"
              >
                <span className="mr-1">書式を選択</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                <span className="h-4 w-4 mr-2 flex items-center justify-center">P</span>
                通常テキスト
              </DropdownMenuItem>
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
              <DropdownMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center w-full px-2 py-1.5">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    画像
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={addImage}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      URLから追加
                    </DropdownMenuItem>
                    {onImageUpload && (
                      <DropdownMenuItem onClick={uploadImage}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        アップロード
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={setLink}>
                <LinkIcon className="h-4 w-4 mr-2" />
                リンク
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* エディタ本体 */}
      <div className="relative">
        <EditorContent editor={editor} className="notion-like-editor" />

        {/* 表が選択されているときに表示する表編集ボタン */}
        {isTableSelected && (
          <div className="absolute top-2 right-2 z-10">
            <Popover open={showTableMenu} onOpenChange={setShowTableMenu}>
              <PopoverTrigger asChild>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-background shadow-md border"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="bg-background flex flex-col gap-2">
                  <div className="text-xs font-medium text-muted-foreground mb-1">表の編集</div>
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addTableRow('before')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      上に行を追加
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addTableRow('after')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      下に行を追加
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addTableColumn('before')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      左に列を追加
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addTableColumn('after')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      右に列を追加
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={deleteTableRow}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      行を削除
                    </Button>
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={deleteTableColumn}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      列を削除
                    </Button>
                  </div>
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="sm"
                    className="h-7 text-xs mt-1"
                    onClick={deleteTable}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    表を削除
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* スラッシュコマンドメニュー (エディタ内に配置) */}
        {showSlashCommands && editor && (
          <div 
            ref={menuRef}
            className="absolute z-10 bg-background border rounded-md shadow-md overflow-hidden"
            style={{
              top: slashCommandPosition.top + 'px',
              left: slashCommandPosition.left + 'px',
              maxHeight: '300px',
              overflowY: 'auto',
              width: '220px'
            }}
          >
            <div className="py-1">
              {commands.map((command, index) => (
                <button 
                  key={command.id}
                  type="button"
                  className={`w-full text-left px-3 py-1.5 flex items-center ${
                    selectedCommandIndex === index 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    executeSlashCommand(command.id);
                  }}
                  onMouseEnter={() => setSelectedCommandIndex(index)}
                >
                  {command.icon}
                  <span>{command.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* テキスト選択時に表示されるバブルメニュー */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor }) => !editor.state.selection.empty}
        >
          <div className="bg-background border rounded-md shadow-md flex p-1">
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleBold().run()}
              data-active={editor.isActive('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              data-active={editor.isActive('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => editor.chain().focus().toggleCode().run()}
              data-active={editor.isActive('code')}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
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
        
        /* 表のスタイリング */
        .notion-like-editor table {
          border-collapse: collapse;
          margin: 1rem 0;
          overflow: hidden;
          width: 100%;
          table-layout: fixed;
          border: 1px solid #e2e8f0;
        }
        
        .notion-like-editor th {
          background-color: rgba(0, 0, 0, 0.05);
          font-weight: bold;
          text-align: left;
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
        }
        
        .dark .notion-like-editor th {
          background-color: rgba(255, 255, 255, 0.1);
          border-color: #2d3748;
        }
        
        .notion-like-editor td {
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          vertical-align: top;
        }
        
        .dark .notion-like-editor td {
          border-color: #2d3748;
        }
        
        .notion-like-editor table p {
          margin: 0;
        }
        
        /* ドラッグ&ドロップ中のスタイル */
        .notion-like-editor.drag-over {
          background-color: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.5);
        }
        
        /* 表編集ハイライト */
        .notion-like-editor .has-focus {
          outline: 2px solid #3182ce !important;
        }
        
        /* 表のセルホバースタイル */
        .notion-like-editor td:hover,
        .notion-like-editor th:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }
        
        .dark .notion-like-editor td:hover,
        .dark .notion-like-editor th:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        `}
      </style>
    </div>
  );
};

export default NotionLikeEditor;
