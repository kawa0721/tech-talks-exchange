
import { useState } from "react";
import { 
  Bell, 
  MessageSquare, 
  Menu, 
  Search, 
  User as UserIcon 
} from "lucide-react";
import { Link } from "react-router-dom";
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

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock login function (for demonstration)
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Mock logout function (for demonstration)
  const handleLogout = () => {
    setIsLoggedIn(false);
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

          {isLoggedIn ? (
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
                      <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="@user" />
                      <AvatarFallback>TG</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">テックグル42</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        techguru@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/profile" className="flex w-full">プロフィール</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/settings" className="flex w-full">設定</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleLogin}>
                ログイン
              </Button>
              <Button onClick={handleLogin}>
                新規登録
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
