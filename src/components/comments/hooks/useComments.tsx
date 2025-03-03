
import { useState, useEffect } from "react";
import { Comment } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editContent, setEditContent] = useState<Record<string, string>>({});

  // コメントデータの取得
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
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
            parent_id,
            guest_nickname
          `)
          .eq('post_id', postId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (commentsError) {
          throw commentsError;
        }

        // ユーザー情報を取得
        const commentsWithUserInfo = await Promise.all(
          parentComments.map(async (comment) => {
            let userInfo = {
              id: comment.user_id || 'guest',
              name: comment.guest_nickname || "ゲスト",
              avatar: undefined
            };

            // ユーザーIDがある場合のみプロフィール情報を取得
            if (comment.user_id) {
              // ユーザー情報を取得
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .eq('id', comment.user_id)
                .single();

              if (!userError && userData) {
                userInfo = {
                  id: userData.id,
                  name: userData.username || "不明なユーザー",
                  avatar: userData.avatar_url
                };
              }
            }

            // いいね状態を確認
            const user = await supabase.auth.getUser();
            let liked = false;
            
            if (user.data.user) {
              const { data: likeData } = await supabase
                .from('likes')
                .select('id')
                .match({ 
                  user_id: user.data.user.id,
                  comment_id: comment.id 
                })
                .maybeSingle();
                
              liked = !!likeData;
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
                likes_count,
                guest_nickname
              `)
              .eq('post_id', postId)
              .eq('parent_id', comment.id)
              .order('created_at', { ascending: true });

            if (repliesError) {
              console.error("返信取得エラー:", repliesError);
              return {
                id: comment.id,
                postId,
                userId: comment.user_id,
                user: userInfo,
                content: comment.content,
                createdAt: new Date(comment.created_at),
                updatedAt: comment.updated_at ? new Date(comment.updated_at) : undefined,
                likesCount: comment.likes_count,
                liked: liked,
                replies: [],
                guestNickname: comment.guest_nickname
              };
            }

            // 返信にユーザー情報を追加
            const repliesWithUserInfo = await Promise.all(
              replies.map(async (reply) => {
                let replyUserInfo = {
                  id: reply.user_id || 'guest',
                  name: reply.guest_nickname || "ゲスト",
                  avatar: undefined
                };

                // ユーザーIDがある場合のみプロフィール情報を取得
                if (reply.user_id) {
                  // ユーザー情報を取得
                  const { data: replyUserData, error: replyUserError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url')
                    .eq('id', reply.user_id)
                    .single();

                  if (!replyUserError && replyUserData) {
                    replyUserInfo = {
                      id: replyUserData.id,
                      name: replyUserData.username || "不明なユーザー",
                      avatar: replyUserData.avatar_url
                    };
                  }
                }

                // 返信のいいね状態を確認
                let replyLiked = false;
                
                if (user.data.user) {
                  const { data: replyLikeData } = await supabase
                    .from('likes')
                    .select('id')
                    .match({ 
                      user_id: user.data.user.id,
                      comment_id: reply.id 
                    })
                    .maybeSingle();
                    
                  replyLiked = !!replyLikeData;
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
                  liked: replyLiked,
                  guestNickname: reply.guest_nickname
                };
              })
            );

            return {
              id: comment.id,
              postId,
              userId: comment.user_id,
              user: userInfo,
              content: comment.content,
              createdAt: new Date(comment.created_at),
              updatedAt: comment.updated_at ? new Date(comment.updated_at) : undefined,
              likesCount: comment.likes_count,
              liked: liked,
              replies: repliesWithUserInfo,
              guestNickname: comment.guest_nickname
            };
          })
        );

        setComments(commentsWithUserInfo);
      } catch (error) {
        console.error("コメント取得エラー:", error);
        toast.error("コメントの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (newComment: string, nickname?: string) => {
    setSubmitting(true);
    
    try {
      const user = await supabase.auth.getUser();
      let userId = null;
      
      // ログインしている場合はユーザーIDを設定
      if (user.data.user) {
        userId = user.data.user.id;
      }
      
      // コメントをデータベースに追加
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: newComment,
          guest_nickname: nickname || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      let userInfo = {
        id: userId || 'guest',
        name: nickname || "ゲスト",
        avatar: undefined
      };

      // ログインしている場合はプロフィール情報を取得
      if (userId) {
        // ユーザー情報を取得
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', userId)
          .single();

        if (!userError && userData) {
          userInfo = {
            id: userData.id,
            name: userData.username || "匿名ユーザー",
            avatar: userData.avatar_url
          };
        }
      }

      // 新しいコメントを追加
      const newCommentObj: Comment = {
        id: data.id,
        postId,
        userId: userId,
        user: userInfo,
        content: newComment,
        createdAt: new Date(data.created_at),
        likesCount: 0,
        liked: false,
        replies: [],
        guestNickname: nickname
      };
      
      setComments([newCommentObj, ...comments]);
      toast.success("コメントが投稿されました");
    } catch (error) {
      console.error("コメント投稿エラー:", error);
      toast.error("コメントの投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      toast.error("返信を入力してください");
      return;
    }

    setSubmitting(true);
    
    try {
      const user = await supabase.auth.getUser();
      let userId = null;
      let nickname = null;
      
      // ログインしている場合はユーザーIDを設定
      if (user.data.user) {
        userId = user.data.user.id;
      } else {
        // ログインしていない場合は「返信」としてニックネームを設定
        nickname = "返信";
      }
      
      // 返信をデータベースに追加
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: replyContent,
          parent_id: parentId,
          guest_nickname: nickname
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      let userInfo = {
        id: userId || 'guest',
        name: nickname || "ゲスト",
        avatar: undefined
      };

      // ログインしている場合はプロフィール情報を取得
      if (userId) {
        // ユーザー情報を取得
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', userId)
          .single();

        if (!userError && userData) {
          userInfo = {
            id: userData.id,
            name: userData.username || "匿名ユーザー",
            avatar: userData.avatar_url
          };
        }
      }

      // 新しい返信を作成
      const newReply: Comment = {
        id: data.id,
        postId,
        userId: userId,
        parentId,
        user: userInfo,
        content: replyContent,
        createdAt: new Date(data.created_at),
        likesCount: 0,
        liked: false,
        guestNickname: nickname
      };
      
      // コメントリストを更新
      const updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          const updatedReplies = comment.replies ? [...comment.replies, newReply] : [newReply];
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });
      
      setComments(updatedComments);
      setReplyTo(null);
      setReplyContent("");
      toast.success("返信が投稿されました");
    } catch (error) {
      console.error("返信投稿エラー:", error);
      toast.error("返信の投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast.error("いいねするにはログインが必要です");
      return;
    }

    const userId = user.data.user.id;

    // コメントといいねの状態を取得
    let commentToUpdate: Comment | undefined = undefined;
    let parentComment: Comment | undefined = undefined;

    // 親コメントを検索
    for (const comment of comments) {
      if (comment.id === commentId) {
        commentToUpdate = comment;
        break;
      }
      // 返信を検索
      if (comment.replies) {
        for (const reply of comment.replies) {
          if (reply.id === commentId) {
            commentToUpdate = reply;
            parentComment = comment;
            break;
          }
        }
        if (commentToUpdate) break;
      }
    }

    if (!commentToUpdate) {
      console.error("コメントが見つかりません:", commentId);
      return;
    }

    try {
      const isLiked = commentToUpdate.liked;

      if (isLiked) {
        // いいねを削除
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ 
            user_id: userId,
            comment_id: commentId 
          });

        if (error) throw error;
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: userId,
            comment_id: commentId
          });

        if (error) throw error;
      }

      // コメントリストを更新
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          const newLiked = !comment.liked;
          return {
            ...comment,
            liked: newLiked,
            likesCount: newLiked ? comment.likesCount + 1 : comment.likesCount - 1
          };
        }
        
        // 返信を確認
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              const newLiked = !reply.liked;
              return {
                ...reply,
                liked: newLiked,
                likesCount: newLiked ? reply.likesCount + 1 : reply.likesCount - 1
              };
            }
            return reply;
          });
          
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
    } catch (error) {
      console.error("いいね処理エラー:", error);
      toast.error("いいねの処理に失敗しました");
    }
  };

  const deleteComment = async (commentId: string, isReply = false, parentId?: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast.error("コメントを削除するにはログインが必要です");
      return;
    }

    try {
      // コメントを削除
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.data.user.id);  // 自分のコメントのみ削除可能

      if (error) throw error;

      if (isReply && parentId) {
        // 返信を削除
        const updatedComments = comments.map(comment => {
          if (comment.id === parentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply.id !== commentId)
            };
          }
          return comment;
        });
        setComments(updatedComments);
      } else {
        // 親コメントを削除
        setComments(comments.filter(comment => comment.id !== commentId));
      }
      
      toast.success("コメントが削除されました");
    } catch (error) {
      console.error("コメント削除エラー:", error);
      toast.error("コメントの削除に失敗しました");
    }
  };

  const startEditing = (commentId: string, isReply = false, parentId?: string) => {
    let currentContent = "";
    
    // 編集するコメントの内容を探す
    if (isReply && parentId) {
      const parentComment = comments.find(c => c.id === parentId);
      const reply = parentComment?.replies?.find(r => r.id === commentId);
      if (reply) currentContent = reply.content;
    } else {
      const comment = comments.find(c => c.id === commentId);
      if (comment) currentContent = comment.content;
    }
    
    // 編集内容を設定
    setEditContent({ ...editContent, [commentId]: currentContent });
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isEditing: true };
      }
      
      if (comment.replies) {
        const updatedReplies = comment.replies.map(reply => {
          if (reply.id === commentId) {
            return { ...reply, isEditing: true };
          }
          return reply;
        });
        
        return { ...comment, replies: updatedReplies };
      }
      
      return comment;
    });
    
    setComments(updatedComments);
  };

  const cancelEditing = (commentId: string) => {
    // 編集内容をリセット
    const newEditContent = { ...editContent };
    delete newEditContent[commentId];
    setEditContent(newEditContent);
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isEditing: false };
      }
      
      if (comment.replies) {
        const updatedReplies = comment.replies.map(reply => {
          if (reply.id === commentId) {
            return { ...reply, isEditing: false };
          }
          return reply;
        });
        
        return { ...comment, replies: updatedReplies };
      }
      
      return comment;
    });
    
    setComments(updatedComments);
  };

  const saveEdit = async (commentId: string, isReply = false, parentId?: string) => {
    const newContent = editContent[commentId];
    
    if (!newContent || !newContent.trim()) {
      toast.error("コメントを入力してください");
      return;
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast.error("コメントを編集するにはログインが必要です");
      return;
    }
    
    try {
      // コメントを更新
      const { error } = await supabase
        .from('comments')
        .update({
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.data.user.id);  // 自分のコメントのみ編集可能

      if (error) throw error;
      
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return { 
            ...comment, 
            content: newContent, 
            isEditing: false,
            updatedAt: new Date()
          };
        }
        
        if (comment.replies && (isReply || parentId === comment.id)) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return { 
                ...reply, 
                content: newContent, 
                isEditing: false,
                updatedAt: new Date()
              };
            }
            return reply;
          });
          
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
      
      // 編集内容をリセット
      const newEditContent = { ...editContent };
      delete newEditContent[commentId];
      setEditContent(newEditContent);
      
      toast.success("コメントが更新されました");
    } catch (error) {
      console.error("コメント更新エラー:", error);
      toast.error("コメントの更新に失敗しました");
    }
  };

  const handleSetEditContent = (id: string, content: string) => {
    setEditContent({ ...editContent, [id]: content });
  };

  return {
    comments,
    replyTo,
    replyContent,
    submitting,
    loading,
    editContent,
    setReplyTo,
    setReplyContent,
    handleSubmitComment,
    handleSubmitReply,
    toggleLike,
    deleteComment,
    startEditing,
    cancelEditing,
    saveEdit,
    handleSetEditContent
  };
}
