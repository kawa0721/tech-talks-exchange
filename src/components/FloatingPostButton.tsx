
import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const FloatingPostButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClick = () => {
    // Scroll to the create post form if we're on the homepage
    const createPostForm = document.querySelector("form");
    if (createPostForm) {
      window.scrollTo({
        top: createPostForm.offsetTop - 100,
        behavior: "smooth",
      });
      toast({
        title: "投稿フォームに移動しました",
        description: "新しい投稿を作成できます",
      });
    } else {
      // If not on homepage, navigate to homepage
      navigate("/");
      // Set a timeout to allow the page to load before scrolling
      setTimeout(() => {
        const createPostForm = document.querySelector("form");
        if (createPostForm) {
          window.scrollTo({
            top: createPostForm.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }, 300);
    }
  };

  return (
    <Button
      variant="floating"
      size="floating"
      className="fixed bottom-6 right-6 z-50"
      onClick={handleClick}
      aria-label="新規投稿"
    >
      <Edit className="h-6 w-6" />
    </Button>
  );
};

export default FloatingPostButton;
