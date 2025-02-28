
import { Channel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendedChannelsProps {
  channels: Channel[];
  onSelectChannel: (channelId: string) => void;
}

const RecommendedChannels = ({ channels, onSelectChannel }: RecommendedChannelsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">おすすめチャンネル</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <Card 
              key={channel.id} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelectChannel(channel.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">{channel.icon}</div>
                  <h3 className="font-medium">{channel.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedChannels;
