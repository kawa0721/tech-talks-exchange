import { Menu, MessageSquare, Search, Bell } from "lucide-react";
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

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Button 
          variant="ghost" 
          className="mr-2 px-2 lg:hidden" 
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">サイドバーを切り替え</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="hidden font-bold sm:inline-block">テックトーク</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <form className="relative w-full max-w-sm lg:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="トピックを検索..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </form>

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
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="ユーザーアバター" />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.name || user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
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
              <Button variant="outline" onClick={() => navigate("/auth")}>
                ログイン
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
