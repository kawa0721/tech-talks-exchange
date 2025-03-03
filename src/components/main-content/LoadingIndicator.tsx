
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = ({ message = "投稿を読み込んでいます..." }: LoadingIndicatorProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
