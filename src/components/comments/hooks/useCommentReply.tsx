import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Comment } from "@/types";

export function useCommentReply(
  comments: Comment[],
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Helper function to get user profile information
  const getProfileForUser = async (userId: string | null) => {
    if (!userId) {
      return null;
    }
    
    try {
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

  // Helper function to find a comment by ID (either top-level or reply)
  const findCommentById = (comments: Comment[], commentId: string): Comment | undefined => {
    // コメントIDが無効な場合は早期リターン
    if (!commentId) return undefined;
    
    // 完全再帰的に検索する関数
    const searchRecursively = (items: Comment[]): Comment | undefined => {
      for (const item of items) {
        // 現在のアイテムをチェック
        if (item.id === commentId) {
          return item;
        }
        
        // 返信をチェック（存在する場合）
        if (item.replies && item.replies.length > 0) {
          const foundInReplies = searchRecursively(item.replies);
          if (foundInReplies) {
            return foundInReplies;
          }
        }
      }
      return undefined;
    };
    
    return searchRecursively(comments);
  };

  // Function to handle reply submission
  const handleSubmitReply = async (parentId: string, content?: string, nickname?: string) => {
    // Use the content parameter if provided, otherwise use the state
    const replyText = content || replyContent;
    
    if (!replyText.trim()) {
      return false;
    }

    // 親コメントIDが無効な場合は早期リターン
    if (!parentId || parentId.trim() === '') {
      setError("返信先のコメントIDが無効です");
      toast.error("返信先の情報が不正です");
      return false;
    }

    // すでに送信中なら処理をスキップ
    if (submitting) {
      console.log("すでに送信処理中です");
      return false;
    }

    setSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      let userId = null;
      
      if (user) {
        // ログインユーザー
        userId = user.id;
      }
      
      // 親コメント情報を取得（トップレベルコメントか返信か）
      // ローカルにキャッシュされたコメントから親を検索
      const parentInfo = findCommentById(comments, parentId);
      if (!parentInfo) {
        console.error("親コメントが見つかりません:", {
          parentId,
          commentsCount: comments.length,
          firstComment: comments[0]?.id
        });
        throw new Error("親コメントが見つかりません");
      }
      
      // 階層制限: parentInfoがすでに返信（parentIdがある）であれば制限する
      if (parentInfo.parentId) {
        console.error("返信の返信はできません（最大2階層まで）");
        toast.error("返信の返信はできません。最大2階層までのコメントしか投稿できません。");
        setSubmitting(false);
        return false;
      }
      
      const postId = parentInfo.postId || getPostIdFromParentComment(parentId);
      if (!postId) {
        throw new Error("投稿IDが取得できません");
      }
      
      // Prepare reply data
      const replyData = {
        post_id: postId,
        content: replyText,
        parent_id: parentId, // 常に直接の親を参照
        user_id: userId,
        guest_nickname: nickname || '匿名ユーザー'
      };
      
      console.log("返信データをデータベースに投稿中:", replyData);
      
      // Insert reply into database
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
      
      console.log("返信がデータベースに保存されました:", newReplyData.id);
      
      // Get profile information
      let profile = null;
      if (userId) {
        profile = await getProfileForUser(userId);
      }
      
      // Format the new reply
      const formattedReply: Comment = {
        id: newReplyData.id as string,
        postId: newReplyData.post_id as string,
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
      
      console.log("コメントツリーを更新中...");
      
      // コメントツリー内の特定のコメントに返信を追加する再帰関数
      const addReplyToComment = (comments: Comment[], targetId: string, newReply: Comment): Comment[] => {
        return comments.map(comment => {
          // このコメントが対象の場合、直接返信を追加
          if (comment.id === targetId) {
            console.log(`コメント「${comment.id}」に返信を追加しました`);
            return {
              ...comment,
              replies: comment.replies ? [...comment.replies, newReply] : [newReply]
            };
          }
          
          // 返信がある場合は再帰的に検索
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies, targetId, newReply)
            };
          }
          
          // 該当なしの場合はそのまま返す
          return comment;
        });
      };
      
      // 親の階層に関係なく、再帰的に処理する
      const updatedComments = addReplyToComment(comments, parentId, formattedReply);
      
      // コメント状態を更新
      console.log("新しい返信でコメント状態を更新します");
      setComments(updatedComments);
      
      // 返信フォームの状態をリセット
      setReplyTo(null);
      setReplyContent("");
      
      // ユーザーに成功を通知
      toast.success("返信が投稿されました");
      
      return true;
    } catch (err: any) {
      console.error("返信投稿エラー:", err);
      setError(err.message || "返信の投稿に失敗しました");
      toast.error("返信の投稿に失敗しました");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get the post ID from a parent comment
  const getPostIdFromParentComment = (parentId: string): string => {
    const comment = findCommentById(comments, parentId);
    return comment?.postId || '';
  };

  return {
    replyTo,
    replyContent,
    submitting,
    setReplyTo,
    setReplyContent,
    handleSubmitReply
  };
}
