import { useState, useEffect } from "react";
import { Post, Channel } from "@/types";
import FeaturedPosts from "@/components/FeaturedPosts";
import RecommendedChannels from "@/components/RecommendedChannels";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MainContentProps {
  selectedChannel: string | null;
  trendingPosts: Post[];
  popularPosts: Post[];
  posts: Post[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
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
  const [error, setError] = useState<string | null>(null);

  // チャンネル情報をDBから取得
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setError(null);
        const { data, error } = await supabase
          .from('channels')
          .select('*');

        if (error) {
          console.error("チャンネル取得エラー:", error);
          setError("チャンネル情報の取得に失敗しました。");
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
        setError("予期しないエラーが発生しました。");
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

  // Debug logs for props changes
  useEffect(() => {
    console.log('MainContent props changed:', {
      selectedChannel,
      postsCount: posts.length,
      loading,
      loadingMore,
      hasMore
    });
  }, [selectedChannel, posts, loading, loadingMore, hasMore]);

  return (
    <main className="main-content w-full">
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

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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

        {/* 「もっと読み込む」ボタン - 改良版 */}
        {!loading && posts.length > 0 && hasMore && (
          <div className="flex justify-center mt-8">
            <Button 
              onClick={onLoadMore} 
              disabled={loadingMore}
              variant="outline"
              className="w-full max-w-xs"
              size="lg"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>読み込み中... (現在{posts.length}件表示中)</span>
                </>
              ) : (
                <span>さらに読み込む (現在{posts.length}件表示中)</span>
              )}
            </Button>
          </div>
        )}

        {/* データ終了メッセージ */}
        {!loading && !loadingMore && posts.length > 0 && !hasMore && (
          <div className="text-center py-6 mt-8 border-t border-border">
            <p className="text-muted-foreground">すべての投稿を表示しています (計{posts.length}件)</p>
          </div>
        )}

        {/* 読み込み中インジケータ - 初回ロード時 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">投稿を読み込んでいます...</p>
          </div>
        )}

        {/* 投稿がない場合のメッセージ */}
        {!loading && !loadingMore && posts.length === 0 && (
          <div className="text-center py-16 border rounded-lg border-dashed border-border">
            <p className="text-2xl font-medium mb-2">投稿がありません</p>
            <p className="text-muted-foreground mb-6">このチャンネルにはまだ投稿がありません。最初の投稿を作成しましょう！</p>
            <Button onClick={() => document.querySelector('.create-post-button')?.dispatchEvent(new Event('click'))}>
              新しい投稿を作成
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;