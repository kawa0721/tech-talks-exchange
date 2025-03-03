
import { useState } from "react";
import { Comment } from "@/types";
import { toast } from "sonner";
import { submitReply } from "./utils/commentActions";
import { mapReplyWithUserInfo } from "./utils/commentMappers";
import { supabase } from "@/integrations/supabase/client";

export function useReplyManagement(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  postId: string
) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      toast.error("返信を入力してください");
      return;
    }

    setSubmitting(true);
    
    try {
      const user = await supabase.auth.getUser();
      let userId = null;
      let nickname = null;
      
      // ログインしている場合はユーザーIDを設定
      if (user.data.user) {
        userId = user.data.user.id;
      } else {
        // ログインしていない場合は「返信」としてニックネームを設定
        nickname = "返信";
      }
      
      // 返信をデータベースに追加
      const data = await submitReply(postId, parentId, replyContent, userId, nickname);
      
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
