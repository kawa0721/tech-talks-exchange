
import { supabase } from "@/integrations/supabase/client";

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
