
import { useState } from "react";
import { Post } from "@/types";
import { fetchSpecialPosts, formatPostData } from "./fetchPostsUtils";

export function useFeaturePosts() {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);

  // Fetch trending and popular posts
  const fetchFeaturePosts = async () => {
    try {
      // Fetch trending posts
      const { data: trendingData, error: trendingError } = await fetchSpecialPosts("trending");

      if (!trendingError && trendingData && trendingData.length > 0) {
        const formattedTrendingPosts = await Promise.all(
          trendingData.map(formatPostData)
        );
        setTrendingPosts(formattedTrendingPosts);
      } else {
        setTrendingPosts([]);
      }

      // Fetch popular posts
      const { data: popularData, error: popularError } = await fetchSpecialPosts("popular");

      if (!popularError && popularData && popularData.length > 0) {
        const formattedPopularPosts = await Promise.all(
          popularData.map(formatPostData)
        );
        setPopularPosts(formattedPopularPosts);
      } else {
        setPopularPosts([]);
      }
    } catch (error) {
      console.error("特集投稿取得エラー:", error);
      setTrendingPosts([]);
      setPopularPosts([]);
    }
  };

  return {
    trendingPosts,
    popularPosts,
    fetchFeaturePosts
  };
}
