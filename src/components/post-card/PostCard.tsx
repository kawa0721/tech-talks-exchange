
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Post } from "@/types";
import PostCardHeader from "./PostCardHeader";
import PostCardContent from "./PostCardContent";
import PostCardFooter from "./PostCardFooter";
import ContentToggler from "./ContentToggler";
import { supabase } from "@/integrations/supabase/client";

interface PostCardProps {
  post: Post;
  channelName?: string;
  showChannel?: boolean;
  isTrending?: boolean;
  isPopular?: boolean;
}

const PostCard = ({ 
  post, 
  channelName, 
  showChannel = false, 
  isTrending = false,
  isPopular = false
}: PostCardProps) => {
  const [liked, setLiked] = useState(post.liked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showFullContent, setShowFullContent] = useState(false);

  // Check if user has liked this post
  useEffect(() => {
    const checkLikeStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .match({ user_id: user.id, post_id: post.id })
          .maybeSingle();
          
        setLiked(!!likeData);
      }
    };
    
    checkLikeStatus();
  }, [post.id]);

  // 投稿内容を一定の長さに制限する
  const contentPreviewLength = 150; // プレビューの文字制限
  const contentPreview = post.content.length > contentPreviewLength 
    ? post.content.substring(0, contentPreviewLength) + '...' 
    : post.content;
  
  const hasLongContent = post.content.length > contentPreviewLength;

  const toggleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };

  const handleContentToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // リンククリックを防止
    setShowFullContent(!showFullContent);
  };

  return (
    <Card className={`mb-4 overflow-hidden hover:shadow-md transition-shadow ${isTrending ? 'border-blue-400 dark:border-blue-600 shadow-md' : ''} ${isPopular ? 'border-amber-400 dark:border-amber-600 shadow-md' : ''}`}>
      <PostCardHeader 
        post={post} 
        channelName={channelName} 
        showChannel={showChannel}
        isTrending={isTrending}
        isPopular={isPopular}
      />
      
      <Link to={`/post/${post.id}`}>
        <PostCardContent 
          post={post} 
          showFullContent={showFullContent} 
          contentPreview={contentPreview} 
        />
      </Link>
      
      {/* 「全文表示」ボタン - 長い投稿のみ表示 */}
      {hasLongContent && (
        <ContentToggler 
          showFullContent={showFullContent}
          onToggle={handleContentToggle}
        />
      )}
      
      <PostCardFooter 
        postId={post.id}
        commentsCount={post.commentsCount}
        likesCount={likesCount}
        liked={liked}
        onToggleLike={toggleLike}
      />
    </Card>
  );
};

export default PostCard;
