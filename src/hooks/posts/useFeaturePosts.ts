import { useState, useCallback } from "react";
import { Post } from "@/types";
import { fetchSpecialPosts, formatPostsData } from "./fetchPostsUtils";
import { supabase } from "@/integrations/supabase/client";

interface UseFeaturePostsProps {
  selectedChannel?: string | null;
}

export function useFeaturePosts({ selectedChannel = null }: UseFeaturePostsProps = {}) {
  // 投稿データ状態
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  
  // ページネーション状態
  const [trendingHasMore, setTrendingHasMore] = useState(true);
  const [popularHasMore, setPopularHasMore] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState(false);
  
  // カーソル状態
  const [lastTrendingDate, setLastTrendingDate] = useState<string | undefined>(undefined);
  const [lastPopularInfo, setLastPopularInfo] = useState<{date?: string, likesCount?: number} | undefined>(undefined);
  
  const PER_PAGE = 10; // 1回に取得する件数

  // キャッシュをバイパスして最新のトレンド投稿を取得
  const fetchLatestTrendingPosts = useCallback(async () => {
    console.log('=== FETCH FRESH TRENDING POSTS START ===');
    setTrendingLoading(true);
    
    try {
      // 直接supabaseクエリを使用して最新データを直接取得
      let query = supabase
        .from('posts')
        .select(`
          id, title, content, user_id, channel_id, created_at, updated_at, 
          likes_count, comments_count, images
        `)
        .order('created_at', { ascending: false }); // トレンドは最新順
      
      // チャンネルフィルタリングがある場合は追加
      if (selectedChannel) {
        query = query.eq('channel_id', selectedChannel);
      }
      
      // 取得数制限
      query = query.limit(PER_PAGE);
      
      // 実行
      const { data: latestTrendingData, error } = await query;
      
      if (error) {
        console.error("最新トレンド取得エラー:", error);
        return;
      }
      
      if (!latestTrendingData || latestTrendingData.length === 0) {
        setTrendingPosts([]);
        return;
      }
      
      // 最新データをフォーマット
      const formattedLatestTrending = await formatPostsData(latestTrendingData);
      
      // 全てのキャッシュをバイパスして最新データをセット
      setTrendingPosts(formattedLatestTrending);
      
      // 最後の投稿日時を更新
      if (latestTrendingData.length > 0) {
        const lastPost = latestTrendingData[latestTrendingData.length - 1];
        setLastTrendingDate(lastPost.created_at);
      }
      
      // 次のページの有無をチェック
      setTrendingHasMore(latestTrendingData.length === PER_PAGE);
      
    } catch (error) {
      console.error("最新トレンド取得エラー:", error);
    } finally {
      setTrendingLoading(false);
      console.log('=== FETCH FRESH TRENDING POSTS END ===');
    }
  }, [PER_PAGE, selectedChannel]);

  // キャッシュをバイパスして最新の人気投稿を取得
  const fetchLatestPopularPosts = useCallback(async () => {
    console.log('=== FETCH FRESH POPULAR POSTS START ===');
    setPopularLoading(true);
    
    try {
      // 直接supabaseクエリを使用して最新データを直接取得
      let query = supabase
        .from('posts')
        .select(`
          id, title, content, user_id, channel_id, created_at, updated_at, 
          likes_count, comments_count, images
        `)
        .order('likes_count', { ascending: false }); // 人気投稿はいいね数順
      
      // チャンネルフィルタリングがある場合は追加
      if (selectedChannel) {
        query = query.eq('channel_id', selectedChannel);
      }
      
      // 取得数制限
      query = query.limit(PER_PAGE);
      
      // 実行
      const { data: latestPopularData, error } = await query;
      
      if (error) {
        console.error("最新人気投稿取得エラー:", error);
        return;
      }
      
      if (!latestPopularData || latestPopularData.length === 0) {
        setPopularPosts([]);
        return;
      }
      
      // 最新データをフォーマット
      const formattedLatestPopular = await formatPostsData(latestPopularData);
      
      // 全てのキャッシュをバイパスして最新データをセット
      setPopularPosts(formattedLatestPopular);
      
      // 最後の投稿情報を更新
      if (latestPopularData.length > 0) {
        const lastPost = latestPopularData[latestPopularData.length - 1];
        setLastPopularInfo({
          date: lastPost.created_at,
          likesCount: lastPost.likes_count
        });
      }
      
      // 次のページの有無をチェック
      setPopularHasMore(latestPopularData.length === PER_PAGE);
      
    } catch (error) {
      console.error("最新人気投稿取得エラー:", error);
    } finally {
      setPopularLoading(false);
      console.log('=== FETCH FRESH POPULAR POSTS END ===');
    }
  }, [PER_PAGE, selectedChannel]);

  // トレンド投稿の取得（ページネーション対応）- 最適化版
  const fetchTrendingPosts = async (reset = true, forceRefresh = false) => {
    // 強制リフレッシュの場合は完全にキャッシュをバイパスする方法を使用
    if (forceRefresh) {
      console.log('強制リフレッシュモード - キャッシュをバイパスして最新トレンドを取得');
      await fetchLatestTrendingPosts();
      return;
    }
    
    if (reset) {
      setTrendingLoading(true);
      setTrendingPosts([]);
      setTrendingHasMore(true);
      setLastTrendingDate(undefined);
    } else {
      // すでに全ての投稿を取得している場合は何もしない
      if (!trendingHasMore) {
        return;
      }
      setTrendingLoading(true);
    }
    
    try {
      // トレンド投稿を取得（カーソルベースのページネーション）
      const { data: trendingData, error: trendingError } = await fetchSpecialPosts(
        "trending", 
        PER_PAGE, 
        lastTrendingDate,
        undefined,
        selectedChannel
      );
      
      if (trendingError) {
        console.error("トレンド投稿取得エラー:", trendingError);
        return;
      }
      
      // 取得したデータがない場合
      if (!trendingData || trendingData.length === 0) {
        setTrendingHasMore(false);
        return;
      }
      
      // 次のページがあるかどうか
      setTrendingHasMore(trendingData.length === PER_PAGE);
      
      // バッチ処理で投稿データを整形
      const formattedTrendingPosts = await formatPostsData(trendingData);
      
      // 最後の投稿の日時を保存（次回のカーソルとして使用）
      if (trendingData.length > 0) {
        const lastPost = trendingData[trendingData.length - 1];
        setLastTrendingDate(lastPost.created_at);
      }
      
      // 状態を更新
      if (reset) {
        setTrendingPosts(formattedTrendingPosts);
      } else {
        // 重複を防ぐ
        const existingIds = new Set(trendingPosts.map(post => post.id));
        const uniqueNewPosts = formattedTrendingPosts.filter(post => !existingIds.has(post.id));
        
        setTrendingPosts(prev => [...prev, ...uniqueNewPosts]);
      }
      
    } catch (error) {
      console.error("トレンド投稿取得エラー:", error);
    } finally {
      setTrendingLoading(false);
    }
  };
  
  // 人気投稿の取得（ページネーション対応）- 最適化版
  const fetchPopularPosts = async (reset = true, forceRefresh = false) => {
    // 強制リフレッシュの場合は完全にキャッシュをバイパスする方法を使用
    if (forceRefresh) {
      console.log('強制リフレッシュモード - キャッシュをバイパスして最新の人気投稿を取得');
      await fetchLatestPopularPosts();
      return;
    }
    
    if (reset) {
      setPopularLoading(true);
      setPopularPosts([]);
      setPopularHasMore(true);
      setLastPopularInfo(undefined);
    } else {
      // すでに全ての投稿を取得している場合は何もしない
      if (!popularHasMore) {
        return;
      }
      setPopularLoading(true);
    }
    
    try {
      // 人気投稿を取得（カーソルベースのページネーション）
      const { data: popularData, error: popularError } = await fetchSpecialPosts(
        "popular", 
        PER_PAGE, 
        lastPopularInfo?.date,
        lastPopularInfo?.likesCount,
        selectedChannel
      );
      
      if (popularError) {
        console.error("人気投稿取得エラー:", popularError);
        return;
      }
      
      // 取得したデータがない場合
      if (!popularData || popularData.length === 0) {
        setPopularHasMore(false);
        return;
      }
      
      // 次のページがあるかどうか
      setPopularHasMore(popularData.length === PER_PAGE);
      
      // バッチ処理で投稿データを整形
      const formattedPopularPosts = await formatPostsData(popularData);
      
      // 最後の投稿の情報を保存（次回のカーソルとして使用）
      if (popularData.length > 0) {
        const lastPost = popularData[popularData.length - 1];
        setLastPopularInfo({
          date: lastPost.created_at,
          likesCount: lastPost.likes_count
        });
      }
      
      // 状態を更新
      if (reset) {
        setPopularPosts(formattedPopularPosts);
      } else {
        // 重複を防ぐ
        const existingIds = new Set(popularPosts.map(post => post.id));
        const uniqueNewPosts = formattedPopularPosts.filter(post => !existingIds.has(post.id));
        
        setPopularPosts(prev => [...prev, ...uniqueNewPosts]);
      }
      
    } catch (error) {
      console.error("人気投稿取得エラー:", error);
    } finally {
      setPopularLoading(false);
    }
  };

  // すべての特集投稿を取得（並列処理で高速化）
  const fetchFeaturePosts = async (forceRefresh = false) => {
    await Promise.all([
      fetchTrendingPosts(true, forceRefresh),
      fetchPopularPosts(true, forceRefresh)
    ]);
  };

  return {
    // 投稿データ
    trendingPosts,
    popularPosts,
    
    // ページネーション状態
    trendingHasMore,
    popularHasMore,
    trendingLoading,
    popularLoading,
    
    // 取得関数
    fetchTrendingPosts,
    fetchPopularPosts,
    fetchFeaturePosts,
    fetchLatestTrendingPosts,
    fetchLatestPopularPosts
  };
}
