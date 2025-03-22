import React, { useCallback, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@/types";
import CommentActions from "./CommentActions";
import EditCommentForm from "./EditCommentForm";
import { ThumbsUp, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReplyForm from "./ReplyForm";

interface ReplyItemProps {
  reply: Comment;
  parentId: string;
  editContent: Record<string, string>;
  onSetEditContent: (id: string, content: string) => void;
  onToggleLike: (id: string) => void;
  onDeleteComment: (id: string, isReply: boolean, parentId: string) => void;
  onStartEditing: (id: string, isReply: boolean, parentId: string) => void;
  onCancelEditing: (id: string) => void;
  onSaveEdit: (id: string, isReply: boolean, parentId: string) => void;
  isEditing?: boolean;
  submitting: boolean;
  onReplyClick?: (replyId: string) => void;
  replyTo?: string | null;
  onSubmitReply?: (parentId: string, content: string, nickname?: string) => void;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  parentId,
  editContent,
  onSetEditContent,
  onToggleLike,
  onDeleteComment,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  isEditing = false,
  submitting,
  onReplyClick,
  replyTo,
  onSubmitReply
}) => {
  // 返信の折りたたみ状態を管理
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 折りたたみを切り替える
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // いいねボタンのハンドラーをメモ化
  const handleToggleLike = useCallback(() => {
    onToggleLike(reply.id);
  }, [reply.id, onToggleLike]);

  // 返信ボタンのハンドラーをメモ化（ネスト深度に関わらず有効化）
  const handleReplyClick = useCallback(() => {
    if (onReplyClick) {
      console.log(`返信ボタンがクリックされました: ID=${reply.id}`);
      onReplyClick(reply.id);
    }
  }, [reply.id, onReplyClick]);
  
  // 返信送信ハンドラー
  const handleSubmitReply = useCallback((content: string, nickname?: string) => {
    if (onSubmitReply) {
      onSubmitReply(reply.id, content, nickname);
    }
  }, [reply.id, onSubmitReply]);
  
  // 返信キャンセルハンドラー
  const handleCancelReply = useCallback(() => {
    if (onReplyClick) {
      onReplyClick(null);
    }
  }, [onReplyClick]);

  return (
    <div className="flex gap-3">
      <Avatar className="h-6 w-6">
        <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
        <AvatarFallback>{reply.user.name.substring(0, 1)}</AvatarFallback>
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
          
          <CommentActions
            comment={reply}
            onStartEditing={(id) => onStartEditing(id, true, parentId)}
            onDeleteComment={(id) => onDeleteComment(id, true, parentId)}
          />
        </div>
        
        {reply.isEditing ? (
          <EditCommentForm
            id={reply.id}
            content={editContent[reply.id] || ""}
            onSetContent={(content) => onSetEditContent(reply.id, content)}
            onCancel={() => onCancelEditing(reply.id)}
            onSave={() => onSaveEdit(reply.id, true, parentId)}
            isSubmitting={submitting}
            isReply={true}
          />
        ) : (
          <>
            <p className="mt-1 text-xs text-left">{reply.content}</p>
            
            {/* いいねと返信ボタンを配置 */}
            <div className="flex items-center mt-2 px-2">
              {/* 返信ボタンを左側に配置 */}
              {onReplyClick && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center space-x-1 px-2 h-6 mr-2"
                  onClick={handleReplyClick}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span className="text-xs">返信</span>
                </Button>
              )}
              
              {/* いいねボタンを返信ボタンの隣に配置 */}
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center space-x-1 px-2 h-6 ${reply.liked ? 'text-blue-500' : ''}`}
                onClick={handleToggleLike}
              >
                <ThumbsUp className="w-3 h-3" />
                <span className="text-xs">{reply.likesCount > 0 ? reply.likesCount : ""}</span>
              </Button>
            </div>
            
            {/* 現在の返信への返信フォームを表示 */}
            {replyTo === reply.id && onSubmitReply && (
              <div className="mt-3 pl-2 border-l-2 border-primary">
                <ReplyForm
                  parentId={reply.id}
                  userName={reply.user.name}
                  onSubmit={handleSubmitReply}
                  onCancel={handleCancelReply}
                  isSubmitting={submitting}
                />
              </div>
            )}

            {/* 返信の返信があれば表示（深いネスト層にも対応） */}
            {reply.replies && reply.replies.length > 0 && (
              <>
                {/* 返信表示/非表示トグルボタン */}
                <div className="flex items-center mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-1 px-2 h-6 text-xs"
                    onClick={toggleExpanded}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    )}
                    {isExpanded ? "返信を折りたたむ" : `返信を表示 (${reply.replies.length})`}
                  </Button>
                </div>
                
                {/* 返信内容（展開時のみ表示） */}
                {isExpanded && (
                  <div className="pl-4 border-l-2 border-muted space-y-4 mt-2">
                    {reply.replies.map((nestedReply) => (
                      <ReplyItem
                        key={nestedReply.id}
                        reply={nestedReply}
                        parentId={reply.id}
                        editContent={editContent}
                        onSetEditContent={onSetEditContent}
                        onToggleLike={onToggleLike}
                        onDeleteComment={onDeleteComment}
                        onStartEditing={onStartEditing}
                        onCancelEditing={onCancelEditing}
                        onSaveEdit={onSaveEdit}
                        isEditing={nestedReply.isEditing || false}
                        submitting={submitting}
                        onReplyClick={onReplyClick}
                        replyTo={replyTo}
                        onSubmitReply={onSubmitReply}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ReplyItem);
