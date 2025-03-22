import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PostsPageHeaderProps {
  activeTab: string;
  channelName?: string;
}

export const PostsPageHeader = ({ activeTab, channelName }: PostsPageHeaderProps) => {
  // タイトルを決定
  const title = channelName || (activeTab === "trending" ? "トレンドの投稿" : "人気の投稿");
  
  // 説明文を決定
  const description = channelName 
    ? `${channelName}に関連する投稿を閲覧しています` 
    : (activeTab === "trending" 
        ? "最近の注目を集めている話題をチェックしましょう" 
        : "コミュニティで人気の投稿をチェックしましょう");

  return (
    <>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          asChild
        >
          <Link to="/" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            トップに戻る
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2">
          {description}
        </p>
      </div>

      <Separator className="my-6" />
    </>
  );
};
