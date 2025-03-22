import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post, Channel } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { UseFilteredPostsOptions, FilterOptions, SortOption } from "@/types/filters";

// デバウンス用のユーティリティ関数
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useFilteredPosts = ({ 
  filters, 
  sortOption, 
  perPage 
}: UseFilteredPostsOptions) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [channelOptions, setChannelOptions] = useState<Channel[]>([]);
  const { user } = useAuth();
  
  // 前回の値を記憶するためのrefを追加
  const prevFiltersRef = useRef<FilterOptions | null>(null);
  const prevSortOptionRef = useRef<SortOption | null>(null);
  
  // デバウンスされたフィルターと並び替え
  const debouncedFilters = useDebounce(filters, 300);
  const debouncedSortOption = useDebounce(sortOption, 300);

  // ページネーションと並び替えのためのキー
  const getPaginationKey = useCallback(() => {
    switch (sortOption) {
      case "latest":
        return "created_at";
      case "oldest":
        return "created_at";
      case "popular":
        return "likes_count";
      case "mostComments":
        return "comments_count";
      case "recentlyActive":
        return "updated_at";
      case "trending":
        return "created_at"; // トレンドスコアはまだ実装されていないため、created_atを使用
      case "engagement":
        return "likes_count"; // エンゲージメントスコアはまだ実装されていないため、likes_countを使用
      case "contentLength":
        return "created_at"; // コンテンツ長はまだ実装されていないため、created_atを使用
      case "mediaRich":
        return "created_at"; // メディア量はまだ実装されていないため、created_atを使用
      default:
        return "created_at";
    }
  }, [sortOption]);

  // 投稿を取得する関数
  const fetchPosts = useCallback(async (refresh: boolean = false) => {
    if (refresh) {
      setLoading(true);
      setLastFetchedAt(null);
    } else {
      setLoadingMore(true);
    }

    try {
      // Supabaseクエリの構築 - リレーションを使用
      let query = supabase
        .from("posts")
        .select(`
          *,
          user:profiles(id, username, avatar_url, profile),
          channel:channels(id, name, description, icon)
        `);

      // チャンネルフィルター
      if (filters.channels.length > 0) {
        query = query.in("channel_id", filters.channels);
      }

      // 時間範囲フィルター
      if (filters.timeRange !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (filters.timeRange) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case "threemonths":
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          case "year":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          case "custom":
            if (filters.dateStart) {
              startDate = new Date(filters.dateStart);
              query = query.gte("created_at", startDate.toISOString());
            }
            if (filters.dateEnd) {
              const endDate = new Date(filters.dateEnd);
              query = query.lte("created_at", endDate.toISOString());
            }
            break;
          default:
            startDate = new Date(0); // 1970-01-01
        }

        if (filters.timeRange !== "custom") {
          query = query.gte("created_at", startDate.toISOString());
        }
      }

      // 公式/非公式フィルター - この機能はまだ実装されていないようなので無視
      // if (filters.official !== undefined) {
      //   query = query.eq("is_official", filters.official);
      // }

      // いいね数フィルター
      if (filters.minLikes > 0) {
        query = query.gte("likes_count", filters.minLikes);
      }

      // コメント数フィルター
      if (filters.minComments > 0) {
        query = query.gte("comments_count", filters.minComments);
      }

      // メディア含むフィルター
      if (filters.hasMedia) {
        query = query.not("images", "is", null);
      }

      // コードブロック含むフィルター
      if (filters.hasCode) {
        query = query.ilike("content", "%```%");
      }

      // 特定ユーザーの投稿フィルター
      if (filters.createdBy) {
        query = query.eq("user_id", filters.createdBy);
      }

      // ユーザーインタラクションフィルター
      // これらのテーブルはまだ存在しないため、フロントエンドでフィルタリングするモックを実装
      let filteredIds: string[] | null = null;
      
      if (filters.interactionType && user) {
        switch (filters.interactionType) {
          case "liked":
            // likesテーブルを使用してユーザーがいいねした投稿を取得
            const { data: likedPosts } = await supabase
              .from("likes")
              .select("post_id")
              .eq("user_id", user.id)
              .not("post_id", "is", null); // null以外の投稿IDを持つレコードのみ
            
            if (likedPosts && likedPosts.length > 0) {
              filteredIds = likedPosts.map(item => item.post_id as string).filter(Boolean);
            } else {
              // いいねがない場合は空の結果を返す
              setPosts([]);
              setHasMore(false);
              setLoading(false);
              setLoadingMore(false);
              return;
            }
            break;
          case "commented":
            // commentsテーブルを使用してユーザーがコメントした投稿を取得
            const { data: commentedPosts } = await supabase
              .from("comments")
              .select("post_id")
              .eq("user_id", user.id);
            
            if (commentedPosts && commentedPosts.length > 0) {
              // 一意の投稿IDのみを保持
              filteredIds = Array.from(new Set(commentedPosts.map(item => item.post_id)));
            } else {
              // コメントがない場合は空の結果を返す
              setPosts([]);
              setHasMore(false);
              setLoading(false);
              setLoadingMore(false);
              return;
            }
            break;
          case "saved":
            // 保存機能はまだ実装されていないため、空の結果を返す
            setPosts([]);
            setHasMore(false);
            setLoading(false);
            setLoadingMore(false);
            return;
        }
        
        // フィルタリングされたIDがある場合は、クエリに追加
        if (filteredIds && filteredIds.length > 0) {
          query = query.in("id", filteredIds);
        }
      }

      // キーワード検索フィルター
      if (filters.keywords && filters.keywords.trim() !== "") {
        const keywords = filters.keywords.trim().split(/\s+/).filter(Boolean);
        
        if (keywords.length > 0) {
          // 各キーワードでOR検索を構築（title または content に含まれるものを検索）
          keywords.forEach(keyword => {
            query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
          });
        }
      }

      // ページネーションの適用
      const paginationKey = getPaginationKey();
      
      if (!refresh && lastFetchedAt) {
        if (sortOption === "oldest") {
          query = query.gt(paginationKey, lastFetchedAt);
        } else {
          query = query.lt(paginationKey, lastFetchedAt);
        }
      }

      // ソート順の適用
      if (sortOption === "oldest") {
        query = query.order(paginationKey, { ascending: true });
      } else {
        query = query.order(paginationKey, { ascending: false });
      }

      // ページサイズの制限
      query = query.limit(perPage);

      // クエリ実行
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // 最後に取得したアイテムの日時を記録
        const lastItem = data[data.length - 1];
        setLastFetchedAt(String(lastItem[paginationKey]));
        
        // 取得したデータをPostインターフェースに変換
        const formattedPosts: Post[] = data.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          userId: post.user_id,
          user: {
            id: post.user?.id || "",
            name: post.user?.username || "Unknown",
            avatar: post.user?.avatar_url,
            profile: post.user?.profile
          },
          channelId: post.channel_id,
          channel: post.channel,
          createdAt: new Date(post.created_at),
          updatedAt: post.updated_at ? new Date(post.updated_at) : undefined,
          commentsCount: post.comments_count,
          likesCount: post.likes_count,
          images: post.images
        }));
        
        // 新しいデータをセット
        if (refresh) {
          setPosts(formattedPosts);
        } else {
          setPosts(prev => [...prev, ...formattedPosts]);
        }
        
        setHasMore(data.length === perPage);
      } else {
        if (refresh) {
          setPosts([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, sortOption, lastFetchedAt, user, perPage, getPaginationKey]);

  // チャンネル一覧を取得
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from("channels")
          .select("id, name, description, icon, category_id, display_order")
          .order("name");
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // データをChannelインターフェースに変換
          const formattedChannels: Channel[] = data.map((channel: any) => ({
            id: channel.id,
            name: channel.name,
            description: channel.description,
            icon: channel.icon,
            categoryId: channel.category_id || "", // categoryIdがない場合に備えて空文字を設定
            displayOrder: channel.display_order
          }));
          
          setChannelOptions(formattedChannels);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };
    
    fetchChannels();
  }, []);

  // デバウンスされたフィルターと並び替えが変更されたときにのみ投稿を再取得
  useEffect(() => {
    // フィルターか並び替えが実際に変更された場合のみ取得を実行
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(debouncedFilters);
    const sortChanged = prevSortOptionRef.current !== debouncedSortOption;
    
    if (filtersChanged || sortChanged || !prevFiltersRef.current) {
      fetchPosts(true);
      
      // 現在の値を保存
      prevFiltersRef.current = { ...debouncedFilters };
      prevSortOptionRef.current = debouncedSortOption;
    }
  }, [debouncedFilters, debouncedSortOption, fetchPosts]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    fetchPosts,
    channelOptions
  };
}; 