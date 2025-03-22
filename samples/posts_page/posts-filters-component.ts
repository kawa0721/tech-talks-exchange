// src/components/posts/PostsFilters.tsx
import { useState } from "react";
import { Check, ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FilterOptions, PostsFiltersProps } from "@/types/filters";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const PostsFilters = ({ 
  filters, 
  onFilterChange,
  channelOptions
}: PostsFiltersProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  // チャンネル選択用のフィルターの状態
  const [channelSearchValue, setChannelSearchValue] = useState("");
  const [showChannelSelector, setShowChannelSelector] = useState(false);
  
  // フィルター数のカウント
  const filtersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === "channels" && Array.isArray(value) && value.length > 0) {
      return count + value.length;
    }
    if (key === "timeRange" && value !== "all") {
      return count + 1;
    }
    if (key === "minLikes" && value > 0) {
      return count + 1;
    }
    if (key === "minComments" && value > 0) {
      return count + 1;
    }
    if (
      (key === "official" || 
       key === "hasMedia" || 
       key === "hasCode") && 
      value === true
    ) {
      return count + 1;
    }
    if ((key === "createdBy" || key === "interactionType") && value) {
      return count + 1;
    }
    if (key === "keywords" && value.trim().length > 0) {
      return count + 1;
    }
    return count;
  }, 0);
  
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
  
  // 時間範囲選択
  const timeRangeOptions = [
    { value: "all", label: "すべての期間" },
    { value: "today", label: "今日" },
    { value: "week", label: "過去7日間" },
    { value: "month", label: "過去1ヶ月" },
    { value: "threemonths", label: "過去3ヶ月" },
    { value: "year", label: "過去1年" },
    { value: "custom", label: "カスタム期間" },
  ];
  
  // 公式/非公式フィルター設定
  const toggleOfficialFilter = (value: boolean | undefined) => {
    // 現在と同じ値が選択された場合はリセット
    const newValue = filters.official === value ? undefined : value;
    applyFilterChange("official", newValue);
  };
  
  // いいね数スライダーの処理
  const handleLikesSliderChange = (value: number[]) => {
    applyFilterChange("minLikes", value[0]);
  };
  
  // コメント数スライダーの処理
  const handleCommentsSliderChange = (value: number[]) => {
    applyFilterChange("minComments", value[0]);
  };
  
  // インタラクションタイプの選択処理
  const setInteractionType = (type: "liked" | "commented" | "saved" | undefined) => {
    // 現在と同じ値が選択された場合はリセット
    const newValue = filters.interactionType === type ? undefined : type;
    applyFilterChange("interactionType", newValue);
  };
  
  // メディア・コードブロックフィルターのトグル
  const toggleMediaFilter = () => {
    applyFilterChange("hasMedia", !filters.hasMedia);
  };
  
  const toggleCodeFilter = () => {
    applyFilterChange("hasCode", !filters.hasCode);
  };
  
  // キーワード検索の適用
  const handleKeywordChange = (value: string) => {
    applyFilterChange("keywords", value);
  };
  
  // フィルタードロップダウン
  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1">
            <Filter className="h-4 w-4" />
            フィルター
            {filtersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 min-w-5 px-1 rounded-full"
              >
                {filtersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64 md:w-80">
          <DropdownMenuLabel>投稿フィルター</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            {/* チャンネルフィルター */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>チャンネル</span>
                {filters.channels.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto"
                  >
                    {filters.channels.length}
                  </Badge>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="min-w-[220px]">
                  <Command>
                    <CommandInput 
                      placeholder="チャンネルを検索..." 
                      value={channelSearchValue}
                      onValueChange={setChannelSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>チャンネルが見つかりません</CommandEmpty>
                      <CommandGroup>
                        {channelOptions
                          .filter(channel => 
                            channel.name.toLowerCase().includes(channelSearchValue.toLowerCase())
                          )
                          .slice(0, 10) // 表示数を制限
                          .map(channel => (
                            <CommandItem
                              key={channel.id}
                              onSelect={() => toggleChannelSelection(channel.id)}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className={cn(
                                  "w-4 h-4 rounded-sm border flex items-center justify-center",
                                  filters.channels.includes(channel.id) 
                                    ? "bg-primary border-primary" 
                                    : "border-input"
                                )}>
                                  {filters.channels.includes(channel.id) && (
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  )}
                                </div>
                                <span>{channel.name}</span>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  
                  {/* もっと表示ボタン（オプション） */}
                  {channelOptions.length > 10 && (
                    <div className="px-2 py-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setShowChannelSelector(true)}
                      >
                        すべてのチャンネルを表示
                      </Button>
                    </div>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
            {/* 時間範囲フィルター */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>投稿期間</span>
                {filters.timeRange !== "all" && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto"
                  >
                    {timeRangeOptions.find(o => o.value === filters.timeRange)?.label}
                  </Badge>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {timeRangeOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => applyFilterChange("timeRange", option.value)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded-sm border flex items-center justify-center",
                          filters.timeRange === option.value 
                            ? "bg-primary border-primary" 
                            : "border-input"
                        )}>
                          {filters.timeRange === option.value && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span>{option.label}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  
                  {/* カスタム期間のセレクター（timeRange が custom の場合） */}
                  {filters.timeRange === "custom" && (
                    <div className="px-3 py-2 space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="start-date">開始日</Label>
                        <Input 
                          id="start-date"
                          type="date"
                          value={filters.dateStart || ""}
                          onChange={(e) => applyFilterChange("dateStart", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="end-date">終了日</Label>
                        <Input 
                          id="end-date"
                          type="date"
                          value={filters.dateEnd || ""}
                          onChange={(e) => applyFilterChange("dateEnd", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
            {/* 公式/非公式フィルター */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>公式/非公式</span>
                {filters.official !== undefined && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto"
                  >
                    {filters.official ? "公式のみ" : "非公式のみ"}
                  </Badge>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onSelect={() => toggleOfficialFilter(true)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded-sm border flex items-center justify-center",
                        filters.official === true 
                          ? "bg-primary border-primary" 
                          : "border-input"
                      )}>
                        {filters.official === true && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span>公式投稿のみ</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => toggleOfficialFilter(false)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded-sm border flex items-center justify-center",
                        filters.official === false
                          ? "bg-primary border-primary" 
                          : "border-input"
                      )}>
                        {filters.official === false && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span>非公式投稿のみ</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
            {/* いいね数フィルター */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>いいね数</span>
                {filters.minLikes > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto"
                  >
                    {filters.minLikes}+
                  </Badge>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>最低いいね数</Label>
                      <span className="text-sm font-medium">
                        {filters.minLikes}+
                      </span>
                    </div>
                    <Slider
                      value={[filters.minLikes]}
                      max={100}
                      step={1}
                      onValueChange={handleLikesSliderChange}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100+</span>
                    </div>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
            {/* コメント数フィルター */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>コメント数</span>
                {filters.minComments > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto"
                  >
                    {filters.minComments}+
                  </Badge>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>最低コメント数</Label>
                      <span className="text-sm font-medium">
                        {filters.minComments}+
                      </span>
                    </div>
                    <Slider
                      value={[filters.minComments]}
                      max={50}
                      step={1}
                      onValueChange={handleCommentsSliderChange}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>10</span>
                      <span>20</span>
                      <span>30</span>
                      <span>50+</span>
                    </div>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
            {/* コンテンツタイプフィルター */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>コンテンツタイプ</span>
                {(filters.hasMedia || filters.hasCode) && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto"
                  >
                    {[
                      filters.hasMedia ? "画像" : null,
                      filters.hasCode ? "コード" : null
                    ].filter(Boolean).join("/")}
                  </Badge>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="media-filter">
                        画像を含む投稿のみ
                      </Label>
                      <Switch
                        id="media-filter"
                        checked={!!filters.hasMedia}
                        onCheckedChange={toggleMediaFilter}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="code-filter">
                        コードブロックを含む投稿のみ
                      </Label>
                      <Switch
                        id="code-filter"
                        checked={!!filters.hasCode}
                        onCheckedChange={toggleCodeFilter}
                      />
                    </div>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
            {/* ユーザーインタラクションフィルター */}
            {user && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>あなたのアクティビティ</span>
                  {filters.interactionType && (
                    <Badge 
                      variant="secondary" 
                      className="ml-auto"
                    >
                      {filters.interactionType === "liked" ? "いいね済み" :
                       filters.interactionType === "commented" ? "コメント済み" :
                       filters.interactionType === "saved" ? "保存済み" : ""}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onSelect={() => setInteractionType("liked")}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded-sm border flex items-center justify-center",
                          filters.interactionType === "liked"
                            ? "bg-primary border-primary" 
                            : "border-input"
                        )}>
                          {filters.interactionType === "liked" && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span>いいねした投稿</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setInteractionType("commented")}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded-sm border flex items-center justify-center",
                          filters.interactionType === "commented"
                            ? "bg-primary border-primary" 
                            : "border-input"
                        )}>
                          {filters.interactionType === "commented" && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span>コメントした投稿</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setInteractionType("saved")}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded-sm border flex items-center justify-center",
                          filters.interactionType === "saved"
                            ? "bg-primary border-primary" 
                            : "border-input"
                        )}>
                          {filters.interactionType === "saved" && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span>保存した投稿</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* キーワード検索 */}
          <div className="p-2">
            <div className="space-y-2">
              <Label htmlFor="keywords">キーワード検索</Label>
              <div className="flex gap-2">
                <Input
                  id="keywords"
                  placeholder="検索..."
                  value={filters.keywords}
                  onChange={(e) => handleKeywordChange(e.target.value)}
                />
                {filters.keywords && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleKeywordChange("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* チャンネル選択モーダル (オプション) */}
      {showChannelSelector && (
        // チャンネル選択用のモーダルを表示
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-background border rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">チャンネルを選択</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChannelSelector(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="チャンネルを検索..."
                value={channelSearchValue}
                onChange={(e) => setChannelSearchValue(e.target.value)}
              />
              
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {channelOptions
                  .filter(channel => 
                    channel.name.toLowerCase().includes(channelSearchValue.toLowerCase())
                  )
                  .map(channel => (
                    <div
                      key={channel.id}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => toggleChannelSelection(channel.id)}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-sm border flex items-center justify-center",
                        filters.channels.includes(channel.id) 
                          ? "bg-primary border-primary" 
                          : "border-input"
                      )}>
                        {filters.channels.includes(channel.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span>{channel.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {channel.description}
                      </span>
                    </div>
                  ))}
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowChannelSelector(false)}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={() => setShowChannelSelector(false)}
                >
                  完了
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsFilters;
