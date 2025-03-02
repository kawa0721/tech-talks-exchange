
import { useState } from "react";
import { Post } from "@/types";
import FeaturedPosts from "@/components/FeaturedPosts";
import RecommendedChannels from "@/components/RecommendedChannels";
import { CHANNELS } from "@/lib/data";

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
  // Find channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = CHANNELS.find((c) => c.id === channelId);
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
              onSelectChannel={onSelectChannel}
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
  );
};

export default MainContent;
