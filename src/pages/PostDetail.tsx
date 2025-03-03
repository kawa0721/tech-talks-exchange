
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Post, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import PostCard from "@/components/PostCard";
import CommentSection from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateGuestId, hasGuestId } from "@/utils/guestUtils";

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
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
        
        // 次にユーザー情報を取得 - ログインステータスに関わらず情報を表示
        let userData: User = {
          id: postData.user_id || "unknown",
          name: "匿名ユーザー",
          avatar: undefined
        };
        
        if (postData.user_id) {
          // 複数の方法でプロフィール取得を試みる
          try {
            console.log('Trying to fetch profile with JOIN first...');
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
              
              console.log('Successfully fetched user profile:', userData);
            } else {
              console.log("Failed to load user profile with standard method:", userError);
              
              console.log('Falling back to basic profile query...');
              // 直接シンプルなクエリでリトライ
              const { data: basicProfile, error: basicError } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .eq('id', postData.user_id)
                .single();
                
              if (!basicError && basicProfile) {
                userData = {
                  id: basicProfile.id,
                  name: basicProfile.username || `ユーザー_${postData.user_id.substring(0, 5)}`,
                  avatar: basicProfile.avatar_url
                };
                console.log('Successfully fetched basic user profile:', userData);
              } else {
                console.log("Failed to load basic user profile:", basicError);
              }
            }
          } catch (fetchError) {
            console.error("Error during profile fetching:", fetchError);
          }
        }
        
        // 現在のユーザー（ログインユーザーまたはゲスト）がこの投稿をいいねしているか確認
        let userLiked = false;
        
        // ログインチェック
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // ログインユーザーの場合
          const { data: likeData } = await supabase
            .from('likes')
            .select('id')
            .match({ user_id: user.id, post_id: postId })
            .maybeSingle();
            
          userLiked = !!likeData;
        } else if (hasGuestId()) {
          // 未ログインユーザーの場合
          const guestId = getOrCreateGuestId();
          const { data: likeData } = await supabase
            .from('likes')
            .select('id')
            .match({ guest_id: guestId, post_id: postId })
            .maybeSingle();
            
          userLiked = !!likeData;
        }
        
        // コメント数を取得
        const { count: commentCount, error: countError } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId);
          
        if (!countError) {
          setCommentsCount(commentCount || 0);
        }
        
        // いいね数を取得
        const { count: likesCount, error: likesCountError } = await supabase
          .from('likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId);
        
        // 実際のいいね数を使用
        const actualLikesCount = likesCountError ? 0 : (likesCount || 0);
        
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
          likesCount: actualLikesCount, // 実際のいいね数を使用
          commentsCount: commentCount || 0, // 実際のコメント数を使用
          liked: userLiked,
          images: postData.images || []
        };
        
        setPost(formattedPost);
        
        // チャンネル情報を取得
        if (postData.channel_id) {
          await getChannelName(postData.channel_id);
        }
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

  // コメントが追加/削除されたときに投稿を更新する
  const handleCommentCountChange = (newCount: number) => {
    if (post) {
      setPost({
        ...post,
        commentsCount: newCount
      });
    }
  };

  // チャンネル情報の状態
  const [channelName, setChannelName] = useState<string>("読み込み中...");
  
  // Find channel name by ID - Supabaseから取得
  const getChannelName = async (channelId: string) => {
    if (!channelId) {
      setChannelName("未分類");
      return;
    }
    
    try {
      const { data: channel, error } = await supabase
        .from('channels')
        .select('name')
        .eq('id', channelId)
        .single();
        
      if (error || !channel) {
        console.error("チャンネル取得エラー:", error);
        setChannelName("不明なチャンネル");
        return;
      }
      
      setChannelName(channel.name);
    } catch (error) {
      console.error("チャンネル取得エラー:", error);
      setChannelName("不明なチャンネル");
    }
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
              channelName={channelName}
              showChannel={true} 
            />
            
            <CommentSection 
              postId={post?.id || ""} 
              postOwnerId={post?.userId}
              onCommentCountChange={handleCommentCountChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
