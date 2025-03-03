
import { useState, useEffect } from "react";
import { Comment } from "@/types";
import { toast } from "sonner";
import { submitComment } from "./utils/commentActions";
import { mapCommentWithUserInfo } from "./utils/commentMappers";
import { supabase } from "@/integrations/supabase/client";
import { getCommentsForPost } from "@/lib/data/comments";
import { useAuth } from "@/contexts/AuthContext";

export function useCommentsSubmit(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();  // 認証情報を取得

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const commentsData = await getCommentsForPost(postId);
        setComments(commentsData);
      } catch (error) {
        console.error("コメント取得エラー:", error);
        toast.error("コメントの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (newComment: string, nickname?: string) => {
    setSubmitting(true);
    
    try {
      let userId = null;
      
      // ログインしている場合は認証情報からユーザーIDを設定
      if (user) {
        userId = user.id;
      }
      
      // コメントをデータベースに追加
      const data = await submitComment(postId, newComment, userId, nickname);
      
      // 新しいコメントをマッピング
      const currentUserId = userId;
      const newCommentObj = await mapCommentWithUserInfo(data, postId, currentUserId);
      
      setComments([newCommentObj, ...comments]);
      toast.success("コメントが投稿されました");
    } catch (error) {
      console.error("コメント投稿エラー:", error);
      toast.error("コメントの投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    comments,
    setComments,
    loading,
    submitting,
    handleSubmitComment
  };
}
