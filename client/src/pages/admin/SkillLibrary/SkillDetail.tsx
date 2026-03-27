'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, ChevronDown, ChevronRight, Filter } from 'lucide-react';
import { MOCK_SKILLS, DEFAULT_CATEGORIES } from './mockData';
import BatchDistributeDialog from './BatchDistributeDialog';
import MDXRenderer from '@/components/MDXRenderer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DistributionInstance {
  id: string;
  name: string;
  createdBy: string;
  status: 'success' | 'failed' | 'in_progress';
}

interface DistributionRecord {
  id: string;
  timestamp: Date;
  totalCount: number;
  successCount: number;
  failedCount: number;
  inProgressCount: number;
  status: 'completed' | 'partial' | 'in_progress';
  instances: DistributionInstance[];
}

interface SkillDetailProps {
  skillId: string;
  onBack: () => void;
  skills?: any[];
  defaultTab?: string;
}

export default function SkillDetail({ skillId, onBack, skills, defaultTab }: SkillDetailProps) {
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>('SKILL.md');
  const [distributionRecords, setDistributionRecords] = useState<DistributionRecord[]>([]);
  const [activeDistributionId, setActiveDistributionId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'in_progress'>('all');
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const skillsArray = skills || MOCK_SKILLS;
  const skill = skillsArray.find(s => s.id === skillId);
  
  useEffect(() => {
    if (skill?.versions && skill.versions.length > 0 && !selectedVersion) {
      setSelectedVersion(skill.versions[0]);
    }
  }, [skill?.versions, selectedVersion]);
  
  const renderFileTree = (files: Array<{ name: string; size?: number }>) => {
    return files.map((file) => {
      const isDir = !file.name.toLowerCase().endsWith('.md');
      const parts = file.name.split('/');
      const isNested = parts.length > 1;
      
      return (
        <button
          key={file.name}
          onClick={() => !isDir && setExpandedFile(expandedFile === file.name ? null : file.name)}
          disabled={isDir}
          className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 transition-colors ${
            expandedFile === file.name
              ? 'bg-blue-50 text-blue-600 font-medium'
              : !isDir
              ? 'hover:bg-gray-50 text-gray-700 cursor-pointer'
              : 'text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-center gap-2">
            {isNested && <span className="text-xs ml-2">└</span>}
            <span className="text-xs">{isDir ? '📁' : '📄'}</span>
            <span className="truncate text-xs">{parts[parts.length - 1]}</span>
          </div>
        </button>
      );
    });
  };
  
  const getFileContent = (fileName: string): string => {
    if (fileName === 'SKILL.md') return skill?.content || '';
    if (fileName === 'hha/ha.md') {
      return `## 我好\n### niha\n**默认有：**\n通用办公  研发工具  系统运维   质量测试   需求设计    信息检索    项目管理    数据分析    安全合规\n支持新增和删除。`;
    }
    return '';
  };
  
  const handleDistributionStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    // 创建新的分发记录
    const newRecord: DistributionRecord = {
      id: 'dist-' + Date.now(),
      timestamp: new Date(),
      totalCount: selectedInstanceIds.length,
      successCount: 0,
      failedCount: 0,
      inProgressCount: selectedInstanceIds.length,
      status: 'in_progress',
      instances: selectedInstancesData.map(inst => ({
        id: inst.id,
        name: inst.name,
        createdBy: 'admin', // 模拟数据
        status: 'in_progress',
      })),
    };
    
    setDistributionRecords(prev => [newRecord, ...prev]);
    setActiveDistributionId(newRecord.id);
    setDistributeDialogOpen(false);
    
    // 模拟下发进度
    simulateDistribution(newRecord.id, selectedInstanceIds.length);
  };
  
  const simulateDistribution = (recordId: string, totalCount: number) => {
    let completed = 0;
    const interval = setInterval(() => {
      completed += Math.floor(Math.random() * 3) + 1;
      if (completed >= totalCount) {
        completed = totalCount;
        clearInterval(interval);
        
        // 更新记录为完成
        setDistributionRecords(prev => prev.map(record => {
          if (record.id === recordId) {
            // 模拟随机失败一些实例
            const failedCount = Math.floor(Math.random() * 2);
            const successCount = totalCount - failedCount;
            return {
              ...record,
              successCount,
              failedCount,
              inProgressCount: 0,
              status: failedCount === 0 ? 'completed' : 'partial',
              instances: record.instances.map((inst, idx) => ({
                ...inst,
                status: idx < successCount ? 'success' : 'failed',
              })),
            };
          }
          return record;
        }));
      } else {
        // 更新进度
        setDistributionRecords(prev => prev.map(record => {
          if (record.id === recordId) {
            return {
              ...record,
              successCount: completed,
              inProgressCount: totalCount - completed,
            };
          }
          return record;
        }));
      }
    }, 800);
  };
  
  const handleRetry = (recordId: string) => {
    const record = distributionRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const failedInstances = record.instances.filter(inst => inst.status === 'failed');
    simulateDistribution(recordId, failedInstances.length);
    
    // 重置失败的实例状态
    setDistributionRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          status: 'in_progress',
          inProgressCount: failedInstances.length,
          instances: r.instances.map(inst => ({
            ...inst,
            status: inst.status === 'failed' ? 'in_progress' : inst.status,
          })),
        };
      }
      return r;
    }));
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

  const activeDistribution = distributionRecords.find(r => r.id === activeDistributionId);
  const filteredInstances = activeDistribution 
    ? activeDistribution.instances.filter(inst => 
        statusFilter === 'all' || inst.status === statusFilter
      )
    : [];

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-white p-0 h-auto gap-2 border-b-0">
            <TabsTrigger
              value="overview"
              className="rounded-lg px-4 py-1.5 text-sm text-gray-600 bg-white hover:bg-gray-50 border border-transparent data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 transition-colors"
            >
              概述
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-lg px-4 py-1.5 text-sm text-gray-600 bg-white hover:bg-gray-50 border border-transparent data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 transition-colors"
            >
              文件列表
            </TabsTrigger>
            <TabsTrigger
              value="distribution"
              className="rounded-lg px-4 py-1.5 text-sm text-gray-600 bg-white hover:bg-gray-50 border border-transparent data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 transition-colors"
            >
              下发记录
            </TabsTrigger>
          </TabsList>

          {/* 概述 Tab */}
          <TabsContent value="overview" className="mt-4 p-0">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <MDXRenderer content={skill.content || ''} />
            </div>
          </TabsContent>

          {/* 文件列表 Tab */}
          <TabsContent value="files" className="mt-4 p-0">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex gap-2 h-96">
                {/* 左列：版本号选择 (1) */}
                <div className="w-1/7 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700">版本号</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {skill.versions?.map((ver: string) => (
                      <button
                        key={ver}
                        onClick={() => setSelectedVersion(ver)}
                        className={`w-full text-left px-2 py-1.5 text-xs border-b border-gray-100 transition-colors ${
                          selectedVersion === ver
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'hover:bg-gray-50 text-gray-700 cursor-pointer'
                        }`}
                      >
                        v{ver}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 中列：文件列表 (2) */}
                <div className="w-2/7 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700">文件</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {renderFileTree(skill.files || [])}
                  </div>
                </div>

                {/* 右列：文件详情 (4) */}
                <div className="w-4/7 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white">
                  {expandedFile ? (
                    <>
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{expandedFile}</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        {expandedFile.toLowerCase().endsWith('.md') ? (
                          <MDXRenderer content={getFileContent(expandedFile)} />
                        ) : (
                          <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap break-words font-mono">
                            {getFileContent(expandedFile)}
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

          {/* 下发记录 Tab */}
          <TabsContent value="distribution" className="mt-4 p-0">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">下发记录</h3>
                <Button
                  onClick={() => setDistributeDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  批量下发
                </Button>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {distributionRecords.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">还没有下发记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {distributionRecords.map((record, idx) => {
                    const progress = record.totalCount > 0 ? Math.round((record.successCount / record.totalCount) * 100) : 0;
                    return (
                      <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              #{distributionRecords.length - idx} · {record.timestamp.toLocaleString('zh-CN')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                              record.status === 'completed' ? 'bg-green-50 text-green-700' :
                              record.status === 'partial' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {record.status === 'completed' ? `已全部完成（共${record.totalCount}个实例）` :
                               record.status === 'partial' ? '下发完成' :
                               '进行中'}
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setActiveDistributionId(record.id);
                                setStatusFilter('all');
                                setDetailsOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 h-auto py-1 px-2"
                            >
                              查看详惃
                            </Button>
                          </div>
                        </div>
                        
                        {record.status === 'in_progress' && (
                          <>
                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {progress}% ({record.successCount}个已完成/{record.totalCount}个)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>

                            </div>
                          </>
                        )}
                        
                        {record.status === 'partial' && (
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">
                              下发完成，{record.successCount}个已完成，{record.failedCount}个失败
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
        onDistributionStart={handleDistributionStart}
      />

      {/* 分发详情对话框 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-96">
          <DialogHeader>
            <DialogTitle>下发详情</DialogTitle>
          </DialogHeader>
          
          {activeDistribution && (
            <div className="space-y-4">
              {/* 筛选器 */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                    <SelectItem value="in_progress">进行中</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 实例列表 */}
              <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">实例名称</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">实例ID</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">状态</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstances.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                          没有符合条件的记录
                        </td>
                      </tr>
                    ) : (
                      filteredInstances.map((instance) => (
                        <tr key={instance.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">{instance.name}</td>
                          <td className="px-4 py-2 text-gray-600 font-mono">{instance.id}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              instance.status === 'success' ? 'bg-green-50 text-green-700' :
                              instance.status === 'failed' ? 'bg-red-50 text-red-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {instance.status === 'success' ? '成功' :
                               instance.status === 'failed' ? '失败' :
                               '进行中'}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {instance.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-700 h-auto p-0"
                                onClick={() => {
                                  // 重试单个实例
                                  handleRetry(activeDistribution.id);
                                }}
                              >
                                重试
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
