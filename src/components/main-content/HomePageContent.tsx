
import { Post, Channel } from "@/types";
import FeaturedPosts from "@/components/FeaturedPosts";
import RecommendedChannels from "@/components/RecommendedChannels";

interface HomePageContentProps {
  trendingPosts: Post[];
  popularPosts: Post[];
  posts: Post[];
  getChannelName: (channelId: string) => string;
  selectedChannel: string | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  channels: Channel[];
  channelLoading: boolean;
  trendingHasMore: boolean;
  popularHasMore: boolean;
  trendingLoading: boolean;
  popularLoading: boolean;
  onLoadMoreTrending: () => void;
  onLoadMorePopular: () => void;
  onLoadMore: () => void;
  onSelectChannel: (channelId: string) => void;
}

const HomePageContent = ({
  trendingPosts,
  popularPosts,
  posts,
  getChannelName,
  selectedChannel,
  loading,
  loadingMore,
  hasMore,
  channels,
  channelLoading,
  trendingHasMore,
  popularHasMore,
  trendingLoading,
  popularLoading,
  onLoadMoreTrending,
  onLoadMorePopular,
  onLoadMore,
  onSelectChannel
}: HomePageContentProps) => {
  return (
    <div className="space-y-8">
      {/* トレンド投稿と人気投稿と最近の投稿のセクション */}
      <FeaturedPosts
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

      {/* チャンネル紹介セクション */}
      {!channelLoading && (
        <RecommendedChannels
          channels={channels.slice(0, 3)}
          onSelectChannel={onSelectChannel}
        />
      )}
    </div>
  );
};

export default HomePageContent;
