
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "../ui/input";

interface ReplyFormProps {
  parentId: string;
  content: string;
  onSubmit: (parentId: string, content?: string, nickname?: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  replyToName?: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  parentId,
  content: initialContent,
  onSubmit,
  onCancel,
  isSubmitting,
  replyToName
}) => {
  const [content, setContent] = useState(initialContent);
  const [nickname, setNickname] = useState("ゲスト");
  const { user } = useAuth();

  // Handle changes to the reply content
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  // Handle changes to the nickname
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  // Submit the reply
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use nickname only for guest users
    if (user) {
      onSubmit(parentId, content);
    } else {
      onSubmit(parentId, content, nickname);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="text-sm text-muted-foreground mb-1">
        {replyToName ? `${replyToName}さんへの返信:` : "返信:"}
      </div>
      
      <div className="flex flex-col space-y-2">
        <Input
          placeholder="返信を入力..."
          value={content}
          onChange={handleChange}
          disabled={isSubmitting}
          className="flex-grow"
        />
        
        {!user && (
          <Input
            placeholder="ニックネーム"
            value={nickname}
            onChange={handleNicknameChange}
            disabled={isSubmitting}
            className="flex-grow"
          />
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button 
          type="submit" 
          size="sm"
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? "送信中..." : "返信する"}
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
