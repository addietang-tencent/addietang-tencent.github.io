import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MDXRendererProps {
  content: string;
}

// 移除 frontmatter
function removeFrontmatter(content: string): string {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  return content.replace(frontmatterRegex, '');
}

export default function MDXRenderer({ content }: MDXRendererProps) {
  const cleanContent = removeFrontmatter(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 border-b-4 border-blue-500 pb-3">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-bold mt-7 mb-3 text-blue-600 border-l-4 border-blue-500 pl-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-semibold mt-6 mb-2 text-gray-800">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-xl font-semibold mt-5 mb-2 text-gray-700">
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-lg font-semibold mt-4 mb-2 text-gray-700">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-base font-semibold mt-3 mb-2 text-gray-700">
            {children}
          </h6>
        ),
        p: ({ children }) => (
          <p className="text-gray-700 mb-4 leading-relaxed text-base">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 ml-4">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 ml-4">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-gray-700">
            {children}
          </li>
        ),
        code: ({ inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : '';

          if (inline) {
            return (
              <code className="bg-red-50 text-red-600 px-2 py-1 rounded text-sm font-mono border border-red-200">
                {children}
              </code>
            );
          }

          return (
            <SyntaxHighlighter
              style={atomDark}
              language={lang || 'text'}
              PreTag="div"
              className="rounded-lg mb-4 text-sm"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 mb-4 text-gray-700 italic">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-blue-100 border-b-2 border-blue-300">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody>
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900 bg-blue-100">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-300 px-4 py-2 text-gray-700">
            {children}
          </td>
        ),
        hr: () => (
          <hr className="my-6 border-t-2 border-gray-300" />
        ),
        a: ({ children, href }) => (
          <a href={href} className="text-blue-600 hover:text-blue-800 underline font-medium">
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-4 border border-gray-200" />
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-gray-900">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-700">
            {children}
          </em>
        ),
      }}
    >
      {cleanContent}
    </ReactMarkdown>
  );
}
