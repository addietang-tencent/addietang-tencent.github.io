/**
 * PluginListTab - 企业插件库列表
 * 复用企业技能库的列表 UI，无分类筛选，操作只有下发和删除
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
    description: '自动格式化多种编程语言的代码，支持 Python、JS、TS 等',
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
];

const PLUGINS_CACHE_KEY = 'pluginhub_enterprise_plugins_cache';
const PLUGINS_CACHE_VERSION_KEY = 'pluginhub_enterprise_plugins_cache_version';
const PLUGINS_CACHE_VERSION = '1';

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

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索插件名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border border-gray-200"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* 视图切换 */}
          <div className="flex items-center gap-1 border border-gray-200 rounded p-1 bg-white">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded transition-colors ${viewMode === 'card' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              title="卡片视图"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => setUploadDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
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
              <div key={plugin.id} className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1 truncate">{plugin.name}</h3>
                  <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full shrink-0">v{plugin.version}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{plugin.description || '-'}</p>
                <div className="flex items-center gap-1">
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
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">插件名称</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">描述</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">版本</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">发布时间</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlugins.map((plugin, idx) => {
                const dist = isDistributing(plugin.id);
                return (
                  <tr key={plugin.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx === sortedPlugins.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{plugin.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{plugin.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Tooltip delayDuration={800}>
                        <TooltipTrigger asChild>
                          <p className="text-gray-600 max-w-[280px] truncate cursor-default">{plugin.description || '-'}</p>
                        </TooltipTrigger>
                        {plugin.description && plugin.description.length > 40 && (
                          <TooltipContent side="top" className="max-w-[320px]">
                            <p className="text-xs whitespace-pre-wrap">{plugin.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">v{plugin.version}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {plugin.uploadTime.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip delayDuration={800}>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleDistribute(plugin.id)} disabled={dist}
                              className={`h-7 w-7 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 ${dist ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              {dist ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">{dist ? '下发中' : '下发'}</TooltipContent>
                        </Tooltip>
                        <Tooltip delayDuration={800}>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(plugin.id)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">删除</TooltipContent>
                        </Tooltip>
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
