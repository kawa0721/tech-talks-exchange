import React, { useState, useCallback } from "react";
import { Comment } from "@/types";
import ReplyForm from "./ReplyForm";
import EditCommentForm from "./EditCommentForm";
import CommentHeader from "./CommentHeader";
import CommentBody from "./CommentBody";
import CommentReplies from "./CommentReplies";

interface CommentItemProps {
  comment: Comment;
  replyTo: string | null;
  editContent: Record<string, string>;
  submitting: boolean;
  onSetReplyTo: (id: string | null) => void;
  onSetReplyContent: (content: string, nickname?: string) => void;
  onSubmitReply: (parentId: string, content?: string, nickname?: string) => void;
  onSetEditContent: (id: string, content: string) => void;
  onToggleLike: (id: string) => void;
  onDeleteComment: (id: string, isReply?: boolean, parentId?: string) => void;
  onStartEditing: (id: string, isReply?: boolean, parentId?: string) => void;
  onCancelEditing: (id: string) => void;
  onSaveEdit: (id: string, isReply?: boolean, parentId?: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replyTo,
  editContent,
  submitting,
  onSetReplyTo,
  onSetReplyContent,
  onSubmitReply,
  onSetEditContent,
  onToggleLike,
  onDeleteComment,
  onStartEditing,
  onCancelEditing,
  onSaveEdit
}) => {
  const [showReplies, setShowReplies] = useState(true);
  
  // Toggle replies visibility - メモ化
  const toggleReplies = useCallback(() => {
    setShowReplies(prev => !prev);
  }, []);

  // Handle reply button click - メモ化
  const handleReplyClick = useCallback(() => {
    if (replyTo === comment.id) {
      onSetReplyTo(null);
    } else {
      onSetReplyTo(comment.id);
    }
  }, [comment.id, replyTo, onSetReplyTo]);

  // コールバック関数をメモ化
  const handleCancelEditing = useCallback(() => {
    onCancelEditing(comment.id);
  }, [comment.id, onCancelEditing]);

  const handleSaveEdit = useCallback(() => {
    onSaveEdit(comment.id);
  }, [comment.id, onSaveEdit]);

  const handleSubmitReply = useCallback((content?: string, nickname?: string) => {
    onSubmitReply(comment.id, content, nickname);
  }, [comment.id, onSubmitReply]);

  const handleCancelReply = useCallback(() => {
    onSetReplyTo(null);
  }, [onSetReplyTo]);

  // Check if this comment is being edited
  const isEditing = comment.isEditing || false;

  return (
    <div className="comment-item border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-card">
      {/* Content section */}
      {isEditing ? (
        <EditCommentForm
          id={comment.id}
          content={editContent[comment.id] || comment.content}
          onSetContent={onSetEditContent}
          onCancel={handleCancelEditing}
          onSave={handleSaveEdit}
          isSubmitting={submitting}
        />
      ) : (
        <>
          <CommentHeader 
            comment={comment}
            onStartEditing={onStartEditing}
            onDeleteComment={onDeleteComment}
            onToggleLike={onToggleLike}
            onReplyClick={handleReplyClick}
          />
          <CommentBody 
            comment={comment} 
          />
        </>
      )}
      
      {/* Reply form */}
      {replyTo === comment.id && (
        <div className="mt-3">
          <ReplyForm
            parentId={comment.id}
            userName={comment.user.name}
            onSubmit={handleSubmitReply}
            onCancel={handleCancelReply}
            isSubmitting={submitting}
          />
        </div>
      )}
      
      {/* Replies section */}
      <CommentReplies 
        comment={comment}
        showReplies={showReplies}
        toggleReplies={toggleReplies}
        editContent={editContent}
        onSetEditContent={onSetEditContent}
        onToggleLike={onToggleLike}
        onDeleteComment={onDeleteComment}
        onStartEditing={onStartEditing}
        onCancelEditing={onCancelEditing}
        onSaveEdit={onSaveEdit}
        submitting={submitting}
      />
    </div>
  );
};

export default React.memo(CommentItem);
