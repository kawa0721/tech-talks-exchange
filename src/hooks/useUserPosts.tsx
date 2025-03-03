
import { useState, useEffect } from "react";
import { Post } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useUserPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Fetch posts by the specific user
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (postsError) {
          throw postsError;
        }

        if (!postsData || postsData.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        
        console.log("Retrieved user posts:", postsData);
        
        // For each post, get the user information
        const formattedPosts: Post[] = await Promise.all(
          postsData.map(async (post) => {
            let userData = {
              id: post.user_id || "unknown",
              name: "匿名ユーザー",
              avatar: undefined
            };

            if (post.user_id) {
              // Fetch the user profile
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', post.user_id)
                .single();

              if (!profileError && profile) {
                userData = {
                  id: profile.id,
                  name: profile.username || "匿名ユーザー",
                  avatar: profile.avatar_url
                };
              }
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
              liked: false,
              images: post.images || []
            };
          })
        );
        
        console.log("Formatted user posts:", formattedPosts);
        setPosts(formattedPosts);
      } catch (error) {
        console.error("ユーザー投稿取得エラー:", error);
        toast({
          title: "エラー",
          description: "ユーザーの投稿の取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPosts();
  }, [userId, toast]);

  return { posts, loading };
}
