import { CardContent } from "@/components/ui/card";
import { Post } from "@/types";
import ReactMarkdown from "react-markdown";
import CodeBlock from "@/components/markdown/CodeBlock";
import { Components } from 'react-markdown';
import { useEffect } from "react";
import React from "react";
import remarkGfm from 'remark-gfm';

interface PostCardContentProps {
  post: Post;
  showFullContent: boolean;
  contentPreview: string;
}

interface CodeProps {
  className?: string;
  children: React.ReactNode;
  inline?: boolean;
  [key: string]: any;
}

const PostCardContent = ({ post, showFullContent, contentPreview }: PostCardContentProps) => {
  useEffect(() => {
    console.log('PostCardContent rendered with content:', 
      showFullContent ? post.content.substring(0, 100) + '...' : contentPreview.substring(0, 100) + '...');
  }, [post, showFullContent, contentPreview]);

  // Define custom components for ReactMarkdown
  const components: Components = {
    // インラインコード
    code({ inline, className, children, ...props }: CodeProps) {
      if (inline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      
      // コードブロック処理
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'javascript';
      
      // コードブロック内容を文字列として取得
      let value = String(children);
      
      console.log('Markdown code block in ReactMarkdown:', { 
        language, 
        contentStart: value.substring(0, 20),
        contentEnd: value.substring(value.length - 20)
      });
      
      // 改行コードの正規化
      value = value.replace(/\n$/, '');
      
      return (
        <CodeBlock
          language={language}
          value={value}
        />
      );
    },
    // コードブロックのラッパーとなるpreタグ
    pre({ children, ...props }) {
      // preタグの中にcodeタグがある場合は、そのままchildren（コード要素）を返す
      // これにより、reactMarkdown内部で不要なバッククオートを含めずに済む
      if (React.isValidElement(children) && 
          /code/i.test(String(children.type))) {
        return children;
      }
      return <pre {...props}>{children}</pre>;
    }
  };

  return (
    <CardContent className="pb-2">
      <h3 className="text-xl font-semibold mb-3 text-left">{post.title}</h3>
      <div className="prose prose-sm dark:prose-invert max-w-none text-left mb-4 overflow-hidden">
        {/* カスタムスタイルを適用してマークダウンレンダリングを改善 */}
        <div className="markdown-content">
          <ReactMarkdown 
            components={components}
            remarkPlugins={[remarkGfm]}
          >
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
