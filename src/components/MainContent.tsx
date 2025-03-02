
import { useState, useEffect } from "react";
import { Post, Channel } from "@/types";
import FeaturedPosts from "@/components/FeaturedPosts";
import RecommendedChannels from "@/components/RecommendedChannels";
import { supabase } from "@/integrations/supabase/client";

interface MainContentProps {
  selectedChannel: string | null;
  trendingPosts: Post[];
  popularPosts: Post[];
  posts: Post[];
  loading: boolean;
  onSelectChannel: (channelId: string) => void;
}

const MainContent = ({
  selectedChannel,
  trendingPosts,
  popularPosts,
  posts,
  loading,
  onSelectChannel
}: MainContentProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelLoading, setChannelLoading] = useState(true);

  // チャンネル情報をDBから取得
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*');
          
        if (error) {
          console.error("チャンネル取得エラー:", error);
          return;
        }
        
        const formattedChannels: Channel[] = data.map(channel => ({
          id: channel.id,
          name: channel.name,
          description: channel.description,
          icon: channel.icon,
          categoryId: channel.category_id
        }));
        
        setChannels(formattedChannels);
      } catch (error) {
        console.error("チャンネル取得エラー:", error);
      } finally {
        setChannelLoading(false);
      }
    };
    
    fetchChannels();
  }, []);

  // Find channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = channels.find((c) => c.id === channelId);
    return channel ? channel.name : "不明なチャンネル";
  };

  return (
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
              ? channels.find(c => c.id === selectedChannel)?.description
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
            {!channelLoading && (
              <RecommendedChannels 
                channels={channels.slice(0, 3)} 
                onSelectChannel={onSelectChannel}
              />
            )}
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
  );
};

export default MainContent;
