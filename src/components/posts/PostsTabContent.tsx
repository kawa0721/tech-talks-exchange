
import { Post } from "@/types";
import PostCard from "@/components/PostCard";
import { Loader2 } from "lucide-react";

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
        <p className="text-muted-foreground">
          {isPopular ? "人気の投稿はまだありません" : "トレンドの投稿はまだありません"}
        </p>
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
          showChannel={true}
          isPopular={isPopular}
          isTrending={isTrending}
        />
      ))}
    </div>
  );
};
