
// Re-export all hooks for easier importing
import { useCommentsSubmit } from './useCommentsSubmit';
import { useReplyManagement } from './useReplyManagement';
import { useCommentLikes } from './useCommentLikes';
import { useCommentDelete } from './useCommentDelete';
import { useCommentEdit } from './useCommentEdit';

// Create a combined useComments hook for backwards compatibility
export const useComments = (postId: string) => {
  const { 
    comments, 
    loading, 
    handleSubmitComment, 
    submitting 
  } = useCommentsSubmit(postId);
  
  const {
    replyTo,
    replyContent,
    setReplyTo,
    setReplyContent,
    handleSubmitReply
  } = useReplyManagement();
  
  const { toggleLike } = useCommentLikes();
  
  const { deleteComment } = useCommentDelete();
  
  const {
    editContent,
    startEditing,
    cancelEditing,
    saveEdit,
    handleSetEditContent
  } = useCommentEdit();
  
  return {
    comments,
    replyTo,
    replyContent,
    submitting,
    loading,
    editContent,
    setReplyTo,
    setReplyContent,
    handleSubmitComment,
    handleSubmitReply,
    toggleLike,
    deleteComment,
    startEditing,
    cancelEditing,
    saveEdit,
    handleSetEditContent
  };
};

// Export all individual hooks
export {
  useCommentsSubmit,
  useReplyManagement,
  useCommentLikes,
  useCommentDelete,
  useCommentEdit
};
