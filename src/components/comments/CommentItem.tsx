
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@/types";
import CommentActions from "./CommentActions";
import EditCommentForm from "./EditCommentForm";
import ReplyForm from "./ReplyForm";
import ReplyItem from "./ReplyItem";

interface CommentItemProps {
  comment: Comment;
  replyTo: string | null;
  editContent: Record<string, string>;
  submitting: boolean;
  onSetReplyTo: (id: string | null) => void;
  onSetReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  onSetEditContent: (id: string, content: string) => void;
  onToggleLike: (id: string) => void;
  onDeleteComment: (id: string, isReply?: boolean, parentId?: string) => void;
  onStartEditing: (id: string, isReply?: boolean, parentId?: string) => void;
  onCancelEditing: (id: string) => void;
  onSaveEdit: (id: string, isReply?: boolean, parentId?: string) => void;
}

const CommentItem = ({
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
}: CommentItemProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <Link to={`/user/${comment.user.id}`} className="font-medium hover:underline">
                {comment.user.name}
              </Link>
              <span className="text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                {comment.updatedAt && comment.updatedAt > comment.createdAt && 
                  " (編集済み)"}
              </span>
            </div>
            
            <CommentActions
              id={comment.id}
              liked={comment.liked || false}
              likesCount={comment.likesCount}
              onLike={() => onToggleLike(comment.id)}
              onReply={() => onSetReplyTo(replyTo === comment.id ? null : comment.id)}
              onEdit={() => onStartEditing(comment.id)}
              onDelete={() => onDeleteComment(comment.id)}
            />
          </div>
          
          {comment.isEditing ? (
            <EditCommentForm
              content={editContent[comment.id] || ""}
              onChange={(content) => onSetEditContent(comment.id, content)}
              onSave={() => onSaveEdit(comment.id)}
              onCancel={() => onCancelEditing(comment.id)}
            />
          ) : (
            <p className="mt-1 text-sm">{comment.content}</p>
          )}
          
          {replyTo === comment.id && (
            <ReplyForm
              parentId={comment.id}
              userName={comment.user.name}
              onSubmit={onSetReplyContent}
              onCancel={() => onSetReplyTo(null)}
              isSubmitting={submitting}
            />
          )}
          
          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-muted space-y-4">
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
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
