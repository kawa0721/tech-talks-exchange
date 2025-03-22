// src/hooks/posts/useFilteredPosts.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post, Channel } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { UseFilteredPostsOptions, FilterOptions, SortOption } from "@/types/filters";

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
        return "trending_score"; // この列はカスタム計算が必要
      case "engagement":
        return "engagement_score"; // この列はカスタム計算が必要
      case "contentLength":
        return "content_length"; // この列はカスタム計算または追加が必要
      case "mediaRich":
        return "media_count"; // この列はカスタム計算または追加が必要
      default:
        return "created_at";
    }
  }, [sortOption]);

  // 投稿を取得する関数
  const fetchPosts = useCallback(async (refresh: boolean = false, force: boolean = false) => {
    if (refresh) {
      setLoading(true);
      setLastFetchedAt(null);
    } else {
      setLoadingMore(true);
    }

    try {
      // Supabaseクエリの構築
      let query = supabase
        .from("posts")
        .select(`
          *,
          user:users(id, name, avatar, profile),
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

      // 公式/非公式フィルター
      if (filters.official !== undefined) {
        query = query.eq("is_official", filters.official);
      }

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

      // ユーザーインタラクションフィルター（要追加テーブル）
      if (filters.interactionType && user) {
        switch (filters.interactionType) {
          case "liked":
            // いいねした投稿のフィルタリング（post_likesテーブル必要）
            const { data: likedPostIds } = await supabase
              .from("post_likes")
              .select("post_id")
              .eq("user_id", user.id)
              .then(({ data }) => ({
                data: data?.map(item => item.post_id) || []
              }));
            query = query.in("id", likedPostIds);
            break;
          case "commented":
            // コメントした投稿のフィルタリング
            const { data: commentedPostIds } = await supabase
              .from("comments")
              .select("post_id")
              .eq("user_id", user.id)
              .then(({ data }) => ({
                data: data?.map(item => item.post_id) || []
              }));
            query = query.in("id", commentedPostIds);
            break;
          case "saved":
            // 保存した投稿のフィルタリング（saved_postsテーブル必要）
            const { data: savedPostIds } = await supabase
              .from("saved_posts")
              .select("post_id")
              .eq("user_id", user.id)
              .then(({ data }) => ({
                data: data?.map(item => item.post_id) || []
              }));
            query = query.in("id", savedPostIds);
            break;
        }
      }

      // キーワード検索
      if (filters.keywords) {
        const keywords = filters.keywords.trim();
        if (keywords.length > 0) {
          // タイトルと内容で全文検索
          query = query.or(`title.ilike.%${keywords}%, content.ilike.%${keywords}%`);
        }
      }

      // 並び替え
      const paginationKey = getPaginationKey();
      const ascending = sortOption === "oldest";
      query = query.order(paginationKey, { ascending });

      // 前回取得した最後のレコード以降を取得（ページネーション）
      if (lastFetchedAt && !refresh) {
        if (ascending) {
          query = query.gt(paginationKey, lastFetchedAt);
        } else {
          query = query.lt(paginationKey, lastFetchedAt);
        }
      }

      // 1ページあたりの取得数
      query = query.limit(perPage);

      // クエリ実行
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }

      // データの型変換と整形
      const formattedPosts = data.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        userId: post.user_id,
        user: post.user,
        channelId: post.channel_id,
        createdAt: new Date(post.created_at),
        updatedAt: post.updated_at ? new Date(post.updated_at) : undefined,
        commentsCount: post.comments_count,
        likesCount: post.likes_count,
        images: post.images,
      })) as Post[];

      // 結果の更新
      if (refresh) {
        setPosts(formattedPosts);
      } else {
        setPosts(prev => [...prev, ...formattedPosts]);
      }

      // ページネーション情報の更新
      if (formattedPosts.length > 0) {
        const lastPost = formattedPosts[formattedPosts.length - 1];
        const lastValue = (lastPost as any)[paginationKey.replace("_score", "")]
          || (lastPost as any).createdAt;
        
        setLastFetchedAt(lastValue instanceof Date ? lastValue.toISOString() : lastValue);
      }

      setHasMore(formattedPosts.length === perPage);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, sortOption, perPage, lastFetchedAt, user]);

  // チャンネル一覧を取得
  const fetchChannels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("id, name, description, icon, category_id, display_order")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      // データの型変換と整形
      const formattedChannels = data.map(channel => ({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        icon: channel.icon,
        categoryId: channel.category_id,
        displayOrder: channel.display_order,
      })) as Channel[];

      setChannelOptions(formattedChannels);
    } catch (error) {
      console.error("Failed to fetch channels:", error);
    }
  }, []);

  // 初回マウント時にチャンネル一覧を取得
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // フィルターまたは並び替えの変更時に投稿を再取得
  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    fetchPosts,
    channelOptions,
  };
};
