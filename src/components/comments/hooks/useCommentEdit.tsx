
import { useState } from "react";
import { Comment } from "@/types";
import { toast } from "sonner";
import { updateCommentContent } from "./utils/commentActions";
import { supabase } from "@/integrations/supabase/client";

export function useCommentEdit() {
  const [editContent, setEditContent] = useState<Record<string, string>>({});

  const startEditing = (
    comments: Comment[],
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
    commentId: string, 
    isReply = false, 
    parentId?: string
  ) => {
    let currentContent = "";
    
    // 編集するコメントの内容を探す
    if (isReply && parentId) {
      const parentComment = comments.find(c => c.id === parentId);
      const reply = parentComment?.replies?.find(r => r.id === commentId);
      if (reply) currentContent = reply.content;
    } else {
      const comment = comments.find(c => c.id === commentId);
      if (comment) currentContent = comment.content;
    }
    
    // 編集内容を設定
    setEditContent({ ...editContent, [commentId]: currentContent });
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isEditing: true };
      }
      
      if (comment.replies) {
        const updatedReplies = comment.replies.map(reply => {
          if (reply.id === commentId) {
            return { ...reply, isEditing: true };
          }
          return reply;
        });
        
        return { ...comment, replies: updatedReplies };
      }
      
      return comment;
    });
    
    setComments(updatedComments);
  };

  const cancelEditing = (
    comments: Comment[],
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
    commentId: string
  ) => {
    // 編集内容をリセット
    const newEditContent = { ...editContent };
    delete newEditContent[commentId];
    setEditContent(newEditContent);
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isEditing: false };
      }
      
      if (comment.replies) {
        const updatedReplies = comment.replies.map(reply => {
          if (reply.id === commentId) {
            return { ...reply, isEditing: false };
          }
          return reply;
        });
        
        return { ...comment, replies: updatedReplies };
      }
      
      return comment;
    });
    
    setComments(updatedComments);
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
      
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return { 
            ...comment, 
            content: newContent, 
            isEditing: false,
            updatedAt: new Date()
          };
        }
        
        if (comment.replies && (isReply || parentId === comment.id)) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return { 
                ...reply, 
                content: newContent, 
                isEditing: false,
                updatedAt: new Date()
              };
            }
            return reply;
          });
          
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
      
      // 編集内容をリセット
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
