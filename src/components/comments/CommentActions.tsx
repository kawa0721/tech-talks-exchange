import React, { useCallback } from "react";
import { MoreHorizontal, Trash2, Edit, Flag } from "lucide-react";
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

const CommentActions: React.FC<CommentActionsProps> = ({
  comment,
  onStartEditing,
  onDeleteComment
}) => {
  // メモ化したコールバックを使用して不要な再レンダリングを防止
  const handleEdit = useCallback(() => {
    onStartEditing(comment.id);
  }, [comment.id, onStartEditing]);

  const handleDelete = useCallback(() => {
    onDeleteComment(comment.id);
  }, [comment.id, onDeleteComment]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">メニューを開く</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={5} className="w-36">
        <DropdownMenuItem 
          onClick={handleEdit}
          className="cursor-pointer flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          <span>編集</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="cursor-pointer flex items-center text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span>削除</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer flex items-center">
          <Flag className="h-4 w-4 mr-2" />
          <span>報告</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default React.memo(CommentActions);
