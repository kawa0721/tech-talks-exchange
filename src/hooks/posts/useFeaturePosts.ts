
import { useState } from "react";
import { Post } from "@/types";
import { fetchSpecialPosts, formatPostData } from "./fetchPostsUtils";

export function useFeaturePosts() {
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

  // トレンド投稿の取得（ページネーション対応）
  const fetchTrendingPosts = async (reset = true) => {
    console.log(`Fetching trending posts, reset=${reset}, current count=${trendingPosts.length}`);
    
    if (reset) {
      setTrendingLoading(true);
      setTrendingPosts([]);
      setTrendingHasMore(true);
      setLastTrendingDate(undefined);
    } else {
      // すでに全ての投稿を取得している場合は何もしない
      if (!trendingHasMore) {
        console.log('No more trending posts to fetch');
        return;
      }
      setTrendingLoading(true);
    }
    
    try {
      // トレンド投稿を取得（カーソルベースのページネーション）
      const { data: trendingData, error: trendingError } = await fetchSpecialPosts(
        "trending", 
        PER_PAGE, 
        lastTrendingDate
      );
      
      if (trendingError) {
        console.error("トレンド投稿取得エラー:", trendingError);
        return;
      }
      
      // 取得したデータがない場合
      if (!trendingData || trendingData.length === 0) {
        console.log('No trending posts returned');
        setTrendingHasMore(false);
        setTrendingLoading(false);
        return;
      }
      
      // 次のページがあるかどうか
      setTrendingHasMore(trendingData.length === PER_PAGE);
      
      // フォーマットして投稿データを整形
      const formattedTrendingPosts = await Promise.all(
        trendingData.map(formatPostData)
      );
      
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
  
  // 人気投稿の取得（ページネーション対応）
  const fetchPopularPosts = async (reset = true) => {
    console.log(`Fetching popular posts, reset=${reset}, current count=${popularPosts.length}`);
    
    if (reset) {
      setPopularLoading(true);
      setPopularPosts([]);
      setPopularHasMore(true);
      setLastPopularInfo(undefined);
    } else {
      // すでに全ての投稿を取得している場合は何もしない
      if (!popularHasMore) {
        console.log('No more popular posts to fetch');
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
        lastPopularInfo?.likesCount
      );
      
      if (popularError) {
        console.error("人気投稿取得エラー:", popularError);
        return;
      }
      
      // 取得したデータがない場合
      if (!popularData || popularData.length === 0) {
        console.log('No popular posts returned');
        setPopularHasMore(false);
        setPopularLoading(false);
        return;
      }
      
      // 次のページがあるかどうか
      setPopularHasMore(popularData.length === PER_PAGE);
      
      // フォーマットして投稿データを整形
      const formattedPopularPosts = await Promise.all(
        popularData.map(formatPostData)
      );
      
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

  // すべての特集投稿を取得（後方互換性のため）
  const fetchFeaturePosts = async () => {
    console.log('Fetching all feature posts');
    await Promise.all([
      fetchTrendingPosts(true),
      fetchPopularPosts(true)
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
    fetchFeaturePosts
  };
}
