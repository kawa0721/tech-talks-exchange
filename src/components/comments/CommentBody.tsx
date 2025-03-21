import React from "react";
import { Comment } from "@/types";

interface CommentBodyProps {
  comment: Comment;
}

const CommentBody: React.FC<CommentBodyProps> = ({
  comment
}) => {
  return (
    <div className="comment-content mt-2 mb-3 break-words text-left">
      {comment.content}
    </div>
  );
};

export default CommentBody;
