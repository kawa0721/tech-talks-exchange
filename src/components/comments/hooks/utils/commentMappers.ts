import { Comment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Finds a comment or reply by ID and updates it with the provided update function
 */
export function findAndUpdateComment(
  comments: Comment[],
  commentId: string,
  updateFn: (comment: Comment) => Comment
): Comment[] {
  // 再帰的に任意の深さのコメントを探して更新する
  const updateRecursively = (items: Comment[]): Comment[] => {
    return items.map(item => {
      // このコメントが対象なら更新
      if (item.id === commentId) {
        return updateFn(item);
      }
      
      // 返信があれば再帰的に検索・更新
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: updateRecursively(item.replies)
        };
      }
      
      // 変更なし
      return item;
    });
  };
  
  return updateRecursively(comments);
}

/**
 * Recursively finds a comment by ID in the comments tree
 */
export function findCommentInTree(
  comments: Comment[],
  commentId: string
): Comment | undefined {
  // 再帰的に任意の深さのコメントを検索する関数
  const searchDeep = (items: Comment[]): Comment | undefined => {
    for (const item of items) {
      // 現在のコメントをチェック
      if (item.id === commentId) {
        return item;
      }
      
      // 返信があれば再帰的に検索
      if (item.replies && item.replies.length > 0) {
        const found = searchDeep(item.replies);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  return searchDeep(comments);
}

/**
 * Maps a newly created comment with user profile information
 */
export async function mapCommentWithUserInfo(
  commentData: any,
  postId: string,
  currentUserId?: string | null
): Promise<Comment> {
  let userProfile = null;
  
  // If the comment was made by a logged-in user, fetch their profile
  if (commentData.user_id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', commentData.user_id)
      .single();
      
    userProfile = profileData;
  }
  
  // Create and return the formatted comment object
  return {
    id: commentData.id,
    postId,
    userId: commentData.user_id || 'guest',
    content: commentData.content,
    createdAt: new Date(commentData.created_at),
    updatedAt: commentData.updated_at ? new Date(commentData.updated_at) : undefined,
    likesCount: commentData.likes_count || 0,
    liked: false, // New comments are not liked by default
    guestNickname: commentData.guest_nickname,
    user: {
      id: commentData.user_id || 'guest',
      name: userProfile?.username || commentData.guest_nickname || "匿名ユーザー",
      avatar: userProfile?.avatar_url || '/placeholder-avatar.png'
    },
    replies: [] // New comments have no replies initially
  };
}

/**
 * Maps a newly created reply with user profile information
 */
export async function mapReplyWithUserInfo(
  replyData: any,
  postId: string,
  parentId: string,
  currentUserId?: string | null
): Promise<Comment> {
  let userProfile = null;
  
  // If the reply was made by a logged-in user, fetch their profile
  if (replyData.user_id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', replyData.user_id)
      .single();
      
    userProfile = profileData;
  }
  
  // Create and return the formatted reply object
  return {
    id: replyData.id,
    postId,
    parentId,
    userId: replyData.user_id || 'guest',
    content: replyData.content,
    createdAt: new Date(replyData.created_at),
    updatedAt: replyData.updated_at ? new Date(replyData.updated_at) : undefined,
    likesCount: replyData.likes_count || 0,
    liked: false, // New replies are not liked by default
    guestNickname: replyData.guest_nickname,
    user: {
      id: replyData.user_id || 'guest',
      name: userProfile?.username || replyData.guest_nickname || "匿名ユーザー",
      avatar: userProfile?.avatar_url || '/placeholder-avatar.png'
    }
  };
}
