import { useState, useEffect, useCallback, useRef } from "react";
import { Comment } from "@/types";
import { useCommentLikes } from "./useCommentLikes";
import { useCommentEdit } from "./useCommentEdit";
import { useCommentDelete } from "./useCommentDelete";
import { useCommentReply } from "./useCommentReply";
import { useCommentSubmission } from "./useCommentSubmission";
import { useCommentsWithProfiles } from "../use-comments-view";

export function useCommentSection(postId: string, onCommentCountChange?: (count: number) => void) {
  // Get comments from the custom hook with refreshComments function
  const { comments, loading, error: fetchError, refreshComments } = useCommentsWithProfiles(postId);
  
  // Local state
  const [commentsState, setCommentsState] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 更新フラグを使用して無限ループを防止
  const isUpdatingRef = useRef(false);
  // 前回のコメントの状態を保持
  const prevCommentsRef = useRef<Comment[]>([]);
  
  // コメントステートを更新する関数（依存関係の外に出す）
  const updateCommentsState = useCallback((newComments: Comment[]) => {
    if (!newComments || newComments.length === 0) return;
    
    // まったく同じコメントデータなら更新しない（参照比較ではなく内容比較）
    if (JSON.stringify(prevCommentsRef.current) === JSON.stringify(newComments)) {
      return;
    }
    
    // 新しいコメントを設定
    setCommentsState(newComments);
    // 参照用に保存
    prevCommentsRef.current = newComments;
    
    // Update comment count
    if (onCommentCountChange) {
      onCommentCountChange(newComments.length);
    }
  }, [onCommentCountChange]);
  
  // 初期化時に一度だけコメントをロード
  useEffect(() => {
    if (comments.length > 0 && commentsState.length === 0) {
      console.log("初期コメントをロード:", comments.length);
      updateCommentsState(comments);
    }
  }, [comments.length, commentsState.length, updateCommentsState]);
  
  // 更新時のみ発火するuseEffect
  useEffect(() => {
    // すでに更新中の場合はスキップ
    if (isUpdatingRef.current) return;
    
    // コメントの長さや内容が変わった場合のみ更新
    if (comments.length !== prevCommentsRef.current.length) {
      console.log("コメント数が変更されたため更新:", 
        `前: ${prevCommentsRef.current.length} → 後: ${comments.length}`);
      updateCommentsState(comments);
    }
  // 依存配列から更新関数を削除して無限ループを防止
  }, [comments.length]);
  
  // Update error state
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);
  
  // 安全にコメントを更新する関数
  const safeRefreshComments = useCallback(async () => {
    if (isUpdatingRef.current) {
      console.log("既に更新中のため、リフレッシュをスキップします");
      return;
    }
    
    isUpdatingRef.current = true;
    console.log("コメントデータの再取得を開始...");
    
    try {
      await refreshComments();
      
      // 強制的に遅延をかけてUIの更新を保証
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 直後のコメント反映を確実にするため、明示的にコメントデータをUIに適用
      console.log("コメントデータの再取得が完了しました");
    } catch (err) {
      console.error("コメントデータの再取得中にエラーが発生しました:", err);
    } finally {
      // タイマーをセット
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 200);
    }
  }, [refreshComments]);
  
  // Custom hooks for comment functionality
  const { toggleLike } = useCommentLikes(commentsState, setCommentsState);
  const { 
    editContent, 
    startEditing: editHookStartEditing, 
    cancelEditing: editHookCancelEditing, 
    saveEdit: editHookSaveEdit, 
    handleSetEditContent: setEditContent 
  } = useCommentEdit();
  const { deleteComment } = useCommentDelete(commentsState, setCommentsState);
  const { 
    replyTo, 
    replyContent, 
    submitting: replySubmitting,
    setReplyTo, 
    setReplyContent, 
    handleSubmitReply: originalHandleSubmitReply 
  } = useCommentReply(commentsState, setCommentsState, setError);
  const {
    submitting: commentSubmitting,
    handleSubmitComment: originalHandleSubmitComment
  } = useCommentSubmission(postId, commentsState, setCommentsState, setError, onCommentCountChange);
  
  // Combined submitting state
  const submitting = replySubmitting || commentSubmitting;
  
  // Wrappers for submit functions that refresh comments after submission
  const handleSubmitComment = useCallback(async (content: string, nickname?: string) => {
    if (submitting) return false;
    
    try {
      console.log("コメント投稿を開始...");
      const result = await originalHandleSubmitComment(content, nickname);
      
      console.log("コメント投稿が完了しました、データを再取得します");
      // コメントデータを再取得（一度だけ）
      await safeRefreshComments();
      return result;
    } catch (err) {
      console.error("コメント投稿エラー:", err);
      setError(err instanceof Error ? err.message : "コメントの投稿に失敗しました");
      return false;
    }
  }, [originalHandleSubmitComment, safeRefreshComments, setError, submitting]);

  const handleSubmitReply = useCallback(async (parentId: string, content: string, nickname?: string) => {
    if (submitting) return false;
    
    // 無効なIDをチェック
    if (!parentId || parentId.trim() === '') {
      console.error("無効な親コメントID:", parentId);
      setError("無効な親コメントIDです");
      return false;
    }
    
    try {
      // デバッグログ追加
      console.log("返信する親コメントID:", parentId);
      console.log("現在のコメント状態:", commentsState);
      
      // まず最新データを取得してから親コメントの存在をチェック
      await safeRefreshComments();
      
      // 少し待って確実にコメントステートが更新されるのを待つ
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 親コメントが存在するか確認（現在のcommentsStateから）
      const parentExists = findCommentInTree(commentsState, parentId);
      
      if (!parentExists) {
        console.error("親コメントが見つかりません:", parentId);
        throw new Error("親コメントが見つかりません");
      }
      
      // 親コメントが存在する場合のみ返信を実行
      console.log("返信を投稿中...");
      await originalHandleSubmitReply(parentId, content, nickname);
      
      // 返信後にデータを再取得
      console.log("返信投稿が完了しました、データを再取得します");
      await safeRefreshComments();
      
      // フォームをリセット
      setReplyTo(null);
      
      return true;
    } catch (err) {
      console.error("返信投稿エラー:", err);
      setError(err instanceof Error ? err.message : "返信の投稿に失敗しました");
      return false;
    }
  }, [originalHandleSubmitReply, safeRefreshComments, setError, commentsState, submitting, setReplyTo]);

  // 再帰的にコメントツリーからコメントを検索する関数
  const findCommentInTree = (comments: Comment[], commentId: string): boolean => {
    if (!comments || !commentId) return false;
    
    // 完全に再帰的な実装に変更
    const searchRecursively = (items: Comment[]): boolean => {
      for (const item of items) {
        // 現在のアイテムをチェック
        if (item.id === commentId) {
          return true;
        }
        
        // 返信をチェック
        if (item.replies && item.replies.length > 0) {
          if (searchRecursively(item.replies)) {
            return true;
          }
        }
      }
      return false;
    };
    
    return searchRecursively(comments);
  };
  
  // Helper functions to handle editing
  const handleStartEditing = (id: string, isReply?: boolean, parentId?: string) => {
    editHookStartEditing(commentsState, setCommentsState, id, isReply, parentId);
  };

  const handleCancelEditing = (id: string) => {
    editHookCancelEditing(commentsState, setCommentsState, id);
  };

  const handleSaveEdit = async (id: string, isReply?: boolean, parentId?: string) => {
    try {
      console.log("コメント編集を保存中...");
      await editHookSaveEdit(commentsState, setCommentsState, id, isReply, parentId);
      
      // 編集後にデータを再取得
      console.log("コメント編集が完了しました、データを再取得します");
      await safeRefreshComments();
    } catch (err) {
      console.error("編集エラー:", err);
      setError(err instanceof Error ? err.message : "編集に失敗しました");
    }
  };

  return {
    comments: commentsState,
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
  };
}
