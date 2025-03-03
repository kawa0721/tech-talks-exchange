
import { useState, useEffect } from "react";
import { Channel } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useChannelData() {
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

  return { channels, channelLoading, error, getChannelName };
}
