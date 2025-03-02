import { Post } from "@/types";
import { Loader2 } from "lucide-react";
import PostCard from "@/components/PostCard";
import { useEffect } from "react";

interface PostsListProps {
  posts: Post[];
  loading: boolean;
  getChannelName: (channelId: string) => string;
  showChannel?: boolean;
  emptyMessage?: string;
  isUserPosts?: boolean;
}

const PostsList = ({
  posts,
  loading,
  getChannelName,
  showChannel = true,
  emptyMessage = "投稿はまだありません",
  isUserPosts = false,
}: PostsListProps) => {
  // デバッグログ
  useEffect(() => {
    console.log('PostsList rendered with:', {
      postsCount: posts.length,
      loading,
      showChannel,
      firstPostId: posts.length > 0 ? posts[0].id : null,
      lastPostId: posts.length > 0 ? posts[posts.length - 1].id : null
    });
  }, [posts, loading, showChannel]);

  if (loading) {
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

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <PostCard
          key={`${post.id}-${index}`} // 追加のインデックスで重複を防止
          post={post}
          channelName={getChannelName(post.channelId)}
          showChannel={showChannel}
        />
      ))}
    </div>
  );
};

export default PostsList;