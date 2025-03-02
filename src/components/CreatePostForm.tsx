
import { useState, ChangeEvent, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotionLikeEditor from "./NotionLikeEditor";
import { convertHtmlToMarkdown } from "@/lib/markdownUtils";
import { USERS } from "@/lib/data"; // Import USERS from data
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreatePostFormProps {
  channelId: string | null;
  onPostCreated: () => void;
}

const CreatePostForm = ({ channelId, onPostCreated }: CreatePostFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  
  // 認証情報の取得
  const { user } = useAuth();

  // HTMLが変更されたときにマークダウンも更新
  const handleHtmlChange = (html: string) => {
    setHtmlContent(html);
    // 表示されているタブがプレビューの場合のみマークダウンを更新
    if (activeTab === "preview") {
      setContent(convertHtmlToMarkdown(html));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    if (!htmlContent.trim()) {
      toast.error("内容を入力してください");
      return;
    }

    if (!user) {
      toast.error("投稿するにはログインが必要です");
      return;
    }

    setIsSubmitting(true);

    // HTMLからマークダウンに変換
    const markdownForSaving = convertHtmlToMarkdown(htmlContent);

    try {
      // Supabaseに投稿を保存
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title: title,
            content: markdownForSaving,
            user_id: user.id,
            channel_id: channelId || 'general',
            images: images.length > 0 ? images : null
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast.success("投稿が作成されました！");
      setTitle("");
      setContent("");
      setHtmlContent("");
      setImages([]);
      onPostCreated();
    } catch (error) {
      console.error("投稿作成エラー:", error);
      toast.error("投稿の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
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
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.user_metadata?.avatar_url || "https://i.pravatar.cc/150?img=1"} alt={user?.user_metadata?.name || "@user"} />
              <AvatarFallback>{user?.user_metadata?.name?.substring(0, 2) || "U"}</AvatarFallback>
            </Avatar>
            <Input
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium"
            />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
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
