
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePosts } from "@/hooks/usePosts";
import { useChannels } from "@/hooks/useChannels";
import { PostsPageHeader } from "@/components/posts/PostsPageHeader";
import { PostsTabContent } from "@/components/posts/PostsTabContent";

const AllPosts = () => {
  const { type } = useParams<{ type: string }>();
  const [activeTab, setActiveTab] = useState<string>(type || "trending");
  const { posts, loading } = usePosts(activeTab);
  const { channels, loading: channelLoading } = useChannels();

  useEffect(() => {
    // Set the active tab based on the URL parameter
    if (type && (type === "trending" || type === "popular")) {
      setActiveTab(type);
    }
  }, [type]);

  // Get the channel name for a given channel ID
  const getChannelName = (channelId: string): string => {
    const channel = channels.find((c) => c.id === channelId);
    return channel ? channel.name : "不明なチャンネル";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onToggleSidebar={() => {}} />
      
      <main className="flex-1 px-6 pb-12 pt-20">
        <div className="mx-auto max-w-4xl fade-in">
          <PostsPageHeader activeTab={activeTab} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="trending">トレンド</TabsTrigger>
              <TabsTrigger value="popular">人気の投稿</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trending">
              <PostsTabContent 
                posts={posts} 
                loading={loading} 
                getChannelName={getChannelName} 
                isTrending={true}
              />
            </TabsContent>
            
            <TabsContent value="popular">
              <PostsTabContent 
                posts={posts} 
                loading={loading} 
                getChannelName={getChannelName} 
                isPopular={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AllPosts;
