import { useState, useEffect } from "react";
import { Post } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { fetchPaginatedPosts, formatPostsData } from "./fetchPostsUtils";
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
  const [lastPostDate, setLastPostDate] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  // 特集投稿フックを使用
  const { 
    trendingPosts, 
    popularPosts, 
    fetchFeaturePosts 
  } = useFeaturePosts();

  // パフォーマンス改善版の投稿取得関数
  const fetchPosts = async (reset = true) => {
    console.log('=== FETCH POSTS START ===');
    
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
          setPosts(prevPosts => [...prevPosts, ...uniqueNewPosts]);
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
  };
}
