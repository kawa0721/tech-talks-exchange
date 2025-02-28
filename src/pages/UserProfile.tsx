
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";
import { Camera, User as UserIcon, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [profileText, setProfileText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  
  // Get current user either from params or default to authenticated user
  const currentUserId = userId || user?.id;
  const isCurrentUserProfile = currentUserId === user?.id;
  
  // Fetch profile data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUserId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserId)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        if (data) {
          const profile: User = {
            id: data.id,
            name: data.username || 'ゲストユーザー',
            avatar: data.avatar_url,
            profile: data.profile || '',
          };
          
          setUserProfile(profile);
          setUsername(profile.name);
          setProfileText(profile.profile || '');
          setAvatarUrl(profile.avatar || null);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [currentUserId, user?.id]);
  
  // Fallback to mock data when Supabase data is not available
  useEffect(() => {
    if (!userProfile && currentUserId && MOCK_USERS[currentUserId]) {
      const mockUser = MOCK_USERS[currentUserId];
      setUserProfile(mockUser);
      setUsername(mockUser.name);
      setProfileText(mockUser.profile || '');
      setAvatarUrl(mockUser.avatar || null);
    }
  }, [currentUserId, userProfile]);
  
  const handleEditProfile = () => {
    if (isEditing) {
      saveProfile();
    } else {
      setIsEditing(true);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };
  
  const saveProfile = async () => {
    try {
      setIsLoading(true);
      
      if (!currentUserId) {
        toast({
          title: "エラー",
          description: "ユーザーIDが見つかりません",
          variant: "destructive",
        });
        return;
      }
      
      let newAvatarUrl = avatarUrl;
      
      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${currentUserId}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        newAvatarUrl = data.publicUrl;
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username,
          profile: profileText,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUserId);
        
      if (error) throw error;
      
      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        name: username,
        profile: profileText,
        avatar: newAvatarUrl
      } : null);
      
      setIsEditing(false);
      toast({
        title: "プロフィールを更新しました",
        description: "変更が保存されました",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const cancelEdit = () => {
    // Reset form to current profile values
    if (userProfile) {
      setUsername(userProfile.name);
      setProfileText(userProfile.profile || '');
      setAvatarUrl(userProfile.avatar || null);
    }
    setAvatarFile(null);
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
          <div className="relative group mx-auto sm:mx-0">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={avatarUrl || undefined} alt={username} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="text-white" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
          
          <div className="text-center sm:text-left flex-1">
            {isEditing ? (
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ニックネーム"
                className="font-semibold text-lg mb-2"
              />
            ) : (
              <CardTitle className="text-2xl">{username}</CardTitle>
            )}
            <CardDescription>ユーザーID: {userProfile.id}</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">プロフィール</h3>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                placeholder="あなたについて教えてください..."
                className="min-h-[120px] resize-none"
              />
            </div>
          ) : (
            <p className="text-muted-foreground whitespace-pre-line">
              {userProfile.profile || "プロフィールはまだ設定されていません。"}
            </p>
          )}
        </CardContent>
        
        {isCurrentUserProfile && (
          <CardFooter className="flex gap-2 justify-end">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={cancelEdit} disabled={isLoading}>
                  キャンセル
                </Button>
                <Button onClick={handleEditProfile} disabled={isLoading}>
                  {isLoading ? "保存中..." : "保存"}
                </Button>
              </>
            ) : (
              <Button onClick={handleEditProfile}>
                プロフィールを編集
              </Button>
            )}
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
