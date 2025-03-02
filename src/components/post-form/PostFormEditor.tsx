
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotionLikeEditor from "@/components/NotionLikeEditor";
import { convertHtmlToMarkdown } from "@/lib/markdownUtils";

interface PostFormEditorProps {
  htmlContent: string;
  setHtmlContent: (html: string) => void;
  content: string;
  setContent: (content: string) => void;
}

const PostFormEditor = ({
  htmlContent,
  setHtmlContent,
  content,
  setContent,
}: PostFormEditorProps) => {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  // HTMLが変更されたときにマークダウンも更新
  const handleHtmlChange = (html: string) => {
    setHtmlContent(html);
    // 表示されているタブがプレビューの場合のみマークダウンを更新
    if (activeTab === "preview") {
      setContent(convertHtmlToMarkdown(html));
    }
  };

  // 書き込みエリアの高さを取得するための関数
  const getEditorHeight = () => {
    if (content.split('\n').length < 5) {
      return 'min-h-[150px]';
    } else if (content.split('\n').length < 10) {
      return 'min-h-[200px]';
    } else {
      return 'min-h-[300px]';
    }
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => setActiveTab(value as "write" | "preview")}
      className="w-full"
    >
      <TabsList className="mb-2 w-full grid grid-cols-2">
        <TabsTrigger value="write">書く</TabsTrigger>
        <TabsTrigger value="preview">プレビュー</TabsTrigger>
      </TabsList>
      <TabsContent value="write" className="mt-0">
        <NotionLikeEditor
          value={htmlContent}
          onChange={handleHtmlChange}
          placeholder="/'を入力して書式を選択するか、マークダウン記法が使えます。例：# 見出し 1, - リスト項目, 1. 番号付きリスト, > 引用"
        />
      </TabsContent>
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
    </Tabs>
  );
};

export default PostFormEditor;
