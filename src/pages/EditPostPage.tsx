import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post, User } from "@/types";
import EditPostForm from "@/components/EditPostForm";

const EditPostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const navigate = useNavigate();
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
        
        // 認証状態を確認
        const { data: { user } } = await supabase.auth.getUser();
        
        // 自分の投稿かチェック
        if (!user || user.id !== postData.user_id) {
          setError("この投稿を編集する権限がありません");
          return;
        }
        
        // ユーザー情報を取得
        let userData: User = {
          id: postData.user_id || "unknown",
          name: "匿名ユーザー",
          avatar: undefined
        };
        
        if (postData.user_id) {
          const { data: profile, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', postData.user_id)
            .single();
              
          if (!userError && profile) {
            // ユーザー名が設定されていない場合はユーザーIDの一部を表示
            const displayName = profile.username || `ユーザー_${postData.user_id.substring(0, 5)}`;
            
            userData = {
              id: profile.id,
              name: displayName,
              avatar: profile.avatar_url
            };
          }
        }
        
        // 投稿データを変換
        const formattedPost: Post = {
          id: postData.id,
          title: postData.title,
          content: postData.content,
          userId: postData.user_id || "unknown",
          user: userData,
          channelId: postData.channel_id,
          createdAt: new Date(postData.created_at),
          updatedAt: postData.updated_at ? new Date(postData.updated_at) : undefined,
          likesCount: 0,
          commentsCount: 0,
          images: postData.images || []
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

  const handlePostUpdated = () => {
    navigate(`/post/${postId}`);
  };

  // サイドバーのピン状態が変更されたときの処理
  const handlePinChange = (isPinned: boolean) => {
    setSidebarPinned(isPinned);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
        <div className="container flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">{error}</h1>
          <p className="mb-6">投稿の編集ができません。</p>
          <Button asChild>
            <Link to="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
      
      <div className="flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isPinned={sidebarPinned}
          onPinChange={handlePinChange}
          selectedChannel={null}
          onSelectChannel={() => {}}
        />
        
        <div className={`container py-8 fade-in transition-all duration-300 ${sidebarPinned ? 'lg:ml-72' : ''}`}>
          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <Button variant="ghost" asChild className="mb-4">
                <Link to={`/post/${post.id}`} className="flex items-center">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  投稿に戻る
                </Link>
              </Button>
              
              <h1 className="text-2xl font-bold mb-6">投稿を編集</h1>
              
              <EditPostForm
                post={post}
                onPostUpdated={handlePostUpdated}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage; 