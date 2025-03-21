import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EmptyPostsMessage = ({ channelId }: { channelId?: string }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreatePostClick = () => {
    if (!user) {
      toast.error("投稿を作成するにはログインが必要です");
      return;
    }
    
    // チャンネルIDがある場合はクエリパラメータとして渡す
    if (channelId) {
      navigate(`/create-post?channelId=${channelId}`);
    } else {
      navigate("/create-post");
    }
  };

  return (
    <div className="text-center py-16 border rounded-lg border-dashed border-border">
      <p className="text-2xl font-medium mb-2">投稿がありません</p>
      <p className="text-muted-foreground mb-6">このチャンネルにはまだ投稿がありません。最初の投稿を作成しましょう！</p>
      <Button onClick={handleCreatePostClick}>
        新しい投稿を作成
      </Button>
    </div>
  );
};

export default EmptyPostsMessage;
