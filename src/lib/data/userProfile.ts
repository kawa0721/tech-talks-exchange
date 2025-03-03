
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { User as LucideUser } from "lucide-react";

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

// 非認証状態でも直接プロフィール情報を取得する関数 - RLS対応版
export const getPublicUserProfile = async (userId: string): Promise<User | null> => {
  console.log('Fetching public user profile for user ID:', userId);
  
  if (!userId) {
    console.log('No user ID provided for public profile fetch');
    return {
      id: 'guest',
      name: "匿名ユーザー",
      avatar: undefined,
      profile: undefined
    };
  }
  
  try {
    // RLSポリシーで公開読み取りが許可されたので直接取得可能
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, profile')
      .eq('id', userId)
      .maybeSingle();  // single()ではなくmaybeSingle()を使用
      
    if (error) {
      console.error("公開プロフィール取得エラー:", error);
      // エラー時にもデフォルト情報を返す
      return {
        id: userId,
        name: `ユーザー_${userId.substring(0, 5)}`,
        avatar: `/placeholder-avatar.png`, // デフォルトアバター画像を指定
        profile: undefined
      };
    }
    
    if (!data) {
      console.log('No public profile data found for user ID:', userId);
      // プロファイルが見つからない場合もデフォルト情報を返す
      return {
        id: userId,
        name: `ユーザー_${userId.substring(0, 5)}`,
        avatar: `/placeholder-avatar.png`, // デフォルトアバター画像を指定
        profile: undefined
      };
    }
    
    console.log('Fetched public profile data:', data);
    
    return {
      id: data.id,
      name: data.username || "匿名ユーザー",
      avatar: data.avatar_url || `/placeholder-avatar.png`, // アバターがない場合はデフォルト画像
      profile: data.profile
    };
  } catch (error) {
    console.error("公開プロフィール取得エラー:", error);
    // 例外発生時にもデフォルト情報を返す
    return {
      id: userId,
      name: `ユーザー_${userId.substring(0, 5)}`,
      avatar: `/placeholder-avatar.png`, // デフォルトアバター画像を指定
      profile: undefined
    };
  }
};
