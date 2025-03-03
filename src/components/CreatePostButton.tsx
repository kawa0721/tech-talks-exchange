
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CreatePostButtonProps {
  onClick: () => void;
}

const CreatePostButton = ({ onClick }: CreatePostButtonProps) => {
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      toast.error("投稿を作成するにはログインが必要です");
      return;
    }
    onClick();
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default CreatePostButton;
