import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        );
      } catch (__) {}
    }
    return (
      '<pre class="hljs"><code>' +
      md.utils.escapeHtml(str) +
      '</code></pre>'
    );
  },
});

/**
 * 移除 YAML frontmatter（--- 分隔的元数据）
 */
export function removeFrontmatter(content: string): string {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  return content.replace(frontmatterRegex, '');
}

/**
 * 渲染 Markdown 为 HTML
 */
export function renderMarkdown(content: string): string {
  const cleanContent = removeFrontmatter(content);
  return md.render(cleanContent);
}

export default md;
