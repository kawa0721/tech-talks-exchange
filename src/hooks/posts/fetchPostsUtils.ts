import { Post } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId, hasGuestId } from "@/utils/guestUtils";

// 投稿データをバッチ処理で効率的に整形する
export async function formatPostsData(postsData: any[]): Promise<Post[]> {
  if (!postsData || postsData.length === 0) {
    return [];
  }
  
  // ユーザーIDのリストを抽出（nullでないものだけ）
  const userIds = postsData
    .map(post => post.user_id)
    .filter(id => id !== null && id !== undefined);
  
  // 投稿IDのリスト
  const postIds = postsData.map(post => post.id);
  
  // 1. プロフィール情報をバッチで一度に取得
  let profilesMap: Record<string, any> = {};
  if (userIds.length > 0) {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      // プロフィール情報をマップ化
      if (profiles) {
        profilesMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  }
  
  // 2. いいね状態をバッチで一度に取得
  const likesMap = await checkUserLikesForPosts(postIds);
  
  // 3. 投稿データを整形
  return postsData.map(post => {
    // ユーザー情報の設定
    let userData = {
      id: post.user_id || "unknown",
      name: post.user_id ? "ユーザー" : "匿名ユーザー",
      avatar: `/placeholder-avatar.png`
    };
    
    // プロフィール情報があれば適用
    if (post.user_id && profilesMap[post.user_id]) {
      const profile = profilesMap[post.user_id];
      userData = {
        id: profile.id,
        name: profile.username || `ユーザー_${post.user_id.substring(0, 5)}`,
        avatar: profile.avatar_url || `/placeholder-avatar.png`
      };
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
      likesCount: post.likes_count || 0,
      commentsCount: post.comments_count || 0,
      liked: likesMap[post.id] || false,
      images: post.images || []
    };
  });
}

// 複数の投稿に対するいいね状態を一度に取得
export async function checkUserLikesForPosts(postIds: string[]) {
  if (!postIds || postIds.length === 0) {
    return {};
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  let likesData = [];
  
  try {
    if (user) {
      // ログインユーザーの場合は複数の投稿のいいね状態を一度に取得
      const { data } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);
        
      likesData = data || [];
    } else if (hasGuestId()) {
      // ゲストの場合も複数の投稿のいいね状態を一度に取得
      const guestId = getOrCreateGuestId();
      const { data } = await supabase
        .from('likes')
        .select('post_id')
        .eq('guest_id', guestId)
        .in('post_id', postIds);
        
      likesData = data || [];
    }
  } catch (error) {
    console.error("Error checking likes status:", error);
  }
  
  // 各投稿のいいね状態をマップで返す
  const likeMap: Record<string, boolean> = {};
  if (likesData && likesData.length > 0) {
    likesData.forEach((like: any) => {
      likeMap[like.post_id] = true;
    });
  }
  
  return likeMap;
}

// 従来の単一投稿フォーマット関数はレガシーサポート用に残す
export async function formatPostData(post: any): Promise<Post> {
  const formattedPosts = await formatPostsData([post]);
  return formattedPosts[0];
}

// Fetch posts with pagination - 最適化版
export async function fetchPaginatedPosts(
  selectedChannel: string | null,
  perPage: number,
  lastPostDate?: string
) {
  console.log(`[fetchPaginatedPosts] perPage: ${perPage}, lastPostDate: ${lastPostDate || 'none'}`);
  
  // クエリを構築 - プロフィール情報も一緒に取得
  let query = supabase
    .from('posts')
    .select(`
      id, title, content, user_id, channel_id, created_at, updated_at, 
      likes_count, comments_count, images
    `)
    .order('created_at', { ascending: false });

  // チャンネルによるフィルタリング
  if (selectedChannel) {
    console.log(`[fetchPaginatedPosts] Filtering by channel: ${selectedChannel}`);
    query = query.eq('channel_id', selectedChannel);
  }

  // カーソルベースのページネーション
  if (lastPostDate) {
    console.log(`[fetchPaginatedPosts] Using cursor: posts older than ${lastPostDate}`);
    query = query.lt('created_at', lastPostDate);
  }

  // 取得する件数を制限
  query = query.limit(perPage);
  
  // クエリを実行
  const result = await query;
  
  // 結果をログ
  console.log(`[fetchPaginatedPosts] Query returned ${result.data?.length || 0} posts`);
  
  return result;
}

// 特殊投稿（トレンドまたは人気）の取得 - 最適化版
export async function fetchSpecialPosts(
  type: "trending" | "popular",
  perPage: number = 10,
  lastPostDate?: string,
  lastLikesCount?: number,
  selectedChannel: string | null = null
) {
  console.log(`[fetchSpecialPosts] type: ${type}, perPage: ${perPage}, channel: ${selectedChannel || 'all'}, cursor: ${lastPostDate || lastLikesCount || 'none'}`);
  
  // クエリを構築
  let query = supabase
    .from('posts')
    .select(`
      id, title, content, user_id, channel_id, created_at, updated_at, 
      likes_count, comments_count, images
    `);
    
  // チャンネルによるフィルタリング
  if (selectedChannel) {
    query = query.eq('channel_id', selectedChannel);
  }
  
  if (type === "trending") {
    // トレンド投稿は作成日時で並べ替え（最新順）
    query = query.order('created_at', { ascending: false });
    
    // カーソルベースのページネーション
    if (lastPostDate) {
      query = query.lt('created_at', lastPostDate);
    }
  } else {
    // 人気投稿はいいね数で並べ替え（多い順）
    query = query.order('likes_count', { ascending: false });
    
    // カーソルベースのページネーション（いいね数+日時）
    if (lastLikesCount !== undefined && lastPostDate) {
      // いいね数が少ないものまたは同じいいね数で古いものを選択
      query = query.or(`likes_count.lt.${lastLikesCount},and(likes_count.eq.${lastLikesCount},created_at.lt.${lastPostDate})`);
    }
  }
  
  // 取得する件数を制限
  query = query.limit(perPage);
  
  // クエリを実行
  const result = await query;
  
  // 結果をログ
  console.log(`[fetchSpecialPosts] ${type} query returned ${result.data?.length || 0} posts`);
  
  return result;
}
