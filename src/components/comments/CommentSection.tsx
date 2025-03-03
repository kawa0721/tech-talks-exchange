
import React from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { useCommentSection } from "./hooks/useCommentSection";

interface CommentSectionProps {
  postId: string;
  postOwnerId?: string;
  onCommentCountChange?: (count: number) => void;
}

const CommentSection = ({ postId, postOwnerId, onCommentCountChange }: CommentSectionProps) => {
  // Use our new custom hook to manage comments
  const {
    comments,
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
  } = useCommentSection(postId, onCommentCountChange);

  return (
    <div className="comments-section mt-8">
      <h2 className="text-xl font-semibold mb-4">コメント ({comments.length})</h2>
      
      <CommentForm 
        postId={postId}
        onSubmit={handleSubmitComment}
        isSubmitting={submitting} 
      />
      
      <div className="mt-6">
        <CommentList 
          comments={comments}
          postOwnerId={postOwnerId}
          loading={loading}
          error={error}
          replyTo={replyTo}
          editContent={editContent}
          submitting={submitting}
          onSetReplyTo={setReplyTo}
          onSetReplyContent={setReplyContent}
          onSubmitReply={handleSubmitReply}
          onSetEditContent={setEditContent}
          onToggleLike={toggleLike}
          onDeleteComment={deleteComment}
          onStartEditing={handleStartEditing}
          onCancelEditing={handleCancelEditing}
          onSaveEdit={handleSaveEdit}
        />
      </div>
    </div>
  );
};

export default CommentSection;
