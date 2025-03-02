
import { Post, Comment, Channel, ChannelCategory } from "@/types";
import { USERS } from "./users";
import { CHANNELS, CHANNEL_CATEGORIES, getChannels, getChannelCategories } from "./channels";
import { POSTS, TRENDING_POSTS, POPULAR_POSTS } from "./posts";
import { COMMENTS, getCommentsForPost } from "./comments";
import { supabase } from "@/integrations/supabase/client";

// Helper functions to get data from Supabase
export const getPostsForChannel = async (channelId: string | null): Promise<Post[]> => {
  try {
    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        channel_id,
        user_id,
        created_at,
        updated_at,
        likes_count,
        comments_count,
        images
      `)
      .order('created_at', { ascending: false });
    
    if (channelId) {
      query = query.eq('channel_id', channelId);
    }
    
    const { data: postsData, error } = await query;
    
    if (error) {
      console.error("投稿取得エラー:", error);
      // エラー時はダミーデータを返す
      return channelId ? POSTS.filter(post => post.channelId === channelId) : POSTS;
    }
    
    // ユーザー情報を取得して投稿データと結合
    const formattedPosts = await Promise.all(
      postsData.map(async (post) => {
        let userData = {
          id: post.user_id || "unknown",
          name: "不明なユーザー",
          avatar: undefined
        };
        
        if (post.user_id) {
          const { data: profile, error: userError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', post.user_id)
            .single();
            
          if (!userError && profile) {
            userData = {
              id: profile.id,
              name: profile.username || "匿名ユーザー",
              avatar: profile.avatar_url
            };
          }
        }
        
        // ログインユーザーがいいねしているかを確認
        let liked = false;
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          const { data: likeData } = await supabase
            .from('likes')
            .select('id')
            .match({ 
              user_id: user.id,
              post_id: post.id 
            })
            .maybeSingle();
            
          liked = !!likeData;
        }
        
        return {
          id: post.id,
          title: post.title,
          content: post.content,
          userId: post.user_id || "unknown",
          user: userData,
          channelId: post.channel_id,
          createdAt: new Date(post.created_at),
          updatedAt: post.updated_at ? new Date(post.updated_at) : undefined,
          likesCount: post.likes_count,
          commentsCount: post.comments_count,
          liked: liked,
          images: post.images || []
        };
      })
    );
    
    return formattedPosts;
  } catch (error) {
    console.error("投稿取得エラー:", error);
    // エラー時はダミーデータを返す
    return channelId ? POSTS.filter(post => post.channelId === channelId) : POSTS;
  }
};

// 渡したすべての関数とデータをエクスポート
export {
  USERS,
  CHANNELS,
  CHANNEL_CATEGORIES,
  POSTS,
  COMMENTS,
  TRENDING_POSTS,
  POPULAR_POSTS,
  getChannels,
  getChannelCategories,
  getCommentsForPost
};
