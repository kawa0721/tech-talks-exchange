
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@/types";
import CommentActions from "./CommentActions";
import EditCommentForm from "./EditCommentForm";

interface ReplyItemProps {
  reply: Comment;
  parentId: string;
  editContent: Record<string, string>;
  onSetEditContent: (id: string, content: string) => void;
  onToggleLike: (id: string) => void;
  onDeleteComment: (id: string, isReply: boolean, parentId: string) => void;
  onStartEditing: (id: string, isReply: boolean, parentId: string) => void;
  onCancelEditing: (id: string) => void;
  onSaveEdit: (id: string, isReply: boolean, parentId: string) => void;
}

const ReplyItem = ({
  reply,
  parentId,
  editContent,
  onSetEditContent,
  onToggleLike,
  onDeleteComment,
  onStartEditing,
  onCancelEditing,
  onSaveEdit
}: ReplyItemProps) => {
  return (
    <div className="flex gap-3">
      <Avatar className="h-6 w-6">
        <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
        <AvatarFallback>{reply.user.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <Link to={`/user/${reply.user.id}`} className="font-medium text-sm hover:underline">
              {reply.user.name}
            </Link>
            <span className="text-xs text-muted-foreground ml-2">
              {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
              {reply.updatedAt && reply.updatedAt > reply.createdAt && 
                " (編集済み)"}
            </span>
          </div>
          
          <CommentActions
            id={reply.id}
            isReply={true}
            parentId={parentId}
            liked={reply.liked || false}
            likesCount={reply.likesCount}
            onLike={() => onToggleLike(reply.id)}
            onEdit={() => onStartEditing(reply.id, true, parentId)}
            onDelete={() => onDeleteComment(reply.id, true, parentId)}
            showReplyButton={false}
          />
        </div>
        
        {reply.isEditing ? (
          <EditCommentForm
            content={editContent[reply.id] || ""}
            onChange={(content) => onSetEditContent(reply.id, content)}
            onSave={() => onSaveEdit(reply.id, true, parentId)}
            onCancel={() => onCancelEditing(reply.id)}
            isReply={true}
          />
        ) : (
          <p className="mt-1 text-xs">{reply.content}</p>
        )}
      </div>
    </div>
  );
};

export default ReplyItem;
