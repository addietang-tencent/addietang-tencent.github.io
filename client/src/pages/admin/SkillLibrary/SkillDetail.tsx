import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MOCK_SKILLS, DEFAULT_CATEGORIES } from './mockData';
import BatchDistributeDialog from './BatchDistributeDialog';

interface SkillDetailProps {
  skillId: string;
  onBack: () => void;
}

export default function SkillDetail({ skillId, onBack }: SkillDetailProps) {
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>('SKILL.md');
  const skill = MOCK_SKILLS.find(s => s.id === skillId);

  if (!skill) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">技能未找到</p>
        <Button onClick={onBack} className="mt-4">返回列表</Button>
      </div>
    );
  }

  const getCategoryName = (catId: string) => {
    return DEFAULT_CATEGORIES.find((cat: any) => cat.id === catId)?.name || catId;
  };

  const files = [
    { name: 'SKILL.md', content: skill.content },
    { name: 'README.md', content: '# README\n\n这是 Skill 的说明文档...' },
    { name: 'config.yaml', content: 'name: ' + skill.name + '\nversion: ' + skill.version },
  ];

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      {/* 技能基本信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{skill.name}</h1>
            <p className="text-sm text-gray-500 mb-3">slug: {skill.slug}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                v{skill.version}
              </span>
              <div className="flex gap-1 flex-wrap">
                {skill.categories.map((catId: string) => (
                  <span
                    key={catId}
                    className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded"
                  >
                    {getCategoryName(catId)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">上传时间</p>
            <p className="text-sm font-semibold text-gray-900">
              {skill.uploadTime.toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
      </div>

      {/* Tab 页面 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b border-gray-200 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              概述
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              文件列表
            </TabsTrigger>
            <TabsTrigger
              value="install"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              安装方式
            </TabsTrigger>
          </TabsList>

          {/* 概述 Tab */}
          <TabsContent value="overview" className="p-6">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                  table: ({ node, ...props }) => (
                    <table className="w-full border-collapse border border-gray-300 my-4" {...props} />
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-gray-100" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-gray-300 px-3 py-2" {...props} />
                  ),
                  p: ({ node, ...props }: any) => <p className="text-gray-600 mb-3" {...props} />,
                  ul: ({ node, ...props }: any) => <ul className="list-disc list-inside mb-3" {...props} />,
                  ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside mb-3" {...props} />,
                  li: ({ node, ...props }: any) => <li className="text-gray-600 mb-1" {...props} />,
                  code: ({ node, ...props }: any) => (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />
                  ),
                }}
              >
                {skill.content}
              </ReactMarkdown>
            </div>
          </TabsContent>

          {/* 文件列表 Tab */}
          <TabsContent value="files" className="p-6">
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.name} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 文件项头部 */}
                  <button
                    onClick={() => setExpandedFile(expandedFile === file.name ? null : file.name)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedFile === file.name ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    </div>
                  </button>

                  {/* 文件内容预览 */}
                  {expandedFile === file.name && (
                    <div className="border-t border-gray-200 bg-gray-50 p-3">
                      <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap break-words">
                        {file.content}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 安装方式 Tab */}
          <TabsContent value="install" className="p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">安装方式</h3>
              <div className="flex gap-3">
                <Button
                  onClick={() => setDistributeDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  批量下发
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  下载 ZIP 包
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">下发记录</h3>
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">还没有下发记录</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BatchDistributeDialog
        open={distributeDialogOpen}
        onOpenChange={setDistributeDialogOpen}
        skillName={skill.name}
      />
    </div>
  );
}
