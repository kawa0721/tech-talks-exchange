
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Post } from "@/types";
import { useToast } from "@/hooks/use-toast";
import CreatePostDialog from "@/components/CreatePostDialog";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import CreatePostButton from "@/components/CreatePostButton";

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

  const handlePostCreated = () => {
    // 新しい投稿が作成された後、投稿リストを更新
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - 固定ヘッダー */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Sidebar Component */}
        <Sidebar 
          selectedChannel={selectedChannel} 
          onSelectChannel={setSelectedChannel}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Component */}
        <MainContent 
          selectedChannel={selectedChannel}
          trendingPosts={trendingPosts}
          popularPosts={popularPosts}
          posts={posts}
          loading={loading}
          onSelectChannel={setSelectedChannel}
        />
      </div>

      {/* 投稿ボタン（右下に固定） */}
      <CreatePostButton onClick={() => setIsPostDialogOpen(true)} />

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
