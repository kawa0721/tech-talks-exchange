
import { useState, useEffect } from "react";
import { Comment } from "@/types";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { Loader2 } from "lucide-react";
import { EmptyComments } from "./comment-empty";
import { CommentSkeleton } from "./comment-loading";
import { useCommentLikes } from "./hooks/useCommentLikes";
import { useCommentsSubmit } from "./hooks/useCommentsSubmit";
import { useReplyManagement } from "./hooks/useReplyManagement";
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
  
  // カスタムフックを使用してコメント関連の機能を実装
  const { toggleLike } = useCommentLikes(comments, setComments);
  const { submitComment, submitReply, submitting } = useCommentsSubmit(postId, comments, setComments);
  const { replyTo, replyContent, setReplyTo, setReplyContent } = useReplyManagement();
  const { editingCommentId, editContent, startEditing, cancelEditing, setEditContent, saveEdit } = useCommentEdit(comments, setComments);
  const { deleteComment } = useCommentDelete(comments, setComments);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the parent comments (top-level comments)
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
          throw commentsError;
        }
        
        // Get all parent comment IDs
        const parentIds = parentComments?.map(comment => comment.id) || [];
        
        // No comments yet
        if (parentIds.length === 0) {
          setComments([]);
          setLoading(false);
          
          // Update comment count in parent component
          if (onCommentCountChange) {
            onCommentCountChange(0);
          }
          return;
        }
        
        // Get all replies for these parent comments
        const { data: repliesData, error: repliesError } = await supabase
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
          throw repliesError;
        }
        
        // Check if current user has liked any of these comments
        const { data: { user } } = await supabase.auth.getUser();
        let userLikes: Record<string, boolean> = {};
        
        if (user) {
          // Get all comment IDs (parents and replies)
          const allCommentIds = [
            ...parentIds,
            ...(repliesData?.map(reply => reply.id) || [])
          ];
          
          // Check which comments the user has liked
          const { data: likesData } = await supabase
            .from('likes')
            .select('comment_id')
            .eq('user_id', user.id)
            .in('comment_id', allCommentIds);
            
          // Convert to a map for easy lookup
          userLikes = (likesData || []).reduce((acc: Record<string, boolean>, like) => {
            if (like.comment_id) {
              acc[like.comment_id] = true;
            }
            return acc;
          }, {});
        }
        
        // Organize replies by parent_id
        const repliesByParent: Record<string, any[]> = {};
        (repliesData || []).forEach(reply => {
          if (reply.parent_id) {
            if (!repliesByParent[reply.parent_id]) {
              repliesByParent[reply.parent_id] = [];
            }
            repliesByParent[reply.parent_id].push(reply);
          }
        });
        
        // Format comments with their replies
        const formattedComments: Comment[] = (parentComments || []).map(comment => {
          // Format parent comment
          const formattedComment: Comment = {
            id: comment.id,
            postId,
            userId: comment.user_id || 'guest',
            content: comment.content,
            createdAt: new Date(comment.created_at),
            updatedAt: comment.updated_at ? new Date(comment.updated_at) : undefined,
            likesCount: comment.likes_count,
            liked: userLikes[comment.id] || false,
            guestNickname: comment.guest_nickname,
            user: {
              id: comment.user_id || 'guest',
              name: comment.guest_nickname || (comment.profiles?.username || `ユーザー_${(comment.user_id || '').substring(0, 5)}`),
              avatar: comment.profiles?.avatar_url || '/placeholder-avatar.png'
            },
            replies: []
          };
          
          // Add replies to this parent
          const replies = repliesByParent[comment.id] || [];
          if (replies.length > 0) {
            formattedComment.replies = replies.map(reply => ({
              id: reply.id,
              postId,
              userId: reply.user_id || 'guest',
              parentId: comment.id,
              content: reply.content,
              createdAt: new Date(reply.created_at),
              updatedAt: reply.updated_at ? new Date(reply.updated_at) : undefined,
              likesCount: reply.likes_count,
              liked: userLikes[reply.id] || false,
              guestNickname: reply.guest_nickname,
              user: {
                id: reply.user_id || 'guest',
                name: reply.guest_nickname || (reply.profiles?.username || `ユーザー_${(reply.user_id || '').substring(0, 5)}`),
                avatar: reply.profiles?.avatar_url || '/placeholder-avatar.png'
              }
            }));
          }
          
          return formattedComment;
        });
        
        setComments(formattedComments);
        
        // Update comment count in parent component
        if (onCommentCountChange) {
          const totalCount = (parentComments || []).length;
          onCommentCountChange(totalCount);
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
        onSubmit={submitComment}
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
              onSubmitReply={submitReply}
              onSetEditContent={setEditContent}
              onToggleLike={toggleLike}
              onDeleteComment={deleteComment}
              onStartEditing={startEditing}
              onCancelEditing={cancelEditing}
              onSaveEdit={saveEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
