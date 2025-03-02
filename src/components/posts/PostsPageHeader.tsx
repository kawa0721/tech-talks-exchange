
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PostsPageHeaderProps {
  activeTab: string;
}

export const PostsPageHeader = ({ activeTab }: PostsPageHeaderProps) => {
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
          {activeTab === "trending" ? "トレンドの投稿" : "人気の投稿"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {activeTab === "trending" 
            ? "最近の注目を集めている話題をチェックしましょう" 
            : "コミュニティで人気の投稿をチェックしましょう"}
        </p>
      </div>

      <Separator className="my-6" />
    </>
  );
};
