import { Comment } from "@/types";
import { toast } from "sonner";
import { toggleCommentLike } from "./utils/commentActions";
import { supabase } from "@/integrations/supabase/client";
import { findAndUpdateComment } from "./utils/commentMappers";

export function useCommentLikes(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
) {
  const toggleLike = async (commentId: string) => {
    // コメントを検索
    const commentToUpdate = findCommentById(comments, commentId);
    
    if (!commentToUpdate) {
      console.error("コメントが見つかりません:", commentId);
      return;
    }

    try {
      // Check authentication
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      
      // ログイン状態を確認し、適切なIDを取得
      const userId = user ? user.id : null;
      const isLiked = commentToUpdate.liked;
      
      // Call API to toggle like
      await toggleCommentLike(commentId, userId, isLiked);
      
      // Update UI state
      updateCommentLikeState(comments, setComments, commentId, isLiked);
    } catch (error) {
      console.error("いいね処理エラー:", error);
      toast.error("いいねの処理に失敗しました");
    }
  };

  return { toggleLike };
}

// Helper function to find a comment by ID (either top-level or reply)
function findCommentById(comments: Comment[], commentId: string): Comment | undefined {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    
    if (comment.replies) {
      const reply = comment.replies.find(r => r.id === commentId);
      if (reply) return reply;
    }
  }
  
  return undefined;
}

// Helper function to check authentication
async function checkUserAuthentication() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Helper function to update like state in comment tree
function updateCommentLikeState(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  commentId: string,
  currentLikedState: boolean
) {
  const updatedComments = findAndUpdateComment(
    comments,
    commentId,
    (comment) => ({
      ...comment,
      liked: !currentLikedState,
      likesCount: !currentLikedState ? comment.likesCount + 1 : comment.likesCount - 1
    })
  );
  
  setComments(updatedComments);
}

