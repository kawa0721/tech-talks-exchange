
import { supabase } from "@/integrations/supabase/client";

// 親コメントを取得する関数
export const fetchParentComments = async (postId: string) => {
  console.log('Fetching parent comments for post:', postId);
  
  try {
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
    
    console.log(`Fetched ${parentComments?.length || 0} parent comments with profiles:`, parentComments);
    return { parentComments, error: null };
  } catch (error) {
    console.error("親コメント取得で例外が発生:", error);
    return { parentComments: [], error };
  }
};

// 返信コメントを取得する関数
export const fetchReplies = async (postId: string, parentIds: string[]) => {
  console.log('Fetching replies for post:', postId, 'parent IDs:', parentIds);
  
  // 親IDがない場合は空の配列を返す
  if (parentIds.length === 0) {
    console.log('No parent IDs provided, returning empty array');
    return { allReplies: [], error: null };
  }
  
  try {
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
    
    console.log(`Fetched ${allReplies?.length || 0} replies with profiles:`, allReplies);
    return { allReplies, error: null };
  } catch (error) {
    console.error("返信取得で例外が発生:", error);
    return { allReplies: [], error };
  }
};
};

// 現在のセッションユーザーIDを取得する関数
export const getCurrentUserId = async (): Promise<string | undefined> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
};
