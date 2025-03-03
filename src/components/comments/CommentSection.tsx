
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
      
      // Insert comment into database
      const { data: newCommentData, error: insertError } = await supabase
        .from('comments')
        .insert([commentData])
        .select('*, profiles:profiles(id, username, avatar_url)')
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      if (!newCommentData) {
        throw new Error("Failed to create comment");
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
                (newCommentData.profiles && typeof newCommentData.profiles === 'object' ? 
                  (newCommentData.profiles as any)?.username || `ユーザー_${(newCommentData.user_id || '').substring(0, 5)}` : 
                  `ユーザー_${(newCommentData.user_id || '').substring(0, 5)}`),
          avatar: (newCommentData.profiles && typeof newCommentData.profiles === 'object' ? 
                  (newCommentData.profiles as any)?.avatar_url : null) || 
                  '/placeholder-avatar.png'
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
      
      // Insert reply into database
      const { data: newReplyData, error: insertError } = await supabase
        .from('comments')
        .insert([replyData])
        .select('*, profiles:profiles(id, username, avatar_url)')
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      if (!newReplyData) {
        throw new Error("Failed to create reply");
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
                (newReplyData.profiles && typeof newReplyData.profiles === 'object' ? 
                  (newReplyData.profiles as any)?.username || `ユーザー_${(newReplyData.user_id || '').substring(0, 5)}` : 
                  `ユーザー_${(newReplyData.user_id || '').substring(0, 5)}`),
          avatar: (newReplyData.profiles && typeof newReplyData.profiles === 'object' ? 
                  (newReplyData.profiles as any)?.avatar_url : null) || 
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

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the parent comments (top-level comments)
        const { data: parentCommentsData, error: commentsError } = await supabase
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
            profiles:profiles(id, username, avatar_url)
          `)
          .eq('post_id', postId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });
          
        if (commentsError) {
          throw commentsError;
        }
        
        if (!parentCommentsData || parentCommentsData.length === 0) {
          setComments([]);
          setLoading(false);
          
          // Update comment count in parent component
          if (onCommentCountChange) {
            onCommentCountChange(0);
          }
          return;
        }
        
        // Get all parent comment IDs
        const parentIds = parentCommentsData.map(comment => comment.id) || [];
        
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
            profiles:profiles(id, username, avatar_url)
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
            if (like && like.comment_id) {
              acc[like.comment_id] = true;
            }
            return acc;
          }, {});
        }
        
        // Organize replies by parent_id
        const repliesByParent: Record<string, any[]> = {};
        (repliesData || []).forEach(reply => {
          if (reply && reply.parent_id) {
            if (!repliesByParent[reply.parent_id]) {
              repliesByParent[reply.parent_id] = [];
            }
            repliesByParent[reply.parent_id].push(reply);
          }
        });
        
        // Format comments with their replies
        const formattedComments: Comment[] = (parentCommentsData || [])
          .filter(Boolean)
          .map(comment => {
            // Format parent comment
            const formattedComment: Comment = {
              id: comment.id as string,
              postId,
              userId: comment.user_id as string || 'guest',
              content: comment.content as string,
              createdAt: new Date(comment.created_at),
              updatedAt: comment.updated_at ? new Date(comment.updated_at) : undefined,
              likesCount: comment.likes_count || 0,
              liked: userLikes[comment.id] || false,
              guestNickname: comment.guest_nickname,
              user: {
                id: comment.user_id || 'guest',
                name: comment.guest_nickname || 
                      (comment.profiles && typeof comment.profiles === 'object' ? 
                        (comment.profiles as any)?.username || `ユーザー_${(comment.user_id || '').substring(0, 5)}` : 
                        `ユーザー_${(comment.user_id || '').substring(0, 5)}`),
                avatar: (comment.profiles && typeof comment.profiles === 'object' ? 
                        (comment.profiles as any)?.avatar_url : null) || 
                        '/placeholder-avatar.png'
              },
              replies: []
            };
            
            // Add replies to this parent
            const replies = repliesByParent[comment.id] || [];
            if (replies.length > 0) {
              formattedComment.replies = replies
                .filter(Boolean)
                .map(reply => ({
                  id: reply.id as string,
                  postId,
                  userId: reply.user_id as string || 'guest',
                  parentId: comment.id,
                  content: reply.content as string,
                  createdAt: new Date(reply.created_at),
                  updatedAt: reply.updated_at ? new Date(reply.updated_at) : undefined,
                  likesCount: reply.likes_count || 0,
                  liked: userLikes[reply.id] || false,
                  guestNickname: reply.guest_nickname,
                  user: {
                    id: reply.user_id || "guest",
                    name: reply.guest_nickname || 
                          (reply.profiles && typeof reply.profiles === 'object' ? 
                            (reply.profiles as any)?.username || `ユーザー_${(reply.user_id || '').substring(0, 5)}` : 
                            `ユーザー_${(reply.user_id || '').substring(0, 5)}`),
                    avatar: (reply.profiles && typeof reply.profiles === 'object' ? 
                            (reply.profiles as any)?.avatar_url : null) || 
                            '/placeholder-avatar.png'
                  }
                }));
            }
            
            return formattedComment;
          });
        
        setComments(formattedComments);
        
        // Update comment count in parent component
        if (onCommentCountChange) {
          const totalCount = parentCommentsData.length;
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
