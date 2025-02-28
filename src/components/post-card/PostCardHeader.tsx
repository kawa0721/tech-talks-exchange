
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
import { TrendingUp, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Post } from "@/types";

interface PostCardHeaderProps {
  post: Post;
  channelName?: string;
  showChannel?: boolean;
  isTrending?: boolean;
  isPopular?: boolean;
}

const PostCardHeader = ({ 
  post, 
  channelName, 
  showChannel = false,
  isTrending = false,
  isPopular = false 
}: PostCardHeaderProps) => {
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
            <div className="text-xs text-muted-foreground">
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
            <DropdownMenuItem>保存</DropdownMenuItem>
            <DropdownMenuItem>報告</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
  );
};

export default PostCardHeader;
