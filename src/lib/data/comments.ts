
import { Comment } from "@/types";
import { 
  fetchParentComments, 
  fetchReplies, 
  getCurrentUserId 
} from "./commentQueries";
import { 
  organizeRepliesByParentId, 
  createUserLikesMap, 
  formatComment, 
  formatReply 
} from "./commentHelpers";
import { COMMENTS } from "./dummyComments";

// この関数は特定の投稿のコメントを取得します
export const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
  try {
    // 現在のユーザーIDを取得
    const currentUserId = await getCurrentUserId();
    
    // 親コメント（parent_idがnull）を取得
    const { parentComments, error: parentError } = await fetchParentComments(postId);
    if (parentError) return [];
    
    // 親コメントがない場合は空の配列を返す
    if (parentComments.length === 0) return [];
    
    // 全ての親コメントIDを配列にする（返信取得用）
    const parentIds = parentComments.map(comment => comment.id);
    
    // すべての返信コメントを一度に取得（N+1問題解消）
    const { allReplies, error: repliesError } = await fetchReplies(postId, parentIds);
    if (repliesError) return [];
    
    // ログインしている場合は、いいね情報を一括取得
    const allCommentIds = [...parentIds, ...(allReplies?.map(reply => reply.id) || [])];
    const userLikes = await createUserLikesMap(currentUserId, allCommentIds);
    
    // 返信コメントを親コメントIDごとに整理
    const repliesByParentId = organizeRepliesByParentId(allReplies || []);
    
    // 親コメントに返信を関連付けてフォーマット
    const formattedComments = parentComments.map(comment => {
      const commentReplies = repliesByParentId[comment.id] || [];
      
      // 返信のフォーマット
      const formattedReplies = commentReplies.map(reply => 
        formatReply(reply, postId, comment.id, userLikes)
      );
      
      return formatComment(comment, postId, userLikes, formattedReplies);
    });

    return formattedComments;
  } catch (error) {
    console.error("コメント取得エラー:", error);
    return [];
  }
};

// ダミーコメントデータをエクスポート
export { COMMENTS };
