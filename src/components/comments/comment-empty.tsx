
import { MessageSquareOff } from "lucide-react";

export function EmptyComments({ postOwnerId }: { postOwnerId?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <MessageSquareOff className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
      <h3 className="text-lg font-medium">コメントはまだありません</h3>
      <p className="text-muted-foreground mt-1 mb-4">
        この投稿に最初のコメントを残しましょう！
      </p>
    </div>
  );
}
