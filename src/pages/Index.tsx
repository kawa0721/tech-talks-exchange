
import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Star, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import ChannelList from "@/components/ChannelList";
import PostCard from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm";
import { Post } from "@/types";
import { CHANNELS, getPostsForChannel } from "@/lib/dummyData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

  // Fetch posts based on selected channel
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const allPosts = getPostsForChannel(selectedChannel);
      setPosts(allPosts);
      
      // トレンド投稿と人気投稿をシミュレート（実際のアプリではバックエンドからのデータに基づく）
      if (selectedChannel === null) {
        // トレンド投稿: 最新の投稿から選択
        setTrendingPosts(
          [...allPosts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 2)
        );
        
        // 人気投稿: いいね数が多い投稿から選択
        setPopularPosts(
          [...allPosts].sort((a, b) => b.likesCount - a.likesCount).slice(0, 2)
        );
      } else {
        setTrendingPosts([]);
        setPopularPosts([]);
      }
      
      setLoading(false);
    }, 500);
  }, [selectedChannel]);

  // Handle post creation
  const handlePostCreated = () => {
    // Refresh posts
    setPosts(getPostsForChannel(selectedChannel));
  };

  // Find channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = CHANNELS.find((c) => c.id === channelId);
    return channel ? channel.name : "不明なチャンネル";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 relative">
        {/* Sidebar - 幅を広げた */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 flex flex-col border-r bg-background pt-16 transition-transform duration-300 lg:relative lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ChannelList
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
          />
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content - パディングとレイアウトを調整 */}
        <main 
          className={`flex-1 px-6 pb-12 pt-20 transition-all duration-300 ${
            sidebarOpen ? "lg:pl-10" : ""
          }`}
        >
          <div className="mx-auto max-w-4xl fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">
                {selectedChannel 
                  ? `${getChannelName(selectedChannel)} ディスカッション` 
                  : "すべてのディスカッション"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {selectedChannel
                  ? CHANNELS.find(c => c.id === selectedChannel)?.description
                  : "全てのテックチャンネルでの会話に参加しましょう"}
              </p>
            </div>

            {/* ホームページに表示する特集セクション（チャンネルが選択されていない場合のみ表示） */}
            {!selectedChannel && !loading && (
              <div className="space-y-8 mb-8">
                {/* トレンド投稿とおすすめ投稿のセクション */}
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
                    <Button variant="link" size="sm" className="text-muted-foreground">
                      すべて見る <ArrowRight className="ml-1 h-4 w-4" />
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
                
                {/* チャンネル紹介セクション */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">おすすめチャンネル</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {CHANNELS.slice(0, 3).map((channel) => (
                        <Card 
                          key={channel.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedChannel(channel.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="text-2xl">{channel.icon}</div>
                              <h3 className="font-medium">{channel.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{channel.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <CreatePostForm 
              channelId={selectedChannel} 
              onPostCreated={handlePostCreated} 
            />

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mt-8 mb-4">
                  {selectedChannel 
                    ? "チャンネルの投稿" 
                    : "最新の投稿"}
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
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <h3 className="text-xl font-medium mb-2">まだ投稿がありません</h3>
                <p className="text-muted-foreground">
                  このチャンネルで最初のディスカッションを始めましょう！
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
