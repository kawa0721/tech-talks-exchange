import { Post } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId, hasGuestId } from "@/utils/guestUtils";

// Formats post data from Supabase into our application's Post type
export async function formatPostData(post: any): Promise<Post> {
  let userData = {
    id: post.user_id || "unknown",
    name: "匿名ユーザー",
    avatar: `/placeholder-avatar.png` // デフォルトアバター画像を指定
  };

  // JOINを使わないシンプルなアプローチでプロフィール情報を取得
  if (post.user_id) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', post.user_id)
        .maybeSingle();

      if (profile) {
        // ユーザー名が設定されていない場合はユーザーIDの一部を表示
        const displayName = profile.username || `ユーザー_${post.user_id.substring(0, 5)}`;
        
        userData = {
          id: profile.id,
          name: displayName,
          avatar: profile.avatar_url || `/placeholder-avatar.png` // アバターがない場合はデフォルト
        };
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  // ユーザーがこの投稿をいいねしているか確認
  let userLiked = false;
  
  try {
    // ログインしているかチェック
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // ログインユーザーの場合はuser_idでチェック
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .maybeSingle();
        
      userLiked = !!likeData;
    } else if (hasGuestId()) {
      // 未ログインユーザーの場合はguest_idでチェック
      const guestId = getOrCreateGuestId();
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('guest_id', guestId)
        .eq('post_id', post.id)
        .maybeSingle();
        
      userLiked = !!likeData;
    }
  } catch (error) {
    console.error("Error checking like status:", error);
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
    likesCount: post.likes_count || 0, // null/undefinedの場合は0にする
    commentsCount: post.comments_count || 0, // null/undefinedの場合は0にする
    liked: userLiked, // ユーザーがいいねしているかの実際の状態
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
  
  // Build query - シンプルなSQLクエリだけを使用
  let query = supabase
    .from('posts')
    .select('id, title, content, user_id, channel_id, created_at, updated_at, likes_count, comments_count, images')
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
  
  // シンプルなSELECT文のみを使用
  let query = supabase
    .from('posts')
    .select('id, title, content, user_id, channel_id, created_at, updated_at, likes_count, comments_count, images');
    
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
      
      // ORステートメントを使って複雑な条件を構築する代わりに2つの条件を分けて適用
      // まず、いいね数が少ないものを選択
      if (lastLikesCount > 0) {
        query = query.lt('likes_count', lastLikesCount);
      } else {
        // いいね数が0の場合は、日時による絞り込みのみ
        query = query.lt('created_at', lastPostDate);
      }
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
