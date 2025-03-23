import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useTheme } from '@/components/ThemeProvider';
// シンタックスハイライト用に直接Prismjsを使用
import Prism from 'prismjs';
// 必要な言語のimport
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
// デバッグ用
const DEBUG = false;

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

// 言語登録
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);

// カスタムテーマの定義
const customTheme = {
  'code[class*="language-"]': {
    color: '#f8f8f2',
    background: 'none',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    tabSize: '4',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#f8f8f2',
    background: '#1a1a1a',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    tabSize: '4',
    hyphens: 'none',
    padding: '1em',
    margin: '0.5em 0',
    overflow: 'auto',
    borderRadius: '0.3em',
  },
  ':not(pre) > code[class*="language-"]': {
    background: '#111',
    padding: '0.1em',
    borderRadius: '0.3em',
    whiteSpace: 'normal',
  },
  // シンタックス要素のスタイル
  'comment': { color: '#6a9955' },
  'prolog': { color: '#6a9955' },
  'doctype': { color: '#6a9955' },
  'cdata': { color: '#6a9955' },
  'punctuation': { color: '#d4d4d4' },
  'namespace': { opacity: '0.7' },
  'property': { color: '#9cdcfe' },
  'tag': { color: '#569cd6' },
  'boolean': { color: '#569cd6' },
  'number': { color: '#b5cea8' },
  'constant': { color: '#9cdcfe' },
  'symbol': { color: '#b5cea8' },
  'deleted': { color: '#ce9178' },
  'selector': { color: '#d7ba7d' },
  'attr-name': { color: '#9cdcfe' },
  'string': { color: '#ce9178' },
  'char': { color: '#ce9178' },
  'builtin': { color: '#569cd6' },
  'inserted': { color: '#ce9178' },
  'operator': { color: '#d4d4d4' },
  'entity': { color: '#569cd6', cursor: 'help' },
  'url': { color: '#4ec9b0' },
  'atrule': { color: '#c586c0' },
  'attr-value': { color: '#ce9178' },
  'keyword': { color: '#569cd6' },
  'function': { color: '#dcdcaa' },
  'class-name': { color: '#4ec9b0' },
  'regex': { color: '#d16969' },
  'important': { color: '#569cd6', fontWeight: 'bold' },
  'variable': { color: '#e1e1e1' },
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' }
};

// ライトモード用のカスタムテーマ
const lightTheme = {
  'code[class*="language-"]': {
    color: '#333',
    background: 'none',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    tabSize: '4',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#333',
    background: '#f5f5f5',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    tabSize: '4',
    hyphens: 'none',
    padding: '1em',
    margin: '0.5em 0',
    overflow: 'auto',
    borderRadius: '0.3em',
  },
  ':not(pre) > code[class*="language-"]': {
    background: '#f5f5f5',
    padding: '0.1em',
    borderRadius: '0.3em',
    whiteSpace: 'normal',
  },
  // シンタックス要素のスタイル
  'comment': { color: '#008000' },
  'prolog': { color: '#008000' },
  'doctype': { color: '#008000' },
  'cdata': { color: '#008000' },
  'punctuation': { color: '#393a34' },
  'namespace': { opacity: '0.7' },
  'property': { color: '#36acaa' },
  'tag': { color: '#2973b7' },
  'boolean': { color: '#0000ff' },
  'number': { color: '#098658' },
  'constant': { color: '#36acaa' },
  'symbol': { color: '#098658' },
  'deleted': { color: '#a31515' },
  'selector': { color: '#800000' },
  'attr-name': { color: '#36acaa' },
  'string': { color: '#a31515' },
  'char': { color: '#a31515' },
  'builtin': { color: '#2973b7' },
  'inserted': { color: '#a31515' },
  'operator': { color: '#393a34' },
  'entity': { color: '#2973b7', cursor: 'help' },
  'url': { color: '#0451a5' },
  'atrule': { color: '#af00db' },
  'attr-value': { color: '#a31515' },
  'keyword': { color: '#0000ff' },
  'function': { color: '#795e26' },
  'class-name': { color: '#267f99' },
  'regex': { color: '#b5111f' },
  'important': { color: '#0000ff', fontWeight: 'bold' },
  'variable': { color: '#36acaa' },
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' }
};

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  // 言語が指定されていない場合はデフォルトでjavascriptとして扱う
  const lang = language || 'javascript';
  
  // 言語名のエイリアス処理
  const normalizedLang = lang === 'js' ? 'javascript' 
    : lang === 'ts' ? 'typescript'
    : lang === 'sh' ? 'bash'
    : lang === 'py' ? 'python'
    : lang;
  
  // ===== デバッグ用 =====
  if (DEBUG) {
    console.log('Original value:', { 
      length: value.length,
      value: value,
      codePoints: Array.from(value).map(c => c.charCodeAt(0).toString(16)).join(' ')
    });
  }

  // マークダウンコードブロックの完全な検出と削除（あらゆるケースに対応）
  let cleanValue = value;
  
  // 最初に先頭と末尾の空白を除去
  cleanValue = cleanValue.trim();
  
  // バッククオートを厳密に処理
  // 1. ```lang\n で始まるコードブロック
  cleanValue = cleanValue.replace(/^```[\s\S]*?\n/, '');
  
  // 2. ``` で終わるコードブロック
  cleanValue = cleanValue.replace(/```\s*$/g, '');
  
  // 3. 単一のバッククオート（先頭・末尾のみ）
  cleanValue = cleanValue.replace(/^`|`$/g, '');
  
  // 4. 複数のバッククオート（連続したもの）
  cleanValue = cleanValue.replace(/^`+|`+$/g, '');
  
  // 5. 特殊な非表示文字を除去
  cleanValue = cleanValue
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // ゼロ幅文字など
    .replace(/\u00A0/g, ' '); // ノーブレークスペース→通常スペース
    
  if (DEBUG) {
    console.log('Cleaned value:', { 
      length: cleanValue.length,
      value: cleanValue,
      hasDiff: value !== cleanValue,
      codePoints: Array.from(cleanValue).map(c => c.charCodeAt(0).toString(16)).join(' ')
    });
  }
  
  // カスタム表示を行うか、ライブラリを使うか決定
  // 問題がどうしても解決しない場合は true に変更してカスタム実装を使用する
  const USE_CUSTOM_SOLUTION = true;
  
  // 完全に新しいカスタム実装による行番号表示
  // 行番号の問題を解消するために、行番号を自前で実装
  const renderLineNumbers = () => {
    const lines = cleanValue.split('\n');
    return (
      <div 
        className="custom-line-numbers"
        style={{
          float: 'left',
          marginRight: '16px',
          textAlign: 'right',
          color: isDarkTheme ? '#666' : '#aaa',
          borderRight: isDarkTheme ? '1px solid #333' : '1px solid #eee',
          paddingRight: '12px',
          userSelect: 'none',
          fontFamily: 'Consolas, Monaco, monospace',
          // 重要: リガチャを無効化
          fontVariantLigatures: 'none !important',
          fontFeatureSettings: '"liga" 0, "calt" 0 !important'
        }}
      >
        {lines.map((_, i) => (
          <div key={i} style={{ 
            lineHeight: '1.5',
            fontVariantLigatures: 'none !important',
            fontFamily: 'Consolas, Monaco, monospace',
          }}>
            {i + 1}
          </div>
        ))}
      </div>
    );
  };
  
  // カスタム実装を使用する場合
  if (USE_CUSTOM_SOLUTION) {
    // 完全なカスタム実装（react-syntax-highlighterを使わずに自前実装）
    // PrismjsでシンタックスハイライトされたHTMLを生成
    let highlightedCode = '';
    try {
      // Prismjsで言語に応じたハイライト処理
      if (Prism.languages[normalizedLang]) {
        highlightedCode = Prism.highlight(
          cleanValue,
          Prism.languages[normalizedLang],
          normalizedLang
        );
      } else {
        // サポートされていない言語の場合はプレーンテキスト扱い
        highlightedCode = cleanValue
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }
    } catch (e) {
      console.error('Syntax highlighting error:', e);
      // エラー時は単純なエスケープ処理
      highlightedCode = cleanValue
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    
    // 行単位に分割してレンダリング
    const lines = highlightedCode.split('\n');
    
    return (
      <div className={`code-block-wrapper custom-solution ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
        <div style={{ 
          backgroundColor: isDarkTheme ? '#1a1a1a' : '#f5f5f5',
          borderRadius: '0.5rem',
          padding: '1rem',
          margin: '1rem 0',
          border: isDarkTheme ? '1px solid #333' : '1px solid #e2e8f0',
          boxShadow: isDarkTheme ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'auto',
          position: 'relative'
        }}>
          {renderLineNumbers()}
          <div style={{ 
            marginLeft: '3em',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            color: isDarkTheme ? '#f0f0f0' : '#333',
            fontVariantLigatures: 'none !important',
            fontFeatureSettings: '"liga" 0, "calt" 0 !important'
          }}>
            {lines.map((line, i) => (
              <div 
                key={i} 
                style={{ whiteSpace: 'pre' }}
                dangerouslySetInnerHTML={{ __html: line || ' ' }} 
              />
            ))}
          </div>
        </div>
        {/* Prismjsのテーマスタイルを適用 */}
        <style>
          {`
          /* プリズムのダークモードスタイル */
          .custom-solution .token.comment,
          .custom-solution .token.prolog,
          .custom-solution .token.doctype,
          .custom-solution .token.cdata { color: #6a9955; }
          
          .custom-solution .token.punctuation { color: #d4d4d4; }
          
          .custom-solution .token.property,
          .custom-solution .token.tag,
          .custom-solution .token.boolean,
          .custom-solution .token.number,
          .custom-solution .token.constant,
          .custom-solution .token.symbol,
          .custom-solution .token.deleted { color: #569cd6; }
          
          .custom-solution .token.selector,
          .custom-solution .token.attr-name,
          .custom-solution .token.string,
          .custom-solution .token.char,
          .custom-solution .token.builtin,
          .custom-solution .token.inserted { color: #ce9178; }
          
          .custom-solution .token.operator,
          .custom-solution .token.entity,
          .custom-solution .token.url,
          .custom-solution .language-css .token.string,
          .custom-solution .style .token.string { color: #d4d4d4; }
          
          .custom-solution .token.atrule,
          .custom-solution .token.attr-value,
          .custom-solution .token.keyword { color: #c586c0; }
          
          .custom-solution .token.function,
          .custom-solution .token.class-name { color: #dcdcaa; }
          
          .custom-solution .token.regex,
          .custom-solution .token.important,
          .custom-solution .token.variable { color: #d16969; }
          `}
        </style>
      </div>
    );
  }
  
  // モノスペースフォント指定（一貫性を持たせるため）
  const monospaceFonts = 'Consolas, Monaco, Menlo, "Courier New", monospace';
  
  // フォント合字無効化の共通設定
  const disableLigatures = {
    fontVariantLigatures: 'none !important',
    fontFeatureSettings: '"liga" 0, "calt" 0 !important',
    WebkitFontFeatureSettings: '"liga" 0, "calt" 0 !important',
    MozFontFeatureSettings: '"liga" 0, "calt" 0 !important'
  };
  
  return (
    <div className="code-block-wrapper">
      <SyntaxHighlighter
        language={normalizedLang}
        style={isDarkTheme ? customTheme : lightTheme}
        customStyle={{
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          margin: '1rem 0',
          padding: '1rem',
          border: isDarkTheme ? '1px solid #333' : '1px solid #e2e8f0',
          boxShadow: isDarkTheme ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          backgroundColor: isDarkTheme ? '#1a1a1a' : '#f5f5f5',
          color: isDarkTheme ? '#f0f0f0' : '#333',
          fontFamily: monospaceFonts,
          ...disableLigatures
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineNumberStyle={{ 
          minWidth: '2.5em', 
          paddingRight: '1em', 
          color: isDarkTheme ? '#666' : '#aaa',
          borderRight: isDarkTheme ? '1px solid #333' : '1px solid #eee',
          marginRight: '1em',
          textAlign: 'right',
          fontFamily: monospaceFonts,
          ...disableLigatures
        }}
        lineNumberContainerStyle={{
          fontFamily: monospaceFonts,
          ...disableLigatures
        }}
        PreTag="div"
        codeTagProps={{
          style: {
            fontFamily: monospaceFonts,
            fontSize: '0.875rem',
            lineHeight: '1.5',
            ...disableLigatures
          }
        }}
      >
        {cleanValue}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
