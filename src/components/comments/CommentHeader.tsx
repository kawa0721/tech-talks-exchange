
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@/types";
import CommentActions from "./CommentActions";

interface CommentHeaderProps {
  comment: Comment;
  onStartEditing: (id: string, isReply?: boolean, parentId?: string) => void;
  onDeleteComment: (id: string, isReply?: boolean, parentId?: string) => void;
}

const CommentHeader: React.FC<CommentHeaderProps> = ({
  comment,
  onStartEditing,
  onDeleteComment
}) => {
  // Format date
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ja });
  };

  return (
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center">
        <Avatar className="w-8 h-8 mr-2">
          <AvatarImage src={comment.user.avatar || ""} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
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
  );
};

export default CommentHeader;
