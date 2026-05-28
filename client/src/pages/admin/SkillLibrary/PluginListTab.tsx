/**
 * PluginListTab - 企业插件库列表
 * 复用企业技能库的列表 UI，无分类筛选，操作只有下发和删除
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';
import { Input } from '@/components/ui/input';
import { SurfaceCard } from '@/components/ui/Surface';
import { StatusTag } from '@/components/ui/status-tag';
import {
  Table,
  TableActionCell,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Grid3x3, List, Send, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] w-4 h-4" />
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
          <p className="text-[#737373]">还没有发布任何插件</p>
          <Button onClick={() => setUploadDialogOpen(true)} className="mt-4">+ 发布插件</Button>
        </div>
      )}

      {/* 卡片视图 */}
      {viewMode === 'card' && sortedPlugins.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {sortedPlugins.map(plugin => {
            const dist = isDistributing(plugin.id);
            return (
              <SurfaceCard key={plugin.id} hover onClick={() => setSelectedPluginId(plugin.id)} className="p-4 cursor-pointer flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[#0A0A0A] flex-1 truncate">{plugin.name}</h3>
                  <StatusTag mode="fill" variant="gray" className="shrink-0">v{plugin.version}</StatusTag>
                </div>
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-[#737373] line-clamp-2 mb-4 cursor-default" style={{ minHeight: '2.5rem' }}>{plugin.description || '-'}</p>
                  </TooltipTrigger>
                  {plugin.description && plugin.description.length > 40 && (
                    <TooltipContent side="bottom" className="max-w-[320px]">
                      <p className="text-xs whitespace-pre-wrap">{plugin.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <div className="flex items-center gap-1 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <Button variant="claw-outline" size="claw-sm" onClick={() => handleDistribute(plugin.id)} disabled={dist} className={`h-7 text-xs ${dist ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Send className="w-3 h-3" />
                    {dist ? '下发中' : '下发'}
                  </Button>
                  <Button variant="claw-outline" size="claw-sm" onClick={() => handleDelete(plugin.id)} className="h-7 text-xs">
                    <Trash2 className="w-3 h-3" />删除
                  </Button>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      )}

      {/* 列表视图 */}
      {viewMode === 'list' && sortedPlugins.length > 0 && (
        <SurfaceCard className="overflow-hidden">
          <Table scrollX={1200}>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 240, minWidth: 240 }}>名称/SLUG</TableHead>
                <TableHead style={{ width: 100, minWidth: 100 }}>状态</TableHead>
                <TableHead style={{ width: 120, minWidth: 120 }}>下发</TableHead>
                <TableHead style={{ width: 104, minWidth: 104 }}>版本号</TableHead>
                <TableHead style={{ width: 360, minWidth: 360 }}>描述</TableHead>
                <TableHead style={{ width: 140, minWidth: 140 }}>发布时间</TableHead>
                <TableHead fixed="right" style={{ width: 128, minWidth: 128, maxWidth: 128 }}>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlugins.map((plugin) => {
                const dist = isDistributing(plugin.id);
                const summary = distributionSummaries[plugin.id];
                const hasDistribution = summary && summary.lastDistributionStatus !== 'not_distributed';
                const isDistributionRunning = summary?.lastDistributionStatus === 'distributing';
                const total = summary?.lastDistributionInstanceCount || 0;
                const success = summary?.lastDistributionSuccessCount ?? total;
                const statusLabel = isDistributionRunning ? '下发中' : '正常';
                const statusVariant = isDistributionRunning ? 'blue' : 'green';
                const distributionLabel = isDistributionRunning
                  ? `${summary?.lastDistributionProgress || 0}%`
                  : hasDistribution
                    ? `已下发 ${success}/${total}`
                    : '未下发';
                const distributionVariant = isDistributionRunning ? 'blue' : success === total ? 'green' : 'red';

                return (
                  <TableRow key={plugin.id} onClick={() => setSelectedPluginId(plugin.id)} className="cursor-pointer">
                    <TableCell>
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-medium text-[#0A0A0A]">{plugin.name}</p>
                        <p className="truncate font-mono text-xs text-[#A3A3A3]">{plugin.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusTag mode="text" variant={statusVariant}>{statusLabel}</StatusTag>
                    </TableCell>
                    <TableCell>
                      {hasDistribution ? (
                        <span className="text-sm text-[#334155]">{distributionLabel}</span>
                      ) : (
                        <span className="text-sm text-[#A3A3A3]">{distributionLabel}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[#334155]">v{plugin.version}</span>
                    </TableCell>
                    <TableCell className="whitespace-normal" style={{ overflow: 'hidden' }}>
                      <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                          <span className="line-clamp-2 cursor-default text-sm leading-[1.5] text-[#334155] break-all">
                            {plugin.description || '-'}
                          </span>
                        </TooltipTrigger>
                        {plugin.description && plugin.description.length > 40 && (
                          <TooltipContent side="bottom" className="max-w-[400px]">
                            <p className="text-xs whitespace-pre-wrap">{plugin.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <span className="tabular-nums text-[#737373]">
                        {plugin.uploadTime.toLocaleDateString('zh-CN')}
                      </span>
                    </TableCell>
                    <TableActionCell fixed="right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleDistribute(plugin.id)}
                        disabled={dist}
                      >
                        {dist ? '下发中' : '下发'}
                      </Button>
                      <Button variant="link" size="sm" onClick={() => handleDelete(plugin.id)}>
                        删除
                      </Button>
                    </TableActionCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </SurfaceCard>
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

      {/* 删除确认弹窗 - 警示弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">删除插件</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p className="text-sm text-[#0A0A0A]">
                确定要删除插件「<span className="font-medium">{deletePlugin?.name}</span>」吗？
                <span className="text-[#DC2626]">此操作不可撤销。</span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
