
import { useState, useEffect } from "react";
import { Comment } from "@/types";
import { useCommentLikes } from "./useCommentLikes";
import { useCommentEdit } from "./useCommentEdit";
import { useCommentDelete } from "./useCommentDelete";
import { useCommentReply } from "./useCommentReply";
import { useCommentSubmission } from "./useCommentSubmission";
import { useCommentsWithProfiles } from "../use-comments-view";

export function useCommentSection(postId: string, onCommentCountChange?: (count: number) => void) {
  // Get comments from the custom hook
  const { comments, loading, error: fetchError } = useCommentsWithProfiles(postId);
  
  // Local state
  const [commentsState, setCommentsState] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Update local state when comments are fetched
  useEffect(() => {
    if (comments.length > 0) {
      setCommentsState(comments);
      
      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(comments.length);
      }
    }
  }, [comments, onCommentCountChange]);
  
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
    handleSubmitReply 
  } = useCommentReply(commentsState, setCommentsState, setError);
  const {
    submitting: commentSubmitting,
    handleSubmitComment
  } = useCommentSubmission(postId, commentsState, setCommentsState, setError, onCommentCountChange);
  
  // Combined submitting state
  const submitting = replySubmitting || commentSubmitting;
  
  // Helper functions to handle editing
  const handleStartEditing = (id: string, isReply?: boolean, parentId?: string) => {
    editHookStartEditing(commentsState, setCommentsState, id, isReply, parentId);
  };

  const handleCancelEditing = (id: string) => {
    editHookCancelEditing(commentsState, setCommentsState, id);
  };

  const handleSaveEdit = (id: string, isReply?: boolean, parentId?: string) => {
    editHookSaveEdit(commentsState, setCommentsState, id, isReply, parentId);
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
