
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
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("いいねするにはログインが必要です");
        return;
      }
      
      // Call the parent component's toggle like function
      onToggleLike();
      
      // Optimistically update UI before API call completes
      if (liked) {
        // Delete like from database
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, post_id: postId });
          
        if (error) {
          console.error("いいね削除エラー:", error);
          toast.error("いいねの削除に失敗しました");
          // Revert the optimistic update if there was an error
          onToggleLike();
        }
      } else {
        // Add like to database
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: postId });
          
        if (error) {
          console.error("いいね追加エラー:", error);
          toast.error("いいねの追加に失敗しました");
          // Revert the optimistic update if there was an error
          onToggleLike();
        }
      }
    } catch (error) {
      console.error("いいね処理エラー:", error);
      toast.error("いいね処理に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

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
        onClick={handleToggleLike}
        disabled={isLoading}
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
