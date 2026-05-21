/**
 * PluginListTab - 企业插件库列表
 * 复用企业技能库的列表 UI，无分类筛选，操作只有下发和删除
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';
import { Input } from '@/components/ui/input';
import { Search, Grid3x3, List, Send, Trash2, Loader } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MOCK_OPENCLAW_INSTANCES } from './mockData';
import PluginUploadDialog, { type Plugin } from './PluginUploadDialog';
import PluginDetail from './PluginDetail';
import BatchDistributeDialog from './BatchDistributeDialog';
import {
  getSkillDistributionSummary,
  addDistributionRecord,
  updateDistributionRecord,
  createDistributionRecordId,
  type CachedDistributionRecord,
  type SkillDistributionSummary,
} from './distributionCache';

// Mock 初始插件数据
const MOCK_PLUGINS: Plugin[] = [
  {
    id: 'plugin-001',
    slug: 'code-formatter',
    name: '代码格式化插件',
    description: '自动格式化多种编程语言的代码，支持 Python、JavaScript、TypeScript、Go、Rust、Java、C++ 等主流语言。内置 Prettier、Black、gofmt 等格式化引擎，支持自定义规则配置和团队级统一风格管理。',
    version: '1.2.0',
    scope: 'public',
    groupIds: [],
    uploadTime: new Date('2025-08-10'),
    versions: ['1.0.0', '1.1.0', '1.2.0'],
    files: [],
  },
  {
    id: 'plugin-002',
    slug: 'data-export',
    name: '数据导出插件',
    description: '支持将对话数据导出为 CSV、Excel 格式',
    version: '1.0.0',
    scope: 'public',
    groupIds: [],
    uploadTime: new Date('2025-09-05'),
    versions: ['1.0.0'],
    files: [],
  },
  {
    id: 'plugin-003',
    slug: 'intelligent-doc-analyzer',
    name: '智能文档分析插件',
    description: '基于大语言模型的智能文档分析工具，支持 PDF、Word、Excel、PPT 等多种格式的深度解析。可自动提取文档摘要、关键信息、表格数据，并生成结构化报告。内置 OCR 能力，可处理扫描件和图片中的文字识别。支持多语言文档处理，包括中文、英文、日文等。适用于合同审查、财报分析、技术文档解读等企业级场景。',
    version: '2.0.1',
    scope: 'public',
    groupIds: [],
    uploadTime: new Date('2025-10-15'),
    versions: ['1.0.0', '2.0.0', '2.0.1'],
    files: [],
  },
  {
    id: 'plugin-004',
    slug: 'multi-cloud-deployer',
    name: '多云部署编排插件',
    description: '企业级多云部署编排工具，支持同时管理腾讯云、AWS、Azure、GCP 等主流云平台的资源。提供可视化编排界面，支持 Terraform、Pulumi 模板导入，内置蓝绿部署、金丝雀发布、滚动更新等多种发布策略。集成 CI/CD 流水线，可自动触发构建、测试和部署。支持跨云负载均衡、自动扩缩容、成本优化建议。具备完善的审计日志和回滚机制，确保生产环境安全稳定。适用于混合云架构、多区域容灾、DevOps 自动化等企业级场景。',
    version: '3.1.0',
    scope: 'public',
    groupIds: [],
    uploadTime: new Date('2025-11-20'),
    versions: ['1.0.0', '2.0.0', '3.0.0', '3.1.0'],
    files: [],
  },
];

const PLUGINS_CACHE_KEY = 'pluginhub_enterprise_plugins_cache';
const PLUGINS_CACHE_VERSION_KEY = 'pluginhub_enterprise_plugins_cache_version';
const PLUGINS_CACHE_VERSION = '2';

const loadCachedPlugins = (): Plugin[] => {
  try {
    const cachedVersion = localStorage.getItem(PLUGINS_CACHE_VERSION_KEY);
    if (cachedVersion !== PLUGINS_CACHE_VERSION) {
      localStorage.removeItem(PLUGINS_CACHE_KEY);
      localStorage.setItem(PLUGINS_CACHE_VERSION_KEY, PLUGINS_CACHE_VERSION);
      return MOCK_PLUGINS;
    }
    const cached = localStorage.getItem(PLUGINS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.map((p: any) => ({ ...p, uploadTime: new Date(p.uploadTime) }));
    }
  } catch (e) {
    console.warn('加载缓存 plugins 失败:', e);
  }
  return MOCK_PLUGINS;
};

const saveCachedPlugins = (plugins: Plugin[]) => {
  try {
    localStorage.setItem(PLUGINS_CACHE_KEY, JSON.stringify(plugins));
    localStorage.setItem(PLUGINS_CACHE_VERSION_KEY, PLUGINS_CACHE_VERSION);
  } catch (e) {
    console.warn('缓存 plugins 失败:', e);
  }
};

export default function PluginListTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState<Plugin[]>(loadCachedPlugins);
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [distributePluginId, setDistributePluginId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePluginId, setDeletePluginId] = useState<string | null>(null);
  const [distributionSummaries, setDistributionSummaries] = useState<Record<string, SkillDistributionSummary>>({});
  const [distributing, setDistributing] = useState<Record<string, boolean>>({});

  useEffect(() => { saveCachedPlugins(plugins); }, [plugins]);

  const refreshDistributionSummaries = useCallback(() => {
    const summaries: Record<string, SkillDistributionSummary> = {};
    plugins.forEach(p => {
      const summary = getSkillDistributionSummary(p.id);
      if (summary) summaries[p.id] = summary;
    });
    setDistributionSummaries(summaries);
  }, [plugins]);

  useEffect(() => {
    refreshDistributionSummaries();
    const handler = () => refreshDistributionSummaries();
    window.addEventListener('distribution-cache-updated', handler);
    return () => window.removeEventListener('distribution-cache-updated', handler);
  }, [refreshDistributionSummaries]);

  const isDistributing = (pluginId: string) => distributing[pluginId] || distributionSummaries[pluginId]?.hasInProgress || false;

  const filteredPlugins = plugins.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedPlugins = [...filteredPlugins].sort((a, b) => b.uploadTime.getTime() - a.uploadTime.getTime());

  const handleUploadPlugin = (plugin: Plugin) => {
    setPlugins(prev => {
      const updated = [...prev, plugin];
      saveCachedPlugins(updated);
      return updated;
    });
  };

  const handleDistribute = (pluginId: string) => {
    setDistributePluginId(pluginId);
    setDistributeDialogOpen(true);
  };

  const handleDistributeStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    if (!distributePluginId) return;
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId: distributePluginId,
      timestamp: new Date().toISOString(),
      totalCount: selectedInstanceIds.length,
      successCount: 0,
      failedCount: 0,
      inProgressCount: selectedInstanceIds.length,
      status: 'distributing',
      instances: selectedInstancesData.map(inst => ({
        id: inst.id,
        name: inst.name,
        createdBy: inst.createdBy || 'admin',
        distributionStatus: 'distributing' as const,
      })),
    };
    addDistributionRecord(newRecord);
    setDistributeDialogOpen(false);
    setDistributing(prev => ({ ...prev, [distributePluginId]: true }));
    toast.success('已开始下发流程');

    const totalCount = selectedInstanceIds.length;
    let completed = 0;
    const interval = setInterval(() => {
      completed += Math.floor(Math.random() * 3) + 1;
      if (completed >= totalCount) {
        completed = totalCount;
        clearInterval(interval);
        const failedCount = Math.floor(Math.random() * 2);
        const successCount = totalCount - failedCount;
        updateDistributionRecord(recordId, (record) => ({
          ...record,
          successCount,
          failedCount,
          inProgressCount: 0,
          status: failedCount === 0 ? 'success' : 'failed',
          instances: record.instances.map((inst, idx) => ({
            ...inst,
            distributionStatus: idx < successCount ? 'success' as const : 'failed' as const,
          })),
        }));
        setDistributing(prev => ({ ...prev, [distributePluginId!]: false }));
        toast.success('下发完成');
      } else {
        updateDistributionRecord(recordId, (record) => ({
          ...record,
          successCount: completed,
          inProgressCount: totalCount - completed,
        }));
      }
    }, 800);
  };

  const handleDelete = (pluginId: string) => {
    setDeletePluginId(pluginId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletePluginId) return;
    const pluginName = plugins.find(p => p.id === deletePluginId)?.name || '';
    setPlugins(prev => {
      const updated = prev.filter(p => p.id !== deletePluginId);
      saveCachedPlugins(updated);
      return updated;
    });
    toast.success(`插件「${pluginName}」已删除`);
    setDeleteDialogOpen(false);
    setDeletePluginId(null);
  };

  const distributePlugin = plugins.find(p => p.id === distributePluginId);
  const deletePlugin = plugins.find(p => p.id === deletePluginId);

  // 如果选中了插件，显示详情页
  if (selectedPluginId) {
    const selectedPlugin = plugins.find(p => p.id === selectedPluginId);
    if (selectedPlugin) {
      return (
        <PluginDetail
          plugin={selectedPlugin}
          onBack={() => setSelectedPluginId(null)}
          onPluginDelete={(pluginId) => {
            setPlugins(prev => {
              const updated = prev.filter(p => p.id !== pluginId);
              saveCachedPlugins(updated);
              return updated;
            });
            setSelectedPluginId(null);
          }}
        />
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索插件名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border border-gray-200"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <SegmentGroup>
            <SegmentOption active={viewMode === 'card'} onClick={() => setViewMode('card')} title="卡片视图">
              <Grid3x3 className="w-4 h-4" />
            </SegmentOption>
            <SegmentOption active={viewMode === 'list'} onClick={() => setViewMode('list')} title="列表视图">
              <List className="w-4 h-4" />
            </SegmentOption>
          </SegmentGroup>

          <Button variant="claw-primary" size="claw-sm" onClick={() => setUploadDialogOpen(true)}>
            + 发布插件
          </Button>
        </div>
      </div>

      {/* 空状态 */}
      {sortedPlugins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">还没有发布任何插件</p>
          <Button onClick={() => setUploadDialogOpen(true)} className="mt-4">+ 发布插件</Button>
        </div>
      )}

      {/* 卡片视图 */}
      {viewMode === 'card' && sortedPlugins.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {sortedPlugins.map(plugin => {
            const dist = isDistributing(plugin.id);
            return (
              <div key={plugin.id} onClick={() => setSelectedPluginId(plugin.id)} className="rounded-xl border border-gray-200 bg-white p-4 transition-all cursor-pointer flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1 truncate">{plugin.name}</h3>
                  <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full shrink-0">v{plugin.version}</span>
                </div>
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 cursor-default" style={{ minHeight: '2.5rem' }}>{plugin.description || '-'}</p>
                  </TooltipTrigger>
                  {plugin.description && plugin.description.length > 40 && (
                    <TooltipContent side="bottom" className="max-w-[320px]">
                      <p className="text-xs whitespace-pre-wrap">{plugin.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <div className="flex items-center gap-1 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => handleDistribute(plugin.id)} disabled={dist} className={`h-7 text-xs ${dist ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Send className="w-3 h-3 mr-1" />
                    {dist ? '下发中' : '下发'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(plugin.id)} className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="w-3 h-3 mr-1" />删除
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 列表视图 */}
      {viewMode === 'list' && sortedPlugins.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '18%' }}>
                  名称/Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wide" style={{ width: '15%' }}>状态/下发动态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '7%' }}>版本号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '30%' }}>描述</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '12%' }}>发布时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '18%' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlugins.map((plugin) => {
                const dist = isDistributing(plugin.id);
                const summary = distributionSummaries[plugin.id];

                const hasDistribution = summary && summary.lastDistributionStatus !== 'not_distributed';
                let statusLine1 = '正常';
                let statusLine2 = '未下发';
                let statusLine1Color = 'text-gray-700';
                let statusLine2Color = 'text-gray-400';
                let statusLine2Bg = '';
                let statusLine2HoverBg = '';
                if (summary) {
                  if (summary.lastDistributionStatus === 'distributing') {
                    statusLine1 = '下发中';
                    statusLine1Color = 'text-blue-600';
                    statusLine2 = `${summary.lastDistributionProgress || 0}%`;
                    statusLine2Color = 'text-blue-600';
                    statusLine2Bg = 'bg-blue-50';
                    statusLine2HoverBg = 'hover:bg-blue-100';
                  } else if (hasDistribution) {
                    statusLine1 = '正常';
                    statusLine1Color = 'text-gray-700';
                    const total = summary.lastDistributionInstanceCount || 0;
                    const success = summary.lastDistributionSuccessCount ?? total;
                    statusLine2 = `已下发(${success}/${total}成功)`;
                    if (success === total) {
                      statusLine2Color = 'text-green-600';
                      statusLine2Bg = 'bg-green-50';
                      statusLine2HoverBg = 'hover:bg-green-100';
                    } else {
                      statusLine2Color = 'text-yellow-600';
                      statusLine2Bg = 'bg-yellow-50';
                      statusLine2HoverBg = 'hover:bg-yellow-100';
                    }
                  }
                }

                return (
                  <tr key={plugin.id} onClick={() => setSelectedPluginId(plugin.id)} className="border-b border-[#e5e5e5] hover:bg-gray-50 cursor-pointer transition-colors group">
                    {/* 名称 / Slug */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate">{plugin.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5 truncate">{plugin.slug}</div>
                    </td>
                    {/* 状态/下发动态 */}
                    <td className="pl-4 pr-2 py-3">
                      <div className={`text-sm font-medium ${statusLine1Color}`}>{statusLine1}</div>
                      <div
                        className={hasDistribution
                          ? `inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded-full text-xs font-medium cursor-default transition-colors ${statusLine2Color} ${statusLine2Bg} ${statusLine2HoverBg}`
                          : `text-xs mt-0.5 ${statusLine2Color}`
                        }
                      >
                        {statusLine2}
                      </div>
                    </td>
                    {/* 版本号 */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        v{plugin.version}
                      </span>
                    </td>
                    {/* 描述 */}
                    <td className="px-4 py-3" style={{ overflow: 'hidden' }}>
                      <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                          <span
                            className="text-sm text-gray-600 cursor-default block"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordBreak: 'break-all',
                            }}
                          >{plugin.description || '-'}</span>
                        </TooltipTrigger>
                        {plugin.description && plugin.description.length > 40 && (
                          <TooltipContent side="bottom" className="max-w-[400px]">
                            <p className="text-xs whitespace-pre-wrap">{plugin.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </td>
                    {/* 发布时间 */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {plugin.uploadTime.toLocaleDateString('zh-CN')}
                      </span>
                    </td>
                    {/* 操作 */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDistribute(plugin.id)}
                          disabled={dist}
                          className={`h-7 text-xs min-w-[62px] ${dist ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {dist ? <Loader className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                          {dist ? '下发中' : '下发'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plugin.id)}
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 发布插件弹窗 */}
      <PluginUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onConfirm={handleUploadPlugin}
        existingSlugs={plugins.map(p => p.slug)}
      />

      {/* 下发弹窗 */}
      <BatchDistributeDialog
        open={distributeDialogOpen}
        onOpenChange={setDistributeDialogOpen}
        skillId={distributePluginId || undefined}
        skillName={distributePlugin?.name}
        skillVersion={distributePlugin?.version}
        onDistributionStart={handleDistributeStart}
        title="批量下发插件"
        showScopeFilter={false}
        instances={MOCK_OPENCLAW_INSTANCES}
      />

      {/* 删除确认弹窗 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>删除插件</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            确定要删除插件「<span className="font-medium text-gray-900">{deletePlugin?.name}</span>」吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
