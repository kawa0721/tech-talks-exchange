
import { useState, ChangeEvent, useEffect } from "react";
import { Upload, X, Code, MousePointer } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "./RichTextEditor";
import { convertHtmlToMarkdown, convertMarkdownToHtml } from "@/lib/markdownUtils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface CreatePostFormProps {
  channelId: string | null;
  onPostCreated: () => void;
}

type EditorMode = "markdown" | "richtext";
type PreviewTab = "write" | "preview";

const CreatePostForm = ({ channelId, onPostCreated }: CreatePostFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<PreviewTab>("write");
  const [editorMode, setEditorMode] = useState<EditorMode>("markdown");

  // マークダウンとHTMLコンテンツの同期
  useEffect(() => {
    if (editorMode === "markdown") {
      // マークダウンからHTMLに変換
      setHtmlContent(convertMarkdownToHtml(content));
    }
  }, [content, editorMode]);

  // エディタモード切替時のコンテンツ変換
  const handleEditorModeChange = (mode: EditorMode) => {
    if (mode === editorMode) return;

    if (mode === "markdown") {
      // リッチテキストからマークダウンに変換
      setContent(convertHtmlToMarkdown(htmlContent));
    } else {
      // マークダウンからリッチテキストに変換
      setHtmlContent(convertMarkdownToHtml(content));
    }

    setEditorMode(mode);
    setActiveTab("write"); // モード切替時は編集タブに戻す
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = [...images];
      for (let i = 0; i < e.target.files.length; i++) {
        if (newImages.length < 3) {
          const file = e.target.files[i];
          newImages.push(URL.createObjectURL(file));
        }
      }
      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    const contentToCheck = editorMode === "markdown" ? content : htmlContent;
    if (!contentToCheck.trim()) {
      toast.error("内容を入力してください");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("投稿が作成されました！");
      setTitle("");
      setContent("");
      setHtmlContent("");
      setImages([]);
      setIsSubmitting(false);
      onPostCreated();
    }, 1000);
  };

  // 書き込みエリアの高さを取得するためのref
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
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Input
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium"
            />
          </div>
          <div className="flex justify-end mt-2">
            <ToggleGroup type="single" value={editorMode} onValueChange={(value) => handleEditorModeChange(value as EditorMode)}>
              <ToggleGroupItem value="markdown" aria-label="マークダウンモード">
                <Code className="h-4 w-4 mr-2" />
                マークダウン
              </ToggleGroupItem>
              <ToggleGroupItem value="richtext" aria-label="リッチテキストモード">
                <MousePointer className="h-4 w-4 mr-2" />
                リッチテキスト
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          {editorMode === "markdown" ? (
            // マークダウンエディタモード
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as PreviewTab)}
              className="w-full"
            >
              <TabsList className="mb-2 w-full grid grid-cols-2">
                <TabsTrigger value="write">書く</TabsTrigger>
                <TabsTrigger value="preview">プレビュー</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="mt-0">
                <Textarea
                  placeholder="マークダウン形式で書くことができます..."
                  className={`resize-y font-mono w-full ${getEditorHeight()}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="preview" className={`mt-0 w-full ${getEditorHeight()} overflow-auto border rounded-md p-4`}>
                {content ? (
                  <div className="prose prose-sm dark:prose-invert w-full max-w-none markdown-content">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground">プレビューする内容がありません</p>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            // リッチテキストエディタモード
            <RichTextEditor 
              value={htmlContent} 
              onChange={setHtmlContent} 
              placeholder="リッチテキストで書くことができます..."
            />
          )}
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {images.map((src, index) => (
                <div key={index} className="relative rounded-md overflow-hidden">
                  <img src={src} alt="アップロードプレビュー" className="h-24 w-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-3">
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex gap-1"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <Upload className="h-4 w-4" />
              <span>アップロード</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </Button>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "投稿"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostForm;
