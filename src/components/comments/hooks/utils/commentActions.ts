
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Submits a new comment to the database
 */
export async function submitComment(
  postId: string,
  content: string,
  userId: string | null,
  nickname?: string
) {
  try {
    // セッションを再確認 (念のため、ログインユーザーの場合)
    if (userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("セッションが期限切れです。再ログインしてください。");
      }
    }

    // Prepare comment data based on user status
    const commentData = {
      post_id: postId,
      content: content,
      // For anonymous users, set user_id to null and use nickname
      user_id: userId || null,
      guest_nickname: !userId ? (nickname || "ゲスト") : null
    };

    // 重要な修正: まず挿入操作だけを行う
    const { error: insertError } = await supabase
      .from('comments')
      .insert([commentData]);

    if (insertError) {
      console.error("コメント投稿DB エラー:", insertError);
      throw insertError;
    }

    // 次に、新しいコメントを別途取得
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
 * Submits a reply to a comment
 */
export async function submitReply(
  postId: string,
  parentId: string,
  content: string,
  userId: string | null,
  nickname?: string
) {
  try {
    // セッションを再確認 (念のため、ログインユーザーの場合)
    if (userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("セッションが期限切れです。再ログインしてください。");
      }
    }
    
    // Prepare reply data based on user status
    const replyData = {
      post_id: postId,
      content: content,
      parent_id: parentId,
      // For anonymous users, set user_id to null and use nickname
      user_id: userId || null,
      guest_nickname: !userId ? (nickname || "返信") : null
    };
    
    // 重要な修正: まず挿入操作だけを行う
    const { error: insertError } = await supabase
      .from('comments')
      .insert([replyData]);

    if (insertError) {
      console.error("返信投稿エラー:", insertError);
      throw insertError;
    }

    // 次に、新しい返信を別途取得
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
 * Toggles like status for a comment
 */
export async function toggleCommentLike(commentId: string, userId: string, isLiked: boolean) {
  // セッションを再確認
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("セッションが期限切れです。再ログインしてください。");
  }
  
  try {
    if (isLiked) {
      // いいねを削除
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('comment_id', commentId);

      if (error) {
        console.error("いいね削除エラー:", error);
        throw error;
      }
      
      return false;
    } else {
      // いいねを追加 - fix the array syntax
      const { error } = await supabase
        .from('likes')
        .insert([{
          user_id: userId,
          comment_id: commentId
        }]);

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
