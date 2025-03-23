import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PostsFilters from "@/components/posts/PostsFilters";
import PostsSorting from "@/components/posts/PostsSorting";
import PostsList from "@/components/PostsList";
import LoadMoreButton from "@/components/LoadMoreButton";
import { useFilteredPosts } from "@/hooks/posts/useFilteredPosts";
import { FilterTag } from "@/components/posts/FilterTag";
import { FilterOptions, SortOption } from "@/types/filters";
import { Loader2 } from "lucide-react";

const AllPostsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize filter state from URL params
  const initialFilters: FilterOptions = {
    channels: searchParams.get("channels")?.split(",").filter(Boolean) || [],
    timeRange: (searchParams.get("timeRange") as FilterOptions["timeRange"]) || "all",
    official: searchParams.get("official") === "true" ? true : 
              searchParams.get("official") === "false" ? false : undefined,
    minLikes: searchParams.get("minLikes") ? parseInt(searchParams.get("minLikes") || "0") : 0,
    minComments: searchParams.get("minComments") ? parseInt(searchParams.get("minComments") || "0") : 0,
    hasMedia: searchParams.get("hasMedia") === "true" ? true : undefined,
    hasCode: searchParams.get("hasCode") === "true" ? true : undefined,
    createdBy: searchParams.get("createdBy") || undefined,
    interactionType: (searchParams.get("interactionType") as "liked" | "commented" | "saved" | undefined) || undefined,
    keywords: searchParams.get("keywords") || "",
  };

  const initialSort: SortOption = (searchParams.get("sort") as SortOption) || "latest";

  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [sortOption, setSortOption] = useState<SortOption>(initialSort);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    fetchPosts,
    channelOptions
  } = useFilteredPosts({
    filters,
    sortOption,
    perPage: 15
  });

  // Update URL params when filters or sort changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (filters.channels.length > 0) newParams.set("channels", filters.channels.join(","));
    if (filters.timeRange !== "all") newParams.set("timeRange", filters.timeRange);
    if (filters.official !== undefined) newParams.set("official", filters.official.toString());
    if (filters.minLikes > 0) newParams.set("minLikes", filters.minLikes.toString());
    if (filters.minComments > 0) newParams.set("minComments", filters.minComments.toString());
    if (filters.hasMedia) newParams.set("hasMedia", "true");
    if (filters.hasCode) newParams.set("hasCode", "true");
    if (filters.createdBy) newParams.set("createdBy", filters.createdBy);
    if (filters.interactionType) newParams.set("interactionType", filters.interactionType);
    if (filters.keywords) newParams.set("keywords", filters.keywords);
    
    newParams.set("sort", sortOption);
    
    setSearchParams(newParams);
  }, [filters, sortOption, setSearchParams]);

  const handleLoadMore = () => {
    fetchPosts(false);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Reset to first page when filters change
    fetchPosts(true);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    
    // Refresh posts with new sort
    fetchPosts(true);
  };

  const handleClearAllFilters = () => {
    setFilters({
      channels: [],
      timeRange: "all",
      official: undefined,
      minLikes: 0,
      minComments: 0,
      hasMedia: undefined,
      hasCode: undefined,
      createdBy: undefined,
      interactionType: undefined,
      keywords: "",
    });
    
    fetchPosts(true);
    
    toast({
      title: "フィルターをリセットしました",
      description: "全ての投稿が表示されます"
    });
  };

  const removeFilter = (key: keyof FilterOptions, value?: string) => {
    const newFilters = { ...filters };
    
    if (key === "channels" && value) {
      newFilters.channels = filters.channels.filter(ch => ch !== value);
    } else if (Array.isArray(newFilters[key])) {
      // @ts-ignore - We already checked that it's an array
      newFilters[key] = [];
    } else if (typeof newFilters[key] === "number") {
      // @ts-ignore - We know it's a number
      newFilters[key] = 0;
    } else {
      // @ts-ignore - Set to undefined for boolean or string
      newFilters[key] = undefined;
    }
    
    setFilters(newFilters);
    fetchPosts(true);
  };

  // Check if we have any active filters
  const hasActiveFilters = () => {
    return (
      filters.channels.length > 0 ||
      filters.timeRange !== "all" ||
      filters.official !== undefined ||
      filters.minLikes > 0 ||
      filters.minComments > 0 ||
      filters.hasMedia ||
      filters.hasCode ||
      filters.createdBy ||
      filters.interactionType ||
      filters.keywords.trim() !== ""
    );
  };

  // Get channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = channelOptions.find(ch => ch.id === channelId);
    return channel ? channel.name : channelId;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="container max-md:px-4 pt-20 md:py-4 sm:py-6 space-y-4 fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">すべての投稿</h1>
          <PostsSorting sortOption={sortOption} onSortChange={handleSortChange} />
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <PostsFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            channelOptions={channelOptions}
          />
          
          {hasActiveFilters() && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAllFilters}
              className="h-8"
            >
              すべてクリア
            </Button>
          )}
        </div>
        
        {/* アクティブフィルターのタグを表示 */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.channels.map(channelId => (
              <FilterTag 
                key={`channel-${channelId}`}
                label={`チャンネル: ${getChannelName(channelId)}`}
                onRemove={() => removeFilter("channels", channelId)}
              />
            ))}
            
            {filters.timeRange !== "all" && (
              <FilterTag 
                label={`期間: ${
                  {
                    today: "今日",
                    week: "直近1週間",
                    month: "直近1ヶ月",
                    threemonths: "直近3ヶ月",
                    year: "直近1年",
                    custom: "カスタム期間"
                  }[filters.timeRange] || filters.timeRange
                }`}
                onRemove={() => removeFilter("timeRange")}
              />
            )}
            
            {filters.minLikes > 0 && (
              <FilterTag 
                label={`最小いいね数: ${filters.minLikes}`}
                onRemove={() => removeFilter("minLikes")}
              />
            )}
            
            {filters.minComments > 0 && (
              <FilterTag 
                label={`最小コメント数: ${filters.minComments}`}
                onRemove={() => removeFilter("minComments")}
              />
            )}
            
            {filters.hasMedia && (
              <FilterTag 
                label="画像/動画あり"
                onRemove={() => removeFilter("hasMedia")}
              />
            )}
            
            {filters.hasCode && (
              <FilterTag 
                label="コードブロックあり"
                onRemove={() => removeFilter("hasCode")}
              />
            )}
            
            {filters.interactionType && (
              <FilterTag 
                label={`${
                  {
                    liked: "いいねした投稿",
                    commented: "コメントした投稿",
                    saved: "保存した投稿"
                  }[filters.interactionType]
                }`}
                onRemove={() => removeFilter("interactionType")}
              />
            )}
            
            {filters.keywords && (
              <FilterTag 
                label={`キーワード: ${filters.keywords}`}
                onRemove={() => removeFilter("keywords")}
              />
            )}
          </div>
        )}
        
        {/* 投稿一覧 */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length > 0 ? (
            <>
              <PostsList 
                posts={posts} 
                loading={false} 
                getChannelName={getChannelName}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
              />
              
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <LoadMoreButton
                    onLoadMore={handleLoadMore}
                    loading={loadingMore}
                    hasMore={hasMore}
                    postsCount={posts.length}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">投稿が見つかりませんでした</h3>
              <p className="text-muted-foreground">
                検索条件を変更してみてください
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllPostsPage; 