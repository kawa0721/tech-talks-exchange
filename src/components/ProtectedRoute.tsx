
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // 認証状態ロード中は待機画面を表示
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">読み込み中...</h2>
          <p className="text-muted-foreground">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  // 未認証の場合はログインページへリダイレクト
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>;
};

export default ProtectedRoute;
