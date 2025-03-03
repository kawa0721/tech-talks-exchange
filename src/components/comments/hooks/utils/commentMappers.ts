import { Comment } from "@/types";

/**
 * Finds a comment or reply by ID and updates it with the provided update function
 */
export function findAndUpdateComment(
  comments: Comment[],
  commentId: string,
  updateFn: (comment: Comment) => Comment
): Comment[] {
  return comments.map(comment => {
    // If this is the target comment, update it
    if (comment.id === commentId) {
      return updateFn(comment);
    }
    
    // Check if the target is in the replies
    if (comment.replies && comment.replies.length > 0) {
      const updatedReplies = comment.replies.map(reply => {
        if (reply.id === commentId) {
          return updateFn(reply);
        }
        return reply;
      });
      
      return { ...comment, replies: updatedReplies };
    }
    
    // Return the comment unchanged
    return comment;
  });
}

/**
 * Recursively finds a comment by ID in the comments tree
 */
export function findCommentInTree(
  comments: Comment[],
  commentId: string
): Comment | undefined {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    
    if (comment.replies) {
      const foundInReplies = comment.replies.find(reply => reply.id === commentId);
      if (foundInReplies) return foundInReplies;
    }
  }
  
  return undefined;
}
