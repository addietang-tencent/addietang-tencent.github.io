/**
 * MCPListTab - 企业 MCP 库列表
 * 复用企业插件库的列表 UI，展示 MCP 服务列表，操作包括下发和删除
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';
import { Input } from '@/components/ui/input';
import { Search, Grid3x3, List, Send, Trash2, Loader, X, Plus } from 'lucide-react';
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
import MCPAddDialog from './MCPAddDialog';
import MCPDetail from './MCPDetail';
import BatchDistributeDialog from './BatchDistributeDialog';
import { type MCPService } from './types';
import {
  getSkillDistributionSummary,
  addDistributionRecord,
  updateDistributionRecord,
  createDistributionRecordId,
  type CachedDistributionRecord,
  type SkillDistributionSummary,
} from './distributionCache';

// ── Mock 初始 MCP 数据 ──────────────────────────────────
const MOCK_MCPS: MCPService[] = [
  {
    name: 'gongfeng',
    displayName: '工蜂 MCP 服务',
    description: '通过 MCP 协议连接工蜂代码仓库，支持代码搜索、文件浏览、PR 管理、Issue 查询等操作，让 AI 智能体能够直接与工蜂平台交互。',
    version: '1.0.0',
    versions: ['1.0.0'],
    transport: 'sse',
    configJson: JSON.stringify({
      mcp: {
        servers: {
          gongfeng: {
            url: 'https://gongfeng.example.com/mcp/sse',
            transport: 'sse',
            headers: { 'Authorization': '<your-gongfeng-token>' },
            timeout: 60,
          },
        },
      },
    }, null, 2),
    usageDoc: '# 工蜂 MCP 使用说明\n\n## 前置条件\n\n1. 需要工蜂个人访问令牌（Private Token）\n2. 确保网络可访问工蜂服务\n\n## 使用方式\n\n将配置中的 `<your-gongfeng-token>` 替换为你的工蜂 Token 即可。',
    toolDoc: '# 工具列表\n\n## search_projects\n搜索工蜂项目\n\n## get_blob_content\n获取文件内容\n\n## create_merge_request\n创建合并请求',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15'),
  },
  {
    name: 'iwiki',
    displayName: 'iWiki 文档服务',
    description: '连接 iWiki 知识库平台，支持文档搜索、内容获取、评论管理等操作，帮助 AI 智能体快速获取企业知识。',
    version: '2.1.0',
    versions: ['1.0.0', '2.0.0', '2.1.0'],
    transport: 'streamable-http',
    configJson: JSON.stringify({
      mcp: {
        servers: {
          iwiki: {
            url: 'https://iwiki.example.com/mcp',
            transport: 'streamable-http',
            headers: { 'Authorization': '<your-iwiki-token>' },
            timeout: 60,
          },
        },
      },
    }, null, 2),
    usageDoc: '# iWiki MCP 使用说明\n\n连接 iWiki 后可以搜索和获取企业文档内容。\n\n## 注意事项\n\n- 需要 iWiki 访问权限\n- Token 请从 iWiki 个人设置中获取',
    createdAt: new Date('2025-11-20'),
    updatedAt: new Date('2025-11-20'),
  },
  {
    name: 'filesystem',
    displayName: '本地文件系统',
    description: '通过 STDIO 方式连接本地文件系统 MCP 服务，支持文件读写、目录浏览等基础操作。',
    version: '1.2.0',
    versions: ['1.0.0', '1.1.0', '1.2.0'],
    transport: 'stdio',
    configJson: JSON.stringify({
      mcp: {
        servers: {
          filesystem: {
            command: 'npx',
            args: ['-y', '@anthropic-ai/mcp-filesystem'],
            transport: 'stdio',
            env: { HOME: '/home/user' },
            timeout: 30,
          },
        },
      },
    }, null, 2),
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01'),
  },
  {
    name: 'tapd',
    displayName: 'TAPD 项目管理',
    description: '连接 TAPD 项目管理平台，支持需求查询、缺陷管理、迭代跟踪、任务操作等功能，让 AI 智能体可以直接参与项目管理流程。支持按语义搜索需求和缺陷，自动创建和更新工作项。',
    version: '1.0.0',
    versions: ['0.9.0', '1.0.0'],
    transport: 'sse',
    configJson: JSON.stringify({
      mcp: {
        servers: {
          tapd: {
            url: 'https://tapd.example.com/mcp/sse',
            transport: 'sse',
            headers: { 'Authorization': 'Bearer <your-tapd-token>' },
            timeout: 90,
          },
        },
      },
    }, null, 2),
    usageDoc: '# TAPD MCP 使用说明\n\n## 快速开始\n\n1. 获取 TAPD API Token\n2. 将 Token 填入配置\n3. 连接后即可使用\n\n## 常用操作\n\n- 查询需求列表\n- 创建/更新缺陷\n- 查看迭代进度',
    toolDoc: '# 工具列表\n\n## stories_get\n查询需求列表\n\n| 参数 | 类型 | 说明 |\n|------|------|------|\n| workspace_id | string | 项目ID |\n| status | string | 状态 |\n\n## bugs_create\n创建缺陷\n\n## iterations_get\n查询迭代信息',
    createdAt: new Date('2025-09-28'),
    updatedAt: new Date('2025-10-05'),
  },
];

// ── 缓存相关 ────────────────────────────────────────────
const MCP_CACHE_KEY = 'mcphub_enterprise_mcps_cache';
const MCP_CACHE_VERSION_KEY = 'mcphub_enterprise_mcps_cache_version';
const MCP_CACHE_VERSION = '9';

const loadCachedMCPs = (): MCPService[] => {
  try {
    const cachedVersion = localStorage.getItem(MCP_CACHE_VERSION_KEY);
    if (cachedVersion !== MCP_CACHE_VERSION) {
      localStorage.removeItem(MCP_CACHE_KEY);
      localStorage.setItem(MCP_CACHE_VERSION_KEY, MCP_CACHE_VERSION);
      return MOCK_MCPS;
    }
    const cached = localStorage.getItem(MCP_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
      }));
    }
  } catch (e) {
    console.warn('加载缓存 MCPs 失败:', e);
  }
  return MOCK_MCPS;
};

const saveCachedMCPs = (mcps: MCPService[]) => {
  try {
    localStorage.setItem(MCP_CACHE_KEY, JSON.stringify(mcps));
    localStorage.setItem(MCP_CACHE_VERSION_KEY, MCP_CACHE_VERSION);
  } catch (e) {
    console.warn('缓存 MCPs 失败:', e);
  }
};

// ── 组件 ────────────────────────────────────────────────
export default function MCPListTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mcps, setMCPs] = useState<MCPService[]>(loadCachedMCPs);
  const [selectedMCPId, setSelectedMCPId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [distributeMCPId, setDistributeMCPId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMCPId, setDeleteMCPId] = useState<string | null>(null);
  const [distributionSummaries, setDistributionSummaries] = useState<Record<string, SkillDistributionSummary>>({});
  const [distributing, setDistributing] = useState<Record<string, boolean>>({});

  useEffect(() => { saveCachedMCPs(mcps); }, [mcps]);

  const refreshDistributionSummaries = useCallback(() => {
    const summaries: Record<string, SkillDistributionSummary> = {};
    mcps.forEach(m => {
      const summary = getSkillDistributionSummary(m.name);
      if (summary) summaries[m.name] = summary;
    });
    setDistributionSummaries(summaries);
  }, [mcps]);

  useEffect(() => {
    refreshDistributionSummaries();
    const handler = () => refreshDistributionSummaries();
    window.addEventListener('distribution-cache-updated', handler);
    return () => window.removeEventListener('distribution-cache-updated', handler);
  }, [refreshDistributionSummaries]);

  const isDistributing = (mcpName: string) => distributing[mcpName] || distributionSummaries[mcpName]?.hasInProgress || false;

  const filteredMCPs = mcps.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedMCPs = [...filteredMCPs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleAddMCP = (mcp: MCPService) => {
    setMCPs(prev => {
      const updated = [...prev, mcp];
      saveCachedMCPs(updated);
      return updated;
    });
  };

  const handleDistribute = (mcpId: string) => {
    setDistributeMCPId(mcpId);
    setDistributeDialogOpen(true);
  };

  const handleDistributeStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    if (!distributeMCPId) return;
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId: distributeMCPId,
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
    setDistributing(prev => ({ ...prev, [distributeMCPId]: true }));
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
        setDistributing(prev => ({ ...prev, [distributeMCPId!]: false }));
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

  const handleDelete = (mcpId: string) => {
    setDeleteMCPId(mcpId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteMCPId) return;
    const mcpName = mcps.find(m => m.name === deleteMCPId)?.displayName || mcps.find(m => m.name === deleteMCPId)?.name || '';
    setMCPs(prev => {
      const updated = prev.filter(m => m.name !== deleteMCPId);
      saveCachedMCPs(updated);
      return updated;
    });
    toast.success(`MCP「${mcpName}」已删除`);
    setDeleteDialogOpen(false);
    setDeleteMCPId(null);
  };

  const distributeMCP = mcps.find(m => m.name === distributeMCPId);
  const deleteMCP = mcps.find(m => m.name === deleteMCPId);

  // 如果选中了 MCP，显示详情页
  if (selectedMCPId) {
    const selectedMCP = mcps.find(m => m.name === selectedMCPId);
    if (selectedMCP) {
      return (
        <MCPDetail
          mcp={selectedMCP}
          onBack={() => setSelectedMCPId(null)}
          onMCPDelete={(mcpId) => {
            setMCPs(prev => {
              const updated = prev.filter(m => m.name !== mcpId);
              saveCachedMCPs(updated);
              return updated;
            });
            setSelectedMCPId(null);
          }}
        />
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] w-4 h-4" />
          <Input
            placeholder="搜索 MCP 标识、名称、描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border border-gray-200"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* 视图切换 */}
          <SegmentGroup>
            <SegmentOption active={viewMode === 'card'} onClick={() => setViewMode('card')} title="卡片视图">
              <Grid3x3 className="w-4 h-4" />
            </SegmentOption>
            <SegmentOption active={viewMode === 'list'} onClick={() => setViewMode('list')} title="列表视图">
              <List className="w-4 h-4" />
            </SegmentOption>
          </SegmentGroup>

          <Button variant="claw-primary" size="claw-sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            新增 MCP
          </Button>
        </div>
      </div>

      {/* 空状态 */}
      {sortedMCPs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#737373]">还没有创建任何 MCP 服务</p>
          <Button onClick={() => setAddDialogOpen(true)} className="mt-4">+ 新增 MCP</Button>
        </div>
      )}

      {/* 卡片视图 */}
      {viewMode === 'card' && sortedMCPs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {sortedMCPs.map(mcp => {
            const dist = isDistributing(mcp.name);
            return (
              <div key={mcp.name} onClick={() => setSelectedMCPId(mcp.name)} className="rounded-xl border border-gray-200 bg-white p-4 transition-all cursor-pointer flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[#0A0A0A] flex-1 truncate">{mcp.displayName || mcp.name}</h3>
                  <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-[#737373] text-xs font-medium rounded-full shrink-0">
                    v{mcp.version}
                  </span>
                </div>
                {mcp.displayName && (
                  <p className="text-xs text-[#A3A3A3] font-mono mb-1 truncate">{mcp.name}</p>
                )}
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-[#737373] line-clamp-2 mb-4 cursor-default" style={{ minHeight: '2.5rem' }}>{mcp.description || '-'}</p>
                  </TooltipTrigger>
                  {mcp.description && mcp.description.length > 40 && (
                    <TooltipContent side="bottom" className="max-w-[320px]">
                      <p className="text-xs whitespace-pre-wrap">{mcp.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <div className="flex items-center gap-1 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => handleDistribute(mcp.name)} disabled={dist} className={`h-7 text-xs ${dist ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Send className="w-3 h-3 mr-1" />
                    {dist ? '下发中' : '下发'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(mcp.name)} className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="w-3 h-3 mr-1" />删除
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 列表视图 */}
      {viewMode === 'list' && sortedMCPs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wide" style={{ width: '20%' }}>
                  名称/标识
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] tracking-wide" style={{ width: '15%' }}>状态/下发动态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wide" style={{ width: '10%' }}>版本号/连接方式</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wide" style={{ width: '30%' }}>描述</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wide" style={{ width: '10%' }}>创建时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wide" style={{ width: '15%' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedMCPs.map((mcp) => {
                const dist = isDistributing(mcp.name);
                const summary = distributionSummaries[mcp.name];

                const hasDistribution = summary && summary.lastDistributionStatus !== 'not_distributed';
                let statusLine1 = '正常';
                let statusLine2 = '未下发';
                let statusLine1Color = 'text-[#334155]';
                let statusLine2Color = 'text-[#A3A3A3]';
                let statusLine2Bg = '';
                let statusLine2HoverBg = '';
                if (summary) {
                  if (summary.lastDistributionStatus === 'distributing') {
                    statusLine1 = '下发中';
                    statusLine1Color = 'text-[#355EF1]';
                    statusLine2 = `${summary.lastDistributionProgress || 0}%`;
                    statusLine2Color = 'text-[#355EF1]';
                    statusLine2Bg = 'bg-blue-50';
                    statusLine2HoverBg = 'hover:bg-blue-100';
                  } else if (hasDistribution) {
                    statusLine1 = '正常';
                    statusLine1Color = 'text-[#334155]';
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
                  <tr key={mcp.name} onClick={() => setSelectedMCPId(mcp.name)} className="border-b border-[#e5e5e5] hover:bg-gray-50 cursor-pointer transition-colors group">
                    {/* 名称 / 标识 */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0A0A0A] truncate">{mcp.displayName || mcp.name}</div>
                      {mcp.displayName && <div className="text-xs text-[#A3A3A3] font-mono mt-0.5 truncate">{mcp.name}</div>}
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
                    {/* 版本号/连接方式 */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-[#737373] text-xs font-medium rounded-full">
                        v{mcp.version}
                      </span>
                      <div className="text-xs text-[#A3A3A3] mt-0.5">
                        {mcp.transport === 'stdio' ? '本地命令' : '远程服务'}
                      </div>
                    </td>
                    {/* 描述 */}
                    <td className="px-4 py-3" style={{ overflow: 'hidden' }}>
                      <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                          <span
                            className="text-sm text-[#737373] cursor-default block"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordBreak: 'break-all',
                            }}
                          >{mcp.description || '-'}</span>
                        </TooltipTrigger>
                        {mcp.description && mcp.description.length > 40 && (
                          <TooltipContent side="bottom" className="max-w-[400px]">
                            <p className="text-xs whitespace-pre-wrap">{mcp.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </td>
                    {/* 创建时间 */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#737373]">
                        {mcp.createdAt.toLocaleDateString('zh-CN')}
                      </span>
                    </td>
                    {/* 操作 */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDistribute(mcp.name)}
                          disabled={dist}
                          className={`h-7 text-xs min-w-[62px] ${dist ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {dist ? <Loader className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                          {dist ? '下发中' : '下发'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(mcp.name)}
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

      {/* 新增 MCP 弹窗 */}
      <MCPAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onConfirm={handleAddMCP}
        existingNames={mcps.map(m => m.name)}
      />

      {/* 下发弹窗 */}
      <BatchDistributeDialog
        open={distributeDialogOpen}
        onOpenChange={setDistributeDialogOpen}
        skillId={distributeMCPId || undefined}
        skillName={distributeMCP?.displayName || distributeMCP?.name}
        onDistributionStart={handleDistributeStart}
        title="批量下发 MCP 配置"
        showScopeFilter={false}
        instances={MOCK_OPENCLAW_INSTANCES}
        hideCreatorAndGroup
        singleStatusFilter
        showVersionFilter
        showConfirmDialog
        descriptionNode={
          <>
            将 <span className="font-semibold">「{distributeMCP?.displayName || distributeMCP?.name || ''}」</span> 部署至所选实例。
            <br />
            筛选限制：仅限智能体类型为 <span className="font-medium">OpenClaw</span> 且状态为{' '}
            <span className="font-medium">运行中</span> 的实例；同时，该实例的下发状态须为{' '}
            <span className="font-medium">未下发</span> 或 <span className="font-medium">下发失败</span>。
            <br />
            默认只下发至 <span className="font-medium">26.3.28 版本后</span>的实例（旧版本不支持 MCP 服务）。
          </>
        }
      />

      {/* 删除确认弹窗 - 警示弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[560px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setDeleteDialogOpen(false)}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">删除 MCP</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p className="text-sm text-[#0A0A0A]">
                确定要删除 MCP「<span className="font-medium">{deleteMCP?.displayName || deleteMCP?.name}</span>」吗？
                <span className="text-[#DC2626]">此操作无法撤销。</span>
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
