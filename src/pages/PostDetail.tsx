
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Post } from "@/types";
import { channels, posts, getCommentsForPost } from "@/lib/dummyData";
import { formatDistanceToNow } from "date-fns";
import PostCard from "@/components/PostCard";
import CommentSection from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const foundPost = posts.find(p => p.id === postId);
      if (foundPost) {
        setPost(foundPost);
        setError(null);
      } else {
        setError("Post not found");
      }
      setLoading(false);
    }, 500);
  }, [postId]);

  // Find channel name by ID
  const getChannelName = (channelId: string): string => {
    const channel = channels.find((c) => c.id === channelId);
    return channel ? channel.name : "Unknown Channel";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="container flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">{error}</h1>
          <p className="mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="container py-8 fade-in">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="flex items-center">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to discussions
              </Link>
            </Button>
            
            <PostCard 
              post={post} 
              channelName={getChannelName(post.channelId)}
              showChannel={true} 
            />
            
            <CommentSection postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
