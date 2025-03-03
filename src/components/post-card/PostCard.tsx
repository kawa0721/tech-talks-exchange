
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Post } from "@/types";
import PostCardHeader from "./PostCardHeader";
import PostCardContent from "./PostCardContent";
import PostCardFooter from "./PostCardFooter";
import ContentToggler from "./ContentToggler";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId, hasGuestId } from "@/utils/guestUtils";

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
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showFullContent, setShowFullContent] = useState(false);

  // 投稿の詳細情報を取得する
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        // いいね状態の確認
        const { data: { user } } = await supabase.auth.getUser();
        
        // いいね状態を確認
        let isLiked = false;
        
        if (user) {
          // ログインユーザーの場合
          const { data: likeData } = await supabase
            .from('likes')
            .select('id')
            .match({ user_id: user.id, post_id: post.id })
            .maybeSingle();
            
          isLiked = !!likeData;
        } else if (hasGuestId()) {
          // 未ログインユーザーの場合
          const guestId = getOrCreateGuestId();
          const { data: likeData } = await supabase
            .from('likes')
            .select('id')
            .match({ guest_id: guestId, post_id: post.id })
            .maybeSingle();
            
          isLiked = !!likeData;
        }
        
        setLiked(isLiked);

        // コメント数を取得
        const { count, error: countError } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        if (!countError && count !== null) {
          setCommentsCount(count);
        }

        // いいね数を取得
        const { count: likesCountResult, error: likesCountError } = await supabase
          .from('likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        if (!likesCountError && likesCountResult !== null) {
          setLikesCount(likesCountResult);
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
      }
    };
    
    fetchPostDetails();
  }, [post.id]);

  // 投稿内容を一定の長さに制限する
  const contentPreviewLength = 150; // プレビューの文字制限
  const contentPreview = post.content.length > contentPreviewLength 
    ? post.content.substring(0, contentPreviewLength) + '...' 
    : post.content;
  
  const hasLongContent = post.content.length > contentPreviewLength;

  const toggleLike = async () => {
    // UI上の状態を即座に更新（オプティミスティックUI）
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
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
        commentsCount={commentsCount}
        likesCount={likesCount}
        liked={liked}
        onToggleLike={toggleLike}
      />
    </Card>
  );
};

export default PostCard;
