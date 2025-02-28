
import { useState } from "react";
import { ChevronDown, ChevronRight, Hash, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CHANNELS, CHANNEL_CATEGORIES } from "@/lib/dummyData";
import { Channel, ChannelCategory } from "@/types";

interface ChannelListProps {
  selectedChannel: string | null;
  onSelectChannel: (channelId: string | null) => void;
}

const ChannelList = ({ selectedChannel, onSelectChannel }: ChannelListProps) => {
  // State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Initially expand all categories
    return CHANNEL_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
  });

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Group channels by category
  const channelsByCategory = CHANNEL_CATEGORIES.map(category => {
    const categoryChannels = CHANNELS.filter(channel => channel.categoryId === category.id);
    return {
      category,
      channels: categoryChannels
    };
  });

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
          
          {/* Display channels grouped by category */}
          {channelsByCategory.map(({ category, channels }) => (
            <div key={category.id} className="mt-4">
              <Collapsible
                open={expandedCategories[category.id]}
                onOpenChange={() => toggleCategory(category.id)}
                className="space-y-2"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between font-medium text-base pl-2 py-2 hover:bg-secondary/50"
                  >
                    <div className="flex items-center">
                      {expandedCategories[category.id] ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      {category.name}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {channels.length}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-4">
                  {channels.map((channel) => (
                    <ChannelButton
                      key={channel.id}
                      channel={channel}
                      isSelected={selectedChannel === channel.id}
                      onClick={() => onSelectChannel(channel.id)}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
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
        "w-full justify-start font-normal text-base py-4 transition-all",
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
