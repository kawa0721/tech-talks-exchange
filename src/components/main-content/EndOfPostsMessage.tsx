
interface EndOfPostsMessageProps {
  count: number;
}

const EndOfPostsMessage = ({ count }: EndOfPostsMessageProps) => {
  return (
    <div className="text-center py-6 mt-8 border-t border-border">
      <p className="text-muted-foreground">すべての投稿を表示しています (計{count}件)</p>
    </div>
  );
};

export default EndOfPostsMessage;
