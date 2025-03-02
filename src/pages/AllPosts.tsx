import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Post, Channel } from "@/types";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AllPosts = () => {
  const { type } = useParams<{ type: string }>();
  const [activeTab, setActiveTab] = useState<string>(type || "trending");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelLoading, setChannelLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set the active tab based on the URL parameter
    if (type && (type === "trending" || type === "popular")) {
      setActiveTab(type);
    }
  }, [type]);

  // チャンネル情報をDBから取得
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*');
          
        if (error) {
          console.error("チャンネル取得エラー:", error);
          return;
        }
        
        const formattedChannels: Channel[] = data.map(channel => ({
          id: channel.id,
          name: channel.name,
          description: channel.description,
          icon: channel.icon,
          categoryId: channel.category_id
        }));
        
        setChannels(formattedChannels);
      } catch (error) {
        console.error("チャンネル取得エラー:", error);
      } finally {
        setChannelLoading(false);
      }
    };
    
    fetchChannels();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('posts')
          .select('*');
        
        if (activeTab === "popular") {
          // 人気の投稿（いいね数で並び替え）
          query = query.order('likes_count', { ascending: false });
        } else {
          // トレンドの投稿（最新の投稿）
          query = query.order('created_at', { ascending: false });
        }
        
        // 最大10件を取得
        query = query.limit(10);
        
        const { data: postsData, error: postsError } = await query;
        
        if (postsError) {
          throw postsError;
        }

        if (!postsData || postsData.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        
        // For each post, get the user information
        const formattedPosts: Post[] = await Promise.all(
          postsData.map(async (post) => {
            let userData = {
              id: post.user_id || "unknown",
              name: "不明なユーザー",
              avatar: undefined
            };

            if (post.user_id) {
              // Fetch the user profile
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', post.user_id)
                .single();

              if (!profileError && profile) {
                userData = {
                  id: profile.id,
                  name: profile.username || "匿名ユーザー",
                  avatar: profile.avatar_url
                };
              }
            }

            return {
              id: post.id,
              title: post.title,
              content: post.content,
              userId: post.user_id || "unknown",
              user: userData,
              channelId: post.channel_id,
              createdAt: new Date(post.created_at),
              updatedAt: post.updated_at ? new Date(post.updated_at) : undefined,
              likesCount: post.likes_count,
              commentsCount: post.comments_count,
              liked: false,
              images: post.images || []
            };
          })
        );
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error("投稿取得エラー:", error);
        toast({
          title: "エラー",
          description: "投稿の取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [activeTab]);

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
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="trending" className="space-y-6">
                  {posts.length > 0 ? (
                    posts.map((post) => (
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
                  {posts.length > 0 ? (
                    posts.map((post) => (
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
              </>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AllPosts;
