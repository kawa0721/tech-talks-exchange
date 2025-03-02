
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export function useUserProfile(userId?: string, currentAuthUserId?: string) {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [profileText, setProfileText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Get current user either from params or default to authenticated user
  const currentUserId = userId || currentAuthUserId;
  const isCurrentUserProfile = currentUserId === currentAuthUserId;
  
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
  }, [currentUserId, currentAuthUserId]);
  
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
      
      toast({
        title: "プロフィールを更新しました",
        description: "変更が保存されました",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };
  
  // Reset form to current profile values
  const cancelEdit = () => {
    if (userProfile) {
      setUsername(userProfile.name);
      setProfileText(userProfile.profile || '');
      setAvatarUrl(userProfile.avatar || null);
    }
    setAvatarFile(null);
  };
  
  return {
    isLoading,
    userProfile,
    username,
    setUsername,
    profileText,
    setProfileText,
    avatarUrl,
    avatarFile,
    isCurrentUserProfile,
    handleAvatarChange,
    saveProfile,
    cancelEdit
  };
}
