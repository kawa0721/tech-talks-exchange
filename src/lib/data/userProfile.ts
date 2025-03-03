import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

// プロフィール情報を取得する関数
export const getUserProfile = async (userId: string): Promise<User | null> => {
  console.log('Fetching user profile for user ID:', userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("プロフィール取得エラー:", error);
      return null;
    }
    
    if (!data) {
      console.log('No profile data found for user ID:', userId);
      return null;
    }
    
    console.log('Fetched profile data:', data);
    
    return {
      id: data.id,
      name: data.username || "匿名ユーザー",
      avatar: data.avatar_url,
      profile: data.profile
    };
  } catch (error) {
    console.error("プロフィール取得エラー:", error);
    return null;
  }
};

// 非認証状態でも直接プロフィール情報を取得する関数
export const getPublicUserProfile = async (userId: string): Promise<User | null> => {
  console.log('Fetching public user profile for user ID:', userId);
  
  if (!userId) {
    console.log('No user ID provided for public profile fetch');
    return null;
  }
  
  try {
    // Supabaseのanonキーを使用して直接公開データを取得
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, profile')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("公開プロフィール取得エラー:", error);
      return null;
    }
    
    if (!data) {
      console.log('No public profile data found for user ID:', userId);
      return null;
    }
    
    console.log('Fetched public profile data:', data);
    
    return {
      id: data.id,
      name: data.username || "匿名ユーザー",
      avatar: data.avatar_url,
      profile: data.profile
    };
  } catch (error) {
    console.error("公開プロフィール取得エラー:", error);
    return null;
  }
};