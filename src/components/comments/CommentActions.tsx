
import { ThumbsUp, Reply, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentActionsProps {
  id: string;
  isReply?: boolean;
  parentId?: string;
  liked: boolean;
  likesCount: number;
  onLike: () => void;
  onReply?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showReplyButton?: boolean;
}

const CommentActions = ({
  id,
  isReply = false,
  parentId,
  liked,
  likesCount,
  onLike,
  onReply,
  onEdit,
  onDelete,
  showReplyButton = true
}: CommentActionsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`px-2 py-1 h-auto text-xs ${liked ? "text-blue-500" : ""}`}
          onClick={onLike}
        >
          <ThumbsUp className={isReply ? "h-3 w-3 mr-1" : "h-3 w-3 mr-1"} />
          {likesCount > 0 && likesCount}
        </Button>
        
        {showReplyButton && !isReply && onReply && (
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-auto text-xs"
            onClick={onReply}
          >
            <Reply className="h-3 w-3 mr-1" />
            返信
          </Button>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={isReply ? "h-6 w-6" : "h-8 w-8"}>
            <MoreHorizontal className={isReply ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDelete}>
            削除
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            編集
          </DropdownMenuItem>
          <DropdownMenuItem>
            報告
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CommentActions;
