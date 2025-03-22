import React, { useState, useCallback } from "react";
import { Comment } from "@/types";
import ReplyForm from "./ReplyForm";
import EditCommentForm from "./EditCommentForm";
import CommentHeader from "./CommentHeader";
import CommentBody from "./CommentBody";
import CommentReplies from "./CommentReplies";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Handle like button click - メモ化
  const handleToggleLike = useCallback(() => {
    onToggleLike(comment.id);
  }, [comment.id, onToggleLike]);

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
    <div className="comment-item border border-gray-200 dark:border-input rounded-lg p-4 bg-card">
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
          />
          <CommentBody 
            comment={comment} 
          />
          
          {/* アクションボタン - コメント本文の下に配置 */}
          <div className="flex items-center justify-between mt-2 px-2">
            {/* 返信ボタンを左側に配置 */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-1 px-2 h-8"
              onClick={handleReplyClick}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">返信</span>
            </Button>
            
            {/* いいねボタンを真ん中に配置 */}
            <div className="flex justify-center flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center space-x-1 px-2 h-8 ${comment.liked ? 'text-blue-500' : ''}`}
                onClick={handleToggleLike}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs">{comment.likesCount > 0 ? comment.likesCount : ""}</span>
              </Button>
            </div>
            
            {/* 右側の空スペース（バランスのため） */}
            <div className="w-[72px]"></div>
          </div>
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
        replyTo={replyTo}
        onSetReplyTo={onSetReplyTo}
        onSubmitReply={onSubmitReply}
      />
      
      {/* 返信の返信フォームを表示 */}
      {replyTo && replyTo !== comment.id && comment.replies?.some(reply => reply.id === replyTo) && (
        <div className="mt-3 pl-4 border-l-2 border-muted">
          <ReplyForm
            parentId={replyTo}
            userName={comment.replies.find(r => r.id === replyTo)?.user.name || ''}
            onSubmit={(content, nickname) => {
              console.log("コメントに対する返信を送信: ", { parentId: replyTo });
              onSubmitReply(replyTo, content, nickname);
            }}
            onCancel={handleCancelReply}
            isSubmitting={submitting}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(CommentItem);
