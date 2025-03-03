
import { Comment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Finds a comment or reply by ID and updates it with the provided update function
 */
export function findAndUpdateComment(
  comments: Comment[],
  commentId: string,
  updateFn: (comment: Comment) => Comment
): Comment[] {
  return comments.map(comment => {
    // If this is the target comment, update it
    if (comment.id === commentId) {
      return updateFn(comment);
    }
    
    // Check if the target is in the replies
    if (comment.replies && comment.replies.length > 0) {
      const updatedReplies = comment.replies.map(reply => {
        if (reply.id === commentId) {
          return updateFn(reply);
        }
        return reply;
      });
      
      return { ...comment, replies: updatedReplies };
    }
    
    // Return the comment unchanged
    return comment;
  });
}

/**
 * Recursively finds a comment by ID in the comments tree
 */
export function findCommentInTree(
  comments: Comment[],
  commentId: string
): Comment | undefined {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    
    if (comment.replies) {
      const foundInReplies = comment.replies.find(reply => reply.id === commentId);
      if (foundInReplies) return foundInReplies;
    }
  }
  
  return undefined;
}

/**
 * Maps a newly created comment with user profile information
 */
export async function mapCommentWithUserInfo(
  commentData: any,
  postId: string,
  currentUserId?: string | null
): Promise<Comment> {
  let userProfile = null;
  
  // If the comment was made by a logged-in user, fetch their profile
  if (commentData.user_id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', commentData.user_id)
      .single();
      
    userProfile = profileData;
  }
  
  // Create and return the formatted comment object
  return {
    id: commentData.id,
    postId,
    userId: commentData.user_id || 'guest',
    content: commentData.content,
    createdAt: new Date(commentData.created_at),
    updatedAt: commentData.updated_at ? new Date(commentData.updated_at) : undefined,
    likesCount: commentData.likes_count || 0,
    liked: false, // New comments are not liked by default
    guestNickname: commentData.guest_nickname,
    user: {
      id: commentData.user_id || 'guest',
      name: userProfile?.username || commentData.guest_nickname || "匿名ユーザー",
      avatar: userProfile?.avatar_url || '/placeholder-avatar.png'
    },
    replies: [] // New comments have no replies initially
  };
}

/**
 * Maps a newly created reply with user profile information
 */
export async function mapReplyWithUserInfo(
  replyData: any,
  postId: string,
  parentId: string,
  currentUserId?: string | null
): Promise<Comment> {
  let userProfile = null;
  
  // If the reply was made by a logged-in user, fetch their profile
  if (replyData.user_id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', replyData.user_id)
      .single();
      
    userProfile = profileData;
  }
  
  // Create and return the formatted reply object
  return {
    id: replyData.id,
    postId,
    parentId,
    userId: replyData.user_id || 'guest',
    content: replyData.content,
    createdAt: new Date(replyData.created_at),
    updatedAt: replyData.updated_at ? new Date(replyData.updated_at) : undefined,
    likesCount: replyData.likes_count || 0,
    liked: false, // New replies are not liked by default
    guestNickname: replyData.guest_nickname,
    user: {
      id: replyData.user_id || 'guest',
      name: userProfile?.username || replyData.guest_nickname || "匿名ユーザー",
      avatar: userProfile?.avatar_url || '/placeholder-avatar.png'
    }
  };
}
