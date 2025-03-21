import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CommentFormProps {
  postId: string;
  postOwnerId?: string;
  onSubmit: (content: string, nickname?: string) => void;
  isSubmitting: boolean;
}

const CommentForm = ({ 
  postId, 
  postOwnerId,
  onSubmit,
  isSubmitting
}: CommentFormProps) => {
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const { user } = useAuth();
  
  // ユーザープロファイル情報を取得
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // 認証済みユーザーのプロファイル情報を取得
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoadingProfile(true);
      
      try {
        if (user) {
          // ログイン中のユーザー自身のプロファイル取得
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
          
          if (!error && profile) {
            setProfileUsername(profile.username || user.email || "ユーザー");
            setProfileAvatar(profile.avatar_url || user.user_metadata?.avatar_url);
          } else {
            setProfileUsername(user.email || "ユーザー");
            setProfileAvatar(user.user_metadata?.avatar_url);
            
            // プロファイルを作成（ない場合）
            if (error && error.code === 'PGRST116') {
              await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  username: user.email,
                  avatar_url: user.user_metadata?.avatar_url
                });
            }
          }
        } else if (postOwnerId) {
          // 未ログインの場合、投稿オーナーのプロファイル情報を表示
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', postOwnerId)
            .single();
            
          if (!error && profile) {
            setProfileUsername(profile.username || "投稿者");
            setProfileAvatar(profile.avatar_url);
          }
        }
      } catch (error) {
        console.error("プロファイル取得エラー:", error);
        setProfileUsername(user?.email || "ユーザー");
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchProfileData();
  }, [user, postOwnerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("コメントを入力してください");
      return;
    }

    // ログイン状態に応じて、ニックネームを渡すかどうか決定
    if (user) {
      // ログイン済みの場合はニックネームは不要（バックエンドでユーザーIDを使用）
      onSubmit(content);
    } else {
      // 未ログインの場合はニックネームを渡す（空でも可能）
      onSubmit(content, nickname || undefined);
    }
    
    // 送信後は内容をクリア
    setContent("");
    // ニックネームはそのまま維持して次のコメントでも使えるようにする
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profileAvatar || ""} alt="@user" />
          <AvatarFallback>{profileUsername ? (profileUsername[0] || "U").toUpperCase() : "G"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {/* ログイン状態に応じた表示切り替え */}
          {user ? (
            // ログイン済みユーザーには自分のユーザー名を表示
            <div className="mb-2 text-sm text-muted-foreground">
              {loadingProfile ? "ユーザー情報を読み込み中..." : `${profileUsername}としてコメント`}
            </div>
          ) : (
            <>
              {/* 投稿者の情報がある場合は表示 */}
              {profileUsername && (
                <div className="mb-2 text-sm text-muted-foreground">
                  {loadingProfile ? "ユーザー情報を読み込み中..." : `${profileUsername}の投稿`}
                </div>
              )}
              {/* 未ログインユーザーにはニックネーム入力欄を表示 */}
              <Input
                placeholder="ニックネーム（任意）"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mb-2"
              />
            </>
          )}
          <Textarea
            placeholder="コメントを追加..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-2 min-h-[80px]"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "コメントを投稿"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
