
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
import { useCommentsWithProfiles } from "./use-comments-view";

interface CommentSectionProps {
  postId: string;
  postOwnerId?: string;
  onCommentCountChange?: (count: number) => void;
}

const CommentSection = ({ postId, postOwnerId, onCommentCountChange }: CommentSectionProps) => {
  // 作成したカスタムフックを使用
  const { comments, loading, error: fetchError } = useCommentsWithProfiles(postId);
  
  // ローカル状態
  const [commentsState, setCommentsState] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // 取得したコメントをローカル状態に反映
  useEffect(() => {
    if (comments.length > 0) {
      setCommentsState(comments);
      
      // コメント数を更新
      if (onCommentCountChange) {
        onCommentCountChange(comments.length);
      }
    }
  }, [comments, onCommentCountChange]);
  
  // エラーをローカル状態に反映
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);
  
  // Custom hooks for comment functionality
  const { toggleLike } = useCommentLikes(commentsState, setCommentsState);
  const { editContent, startEditing: editHookStartEditing, cancelEditing: editHookCancelEditing, saveEdit: editHookSaveEdit, handleSetEditContent: setEditContent } = useCommentEdit();
  const { deleteComment } = useCommentDelete(commentsState, setCommentsState);
  
  // Wrapper functions to match expected interfaces
  const handleStartEditing = (id: string, isReply?: boolean, parentId?: string) => {
    editHookStartEditing(commentsState, setCommentsState, id, isReply, parentId);
  };

  const handleCancelEditing = (id: string) => {
    editHookCancelEditing(commentsState, setCommentsState, id);
  };

  const handleSaveEdit = (id: string, isReply?: boolean, parentId?: string) => {
    editHookSaveEdit(commentsState, setCommentsState, id, isReply, parentId);
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
      
      setCommentsState(prevComments => [formattedComment, ...prevComments]);
      
      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(commentsState.length + 1);
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
      const updatedComments = commentsState.map(comment => {
        if (comment.id === parentId) {
          const updatedReplies = comment.replies ? [...comment.replies, formattedReply] : [formattedReply];
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });
      
      setCommentsState(updatedComments);
      setReplyTo(null);
      setReplyContent("");
    } catch (err: any) {
      console.error("返信投稿エラー:", err);
      setError(err.message || "返信の投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-section mt-8">
      <h2 className="text-xl font-semibold mb-4">コメント ({commentsState.length})</h2>
      
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
        ) : commentsState.length === 0 ? (
          <EmptyComments postOwnerId={postOwnerId} />
        ) : (
          commentsState.map(comment => (
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
