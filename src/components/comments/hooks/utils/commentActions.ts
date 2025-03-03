
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
    throw error;
  }

  return data;
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
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content: content,
      parent_id: parentId,
      guest_nickname: nickname
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Toggles like status for a comment
 */
export async function toggleCommentLike(commentId: string, userId: string, isLiked: boolean) {
  if (isLiked) {
    // いいねを削除
    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ 
        user_id: userId,
        comment_id: commentId 
      });

    if (error) throw error;
    return false;
  } else {
    // いいねを追加
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        comment_id: commentId
      });

    if (error) throw error;
    return true;
  }
}

/**
 * Deletes a comment
 */
export async function deleteCommentById(commentId: string, userId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Updates a comment's content
 */
export async function updateCommentContent(commentId: string, userId: string, newContent: string) {
  const { error } = await supabase
    .from('comments')
    .update({
      content: newContent,
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw error;
}
