
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
  // セッションを再確認 (念のため、ログインユーザーの場合)
  if (userId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("セッションが期限切れです。再ログインしてください。");
    }
  }

  try {
    // コメントをデータベースに追加
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: content,
        guest_nickname: nickname || null
      })
      .select()
      .single();

    if (error) {
      console.error("コメント投稿DB エラー:", error);
      throw error;
    }

    // 投稿のコメント数を増やす
    await supabase.rpc('increment_comments_count', { post_id_param: postId });
    
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
  // セッションを再確認 (念のため、ログインユーザーの場合)
  if (userId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("セッションが期限切れです。再ログインしてください。");
    }
  }
  
  try {
    // 返信をデータベースに追加
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: content,
        parent_id: parentId,
        guest_nickname: nickname || null
      })
      .select()
      .single();

    if (error) {
      console.error("返信投稿エラー:", error);
      throw error;
    }

    // 投稿のコメント数を増やす
    await supabase.rpc('increment_comments_count', { post_id_param: postId });
    
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
        .match({ 
          user_id: userId,
          comment_id: commentId 
        });

      if (error) {
        console.error("いいね削除エラー:", error);
        throw error;
      }
      
      // コメントのいいね数を減らす
      await supabase.rpc('decrement_comment_likes_count', { comment_id_param: commentId });
      
      return false;
    } else {
      // いいねを追加
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: userId,
          comment_id: commentId
        });

      if (error) {
        console.error("いいね追加エラー:", error);
        throw error;
      }
      
      // コメントのいいね数を増やす
      await supabase.rpc('increment_comment_likes_count', { comment_id_param: commentId });
      
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
    
    // 投稿のコメント数を減らす
    await supabase.rpc('decrement_comments_count', { post_id_param: postId });
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
    
    // コメントを更新
    const { error } = await supabase
      .from('comments')
      .update({
        content: newContent,
        updated_at: now
      })
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
