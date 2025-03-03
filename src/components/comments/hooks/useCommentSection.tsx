
import { useState, useEffect } from "react";
import { Comment } from "@/types";
import { useCommentLikes } from "./useCommentLikes";
import { useCommentEdit } from "./useCommentEdit";
import { useCommentDelete } from "./useCommentDelete";
import { useCommentsWithProfiles } from "../use-comments-view";
import { supabase } from "@/integrations/supabase/client";

export function useCommentSection(postId: string, onCommentCountChange?: (count: number) => void) {
  // Get comments from the custom hook
  const { comments, loading, error: fetchError } = useCommentsWithProfiles(postId);
  
  // Local state
  const [commentsState, setCommentsState] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Update local state when comments are fetched
  useEffect(() => {
    if (comments.length > 0) {
      setCommentsState(comments);
      
      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(comments.length);
      }
    }
  }, [comments, onCommentCountChange]);
  
  // Update error state
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);
  
  // Custom hooks for comment functionality
  const { toggleLike } = useCommentLikes(commentsState, setCommentsState);
  const { 
    editContent, 
    startEditing: editHookStartEditing, 
    cancelEditing: editHookCancelEditing, 
    saveEdit: editHookSaveEdit, 
    handleSetEditContent: setEditContent 
  } = useCommentEdit();
  const { deleteComment } = useCommentDelete(commentsState, setCommentsState);
  
  // Helper functions to handle editing
  const handleStartEditing = (id: string, isReply?: boolean, parentId?: string) => {
    editHookStartEditing(commentsState, setCommentsState, id, isReply, parentId);
  };

  const handleCancelEditing = (id: string) => {
    editHookCancelEditing(commentsState, setCommentsState, id);
  };

  const handleSaveEdit = (id: string, isReply?: boolean, parentId?: string) => {
    editHookSaveEdit(commentsState, setCommentsState, id, isReply, parentId);
  };

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
        guestNickname: newCommentData.guest_nickname,
        user: {
          id: newCommentData.user_id || 'guest',
          name: newCommentData.guest_nickname || 
                (profile ? profile.username : null) || 
                `ユーザー_${(newCommentData.user_id || '').substring(0, 5)}`,
          avatar: (profile ? profile.avatar_url : null) || '/placeholder-avatar.png'
        },
        replies: []
      };
      
      setCommentsState(prevComments => [formattedComment, ...prevComments]);
      
      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(commentsState.length + 1);
      }
    } catch (err: any) {
      console.error("コメント投稿エラー:", err);
      setError(err.message || "コメントの投稿に失敗しました");
    } finally {
      setSubmitting(false);
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
      
      // Prepare reply data
      const replyData = {
        post_id: postId,
        content: replyText,
        parent_id: parentId,
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
        postId,
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
      
      // Update comments state with the new reply
      const updatedComments = commentsState.map(comment => {
        if (comment.id === parentId) {
          const updatedReplies = comment.replies ? [...comment.replies, formattedReply] : [formattedReply];
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });
      
      setCommentsState(updatedComments);
      setReplyTo(null);
      setReplyContent("");
    } catch (err: any) {
      console.error("返信投稿エラー:", err);
      setError(err.message || "返信の投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    comments: commentsState,
    loading,
    error,
    replyTo,
    editContent,
    submitting,
    setReplyTo,
    setReplyContent,
    toggleLike,
    deleteComment,
    handleStartEditing,
    handleCancelEditing,
    handleSaveEdit,
    setEditContent,
    handleSubmitComment,
    handleSubmitReply
  };
}
