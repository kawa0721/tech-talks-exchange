import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Post } from "@/types";
import { useToast } from "@/hooks/use-toast";
import CreatePostDialog from "@/components/CreatePostDialog";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import CreatePostButton from "@/components/CreatePostButton";

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PER_PAGE = 10; // 1ページあたりの表示件数
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const { toast } = useToast();

  // 投稿をフェッチする関数
  const fetchPosts = async (reset = true) => {
    console.log('=== FETCH POSTS START ===');
    console.log(`Parameters: reset=${reset}, current posts count=${posts.length}`);

    // 初回ロード時またはチャンネル変更時はリセット
    if (reset) {
      console.log('Resetting posts state');
      setLoading(true);
      setPosts([]);
      setHasMore(true);
    } else {
      console.log('Loading more posts');
      setLoadingMore(true);
    }

    try {
      // カーソルとして使用する最後の投稿の日時を取得
      const lastPostDate = reset || posts.length === 0
        ? null
        : posts[posts.length - 1].createdAt.toISOString();
      
      console.log(`Using cursor timestamp: ${lastPostDate || 'null'}`);

      // 1. 投稿を取得
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      // チャンネルが選択されている場合、そのチャンネルの投稿のみを取得
      if (selectedChannel) {
        console.log(`Filtering by channel: ${selectedChannel}`);
        query = query.eq('channel_id', selectedChannel);
      }

      // カーソルが存在する場合、そのタイムスタンプより古い投稿を取得
      if (lastPostDate && !reset) {
        query = query.lt('created_at', lastPostDate);
      }

      // 取得件数を制限
      query = query.limit(PER_PAGE);
      
      console.log('Executing query...');
      const { data: postsData, error: postsError } = await query;

      if (postsError) {
        console.error("Query error:", postsError);
        toast({
          title: "エラー",
          description: "投稿の取得に失敗しました",
          variant: "destructive",
        });
        return;
      }

      console.log(`Query returned ${postsData?.length || 0} posts`);
      if (postsData && postsData.length > 0) {
        console.log('First post in results:', {
          id: postsData[0].id,
          title: postsData[0].title,
          created_at: postsData[0].created_at
        });
        console.log('Last post in results:', {
          id: postsData[postsData.length - 1].id,
          title: postsData[postsData.length - 1].title,
          created_at: postsData[postsData.length - 1].created_at
        });
      }

      // 次のページが存在するかチェック
      setHasMore(postsData && postsData.length === PER_PAGE);
      console.log(`Setting hasMore: ${postsData && postsData.length === PER_PAGE}`);

      if (!postsData || postsData.length === 0) {
        console.log('No posts returned from query');
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
      console.log('Fetching user information for posts...');
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

      console.log(`Formatted ${formattedPosts.length} posts with user data`);

      // 新しいデータを追加または置き換え
      if (reset) {
        console.log('Setting posts state with new data');
        setPosts(formattedPosts);
      } else {
        console.log('Appending new posts to existing posts');
        // IDベースで重複を確認し、重複を除外して追加
        const existingIds = new Set(posts.map(post => post.id));
        const uniqueNewPosts = formattedPosts.filter(post => !existingIds.has(post.id));
        
        console.log(`Found ${uniqueNewPosts.length} unique new posts to add`);
        
        if (uniqueNewPosts.length > 0) {
          setPosts(prev => [...prev, ...uniqueNewPosts]);
        } else {
          console.log('No unique new posts found, setting hasMore to false');
          setHasMore(false);
        }
      }

      // トレンド投稿と人気投稿の処理（チャンネルが選択されていない場合のみ）
      if (!selectedChannel && reset) {
        console.log('Processing trending and popular posts');
        // トレンド投稿: 最新の投稿から選択
        setTrendingPosts(formattedPosts.slice(0, 2));

        // 人気投稿: いいね数が多い投稿から選択
        const { data: popularData, error: popularError } = await supabase
          .from('posts')
          .select('*')
          .order('likes_count', { ascending: false })
          .limit(2);

        if (!popularError && popularData && popularData.length > 0) {
          console.log(`Found ${popularData.length} popular posts`);
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
          console.log('No popular posts found');
          setPopularPosts([]);
        }
      } else if (selectedChannel) {
        console.log('Channel selected, clearing trending and popular posts');
        setTrendingPosts([]);
        setPopularPosts([]);
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

  // React状態の変化を監視
  useEffect(() => {
    console.log(`Posts state updated: ${posts.length} posts in state`);
  }, [posts]);

  useEffect(() => {
    console.log(`Loading state updated: loading=${loading}, loadingMore=${loadingMore}`);
  }, [loading, loadingMore]);

  useEffect(() => {
    console.log(`HasMore state updated: ${hasMore}`);
  }, [hasMore]);

  // 「もっと読み込む」ボタンをクリックしたときの処理
  const handleLoadMore = () => {
    console.log('Load more button clicked');
    fetchPosts(false);
  };

  const handlePostCreated = () => {
    // 新しい投稿が作成された後、投稿リストを更新
    console.log('New post created, refreshing posts');
    fetchPosts(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - 固定ヘッダー */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Sidebar Component */}
        <Sidebar
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Component */}
        <MainContent
          selectedChannel={selectedChannel}
          trendingPosts={trendingPosts}
          popularPosts={popularPosts}
          posts={posts}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onSelectChannel={setSelectedChannel}
        />
      </div>

      {/* 投稿ボタン（右下に固定） */}
      <CreatePostButton onClick={() => setIsPostDialogOpen(true)} />

      {/* 投稿ダイアログ */}
      <CreatePostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        channelId={selectedChannel}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Index;