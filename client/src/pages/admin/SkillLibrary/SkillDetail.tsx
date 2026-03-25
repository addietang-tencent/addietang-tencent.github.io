import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { MOCK_SKILLS, DEFAULT_CATEGORIES } from './mockData';
import BatchDistributeDialog from './BatchDistributeDialog';
import { renderMarkdown, removeFrontmatter } from '@/lib/markdownRenderer';

interface DistributionRecord {
  id: string;
  timestamp: Date;
  totalCount: number;
  successCount: number;
  failedCount: number;
  status: 'completed' | 'partial' | 'in_progress';
  instances: Array<{ id: string; name: string; status?: string }>;
}

interface SkillDetailProps {
  skillId: string;
  onBack: () => void;
  skills?: any[];
}

export default function SkillDetail({ skillId, onBack, skills }: SkillDetailProps) {
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>('SKILL.md');
  const [distributionRecords, setDistributionRecords] = useState<DistributionRecord[]>([]);
  const skillsArray = skills || MOCK_SKILLS;
  const skill = skillsArray.find(s => s.id === skillId);
  
  const handleDistributionComplete = (record: DistributionRecord) => {
    setDistributionRecords(prev => [record, ...prev]);
  };

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
              {skill.description && (
                <p className="text-sm text-gray-600 mt-3">{skill.description}</p>
              )}
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
      <div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b border-gray-200 rounded-none bg-white p-0 h-auto">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-gray-600 hover:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent transition-colors"
            >
              概述
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-gray-600 hover:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent transition-colors"
            >
              文件列表
            </TabsTrigger>
            <TabsTrigger
              value="install"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-gray-600 hover:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent transition-colors"
            >
              安装方式
            </TabsTrigger>
          </TabsList>

          {/* 概述 Tab */}
          <TabsContent value="overview" className="mt-2 p-0">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(skill.content || '') }}
              />
            </div>
          </TabsContent>

          {/* 文件列表 Tab */}
          <TabsContent value="files" className="mt-2 p-0">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex gap-4 h-96">
              {/* 左侧：文件列表 */}
              <div className="w-1/4 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-700">Files</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {files.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => file.name.toLowerCase().endsWith('.md') && setExpandedFile(expandedFile === file.name ? null : file.name)}
                      disabled={!file.name.toLowerCase().endsWith('.md')}
                      className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 transition-colors ${
                        expandedFile === file.name
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : file.name.toLowerCase().endsWith('.md')
                          ? 'hover:bg-gray-50 text-gray-700 cursor-pointer'
                          : 'text-gray-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{file.name.toLowerCase().endsWith('.md') ? '📄' : '📋'}</span>
                        <span className="truncate">{file.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 右侧：文件详情 */}
              <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white">
                {expandedFile ? (
                  <>
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{expandedFile}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {files.find(f => f.name === expandedFile)?.name.toLowerCase().endsWith('.md') ? (
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(files.find(f => f.name === expandedFile)?.content || '') }}
                        />
                      ) : (
                        <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap break-words font-mono">
                          {files.find(f => f.name === expandedFile)?.content}
                        </pre>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-sm">选择一个 MD 文件查看详情</p>
                  </div>
                )}
              </div>
            </div>
            </div>
          </TabsContent>

          {/* 安装方式 Tab */}
          <TabsContent value="install" className="mt-2 p-0">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
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

            <div className="space-y-3 mt-8">
              <h3 className="font-semibold text-gray-900">下发记录</h3>
              {distributionRecords.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">还没有下发记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {distributionRecords.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {record.timestamp.toLocaleString('zh-CN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            下发至 {record.totalCount} 个实例
                          </p>
                        </div>
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                          record.status === 'completed' ? 'bg-green-50 text-green-700' :
                          record.status === 'partial' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {record.status === 'completed' ? '成功' :
                           record.status === 'partial' ? '部分成功' :
                           '进行中'}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">成功：</span>
                          <span className="font-semibold text-green-600">{record.successCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">失败：</span>
                          <span className="font-semibold text-red-600">{record.failedCount}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-2">下发实例：</p>
                        <div className="flex flex-wrap gap-2">
                          {record.instances.map((instance) => (
                            <span key={instance.id} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {instance.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 批量下发对话框 */}
      <BatchDistributeDialog
        open={distributeDialogOpen}
        onOpenChange={setDistributeDialogOpen}
        skillName={skill.name}
        onDistributionComplete={handleDistributionComplete}
      />
    </div>
  );
}
