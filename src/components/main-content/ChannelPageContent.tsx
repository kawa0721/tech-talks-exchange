
import { Post } from "@/types";
import FeaturedPosts from "@/components/FeaturedPosts";

interface ChannelPageContentProps {
  trendingPosts: Post[];
  popularPosts: Post[];
  posts: Post[];
  getChannelName: (channelId: string) => string;
  selectedChannel: string | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  trendingHasMore: boolean;
  popularHasMore: boolean;
  trendingLoading: boolean;
  popularLoading: boolean;
  onLoadMoreTrending: () => void;
  onLoadMorePopular: () => void;
  onLoadMore: () => void;
}

const ChannelPageContent = ({
  trendingPosts,
  popularPosts,
  posts,
  getChannelName,
  selectedChannel,
  loading,
  loadingMore,
  hasMore,
  trendingHasMore,
  popularHasMore,
  trendingLoading,
  popularLoading,
  onLoadMoreTrending,
  onLoadMorePopular,
  onLoadMore
}: ChannelPageContentProps) => {
  return (
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
  );
};

export default ChannelPageContent;
