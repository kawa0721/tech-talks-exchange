import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const FloatingPostButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      toast.error("投稿を作成するにはログインが必要です");
      return;
    }
    navigate("/create-post");
  };

  return (
    <Button
      variant="floating"
      size="floating"
      className="fixed bottom-6 right-6 z-50"
      onClick={handleClick}
      aria-label="新規投稿"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default FloatingPostButton;
