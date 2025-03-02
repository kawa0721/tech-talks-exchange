
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ChannelList from "@/components/ChannelList";
import { Post } from "@/types";
import { CHANNELS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import FeaturedPosts from "@/components/FeaturedPosts";
import RecommendedChannels from "@/components/RecommendedChannels";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreatePostDialog from "@/components/CreatePostDialog";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch posts based on selected channel
  const fetchPosts = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:user_id (*)
        `)
        .order('created_at', { ascending: false });
      
      // チャンネルが選択されている場合、そのチャンネルの投稿のみを取得
      if (selectedChannel) {
        query = query.eq('channel_id', selectedChannel);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("投稿取得エラー:", error);
        toast({
          title: "エラー",
          description: "投稿の取得に失敗しました",
          variant: "destructive",
        });
        return;
      }
      
      // 投稿データを変換
      const formattedPosts: Post[] = data.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        userId: post.user_id,
        user: post.user || {
          id: post.user_id,
          name: "不明なユーザー",
          avatar: undefined
        },
        channelId: post.channel_id,
        createdAt: new Date(post.created_at),
        updatedAt: post.updated_at ? new Date(post.updated_at) : undefined,
        likesCount: post.likes_count,
        commentsCount: post.comments_count,
        liked: false,
        images: post.images
      }));
      
      setPosts(formattedPosts);
      
      // トレンド投稿と人気投稿の処理（チャンネルが選択されていない場合のみ）
      if (!selectedChannel) {
        // トレンド投稿: 最新の投稿から選択
        setTrendingPosts(formattedPosts.slice(0, 2));
        
        // 人気投稿: いいね数が多い投稿から選択
        setPopularPosts([...formattedPosts].sort((a, b) => b.likesCount - a.likesCount).slice(0, 2));
      } else {
        setTrendingPosts([]);
        setPopularPosts([]);
      }
      
    } catch (error) {
      console.error("投稿取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // 投稿が変更される可能性があるため、初回レンダリング時とチャンネル変更時に投稿を取得
  useEffect(() => {
    fetchPosts();
  }, [selectedChannel]);

  // Find channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = CHANNELS.find((c) => c.id === channelId);
    return channel ? channel.name : "不明なチャンネル";
  };

  const handleOpenPostDialog = () => {
    setIsPostDialogOpen(true);
    toast({
      title: "投稿作成",
      description: "投稿フォームを起動します",
    });
  };

  const handlePostCreated = () => {
    // 新しい投稿が作成された後、投稿リストを更新
    fetchPosts();
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
        onClick={handleOpenPostDialog}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* 投稿ダイアログ */}
      <CreatePostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        channelId={selectedChannel}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Index;
