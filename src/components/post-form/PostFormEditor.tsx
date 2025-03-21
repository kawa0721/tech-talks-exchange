import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotionLikeEditor from "@/components/NotionLikeEditor";
import { convertHtmlToMarkdown, convertMarkdownToHtml } from "@/lib/markdownUtils";
import { Bold, Italic, Underline, List, ListOrdered, Code, Heading1, Heading2, Heading3, Quote, Link, Image, Upload, Table, Trash2, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PostFormEditorProps {
  htmlContent: string;
  setHtmlContent: (html: string) => void;
  content: string;
  setContent: (content: string) => void;
}

interface TableSelectionState {
  table: HTMLTableElement;
  row: number;
  col: number;
}

const PostFormEditor = ({
  htmlContent,
  setHtmlContent,
  content,
  setContent,
}: PostFormEditorProps) => {
  // 共通状態
  const [activeTab, setActiveTab] = useState<"write" | "richtext" | "html" | "preview">("write");
  
  // リッチテキストエディタ状態
  const [tableSelection, setTableSelection] = useState<TableSelectionState | null>(null);
  const [showTableModal, setShowTableModal] = useState(false); // モーダル表示用
  const [showTablePopover, setShowTablePopover] = useState(false); // ポップオーバー表示用
  const [isDragging, setIsDragging] = useState(false);
  
  // リッチテキストエディタの参照
  const richTextEditorRef = useRef<HTMLDivElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  
  // 更新間隔管理用
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 前のタブを追跡
  const [previousTab, setPreviousTab] = useState<"write" | "richtext" | "html" | "preview">("write");
  
  // デバッグ用
  useEffect(() => {
    console.log('現在のエディタステート:', {activeTab, tableSelection, showTableModal, showTablePopover});
  }, [activeTab, tableSelection, showTableModal, showTablePopover]);

  // タブ切り替え時の処理
  useEffect(() => {
    // タブが変わった場合のみ処理
    if (previousTab !== activeTab) {
      
      // リッチテキストモードからの切り替え時
      if (previousTab === "richtext" && contentEditableRef.current) {
        // リッチテキストの内容を保存
        const currentHTML = contentEditableRef.current.innerHTML;
        if (currentHTML !== htmlContent) {
          setHtmlContent(currentHTML);
          // マークダウンも同期して更新
          const markdown = convertHtmlToMarkdown(currentHTML);
          setContent(markdown);
        }
      }
      
      // マークダウンモードからの切り替え時
      if (previousTab === "write") {
        // HTMLを更新
        const html = convertMarkdownToHtml(content);
        if (html !== htmlContent) {
          setHtmlContent(html);
        }
      }
      
      // HTMLコードモードからの切り替え時
      if (previousTab === "html") {
        // マークダウンも更新
        const markdown = convertHtmlToMarkdown(htmlContent);
        setContent(markdown);
      }
      
      // 新しいタブに応じた表示処理
      
      // リッチテキストモードに入る場合
      if (activeTab === "richtext") {
        // 表選択状態をいったんリセットする
        setTableSelection(null);
        setShowTableModal(false);
        setShowTablePopover(false);
        
        // DOMが確実に更新された後にHTMLを設定
        requestAnimationFrame(() => {
          if (contentEditableRef.current) {
            // HTMLコンテンツを設定
            contentEditableRef.current.innerHTML = htmlContent;
            
            // フォーカスを当てる
            contentEditableRef.current.focus();
            
            // 表のイベントハンドラを再設定（タブ切り替え時も動作するように）
            setTimeout(() => {
              console.log('🔄 リッチテキストモードで表のイベントハンドラを再初期化');
              if (contentEditableRef.current) {
                const tables = contentEditableRef.current.querySelectorAll('table');
                console.log(`📊 再初期化対象の表: ${tables.length}個`);
                
                // 既存の表にイベントハンドラとスタイルを適用
                tables.forEach((table, index) => {
                  console.log(`📊 表${index+1}を再初期化中`);
                  // スタイルを設定
                  table.style.border = '2px solid #3b82f6';
                  table.style.borderCollapse = 'collapse';
                  table.style.cursor = 'pointer';
                  table.style.position = 'relative';
                  
                  // 表ホバー時のツールバー表示処理
                  let tableToolbarElem: HTMLDivElement | null = null;
                  
                  // ホバーイベントを再設定
                  table.onmouseenter = () => {
                    // すでにツールバーがあれば除去
                    if (tableToolbarElem) {
                      tableToolbarElem.remove();
                    }
                    
                    // 新しいツールバーを作成
                    tableToolbarElem = document.createElement('div');
                    tableToolbarElem.className = 'table-toolbar';
                    tableToolbarElem.style.position = 'absolute';
                    tableToolbarElem.style.top = '-30px';
                    tableToolbarElem.style.left = '50%';
                    tableToolbarElem.style.transform = 'translateX(-50%)';
                    tableToolbarElem.style.backgroundColor = '#3b82f6';
                    tableToolbarElem.style.color = 'white';
                    tableToolbarElem.style.padding = '5px 10px';
                    tableToolbarElem.style.borderRadius = '4px';
                    tableToolbarElem.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                    tableToolbarElem.style.zIndex = '1000';
                    tableToolbarElem.style.cursor = 'pointer';
                    tableToolbarElem.innerHTML = '<span style="display:flex;align-items:center;gap:5px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>表を編集</span>';
                    
                    // 表に追加
                    table.appendChild(tableToolbarElem);
                    
                    // クリックイベント - ポップオーバーを表示
                    tableToolbarElem.onclick = (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('表ツールバーがクリックされました（再初期化後）');
                      
                      // 表選択状態を更新
                      setTableSelection({ 
                        table: table, 
                        row: 0, 
                        col: 0 
                      });
                      // ポップオーバーを表示 (状態をトグル)
                      setShowTablePopover(true)
                    };
                  };
                  
                  table.onmouseleave = () => {
                    // マウスが表から離れたときにツールバーを削除
                    setTimeout(() => {
                      if (tableToolbarElem && table.contains(tableToolbarElem)) {
                        tableToolbarElem.remove();
                      }
                    }, 200);
                  };
                  
                  // セルのスタイルとイベント
                  const cells = table.querySelectorAll('td, th');
                  cells.forEach(cell => {
                    cell.style.border = '1px solid #cbd5e1';
                    cell.style.padding = '8px';
                    
                    // セルクリックイベントを再設定
                    cell.onclick = (e) => {
                      e.stopPropagation();
                      const cellEl = e.currentTarget as HTMLTableCellElement;
                      const rowEl = cellEl.parentElement as HTMLTableRowElement;
                      
                      console.log('セルがクリックされました（再初期化後）:', {
                        row: rowEl.rowIndex,
                        col: cellEl.cellIndex
                      });
                      
                      // 表選択状態を更新
                      setTableSelection({
                        table: table,
                        row: rowEl.rowIndex,
                        col: cellEl.cellIndex
                      });
                      // ポップオーバーを表示
                      setShowTablePopover(true);
                    };
                  });
                });
              }
            }, 200); // DOMが確実に更新された後に実行
          }
        });
      }
      
      // マークダウンモードに入る場合は何もしない
      // NotionLikeEditorはhtmlContentからコンテンツを取得する
      
      // プレビューモードに入る場合
      if (activeTab === "preview") {
        // 常に最新のHTMLでプレビュー
      }
      
      // 前回のタブを更新
      setPreviousTab(activeTab);
    }
  }, [activeTab, htmlContent, content, setHtmlContent, setContent, previousTab]);

  // リッチテキストエディタの内容が変更されたときに実行されるリスナーを別途設定
  useEffect(() => {
    if (contentEditableRef.current) {
      // 入力イベントリスナー
      const handleInput = () => {
        updateRichTextContent();
      };
      
      // イベントリスナーを追加（input, blurの両方で捕捉）
      contentEditableRef.current.addEventListener('input', handleInput);
      contentEditableRef.current.addEventListener('blur', handleInput);
      
      // クリーンアップ関数
      return () => {
        if (contentEditableRef.current) {
          contentEditableRef.current.removeEventListener('input', handleInput);
          contentEditableRef.current.removeEventListener('blur', handleInput);
        }
      };
    }
  }, []);

  // NotionLikeEditorのHTMLが変更されたときの処理
  const handleHtmlChange = (html: string) => {
    setHtmlContent(html);
    
    // マークダウンエディタでの編集時はcontent側も同期して更新
    if (activeTab === "write") {
      const markdown = convertHtmlToMarkdown(html);
      if (markdown !== content) {
        setContent(markdown);
      }
    }
  };

  // HTMLコードエディタでHTMLを直接編集
  const handleHtmlCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlContent(newHtml);
    
    // HTMLの変更に合わせてマークダウンも更新
    const markdown = convertHtmlToMarkdown(newHtml);
    if (markdown !== content) {
      setContent(markdown);
    }
  };

  // リッチテキストエディタ - コマンド実行
  const executeCommand = (command: string, value?: string) => {
    if (!contentEditableRef.current) return;
    
    // フォーカスを確保
    contentEditableRef.current.focus();
    
    // コマンド実行
    document.execCommand(command, false, value);
    
    // 内容を更新
    updateRichTextContent();
  };
  
  // リッチテキストの内容を更新
  const updateRichTextContent = () => {
    if (!contentEditableRef.current) return;
    
    // 現在のHTMLを取得
    const newHtml = contentEditableRef.current.innerHTML;
    
    // 更新の間引き
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    // タイマーを短くして即時性を向上
    updateTimerRef.current = setTimeout(() => {
      // 親コンポーネントのhtmlContentを更新
      setHtmlContent(newHtml);
      
      // HTMLをマークダウンに変換して親コンポーネントのcontentも更新
      // これによりリッチテキストでの編集がマークダウンにも反映される
      const markdown = convertHtmlToMarkdown(newHtml);
      
      // 内容が変わった場合のみ更新（無限ループ防止）
      if (markdown !== content) {
        setContent(markdown);
      }
      
      // 表要素が存在するかチェックし、存在すれば強調表示
      if (contentEditableRef.current) {
        const tables = contentEditableRef.current.querySelectorAll('table');
        if (tables.length > 0) {
          console.log('📊 表を検出・強調:', tables.length);
          // 表のスタイルを設定（クリック可能に見せる）
          tables.forEach(table => {
            table.style.border = '2px solid #3b82f6';
            table.style.borderCollapse = 'collapse';
            table.style.cursor = 'pointer';
            
            // セルのスタイルも設定
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
              cell.style.border = '1px solid #cbd5e1';
              cell.style.padding = '8px';
            });
          });
        }
      }
    }, 50);
  };

  // テーブル挿入
  const insertTable = () => {
    console.log('表の挿入を開始');
    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>見出し1</th>
            <th>見出し2</th>
            <th>見出し3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>データ1</td>
            <td>データ2</td>
            <td>データ3</td>
          </tr>
          <tr>
            <td>データ4</td>
            <td>データ5</td>
            <td>データ6</td>
          </tr>
        </tbody>
      </table>
    `;
    
    executeCommand('insertHTML', tableHtml);
    
    // 表の挿入後、クリック可能な状態にするためのディレイ
    setTimeout(() => {
      console.log('表の挿入後の状態確認');
      if (contentEditableRef.current) {
        const tables = contentEditableRef.current.querySelectorAll('table');
        console.log('エディタ内の表数:', tables.length);
        
        // 表が挿入されたら、表にクリックイベントを直接追加
        tables.forEach((table, index) => {
          console.log(`表${index+1}にクリックイベントを追加`);
          // スタイルを設定
          table.style.border = '2px solid #3b82f6';
          table.style.borderCollapse = 'collapse';
          table.style.cursor = 'pointer';
          
          // 表ホバー時にオーバーレイを表示するイベントリスナー
          let tableToolbarElem: HTMLDivElement | null = null;
          
          table.onmouseenter = () => {
            // すでにツールバーがあれば除去
            if (tableToolbarElem) {
              tableToolbarElem.remove();
            }
            
            // 新しいツールバーを作成
            tableToolbarElem = document.createElement('div');
            tableToolbarElem.className = 'table-toolbar';
            tableToolbarElem.style.position = 'absolute';
            tableToolbarElem.style.top = '-30px';
            tableToolbarElem.style.left = '50%';
            tableToolbarElem.style.transform = 'translateX(-50%)';
            tableToolbarElem.style.backgroundColor = '#3b82f6';
            tableToolbarElem.style.color = 'white';
            tableToolbarElem.style.padding = '5px 10px';
            tableToolbarElem.style.borderRadius = '4px';
            tableToolbarElem.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            tableToolbarElem.style.zIndex = '1000';
            tableToolbarElem.style.cursor = 'pointer';
            tableToolbarElem.innerHTML = '<span style="display:flex;align-items:center;gap:5px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>表を編集</span>';
            
            // 表の相対位置を考慮してツールバーを配置
            table.style.position = 'relative';
            table.appendChild(tableToolbarElem);
            
            // ツールバークリック時の処理 - ポップオーバーのみ表示
            tableToolbarElem.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('表ツールバーがクリックされました');
              
              // 表選択状態を更新
              setTableSelection({ 
                table: table, 
                row: 0, // デフォルト位置
                col: 0  // デフォルト位置
              });
              // ポップオーバーを表示
              setShowTablePopover(true)
            };
          };
          
          table.onmouseleave = () => {
            // マウスが表から離れたときにツールバーを削除
            setTimeout(() => {
              if (tableToolbarElem && table.contains(tableToolbarElem)) {
                tableToolbarElem.remove();
              }
            }, 200);
          };
          
          // セルクリック時のイベント - 実際の表編集機能
          const cells = table.querySelectorAll('td, th');
          cells.forEach(cell => {
            cell.style.border = '1px solid #cbd5e1';
            cell.style.padding = '8px';
            
            cell.onclick = (e) => {
              e.stopPropagation();
              const cellEl = e.currentTarget as HTMLTableCellElement;
              const rowEl = cellEl.parentElement as HTMLTableRowElement;
              
              console.log('セルがクリックされました:', {
                row: rowEl.rowIndex,
                col: cellEl.cellIndex
              });
              
              // 表選択状態を更新（セル位置を含む）
              setTableSelection({
                table: table,
                row: rowEl.rowIndex,
                col: cellEl.cellIndex
              });
              // ポップオーバーを表示
              setShowTablePopover(true);
            };
          });
        });
      }
    }, 100);
  };

  // 画像アップロード処理
  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('ファイルの読み込みに失敗しました'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // リッチテキストモードでの画像アップロード
  const handleRichTextImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        try {
          const file = target.files[0];
          const dataUrl = await handleImageUpload(file);
          executeCommand('insertImage', dataUrl);
        } catch (error) {
          console.error('画像のアップロードに失敗しました', error);
          window.alert('画像のアップロードに失敗しました');
        }
      }
    };
    input.click();
  };

  // リッチテキストモードでの表選択機能
  useEffect(() => {
    // リッチテキストモードがアクティブな場合のみ
    if (activeTab === "richtext" && contentEditableRef.current) {
      // テーブル関連のクリックを処理するハンドラー
      const handleTableClick = (e: MouseEvent) => {
        // 表ツールバーのクリックは既に他の場所で処理されるのでここでは無視
        if ((e.target as HTMLElement).closest('.table-toolbar')) {
          return;
        }
        
        // クリック位置の要素を取得
        let target = e.target as HTMLElement;
        
        // クリックした要素が表の外部ならテーブル選択をクリア
        const isOutsideTable = !target.closest('table');
        if (isOutsideTable) {
          setTableSelection(null);
          setShowTablePopover(false);
          return;
        }
        
        // イベント伝播を止める (テーブル内のクリックの場合)
        e.stopPropagation();
        
        // クリックした要素またはその親がセル(td/th)かを判定
        let cell: HTMLTableCellElement | null = null;
        if (target.tagName === 'TD' || target.tagName === 'TH') {
          cell = target as HTMLTableCellElement;
        } else {
          cell = target.closest('td, th') as HTMLTableCellElement;
        }
        
        // セルが見つからない場合は何もしない
        if (!cell) {
          return;
        }
        
        // セルが見つかった場合、より効率的に処理する
        const tableElement = cell.closest('table') as HTMLTableElement;
        if (!tableElement) return;
        
        // 行と列のインデックスを取得
        const rowElement = cell.parentElement as HTMLTableRowElement;
        if (!rowElement) return;
        
        const row = rowElement.rowIndex;
        const col = cell.cellIndex;
        
        console.log('テーブルセルが選択されました:', { row, col });
        
        // 表の選択状態を更新
        setTableSelection({ table: tableElement, row, col });
        
        // ポップオーバーを表示（既に表示されている場合は状態を維持）
        if (!showTablePopover) {
          setShowTablePopover(true);
        }
      };
      
      // clickイベントを使用 (マウスボタンが離された時に発火するため、より安定)
      contentEditableRef.current.addEventListener('click', handleTableClick);
      
      // ドキュメント全体のクリックイベント（表メニューを閉じるため）
      const handleDocumentClick = (e: MouseEvent) => {
        // 既にポップオーバーが非表示の場合は何もしない
        if (!showTablePopover) return;
        
        // ポップオーバー内のクリックは無視
        const popoverContent = document.querySelector('[data-radix-popper-content-wrapper]');
        if (popoverContent && popoverContent.contains(e.target as Node)) {
          return;
        }
        
        // エディタ内の正規のクリックは上記のハンドラで処理されるので、
        // ここではエディタ外のクリックのみを考慮する
        if (
          contentEditableRef.current && 
          !contentEditableRef.current.contains(e.target as Node)
        ) {
          setShowTablePopover(false);
        }
      };
      
      // キャプチャフェーズでイベントを処理（より優先度が高い）
      document.addEventListener('click', handleDocumentClick, { capture: true });
      
      // クリーンアップ関数
      return () => {
        if (contentEditableRef.current) {
          contentEditableRef.current.removeEventListener('click', handleTableClick);
        }
        document.removeEventListener('click', handleDocumentClick, { capture: true });
        
        if (updateTimerRef.current) {
          clearTimeout(updateTimerRef.current);
        }
      };
    }
  }, [activeTab, showTablePopover]);

  // エディタの高さを計算
  const getEditorHeight = () => {
    const lineCount = content.split('\n').length;
    if (lineCount < 5) return 'min-h-[350px]';
    if (lineCount < 10) return 'min-h-[450px]';
    return 'min-h-[550px]';
  };

  // リッチテキストモードのドラッグ&ドロップ処理
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    try {
      const dataUrl = await handleImageUpload(files[0]);
      executeCommand('insertImage', dataUrl);
    } catch (error) {
      console.error('画像のアップロードに失敗しました', error);
      window.alert('画像のアップロードに失敗しました');
    }
  };

  // 表の行を追加
  const addTableRow = (position: 'before' | 'after') => {
    if (!tableSelection) return;
    
    try {
      const { table, row } = tableSelection;
      
      // ヘッダー行かどうかを確認
      const isHeaderRow = row === 0;
      
      // ヘッダー行の上に行を追加しようとしている場合は何もしない
      if (position === 'before' && isHeaderRow) {
        return;
      }
      
      // 新しい行を作成する位置を決定
      const insertIndex = position === 'after' ? row + 1 : row;
      
      // 表に新しい行を追加
      const newRow = table.insertRow(insertIndex);
      
      // 列数を取得して各セルを追加
      const cellCount = table.rows[row].cells.length;
      for (let i = 0; i < cellCount; i++) {
        const newCell = newRow.insertCell(i);
        newCell.innerHTML = '&nbsp;';
      }
      
      // 内容が変更されたので更新を通知
      updateRichTextContent();
      
      // 選択状態を更新
      const newRowIndex = position === 'after' ? row + 1 : row;
      setTableSelection({
        table,
        row: newRowIndex,
        col: tableSelection.col
      });
    } catch (error) {
      console.error('行の追加に失敗しました:', error);
    }
  };

  // 表の列を追加
  const addTableColumn = (position: 'before' | 'after') => {
    if (!tableSelection) return;
    
    try {
      const { table, col } = tableSelection;
      
      // 各行に新しいセルを挿入
      for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        const isHeader = i === 0; // 最初の行はヘッダー行
        
        // 新しいセルを作成
        const newCell = isHeader 
          ? document.createElement('th') 
          : document.createElement('td');
        
        newCell.innerHTML = '&nbsp;';
        
        // 適切な位置に挿入
        const insertAt = position === 'after' ? col + 1 : col;
        if (insertAt < row.cells.length) {
          row.insertBefore(newCell, row.cells[insertAt]);
        } else {
          row.appendChild(newCell);
        }
      }
      
      // 内容が変更されたので更新を通知
      updateRichTextContent();
      
      // 選択状態を更新
      const newColIndex = position === 'after' ? col + 1 : col;
      setTableSelection({
        table,
        row: tableSelection.row,
        col: newColIndex
      });
    } catch (error) {
      console.error('列の追加に失敗しました:', error);
    }
  };

  // 表の行を削除
  const deleteTableRow = () => {
    if (!tableSelection) return;
    
    try {
      const { table, row } = tableSelection;
      
      // ヘッダー行は削除できない
      if (row === 0) {
        return;
      }
      
      // 表に最低2行は必要（ヘッダー+データ行）
      if (table.rows.length <= 2) {
        return;
      }
      
      // 行を削除
      table.deleteRow(row);
      
      // 内容が変更されたので更新を通知
      updateRichTextContent();
      
      // 選択状態をリセット
      setTableSelection(null);
      setShowTableModal(false);
      setShowTablePopover(false);
    } catch (error) {
      console.error('行の削除に失敗しました:', error);
    }
  };

  // 表の列を削除
  const deleteTableColumn = () => {
    if (!tableSelection) return;
    
    try {
      const { table, col } = tableSelection;
      
      // 表に最低2列は必要
      if (table.rows[0].cells.length <= 2) {
        return;
      }
      
      // 各行から列を削除
      for (let i = 0; i < table.rows.length; i++) {
        table.rows[i].deleteCell(col);
      }
      
      // 内容が変更されたので更新を通知
      updateRichTextContent();
      
      // 選択状態をリセット
      setTableSelection(null);
      setShowTableModal(false);
      setShowTablePopover(false);
    } catch (error) {
      console.error('列の削除に失敗しました:', error);
    }
  };

  useEffect(() => {
    // リッチテキストの変更を監視して表のツールバーを設定
    if (activeTab === "richtext" && contentEditableRef.current) {
      let animationFrameId: number | null = null;
      
      const observer = new MutationObserver((mutations) => {
        // 複数の変更を一つのアニメーションフレームにまとめて処理
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
          // DOM変更がテーブルに関連するか確認
          const tableAffected = mutations.some(mutation => {
            return mutation.target.nodeName === 'TABLE' || 
                   mutation.target.closest('table') || 
                   Array.from(mutation.addedNodes).some(node => 
                     (node as HTMLElement).nodeName === 'TABLE' || 
                     (node as HTMLElement).querySelector?.('table')
                   );
          });
          
          // テーブル関連の変更がない場合はスキップ
          if (!tableAffected && mutations.length < 5) return;
          
          // 表のスタイルとイベントリスナーを再設定
          if (contentEditableRef.current) {
            const tables = contentEditableRef.current.querySelectorAll('table');
            console.log('MutationObserver: テーブル更新', tables.length);
            
            if (tables.length > 0) {
              tables.forEach(table => {
                // テーブルスタイル
                table.style.border = '2px solid #3b82f6';
                table.style.borderCollapse = 'collapse';
                table.style.cursor = 'pointer';
                table.style.position = 'relative';
                
                // セルのスタイル
                const cells = table.querySelectorAll('td, th');
                cells.forEach(cell => {
                  cell.style.border = '1px solid #cbd5e1';
                  cell.style.padding = '8px';
                });
              });
            }
          }
        });
      });
      
      observer.observe(contentEditableRef.current, { 
        childList: true, 
        subtree: true,
        characterData: true,
        attributes: true
      });
      
      // クリーンアップ
      return () => {
        observer.disconnect();
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [activeTab]);

  return (
    <>
      {/* 表編集用のモーダルダイアログ */}
      {tableSelection && showTableModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowTableModal(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl border p-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium">表の編集</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full"
                onClick={() => setShowTableModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  addTableRow('before');
                  // メニューは閉じない
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                上に行を追加
              </Button>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  addTableRow('after');
                  // メニューは閉じない
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                下に行を追加
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  addTableColumn('before');
                  // メニューは閉じない
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                左に列を追加
              </Button>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  addTableColumn('after');
                  // メニューは閉じない
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                右に列を追加
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button"
                variant="destructive" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  deleteTableRow();
                  // 操作後もメニューは閉じない
                }}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                行を削除
              </Button>
              <Button 
                type="button"
                variant="destructive" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  deleteTableColumn();
                  // 操作後もメニューは閉じない
                }}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                列を削除
              </Button>
            </div>
            
            <div className="mt-3 pt-2 border-t">
              <Button 
                type="button"
                variant="default" 
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowTableModal(false)}
              >
                完了
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "write" | "richtext" | "html" | "preview")}
        className="w-full"
      >
      <TabsList className="mb-2 w-full grid grid-cols-4">
        <TabsTrigger value="write">マークダウン</TabsTrigger>
        <TabsTrigger value="richtext">リッチテキスト</TabsTrigger>
        <TabsTrigger value="html">HTMLコード</TabsTrigger>
        <TabsTrigger value="preview">プレビュー</TabsTrigger>
      </TabsList>

      {/* マークダウン編集モード */}
      <TabsContent value="write" className="mt-0">
        <NotionLikeEditor
          value={htmlContent}
          onChange={handleHtmlChange}
          placeholder="/を入力して書式を選択するか、マークダウン記法が使えます。例：# 見出し 1, - リスト項目, 1. 番号付きリスト, > 引用"
          onImageUpload={handleImageUpload}
        />
      </TabsContent>

      {/* HTMLリッチテキストモード */}
      <TabsContent value="richtext" className="mt-0">
        <div 
          className={`border rounded-md relative ${isDragging ? 'ring-2 ring-primary bg-primary/5' : ''}`}
          ref={richTextEditorRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-muted/40 p-1 border-b flex flex-wrap gap-1">
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('underline')}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('formatBlock', '<h1>')}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('formatBlock', '<h2>')}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('formatBlock', '<h3>')}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('formatBlock', '<p>')}
            >
              <span className="h-4 w-4 flex items-center justify-center font-bold">P</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('insertUnorderedList')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('insertOrderedList')}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-auto px-2" 
              onClick={() => {
                const url = prompt('リンクURLを入力してください:');
                if (url) {
                  executeCommand('createLink', url);
                }
              }}
            >
              <Link className="h-4 w-4 mr-1" />
              リンク
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-8 w-auto px-2" 
              onClick={insertTable}
            >
              <Table className="h-4 w-4 mr-1" />
              表
            </Button>
            <div className="flex gap-1">
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                className="h-8 w-auto px-2" 
                onClick={() => {
                  const url = prompt('画像URLを入力してください:');
                  if (url) {
                    executeCommand('insertImage', url);
                  }
                }}
              >
                <Image className="h-4 w-4 mr-1" />
                画像URL
              </Button>
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                className="h-8 w-auto px-2" 
                onClick={handleRichTextImageUpload}
              >
                <Upload className="h-4 w-4 mr-1" />
                アップロード
              </Button>
            </div>
          </div>
          <div
            ref={contentEditableRef}
            contentEditable
            className="prose prose-sm dark:prose-invert min-h-[350px] max-w-none p-4 focus:outline-none rich-text-editor"
            suppressContentEditableWarning={true}
          />
          
          {/* 表が選択されているときに表示する表編集ボタン - 表の位置に合わせて表示 */}
          {tableSelection && (
            <div 
              className="fixed z-50" // z-indexを上げて確実に表示されるようにする
              style={{
                // 選択されたセルの位置を基に表示位置を計算
                top: (() => {
                  try {
                    // 表自体の位置を取得
                    if (tableSelection.table) {
                      const tableRect = tableSelection.table.getBoundingClientRect();
                      // 位置をわかりやすく表の上部に固定
                      return tableRect.top - 40; // 表の上に表示
                    }
                    return window.innerHeight / 2; // 画面中央に表示
                  } catch (error) {
                    console.error("表の位置取得に失敗:", error);
                    return 100; // より安全なfallback値
                  }
                })(),
                left: (() => {
                  try {
                    // 表の位置を取得
                    if (tableSelection.table) {
                      const tableRect = tableSelection.table.getBoundingClientRect();
                      // 表の中央に配置
                      return tableRect.left + tableRect.width / 2 - 20;
                    }
                    return window.innerWidth / 2; // 画面中央に表示
                  } catch (error) {
                    console.error("表の位置取得に失敗:", error);
                    return window.innerWidth / 2; // 画面中央に表示
                  }
                })(),
              }}
            >
              <Popover open={showTablePopover} onOpenChange={setShowTablePopover}>
                <PopoverTrigger asChild>
                  <Button 
                    type="button"
                    variant="default" 
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full bg-primary text-white hover:bg-primary-600 shadow-lg border-2 border-white animate-pulse"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start" side="right" sideOffset={5}>
                  <div className="bg-background flex flex-col gap-2">
                    <div className="text-xs font-medium text-muted-foreground mb-1">表の編集</div>
                    <Button 
                      type="button"
                      variant="default" 
                      size="sm"
                      className="w-full mb-2 text-xs"
                      onClick={() => setShowTableModal(true)}
                    >
                      詳細な表編集を開く
                    </Button>
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
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 pointer-events-none">
              <p className="text-primary font-medium">画像をドロップして挿入</p>
            </div>
          )}
        </div>
      </TabsContent>

      {/* HTMLコード編集モード */}
      <TabsContent value="html" className="mt-0">
        <Textarea
          value={htmlContent}
          onChange={handleHtmlCodeChange}
          className={`${getEditorHeight()} w-full font-mono text-sm`}
          placeholder="HTMLコードを直接編集できます"
        />
      </TabsContent>

      {/* プレビューモード */}
      <TabsContent value="preview" className={`mt-0 w-full ${getEditorHeight()} overflow-auto border rounded-md p-4`}>
        {htmlContent ? (
          <div 
            className="prose prose-sm dark:prose-invert w-full max-w-none markdown-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <p className="text-muted-foreground">プレビューする内容がありません</p>
        )}
      </TabsContent>

      <style>
        {`
        .rich-text-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        .rich-text-editor th,
        .rich-text-editor td {
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          min-width: 2rem;
          position: relative;
        }
        .rich-text-editor th {
          background-color: rgba(0, 0, 0, 0.05);
          font-weight: bold;
        }
        .dark .rich-text-editor th {
          background-color: rgba(255, 255, 255, 0.1);
          border-color: #2d3748;
        }
        .dark .rich-text-editor td {
          border-color: #2d3748;
        }
        `}
      </style>
    </Tabs>
    </>
  );
};

export default PostFormEditor;
