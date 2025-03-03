
import { Comment } from "@/types";
import { toast } from "sonner";
import { deleteCommentById } from "./utils/commentActions";
import { supabase } from "@/integrations/supabase/client";

export function useCommentDelete(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
) {
  const deleteComment = async (commentId: string, isReply = false, parentId?: string) => {
    // セッションを確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("コメントを削除するにはログインが必要です");
      return;
    }

    try {
      const userId = session.user.id;
      const postId = getPostIdFromComment(commentId, isReply, parentId, comments);
      
      if (!postId) {
        console.error("投稿IDが特定できませんでした");
        toast.error("コメントの削除に失敗しました");
        return;
      }
      
      // コメントを削除
      await deleteCommentById(commentId, userId, postId);

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
  
  // コメントIDから投稿IDを取得するヘルパー関数
  const getPostIdFromComment = (
    commentId: string, 
    isReply: boolean, 
    parentId: string | undefined,
    commentsList: Comment[]
  ): string | null => {
    if (isReply && parentId) {
      // 親コメントから投稿IDを取得
      const parentComment = commentsList.find(c => c.id === parentId);
      if (parentComment) {
        return parentComment.postId;
      }
    } else {
      // 親コメントから直接投稿IDを取得
      const comment = commentsList.find(c => c.id === commentId);
      if (comment) {
        return comment.postId;
      }
    }
    return null;
  };

  return { deleteComment };
}
