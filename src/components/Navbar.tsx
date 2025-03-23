import { Menu, Search, Bell, X, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

const Navbar = ({ onToggleSidebar, isSidebarOpen = false }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // デバッグ用：テーマ状態をコンソールに表示
  console.log('Current theme state:', { theme, isDarkMode });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "ログアウト成功",
        description: "ログアウトしました",
      });
      navigate("/");
    } catch (error) {
      console.error("ログアウトエラー:", error);
      toast({
        title: "エラー",
        description: "ログアウト中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    
    const email = user.email || "";
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    
    return "U";
  };
  
  const navigateToProfile = () => {
    if (user) {
      navigate(`/user/${user.id}`, {
        state: { fromProfileLink: true }
      });
    } else {
      navigate("/profile");
    }
  };

  // 強制的にコンポーネントを再レンダリングするためのステート
  const [forceRender, setForceRender] = useState(0);

  // テーマが変更されたときに強制的に再レンダリングする
  useEffect(() => {
    console.log('Theme changed to:', theme);
    setForceRender(prev => prev + 1);
  }, [theme]);

  return (
    <>
      <style>
        {`
        .navbar-bottom-border {
          border-bottom-color: #909294 !important;
        }
        .login-button-border {
          border-color: #909294 !important;
        }
        `}
      </style>
      <header 
        className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1 navbar-bottom-border"
      >
      <div className="pl-0 pr-4 w-full md:px-8 flex h-12 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="relative z-1000 mr-2 sidebar-toggle h-8 w-8"
          onClick={onToggleSidebar}
          aria-label="サイドバーを切り替え"
        >
          {/* デバッグ用コメント */}
          {/* サイドバーの状態: {isSidebarOpen ? 'Open' : 'Closed'} */}
          {isSidebarOpen ? (
            <X className="h-5 w-5 text-primary" />
          ) : (
            <Menu className="h-5 w-5 text-primary" />
          )}
        </Button>
        
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className={`flex items-center justify-center z-10 relative`}>
              {/* Small screen logo (visible on small screens, hidden on medium and larger) */}
              <img 
                src="/aiau_19_transparent.svg" 
                alt="AIAU Logo" 
                className="h-6 w-6 md:h-7 md:w-7 sm:hidden object-contain"
              />
              {/* Larger screen banner (hidden on small screens, visible on medium and larger) */}
              <img 
                key={`banner-${isDarkMode}-${forceRender}`}
                src={isDarkMode ? "/aiau_banner_FCF3D6_02_trimmed.png" : "/aiau_banner_light_02_trimmed.png"} 
                alt="AIAU Banner" 
                className="hidden sm:block h-8 object-contain"
                onError={(e) => console.error("画像読み込みエラー:", e.currentTarget.src)}
              />
            </div>
            {/* Removed テックトーク text as requested */}
          </Link>
        </div>

        {/* 検索フォームを中央に配置 */}
        <div className="flex-1 flex justify-center">
        <form className="relative w-full max-w-[9rem] md:max-w-md">
            <Search className="absolute left-1.5 md:left-2.5 top-3 md:top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="トピックを検索..."
              className="pl-6 md:pl-8 sm:w-[350px] md:w-[300px] lg:w-[400px] text-[0.8rem] md:text-[1rem]"
            />
          </form>
        </div>

        {/* 右側にユーザーコントロールを配置 */}
        <div className="flex items-center gap-2">
          {/* 追加：すべての投稿ページへのリンク */}
          <Link to="/posts" className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md">
            <FileText className="h-4 w-4" />
            <span>すべての投稿</span>
          </Link>
          
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-destructive"></span>
                <span className="sr-only">通知</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-6 w-6 md:h-8 md:w-8 rounded-full">
                    <Avatar className="h-6 w-6 md:h-8 md:w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="ユーザーアバター" />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium leading-[1.2] break-words ">
                        {user.user_metadata?.name || user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground leading-[1.2] break-words">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={navigateToProfile}>
                    プロフィール
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    設定
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="login-button-border max-md:px-1.5" onClick={() => navigate("/auth")}>
                ログイン
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;
