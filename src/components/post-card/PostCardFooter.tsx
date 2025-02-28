
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, ThumbsUp, Share, X } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface PostCardFooterProps {
  postId: string;
  commentsCount: number;
  likesCount: number;
  liked: boolean;
  onToggleLike: () => void;
}

const PostCardFooter = ({ 
  postId, 
  commentsCount, 
  likesCount, 
  liked, 
  onToggleLike 
}: PostCardFooterProps) => {

  const shareToX = () => {
    // 現在のURLを取得
    const currentUrl = window.location.origin + `/post/${postId}`;
    
    // ツイート内容を生成
    const tweetText = encodeURIComponent(`投稿 | Tech Talk`);
    const tweetUrl = encodeURIComponent(currentUrl);
    
    // Xのシェアリンクを生成
    const xShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    
    // 新しいウィンドウでXのシェアページを開く
    window.open(xShareUrl, '_blank', 'width=550,height=420');
    
    // シェアしたことをトースト通知
    toast.success("Xでの共有リンクを開きました");
  };

  const copyLinkToClipboard = () => {
    const url = window.location.origin + `/post/${postId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("リンクをクリップボードにコピーしました");
      })
      .catch(() => {
        toast.error("リンクのコピーに失敗しました");
      });
  };

  return (
    <CardFooter className="flex justify-between border-t p-3">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex gap-1"
        asChild
      >
        <Link to={`/post/${postId}`}>
          <MessageSquare className="h-4 w-4" /> 
          <span>{commentsCount}</span>
        </Link>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`flex gap-1 ${liked ? "text-blue-500" : ""}`}
        onClick={onToggleLike}
      >
        <ThumbsUp className="h-4 w-4" /> 
        <span>{likesCount}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex gap-1">
            <Share className="h-4 w-4" /> 
            <span>共有</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={shareToX} className="flex items-center gap-2 cursor-pointer">
            <X className="h-4 w-4 text-black dark:text-white" />
            <span>Xでシェア</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyLinkToClipboard} className="cursor-pointer">
            リンクをコピー
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardFooter>
  );
};

export default PostCardFooter;
