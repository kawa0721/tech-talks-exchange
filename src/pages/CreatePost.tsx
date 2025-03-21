import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import CreatePostFormContainer from "@/components/post-form/CreatePostFormContainer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get("channelId");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ログインチェック
    if (!user) {
      toast.error("投稿を作成するにはログインが必要です");
      navigate("/auth", { replace: true });
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  const handlePostCreated = () => {
    toast.success("投稿が作成されました！");
    
    // 元のチャンネルに戻るか、ホームに戻る
    if (channelId) {
      navigate(`/channel/${channelId}`);
    } else {
      navigate("/");
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onToggleSidebar={() => {}} />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">新しい投稿を作成</h1>
        
        <CreatePostFormContainer 
          channelId={channelId} 
          onPostCreated={handlePostCreated} 
        />
      </main>
    </div>
  );
};

export default CreatePostPage; 