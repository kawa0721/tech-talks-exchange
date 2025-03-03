
import { Comment } from "@/types";
import { fetchUserProfile, checkCommentLikeStatus, fetchCommentReplies } from "./commentFetcher";
import { supabase } from "@/integrations/supabase/client";

/**
 * Maps a database comment to our Comment type with user info
 */
export async function mapCommentWithUserInfo(comment: any, postId: string, currentUserId?: string) {
  // Map the user info
  let userInfo = {
    id: comment.user_id || 'guest',
    name: comment.guest_nickname || "ゲスト",
    avatar: undefined
  };

  // Always try to fetch the profile, regardless of login status
  if (comment.user_id) {
    userInfo = await fetchUserProfile(comment.user_id);
  } 
  
  // ゲストニックネームがある場合は、取得したユーザー情報よりも優先する
  if (comment.guest_nickname) {
    userInfo.name = comment.guest_nickname;
  }

  // Check if the current user has liked this comment
  let liked = false;
  if (currentUserId) {
    liked = await checkCommentLikeStatus(comment.id, currentUserId);
  }

  // Fetch and map any replies
  const replies = [];
  if (!comment.parent_id) { // Only fetch replies for parent comments
    const replyData = await fetchCommentReplies(postId, comment.id);
    
    if (replyData && replyData.length > 0) {
      for (const reply of replyData) {
        const mappedReply = await mapReplyWithUserInfo(reply, postId, comment.id, currentUserId);
        replies.push(mappedReply);
      }
    }
  }

  // Create the final comment object
  return {
    id: comment.id,
    postId,
    userId: comment.user_id,
    user: userInfo,
    content: comment.content,
    createdAt: new Date(comment.created_at),
    updatedAt: comment.updated_at ? new Date(comment.updated_at) : undefined,
    likesCount: comment.likes_count,
    liked: liked,
    replies: replies,
    guestNickname: comment.guest_nickname
  };
}

/**
 * Maps a database reply to our Comment type with user info
 */
export async function mapReplyWithUserInfo(reply: any, postId: string, parentId: string, currentUserId?: string) {
  let replyUserInfo = {
    id: reply.user_id || 'guest',
    name: reply.guest_nickname || "ゲスト",
    avatar: undefined
  };

  // Always try to fetch the profile, regardless of login status
  if (reply.user_id) {
    replyUserInfo = await fetchUserProfile(reply.user_id);
  }
  
  // ゲストニックネームがある場合は、取得したユーザー情報よりも優先する
  if (reply.guest_nickname) {
    replyUserInfo.name = reply.guest_nickname;
  }

  // Check if the current user has liked this reply
  let replyLiked = false;
  if (currentUserId) {
    replyLiked = await checkCommentLikeStatus(reply.id, currentUserId);
  }

  // Create the final reply object
  return {
    id: reply.id,
    postId,
    userId: reply.user_id,
    parentId,
    user: replyUserInfo,
    content: reply.content,
    createdAt: new Date(reply.created_at),
    updatedAt: reply.updated_at ? new Date(reply.updated_at) : undefined,
    likesCount: reply.likes_count,
    liked: replyLiked,
    guestNickname: reply.guest_nickname
  };
}

/**
 * Gets the current user information if logged in
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
