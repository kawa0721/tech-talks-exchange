
import { useChannels } from "@/hooks/useChannels";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChannelSelectorProps {
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
}

const ChannelSelector = ({ 
  selectedChannel, 
  onChannelChange 
}: ChannelSelectorProps) => {
  const { channels, loading } = useChannels();

  return (
    <div className="w-full">
      <Select value={selectedChannel} onValueChange={onChannelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="チャンネルを選択" />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>
              読み込み中...
            </SelectItem>
          ) : (
            channels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                {channel.icon && (
                  <span className="mr-2">{channel.icon}</span>
                )}
                {channel.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChannelSelector;
