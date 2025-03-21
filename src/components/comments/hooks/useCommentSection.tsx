import { useState, useEffect, useCallback } from "react";
import { Comment } from "@/types";
import { useCommentLikes } from "./useCommentLikes";
import { useCommentEdit } from "./useCommentEdit";
import { useCommentDelete } from "./useCommentDelete";
import { useCommentReply } from "./useCommentReply";
import { useCommentSubmission } from "./useCommentSubmission";
import { useCommentsWithProfiles } from "../use-comments-view";

export function useCommentSection(postId: string, onCommentCountChange?: (count: number) => void) {
  // Get comments from the custom hook with refreshComments function
  const { comments, loading, error: fetchError, refreshComments } = useCommentsWithProfiles(postId);
  
  // Local state
  const [commentsState, setCommentsState] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Update local state when comments are fetched - 修正：無限ループを防ぐ
  useEffect(() => {
    // コメントIDの配列を比較することで実質的な変更があるか確認
    const currentIds = commentsState.map(c => c.id).sort().join(',');
    const newIds = comments.map(c => c.id).sort().join(',');
    
    // コメントの数やID配列が変更された場合のみ更新する
    if (comments.length > 0 && (currentIds !== newIds || commentsState.length !== comments.length)) {
      setCommentsState(comments);
      
      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(comments.length);
      }
    }
  }, [comments, onCommentCountChange, commentsState]);
  
  // Update error state
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);
  
  // Custom hooks for comment functionality
  const { toggleLike } = useCommentLikes(commentsState, setCommentsState);
  const { 
    editContent, 
    startEditing: editHookStartEditing, 
    cancelEditing: editHookCancelEditing, 
    saveEdit: editHookSaveEdit, 
    handleSetEditContent: setEditContent 
  } = useCommentEdit();
  const { deleteComment } = useCommentDelete(commentsState, setCommentsState);
  const { 
    replyTo, 
    replyContent, 
    submitting: replySubmitting,
    setReplyTo, 
    setReplyContent, 
    handleSubmitReply: originalHandleSubmitReply 
  } = useCommentReply(commentsState, setCommentsState, setError);
  const {
    submitting: commentSubmitting,
    handleSubmitComment: originalHandleSubmitComment
  } = useCommentSubmission(postId, commentsState, setCommentsState, setError, onCommentCountChange);
  
  // Combined submitting state
  const submitting = replySubmitting || commentSubmitting;
  
  // Wrappers for submit functions that refresh comments after submission
  const handleSubmitComment = useCallback(async (content: string, nickname?: string) => {
    await originalHandleSubmitComment(content, nickname);
    refreshComments(); // コメント投稿後にデータを再取得
  }, [originalHandleSubmitComment, refreshComments]);

  const handleSubmitReply = useCallback(async (parentId: string, content: string, nickname?: string) => {
    await originalHandleSubmitReply(parentId, content, nickname);
    refreshComments(); // 返信投稿後にデータを再取得
  }, [originalHandleSubmitReply, refreshComments]);
  
  // Helper functions to handle editing
  const handleStartEditing = (id: string, isReply?: boolean, parentId?: string) => {
    editHookStartEditing(commentsState, setCommentsState, id, isReply, parentId);
  };

  const handleCancelEditing = (id: string) => {
    editHookCancelEditing(commentsState, setCommentsState, id);
  };

  const handleSaveEdit = async (id: string, isReply?: boolean, parentId?: string) => {
    await editHookSaveEdit(commentsState, setCommentsState, id, isReply, parentId);
    refreshComments(); // 編集後にデータを再取得
  };

  return {
    comments: commentsState,
    loading,
    error,
    replyTo,
    editContent,
    submitting,
    setReplyTo,
    setReplyContent,
    toggleLike,
    deleteComment,
    handleStartEditing,
    handleCancelEditing,
    handleSaveEdit,
    setEditContent,
    handleSubmitComment,
    handleSubmitReply
  };
}
