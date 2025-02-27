
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ChannelList from "@/components/ChannelList";
import PostCard from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm";
import { Post } from "@/types";
import { channels, getPostsForChannel } from "@/lib/dummyData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

  // Fetch posts based on selected channel
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPosts(getPostsForChannel(selectedChannel));
      setLoading(false);
    }, 500);
  }, [selectedChannel]);

  // Handle post creation
  const handlePostCreated = () => {
    // Refresh posts
    setPosts(getPostsForChannel(selectedChannel));
  };

  // Find channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = channels.find((c) => c.id === channelId);
    return channel ? channel.name : "不明なチャンネル";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="container flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-background pt-16 transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ChannelList
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
          />
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={`flex-1 px-4 pb-12 pt-16 ${sidebarOpen ? "lg:pl-64" : ""}`}>
          <div className="mx-auto max-w-3xl fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">
                {selectedChannel 
                  ? `${getChannelName(selectedChannel)} ディスカッション` 
                  : "すべてのディスカッション"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {selectedChannel
                  ? channels.find(c => c.id === selectedChannel)?.description
                  : "全てのテックチャンネルでの会話に参加しましょう"}
              </p>
            </div>

            <CreatePostForm 
              channelId={selectedChannel} 
              onPostCreated={handlePostCreated} 
            />

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    channelName={getChannelName(post.channelId)}
                    showChannel={!selectedChannel} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <h3 className="text-xl font-medium mb-2">まだ投稿がありません</h3>
                <p className="text-muted-foreground">
                  このチャンネルで最初のディスカッションを始めましょう！
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
