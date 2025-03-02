
import { useState, useEffect } from "react";
import { Channel } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };
    
    fetchChannels();
  }, []);

  return { channels, loading };
}
