
import React, { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Comment } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import ReplyItem from "./ReplyItem";
import ReplyForm from "./ReplyForm";
import EditCommentForm from "./EditCommentForm";
import CommentActions from "./CommentActions";

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
  
  // Toggle replies visibility
  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  // Format date
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ja });
  };

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
          onCancel={() => onCancelEditing(comment.id)}
          onSave={() => onSaveEdit(comment.id)}
          isSubmitting={submitting}
        />
      ) : (
        <>
          {/* Comment header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <div className="avatar w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold mr-2">
                {comment.user.avatar ? (
                  <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{comment.user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="font-semibold">{comment.user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt && comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
                    <span className="ml-1">(編集済み)</span>
                  )}
                </div>
              </div>
            </div>
            <CommentActions 
              comment={comment}
              onStartEditing={onStartEditing}
              onDeleteComment={onDeleteComment}
            />
          </div>
          
          {/* Comment content */}
          <div className="comment-content mt-2 mb-3 break-words">
            {comment.content}
          </div>
          
          {/* Comment actions */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
            <button 
              className={`flex items-center space-x-1 ${comment.liked ? 'text-destructive' : ''}`}
              onClick={() => onToggleLike(comment.id)}
            >
              <Heart className="w-4 h-4" fill={comment.liked ? "currentColor" : "none"} />
              <span>{comment.likesCount > 0 ? comment.likesCount : ""}</span>
            </button>
            
            <button 
              className="flex items-center space-x-1"
              onClick={() => {
                if (replyTo === comment.id) {
                  onSetReplyTo(null);
                } else {
                  onSetReplyTo(comment.id);
                  onSetReplyContent("", comment.user.name);
                }
              }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>返信</span>
            </button>
          </div>
        </>
      )}
      
      {/* Reply form */}
      {replyTo === comment.id && (
        <div className="mt-3">
          <ReplyForm
            parentId={comment.id}
            content={""}
            onSubmit={onSubmitReply}
            onCancel={() => onSetReplyTo(null)}
            isSubmitting={submitting}
            replyToName={comment.user.name}
          />
        </div>
      )}
      
      {/* Replies section */}
      {comment.replies && comment.replies.length > 0 && (
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
      )}
    </div>
  );
};

export default CommentItem;
