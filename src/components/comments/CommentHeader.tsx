import React, { useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@/types";
import CommentActions from "./CommentActions";
import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentHeaderProps {
  comment: Comment;
  onStartEditing: (id: string, isReply?: boolean, parentId?: string) => void;
  onDeleteComment: (id: string, isReply?: boolean, parentId?: string) => void;
  onToggleLike: (id: string) => void;
  onReplyClick: () => void;
}

const CommentHeader: React.FC<CommentHeaderProps> = ({
  comment,
  onStartEditing,
  onDeleteComment,
  onToggleLike,
  onReplyClick
}) => {
  // Format date
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ja });
  };

  // メモ化したコールバックを使用して不要な再レンダリングを防止
  const handleToggleLike = useCallback(() => {
    onToggleLike(comment.id);
  }, [comment.id, onToggleLike]);

  const handleReplyClick = useCallback(() => {
    onReplyClick();
  }, [onReplyClick]);

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
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center space-x-1 px-2 h-8 ${comment.liked ? 'text-destructive' : ''}`}
          onClick={handleToggleLike}
        >
          <Heart className="w-4 h-4" fill={comment.liked ? "currentColor" : "none"} />
          <span className="text-xs">{comment.likesCount > 0 ? comment.likesCount : ""}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center space-x-1 px-2 h-8"
          onClick={handleReplyClick}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs">返信</span>
        </Button>
        
        <CommentActions 
          comment={comment}
          onStartEditing={onStartEditing}
          onDeleteComment={onDeleteComment}
        />
      </div>
    </div>
  );
};

export default React.memo(CommentHeader);
