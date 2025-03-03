
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
  postsCount: number;
}

const LoadMoreButton = ({ onLoadMore, loading, hasMore, postsCount }: LoadMoreButtonProps) => {
  // Don't render button if there are no more posts to load
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8">
      <Button 
        onClick={onLoadMore} 
        disabled={loading}
        variant="outline"
        className="w-full max-w-xs"
        size="lg"
        data-testid="load-more-button"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>読み込み中... (現在{postsCount}件表示中)</span>
          </>
        ) : (
          <span>さらに読み込む (現在{postsCount}件表示中)</span>
        )}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
