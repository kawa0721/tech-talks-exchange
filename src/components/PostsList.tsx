import { Post } from "@/types";
import { Loader2 } from "lucide-react";
import PostCard from "@/components/PostCard";

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
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          channelName={getChannelName(post.channelId)}
          showChannel={showChannel}
        />
      ))}
    </div>
  );
};

export default PostsList;
