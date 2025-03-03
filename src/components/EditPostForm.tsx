
import { useState, ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { convertHtmlToMarkdown } from "@/lib/markdownUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/types";
import PostFormEditor from "./post-form/PostFormEditor";
import PostFormImageUpload from "./post-form/PostFormImageUpload";
import PostFormFooter from "./post-form/PostFormFooter";
import { updatePost } from "@/utils/postActions";

interface EditPostFormProps {
  post: Post;
  onPostUpdated: () => void;
}

const EditPostForm = ({ post, onPostUpdated }: EditPostFormProps) => {
  const [title, setTitle] = useState(post.title || "");
  const [content, setContent] = useState(post.content || "");
  const [htmlContent, setHtmlContent] = useState("");
  const [images, setImages] = useState<string[]>(post.images || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 認証情報の取得
  const { user } = useAuth();

  // 初期表示時にHTMLコンテンツを設定
  useEffect(() => {
    // Post content is in markdown, so we'll handle this in the editor component
    // Just initialize with the content
    setContent(post.content || "");
  }, [post]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImageFiles = [...imageFiles];
      const newImageUrls = [...images];
      
      // 最大3枚の画像をサポート
      const remainingSlots = 3 - images.length;
      if (remainingSlots <= 0) {
        toast.error("画像は最大3枚までアップロードできます");
        return;
      }
      
      for (let i = 0; i < Math.min(e.target.files.length, remainingSlots); i++) {
        const file = e.target.files[i];
        // ブラウザ側でのプレビュー用にURLを作成
        newImageUrls.push(URL.createObjectURL(file));
        // 実際のアップロード用にファイルを保存
        newImageFiles.push(file);
      }
      
      setImages(newImageUrls);
      setImageFiles(newImageFiles);
    }
  };

  const removeImage = (index: number) => {
    // Check if this is an existing image or a new one
    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    
    // If the index is within the range of new files that were just added
    // Remove from both arrays
    if (index >= (images.length - imageFiles.length)) {
      const fileIndex = index - (images.length - imageFiles.length);
      newImageFiles.splice(fileIndex, 1);
    }
    
    newImages.splice(index, 1);
    
    setImages(newImages);
    setImageFiles(newImageFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    if (!htmlContent.trim() && !content.trim()) {
      toast.error("内容を入力してください");
      return;
    }

    if (!user) {
      toast.error("投稿を編集するにはログインが必要です");
      return;
    }

    setIsSubmitting(true);

    try {
      // HTMLからマークダウンに変換
      const markdownForSaving = htmlContent ? convertHtmlToMarkdown(htmlContent) : content;
      
      // 画像のURLを格納する配列
      let uploadedImageUrls: string[] = [];
      
      // 既存の画像を保持（新しくアップロードされた画像を除く）
      const existingImages = images.slice(0, images.length - imageFiles.length);
      
      // 新しい画像があればアップロード
      if (imageFiles.length > 0) {
        const imageUploadPromises = imageFiles.map(async (file) => {
          // 一意のファイル名を生成
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `posts/${user.id}/${fileName}`;
          
          // Supabaseのストレージにアップロード
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("画像アップロードエラー:", uploadError);
            throw uploadError;
          }
          
          // 公開URLを取得
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
            
          return publicUrl;
        });
        
        // 全ての画像アップロードを待つ
        uploadedImageUrls = await Promise.all(imageUploadPromises);
      }
      
      // 既存の画像と新しい画像を結合
      const finalImages = [...existingImages, ...uploadedImageUrls];
      
      // 投稿を更新
      await updatePost(post.id, {
        title: title,
        content: markdownForSaving,
        images: finalImages.length > 0 ? finalImages : null
      });

      toast.success("投稿が更新されました！");
      onPostUpdated();
    } catch (error) {
      console.error("投稿更新エラー:", error);
      toast.error("投稿の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 border-0 shadow-none">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-3 pt-4">
          <Input
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
        </CardHeader>
        <CardContent className="pb-2">
          <PostFormEditor 
            htmlContent={htmlContent}
            setHtmlContent={setHtmlContent}
            content={content}
            setContent={setContent}
          />
          
          <PostFormImageUpload 
            images={images} 
            removeImage={removeImage} 
          />
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full items-center border-t pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex gap-1"
              onClick={() => document.getElementById("edit-image-upload")?.click()}
            >
              <input
                id="edit-image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              画像アップロード
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onPostUpdated}
              >
                キャンセル
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "更新中..." : "更新"}
              </Button>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditPostForm;
