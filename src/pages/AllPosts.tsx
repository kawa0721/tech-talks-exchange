
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Post } from "@/types";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { POSTS, CHANNELS, TRENDING_POSTS, POPULAR_POSTS } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const AllPosts = () => {
  const { type } = useParams<{ type: string }>();
  const [activeTab, setActiveTab] = useState<string>(type || "trending");

  useEffect(() => {
    // Set the active tab based on the URL parameter
    if (type && (type === "trending" || type === "popular")) {
      setActiveTab(type);
    }
  }, [type]);

  // Get the channel name for a given channel ID
  const getChannelName = (channelId: string): string => {
    const channel = CHANNELS.find((c) => c.id === channelId);
    return channel ? channel.name : "不明なチャンネル";
  };

  // Choose which posts to display based on the active tab
  const displayPosts = activeTab === "trending" ? TRENDING_POSTS : POPULAR_POSTS;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onToggleSidebar={() => {}} />
      
      <main className="flex-1 px-6 pb-12 pt-20">
        <div className="mx-auto max-w-4xl fade-in">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4" 
              asChild
            >
              <Link to="/" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                トップに戻る
              </Link>
            </Button>
            
            <h1 className="text-3xl font-bold">
              {activeTab === "trending" ? "トレンドの投稿" : "人気の投稿"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {activeTab === "trending" 
                ? "最近の注目を集めている話題をチェックしましょう" 
                : "コミュニティで人気の投稿をチェックしましょう"}
            </p>
          </div>

          <Separator className="my-6" />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="trending">トレンド</TabsTrigger>
              <TabsTrigger value="popular">人気の投稿</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trending" className="space-y-6">
              {displayPosts.length > 0 ? (
                displayPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    channelName={getChannelName(post.channelId)}
                    showChannel={true}
                    isTrending={true}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">トレンドの投稿はまだありません</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-6">
              {displayPosts.length > 0 ? (
                displayPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    channelName={getChannelName(post.channelId)}
                    showChannel={true}
                    isPopular={true}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">人気の投稿はまだありません</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AllPosts;
