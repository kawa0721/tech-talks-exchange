
import { Separator } from "@/components/ui/separator";
import { Comment } from "@/types";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { CommentLoading } from "./comment-loading";
import { CommentEmpty } from "./comment-empty";
import { useComments } from "./hooks"; // Updated import path

interface CommentSectionProps {
  postId: string;
  postOwnerId?: string;
}

const CommentSection = ({ postId, postOwnerId }: CommentSectionProps) => {
  const {
    comments,
    replyTo,
    replyContent,
    submitting,
    loading,
    editContent,
    setReplyTo,
    setReplyContent, // This now has the type (content: string, nickname?: string) => void
    handleSubmitComment,
    handleSubmitReply,
    toggleLike,
    deleteComment,
    startEditing,
    cancelEditing,
    saveEdit,
    handleSetEditContent
  } = useComments(postId);

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-xl mb-4">コメント</h3>
      
      <CommentForm 
        postId={postId}
        postOwnerId={postOwnerId}
        onSubmit={handleSubmitComment}
        isSubmitting={submitting}
      />
      
      <Separator className="my-4" />
      
      <div className="space-y-6">
        {loading ? (
          <CommentLoading />
        ) : comments.length === 0 ? (
          <CommentEmpty />
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
