import React, { useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

// 多くの一般的なプログラミング言語のサポートを追加
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { PrismLight } from 'react-syntax-highlighter';

// 言語登録
PrismLight.registerLanguage('javascript', javascript);
PrismLight.registerLanguage('js', javascript);
PrismLight.registerLanguage('typescript', typescript);
PrismLight.registerLanguage('ts', typescript);
PrismLight.registerLanguage('jsx', jsx);
PrismLight.registerLanguage('tsx', tsx);
PrismLight.registerLanguage('json', json);
PrismLight.registerLanguage('css', css);
PrismLight.registerLanguage('html', html);
PrismLight.registerLanguage('bash', bash);
PrismLight.registerLanguage('shell', bash);
PrismLight.registerLanguage('python', python);
PrismLight.registerLanguage('py', python);

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';
  
  // 言語が指定されていない場合はデフォルトでtextとして扱う
  const lang = language || 'text';
  
  // 言語名のエイリアス処理
  const normalizedLang = lang === 'js' ? 'javascript' 
    : lang === 'ts' ? 'typescript'
    : lang === 'sh' ? 'bash'
    : lang === 'py' ? 'python'
    : lang;
  
  console.log('CodeBlock rendering:', { language, normalizedLang, valueLength: value.length });
  
  return (
    <div className="code-block-wrapper">
      <SyntaxHighlighter
        language={normalizedLang}
        style={isDarkTheme ? vscDarkPlus : vs}
        customStyle={{
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          margin: '1rem 0',
          padding: '1rem',
          border: isDarkTheme ? '1px solid #333' : '1px solid #e2e8f0',
          boxShadow: isDarkTheme ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineNumberStyle={{ 
          minWidth: '2.5em', 
          paddingRight: '1em', 
          color: isDarkTheme ? '#666' : '#aaa',
          borderRight: isDarkTheme ? '1px solid #333' : '1px solid #eee',
          marginRight: '1em',
          textAlign: 'right'
        }}
        PreTag="div"
        codeTagProps={{
          style: {
            fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
