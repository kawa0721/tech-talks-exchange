import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreatePostButtonProps {
  channelId?: string;
}

const CreatePostButton = ({ channelId }: CreatePostButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!user) {
      toast.error("投稿を作成するにはログインが必要です");
      return;
    }
    
    // チャンネルIDがある場合はクエリパラメータとして渡す
    if (channelId) {
      navigate(`/create?channelId=${channelId}`);
    } else {
      navigate("/create");
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="create-post-button fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-[99]"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default CreatePostButton;
