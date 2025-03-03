
import { useState, useEffect } from "react";
import { Post, Channel } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePosts(type: string = "trending") {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('posts')
          .select('*');
        
        if (type === "popular") {
          // 人気の投稿（いいね数で並び替え）
          query = query.order('likes_count', { ascending: false });
        } else {
          // トレンドの投稿（最新の投稿）
          query = query.order('created_at', { ascending: false });
        }
        
        // 最大10件を取得
        query = query.limit(10);
        
        const { data: postsData, error: postsError } = await query;
        
        if (postsError) {
          throw postsError;
        }

        if (!postsData || postsData.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        
        console.log("Retrieved posts data:", postsData);
        
        // For each post, get the user information
        const formattedPosts: Post[] = await Promise.all(
          postsData.map(async (post) => {
            let userData = {
              id: post.user_id || "unknown",
              name: "匿名ユーザー", // Changed from email to "匿名ユーザー" 
              avatar: undefined
            };

            if (post.user_id) {
              try {
                // Fetch the user profile
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', post.user_id)
                  .limit(1);  

                if (!profileError && profile && profile.length > 0) {
                  userData = {
                    id: profile[0].id,
                    name: profile[0].username || "匿名ユーザー", // Changed from email to "匿名ユーザー"
                    avatar: profile[0].avatar_url
                  };
                }
              } catch (error) {
                console.error("Error fetching profile:", error);
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
        
        console.log("Formatted posts:", formattedPosts);
        setPosts(formattedPosts);
      } catch (error) {
        console.error("投稿取得エラー:", error);
        toast({
          title: "エラー",
          description: "投稿の取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [type, toast]);

  return { posts, loading };
}
