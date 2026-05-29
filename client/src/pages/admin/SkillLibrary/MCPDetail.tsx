/**
 * MCPDetail - MCP 服务详情页
 * 展示基本信息 + 两个 Tab（文件列表 / 下发记录）
 * 文件列表 Tab 内三栏布局：版本列表 | 文件列表 | 内容展示
 * 样式参考 PluginDetail
 */
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Trash2, Search, Eye, Code, FileText, Loader, Send } from 'lucide-react';
import { toast } from 'sonner';
import MDXRenderer from '@/components/MDXRenderer';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import BatchDistributeDialog from './BatchDistributeDialog';
import DeleteSkillDialog from './DeleteSkillDialog';
import { type MCPService, type DistributionStatus, DISTRIBUTION_STATUS_MAP } from './types';
import { MOCK_OPENCLAW_INSTANCES } from './mockData';
import {
  getDistributionRecords,
  addDistributionRecord,
  updateDistributionRecord,
  createDistributionRecordId,
  type CachedDistributionRecord,
} from './distributionCache';

// 懒加载语法高亮
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(mod => ({ default: mod.Light as any }))
);
const loadedLanguages = new Set<string>();
const registerJsonLanguage = async () => {
  if (loadedLanguages.has('json')) return;
  loadedLanguages.add('json');
  try {
    const mod = await import('react-syntax-highlighter');
    const Light = mod.Light as any;
    const jsonMod = await import('react-syntax-highlighter/dist/esm/languages/hljs/json');
    Light.registerLanguage('json', jsonMod.default);
  } catch { /* 静默降级 */ }
};
const registerMarkdownLanguage = async () => {
  if (loadedLanguages.has('markdown')) return;
  loadedLanguages.add('markdown');
  try {
    const mod = await import('react-syntax-highlighter');
    const Light = mod.Light as any;
    const mdMod = await import('react-syntax-highlighter/dist/esm/languages/hljs/markdown');
    Light.registerLanguage('markdown', mdMod.default);
  } catch { /* 静默降级 */ }
};

const hljsStyle: Record<string, React.CSSProperties> = {
  'hljs': { display: 'block', overflowX: 'auto', padding: '1em', background: '#ffffff', color: '#383a42' },
  'hljs-comment': { color: '#a0a1a7', fontStyle: 'italic' },
  'hljs-keyword': { color: '#a626a4' },
  'hljs-number': { color: '#986801' },
  'hljs-string': { color: '#50a14f' },
  'hljs-attr': { color: '#986801' },
  'hljs-literal': { color: '#0184bb' },
  'hljs-name': { color: '#e45649' },
  'hljs-title': { color: '#4078f2' },
  'hljs-type': { color: '#4078f2' },
  'hljs-punctuation': { color: '#383a42' },
  'hljs-section': { color: '#e45649' },
  'hljs-bullet': { color: '#4078f2' },
  'hljs-link': { color: '#4078f2' },
  'hljs-emphasis': { fontStyle: 'italic' },
  'hljs-strong': { fontWeight: 'bold' },
};

/** MCP 固定的三个文件 */
interface MCPFile {
  name: string;
  label: string;
  language: 'markdown' | 'json';
}

const MCP_FILES: MCPFile[] = [
  { name: '使用说明.md', label: '使用说明.md', language: 'markdown' },
  { name: '工具说明.md', label: '工具说明.md', language: 'markdown' },
  { name: '服务配置.json', label: '服务配置.json', language: 'json' },
];

interface MCPDetailProps {
  mcp: MCPService;
  onBack: () => void;
  onMCPDelete?: (mcpId: string) => void;
}

export default function MCPDetail({ mcp, onBack, onMCPDelete }: MCPDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('files');
  const [selectedVersion, setSelectedVersion] = useState<string>(
    mcp.versions?.[mcp.versions.length - 1] || mcp.version
  );
  const [selectedFile, setSelectedFile] = useState<string>('使用说明.md');
  const [fileViewMode, setFileViewMode] = useState<'preview' | 'source'>('preview');

  // 下发记录
  const [distributionRecords, setDistributionRecords] = useState<CachedDistributionRecord[]>([]);
  const [activeDistributionId, setActiveDistributionId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | DistributionStatus>('all');
  const [detailSearchQuery, setDetailSearchQuery] = useState('');

  const refreshRecords = useCallback(() => {
    setDistributionRecords(getDistributionRecords(mcp.name));
  }, [mcp.name]);

  useEffect(() => {
    refreshRecords();
    const handler = () => refreshRecords();
    window.addEventListener('distribution-cache-updated', handler);
    return () => window.removeEventListener('distribution-cache-updated', handler);
  }, [refreshRecords]);

  const hasInProgress = distributionRecords.some(r => r.status === 'distributing');

  // 注册语法高亮语言
  useEffect(() => {
    registerJsonLanguage();
    registerMarkdownLanguage();
  }, []);

  // 版本列表（从新到旧）
  const versions = [...(mcp.versions || [mcp.version])].reverse();

  // 获取文件内容
  const getFileContent = (fileName: string): string => {
    switch (fileName) {
      case '使用说明.md':
        return mcp.usageDoc?.trim() || '';
      case '工具说明.md':
        return mcp.toolDoc?.trim() || '';
      case '服务配置.json': {
        try {
          return JSON.stringify(JSON.parse(mcp.configJson), null, 2);
        } catch {
          return mcp.configJson;
        }
      }
      default:
        return '';
    }
  };

  // 获取文件对应的语法高亮语言
  const getFileLanguage = (fileName: string): string => {
    const file = MCP_FILES.find(f => f.name === fileName);
    return file?.language || 'text';
  };

  // 判断是否为 Markdown 文件
  const isMarkdownFile = (fileName: string): boolean => {
    return fileName.endsWith('.md') || fileName.endsWith('.mdx');
  };

  // 下发逻辑
  const handleDistributionStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId: mcp.name,
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
        distributionStatus: 'distributing' as DistributionStatus,
      })),
    };
    addDistributionRecord(newRecord);
    setActiveDistributionId(recordId);
    setDistributeDialogOpen(false);
    simulateDistribution(recordId, selectedInstanceIds.length);
  };

  const simulateDistribution = (recordId: string, totalCount: number) => {
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
          status: (failedCount === 0 ? 'success' : 'failed') as DistributionStatus,
          instances: record.instances.map((inst, idx) => ({
            ...inst,
            distributionStatus: (idx < successCount ? 'success' : 'failed') as DistributionStatus,
            failReason: idx < successCount ? undefined : '命令下发失败',
          })),
        }));
      } else {
        updateDistributionRecord(recordId, (record) => ({
          ...record,
          successCount: completed,
          inProgressCount: totalCount - completed,
        }));
      }
    }, 800);
  };

  const handleMCPDelete = () => {
    if (onMCPDelete) onMCPDelete(mcp.name);
    toast.success(`MCP「${mcp.displayName || mcp.name}」已删除`);
    setDeleteDialogOpen(false);
    onBack();
  };

  const activeDistribution = distributionRecords.find(r => r.id === activeDistributionId);
  const filteredInstances = activeDistribution
    ? activeDistribution.instances.filter(inst => {
        const matchesStatus = statusFilter === 'all' || inst.distributionStatus === statusFilter;
        const searchLower = detailSearchQuery.toLowerCase();
        const matchesSearch = !detailSearchQuery ||
          inst.name.toLowerCase().includes(searchLower) ||
          inst.id.toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
      })
    : [];

  // 渲染右侧内容区
  const renderFileContent = () => {
    if (!selectedFile) {
      return (
        <div className="flex items-center justify-center h-full text-[#737373]">
          <p className="text-sm">选择一个文件查看内容</p>
        </div>
      );
    }

    const content = getFileContent(selectedFile);
    const isMd = isMarkdownFile(selectedFile);

    if (!content) {
      return (
        <>
          <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center justify-between">
            <p className="text-sm font-medium text-[#09090b]">{selectedFile}</p>
            {isMd && renderViewModeSwitch()}
          </div>
          <div className="flex items-center justify-center h-full text-[#A3A3A3]">
            <p className="text-sm">暂无内容</p>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center justify-between">
          <p className="text-sm font-medium text-[#09090b]">{selectedFile}</p>
          {isMd && renderViewModeSwitch()}
        </div>
        <div className="flex-1 overflow-y-auto">
          {isMd && fileViewMode === 'preview' ? (
            renderPreviewView(content, selectedFile)
          ) : (
            renderSourceView(content, getFileLanguage(selectedFile))
          )}
        </div>
      </>
    );
  };

  // 源码模式
  const renderSourceView = (content: string, lang: string) => {
    return (
      <Suspense fallback={
        <pre className="text-xs text-[#334155] overflow-x-auto whitespace-pre font-mono leading-5 bg-gray-50 p-3 m-0">
          {content}
        </pre>
      }>
        <SyntaxHighlighter
          language={lang}
          style={hljsStyle}
          showLineNumbers
          lineNumberStyle={{ color: '#b0b0b0', fontSize: '11px', minWidth: '2.5em', paddingRight: '1em', userSelect: 'none' }}
          customStyle={{ margin: 0, padding: '12px 0', fontSize: '12px', lineHeight: '1.6', background: '#ffffff', borderRadius: 0, overflowX: 'auto' }}
          wrapLongLines={false}
        >
          {content}
        </SyntaxHighlighter>
      </Suspense>
    );
  };

  // 预览模式
  const renderPreviewView = (content: string, fileName: string) => {
    if (isMarkdownFile(fileName)) {
      return (
        <div className="p-4">
          <MDXRenderer content={content} />
        </div>
      );
    }
    // JSON 等非 Markdown 文件，预览模式也使用 MDXRenderer 渲染代码块
    const lang = getFileLanguage(fileName);
    return (
      <div className="p-4">
        <MDXRenderer content={`\`\`\`${lang}\n${content}\n\`\`\``} />
      </div>
    );
  };

  // 预览/源码 切换按钮
  const renderViewModeSwitch = () => (
    <div className="flex items-center gap-0.5 bg-gray-200/60 rounded p-0.5">
      <button
        onClick={() => setFileViewMode('preview')}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
          fileViewMode === 'preview'
            ? 'bg-white text-[#0A0A0A] shadow-sm font-medium'
            : 'text-[#737373] hover:text-[#334155]'
        }`}
      >
        <Eye className="w-3 h-3" />
        预览
      </button>
      <button
        onClick={() => setFileViewMode('source')}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
          fileViewMode === 'source'
            ? 'bg-white text-[#0A0A0A] shadow-sm font-medium'
            : 'text-[#737373] hover:text-[#334155]'
        }`}
      >
        <Code className="w-3 h-3" />
        源码
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 返回按钮 */}
      <BackButton onClick={onBack}>返回列表</BackButton>

      {/* 基础信息卡片 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#0A0A0A] mb-1">{mcp.displayName || mcp.name}</h1>
            <p className="text-sm text-[#737373] mb-3">
              <span className="font-mono text-[#A3A3A3]">{mcp.name}</span>
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge color="blue">
                {mcp.transport === 'stdio' ? '本地命令' : '远程服务'}
              </Badge>
              <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-[#737373] text-xs font-medium rounded-full">
                v{mcp.version}
              </span>
              <span className="text-xs text-[#A3A3A3]">
                创建于 {mcp.createdAt.toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <Tooltip delayDuration={1000}>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="claw-outline"
                    size="claw"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={hasInProgress}
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </Button>
                </span>
              </TooltipTrigger>
              {hasInProgress && (
                <TooltipContent>有下发任务进行中</TooltipContent>
              )}
            </Tooltip>
            <Button
              variant="claw-primary"
              size="claw"
              onClick={() => setDistributeDialogOpen(true)}
              disabled={hasInProgress}
            >
              {hasInProgress ? '下发中...' : '批量下发'}
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {mcp.description && (
          <p className="text-sm text-[#737373] mt-3">{mcp.description}</p>
        )}
      </div>

      {/* ======== 横向 Segmented Tab（灰底 Tag 样式，与技能详情页一致）======== */}
      <div>
        <div
          className="inline-flex items-center gap-1 p-1 rounded-[4px]"
          style={{ background: "#F5F5F5" }}
          role="tablist"
          aria-label="MCP 详情 Tab 切换"
        >
          {[
            { id: "files", label: "文件列表" },
            { id: "distribution", label: "下发记录" },
          ].map((t) => {
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 text-sm rounded-[3px] transition-all duration-150 ${
                  active
                    ? "bg-white text-[#0A0A0A] font-medium"
                    : "text-[#737373] hover:text-[#0A0A0A] font-normal"
                }`}
                style={active ? { boxShadow: "var(--shadow-segment)" } : undefined}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 区域 */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* 隐藏原始 TabsList，使用上方自定义 Segmented */}
          <TabsList className="hidden">
            <TabsTrigger value="files">文件列表</TabsTrigger>
            <TabsTrigger value="distribution">下发记录</TabsTrigger>
          </TabsList>

          {/* 文件列表 Tab — 三栏布局 */}
          <TabsContent value="files" className="mt-0 p-0">
            <div className="flex h-[47rem] border border-[#e5e5e5] rounded-xl overflow-hidden bg-white">
              {/* 左列：版本列表 */}
              <div className="w-[14%] min-w-[120px] border-r border-[#e5e5e5] flex flex-col">
                <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center">
                  <p className="text-sm font-medium text-[#09090b]">版本</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {versions.map((ver: string, idx: number) => {
                    const isLatest = idx === 0;
                    const isSelected = selectedVersion === ver;
                    // 模拟版本日期（从最新往前推，每个版本间隔 15 天）
                    const baseDate = mcp.updatedAt || mcp.createdAt;
                    const versionDate = new Date(baseDate);
                    versionDate.setDate(versionDate.getDate() - idx * 15);
                    const dateStr = `${versionDate.getFullYear()}-${String(versionDate.getMonth() + 1).padStart(2, '0')}-${String(versionDate.getDate()).padStart(2, '0')}`;
                    return (
                      <button
                        key={ver}
                        onClick={() => setSelectedVersion(ver)}
                        className={`w-full text-left px-3 py-3.5 border-b border-[#f4f4f5] transition-colors ${
                          isSelected ? 'bg-[#f4f4f5]' : 'hover:bg-[#f4f4f5] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-semibold text-[#09090b]">
                            {ver}
                          </span>
                          {isLatest && (
                            <span className="inline-flex h-[18px] items-center justify-center rounded-[2px] border border-[#1447E6] px-1 text-[10px] font-semibold leading-none tracking-[0.015em] text-[#355EF1]">
                              New
                            </span>
                          )}
                          <span className="text-[12px] text-[#a1a1aa]">{dateStr}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 中列：文件列表 */}
              <div className="w-[22%] min-w-[160px] border-r border-[#e5e5e5] flex flex-col">
                <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center">
                  <p className="text-sm font-medium text-[#09090b]">{selectedVersion || mcp.version}</p>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2">
                  {MCP_FILES.map((file) => {
                    const isActive = selectedFile === file.name;
                    return (
                      <button
                        key={file.name}
                        onClick={() => {
                          setSelectedFile(file.name);
                          setFileViewMode(isMarkdownFile(file.name) ? 'preview' : 'source');
                        }}
                        className={`w-full flex items-center gap-1.5 h-8 px-2 text-sm rounded-[4px] transition-colors ${
                          isActive
                            ? 'bg-[#f4f4f5] text-[#09090b] font-medium'
                            : 'hover:bg-[#f4f4f5] text-[#09090b] cursor-pointer'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" />
                        <span className="truncate">{file.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 右列：内容展示 */}
              <div className="flex-1 flex flex-col bg-white">
                {renderFileContent()}
              </div>
            </div>
          </TabsContent>

          {/* 下发记录 Tab */}
          <TabsContent value="distribution" className="mt-0 p-0">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#0A0A0A]">下发记录</h3>
                  <Button
                    variant="claw-primary"
                    size="claw-sm"
                    onClick={() => setDistributeDialogOpen(true)}
                    disabled={hasInProgress}
                  >
                    {hasInProgress ? '下发中...' : '批量下发'}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {distributionRecords.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-[#737373]">还没有下发记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {distributionRecords.map((record, idx) => {
                      const progress = record.totalCount > 0 ? Math.round((record.successCount / record.totalCount) * 100) : 0;
                      return (
                        <div key={record.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-semibold text-[#0A0A0A]">
                                #{idx + 1} · {new Date(record.timestamp).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                                record.status === 'distributing' ? 'bg-blue-50 text-[#355EF1]' :
                                record.successCount === record.totalCount ? 'bg-green-50 text-green-700' :
                                'bg-yellow-50 text-yellow-700'
                              }`}>
                                {record.status === 'distributing'
                                  ? `下发中 ${progress}%`
                                  : `下发完成，${record.successCount}个下发成功，${record.failedCount}个失败`}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setActiveDistributionId(record.id);
                                  setStatusFilter('all');
                                  setDetailSearchQuery('');
                                  setDetailsOpen(true);
                                }}
                                className="text-[#355EF1] hover:text-[#355EF1] h-auto py-1 px-2"
                              >
                                查看详情
                              </Button>
                            </div>
                          </div>
                          {record.status === 'distributing' && (
                            <div className="mb-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
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
        skillName={mcp.displayName || mcp.name}
        onDistributionStart={handleDistributionStart}
        title="批量下发 MCP 配置"
        showScopeFilter={false}
        instances={MOCK_OPENCLAW_INSTANCES}
        hideCreatorAndGroup
        singleStatusFilter
        showVersionFilter
        showConfirmDialog
        descriptionNode={
          <>
            将 <span className="font-semibold">「{mcp.displayName || mcp.name}」</span> 部署至所选实例。
            <br />
            筛选限制：仅限智能体类型为 <span className="font-medium">OpenClaw</span> 且状态为{' '}
            <span className="font-medium">运行中</span> 的实例；同时，该实例的下发状态须为{' '}
            <span className="font-medium">未下发</span> 或 <span className="font-medium">下发失败</span>。
            <br />
            默认只下发至 <span className="font-medium">26.3.28 版本后</span>的实例（旧版本不支持 MCP 服务）。
          </>
        }
      />

      {/* 删除确认对话框 */}
      <DeleteSkillDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        skillName={mcp.displayName || mcp.name}
        onConfirm={handleMCPDelete}
      />

      {/* 下发详情对话框 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>下发详情</DialogTitle>
          </DialogHeader>
          {activeDistribution && (
            <div className="space-y-4 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                  <Input
                    placeholder="搜索实例名称/ID..."
                    value={detailSearchQuery}
                    onChange={(e) => setDetailSearchQuery(e.target.value)}
                    className="pl-10 h-9 focus-visible:ring-0 focus-visible:border-blue-400"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                    <SelectItem value="distributing">下发中</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-y-auto max-h-64">
                <Table>
                  <TableHeader className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <TableRow>
                      <TableHead className="text-left">实例名称</TableHead>
                      <TableHead className="text-left">实例ID</TableHead>
                      <TableHead className="text-left">状态</TableHead>
                      <TableHead className="text-left">失败原因</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[#737373]">
                          没有符合条件的记录
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInstances.map((instance) => (
                        <TableRow key={instance.id}>
                          <TableCell className="text-[#0A0A0A]">{instance.name}</TableCell>
                          <TableCell className="text-[#737373] font-mono text-xs">{instance.id}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                              DISTRIBUTION_STATUS_MAP[instance.distributionStatus]?.color || 'bg-gray-50 text-[#737373]'
                            }`}>
                              {DISTRIBUTION_STATUS_MAP[instance.distributionStatus]?.label || '未下发'}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-[#737373] max-w-[200px]">
                            {(instance as any).failReason
                              ? <span>{(instance as any).failReason}</span>
                              : <span className="text-[#A3A3A3]">-</span>
                            }
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
