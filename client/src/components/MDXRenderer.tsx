import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MDXRendererProps {
  content: string;
}

// 自定义 Markdown 组件样式
const components = {
  h1: ({ node, ...props }: any) => (
    <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-4 pb-3 border-b-2 border-blue-500" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-blue-300" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-2xl font-semibold text-gray-800 mt-5 mb-2" {...props} />
  ),
  h4: ({ node, ...props }: any) => (
    <h4 className="text-xl font-semibold text-gray-800 mt-4 mb-2" {...props} />
  ),
  h5: ({ node, ...props }: any) => (
    <h5 className="text-lg font-semibold text-gray-800 mt-3 mb-2" {...props} />
  ),
  h6: ({ node, ...props }: any) => (
    <h6 className="text-base font-semibold text-gray-800 mt-3 mb-2" {...props} />
  ),
  p: ({ node, ...props }: any) => (
    <p className="text-gray-700 leading-7 mb-4" {...props} />
  ),
  a: ({ node, ...props }: any) => (
    <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 pl-4" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2 pl-4" {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li className="text-gray-700" {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 text-gray-700 italic" {...props} />
  ),
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    if (inline) {
      return (
        <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }

    return (
      <div className="my-4 rounded-lg overflow-hidden">
        <SyntaxHighlighter
          style={atomDark}
          language={language}
          showLineNumbers={true}
          wrapLines={true}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  },
  pre: ({ node, ...props }: any) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
  ),
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-gray-300" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-gray-100 border-b-2 border-gray-300" {...props} />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="hover:bg-gray-50 transition-colors" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-900 border border-gray-300" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="px-4 py-2 text-gray-700 border border-gray-300" {...props} />
  ),
  hr: ({ node, ...props }: any) => (
    <hr className="my-6 border-t-2 border-gray-300" {...props} />
  ),
  img: ({ node, ...props }: any) => (
    <img className="max-w-full h-auto rounded-lg my-4 shadow-md" {...props} />
  ),
};

export default function MDXRenderer({ content }: MDXRendererProps) {
  // 移除 frontmatter（--- 开头的元数据）
  const cleanContent = content
    .replace(/^---[\s\S]*?---\n/, '')
    .trim();

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkFrontmatter]}
        components={components}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}
