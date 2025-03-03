
import { Post } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Formats post data from Supabase into our application's Post type
export async function formatPostData(post: any): Promise<Post> {
  let userData = {
    id: post.user_id || "unknown",
    name: "kawakitamasayuki@gmail.com",
    avatar: undefined
  };

  if (post.user_id) {
    // ユーザープロファイルを取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', post.user_id)
      .maybeSingle();

    if (!profileError && profile) {
      userData = {
        id: profile.id,
        name: profile.username || "kawakitamasayuki@gmail.com",
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
}

// Fetch posts with pagination
export async function fetchPaginatedPosts(
  selectedChannel: string | null,
  page: number,
  perPage: number
) {
  // Calculate offset
  const offset = page * perPage;
  
  // Build query
  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Filter by channel if selected
  if (selectedChannel) {
    query = query.eq('channel_id', selectedChannel);
  }

  // Apply pagination
  query = query.range(offset, offset + perPage - 1);

  return await query;
}

// Fetch special posts (trending or popular)
export async function fetchSpecialPosts(type: "trending" | "popular", limit: number = 2) {
  if (type === "trending") {
    // For trending, we just get the most recent posts
    return await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
  } else {
    // For popular, we get posts with the most likes
    return await supabase
      .from('posts')
      .select('*')
      .order('likes_count', { ascending: false })
      .limit(limit);
  }
}
