
import { Comment } from "@/types";
import { toast } from "sonner";
import { deleteCommentById } from "./utils/commentActions";
import { supabase } from "@/integrations/supabase/client";

export function useCommentDelete(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
) {
  const deleteComment = async (commentId: string, isReply = false, parentId?: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast.error("コメントを削除するにはログインが必要です");
      return;
    }

    try {
      await deleteCommentById(commentId, user.data.user.id);

      if (isReply && parentId) {
        // 返信を削除
        const updatedComments = comments.map(comment => {
          if (comment.id === parentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply.id !== commentId)
            };
          }
          return comment;
        });
        setComments(updatedComments);
      } else {
        // 親コメントを削除
        setComments(comments.filter(comment => comment.id !== commentId));
      }
      
      toast.success("コメントが削除されました");
    } catch (error) {
      console.error("コメント削除エラー:", error);
      toast.error("コメントの削除に失敗しました");
    }
  };

  return { deleteComment };
}
