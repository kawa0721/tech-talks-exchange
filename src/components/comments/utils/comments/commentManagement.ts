
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes a comment
 */
export async function deleteCommentById(commentId: string, userId: string, postId: string) {
  // セッションを再確認
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("セッションが期限切れです。再ログインしてください。");
  }
  
  try {
    // コメントを削除
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) {
      console.error("コメント削除エラー:", error);
      throw error;
    }
  } catch (error) {
    console.error("コメント削除エラー:", error);
    throw error;
  }
}

/**
 * Updates a comment's content
 */
export async function updateCommentContent(commentId: string, userId: string, newContent: string) {
  // セッションを再確認
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("セッションが期限切れです。再ログインしてください。");
  }

  try {
    const now = new Date().toISOString();
    
    // Fix the update operation type
    const updateData = {
      content: newContent,
      updated_at: now
    };
    
    // コメントを更新
    const { error } = await supabase
      .from('comments')
      .update(updateData)
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) {
      console.error("コメント更新エラー:", error);
      throw error;
    }
    
    return now;
  } catch (error) {
    console.error("コメント更新エラー:", error);
    throw error;
  }
}
