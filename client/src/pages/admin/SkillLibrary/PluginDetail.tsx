'use client';
import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText, Search, Code, Eye, Trash2, Info, Loader, Send } from 'lucide-react';
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
import { type DistributionStatus, DISTRIBUTION_STATUS_MAP } from './types';
import { MOCK_OPENCLAW_INSTANCES } from './mockData';
import {
  getDistributionRecords,
  addDistributionRecord,
  updateDistributionRecord,
  createDistributionRecordId,
  type CachedDistributionRecord,
} from './distributionCache';
import { type Plugin } from './PluginUploadDialog';

// 懒加载 react-syntax-highlighter
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(mod => ({ default: mod.Light as any }))
);
const loadedLanguages = new Set<string>();
const registerLanguage = async (lang: string) => {
  if (loadedLanguages.has(lang)) return;
  loadedLanguages.add(lang);
  try {
    const mod = await import('react-syntax-highlighter');
    const Light = mod.Light as any;
    const langModules: Record<string, () => Promise<any>> = {
      xml: () => import('react-syntax-highlighter/dist/esm/languages/hljs/xml'),
      json: () => import('react-syntax-highlighter/dist/esm/languages/hljs/json'),
      yaml: () => import('react-syntax-highlighter/dist/esm/languages/hljs/yaml'),
      python: () => import('react-syntax-highlighter/dist/esm/languages/hljs/python'),
      javascript: () => import('react-syntax-highlighter/dist/esm/languages/hljs/javascript'),
      typescript: () => import('react-syntax-highlighter/dist/esm/languages/hljs/typescript'),
      bash: () => import('react-syntax-highlighter/dist/esm/languages/hljs/bash'),
      css: () => import('react-syntax-highlighter/dist/esm/languages/hljs/css'),
      ini: () => import('react-syntax-highlighter/dist/esm/languages/hljs/ini'),
      markdown: () => import('react-syntax-highlighter/dist/esm/languages/hljs/markdown'),
    };
    const loader = langModules[lang];
    if (loader) {
      const langMod = await loader();
      Light.registerLanguage(lang, langMod.default);
    }
  } catch { /* 静默降级 */ }
};

const hljsStyle: Record<string, React.CSSProperties> = {
  'hljs': { display: 'block', overflowX: 'auto', padding: '1em', background: '#ffffff', color: '#383a42' },
  'hljs-comment': { color: '#a0a1a7', fontStyle: 'italic' },
  'hljs-quote': { color: '#a0a1a7', fontStyle: 'italic' },
  'hljs-keyword': { color: '#a626a4' },
  'hljs-selector-tag': { color: '#a626a4' },
  'hljs-addition': { color: '#50a14f' },
  'hljs-number': { color: '#986801' },
  'hljs-string': { color: '#50a14f' },
  'hljs-meta': { color: '#4078f2' },
  'hljs-literal': { color: '#0184bb' },
  'hljs-doctag': { color: '#a626a4' },
  'hljs-regexp': { color: '#50a14f' },
  'hljs-attr': { color: '#986801' },
  'hljs-attribute': { color: '#50a14f' },
  'hljs-builtin-name': { color: '#e45649' },
  'hljs-name': { color: '#e45649' },
  'hljs-section': { color: '#e45649' },
  'hljs-tag': { color: '#e45649' },
  'hljs-variable': { color: '#e45649' },
  'hljs-template-variable': { color: '#e45649' },
  'hljs-selector-id': { color: '#e45649' },
  'hljs-title': { color: '#4078f2' },
  'hljs-type': { color: '#4078f2' },
  'hljs-symbol': { color: '#4078f2' },
  'hljs-bullet': { color: '#4078f2' },
  'hljs-link': { color: '#4078f2' },
  'hljs-deletion': { color: '#e45649' },
  'hljs-emphasis': { fontStyle: 'italic' },
  'hljs-strong': { fontWeight: 'bold' },
};

interface PluginDetailProps {
  plugin: Plugin;
  onBack: () => void;
  onPluginDelete?: (pluginId: string) => void;
}

const VIEWABLE_EXTENSIONS = ['.md', '.mdx', '.xml', '.json', '.txt', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.sh', '.bat', '.py', '.js', '.ts', '.css', '.html', '.htm', '.svg', '.env', '.gitignore', '.dockerfile'];

const isViewableFile = (name: string) => {
  const lower = name.toLowerCase();
  if (!lower.includes('.') && !lower.includes('/')) return true;
  return VIEWABLE_EXTENSIONS.some(ext => lower.endsWith(ext));
};

const isMarkdownFile = (name: string) => {
  const lower = name.toLowerCase();
  return lower.endsWith('.md') || lower.endsWith('.mdx');
};

const getFileLanguage = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml',
    toml: 'toml', py: 'python', js: 'javascript', ts: 'typescript',
    css: 'css', html: 'html', htm: 'html', sh: 'bash', bat: 'batch',
    svg: 'xml', ini: 'ini', cfg: 'ini', conf: 'ini',
  };
  return langMap[ext] || 'text';
};

export default function PluginDetail({ plugin, onBack, onPluginDelete }: PluginDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('files');
  const [selectedVersion, setSelectedVersion] = useState<string>(plugin.versions?.[0] || plugin.version);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [fileViewMode, setFileViewMode] = useState<'preview' | 'source'>('source');

  // 下发记录
  const [distributionRecords, setDistributionRecords] = useState<CachedDistributionRecord[]>([]);
  const [activeDistributionId, setActiveDistributionId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | DistributionStatus>('all');
  const [detailSearchQuery, setDetailSearchQuery] = useState('');

  const refreshRecords = useCallback(() => {
    setDistributionRecords(getDistributionRecords(plugin.id));
  }, [plugin.id]);

  useEffect(() => {
    refreshRecords();
    const handler = () => refreshRecords();
    window.addEventListener('distribution-cache-updated', handler);
    return () => window.removeEventListener('distribution-cache-updated', handler);
  }, [refreshRecords]);

  const hasInProgress = distributionRecords.some(r => r.status === 'distributing');

  // 文件列表处理
  const currentFiles = useMemo(() => plugin.files || [], [plugin.files]);

  // 剥离唯一顶层文件夹
  const { processedFiles, strippedPrefix } = useMemo(() => {
    if (currentFiles.length === 0) return { processedFiles: currentFiles, strippedPrefix: '' };
    const topDirs = new Set<string>();
    let topFileCount = 0;
    for (const f of currentFiles) {
      const parts = f.name.split('/');
      if (parts.length > 1) {
        topDirs.add(parts[0]);
      } else {
        topFileCount++;
      }
    }
    if (topDirs.size === 1 && topFileCount === 0) {
      const prefix = [...topDirs][0] + '/';
      return {
        processedFiles: currentFiles.map(f => ({ ...f, name: f.name.slice(prefix.length) })),
        strippedPrefix: prefix,
      };
    }
    return { processedFiles: currentFiles, strippedPrefix: '' };
  }, [currentFiles]);

  // 默认选中 agent.plugin.json
  useEffect(() => {
    if (processedFiles.length > 0) {
      const pluginJson = processedFiles.find(f => f.name.endsWith('openclaw.plugin.json'));
      if (pluginJson) {
        setExpandedFile(pluginJson.name);
        setFileViewMode('source');
      } else {
        const first = processedFiles.find(f => !f.name.endsWith('/') && isViewableFile(f.name));
        if (first) {
          setExpandedFile(first.name);
          setFileViewMode(isMarkdownFile(first.name) ? 'preview' : 'source');
        }
      }
    }
  }, [processedFiles]);

  // 初始化展开顶层文件夹
  useEffect(() => {
    if (processedFiles.length) {
      const dirs = new Set<string>();
      for (const file of processedFiles) {
        const parts = file.name.split('/');
        if (parts.length > 1) {
          dirs.add(parts[0]);
        }
      }
      setExpandedDirs(dirs);
    }
  }, [processedFiles]);

  const toggleDir = (dirName: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(dirName)) next.delete(dirName);
      else next.add(dirName);
      return next;
    });
  };

  const renderFileTree = (files: Array<{ name: string; size: number; content?: string }>) => {
    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
    const renderedDirs = new Set<string>();
    const result: React.ReactNode[] = [];

    for (const file of sorted) {
      const parts = file.name.split('/');
      const isDir = file.name.endsWith('/');
      const isNested = parts.length > 1 && !isDir;
      const canView = !isDir && isViewableFile(file.name);

      if (isNested) {
        for (let i = 1; i < parts.length; i++) {
          const dirPath = parts.slice(0, i).join('/');
          if (!renderedDirs.has(dirPath)) {
            renderedDirs.add(dirPath);
            const depth = i - 1;
            const isExpanded = expandedDirs.has(dirPath);
            let ancestorsExpanded = true;
            for (let j = 1; j < i; j++) {
              if (!expandedDirs.has(parts.slice(0, j).join('/'))) {
                ancestorsExpanded = false;
                break;
              }
            }
            if (!ancestorsExpanded) continue;
            result.push(
              <button
                key={`dir-${dirPath}`}
                onClick={() => toggleDir(dirPath)}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-[#737373] hover:bg-gray-50 rounded transition-colors cursor-pointer"
                style={{ paddingLeft: `${8 + depth * 16}px` }}
              >
                {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" />}
                <span className="truncate font-medium">{parts[i - 1]}</span>
                {isExpanded
                  ? <ChevronDown className="w-3 h-3 ml-auto text-[#A3A3A3] flex-shrink-0" />
                  : <ChevronRight className="w-3 h-3 ml-auto text-[#A3A3A3] flex-shrink-0" />
                }
              </button>
            );
          }
        }
        let allParentsExpanded = true;
        for (let i = 1; i < parts.length; i++) {
          if (!expandedDirs.has(parts.slice(0, i).join('/'))) {
            allParentsExpanded = false;
            break;
          }
        }
        if (!allParentsExpanded) continue;
      }

      if (isDir) continue;

      const depth = parts.length - 1;
      result.push(
        <button
          key={file.name}
          onClick={() => {
            if (canView) {
              setExpandedFile(expandedFile === file.name ? null : file.name);
              setFileViewMode(isMarkdownFile(file.name) ? 'preview' : 'source');
            }
          }}
          disabled={!canView}
          className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
            expandedFile === file.name
              ? 'bg-blue-50 text-[#355EF1]'
              : canView
              ? 'hover:bg-gray-50 text-[#737373] cursor-pointer'
              : 'text-[#737373] cursor-not-allowed opacity-60'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <FileText className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" />
          <span className="truncate">{parts[parts.length - 1]}</span>
        </button>
      );
    }
    return result;
  };

  const getFileContent = (fileName: string): string => {
    const originalName = strippedPrefix ? strippedPrefix + fileName : fileName;
    const file = currentFiles.find(f => f.name === originalName);
    if (file?.content) return file.content;
    const file2 = currentFiles.find(f => f.name === fileName);
    if (file2?.content) return file2.content;
    return '';
  };

  // 下发逻辑
  const handleDistributionStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId: plugin.id,
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

  const handlePluginDelete = () => {
    if (onPluginDelete) {
      onPluginDelete(plugin.id);
    }
    toast.success(`插件「${plugin.name}」已删除`);
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

  return (
    <div className="space-y-4">
      {/* 返回按钮 */}
      <BackButton onClick={onBack}>返回列表</BackButton>

      {/* 基础信息卡片 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#0A0A0A] mb-1">{plugin.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-[#737373]">slug: {plugin.slug}</p>
              <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-[#737373] text-xs font-medium rounded-full">
                v{plugin.version}
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
        {plugin.description && (
          <p className="text-sm text-[#737373] mt-3">{plugin.description}</p>
        )}
      </div>

      {/* ======== 横向 Segmented Tab（灰底 Tag 样式，与技能详情页一致）======== */}
      <div>
        <div
          className="inline-flex items-center gap-1 p-1 rounded-[4px]"
          style={{ background: "#F5F5F5" }}
          role="tablist"
          aria-label="插件详情 Tab 切换"
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

          {/* 文件列表 Tab */}
          <TabsContent value="files" className="mt-0 p-0">
            <div className="flex h-[47rem] border border-[#e5e5e5] rounded-xl overflow-hidden bg-white">
              {/* 左列：版本号选择 */}
              <div className="w-[14%] min-w-[120px] border-r border-[#e5e5e5] flex flex-col">
                <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center">
                  <p className="text-sm font-medium text-[#09090b]">版本</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {plugin.versions?.map((ver: string, idx: number) => {
                    const isLatest = idx === 0;
                    const isSelected = selectedVersion === ver;
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
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 中列：文件列表 */}
              <div className="w-[22%] min-w-[160px] border-r border-[#e5e5e5] flex flex-col">
                <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center">
                  <p className="text-sm font-medium text-[#09090b]">{selectedVersion || plugin.version}</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {renderFileTree(processedFiles)}
                </div>
              </div>

              {/* 右列：文件详情 */}
              <div className="flex-1 flex flex-col bg-white">
                {expandedFile ? (
                  <>
                    <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center justify-between">
                      <p className="text-sm font-medium text-[#09090b]">{expandedFile}</p>
                      {isMarkdownFile(expandedFile) && (
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
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {(() => {
                        const content = getFileContent(expandedFile);
                        if (!content) {
                          return (
                            <div className="flex items-center justify-center h-full text-[#A3A3A3]">
                              <p className="text-sm">文件内容暂无</p>
                            </div>
                          );
                        }
                        // 非 md 文件直接显示源码，不提供预览模式
                        if (!isMarkdownFile(expandedFile) || fileViewMode === 'source') {
                          const lang = getFileLanguage(expandedFile);
                          registerLanguage(lang);
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
                        }
                        // md 文件预览模式
                        return (
                          <div className="p-4">
                            <MDXRenderer content={content} />
                          </div>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#737373]">
                    <p className="text-sm">选择一个文件查看内容</p>
                  </div>
                )}
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
                                #{idx + 1} · v{plugin.version} {new Date(record.timestamp).toLocaleString('zh-CN')}
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
        skillName={plugin.name}
        skillVersion={plugin.version}
        onDistributionStart={handleDistributionStart}
        title="批量下发插件"
        showScopeFilter={false}
        instances={MOCK_OPENCLAW_INSTANCES}
      />

      {/* 删除确认对话框 */}
      <DeleteSkillDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        skillName={plugin.name}
        onConfirm={handlePluginDelete}
      />

      {/* 下发详情对话框 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>下发详情</DialogTitle>
          </DialogHeader>
          {activeDistribution && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                  <Input
                    placeholder="搜索实例名称/ID..."
                    value={detailSearchQuery}
                    onChange={(e) => setDetailSearchQuery(e.target.value)}
                    className="pl-10 h-9"
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
                      <TableHead className="text-left min-w-[140px]">实例ID</TableHead>
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
                          <TableCell className="text-[#737373] font-mono whitespace-nowrap">{instance.id}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              DISTRIBUTION_STATUS_MAP[instance.distributionStatus]?.color || 'bg-gray-50 text-[#737373]'
                            }`}>
                              {DISTRIBUTION_STATUS_MAP[instance.distributionStatus]?.label || '未下发'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-[#737373]">
                            {(instance as any).failReason || '-'}
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
