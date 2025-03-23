import { useState } from "react";
import { 
  Check, ChevronDown, Filter, X, Calendar, Hash, Image, Code, Heart, MessageSquare, User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FilterOptions, PostsFiltersProps } from "@/types/filters";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const PostsFilters = ({ 
  filters, 
  onFilterChange,
  channelOptions
}: PostsFiltersProps) => {
  const { user } = useAuth();
  
  // 各フィルターのポップオーバーの開閉状態
  const [channelPopoverOpen, setChannelPopoverOpen] = useState(false);
  const [timeRangePopoverOpen, setTimeRangePopoverOpen] = useState(false);
  const [contentTypePopoverOpen, setContentTypePopoverOpen] = useState(false);
  const [popularityPopoverOpen, setPopularityPopoverOpen] = useState(false);
  const [interactionPopoverOpen, setInteractionPopoverOpen] = useState(false);
  
  // チャンネル選択用の検索値
  const [channelSearchValue, setChannelSearchValue] = useState("");
  
  // フィルター変更を適用する関数
  const applyFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };
  
  // チャンネル選択を適用する関数
  const toggleChannelSelection = (channelId: string) => {
    const newChannels = filters.channels.includes(channelId)
      ? filters.channels.filter(id => id !== channelId)
      : [...filters.channels, channelId];
    
    applyFilterChange("channels", newChannels);
  };
  
  // 時間範囲オプション
  const timeRangeOptions = [
    { value: "all", label: "すべての期間" },
    { value: "today", label: "今日" },
    { value: "week", label: "直近1週間" },
    { value: "month", label: "直近1ヶ月" },
    { value: "threemonths", label: "直近3ヶ月" },
    { value: "year", label: "直近1年" },
  ];
  
  // 選択されているチャンネル数をバッジに表示
  const selectedChannelsCount = filters.channels.length;
  
  // タイムレンジの現在の選択を表示
  const selectedTimeRange = timeRangeOptions.find(option => option.value === filters.timeRange)?.label || "すべての期間";
  
  // コンテンツタイプの選択数
  const contentTypeCount = (filters.hasMedia ? 1 : 0) + (filters.hasCode ? 1 : 0);
  
  // 人気度フィルターの適用数
  const popularityCount = (filters.minLikes > 0 ? 1 : 0) + (filters.minComments > 0 ? 1 : 0);
  
  return (
    <div className="flex flex-wrap gap-2 w-full mb-8">
      {/* キーワード検索フィールド */}
      <div className="flex items-center w-full mb-2 sm:mb-0 sm:w-auto sm:flex-1 max-w-xs">
        <Input
          placeholder="キーワード検索"
          value={filters.keywords}
          onChange={(e) => applyFilterChange("keywords", e.target.value)}
          className="h-10"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* チャンネルフィルター */}
        <Popover open={channelPopoverOpen} onOpenChange={setChannelPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-1">
              <Hash className="h-4 w-4" />
              <span>チャンネル</span>
              {selectedChannelsCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full">
                  {selectedChannelsCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="チャンネルを検索..." 
                value={channelSearchValue}
                onValueChange={setChannelSearchValue}
              />
              <CommandList className="max-h-[300px] overflow-auto">
                <CommandEmpty>チャンネルが見つかりません</CommandEmpty>
                <CommandGroup>
                  {channelOptions
                    .filter(channel => 
                      channel.name.toLowerCase().includes(channelSearchValue.toLowerCase())
                    )
                    .map(channel => (
                      <CommandItem
                        key={channel.id}
                        onSelect={() => toggleChannelSelection(channel.id)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-4 w-4 items-center justify-center">
                          {filters.channels.includes(channel.id) ? (
                            <Check className="h-3 w-3" />
                          ) : null}
                        </div>
                        <span>{channel.name}</span>
                      </CommandItem>
                    ))
                  }
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* 時間範囲フィルター */}
        <Popover open={timeRangePopoverOpen} onOpenChange={setTimeRangePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-1">
              <Calendar className="h-4 w-4" />
              <span>{selectedTimeRange}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {timeRangeOptions.map(option => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        applyFilterChange("timeRange", option.value);
                        setTimeRangePopoverOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {filters.timeRange === option.value ? (
                          <Check className="h-3 w-3" />
                        ) : null}
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* コンテンツタイプフィルター */}
        <Popover open={contentTypePopoverOpen} onOpenChange={setContentTypePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-1">
              <Image className="h-4 w-4" />
              <span>コンテンツタイプ</span>
              {contentTypeCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full">
                  {contentTypeCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-media" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span>画像/動画あり</span>
                </Label>
                <Switch 
                  id="filter-media" 
                  checked={!!filters.hasMedia}
                  onCheckedChange={(checked) => applyFilterChange("hasMedia", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>コードブロックあり</span>
                </Label>
                <Switch 
                  id="filter-code" 
                  checked={!!filters.hasCode}
                  onCheckedChange={(checked) => applyFilterChange("hasCode", checked)}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* 人気度フィルター */}
        <Popover open={popularityPopoverOpen} onOpenChange={setPopularityPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-1">
              <Heart className="h-4 w-4" />
              <span>人気度</span>
              {popularityCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full">
                  {popularityCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-4" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="min-likes" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>最小いいね数: {filters.minLikes}</span>
                  </Label>
                </div>
                <Slider
                  id="min-likes"
                  min={0}
                  max={100}
                  step={1}
                  value={[filters.minLikes]}
                  onValueChange={(value) => applyFilterChange("minLikes", value[0])}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="min-comments" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>最小コメント数: {filters.minComments}</span>
                  </Label>
                </div>
                <Slider
                  id="min-comments"
                  min={0}
                  max={50}
                  step={1}
                  value={[filters.minComments]}
                  onValueChange={(value) => applyFilterChange("minComments", value[0])}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* ユーザーインタラクションフィルター (ログイン時のみ) */}
        {user && (
          <Popover open={interactionPopoverOpen} onOpenChange={setInteractionPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-1">
                <User className="h-4 w-4" />
                <span>あなたの投稿</span>
                {filters.interactionType && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full">1</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => applyFilterChange(
                        "interactionType", 
                        filters.interactionType === "liked" ? undefined : "liked"
                      )}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {filters.interactionType === "liked" ? (
                          <Check className="h-3 w-3" />
                        ) : null}
                      </div>
                      <span>いいねした投稿</span>
                    </CommandItem>
                    
                    <CommandItem
                      onSelect={() => applyFilterChange(
                        "interactionType", 
                        filters.interactionType === "commented" ? undefined : "commented"
                      )}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {filters.interactionType === "commented" ? (
                          <Check className="h-3 w-3" />
                        ) : null}
                      </div>
                      <span>コメントした投稿</span>
                    </CommandItem>
                    
                    <CommandItem
                      onSelect={() => applyFilterChange(
                        "interactionType", 
                        filters.interactionType === "saved" ? undefined : "saved"
                      )}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {filters.interactionType === "saved" ? (
                          <Check className="h-3 w-3" />
                        ) : null}
                      </div>
                      <span>保存した投稿</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default PostsFilters; 