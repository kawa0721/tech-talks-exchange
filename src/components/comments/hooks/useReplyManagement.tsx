
import { useState } from "react";
import { Comment } from "@/types";
import { toast } from "sonner";
import { submitReply } from "./utils/commentActions";
import { mapReplyWithUserInfo } from "./utils/commentMappers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useReplyManagement(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  postId: string
) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();  // 認証情報を取得

  const handleSubmitReply = async (parentId: string, content?: string, nickname?: string) => {
    // コンテンツが直接渡されない場合はステートから取得
    const replyText = content || replyContent;
    
    if (!replyText.trim()) {
      toast.error("返信を入力してください");
      return;
    }

    setSubmitting(true);
    
    try {
      let userId = null;
      
      // ログインしている場合はユーザーIDを設定
      if (user) {
        userId = user.id;
      }
      
      // 返信をデータベースに追加
      const data = await submitReply(postId, parentId, replyText, userId, nickname);
      
      const currentUserId = userId;
      const newReply = await mapReplyWithUserInfo(data, postId, parentId, currentUserId);
      
      // コメントリストを更新
      const updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          const updatedReplies = comment.replies ? [...comment.replies, newReply] : [newReply];
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });
      
      setComments(updatedComments);
      setReplyTo(null);
      setReplyContent("");
      toast.success("返信が投稿されました");
    } catch (error) {
      console.error("返信投稿エラー:", error);
      toast.error("返信の投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    replyTo,
    replyContent,
    submitting,
    setReplyTo,
    setReplyContent,
    handleSubmitReply
  };
}
