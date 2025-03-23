import { CardContent } from "@/components/ui/card";
import { Post } from "@/types";
import ReactMarkdown from "react-markdown";
import CodeBlock from "@/components/markdown/CodeBlock";
import { Components } from 'react-markdown';

interface PostCardContentProps {
  post: Post;
  showFullContent: boolean;
  contentPreview: string;
}

const PostCardContent = ({ post, showFullContent, contentPreview }: PostCardContentProps) => {
  // Define custom components for ReactMarkdown
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      
      if (!match) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      
      return (
        <CodeBlock
          language={match[1]}
          value={String(children).replace(/\n$/, '')}
        />
      );
    }
  };

  return (
    <CardContent className="pb-2">
      <h3 className="text-xl font-semibold mb-3 text-left">{post.title}</h3>
      <div className="prose prose-sm dark:prose-invert max-w-none text-left mb-4 overflow-hidden">
        {/* カスタムスタイルを適用してマークダウンレンダリングを改善 */}
        <div className="markdown-content">
          <ReactMarkdown components={components}>
            {showFullContent ? post.content : contentPreview}
          </ReactMarkdown>
        </div>
      </div>

      {post.images && post.images.length > 0 && (
        <div className="rounded-md overflow-hidden my-2">
          <img 
            src={post.images[0]} 
            alt="投稿添付ファイル" 
            className="w-full object-cover" 
            style={{ maxHeight: "300px" }}
          />
        </div>
      )}
    </CardContent>
  );
};

export default PostCardContent;
