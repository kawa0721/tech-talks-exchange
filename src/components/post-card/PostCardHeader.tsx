import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Post } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePost } from "@/utils/postActions";
import { toast } from "sonner";

interface PostCardHeaderProps {
  post: Post;
  channelName?: string;
  showChannel?: boolean;
  isTrending?: boolean;
  isPopular?: boolean;
  onEditPost?: () => void;
  onPostDeleted?: () => void;
}

const PostCardHeader = ({ 
  post, 
  channelName, 
  showChannel = false,
  isTrending = false,
  isPopular = false,
  onEditPost,
  onPostDeleted
}: PostCardHeaderProps) => {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 自分の投稿かどうかをチェック
  const isCurrentUserLoggedIn = user !== null && user !== undefined;
  const postHasUserId = post.userId !== null && post.userId !== undefined && post.userId !== '';
  const isOwnPost = isCurrentUserLoggedIn && postHasUserId && post.userId === user.id;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      toast.success("投稿が削除されました");
      if (onPostDeleted) onPostDeleted();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("削除エラー:", error);
      toast.error("投稿の削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CardHeader className="pb-3 pt-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback>{post.user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {post.user.name}
              </span>
              {showChannel && channelName && (
                <>
                  <span className="text-muted-foreground">in</span>
                  <Badge variant="outline" className="px-2 py-0 text-xs">
                    {channelName}
                  </Badge>
                </>
              )}
              {isTrending && (
                <Badge className="ml-1 bg-blue-500 hover:bg-blue-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  トレンド
                </Badge>
              )}
              {isPopular && (
                <Badge className="ml-1 bg-amber-500 hover:bg-amber-600">
                  <Star className="mr-1 h-3 w-3" />
                  人気
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground text-left">
              {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ja })}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">メニューを開く</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost === true ? (
              <>
                <DropdownMenuItem onClick={onEditPost}>
                  <Edit className="h-4 w-4 mr-2" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>保存</DropdownMenuItem>
                <DropdownMenuItem>報告</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻せません。投稿が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "削除中..." : "削除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardHeader>
  );
};

export default PostCardHeader;
