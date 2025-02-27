
import { User, Channel, Post, Comment } from "@/types";

// Sample users
export const users: User[] = [
  {
    id: "1",
    name: "TechGuru42",
    avatar: "https://i.pravatar.cc/150?img=1",
    profile: "Full-stack developer with a passion for AI and ML."
  },
  {
    id: "2",
    name: "CodeNinja",
    avatar: "https://i.pravatar.cc/150?img=2",
    profile: "Backend developer specializing in distributed systems."
  },
  {
    id: "3",
    name: "DevOpsWizard",
    avatar: "https://i.pravatar.cc/150?img=3",
    profile: "DevOps engineer with expertise in cloud infrastructure."
  },
];

// Sample channels
export const channels: Channel[] = [
  {
    id: "1",
    name: "Cursor",
    description: "Everything about the Cursor code editor and its AI features",
    icon: "💻"
  },
  {
    id: "2",
    name: "Windsurf",
    description: "Discussions about Windsurf programming framework",
    icon: "🏄"
  },
  {
    id: "3",
    name: "Cline",
    description: "Tips and tricks for Cline terminal tools",
    icon: "🖥️"
  },
  {
    id: "4",
    name: "React",
    description: "React.js discussions and resources",
    icon: "⚛️"
  },
  {
    id: "5",
    name: "TypeScript",
    description: "TypeScript help, discussions, and best practices",
    icon: "📘"
  },
];

// Sample posts
export const posts: Post[] = [
  {
    id: "1",
    title: "Best Cursor AI shortcuts you should know",
    content: "Here are some amazing shortcuts that boost my productivity when using Cursor AI...",
    userId: "1",
    user: users[0],
    channelId: "1",
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    commentsCount: 5,
    likesCount: 24,
    liked: true
  },
  {
    id: "2",
    title: "How I migrated a large codebase to TypeScript",
    content: "Recently completed a migration of our 200k+ LOC JavaScript app to TypeScript. Here's how we approached it...",
    userId: "2",
    user: users[1],
    channelId: "5",
    createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
    commentsCount: 8,
    likesCount: 42,
    liked: false
  },
  {
    id: "3",
    title: "Windsurf vs. other frameworks - performance comparison",
    content: "I ran some benchmarks comparing Windsurf to other popular frameworks and the results were surprising...",
    userId: "3",
    user: users[2],
    channelId: "2",
    createdAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    commentsCount: 12,
    likesCount: 37,
    liked: false
  },
  {
    id: "4",
    title: "Cline workflow that saves me hours every week",
    content: "After years of tweaking my terminal setup, I've created a Cline workflow that dramatically improves my productivity...",
    userId: "1",
    user: users[0],
    channelId: "3",
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    commentsCount: 3,
    likesCount: 15,
    liked: true
  },
];

// Sample comments
export const comments: Comment[] = [
  {
    id: "1",
    postId: "1",
    userId: "2",
    user: users[1],
    content: "Thanks for sharing these shortcuts! The AI code generation one is a game changer.",
    createdAt: new Date(Date.now() - 86400000 * 1 - 3600000), // 1 day and 1 hour ago
    likesCount: 7,
    liked: true,
  },
  {
    id: "2",
    postId: "1",
    userId: "3",
    user: users[2],
    content: "I've been using Cursor for about 6 months now, and these shortcuts would have saved me so much time!",
    createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
    likesCount: 4,
    liked: false,
  },
  {
    id: "3",
    postId: "1",
    userId: "1",
    user: users[0],
    content: "Glad you found it helpful! I'll be posting more tips next week.",
    createdAt: new Date(Date.now() - 3600000 * 12), // 12 hours ago
    likesCount: 2,
    liked: false,
    parentId: "1",
  },
  {
    id: "4",
    postId: "2",
    userId: "3",
    user: users[2],
    content: "Did you use any specific tools to help with the migration? I'm about to start a similar project.",
    createdAt: new Date(Date.now() - 3600000 * 20), // 20 hours ago
    likesCount: 1,
    liked: false,
  },
  {
    id: "5",
    postId: "2",
    userId: "2",
    user: users[1],
    content: "We used the TypeScript compiler's --checkJs option first to identify issues, then gradually converted files starting with the foundational modules.",
    createdAt: new Date(Date.now() - 3600000 * 18), // 18 hours ago
    likesCount: 3,
    liked: true,
    parentId: "4",
  },
];

// Helper function to get comments for a post with threaded structure
export function getCommentsForPost(postId: string): Comment[] {
  // Filter top-level comments for this post
  const topLevelComments = comments
    .filter(comment => comment.postId === postId && !comment.parentId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  // Add replies to their parent comments
  return topLevelComments.map(comment => {
    const replies = comments
      .filter(reply => reply.parentId === comment.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    return {
      ...comment,
      replies: replies.length > 0 ? replies : undefined
    };
  });
}

// Helper function to get posts for a specific channel
export function getPostsForChannel(channelId: string | null): Post[] {
  if (!channelId) {
    return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return posts
    .filter(post => post.channelId === channelId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
