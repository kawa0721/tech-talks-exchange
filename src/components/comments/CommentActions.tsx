
import { ThumbsUp, Reply, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Comment } from "@/types";

interface CommentActionsProps {
  comment: Comment;
  onStartEditing: (id: string, isReply?: boolean, parentId?: string) => void;
  onDeleteComment: (id: string, isReply?: boolean, parentId?: string) => void;
}

const CommentActions = ({
  comment,
  onStartEditing,
  onDeleteComment
}: CommentActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDeleteComment(comment.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          削除
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStartEditing(comment.id)}>
          <Edit className="h-4 w-4 mr-2" />
          編集
        </DropdownMenuItem>
        <DropdownMenuItem>
          報告
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CommentActions;
