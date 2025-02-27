import Showdown from 'showdown';
import { htmlToMarkdown } from 'html-to-markdown';

// HTML -> Markdown変換
export const convertHtmlToMarkdown = (html: string): string => {
  if (!html) return '';
  try {
    return htmlToMarkdown(html);
  } catch (error) {
    console.error('HTML to Markdown conversion error:', error);
    return '';
  }
};

// Markdown -> HTML変換
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  try {
    const converter = new Showdown.Converter({
      tables: true,
      tasklists: true,
      strikethrough: true,
      simplifiedAutoLink: true,
      excludeTrailingPunctuationFromURLs: true,
      openLinksInNewWindow: true,
      emoji: true,
    });
    return converter.makeHtml(markdown);
  } catch (error) {
    console.error('Markdown to HTML conversion error:', error);
    return '';
  }
};
