
import React from "react";
import { Comment } from "@/types";
import CommentItem from "./CommentItem";
import { CommentSkeleton } from "./comment-loading";
import { EmptyComments } from "./comment-empty";

interface CommentListProps {
  comments: Comment[];
  postOwnerId?: string;
  loading: boolean;
  error: string | null;
  replyTo: string | null;
  editContent: Record<string, string>;
  submitting: boolean;
  onSetReplyTo: (id: string | null) => void;
  onSetReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string, content?: string, nickname?: string) => void;
  onSetEditContent: (id: string, content: string) => void;
  onToggleLike: (id: string) => void;
  onDeleteComment: (id: string, isReply?: boolean, parentId?: string) => void;
  onStartEditing: (id: string, isReply?: boolean, parentId?: string) => void;
  onCancelEditing: (id: string) => void;
  onSaveEdit: (id: string, isReply?: boolean, parentId?: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  postOwnerId,
  loading,
  error,
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
  // デバッグ用：コメント階層構造をログに出力
  React.useEffect(() => {
    if (comments.length > 0) {
      console.log("コメント階層構造:", 
        comments.map(c => ({
          id: c.id,
          replies: c.replies?.map(r => ({
            id: r.id,
            parentId: r.parentId,
            hasNestedReplies: !!r.replies?.length,
            nestedReplies: r.replies?.map(nr => ({
              id: nr.id,
              parentId: nr.parentId
            }))
          }))
        }))
      );
    }
  }, [comments]);
  if (loading) {
    return (
      <div>
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
        {error}
      </div>
    );
  }

  if (comments.length === 0) {
    return <EmptyComments postOwnerId={postOwnerId} />;
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replyTo={replyTo}
          editContent={editContent}
          submitting={submitting}
          onSetReplyTo={onSetReplyTo}
          onSetReplyContent={onSetReplyContent}
          onSubmitReply={onSubmitReply}
          onSetEditContent={onSetEditContent}
          onToggleLike={onToggleLike}
          onDeleteComment={onDeleteComment}
          onStartEditing={onStartEditing}
          onCancelEditing={onCancelEditing}
          onSaveEdit={onSaveEdit}
        />
      ))}
    </div>
  );
};

export default CommentList;
