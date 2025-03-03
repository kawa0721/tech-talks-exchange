
import { useParams, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
import PostsList from "@/components/PostsList";
import { useUserPosts } from "@/hooks/useUserPosts";
import { CHANNELS } from "@/lib/data";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  
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
  
  // Fetch user's posts
  const { posts: userPosts, loading: postsLoading } = useUserPosts(userId);
  
  // 自分自身のプロフィールページにリダイレクトされた場合は編集モードにする
  useEffect(() => {
    // Automatically enter edit mode if this is current user and came from profile link
    if (isCurrentUserProfile && location.state?.fromProfileLink) {
      setIsEditing(true);
    }
  }, [isCurrentUserProfile, location]);
  
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
  
  // Find channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = CHANNELS.find((c) => c.id === channelId);
    return channel ? channel.name : "不明なチャンネル";
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
      <PostsList 
        posts={userPosts}
        loading={postsLoading}
        getChannelName={getChannelName}
        showChannel={true}
        emptyMessage="このユーザーはまだ投稿していません。"
        isUserPosts={true}
      />
    </div>
  );
};

export default UserProfile;
