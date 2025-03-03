
import { Comment } from "@/types";
import { toast } from "sonner";
import { toggleCommentLike } from "./utils/commentActions";
import { supabase } from "@/integrations/supabase/client";

export function useCommentLikes(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
) {
  const toggleLike = async (commentId: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast.error("いいねするにはログインが必要です");
      return;
    }

    const userId = user.data.user.id;

    // コメントといいねの状態を取得
    let commentToUpdate: Comment | undefined = undefined;
    let parentComment: Comment | undefined = undefined;

    // 親コメントを検索
    for (const comment of comments) {
      if (comment.id === commentId) {
        commentToUpdate = comment;
        break;
      }
      // 返信を検索
      if (comment.replies) {
        for (const reply of comment.replies) {
          if (reply.id === commentId) {
            commentToUpdate = reply;
            parentComment = comment;
            break;
          }
        }
        if (commentToUpdate) break;
      }
    }

    if (!commentToUpdate) {
      console.error("コメントが見つかりません:", commentId);
      return;
    }

    try {
      const isLiked = commentToUpdate.liked;
      const newLikedStatus = await toggleCommentLike(commentId, userId, isLiked);
      
      // コメントリストを更新
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: !comment.liked,
            likesCount: !comment.liked ? comment.likesCount + 1 : comment.likesCount - 1
          };
        }
        
        // 返信を確認
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                liked: !reply.liked,
                likesCount: !reply.liked ? reply.likesCount + 1 : reply.likesCount - 1
              };
            }
            return reply;
          });
          
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
    } catch (error) {
      console.error("いいね処理エラー:", error);
      toast.error("いいねの処理に失敗しました");
    }
  };

  return { toggleLike };
}
