
import { Comment } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getPublicUserProfile } from "@/lib/data/userProfile";

/**
 * Fetches user profile information from Supabase
 * RLSポリシー対応版 - 未ログインでもプロフィール情報を取得できる
 */
export async function fetchUserProfile(userId: string) {
  try {
    // RLSポリシーで保護されたgetPublicUserProfileを使用
    const userData = await getPublicUserProfile(userId);
    
    if (!userData) {
      console.log("User profile not found:", userId);
      return {
        id: userId,
        name: `ユーザー_${userId.substring(0, 5)}`,
        avatar: undefined
      };
    }
    
    // 取得したプロフィール情報を返す
    return {
      id: userData.id,
      name: userData.name,
      avatar: userData.avatar
    };
  } catch (error) {
    console.error("ユーザープロファイル取得エラー:", error);
    return {
      id: userId,
      name: `ユーザー_${userId.substring(0, 5)}`,
      avatar: undefined
    };
  }
}

/**
 * Checks if a comment is liked by the current user
 */
export async function checkCommentLikeStatus(commentId: string, userId?: string) {
  if (!userId) return false;
  
  const { data: likeData } = await supabase
    .from('likes')
    .select('id')
    .match({ 
      user_id: userId,
      comment_id: commentId 
    })
    .maybeSingle();
    
  return !!likeData;
}

/**
 * Fetches replies for a parent comment
 */
export async function fetchCommentReplies(postId: string, parentId: string) {
  const { data: replies, error: repliesError } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      updated_at,
      user_id,
      likes_count,
      guest_nickname
    `)
    .eq('post_id', postId)
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true });

  if (repliesError) {
    console.error("返信取得エラー:", repliesError);
    return [];
  }

  return replies;
}

/**
 * Fetches parent comments for a post
 */
export async function fetchParentComments(postId: string) {
  const { data: parentComments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      updated_at,
      user_id,
      likes_count,
      parent_id,
      guest_nickname
    `)
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (commentsError) {
    throw commentsError;
  }

  return parentComments;
}
