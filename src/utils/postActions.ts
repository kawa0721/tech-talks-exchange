
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Deletes a post by ID
 */
export async function deletePost(postId: string) {
  try {
    // セッションを再確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("セッションが期限切れです。再ログインしてください。");
    }

    // 投稿を削除
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', session.user.id); // 所有者確認

    if (error) {
      console.error("投稿削除エラー:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("投稿削除処理エラー:", error);
    throw error;
  }
}

/**
 * Updates a post's content
 */
export async function updatePost(postId: string, updateData: {
  title?: string;
  content?: string;
  channel_id?: string;
  images?: string[];
}) {
  try {
    // セッションを再確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("セッションが期限切れです。再ログインしてください。");
    }

    // 現在時刻を追加
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    // 投稿を更新
    const { error } = await supabase
      .from('posts')
      .update(dataToUpdate)
      .eq('id', postId)
      .eq('user_id', session.user.id); // 所有者確認

    if (error) {
      console.error("投稿更新エラー:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("投稿更新処理エラー:", error);
    throw error;
  }
}
