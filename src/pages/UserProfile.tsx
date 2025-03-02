
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { ProfileFooter } from "@/components/profile/ProfileFooter";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    isLoading,
    userProfile,
    username,
    setUsername,
    profileText,
    setProfileText,
    avatarUrl,
    isCurrentUserProfile,
    handleAvatarChange,
    saveProfile,
    cancelEdit
  } = useUserProfile(userId, user?.id);
  
  const handleEditProfile = async () => {
    if (isEditing) {
      const success = await saveProfile();
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };
  
  const handleCancelEdit = () => {
    cancelEdit();
    setIsEditing(false);
  };
  
  if (isLoading && !userProfile) {
    return <div className="container py-8">読み込み中...</div>;
  }
  
  if (!userProfile) {
    return <div className="container py-8">ユーザーが見つかりませんでした。</div>;
  }
  
  return (
    <div className="container max-w-4xl py-8">
      {/* Back to home button */}
      <div className="mb-4">
        <Button variant="ghost" asChild className="flex items-center gap-2 mb-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            ホームへ戻る
          </Link>
        </Button>
      </div>
      
      <Card className="profile-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <ProfileAvatar 
            avatarUrl={avatarUrl} 
            username={username} 
            isEditing={isEditing}
            onAvatarChange={handleAvatarChange}
          />
          
          <ProfileInfo 
            isEditing={isEditing}
            username={username}
            setUsername={setUsername}
            userId={userProfile.id}
          />
        </CardHeader>
        
        <CardContent>
          <ProfileContent 
            isEditing={isEditing}
            profileText={profileText}
            setProfileText={setProfileText}
          />
        </CardContent>
        
        {isCurrentUserProfile && (
          <CardFooter>
            <ProfileFooter 
              isEditing={isEditing}
              isLoading={isLoading}
              onEdit={handleEditProfile}
              onCancel={handleCancelEdit}
            />
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
