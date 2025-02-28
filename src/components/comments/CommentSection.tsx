
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Comment } from "@/types";
import { COMMENTS } from "@/lib/dummyData";
import { toast } from "sonner";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(
    COMMENTS.filter(comment => comment.postId === postId)
  );
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editContent, setEditContent] = useState<Record<string, string>>({});

  const handleSubmitComment = (newComment: string) => {
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

  const handleSetEditContent = (id: string, content: string) => {
    setEditContent({ ...editContent, [id]: content });
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-xl mb-4">コメント</h3>
      
      <CommentForm 
        postId={postId}
        onSubmit={handleSubmitComment}
        isSubmitting={submitting}
      />
      
      <Separator className="my-4" />
      
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">まだコメントがありません。最初のコメントを投稿しましょう！</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replyTo={replyTo}
              editContent={editContent}
              submitting={submitting}
              onSetReplyTo={setReplyTo}
              onSetReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              onSetEditContent={handleSetEditContent}
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
