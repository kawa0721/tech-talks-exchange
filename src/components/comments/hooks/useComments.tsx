
import { useState, useEffect } from "react";
import { Comment } from "@/types";
import { toast } from "sonner";
import { fetchParentComments } from "./utils/commentFetcher";
import { mapCommentWithUserInfo, getCurrentUser } from "./utils/commentMappers";
import { useCommentsSubmit } from "./useCommentsSubmit";
import { useReplyManagement } from "./useReplyManagement";
import { useCommentLikes } from "./useCommentLikes";
import { useCommentDelete } from "./useCommentDelete";
import { useCommentEdit } from "./useCommentEdit";

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose hooks for different functionalities
  const { submitting, handleSubmitComment } = useCommentsSubmit(comments, setComments, postId);
  
  const { 
    replyTo, 
    replyContent, 
    submitting: replySubmitting, 
    setReplyTo, 
    setReplyContent, 
    handleSubmitReply 
  } = useReplyManagement(comments, setComments, postId);
  
  const { toggleLike } = useCommentLikes(comments, setComments);
  
  const { deleteComment } = useCommentDelete(comments, setComments);
  
  const {
    editContent,
    startEditing,
    cancelEditing,
    saveEdit,
    handleSetEditContent
  } = useCommentEdit();

  // コメントデータの取得
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        // 親コメントを取得
        const parentComments = await fetchParentComments(postId);
        
        // 現在のユーザー情報を取得
        const currentUser = await getCurrentUser();
        const currentUserId = currentUser?.id;
        
        // コメントにユーザー情報を付加
        const commentsWithUserInfo = await Promise.all(
          parentComments.map(async (comment) => {
            return await mapCommentWithUserInfo(comment, postId, currentUserId);
          })
        );

        setComments(commentsWithUserInfo);
      } catch (error) {
        console.error("コメント取得エラー:", error);
        toast.error("コメントの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  return {
    comments,
    replyTo,
    replyContent,
    submitting: submitting || replySubmitting,
    loading,
    editContent,
    setReplyTo,
    setReplyContent,
    handleSubmitComment,
    handleSubmitReply,
    toggleLike,
    deleteComment,
    startEditing: (commentId: string, isReply = false, parentId?: string) => 
      startEditing(comments, setComments, commentId, isReply, parentId),
    cancelEditing: (commentId: string) => 
      cancelEditing(comments, setComments, commentId),
    saveEdit: (commentId: string, isReply = false, parentId?: string) => 
      saveEdit(comments, setComments, commentId, isReply, parentId),
    handleSetEditContent
  };
}
