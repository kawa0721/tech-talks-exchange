// src/pages/AllPostsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Post, Channel } from "@/types";
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
    channels: searchParams.get("channels")?.split(",") || [],
    timeRange: searchParams.get("timeRange") || "all",
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
    
    // Log filter changes for debugging
    console.log("Filters changed:", newFilters);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    
    // Refresh posts with new sort
    fetchPosts(true);
    
    console.log("Sort changed:", option);
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
      filters.keywords.trim().length > 0
    );
  };

  // Count active filters for display
  const countActiveFilters = () => {
    let count = 0;
    if (filters.channels.length > 0) count += filters.channels.length;
    if (filters.timeRange !== "all") count++;
    if (filters.official !== undefined) count++;
    if (filters.minLikes > 0) count++;
    if (filters.minComments > 0) count++;
    if (filters.hasMedia) count++;
    if (filters.hasCode) count++;
    if (filters.createdBy) count++;
    if (filters.interactionType) count++;
    if (filters.keywords.trim().length > 0) count++;
    return count;
  };

  // Get channel name by ID
  const getChannelName = (channelId: string) => {
    const channel = channelOptions.find(ch => ch.id === channelId);
    return channel ? channel.name : channelId;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto py-4 px-4 md:px-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">すべての投稿</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/create-post")}
            >
              新規投稿
            </Button>
          </div>
        </div>
        
        {/* Filters and Sorting Row */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <PostsFilters 
            filters={filters} 
            onFilterChange={handleFilterChange}
            channelOptions={channelOptions}
          />
          
          <PostsSorting 
            sortOption={sortOption} 
            onSortChange={handleSortChange} 
          />
        </div>
        
        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                フィルター ({countActiveFilters()}):
              </span>
              
              {filters.channels.length > 0 && filters.channels.map(channelId => (
                <FilterTag 
                  key={channelId}
                  label={`チャンネル: ${getChannelName(channelId)}`}
                  onRemove={() => removeFilter("channels", channelId)}
                />
              ))}
              
              {filters.timeRange !== "all" && (
                <FilterTag 
                  label={`期間: ${filters.timeRange === "today" ? "今日" : 
                    filters.timeRange === "week" ? "今週" : 
                    filters.timeRange === "month" ? "今月" : 
                    filters.timeRange === "year" ? "今年" : filters.timeRange}`}
                  onRemove={() => removeFilter("timeRange")}
                />
              )}
              
              {filters.official !== undefined && (
                <FilterTag 
                  label={`${filters.official ? "公式" : "非公式"}のみ`}
                  onRemove={() => removeFilter("official")}
                />
              )}
              
              {filters.minLikes > 0 && (
                <FilterTag 
                  label={`いいね: ${filters.minLikes}+`}
                  onRemove={() => removeFilter("minLikes")}
                />
              )}
              
              {filters.minComments > 0 && (
                <FilterTag 
                  label={`コメント: ${filters.minComments}+`}
                  onRemove={() => removeFilter("minComments")}
                />
              )}
              
              {filters.hasMedia && (
                <FilterTag 
                  label="画像あり"
                  onRemove={() => removeFilter("hasMedia")}
                />
              )}
              
              {filters.hasCode && (
                <FilterTag 
                  label="コードブロックあり"
                  onRemove={() => removeFilter("hasCode")}
                />
              )}
              
              {filters.createdBy && (
                <FilterTag 
                  label={`投稿者: ${filters.createdBy}`}
                  onRemove={() => removeFilter("createdBy")}
                />
              )}
              
              {filters.interactionType && (
                <FilterTag 
                  label={`${filters.interactionType === "liked" ? "いいねした" : 
                    filters.interactionType === "commented" ? "コメントした" : 
                    filters.interactionType === "saved" ? "保存した" : ""}`}
                  onRemove={() => removeFilter("interactionType")}
                />
              )}
              
              {filters.keywords && (
                <FilterTag 
                  label={`キーワード: ${filters.keywords}`}
                  onRemove={() => removeFilter("keywords")}
                />
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAllFilters}
                className="ml-2 text-sm h-8 px-2"
              >
                すべてクリア
              </Button>
            </div>
          </div>
        )}
        
        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-2xl font-semibold mb-2">該当する投稿がありません</h3>
            <p className="text-muted-foreground mb-4">
              検索条件を変更するか、フィルターをクリアしてください
            </p>
            <Button onClick={handleClearAllFilters}>
              フィルターをクリア
            </Button>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {posts.length}件の投稿が見つかりました
            </div>
            
            <PostsList 
              posts={posts} 
              onSelectChannel={(channelId) => {
                // Add channel to filter
                if (!filters.channels.includes(channelId)) {
                  setFilters({
                    ...filters,
                    channels: [...filters.channels, channelId]
                  });
                  fetchPosts(true);
                }
              }}
            />
            
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <LoadMoreButton 
                  loading={loadingMore} 
                  onClick={handleLoadMore} 
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AllPostsPage;
