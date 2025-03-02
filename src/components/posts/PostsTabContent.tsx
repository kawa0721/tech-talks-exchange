
import { Post } from "@/types";
import PostsList from "@/components/PostsList";

interface PostsTabContentProps {
  posts: Post[];
  loading: boolean;
  getChannelName: (channelId: string) => string;
  isPopular?: boolean;
  isTrending?: boolean;
}

export const PostsTabContent = ({ 
  posts, 
  loading, 
  getChannelName,
  isPopular = false,
  isTrending = false
}: PostsTabContentProps) => {
  // Set the empty message based on tab type
  const emptyMessage = isPopular 
    ? "人気の投稿はまだありません" 
    : isTrending 
      ? "トレンドの投稿はまだありません"
      : "投稿はまだありません";

  return (
    <PostsList 
      posts={posts}
      loading={loading}
      getChannelName={getChannelName}
      showChannel={true}
      emptyMessage={emptyMessage}
    />
  );
};
