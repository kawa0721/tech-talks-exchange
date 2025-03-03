import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AuthHeader from "@/components/auth/AuthHeader";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import GitHubSignIn from "@/components/auth/GitHubSignIn";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signUp, signIn, signInWithGoogle, signInWithGitHub } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'register') {
      setActiveTab('register');
    }
  }, [location.search]);

  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      await signUp(email, password);
      toast({
        title: "アカウント作成成功",
        description: "アカウントの作成に成功しました。確認メールを確認してください。",
      });
      console.log("サインアップ成功");
    } catch (error: any) {
      console.error("サインアップエラー:", error);
      let errorMessage = "アカウントの作成中にエラーが発生しました";
      
      if (error.message && error.message.includes("Email already registered")) {
        errorMessage = "このメールアドレスは既に登録されています";
      }
      
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      console.log("サインイン試行:", email, password);
      await signIn(email, password);
      toast({
        title: "ログイン成功",
        description: "ログインに成功しました",
      });
      console.log("サインイン成功");
      navigate("/");
    } catch (error: any) {
      console.error("サインインエラー:", error);
      let errorMessage = "ログイン中にエラーが発生しました";
      
      if (error.message && error.message.includes("Invalid login credentials")) {
        errorMessage = "メールアドレスまたはパスワードが正しくありません";
      }
      
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      console.log("Google サインイン試行");
      await signInWithGoogle();
      // Googleログインはリダイレクトするので、成功トーストはAuthCallbackで表示
    } catch (error: any) {
      console.error("Googleサインインエラー:", error);
      toast({
        title: "エラー",
        description: "Googleでのログイン中にエラーが発生しました",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setIsSubmitting(true);
      console.log("GitHub サインイン試行");
      await signInWithGitHub();
      // GitHubログインはリダイレクトするので、成功トーストはAuthCallbackで表示
    } catch (error: any) {
      console.error("GitHubサインインエラー:", error);
      toast({
        title: "エラー",
        description: "GitHubでのログイン中にエラーが発生しました",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <AuthHeader />
        <CardContent>
          <Tabs defaultValue="login" value="login" className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="login">ログイン</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm 
                onSubmit={handleSignIn} 
                isSubmitting={isSubmitting} 
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  または
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <GoogleSignIn 
                onClick={handleGoogleSignIn} 
                isSubmitting={isSubmitting} 
              />
              <GitHubSignIn 
                onClick={handleGitHubSignIn} 
                isSubmitting={isSubmitting} 
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate("/")} type="button">
            ホームに戻る
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
