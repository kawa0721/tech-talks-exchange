
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CommentFormProps {
  postId: string;
  userAvatar?: string;
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

const CommentForm = ({ 
  postId, 
  userAvatar = "https://i.pravatar.cc/150?img=1",
  onSubmit,
  isSubmitting
}: CommentFormProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("コメントを入力してください");
      return;
    }

    onSubmit(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userAvatar} alt="@user" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
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
