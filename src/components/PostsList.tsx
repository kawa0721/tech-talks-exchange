
import { Loader2 } from "lucide-react";
import { Post } from "@/types";
import PostCard from "@/components/PostCard";

interface PostsListProps {
  posts: Post[];
  loading: boolean;
  selectedChannel: string | null;
  getChannelName: (channelId: string) => string;
}

const PostsList = ({ posts, loading, selectedChannel, getChannelName }: PostsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-xl font-medium mb-2">まだ投稿がありません</h3>
        <p className="text-muted-foreground">
          このチャンネルで最初のディスカッションを始めましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mt-8 mb-4">
        {selectedChannel ? "チャンネルの投稿" : "最新の投稿"}
      </h2>
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          channelName={getChannelName(post.channelId)}
          showChannel={!selectedChannel} 
        />
      ))}
    </div>
  );
};

export default PostsList;
