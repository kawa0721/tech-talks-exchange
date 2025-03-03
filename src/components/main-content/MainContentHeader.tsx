
import { Channel } from "@/types";

interface MainContentHeaderProps {
  selectedChannel: string | null;
  getChannelName: (channelId: string) => string;
  channels: Channel[];
}

const MainContentHeader = ({ 
  selectedChannel, 
  getChannelName, 
  channels 
}: MainContentHeaderProps) => {
  return (
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
  );
};

export default MainContentHeader;
