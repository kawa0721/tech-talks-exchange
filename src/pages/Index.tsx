
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ChannelList from "@/components/ChannelList";
import { Post } from "@/types";
import { CHANNELS, getPostsForChannel } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import FeaturedPosts from "@/components/FeaturedPosts";
import RecommendedChannels from "@/components/RecommendedChannels";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Find channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = CHANNELS.find((c) => c.id === channelId);
    return channel ? channel.name : "不明なチャンネル";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - 固定ヘッダー */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`sidebar ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="sidebar-content">
            <ChannelList
              selectedChannel={selectedChannel}
              onSelectChannel={(channelId) => {
                setSelectedChannel(channelId);
                setSidebarOpen(false);
              }}
            />
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="mobile-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="main-content">
          <div className="px-4 md:px-6 py-4 mx-auto max-w-4xl fade-in">
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
              <div className="space-y-8">
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

            {/* チャンネルが選択されている場合は、投稿一覧を表示 */}
            {selectedChannel && (
              <div>
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

      {/* 投稿ボタン（右下に固定） */}
      <Button
        className="fixed bottom-6 right-6 shadow-lg rounded-full h-14 w-14 p-0 z-50"
        onClick={() => {
          // 投稿機能を起動する処理
          toast({
            title: "投稿作成",
            description: "投稿フォームを起動します",
          });
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Index;
