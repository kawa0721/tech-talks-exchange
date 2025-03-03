
// 作成したビューを使用してコメントとプロフィール情報を一度に取得するカスタムフック
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types';

// コメントとプロフィール情報を取得するカスタムフック
export function useCommentsWithProfiles(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        
        // 1. 親コメントを取得するクエリ
        const { data: parentComments, error: parentError } = await supabase
          .from('comments_with_profiles')
          .select('*')
          .eq('post_id', postId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });
        
        if (parentError) {
          throw parentError;
        }
        
        if (!parentComments || parentComments.length === 0) {
          setComments([]);
          setLoading(false);
          return;
        }
        
        // 2. 親コメントのIDを収集
        const parentIds = parentComments.map(comment => comment.id);
        
        // 3. 返信を取得するクエリ
        const { data: replies, error: repliesError } = await supabase
          .from('comments_with_profiles')
          .select('*')
          .eq('post_id', postId)
          .in('parent_id', parentIds)
          .order('created_at', { ascending: true });
        
        if (repliesError) {
          throw repliesError;
        }
        
        // 4. いいね状態を確認
        const { data: { user } } = await supabase.auth.getUser();
        let userLikes: Record<string, boolean> = {};
        
        if (user) {
          const allCommentIds = [
            ...parentIds,
            ...(replies?.map(reply => reply.id) || [])
          ];
          
          const { data: likesData } = await supabase
            .from('likes')
            .select('comment_id')
            .eq('user_id', user.id)
            .in('comment_id', allCommentIds);
          
          userLikes = (likesData || []).reduce((acc: Record<string, boolean>, like) => {
            if (like && like.comment_id) {
              acc[like.comment_id] = true;
            }
            return acc;
          }, {});
        }
        
        // 5. 返信を親コメントごとに整理
        const repliesByParent: Record<string, any[]> = {};
        (replies || []).forEach(reply => {
          if (reply && reply.parent_id) {
            if (!repliesByParent[reply.parent_id]) {
              repliesByParent[reply.parent_id] = [];
            }
            repliesByParent[reply.parent_id].push(reply);
          }
        });
        
        // 6. コメントをフォーマット
        const formattedComments: Comment[] = parentComments.map(comment => {
          // 親コメントをフォーマット
          const formattedComment: Comment = {
            id: comment.id,
            postId: comment.post_id,
            userId: comment.user_id || 'guest',
            content: comment.content,
            createdAt: new Date(comment.created_at),
            updatedAt: comment.updated_at ? new Date(comment.updated_at) : undefined,
            likesCount: comment.likes_count || 0,
            liked: userLikes[comment.id] || false,
            guestNickname: comment.guest_nickname,
            user: {
              id: comment.user_id || 'guest',
              name: comment.guest_nickname || 
                    comment.username || 
                    `ユーザー_${(comment.user_id || '').substring(0, 5)}`,
              avatar: comment.avatar_url || '/placeholder-avatar.png'
            },
            replies: []
          };
          
          // 返信を追加
          const commentReplies = repliesByParent[comment.id] || [];
          if (commentReplies.length > 0) {
            formattedComment.replies = commentReplies.map(reply => {
              return {
                id: reply.id,
                postId: reply.post_id,
                userId: reply.user_id || 'guest',
                parentId: reply.parent_id,
                content: reply.content,
                createdAt: new Date(reply.created_at),
                updatedAt: reply.updated_at ? new Date(reply.updated_at) : undefined,
                likesCount: reply.likes_count || 0,
                liked: userLikes[reply.id] || false,
                guestNickname: reply.guest_nickname,
                user: {
                  id: reply.user_id || 'guest',
                  name: reply.guest_nickname || 
                        reply.username || 
                        `ユーザー_${(reply.user_id || '').substring(0, 5)}`,
                  avatar: reply.avatar_url || '/placeholder-avatar.png'
                }
              };
            });
          }
          
          return formattedComment;
        });
        
        setComments(formattedComments);
      } catch (err: any) {
        console.error('コメント取得エラー:', err);
        setError(err.message || 'コメントの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [postId]);
  
  return { comments, loading, error };
}
