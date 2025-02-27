
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ReplyFormProps {
  parentId: string;
  userName: string;
  onSubmit: (content: string) => void;
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

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("返信を入力してください");
      return;
    }

    onSubmit(content);
    setContent("");
  };

  return (
    <div className="mt-3">
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
