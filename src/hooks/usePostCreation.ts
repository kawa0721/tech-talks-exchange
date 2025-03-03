
import { useState, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { convertHtmlToMarkdown } from "@/lib/markdownUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UsePostCreationProps {
  channelId: string | null;
  onPostCreated: () => void;
}

export const usePostCreation = ({ channelId: initialChannelId, onPostCreated }: UsePostCreationProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestNickname, setGuestNickname] = useState("");
  const [channelId, setChannelId] = useState(initialChannelId || "general");
  
  // 認証情報の取得
  const { user } = useAuth();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImageFiles = [...imageFiles];
      const newImageUrls = [...images];
      
      for (let i = 0; i < e.target.files.length; i++) {
        if (newImageFiles.length < 3) {
          const file = e.target.files[i];
          // ブラウザ側でのプレビュー用にURLを作成
          newImageUrls.push(URL.createObjectURL(file));
          // 実際のアップロード用にファイルを保存
          newImageFiles.push(file);
        }
      }
      
      setImages(newImageUrls);
      setImageFiles(newImageFiles);
    }
  };

  const removeImage = (index: number) => {
    // プレビュー用URLと実際のファイルの両方を削除
    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    
    newImages.splice(index, 1);
    newImageFiles.splice(index, 1);
    
    setImages(newImages);
    setImageFiles(newImageFiles);
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

    setIsSubmitting(true);

    try {
      // HTMLからマークダウンに変換
      const markdownForSaving = convertHtmlToMarkdown(htmlContent);
      
      // 画像のURLを格納する配列
      let uploadedImageUrls: string[] = [];
      
      // 画像があればアップロード
      if (imageFiles.length > 0 && user) {
        const imageUploadPromises = imageFiles.map(async (file) => {
          // 一意のファイル名を生成
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
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
      
      // セッションを再確認 (念のため)
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("セッションが期限切れです。再ログインしてください。");
          return;
        }
      }
      
      // Supabaseに投稿を保存
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title: title,
            content: markdownForSaving,
            user_id: user ? user.id : null,
            channel_id: channelId,
            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : 
                   images.length > 0 ? images : null,
            guest_nickname: !user && guestNickname ? guestNickname : null
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
      setImageFiles([]);
      setGuestNickname("");
      onPostCreated();
    } catch (error) {
      console.error("投稿作成エラー:", error);
      toast.error("投稿の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    htmlContent,
    setHtmlContent,
    images,
    imageFiles,
    isSubmitting,
    guestNickname,
    setGuestNickname,
    channelId,
    setChannelId,
    user,
    handleImageUpload,
    removeImage,
    handleSubmit
  };
};
