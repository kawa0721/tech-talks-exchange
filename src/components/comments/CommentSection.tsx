import React, { useRef, useMemo } from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { useCommentSection } from "./hooks/useCommentSection";

interface CommentSectionProps {
  postId: string;
  postOwnerId?: string;
  onCommentCountChange?: (count: number) => void;
}

const CommentSection = ({ postId, postOwnerId, onCommentCountChange }: CommentSectionProps) => {
  // Use our new custom hook to manage comments
  const {
    comments,
    loading,
    error,
    replyTo,
    editContent,
    submitting,
    setReplyTo,
    setReplyContent,
    toggleLike,
    deleteComment,
    handleStartEditing,
    handleCancelEditing,
    handleSaveEdit,
    setEditContent,
    handleSubmitComment,
    handleSubmitReply
  } = useCommentSection(postId, onCommentCountChange);
  
  // グローバル変数の代わりにメモ化された関数を使用
  const submitNestedReply = React.useCallback((parentId: string, content: string, nickname?: string) => {
    console.log(`ネスト返信を送信: parentId=${parentId}, content=${content}, nickname=${nickname || 'なし'}`);
    handleSubmitReply(parentId, content, nickname);
    
    // 返信入力完了後に返信状態をリセット
    setReplyTo(null);
  }, [handleSubmitReply, setReplyTo]);

  // すべてのコメント数を計算（親コメント + すべての返信）
  const totalCommentCount = useMemo(() => {
    // 再帰的に返信をカウントする関数
    const countReplies = (replies = []) => {
      if (!replies || replies.length === 0) return 0;
      
      let count = replies.length;
      
      // 返信の返信も再帰的にカウント
      for (const reply of replies) {
        if (reply.replies && reply.replies.length > 0) {
          count += countReplies(reply.replies);
        }
      }
      
      return count;
    };
    
    // 親コメント数 + すべての返信数
    const parentCount = comments.length;
    let replyCount = 0;
    
    for (const comment of comments) {
      if (comment.replies && comment.replies.length > 0) {
        replyCount += countReplies(comment.replies);
      }
    }
    
    return parentCount + replyCount;
  }, [comments]);

  return (
    <div className="comments-section mt-8">
      <h2 className="text-xl font-semibold mb-4">コメント ({totalCommentCount})</h2>
      
      <CommentForm 
        postId={postId}
        onSubmit={handleSubmitComment}
        isSubmitting={submitting} 
      />
      
      <div className="mt-6">
        <CommentList 
          comments={comments}
          postOwnerId={postOwnerId}
          loading={loading}
          error={error}
          replyTo={replyTo}
          editContent={editContent}
          submitting={submitting}
          onSetReplyTo={setReplyTo}
          onSetReplyContent={setReplyContent}
          onSubmitReply={submitNestedReply} // メモ化した関数を渡す
          onSetEditContent={setEditContent}
          onToggleLike={toggleLike}
          onDeleteComment={deleteComment}
          onStartEditing={handleStartEditing}
          onCancelEditing={handleCancelEditing}
          onSaveEdit={handleSaveEdit}
        />
      </div>
    </div>
  );
};

export default CommentSection;
