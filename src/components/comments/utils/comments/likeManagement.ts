
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId, hasGuestId } from "@/utils/guestUtils";

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
