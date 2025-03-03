
import { useEffect } from "react";
import { Post } from "@/types";
import { useChannelData } from "./useChannelData";
import MainContentHeader from "./MainContentHeader";
import ErrorDisplay from "./ErrorDisplay";
import LoadingIndicator from "./LoadingIndicator";
import EmptyPostsMessage from "./EmptyPostsMessage";
import EndOfPostsMessage from "./EndOfPostsMessage";
import HomePageContent from "./HomePageContent";
import ChannelPageContent from "./ChannelPageContent";

interface MainContentProps {
  selectedChannel: string | null;
  trendingPosts: Post[];
  popularPosts: Post[];
  posts: Post[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectChannel: (channelId: string) => void;
  
  // 特集投稿のページネーション用プロパティ
  trendingHasMore?: boolean;
  popularHasMore?: boolean;
  trendingLoading?: boolean;
  popularLoading?: boolean;
  onLoadMoreTrending?: () => void;
  onLoadMorePopular?: () => void;
}

const MainContent = ({
  selectedChannel,
  trendingPosts,
  popularPosts,
  posts,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onSelectChannel,
  trendingHasMore = false,
  popularHasMore = false,
  trendingLoading = false, 
  popularLoading = false,
  onLoadMoreTrending = () => {},
  onLoadMorePopular = () => {}
}: MainContentProps) => {
  const { channels, channelLoading, error, getChannelName } = useChannelData();

  // Add more detailed debug logs for props changes
  useEffect(() => {
    console.log('MainContent detailed props analysis:', {
      selectedChannel,
      postsCount: posts.length,
      postsData: posts,
      loading,
      loadingMore,
      hasMore,
      trendingPostsCount: trendingPosts.length,
      popularPostsCount: popularPosts.length
    });
  }, [selectedChannel, posts, loading, loadingMore, hasMore, trendingPosts, popularPosts]);

  return (
    <main className="main-content w-full">
      <div className="px-4 md:px-6 py-4 mx-auto max-w-4xl fade-in">
        <MainContentHeader 
          selectedChannel={selectedChannel} 
          getChannelName={getChannelName} 
          channels={channels} 
        />

        <ErrorDisplay error={error} />

        {/* ホームページに表示する特集セクション（チャンネルが選択されていない場合のみ表示） */}
        {!selectedChannel && !loading && (
          <HomePageContent
            trendingPosts={trendingPosts}
            popularPosts={popularPosts}
            posts={posts}
            getChannelName={getChannelName}
            selectedChannel={selectedChannel}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            channels={channels}
            channelLoading={channelLoading}
            trendingHasMore={trendingHasMore}
            popularHasMore={popularHasMore}
            trendingLoading={trendingLoading}
            popularLoading={popularLoading}
            onLoadMoreTrending={onLoadMoreTrending}
            onLoadMorePopular={onLoadMorePopular}
            onLoadMore={onLoadMore}
            onSelectChannel={onSelectChannel}
          />
        )}

        {/* チャンネルが選択されている場合は、投稿一覧を表示 */}
        {selectedChannel && (
          <ChannelPageContent
            trendingPosts={trendingPosts}
            popularPosts={popularPosts}
            posts={posts}
            getChannelName={getChannelName}
            selectedChannel={selectedChannel}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            trendingHasMore={trendingHasMore}
            popularHasMore={popularHasMore}
            trendingLoading={trendingLoading}
            popularLoading={popularLoading}
            onLoadMoreTrending={onLoadMoreTrending}
            onLoadMorePopular={onLoadMorePopular}
            onLoadMore={onLoadMore}
          />
        )}

        {/* データ終了メッセージ */}
        {!loading && !loadingMore && posts.length > 0 && !hasMore && (
          <EndOfPostsMessage count={posts.length} />
        )}

        {/* 読み込み中インジケータ - 初回ロード時 */}
        {loading && posts.length === 0 && (
          <LoadingIndicator />
        )}

        {/* 投稿がない場合のメッセージ */}
        {!loading && !loadingMore && posts.length === 0 && (
          <EmptyPostsMessage />
        )}
      </div>
    </main>
  );
};

export default MainContent;
