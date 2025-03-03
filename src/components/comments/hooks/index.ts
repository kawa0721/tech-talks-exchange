
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
    submitting,
    setComments 
  } = useCommentsSubmit(postId);
  
  const {
    replyTo,
    replyContent,
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
  
  return {
    comments,
    replyTo,
    replyContent,
    submitting,
    loading,
    editContent,
    setReplyTo,
    setReplyContent, // This should now have the correct type signature (content: string, nickname?: string) => void
    handleSubmitComment,
    handleSubmitReply,
    toggleLike,
    deleteComment,
    startEditing: (id: string, isReply?: boolean, parentId?: string) => 
      startEditing(comments, setComments, id, isReply, parentId),
    cancelEditing: (id: string) => 
      cancelEditing(comments, setComments, id),
    saveEdit: (id: string, isReply?: boolean, parentId?: string) => 
      saveEdit(comments, setComments, id, isReply, parentId),
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
