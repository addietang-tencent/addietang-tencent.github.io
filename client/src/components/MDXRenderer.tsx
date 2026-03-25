import { useMemo } from 'react';
import { MDXProvider } from '@mdx-js/react';

interface MDXRendererProps {
  content: string;
}

// 自定义 MDX 组件，提供美观的样式
const components = {
  h1: ({ children }: any) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 border-b-2 border-blue-500 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-3xl font-bold mt-7 mb-3 text-gray-800 text-blue-600">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-2xl font-semibold mt-6 mb-2 text-gray-700">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-xl font-semibold mt-5 mb-2 text-gray-700">
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p className="text-gray-700 mb-4 leading-relaxed">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-gray-700">
      {children}
    </li>
  ),
  code: ({ children, className }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono border border-gray-200">
          {children}
        </code>
      );
    }
    return (
      <code className={`${className} bg-gray-900 text-gray-100 p-4 rounded-lg block overflow-x-auto font-mono text-sm mb-4`}>
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm">
      {children}
    </pre>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 mb-4 text-gray-700 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse border border-gray-300">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-gray-100 border-b-2 border-gray-300">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody>
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900 bg-gray-100">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border border-gray-300 px-4 py-2 text-gray-700">
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-6 border-t-2 border-gray-300" />
  ),
  a: ({ children, href }: any) => (
    <a href={href} className="text-blue-600 hover:text-blue-800 underline">
      {children}
    </a>
  ),
  img: ({ src, alt }: any) => (
    <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-4" />
  ),
};

export default function MDXRenderer({ content }: MDXRendererProps) {
  // 移除 frontmatter
  const cleanContent = useMemo(() => {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    return content.replace(frontmatterRegex, '');
  }, [content]);

  // 将 Markdown 转换为 HTML（简单实现）
  // 注：这里使用简单的转换，实际应该使用 MDX 编译器
  const htmlContent = useMemo(() => {
    let html = cleanContent;

    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });

    // 标题
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // 粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 斜体
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 内联代码
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // 分隔线
    html = html.replace(/^---$/gm, '<hr />');

    // 段落
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;

    return html;
  }, [cleanContent]);

  return (
    <MDXProvider components={components}>
      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </MDXProvider>
  );
}
