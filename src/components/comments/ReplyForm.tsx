
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("返信を入力してください");
      return;
    }

    // ログイン状態に応じて、ニックネームを渡すかどうか決定
    if (user) {
      // ログイン済みの場合はニックネームは不要（ユーザーIDを使用）
      onSubmit(content);
    } else {
      // 未ログインの場合はニックネームを渡す
      onSubmit(content, nickname);
    }
    
    setContent("");
  };

  return (
    <div className="mt-3">
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
