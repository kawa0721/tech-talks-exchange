import { useState } from "react";
import { Comment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useCommentSubmission(
  postId: string,
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  onCommentCountChange?: (count: number) => void
) {
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

  // Function to handle comment submission
  const handleSubmitComment = async (newComment: string, nickname?: string) => {
    setSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      let userId = null;
      if (user) {
        userId = user.id;
      }
      
      // Prepare comment data
      const commentData = {
        post_id: postId,
        content: newComment,
        user_id: userId,
        guest_nickname: nickname
      };
      
      // Insert comment into database
      const { data: newCommentData, error: insertError } = await supabase
        .from('comments')
        .insert([commentData])
        .select('id, post_id, user_id, content, created_at, updated_at, parent_id, likes_count, guest_nickname')
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      if (!newCommentData) {
        throw new Error("Failed to create comment");
      }
      
      // Get profile information
      let profile = null;
      if (userId) {
        profile = await getProfileForUser(userId);
      }
      
      // Format the new comment
      const formattedComment: Comment = {
        id: newCommentData.id as string,
        postId,
        userId: (newCommentData.user_id as string) || 'guest',
        content: newCommentData.content as string,
        createdAt: new Date(newCommentData.created_at),
        updatedAt: newCommentData.updated_at ? new Date(newCommentData.updated_at) : undefined,
        likesCount: newCommentData.likes_count || 0,
        liked: false,
        guestNickname: newCommentData.guest_nickname || nickname,
        user: {
          id: newCommentData.user_id || 'guest',
          name: newCommentData.guest_nickname || nickname ||
                (profile ? profile.username : null) || 
                `ユーザー_${(newCommentData.user_id || '').substring(0, 5)}`,
          avatar: (profile ? profile.avatar_url : null) || '/placeholder-avatar.png'
        },
        replies: []
      };
      
      setComments(prevComments => [formattedComment, ...prevComments]);
      
      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(comments.length + 1);
      }
    } catch (err: any) {
      console.error("コメント投稿エラー:", err);
      setError(err.message || "コメントの投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    handleSubmitComment
  };
}
