
import React from "react";
import ReplyItem from "./ReplyItem";
import { Comment } from "@/types";

interface CommentRepliesProps {
  comment: Comment;
  showReplies: boolean;
  toggleReplies: () => void;
  editContent: Record<string, string>;
  onSetEditContent: (id: string, content: string) => void;
  onToggleLike: (id: string) => void;
  onDeleteComment: (id: string, isReply: boolean, parentId: string) => void;
  onStartEditing: (id: string, isReply: boolean, parentId: string) => void;
  onCancelEditing: (id: string) => void;
  onSaveEdit: (id: string, isReply: boolean, parentId: string) => void;
  submitting: boolean;
}

const CommentReplies: React.FC<CommentRepliesProps> = ({
  comment,
  showReplies,
  toggleReplies,
  editContent,
  onSetEditContent,
  onToggleLike,
  onDeleteComment,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  submitting
}) => {
  if (!comment.replies || comment.replies.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <button 
        className="text-xs text-primary font-medium mb-2 flex items-center"
        onClick={toggleReplies}
      >
        {showReplies ? "返信を隠す" : `${comment.replies.length}件の返信を表示`}
      </button>
      
      {showReplies && (
        <div className="pl-4 border-l-2 border-muted space-y-4 mt-2">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              parentId={comment.id}
              editContent={editContent}
              onSetEditContent={onSetEditContent}
              onToggleLike={onToggleLike}
              onDeleteComment={onDeleteComment}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onSaveEdit={onSaveEdit}
              isEditing={reply.isEditing || false}
              submitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentReplies;
