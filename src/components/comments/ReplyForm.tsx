
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ReplyFormProps {
  parentId: string;
  userName: string;
  onSubmit: (content: string, nickname?: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReplyForm = ({
  parentId,
  userName,
  onSubmit,
  onCancel,
  isSubmitting,
}: ReplyFormProps) => {
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const { user } = useAuth();
  
  // ユーザープロファイル情報を取得
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // ログインユーザーのプロファイル情報を取得
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
          setProfileUsername(user.email || "ユーザー");
        } finally {
          setLoadingProfile(false);
        }
      };
      
      fetchProfileUsername();
    }
  }, [user]);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("返信を入力してください");
      return;
    }

    // ログイン状態に応じて、ニックネームを渡すかどうか決定
    if (user) {
      // ログイン済みの場合はニックネームは不要
      onSubmit(content);
    } else {
      // 未ログインの場合はニックネームを渡す
      onSubmit(content, nickname);
    }
    
    setContent("");
  };

  return (
    <div className="mt-3">
      {/* ログイン中のユーザー情報表示 */}
      {user && (
        <div className="mb-2 text-xs text-muted-foreground">
          {loadingProfile ? "ユーザー情報を読み込み中..." : `${profileUsername}として返信`}
        </div>
      )}
      
      {/* 未ログインの場合のみニックネーム入力欄を表示 */}
      {!user && (
        <Input
          placeholder="ニックネーム（任意）"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="mb-2 text-sm"
        />
      )}
      
      <Textarea
        placeholder={`${userName}さんに返信...`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[60px] text-sm mb-2"
      />
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "投稿中..." : "返信"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
        >
          キャンセル
        </Button>
      </div>
    </div>
  );
};

export default ReplyForm;
