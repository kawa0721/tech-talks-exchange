
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // OAuthコールバック処理
    const handleAuthCallback = async () => {
      try {
        console.log("認証コールバック処理開始");
        // URL中のハッシュパラメータを処理
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("認証セッション取得エラー:", error);
          throw error;
        }
        
        if (data && data.session) {
          console.log("認証成功: セッション取得完了");
          toast({
            title: "ログイン成功",
            description: "ログインに成功しました",
          });
        }
        
        // 認証成功後にホームページに遷移
        navigate("/", { replace: true });
      } catch (error) {
        console.error("認証コールバックエラー:", error);
        toast({
          title: "認証エラー",
          description: "ログイン処理中にエラーが発生しました",
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">認証処理中...</h2>
        <p className="text-muted-foreground">しばらくお待ちください</p>
      </div>
    </div>
  );
};

export default AuthCallback;
