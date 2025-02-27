
import { useState } from "react";
import { Hash, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { channels } from "@/lib/dummyData";
import { Channel } from "@/types";

interface ChannelListProps {
  selectedChannel: string | null;
  onSelectChannel: (channelId: string | null) => void;
}

const ChannelList = ({ selectedChannel, onSelectChannel }: ChannelListProps) => {
  return (
    <div className="py-4 h-full">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold tracking-tight">チャンネル</h2>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
            <span className="sr-only">チャンネルを追加</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          テックコミュニティに参加して、学び、共有しましょう
        </p>
      </div>
      <Separator className="my-3" />
      <ScrollArea className="h-[calc(100vh-11rem)] px-2">
        <div className="space-y-1.5 p-2">
          <Button
            variant={!selectedChannel ? "secondary" : "ghost"}
            className="w-full justify-start font-normal text-base py-5"
            onClick={() => onSelectChannel(null)}
          >
            <Hash className="mr-2 h-5 w-5" />
            すべてのチャンネル
          </Button>
          {channels.map((channel) => (
            <ChannelButton
              key={channel.id}
              channel={channel}
              isSelected={selectedChannel === channel.id}
              onClick={() => onSelectChannel(channel.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

interface ChannelButtonProps {
  channel: Channel;
  isSelected: boolean;
  onClick: () => void;
}

const ChannelButton = ({ channel, isSelected, onClick }: ChannelButtonProps) => {
  return (
    <Button
      variant={isSelected ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start font-normal text-base py-5 transition-all",
        isSelected ? "bg-secondary" : "hover:bg-secondary/50"
      )}
      onClick={onClick}
    >
      <span className="mr-3 text-lg">{channel.icon}</span>
      {channel.name}
    </Button>
  );
};

export default ChannelList;
