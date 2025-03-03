
import { supabase } from "@/integrations/supabase/client";

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
