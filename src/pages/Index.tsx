
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

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // usePostsWithPaginationフックを使用する
  const {
    posts,
    trendingPosts,
    popularPosts,
    loading,
    loadingMore,
    hasMore,
    fetchPosts
  } = usePostsWithPagination({
    selectedChannel,
    perPage: 10
  });

  // デバッグログ (必要に応じて)
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
    // usePostsWithPaginationフックのfetchPosts関数を呼び出す
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
