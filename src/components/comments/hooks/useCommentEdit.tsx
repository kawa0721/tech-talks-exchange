
import { useState } from "react";
import { Comment } from "@/types";
import { toast } from "sonner";
import { updateCommentContent } from "./utils/commentActions";
import { supabase } from "@/integrations/supabase/client";
import { findAndUpdateComment } from "./utils/commentMappers";

export function useCommentEdit() {
  const [editContent, setEditContent] = useState<Record<string, string>>({});

  // Helper function to start editing a comment
  const startEditing = (
    comments: Comment[],
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
    commentId: string, 
    isReply = false, 
    parentId?: string
  ) => {
    let currentContent = "";
    
    // Find the current content of the comment being edited
    currentContent = findCommentContent(comments, commentId, isReply, parentId);
    
    // Set the edit content for this comment ID
    setEditContent({ ...editContent, [commentId]: currentContent });
    
    // Update the comments state to mark this comment as being edited
    updateCommentsEditingState(comments, setComments, commentId, true);
  };

  const cancelEditing = (
    comments: Comment[],
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
    commentId: string
  ) => {
    // Reset the edit content for this comment
    const newEditContent = { ...editContent };
    delete newEditContent[commentId];
    setEditContent(newEditContent);
    
    // Update the comments state to unmark this comment as being edited
    updateCommentsEditingState(comments, setComments, commentId, false);
  };

  const saveEdit = async (
    comments: Comment[],
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
    commentId: string, 
    isReply = false, 
    parentId?: string
  ) => {
    const newContent = editContent[commentId];
    
    if (!newContent || !newContent.trim()) {
      toast.error("コメントを入力してください");
      return;
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast.error("コメントを編集するにはログインが必要です");
      return;
    }
    
    try {
      await updateCommentContent(commentId, user.data.user.id, newContent);
      
      // Update the comments with the new content
      const updatedComments = findAndUpdateComment(
        comments,
        commentId,
        (comment) => ({
          ...comment,
          content: newContent,
          isEditing: false,
          updatedAt: new Date()
        })
      );
      
      setComments(updatedComments);
      
      // Reset the edit content for this comment
      const newEditContent = { ...editContent };
      delete newEditContent[commentId];
      setEditContent(newEditContent);
      
      toast.success("コメントが更新されました");
    } catch (error) {
      console.error("コメント更新エラー:", error);
      toast.error("コメントの更新に失敗しました");
    }
  };

  const handleSetEditContent = (id: string, content: string) => {
    setEditContent({ ...editContent, [id]: content });
  };

  return {
    editContent,
    startEditing,
    cancelEditing,
    saveEdit,
    handleSetEditContent
  };
}

// Helper function to find comment content
function findCommentContent(
  comments: Comment[], 
  commentId: string, 
  isReply = false, 
  parentId?: string
): string {
  if (isReply && parentId) {
    const parentComment = comments.find(c => c.id === parentId);
    const reply = parentComment?.replies?.find(r => r.id === commentId);
    return reply?.content || "";
  } else {
    const comment = comments.find(c => c.id === commentId);
    return comment?.content || "";
  }
}

// Helper function to update editing state in comment tree
function updateCommentsEditingState(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  commentId: string,
  isEditing: boolean
) {
  const updatedComments = findAndUpdateComment(
    comments,
    commentId,
    (comment) => ({ ...comment, isEditing })
  );
  
  setComments(updatedComments);
}

