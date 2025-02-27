
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers } from "@/lib/dummyData";
import { User } from "@/types";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [profile, setProfile] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to get user data
    setIsLoading(true);
    setTimeout(() => {
      const users = getUsers();
      const foundUser = users.find(u => u.id === userId) || 
                        // If no userId is provided or user not found, default to current user
                        users.find(u => u.id === "1");
      
      if (foundUser) {
        setUser(foundUser);
        setName(foundUser.name);
        setProfile(foundUser.profile || "");
        setAvatar(foundUser.avatar || "");
      }
      setIsLoading(false);
    }, 500);
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    if (!name.trim()) {
      toast.error("ユーザー名は必須です。");
      setIsSubmitting(false);
      return;
    }

    // Simulate API call to update profile
    setTimeout(() => {
      const updatedUser = {
        ...user!,
        name,
        profile,
        avatar,
      };
      setUser(updatedUser);
      setIsEditing(false);
      setIsSubmitting(false);
      toast.success("プロフィールが更新されました。");
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="container flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">ユーザーが見つかりません</h1>
          <p className="mb-6">このユーザーIDは存在しないか、削除されました。</p>
          <Button asChild>
            <span onClick={() => navigate("/")}>ホームに戻る</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="container py-8 max-w-3xl mx-auto fade-in">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">ユーザープロフィール</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="avatar" className="text-sm font-medium">
                    アバター画像URL
                  </label>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="画像URLを入力（任意）"
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    ユーザー名 *
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ユーザー名を入力"
                    required
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label htmlFor="profile" className="text-sm font-medium">
                    自己紹介
                  </label>
                  <Textarea
                    id="profile"
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    placeholder="自己紹介を入力（任意）"
                    rows={4}
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "保存中..." : "保存する"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                      setProfile(user.profile || "");
                      setAvatar(user.avatar || "");
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">ユーザーID: {user.id}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">自己紹介</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {user.profile || "自己紹介は設定されていません。"}
                  </p>
                </div>
                
                <Button onClick={() => setIsEditing(true)}>プロフィールを編集</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
