
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreatePostDialog from "@/components/CreatePostDialog";

const FloatingPostButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant="floating"
        size="floating"
        className="fixed bottom-6 right-6 z-50"
        onClick={handleClick}
        aria-label="新規投稿"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <CreatePostDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        channelId={null} 
      />
    </>
  );
};

export default FloatingPostButton;
