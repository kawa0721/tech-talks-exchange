
import { Comment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// この関数は特定の投稿のコメントを取得します
export const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
  try {
    // セッションを取得
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    
    // 親コメント（parent_idがnull）を取得
    const { data: parentComments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        likes_count,
        parent_id,
        guest_nickname,
        profiles(id, username, avatar_url)
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error("親コメント取得エラー:", commentsError);
      return [];
    }
    
    // 全ての親コメントIDを配列にする（返信取得用）
    const parentIds = parentComments.map(comment => comment.id);
    
    // すべての返信コメントを一度に取得（N+1問題解消）
    const { data: allReplies, error: repliesError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        likes_count,
        parent_id,
        guest_nickname,
        profiles(id, username, avatar_url)
      `)
      .eq('post_id', postId)
      .in('parent_id', parentIds)
      .order('created_at', { ascending: true });
      
    if (repliesError) {
      console.error("返信取得エラー:", repliesError);
      return [];
    }
    
    // ログインしている場合は、いいね情報を一括取得
    let userLikes: Record<string, boolean> = {};
    if (currentUserId) {
      const allCommentIds = [...parentIds, ...allReplies.map(reply => reply.id)];
      
      const { data: likesData } = await supabase
        .from('likes')
        .select('comment_id')
        .eq('user_id', currentUserId)
        .in('comment_id', allCommentIds);
        
      if (likesData) {
        // いいねしたコメントIDのマップを作成
        userLikes = likesData.reduce((acc: Record<string, boolean>, like) => {
          acc[like.comment_id] = true;
          return acc;
        }, {});
      }
    }
    
    // 返信コメントを親コメントIDごとに整理
    const repliesByParentId: Record<string, any[]> = {};
    allReplies.forEach(reply => {
      if (!repliesByParentId[reply.parent_id]) {
        repliesByParentId[reply.parent_id] = [];
      }
      repliesByParentId[reply.parent_id].push(reply);
    });
    
    // 親コメントに返信を関連付けてフォーマット
    const formattedComments = parentComments.map(comment => {
      const profileData = comment.profiles || {};
      const commentReplies = repliesByParentId[comment.id] || [];
      
      // 返信のフォーマット
      const formattedReplies = commentReplies.map(reply => {
        const replyProfileData = reply.profiles || {};
        return {
          id: reply.id,
          postId,
          userId: reply.user_id,
          parentId: comment.id,
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
      });
      
      return {
        id: comment.id,
        postId,
        userId: comment.user_id,
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
    });

    return formattedComments;
  } catch (error) {
    console.error("コメント取得エラー:", error);
    return [];
  }
};

// ダミーコメントデータ - 互換性のために残していますが、実際には使用されません
export const COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    userId: 'user-2',
    user: {
      id: 'user-2',
      name: '山田 花子',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    content: 'この記事とても参考になりました！特にPrettierとGitLensは私も愛用しています。',
    createdAt: new Date('2024-04-28T14:30:00Z'),
    likesCount: 5,
    liked: false
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    userId: 'user-3',
    user: {
      id: 'user-3',
      name: '佐藤 次郎',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    content: 'vscode-iconsの代わりにMaterial Icon Themeも良いですよ！',
    createdAt: new Date('2024-04-28T15:45:00Z'),
    likesCount: 3,
    liked: true
  },
  {
    id: 'comment-3',
    postId: 'post-2',
    userId: 'user-4',
    user: {
      id: 'user-4',
      name: '鈴木 さくら',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    content: 'useEffectの使い方がよく分かりました。依存配列の重要性について、もう少し詳しく説明していただけませんか？',
    createdAt: new Date('2024-04-27T19:20:00Z'),
    likesCount: 2,
    liked: false
  },
  {
    id: 'comment-4',
    postId: 'post-2',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: '田中 太郎',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    content: 'useCallbackとuseMemoの違いについても知りたいです。',
    createdAt: new Date('2024-04-27T20:10:00Z'),
    likesCount: 1,
    liked: false
  }
];
