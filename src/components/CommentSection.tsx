
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, Reply, MoreHorizontal, Edit2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Comment } from "@/types";
import { getCommentsForPost } from "@/lib/dummyData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(getCommentsForPost(postId));
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editContent, setEditContent] = useState<Record<string, string>>({});

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error("コメントを入力してください");
      return;
    }

    setSubmitting(true);
    
    // Simulate API call to post comment
    setTimeout(() => {
      const newCommentObj: Comment = {
        id: Math.random().toString(36).substring(2, 15),
        postId,
        userId: "1",
        user: {
          id: "1",
          name: "TechGuru42",
          avatar: "https://i.pravatar.cc/150?img=1"
        },
        content: newComment,
        createdAt: new Date(),
        likesCount: 0,
        liked: false
      };
      
      setComments([newCommentObj, ...comments]);
      setNewComment("");
      setSubmitting(false);
      toast.success("コメントが投稿されました");
    }, 500);
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) {
      toast.error("返信を入力してください");
      return;
    }

    setSubmitting(true);
    
    // Simulate API call to post reply
    setTimeout(() => {
      const newReply: Comment = {
        id: Math.random().toString(36).substring(2, 15),
        postId,
        userId: "1",
        parentId,
        user: {
          id: "1",
          name: "TechGuru42",
          avatar: "https://i.pravatar.cc/150?img=1"
        },
        content: replyContent,
        createdAt: new Date(),
        likesCount: 0,
        liked: false
      };
      
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
      setSubmitting(false);
      toast.success("返信が投稿されました");
    }, 500);
  };

  const toggleLike = (commentId: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const newLiked = !comment.liked;
        return {
          ...comment,
          liked: newLiked,
          likesCount: newLiked ? comment.likesCount + 1 : comment.likesCount - 1
        };
      }
      
      // Check if comment is in replies
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
  };

  const deleteComment = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      // Delete a reply
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
      // Delete a top-level comment
      setComments(comments.filter(comment => comment.id !== commentId));
    }
    
    toast.success("コメントが削除されました");
  };

  const startEditing = (commentId: string, isReply = false, parentId?: string) => {
    let currentContent = "";
    
    // Find the content of the comment to be edited
    if (isReply && parentId) {
      const parentComment = comments.find(c => c.id === parentId);
      const reply = parentComment?.replies?.find(r => r.id === commentId);
      if (reply) currentContent = reply.content;
    } else {
      const comment = comments.find(c => c.id === commentId);
      if (comment) currentContent = comment.content;
    }
    
    // Set the edit content and mark the comment as being edited
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
    // Remove the editing content and mark the comment as not being edited
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

  const saveEdit = (commentId: string, isReply = false, parentId?: string) => {
    const newContent = editContent[commentId];
    
    if (!newContent || !newContent.trim()) {
      toast.error("コメントを入力してください");
      return;
    }
    
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
    
    // Remove the editing content
    const newEditContent = { ...editContent };
    delete newEditContent[commentId];
    setEditContent(newEditContent);
    
    toast.success("コメントが更新されました");
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-xl mb-4">コメント</h3>
      
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="@user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="コメントを追加..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2 min-h-[80px]"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "投稿中..." : "コメントを投稿"}
            </Button>
          </div>
        </div>
      </form>
      
      <Separator className="my-4" />
      
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">まだコメントがありません。最初のコメントを投稿しましょう！</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link to={`/user/${comment.user.id}`} className="font-medium hover:underline">
                        {comment.user.name}
                      </Link>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        {comment.updatedAt && comment.updatedAt > comment.createdAt && 
                          " (編集済み)"}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => deleteComment(comment.id)}>
                          削除
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startEditing(comment.id)}>
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          報告
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {comment.isEditing ? (
                    <div className="mt-1">
                      <Textarea
                        value={editContent[comment.id] || ""}
                        onChange={(e) => setEditContent({ ...editContent, [comment.id]: e.target.value })}
                        className="min-h-[80px] mb-2"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => saveEdit(comment.id)}
                          className="flex items-center gap-1"
                        >
                          <Check className="h-4 w-4" />
                          保存
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => cancelEditing(comment.id)}
                          className="flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm">{comment.content}</p>
                  )}
                  
                  {!comment.isEditing && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`px-2 py-1 h-auto text-xs ${comment.liked ? "text-blue-500" : ""}`}
                        onClick={() => toggleLike(comment.id)}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {comment.likesCount > 0 && comment.likesCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 h-auto text-xs"
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        返信
                      </Button>
                    </div>
                  )}
                  
                  {replyTo === comment.id && (
                    <div className="mt-3">
                      <Textarea
                        placeholder={`${comment.user.name}さんに返信...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[60px] text-sm mb-2"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={submitting}
                        >
                          {submitting ? "投稿中..." : "返信"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setReplyTo(null)}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Render replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-muted space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                            <AvatarFallback>{reply.user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <Link to={`/user/${reply.user.id}`} className="font-medium text-sm hover:underline">
                                  {reply.user.name}
                                </Link>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                                  {reply.updatedAt && reply.updatedAt > reply.createdAt && 
                                    " (編集済み)"}
                                </span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => deleteComment(reply.id, true, comment.id)}>
                                    削除
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => startEditing(reply.id, true, comment.id)}>
                                    編集
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    報告
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {reply.isEditing ? (
                              <div className="mt-1">
                                <Textarea
                                  value={editContent[reply.id] || ""}
                                  onChange={(e) => setEditContent({ ...editContent, [reply.id]: e.target.value })}
                                  className="min-h-[60px] mb-2 text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => saveEdit(reply.id, true, comment.id)}
                                    className="h-7 px-2 text-xs flex items-center gap-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    保存
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => cancelEditing(reply.id)}
                                    className="h-7 px-2 text-xs flex items-center gap-1"
                                  >
                                    <X className="h-3 w-3" />
                                    キャンセル
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-1 text-xs">{reply.content}</p>
                            )}
                            
                            {!reply.isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`px-2 py-0 h-auto text-xs mt-1 ${reply.liked ? "text-blue-500" : ""}`}
                                onClick={() => toggleLike(reply.id)}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {reply.likesCount > 0 && reply.likesCount}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
