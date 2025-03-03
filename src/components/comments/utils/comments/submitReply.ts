
import { supabase } from "@/integrations/supabase/client";

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
