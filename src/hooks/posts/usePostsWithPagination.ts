
import { useState, useEffect } from "react";
import { Post } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { fetchPaginatedPosts, formatPostData } from "./fetchPostsUtils";
import { useFeaturePosts } from "./useFeaturePosts";

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
  const [page, setPage] = useState(0);
  const { toast } = useToast();
  
  // Use our feature posts hook
  const { 
    trendingPosts, 
    popularPosts, 
    fetchFeaturePosts 
  } = useFeaturePosts();

  // 投稿をフェッチする関数
  const fetchPosts = async (reset = true) => {
    // 初回ロード時またはチャンネル変更時はリセット
    if (reset) {
      setLoading(true);
      setPosts([]);
      setHasMore(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    try {
      // 現在のポスト数（次のオフセットとして使用）
      const currentPage = reset ? 0 : page;
      
      console.log(`Fetching posts with page ${currentPage}, limit ${perPage}`);

      // 1. 投稿を取得
      const { data: postsData, error: postsError } = await fetchPaginatedPosts(
        selectedChannel,
        currentPage,
        perPage
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

      console.log(`Fetched ${postsData?.length || 0} posts`);

      // 次のページが存在するかチェック
      const hasMoreData = postsData && postsData.length === perPage;
      setHasMore(hasMoreData);
      
      if (!postsData || postsData.length === 0) {
        if (reset) {
          setPosts([]);
        }
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // 2. 各投稿のユーザー情報を取得
      const formattedPosts: Post[] = await Promise.all(
        postsData.map(formatPostData)
      );

      // 新しいデータを追加または置き換え
      if (reset) {
        setPosts(formattedPosts);
      } else {
        // 既存の投稿に新しい投稿を追加 (IDで重複確認)
        const existingIds = new Set(posts.map(post => post.id));
        const uniqueNewPosts = formattedPosts.filter(post => !existingIds.has(post.id));
        
        console.log(`Found ${uniqueNewPosts.length} unique new posts to add`);
        
        if (uniqueNewPosts.length > 0) {
          setPosts(prevPosts => [...prevPosts, ...uniqueNewPosts]);
          // 次のページを設定
          setPage(currentPage + 1);
        } else if (hasMoreData) {
          // データはあるが全て重複の場合、次のページを試す
          console.log("All posts were duplicates, trying next page");
          setPage(currentPage + 1);
          setLoadingMore(false);
          return fetchPosts(false);
        } else {
          console.log('No unique new posts found, setting hasMore to false');
          setHasMore(false);
        }
      }

      // 特集記事はチャンネルが選択されていない場合にのみ取得
      if (!selectedChannel && reset) {
        // 特集記事（トレンドとポピュラー）を取得
        await fetchFeaturePosts();
      } else if (selectedChannel && reset) {
        // チャンネルが選択されている場合は特集記事をクリア
      }

    } catch (error) {
      console.error("投稿取得エラー:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 初回レンダリング時とチャンネル変更時に投稿を取得
  useEffect(() => {
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
  };
}
