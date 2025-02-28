
import { TrendingUp, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Post } from "@/types";
import PostCard from "@/components/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeaturedPostsProps {
  trendingPosts: Post[];
  popularPosts: Post[];
  getChannelName: (channelId: string) => string;
}

const FeaturedPosts = ({ trendingPosts, popularPosts, getChannelName }: FeaturedPostsProps) => {
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
    </Tabs>
  );
};

export default FeaturedPosts;
