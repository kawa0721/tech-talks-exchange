
import { Comment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// 返信コメントを親コメントIDごとに整理する関数
export const organizeRepliesByParentId = (allReplies: any[]): Record<string, any[]> => {
  const repliesByParentId: Record<string, any[]> = {};
  
  allReplies.forEach(reply => {
    if (!repliesByParentId[reply.parent_id]) {
      repliesByParentId[reply.parent_id] = [];
    }
    repliesByParentId[reply.parent_id].push(reply);
  });
  
  return repliesByParentId;
};

// ユーザーがいいねしたコメントIDのマップを作成する関数
export const createUserLikesMap = async (
  currentUserId: string | undefined, 
  commentIds: string[]
): Promise<Record<string, boolean>> => {
  let userLikes: Record<string, boolean> = {};
  
  if (!currentUserId || commentIds.length === 0) return userLikes;
  
  const { data: likesData } = await supabase
    .from('likes')
    .select('comment_id')
    .eq('user_id', currentUserId)
    .in('comment_id', commentIds);
    
  if (likesData) {
    // いいねしたコメントIDのマップを作成
    userLikes = likesData.reduce((acc: Record<string, boolean>, like) => {
      acc[like.comment_id] = true;
      return acc;
    }, {});
  }
  
  return userLikes;
};

// コメントをフォーマットする関数
export const formatComment = (
  comment: any, 
  postId: string, 
  userLikes: Record<string, boolean>,
  formattedReplies: Comment[] = []
): Comment => {
  const profileData = comment.profiles || {};
  
  return {
    id: comment.id,
    postId,
    userId: comment.user_id,
    parentId: comment.parent_id,
    user: {
      id: comment.user_id || "guest",
      name: profileData.username || comment.guest_nickname || "匿名ユーザー",
      avatar: profileData.avatar_url
    },
    content: comment.content,
    createdAt: new Date(comment.created_at),
    updatedAt: comment.updated_at ? new Date(comment.updated_at) : undefined,
    likesCount: comment.likes_count,
    liked: !!userLikes[comment.id],
    replies: formattedReplies,
    guestNickname: comment.guest_nickname
  };
};

// 返信コメントをフォーマットする関数
export const formatReply = (
  reply: any, 
  postId: string, 
  parentId: string,
  userLikes: Record<string, boolean>
): Comment => {
  const replyProfileData = reply.profiles || {};
  
  return {
    id: reply.id,
    postId,
    userId: reply.user_id,
    parentId,
    user: {
      id: reply.user_id || "guest",
      name: replyProfileData.username || reply.guest_nickname || "匿名ユーザー",
      avatar: replyProfileData.avatar_url
    },
    content: reply.content,
    createdAt: new Date(reply.created_at),
    updatedAt: reply.updated_at ? new Date(reply.updated_at) : undefined,
    likesCount: reply.likes_count,
    liked: !!userLikes[reply.id],
    guestNickname: reply.guest_nickname
  };
};
