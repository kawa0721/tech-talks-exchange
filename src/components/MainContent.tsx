import { useState, useEffect } from "react";
import { Post, Channel } from "@/types";
import FeaturedPosts from "@/components/FeaturedPosts";
import RecommendedChannels from "@/components/RecommendedChannels";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MainContentProps {
  selectedChannel: string | null;
  trendingPosts: Post[];
  popularPosts: Post[];
  posts: Post[];
  loading: boolean;
  loadingMore: boolean; // 追加読み込み時のローディング状態
  hasMore: boolean; // さらに読み込める投稿があるかどうか
  onLoadMore: () => void; // 追加読み込み関数
  onSelectChannel: (channelId: string) => void;
}

const MainContent = ({
  selectedChannel,
  trendingPosts,
  popularPosts,
  posts,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
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

        {/* 「もっと読み込む」ボタン */}
        {!loading && posts.length > 0 && hasMore && (
          <div className="flex justify-center mt-8">
            <Button 
              onClick={onLoadMore} 
              disabled={loadingMore}
              variant="outline"
              className="w-full max-w-xs"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  読み込み中...
                </>
              ) : (
                "もっと読み込む"
              )}
            </Button>
          </div>
        )}

        {/* 読み込み中インジケータ - 初回ロード時 */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* 投稿がない場合のメッセージ */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">投稿がありません。最初の投稿を作成しましょう！</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;
