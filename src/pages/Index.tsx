
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ChannelList from "@/components/ChannelList";
import CreatePostForm from "@/components/CreatePostForm";
import { Post } from "@/types";
import { CHANNELS, getPostsForChannel } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import FeaturedPosts from "@/components/FeaturedPosts";
import RecommendedChannels from "@/components/RecommendedChannels";

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
        {/* Sidebar - 幅を広げる */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 flex flex-col border-r bg-background transition-transform duration-300 lg:relative lg:translate-x-0 ${
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

        {/* Main content - メインコンテンツの上部に余白を追加 */}
        <main 
          className={`flex-1 px-6 pb-12 pt-8 main-content transition-all duration-300 ${
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

            {/* 投稿フォームは常に表示 */}
            <CreatePostForm 
              channelId={selectedChannel} 
              onPostCreated={handlePostCreated} 
            />

            {/* ホームページに表示する特集セクション（チャンネルが選択されていない場合のみ表示） */}
            {!selectedChannel && !loading && (
              <div className="space-y-8 mt-8">
                {/* トレンド投稿と人気投稿と最近の投稿のセクション */}
                <FeaturedPosts 
                  trendingPosts={trendingPosts}
                  popularPosts={popularPosts}
                  posts={posts}
                  getChannelName={getChannelName}
                  selectedChannel={selectedChannel}
                  loading={loading}
                />
                
                {/* チャンネル紹介セクション */}
                <RecommendedChannels 
                  channels={CHANNELS.slice(0, 3)} 
                  onSelectChannel={setSelectedChannel}
                />
              </div>
            )}

            {/* チャンネルが選択されている場合は、タブ付きコンポーネントを表示 */}
            {selectedChannel && (
              <div className="mt-8">
                <FeaturedPosts 
                  trendingPosts={trendingPosts}
                  popularPosts={popularPosts}
                  posts={posts}
                  getChannelName={getChannelName}
                  selectedChannel={selectedChannel}
                  loading={loading}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
