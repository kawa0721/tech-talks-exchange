
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * ProfileRedirect - 認証済みのユーザーを自身のプロフィールページへリダイレクトする
 * 未認証の場合はログインページへリダイレクトする
 */
const ProfileRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      // 認証済みの場合は自身のプロフィールページへリダイレクト
      navigate(`/user/${user.id}`, { replace: true });
    } else {
      // 未認証の場合はログインページへリダイレクト
      toast({
        title: "ログインが必要です",
        description: "プロフィールを表示するにはログインしてください",
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    }
  }, [user, navigate, toast]);

  // リダイレクト中の表示
  return (
    <div className="container py-8 flex items-center justify-center">
      <p>リダイレクト中...</p>
    </div>
  );
};

export default ProfileRedirect;
