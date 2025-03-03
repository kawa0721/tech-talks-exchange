
import { Button } from "@/components/ui/button";

const EmptyPostsMessage = () => {
  const handleCreatePostClick = () => {
    document.querySelector('.create-post-button')?.dispatchEvent(new Event('click'));
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
