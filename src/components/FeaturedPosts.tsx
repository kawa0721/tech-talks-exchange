
import { TrendingUp, Star, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Post } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PostsList from "@/components/PostsList";
import PostCard from "@/components/PostCard";
import { useEffect } from "react";

interface FeaturedPostsProps {
  trendingPosts: Post[];
  popularPosts: Post[];
  posts: Post[]; // 通常の投稿一覧
  getChannelName: (channelId: string) => string;
  selectedChannel: string | null;
  loading: boolean;
  loadingMore: boolean;
  
  // ページネーション用の状態と関数
  trendingHasMore?: boolean;
  popularHasMore?: boolean;
  trendingLoading?: boolean;
  popularLoading?: boolean;
  onLoadMoreTrending?: () => void;
  onLoadMorePopular?: () => void;
  onLoadMore: () => void; // 既存の通常投稿のさらに読み込み関数
}

const FeaturedPosts = ({
  trendingPosts,
  popularPosts,
  posts,
  getChannelName,
  selectedChannel,
  loading,
  loadingMore,
  trendingHasMore = false,
  popularHasMore = false, 
  trendingLoading = false,
  popularLoading = false,
  onLoadMoreTrending = () => {},
  onLoadMorePopular = () => {},
  onLoadMore
}: FeaturedPostsProps) => {
  // Add detailed debug logs
  useEffect(() => {
    console.log('FeaturedPosts rendered with:', {
      trendingPostsCount: trendingPosts.length,
      popularPostsCount: popularPosts.length,
      postsCount: posts.length,
      selectedChannel,
      loading,
      postIds: posts.map(post => post.id)
    });
  }, [trendingPosts, popularPosts, posts, selectedChannel, loading]);

  return (
    <Tabs defaultValue="recent" className="w-full">
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
          <Link to="/posts" className="flex items-center">
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
            
            {/* トレンド投稿の「さらに読み込む」ボタン */}
            {trendingHasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={onLoadMoreTrending} 
                  disabled={trendingLoading}
                  variant="outline"
                  className="w-full max-w-xs"
                  size="lg"
                >
                  {trendingLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>読み込み中... (現在{trendingPosts.length}件表示中)</span>
                    </>
                  ) : (
                    <span>さらに読み込む (現在{trendingPosts.length}件表示中)</span>
                  )}
                </Button>
              </div>
            )}
            
            {/* 全ての結果を表示した場合のメッセージ */}
            {!trendingHasMore && trendingPosts.length > 0 && (
              <div className="text-center py-4 mt-4 text-muted-foreground text-sm">
                すべてのトレンド投稿を表示しています (計{trendingPosts.length}件)
              </div>
            )}
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
            
            {/* 人気投稿の「さらに読み込む」ボタン */}
            {popularHasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={onLoadMorePopular} 
                  disabled={popularLoading}
                  variant="outline"
                  className="w-full max-w-xs"
                  size="lg"
                >
                  {popularLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>読み込み中... (現在{popularPosts.length}件表示中)</span>
                    </>
                  ) : (
                    <span>さらに読み込む (現在{popularPosts.length}件表示中)</span>
                  )}
                </Button>
              </div>
            )}
            
            {/* 全ての結果を表示した場合のメッセージ */}
            {!popularHasMore && popularPosts.length > 0 && (
              <div className="text-center py-4 mt-4 text-muted-foreground text-sm">
                すべての人気投稿を表示しています (計{popularPosts.length}件)
              </div>
            )}
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
        <PostsList
          posts={posts}
          loading={loading}
          getChannelName={getChannelName}
          showChannel={!selectedChannel}
          emptyMessage="このチャンネルで最初のディスカッションを始めましょう！"
        />
      </TabsContent>
    </Tabs>
  );
};

export default FeaturedPosts;
