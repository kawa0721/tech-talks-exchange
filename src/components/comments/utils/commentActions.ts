import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId, hasGuestId } from "@/utils/guestUtils";

/**
 * Submit a new comment to a post
 */
export async function submitComment(
  postId: string,
  content: string,
  userId: string | null,
  nickname?: string
) {
  try {
    // Prepare comment data based on user status
    const commentData = {
      post_id: postId,
      content: content,
      // For anonymous users, set user_id to null and use nickname
      user_id: userId || null,
      guest_nickname: !userId ? (nickname || "匿名") : null
    };
    
    // Insert the comment
    const { error: insertError } = await supabase
      .from('comments')
      .insert([commentData]);

    if (insertError) {
      console.error("コメント投稿エラー:", insertError);
      throw insertError;
    }

    // Fetch the newly created comment
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId || null)
      .eq('content', content)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      console.error("コメント取得エラー:", fetchError);
      throw fetchError;
    }

    return data;
  } catch (error) {
    console.error("コメント投稿エラー:", error);
    throw error;
  }
}

/**
 * Submit a reply to a comment
 */
export async function submitReply(
  postId: string,
  parentId: string,
  content: string,
  userId: string | null,
  nickname?: string
) {
  try {
    // Prepare reply data based on user status
    const replyData = {
      post_id: postId,
      content: content,
      parent_id: parentId,
      // For anonymous users, set user_id to null and use nickname
      user_id: userId || null,
      guest_nickname: !userId ? (nickname || "返信") : null
    };
    
    // Insert the reply
    const { error: insertError } = await supabase
      .from('comments')
      .insert([replyData]);

    if (insertError) {
      console.error("返信投稿エラー:", insertError);
      throw insertError;
    }

    // Fetch the newly created reply
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('parent_id', parentId)
      .eq('user_id', userId || null)
      .eq('content', content)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      console.error("返信取得エラー:", fetchError);
      throw fetchError;
    }
    
    return data;
  } catch (error) {
    console.error("返信投稿エラー:", error);
    throw error;
  }
}

/**
 * Toggle like status for a comment (for both logged-in and anonymous users)
 */
export async function toggleCommentLike(commentId: string, userId: string | null, isLiked: boolean) {
  try {
    if (isLiked) {
      // いいねを削除
      let query = supabase
        .from('likes')
        .delete();
        
      if (userId) {
        // ログインユーザーの場合
        query = query.match({ user_id: userId, comment_id: commentId });
      } else {
        // 未ログインユーザーの場合
        const guestId = getOrCreateGuestId();
        query = query.match({ guest_id: guestId, comment_id: commentId });
      }
      
      const { error } = await query;
      
      if (error) {
        console.error("いいね削除エラー:", error);
        throw error;
      }
      
      return false;
    } else {
      // いいねを追加
      let likeData = {};
      
      if (userId) {
        // ログインユーザーの場合
        likeData = { user_id: userId, comment_id: commentId };
      } else {
        // 未ログインユーザーの場合
        const guestId = getOrCreateGuestId();
        likeData = { guest_id: guestId, comment_id: commentId };
      }
      
      const { error } = await supabase
        .from('likes')
        .insert([likeData]);
        
      if (error) {
        console.error("いいね追加エラー:", error);
        throw error;
      }
      
      return true;
    }
  } catch (error) {
    console.error("いいね処理エラー:", error);
    throw error;
  }
}

/**
 * Check if a user has liked a comment
 */
export async function checkCommentLikeStatus(commentId: string) {
  try {
    // ログインチェック
    const { data: { user } } = await supabase.auth.getUser();
    
    // いいね状態を確認
    let isLiked = false;
    
    if (user) {
      // ログインユーザーの場合
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .match({ user_id: user.id, comment_id: commentId })
        .maybeSingle();
        
      isLiked = !!likeData;
    } else if (hasGuestId()) {
      // 未ログインユーザーの場合
      const guestId = getOrCreateGuestId();
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .match({ guest_id: guestId, comment_id: commentId })
        .maybeSingle();
        
      isLiked = !!likeData;
    }
    
    return isLiked;
  } catch (error) {
    console.error("いいね状態確認エラー:", error);
    return false;
  }
}

/**
 * Get comments count for a post
 */
export async function getCommentsCount(postId: string) {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
      
    if (error) {
      console.error("コメント数取得エラー:", error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("コメント数取得エラー:", error);
    return 0;
  }
}

/**
 * Get likes count for a comment
 */
export async function getCommentLikesCount(commentId: string) {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('comment_id', commentId);
      
    if (error) {
      console.error("いいね数取得エラー:", error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("いいね数取得エラー:", error);
    return 0;
  }
}
