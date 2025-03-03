import { Comment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches user profile information from Supabase
 * ログインステータスに関わらずプロフィール情報を取得できるように修正
 */
export async function fetchUserProfile(userId: string) {
  try {
    // まずプロファイル情報を取得
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      // プロファイルが見つからない場合はデフォルト値を返す
      console.log("User profile not found:", userId);
      return {
        id: userId,
        name: "ユーザー",
        avatar: undefined
      };
    }

    // ユーザー名が設定されていない場合はユーザーIDの一部を表示
    const displayName = userData.username || `ユーザー_${userId.substring(0, 5)}`;
    
    // プロファイルが存在する場合
    return {
      id: userData.id,
      name: displayName,
      avatar: userData.avatar_url
    };
  } catch (error) {
    console.error("ユーザープロファイル取得エラー:", error);
    return {
      id: userId,
      name: "ユーザー",
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
