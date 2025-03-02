
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
}

const LoadMoreButton = ({ onLoadMore, loading, hasMore }: LoadMoreButtonProps) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8">
      <Button 
        onClick={onLoadMore} 
        disabled={loading}
        variant="outline"
        className="w-full max-w-xs"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            読み込み中...
          </>
        ) : (
          "もっと読み込む"
        )}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
