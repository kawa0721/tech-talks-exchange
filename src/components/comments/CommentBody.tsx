import React from "react";
import { Heart, MessageSquare } from "lucide-react";
import { Comment } from "@/types";

interface CommentBodyProps {
  comment: Comment;
  onToggleLike: (id: string) => void;
  onReplyClick: () => void;
}

const CommentBody: React.FC<CommentBodyProps> = ({
  comment,
  onToggleLike,
  onReplyClick
}) => {
  return (
    <>
      {/* Comment content */}
      <div className="comment-content mt-2 mb-3 break-words text-left">
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
          onClick={onReplyClick}
        >
          <MessageSquare className="w-4 h-4" />
          <span>返信</span>
        </button>
      </div>
    </>
  );
};

export default CommentBody;
