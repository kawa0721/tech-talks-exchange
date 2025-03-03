import { useState, useEffect } from "react";
import { Comment } from "@/types";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { Loader2 } from "lucide-react";
import { EmptyComments } from "./comment-empty";
import { CommentSkeleton } from "./comment-loading";
import { useCommentLikes } from "./hooks/useCommentLikes";
import { useCommentEdit } from "./hooks/useCommentEdit";
import { useCommentDelete } from "./hooks/useCommentDelete";
import { supabase } from "@/integrations/supabase/client";

interface CommentSectionProps {
  postId: string;
  postOwnerId?: string;
  onCommentCountChange?: (count: number) => void;
}

const CommentSection = ({ postId, postOwnerId, onCommentCountChange }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Custom hooks for comment functionality
  const { toggleLike } = useCommentLikes(comments, setComments);
  const { editContent, startEditing: editHookStartEditing, cancelEditing: editHookCancelEditing, saveEdit: editHookSaveEdit, handleSetEditContent: setEditContent } = useCommentEdit();
  const { deleteComment } = useCommentDelete(comments, setComments);
  
  // Wrapper functions to match expected interfaces
  const handleStartEditing = (id: string, isReply?: boolean, parentId?: string) => {
    editHookStartEditing(comments, setComments, id, isReply, parentId);
  };

  const handleCancelEditing = (id: string) => {
    editHookCancelEditing(comments, setComments, id);
  };

  const handleSaveEdit = (id: string, isReply?: boolean, parentId?: string) => {
    editHookSaveEdit(comments, setComments, id, isReply, parentId);
  };

  // ユーザープロフィール情報を取得するヘルパー関数
  const getProfileForUser = async (userId: string | null) => {
    if (!userId) {
      return null;
    }
    
    try {
      // プロフィール情報を取得する単純なクエリ
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', userId)
        .single();
      
      return error ? null : data;
    } catch (e) {
      console.error("Profile fetch error:", e);
      return null;
    }
  };

  // Function to handle comment submission
  const handleSubmitComment = async (newComment: string, nickname?: string) => {
    setSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      let userId = null;
      if (user) {
        userId = user.id;
      }
      
      // Prepare comment data
      const commentData = {
        post_id: postId,
        content: newComment,
        user_id: userId,
        guest_nickname: nickname
      };
      
      // Insert comment into database - JOINなし
      const { data: newCommentData, error: insertError } = await supabase
        .from('comments')
        .insert([commentData])
        .select('id, post_id, user_id, content, created_at, updated_at, parent_id, likes_count, guest_nickname')
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      if (!newCommentData) {
        throw new Error("Failed to create comment");
      }
      
      // 別途プロフィール情報を取得
      let profile = null;
      if (userId) {
        profile = await getProfileForUser(userId);
      }
      
      // Format the new comment
      const formattedComment: Comment = {
        id: newCommentData.id as string,
        postId,
        userId: (newCommentData.user_id as string) || 'guest',
        content: newCommentData.content as string,
        createdAt: new Date(newCommentData.created_at),
        updatedAt: newCommentData.updated_at ? new Date(newCommentData.updated_at) : undefined,
        likesCount: newCommentData.likes_count || 0,
        liked: false,
        guestNickname: newCommentData.guest_nickname,
        user: {
          id: newCommentData.user_id || 'guest',
          name: newCommentData.guest_nickname || 
                (profile ? profile.username : null) || 
                `ユーザー_${(newCommentData.user_id || '').substring(0, 5)}`,
          avatar: (profile ? profile.avatar_url : null) || '/placeholder-avatar.png'
        },
        replies: []
      };
      
      setComments(prevComments => [formattedComment, ...prevComments]);
      
      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(comments.length + 1);
      }
    } catch (err: any) {
      console.error("コメント投稿エラー:", err);
      setError(err.message || "コメントの投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle reply submission
  const handleSubmitReply = async (parentId: string, content?: string, nickname?: string) => {
    // Use the content parameter if provided, otherwise use the state
    const replyText = content || replyContent;
    
    if (!replyText.trim()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      let userId = null;
      if (user) {
        userId = user.id;
      }
      
      // Prepare reply data
      const replyData = {
        post_id: postId,
        content: replyText,
        parent_id: parentId,
        user_id: userId,
        guest_nickname: nickname
      };
      
      // Insert reply into database - JOINなし
      const { data: newReplyData, error: insertError } = await supabase
        .from('comments')
        .insert([replyData])
        .select('id, post_id, user_id, content, created_at, updated_at, parent_id, likes_count, guest_nickname')
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      if (!newReplyData) {
        throw new Error("Failed to create reply");
      }
      
      // 別途プロフィール情報を取得
      let profile = null;
      if (userId) {
        profile = await getProfileForUser(userId);
      }
      
      // Format the new reply
      const formattedReply: Comment = {
        id: newReplyData.id as string,
        postId,
        userId: (newReplyData.user_id as string) || 'guest',
        parentId,
        content: newReplyData.content as string,
        createdAt: new Date(newReplyData.created_at),
        updatedAt: newReplyData.updated_at ? new Date(newReplyData.updated_at) : undefined,
        likesCount: newReplyData.likes_count || 0,
        liked: false,
        guestNickname: newReplyData.guest_nickname,
        user: {
          id: newReplyData.user_id || 'guest',
          name: newReplyData.guest_nickname || 
                (profile ? profile.username : null) || 
                `ユーザー_${(newReplyData.user_id || '').substring(0, 5)}`,
          avatar: (profile ? profile.avatar_url : null) || 
                '/placeholder-avatar.png'
        }
      };
      
      // Update comments state with the new reply
      const updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          const updatedReplies = comment.replies ? [...comment.replies, formattedReply] : [formattedReply];
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });
      
      setComments(updatedComments);
      setReplyTo(null);
      setReplyContent("");
    } catch (err: any) {
      console.error("返信投稿エラー:", err);
      setError(err.message || "返信の投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  // 全く分離されたクエリで、コメントとプロフィールを取得する
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. まず親コメントを取得 - 完全にシンプルなクエリ
        const { data: parentComments, error: parentError } = await supabase
          .from('comments')
          .select('id, post_id, user_id, content, created_at, updated_at, parent_id, likes_count, guest_nickname')
          .eq('post_id', postId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });
        
        if (parentError) {
          throw parentError;
        }
        
        if (!parentComments || parentComments.length === 0) {
          setComments([]);
          if (onCommentCountChange) {
            onCommentCountChange(0);
          }
          setLoading(false);
          return;
        }
        
        // 2. 返信を取得
        const parentIds = parentComments.map(comment => comment.id);
        const { data: replies, error: repliesError } = await supabase
          .from('comments')
          .select('id, post_id, user_id, content, created_at, updated_at, parent_id, likes_count, guest_nickname')
          .eq('post_id', postId)
          .in('parent_id', parentIds)
          .order('created_at', { ascending: true });
        
        if (repliesError) {
          throw repliesError;
        }
        
        // 3. ユーザーIDをすべて収集
        const userIds = new Set<string>();
        parentComments.forEach(comment => {
          if (comment.user_id) userIds.add(comment.user_id);
        });
        
        if (replies) {
          replies.forEach(reply => {
            if (reply.user_id) userIds.add(reply.user_id);
          });
        }
        
        // 4. 全ユーザーのプロフィールを一度に取得
        const profiles: Record<string, any> = {};
        if (userIds.size > 0) {
          // 小さいセットの場合は1つずつ取得
          if (userIds.size <= 5) {
            for (const userId of userIds) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .eq('id', userId)
                .single();
              
              if (profile) {
                profiles[userId] = profile;
              }
            }
          } else {
            // 大きいセットの場合はOR条件で取得
            const userIdsArray = Array.from(userIds);
            let whereClause = '';
            
            // OR条件の文字列を構築
            userIdsArray.forEach((id, index) => {
              whereClause += `id.eq.${id}`;
              if (index < userIdsArray.length - 1) {
                whereClause += ',';
              }
            });
            
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .or(whereClause);
            
            if (profilesData) {
              profilesData.forEach(profile => {
                profiles[profile.id] = profile;
              });
            }
          }
        }
        
        // 5. 現在のユーザーのいいね情報を取得
        let userLikes: Record<string, boolean> = {};
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const allCommentIds = [
            ...parentIds,
            ...(replies?.map(reply => reply.id) || [])
          ];
          
          if (allCommentIds.length > 0) {
            const { data: likesData } = await supabase
              .from('likes')
              .select('comment_id')
              .eq('user_id', user.id)
              .in('comment_id', allCommentIds);
            
            if (likesData) {
              likesData.forEach(like => {
                if (like.comment_id) {
                  userLikes[like.comment_id] = true;
                }
              });
            }
          }
        }
        
        // 6. 親コメントごとに返信を整理
        const repliesByParent: Record<string, any[]> = {};
        if (replies) {
          replies.forEach(reply => {
            if (!repliesByParent[reply.parent_id]) {
              repliesByParent[reply.parent_id] = [];
            }
            repliesByParent[reply.parent_id].push(reply);
          });
        }
        
        // 7. フォーマットしたコメントを作成
        const formattedComments: Comment[] = parentComments.map(comment => {
          const profile = comment.user_id ? profiles[comment.user_id] : null;
          
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
                    (profile ? profile.username : null) || 
                    `ユーザー_${(comment.user_id || '').substring(0, 5)}`,
              avatar: (profile ? profile.avatar_url : null) || '/placeholder-avatar.png'
            },
            replies: []
          };
          
          // 返信を追加
          const commentReplies = repliesByParent[comment.id] || [];
          if (commentReplies.length > 0) {
            formattedComment.replies = commentReplies.map(reply => {
              const replyProfile = reply.user_id ? profiles[reply.user_id] : null;
              
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
                        (replyProfile ? replyProfile.username : null) || 
                        `ユーザー_${(reply.user_id || '').substring(0, 5)}`,
                  avatar: (replyProfile ? replyProfile.avatar_url : null) || '/placeholder-avatar.png'
                }
              };
            });
          }
          
          return formattedComment;
        });
        
        setComments(formattedComments);
        
        // コメント数を更新
        if (onCommentCountChange) {
          onCommentCountChange(parentComments.length);
        }
      } catch (err: any) {
        console.error("コメント取得エラー:", err);
        setError(err.message || "コメントの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [postId, onCommentCountChange]);

  return (
    <div className="comments-section mt-8">
      <h2 className="text-xl font-semibold mb-4">コメント ({comments.length})</h2>
      
      <CommentForm 
        postId={postId}
        onSubmit={handleSubmitComment}
        isSubmitting={submitting} 
      />
      
      <div className="mt-6 space-y-4">
        {loading ? (
          <div>
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
            {error}
          </div>
        ) : comments.length === 0 ? (
          <EmptyComments postOwnerId={postOwnerId} />
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replyTo={replyTo}
              editContent={editContent}
              submitting={submitting}
              onSetReplyTo={setReplyTo}
              onSetReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              onSetEditContent={setEditContent}
              onToggleLike={toggleLike}
              onDeleteComment={deleteComment}
              onStartEditing={handleStartEditing}
              onCancelEditing={handleCancelEditing}
              onSaveEdit={handleSaveEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;