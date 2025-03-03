
import { supabase } from "@/integrations/supabase/client";

// 親コメントを取得する関数
export const fetchParentComments = async (postId: string) => {
  const { data: parentComments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      updated_at,
      user_id,
      likes_count,
      parent_id,
      guest_nickname,
      profiles(id, username, avatar_url)
    `)
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (commentsError) {
    console.error("親コメント取得エラー:", commentsError);
    return { parentComments: [], error: commentsError };
  }
  
  return { parentComments, error: null };
};

// 返信コメントを取得する関数
export const fetchReplies = async (postId: string, parentIds: string[]) => {
  // 親IDがない場合は空の配列を返す
  if (parentIds.length === 0) {
    return { allReplies: [], error: null };
  }
  
  const { data: allReplies, error: repliesError } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      updated_at,
      user_id,
      likes_count,
      parent_id,
      guest_nickname,
      profiles(id, username, avatar_url)
    `)
    .eq('post_id', postId)
    .in('parent_id', parentIds)
    .order('created_at', { ascending: true });
    
  if (repliesError) {
    console.error("返信取得エラー:", repliesError);
    return { allReplies: [], error: repliesError };
  }
  
  return { allReplies, error: null };
};

// 現在のセッションユーザーIDを取得する関数
export const getCurrentUserId = async (): Promise<string | undefined> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
};
