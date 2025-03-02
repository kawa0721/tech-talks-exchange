
import { useState } from "react";
import { usePostsWithPagination } from "@/hooks/usePostsWithPagination";
import MainContent from "@/components/MainContent";
import IndexPageLayout from "@/components/layout/IndexPageLayout";
import LoadMoreButton from "@/components/LoadMoreButton";

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  
  const { 
    posts, 
    trendingPosts, 
    popularPosts, 
    loading, 
    loadingMore, 
    hasMore, 
    fetchPosts 
  } = usePostsWithPagination({ 
    selectedChannel 
  });

  // 「もっと読み込む」ボタンをクリックしたときの処理
  const handleLoadMore = () => {
    fetchPosts(false);
  };

  const handlePostCreated = () => {
    // 新しい投稿が作成された後、投稿リストを更新
    fetchPosts(true);
  };

  return (
    <IndexPageLayout 
      selectedChannel={selectedChannel} 
      onSelectChannel={setSelectedChannel}
      onPostCreated={handlePostCreated}
    >
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
    </IndexPageLayout>
  );
};

export default Index;
