
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePostButtonProps {
  onClick: () => void;
}

const CreatePostButton = ({ onClick }: CreatePostButtonProps) => {
  const { toast } = useToast();

  const handleClick = () => {
    onClick();
    toast({
      title: "投稿作成",
      description: "投稿フォームを起動します",
    });
  };

  return (
    <Button
      className="fixed bottom-6 right-6 shadow-lg rounded-full h-14 w-14 p-0 z-50"
      onClick={handleClick}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default CreatePostButton;
