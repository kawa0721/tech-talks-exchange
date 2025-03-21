import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Comment } from "@/types";

export function useCommentReply(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Helper function to get user profile information
  const getProfileForUser = async (userId: string | null) => {
    if (!userId) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', userId)
        .single();
      
      return error ? null : data;
    } catch (e) {
      console.error("Profile fetch error:", e);
      return null;
    }
  };

  // Function to handle reply submission
  const handleSubmitReply = async (parentId: string, content?: string, nickname?: string) => {
    // Use the content parameter if provided, otherwise use the state
    const replyText = content || replyContent;
    
    if (!replyText.trim()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      let userId = null;
      if (user) {
        userId = user.id;
      }
      
      // 親コメント情報を取得（トップレベルコメントか返信か）
      const parentInfo = findCommentById(comments, parentId);
      if (!parentInfo) {
        throw new Error("親コメントが見つかりません");
      }
      
      const postId = getPostIdFromParentComment(parentId);
      
      // Prepare reply data
      const replyData = {
        post_id: postId,
        content: replyText,
        parent_id: parentId, // 常に直接の親を参照
        user_id: userId,
        guest_nickname: nickname
      };
      
      // Insert reply into database
      const { data: newReplyData, error: insertError } = await supabase
        .from('comments')
        .insert([replyData])
        .select('id, post_id, user_id, content, created_at, updated_at, parent_id, likes_count, guest_nickname')
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      if (!newReplyData) {
        throw new Error("Failed to create reply");
      }
      
      // Get profile information
      let profile = null;
      if (userId) {
        profile = await getProfileForUser(userId);
      }
      
      // Format the new reply
      const formattedReply: Comment = {
        id: newReplyData.id as string,
        postId: newReplyData.post_id as string,
        userId: (newReplyData.user_id as string) || 'guest',
        parentId,
        content: newReplyData.content as string,
        createdAt: new Date(newReplyData.created_at),
        updatedAt: newReplyData.updated_at ? new Date(newReplyData.updated_at) : undefined,
        likesCount: newReplyData.likes_count || 0,
        liked: false,
        guestNickname: newReplyData.guest_nickname,
        user: {
          id: newReplyData.user_id || 'guest',
          name: newReplyData.guest_nickname || 
                (profile ? profile.username : null) || 
                `ユーザー_${(newReplyData.user_id || '').substring(0, 5)}`,
          avatar: (profile ? profile.avatar_url : null) || 
                '/placeholder-avatar.png'
        }
      };
      
      // 親がトップレベルコメントか返信かに応じてコメントツリーを更新
      let updatedComments;
      
      // 親の親IDが存在する場合（親が返信の場合）
      if (parentInfo.parentId) {
        // 親コメントを取得
        const topLevelParentId = parentInfo.parentId;
        
        updatedComments = comments.map(comment => {
          if (comment.id === topLevelParentId) {
            // トップレベルコメントを見つけた
            const updatedReplies = comment.replies ? 
              comment.replies.map(reply => {
                if (reply.id === parentId) {
                  // 返信元の返信を見つけた
                  const nestedReplies = reply.replies || [];
                  return {
                    ...reply,
                    replies: [...nestedReplies, formattedReply]
                  };
                }
                return reply;
              }) : 
              [];
              
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        });
      } else {
        // 親がトップレベルコメントの場合
        updatedComments = comments.map(comment => {
          if (comment.id === parentId) {
            const updatedReplies = comment.replies ? [...comment.replies, formattedReply] : [formattedReply];
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        });
      }
      
      setComments(updatedComments);
      setReplyTo(null);
      setReplyContent("");
      
      // ユーザーに成功を通知
      toast.success("返信が投稿されました");
    } catch (err: any) {
      console.error("返信投稿エラー:", err);
      setError(err.message || "返信の投稿に失敗しました");
      toast.error("返信の投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get the post ID from a parent comment
  const getPostIdFromParentComment = (parentId: string): string => {
    const comment = findCommentById(comments, parentId);
    return comment?.postId || '';
  };
  
  // Helper function to find a comment by ID (either top-level or reply)
  const findCommentById = (comments: Comment[], commentId: string): Comment | undefined => {
    // トップレベルのコメントを検索
    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment;
      }
      
      // 返信を検索
      if (comment.replies) {
        for (const reply of comment.replies) {
          if (reply.id === commentId) {
            return reply;
          }
          
          // ネストした返信を検索
          if (reply.replies) {
            const nestedReply = reply.replies.find(r => r.id === commentId);
            if (nestedReply) return nestedReply;
          }
        }
      }
    }
    
    return undefined;
  };

  return {
    replyTo,
    replyContent,
    submitting,
    setReplyTo,
    setReplyContent,
    handleSubmitReply
  };
}
