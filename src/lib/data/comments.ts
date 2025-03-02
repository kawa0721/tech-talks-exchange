
import { Comment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// この関数は特定の投稿のコメントを取得します
export const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
  try {
    // 親コメント（parent_idがnull）のみを最初に取得
    const { data: parentComments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        likes_count,
        parent_id
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error("コメント取得エラー:", commentsError);
      return [];
    }

    // 以前のダミーデータと互換性を保つためのマッピング
    const formattedComments: Comment[] = await Promise.all(
      parentComments.map(async (comment) => {
        // ユーザー情報を取得
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', comment.user_id)
          .single();

        let userInfo = {
          id: comment.user_id,
          name: "不明なユーザー",
          avatar: undefined
        };

        if (!userError && userData) {
          userInfo = {
            id: userData.id,
            name: userData.username || "匿名ユーザー",
            avatar: userData.avatar_url
          };
        }

        // 返信を取得
        const { data: replies, error: repliesError } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            updated_at,
            user_id,
            likes_count
          `)
          .eq('post_id', postId)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        let formattedReplies: Comment[] = [];

        if (!repliesError && replies) {
          formattedReplies = await Promise.all(
            replies.map(async (reply) => {
              // 返信のユーザー情報を取得
              const { data: replyUserData, error: replyUserError } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .eq('id', reply.user_id)
                .single();

              let replyUserInfo = {
                id: reply.user_id,
                name: "不明なユーザー",
                avatar: undefined
              };

              if (!replyUserError && replyUserData) {
                replyUserInfo = {
                  id: replyUserData.id,
                  name: replyUserData.username || "匿名ユーザー",
                  avatar: replyUserData.avatar_url
                };
              }

              return {
                id: reply.id,
                postId,
                userId: reply.user_id,
                parentId: comment.id,
                user: replyUserInfo,
                content: reply.content,
                createdAt: new Date(reply.created_at),
                updatedAt: reply.updated_at ? new Date(reply.updated_at) : undefined,
                likesCount: reply.likes_count,
                liked: false
              };
            })
          );
        }

        return {
          id: comment.id,
          postId,
          userId: comment.user_id,
          user: userInfo,
          content: comment.content,
          createdAt: new Date(comment.created_at),
          updatedAt: comment.updated_at ? new Date(comment.updated_at) : undefined,
          likesCount: comment.likes_count,
          liked: false,
          replies: formattedReplies
        };
      })
    );

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
