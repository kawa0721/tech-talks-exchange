
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { useState } from "react";

// Mock data since getUsers doesn't exist in dummyData
const MOCK_USERS: Record<string, User> = {
  "1": {
    id: "1",
    name: "TechGuru42",
    avatar: "https://i.pravatar.cc/150?img=1",
    profile: "テクノロジーとプログラミングが大好きなエンジニアです。日々新しい技術について学ぶことが趣味です。"
  },
  "2": {
    id: "2",
    name: "CodeNinja",
    avatar: "https://i.pravatar.cc/150?img=2",
    profile: "フルスタックデベロッパーとして5年の経験があります。ReactとNode.jsが得意です。"
  }
};

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState("");
  
  // Get current user either from params or default to user "1"
  const currentUserId = userId || "1";
  const user = MOCK_USERS[currentUserId];
  
  const isCurrentUserProfile = currentUserId === "1"; // Assuming user 1 is the logged-in user
  
  const handleEditProfile = () => {
    if (isEditing) {
      // Save profile
      // Here you would typically call an API to update the user profile
      // For now, we'll just update the local state
      setIsEditing(false);
    } else {
      setProfile(user.profile || "");
      setIsEditing(true);
    }
  };
  
  if (!user) {
    return <div className="container py-8">ユーザーが見つかりませんでした。</div>;
  }
  
  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>ユーザーID: {user.id}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">プロフィール</h3>
          
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="あなたについて教えてください..."
              />
            </div>
          ) : (
            <p className="text-muted-foreground">{user.profile || "プロフィールはまだ設定されていません。"}</p>
          )}
        </CardContent>
        {isCurrentUserProfile && (
          <CardFooter>
            <Button onClick={handleEditProfile}>
              {isEditing ? "保存" : "プロフィールを編集"}
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <Separator className="my-8" />
      
      <h2 className="text-2xl font-bold mb-6">最近の投稿</h2>
      <div className="text-center text-muted-foreground py-12">
        まだ投稿がありません。
      </div>
    </div>
  );
};

export default UserProfile;
