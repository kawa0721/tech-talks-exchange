import Showdown from 'showdown';
import TurndownService from 'turndown';
// TurndownはHTMLをMarkdownに変換するもの
// ShowdownはMarkdownをHTMLに変換するもの

// HTML -> Markdown変換
export const convertHtmlToMarkdown = (html: string): string => {
  try {
    const turndownService = new TurndownService({
      codeBlockStyle: 'fenced',
      fence: '```'
    });
    
    // コードブロック処理をカスタマイズ
    turndownService.addRule('codeBlocks', {
      filter: function(node, options) {
        return (
          node.nodeName === 'PRE' && 
          node.firstChild && 
          node.firstChild.nodeName === 'CODE'
        );
      },
      replacement: function(content, node, options) {
        // コードブロックの言語を検出
        const codeNode = node.firstChild as HTMLElement;
        const language = codeNode.className.match(/language-(\w+)/)?.[1] || '';
        
        // 余分な空白や改行を整理
        let code = codeNode.textContent || '';
        
        // コードブロックを正しいフォーマットで生成
        return '\n\n```' + language + '\n' + code + '\n```\n\n';
      }
    });
    
    return turndownService.turndown(html);
  } catch (error) {
    console.error('HTML to Markdown conversion error:', error);
    return html;
  }
};

// Markdown -> HTML変換
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  try {
    // コードブロック内のバックティックを保護
    const protectedMarkdown = protectCodeBlocks(markdown);
    
    const converter = new Showdown.Converter({
      tables: true,
      tasklists: true,
      strikethrough: true,
      simplifiedAutoLink: true,
      excludeTrailingPunctuationFromURLs: true,
      openLinksInNewWindow: true,
      emoji: true,
      ghCodeBlocks: true,
      omitExtraWLInCodeBlocks: true,
    });
    
    return converter.makeHtml(protectedMarkdown);
  } catch (error) {
    console.error('Markdown to HTML conversion error:', error);
    return '';
  }
};

// コードブロック内のコンテンツを保護する関数
function protectCodeBlocks(markdown: string): string {
  // コードブロックを検出する正規表現
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
  
  // 検出したコードブロックを適切に処理
  return markdown.replace(codeBlockRegex, (match, language, code) => {
    // コードブロックを適切なフォーマットで再構成
    return '```' + language + '\n' + code + '\n```';
  });
}
