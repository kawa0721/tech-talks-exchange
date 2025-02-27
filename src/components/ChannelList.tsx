
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
    <div className="py-2">
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Channels</h2>
          <Button variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add channel</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Join tech communities to learn and share
        </p>
      </div>
      <Separator className="my-2" />
      <ScrollArea className="h-[calc(100vh-10rem)] px-1">
        <div className="space-y-1 p-2">
          <Button
            variant={!selectedChannel ? "secondary" : "ghost"}
            className="w-full justify-start font-normal"
            onClick={() => onSelectChannel(null)}
          >
            <Hash className="mr-2 h-4 w-4" />
            All Channels
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
        "w-full justify-start font-normal transition-all",
        isSelected ? "bg-secondary" : "hover:bg-secondary/50"
      )}
      onClick={onClick}
    >
      <span className="mr-2">{channel.icon}</span>
      {channel.name}
    </Button>
  );
};

export default ChannelList;
