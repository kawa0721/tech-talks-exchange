
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // OAuthコールバック処理
    const handleAuthCallback = async () => {
      try {
        // URL中のハッシュパラメータを処理
        const { error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        // 認証成功後にホームページに遷移
        navigate("/", { replace: true });
      } catch (error) {
        console.error("認証コールバックエラー:", error);
        navigate("/auth", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

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
