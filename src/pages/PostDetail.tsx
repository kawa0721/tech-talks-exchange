
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Post } from "@/types";
import { CHANNELS } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import PostCard from "@/components/PostCard";
import CommentSection from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            user:user_id (*)
          `)
          .eq('id', postId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          setError("投稿が見つかりません");
          return;
        }
        
        // 投稿データを変換
        const formattedPost: Post = {
          id: data.id,
          title: data.title,
          content: data.content,
          userId: data.user_id,
          user: data.user || {
            id: data.user_id,
            name: "不明なユーザー",
            avatar: undefined
          },
          channelId: data.channel_id,
          createdAt: new Date(data.created_at),
          updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
          likesCount: data.likes_count,
          commentsCount: data.comments_count,
          liked: false,
          images: data.images
        };
        
        setPost(formattedPost);
      } catch (error: any) {
        console.error("投稿取得エラー:", error);
        setError(error.message || "投稿の取得に失敗しました");
        toast({
          title: "エラー",
          description: "投稿の取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [postId]);

  // Find channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = CHANNELS.find((c) => c.id === channelId);
    return channel ? channel.name : "不明なチャンネル";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="container flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">{error}</h1>
          <p className="mb-6">お探しの投稿は存在しないか、削除されました。</p>
          <Button asChild>
            <Link to="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="container py-8 fade-in">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="flex items-center">
                <ChevronLeft className="mr-1 h-4 w-4" />
                ディスカッションに戻る
              </Link>
            </Button>
            
            <PostCard 
              post={post} 
              channelName={getChannelName(post.channelId)}
              showChannel={true} 
            />
            
            <CommentSection postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
