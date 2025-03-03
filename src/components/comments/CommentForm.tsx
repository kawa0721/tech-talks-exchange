
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CommentFormProps {
  postId: string;
  userAvatar?: string;
  onSubmit: (content: string, nickname?: string) => void;
  isSubmitting: boolean;
}

const CommentForm = ({ 
  postId, 
  userAvatar = "https://i.pravatar.cc/150?img=1",
  onSubmit,
  isSubmitting
}: CommentFormProps) => {
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const { user } = useAuth();
  
  // ユーザープロファイル情報を取得
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // 認証済みユーザーのプロファイル情報を取得
  useEffect(() => {
    if (user) {
      const fetchProfileUsername = async () => {
        setLoadingProfile(true);
        try {
          // プロファイル情報をSupabaseから取得
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();
          
          if (!error && profile) {
            setProfileUsername(profile.username || user.email || "ユーザー");
          } else {
            setProfileUsername(user.email || "ユーザー");
          }
        } catch (error) {
          console.error("プロファイル取得エラー:", error);
        } finally {
          setLoadingProfile(false);
        }
      };
      
      fetchProfileUsername();
    }
  }, [user]);

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
      // 未ログインの場合はニックネームを渡す
      onSubmit(content, nickname);
    }
    
    setContent("");
    // ニックネームはそのまま維持して次のコメントでも使えるようにする
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url || userAvatar} alt="@user" />
          <AvatarFallback>{user ? (profileUsername?.[0] || "U").toUpperCase() : "G"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {/* 未ログインの場合のみニックネーム入力欄を表示 */}
          {!user ? (
            <Input
              placeholder="ニックネーム（任意）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mb-2"
            />
          ) : (
            <div className="mb-2 text-sm text-muted-foreground">
              {loadingProfile ? "ユーザー情報を読み込み中..." : `${profileUsername}としてコメント`}
            </div>
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
