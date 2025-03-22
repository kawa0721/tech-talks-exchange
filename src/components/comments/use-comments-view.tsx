// 作成したビューを使用してコメントとプロフィール情報を一度に取得するカスタムフック
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types';

// 深い比較を行うユーティリティ関数
const isDeepEqual = (obj1: any, obj2: any): boolean => {
  // 基本型または null/undefined の場合
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' && typeof obj2 !== 'object') return obj1 === obj2;

  // 配列の場合
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => isDeepEqual(item, obj2[index]));
  }

  // オブジェクトの場合
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => {
    return keys2.includes(key) && isDeepEqual(obj1[key], obj2[key]);
  });
};

// コメントとプロフィール情報を取得するカスタムフック
export function useCommentsWithProfiles(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isFetchingRef = useRef(false); // 同時実行を防止するフラグ
  const lastFetchedCommentsRef = useRef<Comment[]>([]); // 最後に取得したコメントを保持

  // コメントを再取得するための関数をエクスポート (非同期関数に変更)
  const refreshComments = useCallback(async () => {
    // すでにフェッチ中なら再取得をスキップ
    if (isFetchingRef.current) {
      console.log("すでにコメントを取得中です");
      return;
    }
    
    // 新しいランダム値を設定して強制的に更新をトリガー
    const newTrigger = Date.now();
    setRefreshTrigger(newTrigger);
    
    // 非同期処理を正しく扱うために、小さな遅延を設け、前のレンダリングが完了するのを待つ
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    isFetchingRef.current = true;
    
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
        
        if (!isMounted) return;
        
        if (!parentComments || parentComments.length === 0) {
          setComments([]);
          setLoading(false);
          isFetchingRef.current = false;
          return;
        }
        
        // 2. すべてのコメントを一度に取得する改善版クエリ
        // parent_idがnullでないすべての返信を取得（階層に関係なく）
        const { data: allReplies, error: repliesError } = await supabase
          .from('comments_with_profiles')
          .select('*')
          .eq('post_id', postId)
          .not('parent_id', 'is', null) // parent_idがnullでないすべてを取得
          .order('created_at', { ascending: true });
        
        if (repliesError) {
          throw repliesError;
        }
        
        // 返信が取得できなかった場合のエラーログを追加
        if (!allReplies) {
          console.warn('返信データが取得できませんでした');
        } else {
          console.log(`取得した返信の数: ${allReplies.length}件`);
        }
        
        if (!isMounted) return;
        
        // 親コメントのIDリストを作成
        const parentIds = parentComments.map(comment => comment.id);
        
        // 4. いいね状態を確認
        const { data: { user } } = await supabase.auth.getUser();
        let userLikes: Record<string, boolean> = {};
        
        if (user) {
          // 全てのコメントIDを集める（親コメントと返信）
          const allCommentIds = [
            ...parentIds,
            ...(allReplies?.map(reply => reply.id) || [])
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
        
        if (!isMounted) return;
        
        // 5. 返信を親コメントごとに整理（多階層構造に対応）
        const repliesByParent: Record<string, any[]> = {};
        
        // 最初にすべての返信を親コメントIDごとに分類
        (allReplies || []).forEach(reply => {
          if (reply && reply.parent_id) {
            if (!repliesByParent[reply.parent_id]) {
              repliesByParent[reply.parent_id] = [];
            }
            repliesByParent[reply.parent_id].push({
              ...reply,
              _processed: false // 処理済みフラグを追加
            });
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
          
          // 再帰的に返信ツリーを構築する関数
          const buildReplyTree = (parentId: string): Comment[] => {
            const directReplies = repliesByParent[parentId] || [];
            
            // この親IDに対する返信をマッピング
            return directReplies
              .filter(reply => !reply._processed)
              .map(reply => {
                // 処理済みとしてマーク
                reply._processed = true;
                
                // 返信をフォーマット
                const formattedReply: Comment = {
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
                
                // この返信に対する返信があるかチェック
                const nestedReplies = buildReplyTree(reply.id);
                if (nestedReplies.length > 0) {
                  formattedReply.replies = nestedReplies;
                }
                
                return formattedReply;
              });
          };
          
          // 返信を追加
          formattedComment.replies = buildReplyTree(comment.id);
          
          return formattedComment;
        });
        
        if (isMounted) {
          // コメントの内容が前回と同じかチェック - isEqual の代わりに isDeepEqual を使用
          const isSameComments = isDeepEqual(formattedComments, lastFetchedCommentsRef.current);
          
          if (!isSameComments) {
            // 実際に変化がある場合のみコメントを更新
            console.log("新しいコメントデータをセット:", formattedComments.length, "件");
            setComments(formattedComments);
            // 最後に取得したコメントを保存
            lastFetchedCommentsRef.current = formattedComments;
          } else {
            console.log("コメントデータに変更なし - 更新をスキップ");
          }
          
          setLoading(false);
        }
      } catch (err: any) {
        console.error('コメント取得エラー:', err);
        if (isMounted) {
          setError(err.message || 'コメントの取得に失敗しました');
          setLoading(false);
        }
      } finally {
        if (isMounted) {
          isFetchingRef.current = false;
        }
      }
    };
    
    fetchComments();
    
    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, [postId, refreshTrigger]); // refreshTriggerを依存配列に追加
  
  return { comments, loading, error, refreshComments };
}
