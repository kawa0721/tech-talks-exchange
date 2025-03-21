import { useState, useEffect, useCallback } from "react";
import { Post } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { fetchPaginatedPosts, formatPostsData } from "./fetchPostsUtils";
import { useFeaturePosts } from "./useFeaturePosts";
import { supabase } from "@/integrations/supabase/client";

interface UsePostsWithPaginationProps {
  selectedChannel: string | null;
  perPage?: number;
}

export function usePostsWithPagination({ 
  selectedChannel, 
  perPage = 10 
}: UsePostsWithPaginationProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastPostDate, setLastPostDate] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  // 特集投稿フックを使用
  const { 
    trendingPosts, 
    popularPosts, 
    fetchFeaturePosts 
  } = useFeaturePosts();

  // 完全に新しいデータを取得する関数（キャッシュをバイパス）
  const fetchLatestPosts = useCallback(async () => {
    console.log('=== FETCH FRESH POSTS START ===');
    setLoading(true);
    
    try {
      // 直接supabaseクエリを使用して最新データを直接取得
      let query = supabase
        .from('posts')
        .select(`
          id, title, content, user_id, channel_id, created_at, updated_at, 
          likes_count, comments_count, images
        `)
        .order('created_at', { ascending: false });
      
      // チャンネルフィルタリングがある場合は追加
      if (selectedChannel) {
        query = query.eq('channel_id', selectedChannel);
      }
      
      // 取得数制限
      query = query.limit(perPage);
      
      // 実行
      const { data: latestPostsData, error } = await query;
      
      if (error) {
        console.error("最新データ取得エラー:", error);
        return;
      }
      
      if (!latestPostsData || latestPostsData.length === 0) {
        setPosts([]);
        return;
      }
      
      // 最新データをフォーマット
      const formattedLatestPosts = await formatPostsData(latestPostsData);
      
      console.log('最新のデータを取得しました:', formattedLatestPosts.length, '件');
      if (formattedLatestPosts.length > 0) {
        console.log('最初の投稿:', {
          title: formattedLatestPosts[0]?.title,
          id: formattedLatestPosts[0]?.id,
          date: formattedLatestPosts[0]?.createdAt
        });
      }
      
      // 全てのキャッシュをバイパスして最新データをセット
      setPosts(formattedLatestPosts);
      
      // 最後の投稿日時を更新
      if (latestPostsData.length > 0) {
        const lastPost = latestPostsData[latestPostsData.length - 1];
        setLastPostDate(lastPost.created_at);
      }
      
      // 次のページの有無をチェック
      setHasMore(latestPostsData.length === perPage);
      
    } catch (error) {
      console.error("最新データ取得エラー:", error);
    } finally {
      console.log('=== FETCH FRESH POSTS END ===');
      setLoading(false);
    }
  }, [perPage, selectedChannel]);

  // パフォーマンス改善版の投稿取得関数
  const fetchPosts = async (reset = true, forceRefresh = false) => {
    console.log('=== FETCH POSTS START ===');
    
    // 強制リフレッシュの場合は完全にキャッシュをバイパスする方法を使用
    if (forceRefresh) {
      console.log('強制リフレッシュモード - キャッシュをバイパスして最新データを取得');
      await fetchLatestPosts();
      return;
    }
    
    // 初回ロード時またはチャンネル変更時はリセット
    if (reset) {
      setLoading(true);
      setPosts([]);
      setHasMore(true);
      setLastPostDate(undefined); // カーソルをリセット
    } else {
      setLoadingMore(true);
    }

    try {
      // 1. 投稿を取得 (カーソルベースのページネーション)
      const { data: postsData, error: postsError } = await fetchPaginatedPosts(
        selectedChannel,
        perPage,
        lastPostDate
      );

      if (postsError) {
        console.error("投稿取得エラー:", postsError);
        toast({
          title: "エラー",
          description: "投稿の取得に失敗しました",
          variant: "destructive",
        });
        return;
      }

      // 次のページが存在するかチェック
      const hasMoreData = postsData && postsData.length === perPage;
      setHasMore(hasMoreData);
      
      if (!postsData || postsData.length === 0) {
        if (reset) {
          setPosts([]);
        }
        setHasMore(false);
        return;
      }

      // 2. 投稿データをバッチで処理
      const formattedPosts: Post[] = await formatPostsData(postsData);

      // 最後の投稿の日時を保存（次回のカーソルとして使用）
      if (postsData.length > 0) {
        const lastPost = postsData[postsData.length - 1];
        setLastPostDate(lastPost.created_at);
      }

      // 新しいデータを追加または置き換え
      if (reset) {
        setPosts(formattedPosts);
      } else {
        // IDベースで重複を確認し、重複を除外して追加
        const existingIds = new Set(posts.map(post => post.id));
        const uniqueNewPosts = formattedPosts.filter(post => !existingIds.has(post.id));
        
        if (uniqueNewPosts.length > 0) {
          // 新しいユニークな投稿がある場合はそれらを追加
          setPosts(prevPosts => {
            // 全ての投稿を日付順で並べ直し
            const allPosts = [...prevPosts, ...uniqueNewPosts];
            return allPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          });
        } else if (hasMoreData) {
          // データはあるが全て重複の場合、非同期で次のページを試す
          setTimeout(() => {
            fetchPosts(false);
          }, 0);
        } else {
          // 次のページがなく重複もある場合は終了
          setHasMore(false);
        }
      }

      // 特集記事はチャンネルが選択されていない場合にのみ取得
      if (!selectedChannel && reset) {
        // 特集記事（トレンドとポピュラー）を取得
        await fetchFeaturePosts();
      }

    } catch (error) {
      console.error("投稿取得エラー:", error);
    } finally {
      console.log('=== FETCH POSTS END ===');
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 初回レンダリング時とチャンネル変更時に投稿を取得
  useEffect(() => {
    console.log('Channel changed or component mounted, fetching posts');
    fetchPosts(true);
  }, [selectedChannel]);

  return {
    posts,
    trendingPosts,
    popularPosts,
    loading,
    loadingMore,
    hasMore,
    fetchPosts,
    fetchLatestPosts, // 新しい関数をエクスポート
  };
}
