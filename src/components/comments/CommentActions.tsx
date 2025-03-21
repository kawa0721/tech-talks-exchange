import React from "react";
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

const CommentActions = ({
  comment,
  onStartEditing,
  onDeleteComment
}: CommentActionsProps) => {
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
          onClick={() => onStartEditing(comment.id)}
          className="cursor-pointer flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          <span>編集</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onDeleteComment(comment.id)}
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

export default CommentActions;
