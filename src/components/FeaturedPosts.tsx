
import { TrendingUp, Star, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Post } from "@/types";
import PostCard from "@/components/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeaturedPostsProps {
  trendingPosts: Post[];
  popularPosts: Post[];
  posts: Post[]; // 通常の投稿一覧
  getChannelName: (channelId: string) => string;
  selectedChannel: string | null;
  loading: boolean;
}

const FeaturedPosts = ({ 
  trendingPosts, 
  popularPosts, 
  posts,
  getChannelName, 
  selectedChannel,
  loading
}: FeaturedPostsProps) => {
  // Generate recent posts - sorted by creation date
  const recentPosts = [...trendingPosts, ...popularPosts]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 2);

  return (
    <Tabs defaultValue="trending" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="trending" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            トレンド
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            人気の投稿
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            最近の投稿
          </TabsTrigger>
        </TabsList>
        <Button variant="link" size="sm" className="text-muted-foreground" asChild>
          <Link to="/posts/trending" className="flex items-center">
            すべて見る <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <TabsContent value="trending" className="mt-0">
        {trendingPosts.length > 0 ? (
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                channelName={getChannelName(post.channelId)}
                showChannel={true}
                isTrending={true}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              現在トレンドの投稿はありません
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="popular" className="mt-0">
        {popularPosts.length > 0 ? (
          <div className="space-y-4">
            {popularPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                channelName={getChannelName(post.channelId)}
                showChannel={true}
                isPopular={true}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              人気の投稿はまだありません
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="recent" className="mt-0">
        {/* 通常の投稿一覧を表示 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                channelName={getChannelName(post.channelId)}
                showChannel={!selectedChannel} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <h3 className="text-xl font-medium mb-2">まだ投稿がありません</h3>
            <p className="text-muted-foreground">
              このチャンネルで最初のディスカッションを始めましょう！
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default FeaturedPosts;
