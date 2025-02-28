
import { Post, Comment, Channel } from "@/types";
import { USERS } from "./users";
import { CHANNELS, CHANNEL_CATEGORIES } from "./channels";
import { POSTS, TRENDING_POSTS, POPULAR_POSTS } from "./posts";
import { COMMENTS } from "./comments";

// Helper functions to get data
export const getPostsForChannel = (channelId: string | null): Post[] => {
  if (channelId === null) {
    return POSTS;
  }
  return POSTS.filter(post => post.channelId === channelId);
};

export const getCommentsForPost = (postId: string): Comment[] => {
  return COMMENTS.filter(comment => comment.postId === postId);
};

// Export everything
export {
  USERS,
  CHANNELS,
  CHANNEL_CATEGORIES,
  POSTS,
  COMMENTS,
  TRENDING_POSTS,
  POPULAR_POSTS
};
