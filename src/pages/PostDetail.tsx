
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Post, User } from "@/types";
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
        // まず投稿データを取得
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();
          
        if (postError) {
          throw postError;
        }
        
        if (!postData) {
          setError("投稿が見つかりません");
          return;
        }
        
        // 次にユーザー情報を取得
        let userData: User = {
          id: postData.user_id,
          name: "不明なユーザー",
          avatar: undefined
        };
        
        if (postData.user_id) {
          const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', postData.user_id)
            .single();
          
          if (!userError && user) {
            userData = {
              id: user.id,
              name: user.name || user.username || "匿名ユーザー",
              avatar: user.avatar_url
            };
          }
        }
        
        // 投稿データを変換
        const formattedPost: Post = {
          id: postData.id,
          title: postData.title,
          content: postData.content,
          userId: postData.user_id,
          user: userData,
          channelId: postData.channel_id,
          createdAt: new Date(postData.created_at),
          updatedAt: postData.updated_at ? new Date(postData.updated_at) : undefined,
          likesCount: postData.likes_count,
          commentsCount: postData.comments_count,
          liked: false,
          images: postData.images
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
