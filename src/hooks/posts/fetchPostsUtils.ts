import { Post } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Formats post data from Supabase into our application's Post type
export async function formatPostData(post: any): Promise<Post> {
  let userData = {
    id: post.user_id || "unknown",
    name: "匿名ユーザー",
    avatar: undefined
  };

  if (post.user_id) {
    // ユーザープロファイルを取得 - ログインステータスに関わらず情報を表示
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', post.user_id)
      .maybeSingle();

    if (!profileError && profile) {
      // ユーザー名が設定されていない場合はユーザーIDの一部を表示
      const displayName = profile.username || `ユーザー_${post.user_id.substring(0, 5)}`;
      
      userData = {
        id: profile.id,
        name: displayName,
        avatar: profile.avatar_url
      };
    } else {
      console.log("Profile not found for user:", post.user_id);
    }
  }

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    userId: post.user_id || "unknown",
    user: userData,
    channelId: post.channel_id,
    createdAt: new Date(post.created_at),
    updatedAt: post.updated_at ? new Date(post.updated_at) : undefined,
    likesCount: post.likes_count,
    commentsCount: post.comments_count,
    liked: false,
    images: post.images || []
  };
}

// Fetch posts with pagination - カーソルベースのページネーション
export async function fetchPaginatedPosts(
  selectedChannel: string | null,
  perPage: number,
  lastPostDate?: string
) {
  console.log(`[fetchPaginatedPosts] perPage: ${perPage}, lastPostDate: ${lastPostDate || 'none'}`);
  
  // Build query
  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Filter by channel if selected
  if (selectedChannel) {
    console.log(`[fetchPaginatedPosts] Filtering by channel: ${selectedChannel}`);
    console.log(`[fetchPaginatedPosts] Channel type: ${typeof selectedChannel}`);
    query = query.eq('channel_id', selectedChannel);
  } else {
    console.log(`[fetchPaginatedPosts] No channel filter applied`);
  }

  // カーソルベースのページネーション - 最後の投稿の日時より古いものを取得
  if (lastPostDate) {
    console.log(`[fetchPaginatedPosts] Using cursor: posts older than ${lastPostDate}`);
    query = query.lt('created_at', lastPostDate);
  } else {
    console.log('[fetchPaginatedPosts] First page, no cursor used');
  }

  // 取得する件数を制限
  query = query.limit(perPage);

  // Debug: Print full SQL query if possible
  console.log('[fetchPaginatedPosts] Executing query...');
  
  // Execute query
  const result = await query;
  
  // Log results for debugging
  console.log(`[fetchPaginatedPosts] Query returned ${result.data?.length || 0} posts`);
  if (result.data && result.data.length > 0) {
    console.log('[fetchPaginatedPosts] First post:', { 
      id: result.data[0].id,
      title: result.data[0].title.substring(0, 30), 
      created_at: result.data[0].created_at 
    });
    console.log('[fetchPaginatedPosts] Last post:', { 
      id: result.data[result.data.length-1].id,
      title: result.data[result.data.length-1].title.substring(0, 30), 
      created_at: result.data[result.data.length-1].created_at 
    });
  }
  
  if (result.error) {
    console.error(`[fetchPaginatedPosts] Query error:`, result.error);
  }
  
  return result;
}

// Fetch special posts (trending or popular) with pagination support
export async function fetchSpecialPosts(
  type: "trending" | "popular",
  perPage: number = 10,
  lastPostDate?: string,
  lastLikesCount?: number,
  selectedChannel: string | null = null
) {
  console.log(`[fetchSpecialPosts] type: ${type}, perPage: ${perPage}, channel: ${selectedChannel || 'all'}, cursor: ${lastPostDate || lastLikesCount || 'none'}`);
  
  let query = supabase
    .from('posts')
    .select('*');
    
  // Filter by channel if selected
  if (selectedChannel) {
    console.log(`[fetchSpecialPosts] Filtering by channel: ${selectedChannel}`);
    query = query.eq('channel_id', selectedChannel);
  }
  
  if (type === "trending") {
    // For trending, sort by created_at (newest first)
    query = query.order('created_at', { ascending: false });
    
    // カーソルベースのページネーション
    if (lastPostDate) {
      console.log(`[fetchSpecialPosts] Using trending cursor: posts older than ${lastPostDate}`);
      query = query.lt('created_at', lastPostDate);
    }
  } else {
    // For popular, sort by likes_count (highest first)
    query = query.order('likes_count', { ascending: false });
    
    // カーソルベースのページネーション (likes_count + created_at for tiebreaker)
    if (lastLikesCount !== undefined && lastPostDate) {
      console.log(`[fetchSpecialPosts] Using popular cursor: posts with likes less than ${lastLikesCount} or same likes but older`);
      query = query.or(`likes_count.lt.${lastLikesCount},and(likes_count.eq.${lastLikesCount},created_at.lt.${lastPostDate})`);
    }
  }
  
  // 取得する件数を制限
  query = query.limit(perPage);
  
  // Execute query
  const result = await query;
  
  // Log results
  console.log(`[fetchSpecialPosts] ${type} query returned ${result.data?.length || 0} posts`);
  if (result.error) {
    console.error(`[fetchSpecialPosts] Query error:`, result.error);
  }
  
  return result;
}
