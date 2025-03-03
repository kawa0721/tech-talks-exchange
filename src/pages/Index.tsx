
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Post } from "@/types";
import { useToast } from "@/hooks/use-toast";
import CreatePostDialog from "@/components/CreatePostDialog";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import CreatePostButton from "@/components/CreatePostButton";
import { usePostsWithPagination } from "@/hooks/usePostsWithPagination";
import { useFeaturePosts } from "@/hooks/posts/useFeaturePosts";

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Add detailed debug logs
  useEffect(() => {
    console.log('Index component mounted or updated');
  }, []);
  
  // 通常の投稿のページネーション用フック
  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    fetchPosts
  } = usePostsWithPagination({
    selectedChannel,
    perPage: 10
  });
  
  // 特集投稿（トレンドと人気）のページネーション用フック
  const {
    trendingPosts,
    popularPosts,
    trendingHasMore,
    popularHasMore,
    trendingLoading,
    popularLoading,
    fetchTrendingPosts,
    fetchPopularPosts
  } = useFeaturePosts({ selectedChannel });

  // さらに詳細なデバッグログ
  useEffect(() => {
    console.log('Index data status:', {
      postsLength: posts.length,
      postsData: posts,
      loading,
      loadingMore,
      hasMore,
      trendingPostsLength: trendingPosts.length,
      popularPostsLength: popularPosts.length,
      selectedChannel
    });
  }, [posts, loading, loadingMore, hasMore, trendingPosts, popularPosts, selectedChannel]);

  // 初回レンダリング時に特集投稿を取得
  useEffect(() => {
    console.log('Initial data fetch triggered');
    fetchPosts(true);
    fetchTrendingPosts(true);
    fetchPopularPosts(true);
  }, []);
  
  // チャンネルが変更されたときに特集投稿を再取得
  useEffect(() => {
    console.log('Channel changed, refreshing featured posts');
    fetchTrendingPosts(true);
    fetchPopularPosts(true);
  }, [selectedChannel]);

  // 「もっと読み込む」ボタンをクリックしたときの処理（通常の投稿）
  const handleLoadMore = () => {
    console.log('Load more button clicked for regular posts');
    fetchPosts(false);
  };
  
  // トレンド投稿の「さらに読み込む」ボタンをクリックしたときの処理
  const handleLoadMoreTrending = () => {
    console.log('Load more button clicked for trending posts');
    fetchTrendingPosts(false);
  };
  
  // 人気投稿の「さらに読み込む」ボタンをクリックしたときの処理
  const handleLoadMorePopular = () => {
    console.log('Load more button clicked for popular posts');
    fetchPopularPosts(false);
  };

  const handlePostCreated = () => {
    // 新しい投稿が作成された後、投稿リストを更新
    console.log('New post created, refreshing posts');
    fetchPosts(true);
    fetchTrendingPosts(true);
    fetchPopularPosts(true);
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
          trendingHasMore={trendingHasMore}
          popularHasMore={popularHasMore}
          trendingLoading={trendingLoading}
          popularLoading={popularLoading}
          onLoadMoreTrending={handleLoadMoreTrending}
          onLoadMorePopular={handleLoadMorePopular}
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
