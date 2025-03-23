import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';
  
  // 言語が指定されていない場合はデフォルトでtextとして扱う
  const lang = language || 'text';
  
  return (
    <SyntaxHighlighter
      language={lang}
      style={isDarkTheme ? vscDarkPlus : vs}
      customStyle={{
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        margin: '1rem 0',
      }}
    >
      {value}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
