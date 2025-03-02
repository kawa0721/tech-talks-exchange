
import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { convertHtmlToMarkdown } from "@/lib/markdownUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PostFormHeader from "./post-form/PostFormHeader";
import PostFormEditor from "./post-form/PostFormEditor";
import PostFormImageUpload from "./post-form/PostFormImageUpload";
import PostFormFooter from "./post-form/PostFormFooter";

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
  
  // 認証情報の取得
  const { user } = useAuth();

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

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-3 pt-4">
          <PostFormHeader 
            title={title}
            setTitle={setTitle}
            userAvatarUrl={user?.user_metadata?.avatar_url}
            userName={user?.user_metadata?.name}
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
          <PostFormFooter 
            isSubmitting={isSubmitting} 
            handleImageUpload={handleImageUpload} 
          />
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostForm;
