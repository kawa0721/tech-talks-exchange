import { useState, useEffect, useCallback } from "react";
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
  const [activeTab, setActiveTab] = useState("trending"); // 現在のアクティブタブ
  const { toast } = useToast();
  
  // Add detailed debug logs
  useEffect(() => {
    console.log('Index component mounted or updated');
    // ログインステータスを確認するためのログ
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current auth status:', session ? 'Logged in' : 'Not logged in');
    };
    checkAuthStatus();
  }, []);
  
  // 通常の投稿のページネーション用フック
  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    fetchPosts,
    fetchLatestPosts
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
    fetchPopularPosts,
    fetchFeaturePosts
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
      selectedChannel,
      activeTab
    });
  }, [posts, loading, loadingMore, hasMore, trendingPosts, popularPosts, selectedChannel, activeTab]);

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
    console.log('New post created, refreshing posts and switching to recent tab');
    
    // 「最近の投稿」タブに切り替え
    setActiveTab("recent");
    
    // すぐに再取得すると、DBの反映前にデータを取得してしまう可能性があるため、
    // 短い遅延を入れた後にデータを再取得する
    setTimeout(async () => {
      try {
        // 完全に新しいデータを取得（キャッシュをバイパス）
        await fetchLatestPosts();
        
        // 特集投稿も強制リフレッシュモードで更新
        fetchFeaturePosts(true);
        
        // 成功トースト表示
        toast({
          title: "投稿が作成されました",
          description: "新しい投稿が正常に表示されています。"
        });
      } catch (error) {
        console.error("投稿後のデータ更新エラー:", error);
        
        // エラーが発生した場合は従来の方法を試みる
        fetchPosts(true, true);
        fetchFeaturePosts(true);
        
        toast({
          title: "投稿が作成されました",
          description: "投稿は作成されましたが、表示の更新に問題が発生しました。リロードしてください。",
          variant: "default"
        });
      }
    }, 1000); // 遅延を1000msに増やして、より確実にDBに反映されるようにする
  };

  // サイドバー開閉関数をメモ化
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prevState => {
      const newState = !prevState;
      console.log('Toggling sidebar to:', newState);
      return newState;
    });
  }, []);

  // サイドバーの状態変化を追跡
  useEffect(() => {
    console.log('Sidebar state changed:', sidebarOpen);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - 固定ヘッダー */}
      <Navbar 
        onToggleSidebar={toggleSidebar} 
        isSidebarOpen={sidebarOpen} 
      />

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
          defaultTab={activeTab}
        />
      </div>

      {/* 投稿ボタン（右下に固定） */}
      <CreatePostButton channelId={selectedChannel ?? undefined} />

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
