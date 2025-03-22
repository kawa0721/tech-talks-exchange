import React, { memo } from "react";
import { Post } from "@/types";
import { Loader2 } from "lucide-react";
import PostCard from "@/components/PostCard";
import InfiniteScroll from "@/components/InfiniteScroll";

interface PostsListProps {
  posts: Post[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  getChannelName: (channelId: string) => string;
  showChannel?: boolean;
  emptyMessage?: string;
  isUserPosts?: boolean;
}

// メモ化したPostCardコンポーネント
const MemoizedPostCard = memo(PostCard);

const PostsList = ({
  posts,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore = () => {},
  getChannelName,
  showChannel = true,
  emptyMessage = "投稿はまだありません",
  isUserPosts = false,
}: PostsListProps) => {
  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // ロード中のコンポーネント
  const loadingComponent = (
    <div className="flex justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  // 終了テキストコンポーネント
  const endTextComponent = (
    <div className="text-center py-4 text-sm text-muted-foreground">
      すべての投稿を表示しています (計{posts.length}件)
    </div>
  );

  return (
    <div className="space-y-6">
      {hasMore ? (
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          isLoading={loadingMore}
          loadingComponent={loadingComponent}
          endTextComponent={endTextComponent}
          threshold={200}
        >
          <div className="space-y-6">
            {posts.map((post) => (
              <MemoizedPostCard
                key={post.id}
                post={post}
                channelName={getChannelName(post.channelId)}
                showChannel={showChannel}
                isPopular={post.likesCount > 10}
              />
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <MemoizedPostCard
              key={post.id}
              post={post}
              channelName={getChannelName(post.channelId)}
              showChannel={showChannel}
              isPopular={post.likesCount > 10}
            />
          ))}
          {endTextComponent}
        </div>
      )}
    </div>
  );
};

// コンポーネント全体もメモ化してエクスポート
export default memo(PostsList);
