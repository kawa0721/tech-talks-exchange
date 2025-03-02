
import { useState, useEffect } from "react";
import { Post } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsePostsWithPaginationProps {
  selectedChannel: string | null;
  perPage?: number;
}

export function usePostsWithPagination({ 
  selectedChannel, 
  perPage = 10 
}: UsePostsWithPaginationProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  // 投稿をフェッチする関数
  const fetchPosts = async (reset = true) => {
    // 初回ロード時またはチャンネル変更時はリセット
    if (reset) {
      setLoading(true);
      setPosts([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // 現在のポスト数（次のオフセットとして使用）
      const offset = reset ? 0 : posts.length;
      
      console.log(`Fetching posts with offset ${offset}, limit ${perPage}`);

      // 1. 投稿を取得
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      // チャンネルが選択されている場合、そのチャンネルの投稿のみを取得
      if (selectedChannel) {
        query = query.eq('channel_id', selectedChannel);
      }

      // limit と offset を使用してページネーション
      query = query
        .limit(perPage)
        .range(offset, offset + perPage - 1);

      const { data: postsData, error: postsError } = await query;

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
          setTrendingPosts([]);
          setPopularPosts([]);
        }
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // 2. 各投稿のユーザー情報を取得
      const formattedPosts: Post[] = await Promise.all(
        postsData.map(async (post) => {
          let userData = {
            id: post.user_id || "unknown",
            name: "kawakitamasayuki@gmail.com",
            avatar: undefined
          };

          if (post.user_id) {
            // ユーザープロファイルを取得
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', post.user_id)
              .maybeSingle();  // single()ではなくmaybeSingleを使用

            if (!profileError && profile) {
              userData = {
                id: profile.id,
                name: profile.username || "kawakitamasayuki@gmail.com",
                avatar: profile.avatar_url
              };
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
        })
      );

      // 新しいデータを追加または置き換え
      if (reset) {
        setPosts(formattedPosts);
      } else {
        // 既存の投稿に新しい投稿を追加
        setPosts(prevPosts => [...prevPosts, ...formattedPosts]);
      }

      // トレンド投稿と人気投稿の処理（チャンネルが選択されていない場合のみ）
      if (!selectedChannel && reset) {
        // トレンド投稿: 最新の投稿から選択
        setTrendingPosts(formattedPosts.slice(0, 2));

        // 人気投稿: いいね数が多い投稿から選択
        const { data: popularData, error: popularError } = await supabase
          .from('posts')
          .select('*')
          .order('likes_count', { ascending: false })
          .limit(2);

        if (!popularError && popularData && popularData.length > 0) {
          const formattedPopularPosts: Post[] = await Promise.all(
            popularData.map(async (post) => {
              let userData = {
                id: post.user_id || "unknown",
                name: "kawakitamasayuki@gmail.com",
                avatar: undefined
              };

              if (post.user_id) {
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', post.user_id)
                  .single();

                if (!profileError && profile) {
                  userData = {
                    id: profile.id,
                    name: profile.username || "kawakitamasayuki@gmail.com",
                    avatar: profile.avatar_url
                  };
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
            })
          );
          setPopularPosts(formattedPopularPosts);
        } else {
          setPopularPosts([]);
        }
      } else if (selectedChannel) {
        setTrendingPosts([]);
        setPopularPosts([]);
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
