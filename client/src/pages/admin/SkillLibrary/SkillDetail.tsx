'use client';
import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText, Search, Code, Eye, Pencil, Trash2, Download, Info, Loader, ShieldCheck, ShieldAlert, ShieldX, ExternalLink, ScanSearch, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { StatusTag } from '@/components/ui/status-tag';
import { Badge } from '@/components/ui/badge';
import { MOCK_SKILLS, DEFAULT_CATEGORIES, MOCK_GROUPS, MOCK_OPENCLAW_INSTANCES } from './mockData';
import BatchDistributeDialog from './BatchDistributeDialog';
import SkillUpdateDialog from './SkillUpdateDialog';
import DeleteSkillDialog from './DeleteSkillDialog';
import MDXRenderer from '@/components/MDXRenderer';
import { Input } from '@/components/ui/input';
import { SurfaceCard } from '@/components/ui/Surface';
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

import { type Skill, type DistributionStatus, DISTRIBUTION_STATUS_MAP, SECURITY_STATUS_MAP, type SecurityStatus } from './types';
import {
  getDistributionRecords,
  addDistributionRecord,
  updateDistributionRecord,
  createDistributionRecordId,
  type CachedDistributionRecord,
} from './distributionCache';
import { downloadSkillAsZip } from './downloadUtils';

// 懒加载 react-syntax-highlighter 减少首屏包体积
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

// localStorage 缓存 key（与 SkillListTab 保持一致）
const SKILLS_CACHE_KEY = 'skillhub_enterprise_skills_cache';

interface SkillDetailProps {
  skillId: string;
  onBack: () => void;
  skills?: any[];
  defaultTab?: string;
  onSkillUpdate?: (updatedSkill: Skill) => void;
  onSkillDelete?: (skillId: string) => void;
}

// hljs 亮色主题样式
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

export default function SkillDetail({ skillId, onBack, skills, defaultTab, onSkillUpdate, onSkillDelete }: SkillDetailProps) {
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>('SKILL.md');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [activeDistributionId, setActiveDistributionId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | DistributionStatus>('all');
  const [detailSearchQuery, setDetailSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [fileViewMode, setFileViewMode] = useState<'preview' | 'source'>('preview');

  const [securityScanDialogOpen, setSecurityScanDialogOpen] = useState(false);
  const skillsArray = skills || MOCK_SKILLS;

  // 从缓存读取下发记录
  const [distributionRecords, setDistributionRecords] = useState<CachedDistributionRecord[]>([]);

  const refreshRecords = useCallback(() => {
    setDistributionRecords(getDistributionRecords(skillId));
  }, [skillId]);

  // 首次加载 + 监听缓存更新
  useEffect(() => {
    refreshRecords();
    const handler = () => refreshRecords();
    window.addEventListener('distribution-cache-updated', handler);
    return () => window.removeEventListener('distribution-cache-updated', handler);
  }, [refreshRecords]);

  // 是否有进行中的下发任务
  const hasInProgress = distributionRecords.some(r => r.status === 'distributing');
  
  // 先从 props 传入的 skills 中查找，找不到再从 localStorage 缓存中查找
  const skill = useMemo(() => {
    let found = skillsArray.find((s: any) => s.id === skillId);
    if (!found) {
      try {
        const cached = localStorage.getItem(SKILLS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const cachedSkill = parsed.find((s: any) => s.id === skillId);
          if (cachedSkill) {
            found = {
              ...cachedSkill,
              uploadTime: new Date(cachedSkill.uploadTime),
              lastDistributionTime: cachedSkill.lastDistributionTime ? new Date(cachedSkill.lastDistributionTime) : undefined,
            };
          }
        }
      } catch (e) {
        console.warn('从缓存加载 skill 失败:', e);
      }
    }
    return found;
  }, [skillId, skillsArray]);
  
  useEffect(() => {
    if (skill?.versions && skill.versions.length > 0 && !selectedVersion) {
      setSelectedVersion(skill.versions[0]);
    }
  }, [skill?.versions, selectedVersion]);
  
  // 版本切换时重置文件展开状态
  useEffect(() => {
    if (selectedVersion) {
      setExpandedFile('SKILL.md');
      setExpandedDirs(new Set());
    }
  }, [selectedVersion]);

  // 根据选中版本获取文件列表（如选中的是非最新版本，则从 versionHistory 中取）
  const currentVersionFiles = useMemo(() => {
    if (!skill) return [];
    // 如果选中的版本是最新版本（versions[0]）或者没有选中版本，使用 skill.files
    if (!selectedVersion || selectedVersion === skill.versions?.[0]) {
      return skill.files || [];
    }
    // 从 versionHistory 中查找对应版本的文件列表
    const versionRecord = skill.versionHistory?.find(v => v.version === selectedVersion);
    if (versionRecord?.files && versionRecord.files.length > 0) {
      return versionRecord.files;
    }
    // 如果历史版本没有文件记录，回退到当前文件
    return skill.files || [];
  }, [skill, selectedVersion]);

  // 剥离唯一顶层文件夹：如果所有文件都在同一个顶层目录下，则去掉该前缀
  const { processedFiles, strippedPrefix } = useMemo(() => {
    const rawFiles = currentVersionFiles;
    if (rawFiles.length === 0) return { processedFiles: rawFiles, strippedPrefix: '' };
    
    const topDirs = new Set<string>();
    let topFileCount = 0;
    for (const f of rawFiles) {
      const parts = f.name.split('/');
      if (parts.length > 1) {
        topDirs.add(parts[0]);
      } else {
        topFileCount++;
      }
    }
    // 所有文件都在同一个顶层目录下，且没有顶层文件
    if (topDirs.size === 1 && topFileCount === 0) {
      const prefix = [...topDirs][0] + '/';
      return {
        processedFiles: rawFiles.map(f => ({ ...f, name: f.name.slice(prefix.length) })),
        strippedPrefix: prefix,
      };
    }
    return { processedFiles: rawFiles, strippedPrefix: '' };
  }, [currentVersionFiles]);

  // 可展示的文件扩展名（文本类文件）
  const VIEWABLE_EXTENSIONS = ['.md', '.xml', '.json', '.txt', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.sh', '.bat', '.py', '.js', '.ts', '.css', '.html', '.htm', '.svg', '.env', '.gitignore', '.dockerfile'];
  
  const isViewableFile = (name: string) => {
    const lower = name.toLowerCase();
    // 没有扩展名的特殊文件也可以查看（如 Dockerfile, Makefile 等）
    if (!lower.includes('.') && !lower.includes('/')) return true;
    return VIEWABLE_EXTENSIONS.some(ext => lower.endsWith(ext));
  };

  const toggleDir = (dirName: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(dirName)) {
        next.delete(dirName);
      } else {
        next.add(dirName);
      }
      return next;
    });
  };

  // 初始化时仅展开顶层文件夹（与公共技能库一致）
  useEffect(() => {
    if (processedFiles.length) {
      const dirs = new Set<string>();
      for (const file of processedFiles) {
        const parts = file.name.split('/');
        if (parts.length > 1) {
          // 仅展开第一层目录
          dirs.add(parts[0]);
        }
      }
      setExpandedDirs(dirs);
    }
  }, [processedFiles]);

  const renderFileTree = (files: Array<{ name: string; size?: number; content?: string }>) => {
    // 按路径排序，同一文件夹的文件聚在一起
    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
    
    // 收集所有文件夹及其层级
    const renderedDirs = new Set<string>();
    const result: React.ReactNode[] = [];
    
    for (const file of sorted) {
      const parts = file.name.split('/');
      const isDir = file.name.endsWith('/');
      const isNested = parts.length > 1 && !isDir;
      const canView = !isDir && isViewableFile(file.name);
      
      // 如果是子目录下的文件，先渲染各层目录头
      if (isNested) {
        for (let i = 1; i < parts.length; i++) {
          const dirPath = parts.slice(0, i).join('/');
          if (!renderedDirs.has(dirPath)) {
            renderedDirs.add(dirPath);
            const depth = i - 1;
            const isExpanded = expandedDirs.has(dirPath);
            
            // 检查该目录的所有祖先是否展开，未展开则不渲染
            let ancestorsExpanded = true;
            for (let j = 1; j < i; j++) {
              const ancestor = parts.slice(0, j).join('/');
              if (!expandedDirs.has(ancestor)) {
                ancestorsExpanded = false;
                break;
              }
            }
            if (!ancestorsExpanded) continue;
            
            result.push(
              <button
                key={`dir-${dirPath}`}
                onClick={() => toggleDir(dirPath)}
                className="w-full flex items-center gap-1.5 h-8 px-2 text-sm text-[#09090b] hover:bg-[#f4f4f5] rounded-[4px] transition-colors cursor-pointer"
                style={{ paddingLeft: `${8 + depth * 16}px` }}
              >
                {isExpanded
                  ? <ChevronDown className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" />
                  : <ChevronRight className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" />
                }
                {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" />}
                <span className="truncate font-medium">{parts[i - 1]}</span>
              </button>
            );
          }
        }
        
        // 检查父目录是否全部展开，否则隐藏该文件
        const parentDir = parts.slice(0, -1).join('/');
        let allParentsExpanded = true;
        for (let i = 1; i < parts.length; i++) {
          const ancestor = parts.slice(0, i).join('/');
          if (!expandedDirs.has(ancestor)) {
            allParentsExpanded = false;
            break;
          }
        }
        if (!allParentsExpanded) continue;
      }
      
      // 跳过纯目录条目
      if (isDir) continue;
      
      const depth = parts.length - 1;
      result.push(
        <button
          key={file.name}
          onClick={() => canView && setExpandedFile(expandedFile === file.name ? null : file.name)}
          disabled={!canView}
          className={`w-full flex items-center gap-1.5 h-8 px-2 text-sm rounded-[4px] transition-colors ${
            expandedFile === file.name
              ? 'bg-[#f4f4f5] text-[#09090b] font-medium'
              : canView
              ? 'hover:bg-[#f4f4f5] text-[#09090b] cursor-pointer'
              : 'text-[#a1a1aa] cursor-not-allowed opacity-60'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <FileText className="w-3.5 h-3.5 text-[#71717a] flex-shrink-0" />
          <span className="truncate">{parts[parts.length - 1]}</span>
        </button>
      );
    }
    
    return result;
  };
  
  // 递归在文件树中查找文件（支持 children 嵌套结构和 path 匹配）
  const findFileInTree = (files: any[], targetName: string): any => {
    for (const f of files) {
      // 同时匹配 name 和 path
      if (f.name === targetName || f.path === targetName) return f;
      if (f.children && f.children.length > 0) {
        const found = findFileInTree(f.children, targetName);
        if (found) return found;
      }
    }
    return null;
  };

  const getFileContent = (fileName: string): string => {
    // 使用当前选中版本的文件列表（而不是始终用最新版本的 skill.files）
    const versionFiles = currentVersionFiles;

    // 对 SKILL.md，也优先从当前版本的文件列表中取
    if (fileName === 'SKILL.md' || fileName.toLowerCase() === 'skill.md') {
      const skillMdFile = versionFiles.find(f => f.name.toLowerCase() === 'skill.md' || f.name.toLowerCase().endsWith('/skill.md'));
      if (skillMdFile?.content) return skillMdFile.content;
      // 如果当前版本是最新版本，回退到 skill.content
      if (!selectedVersion || selectedVersion === skill?.versions?.[0]) {
        return skill?.content || '';
      }
      return '';
    }
    // 如果剥离了顶层文件夹，查找时还原为原始路径
    const originalName = strippedPrefix ? strippedPrefix + fileName : fileName;
    const file = findFileInTree(versionFiles, originalName);
    if (file?.content) return file.content;
    // 也尝试直接用处理后的路径查找
    const file2 = findFileInTree(versionFiles, fileName);
    if (file2?.content) return file2.content;
    return '';
  };

  // 判断文件是否为 Markdown
  const isMarkdownFile = (name: string) => {
    const lower = name.toLowerCase();
    return lower.endsWith('.md') || lower.endsWith('.mdx');
  };

  // 获取文件对应的语法高亮语言
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
  
  const handleDistributionStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    // 创建新的分发记录并写入缓存
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId,
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
    
    // 模拟下发进度
    simulateDistribution(recordId, selectedInstanceIds.length);
  };
  
  const simulateDistribution = (recordId: string, totalCount: number) => {
    let completed = 0;
    const interval = setInterval(() => {
      completed += Math.floor(Math.random() * 3) + 1;
      if (completed >= totalCount) {
        completed = totalCount;
        clearInterval(interval);
        
        // 模拟随机失败一些实例
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
        // 更新进度
        updateDistributionRecord(recordId, (record) => ({
          ...record,
          successCount: completed,
          inProgressCount: totalCount - completed,
        }));
      }
    }, 800);
  };
  
  const handleRetry = (recordId: string) => {
    const record = distributionRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const failedInstances = record.instances.filter(inst => inst.distributionStatus === 'failed');
    
    // 重置失败的实例状态
    updateDistributionRecord(recordId, (r) => ({
      ...r,
      status: 'distributing' as DistributionStatus,
      inProgressCount: failedInstances.length,
      instances: r.instances.map(inst => ({
        ...inst,
        distributionStatus: (inst.distributionStatus === 'failed' ? 'distributing' : inst.distributionStatus) as DistributionStatus,
      })),
    }));
    
    simulateDistribution(recordId, failedInstances.length);
  };

  // 下载 Skill
  const handleDownload = async () => {
    if (!skill) return;
    setIsDownloading(true);
    try {
      await downloadSkillAsZip(skill);
      toast.success(`「${skill.name}」下载完成`);
    } catch {
      toast.error('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  // 提交安全检测（只更新状态为 scanning，由父组件 SkillListTab 的 useEffect 统一管理自动完成）
  const handleSecurityScan = () => {
    if (!skill) return;
    setSecurityScanDialogOpen(false);
    toast.success('已提交安全检测，预计 5 分钟后完成');

    // 立即变为 scanning，通过 onSkillUpdate 同步给父组件
    const updatedSkill: Skill = {
      ...skill,
      securityInfo: {
        overallStatus: 'scanning',
        engines: [],
      },
    };
    if (onSkillUpdate) onSkillUpdate(updatedSkill);
  };

  // 更新 Skill 回调
  const handleSkillUpdate = (updatedSkill: Skill) => {
    if (onSkillUpdate) {
      onSkillUpdate(updatedSkill);
    }
    // 重置版本选择，让 useEffect 自动选中最新版本
    setSelectedVersion('');
    setUpdateDialogOpen(false);
  };

  // 删除 Skill 回调
  const handleSkillDelete = () => {
    if (!skill) return;
    if (onSkillDelete) {
      onSkillDelete(skill.id);
    }
    toast.success(`Skill「${skill.name}」已删除`);
    setDeleteDialogOpen(false);
    onBack();
  };

  if (!skill) {
    return (
      <div className="text-center py-12">
        <p className="text-[#737373]">技能未找到</p>
        <Button onClick={onBack} className="mt-4">返回列表</Button>
      </div>
    );
  }

  const getCategoryName = (catId: string) => {
    return DEFAULT_CATEGORIES.find((cat: any) => cat.id === catId)?.name || catId;
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
      {/* ======== Header（参照 MCPDetail / PluginDetail 卡片风格）======== */}
      <header className="flex flex-col gap-4">
        {/* 返回按钮 — 卡片外，单独成行 */}
        <BackButton onClick={onBack} className="self-start">返回上级</BackButton>

        {/* 基础信息卡片 — bg + 圆角 + 边框 + p-6 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1
                className="text-[26px] font-semibold leading-8"
                style={{ color: "#0A0A0A", letterSpacing: "-0.0385em" }}
              >
                {skill.name}
              </h1>
              {/* 安全状态徽标 */}
              {(() => {
                const secStatus = skill.securityInfo?.overallStatus || 'not_scanned';
                const statusInfo = SECURITY_STATUS_MAP[secStatus];
                if (secStatus === 'not_scanned') {
                  return (
                    <span className="inline-flex items-center gap-1.5">
                      <StatusTag mode="fill" variant="gray">未检测</StatusTag>
                      <button
                        onClick={() => setSecurityScanDialogOpen(true)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-[#355EF1] bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                      >
                        <ScanSearch className="w-3 h-3" />
                        检测
                      </button>
                    </span>
                  );
                }
                if (secStatus === 'scanning') {
                  return (
                    <StatusTag mode="fill" variant="blue">
                      <Loader className="w-3 h-3 animate-spin" />
                      检测中
                    </StatusTag>
                  );
                }
                const IconComp = secStatus === 'safe' ? ShieldCheck : secStatus === 'suspicious' ? ShieldAlert : ShieldX;
                const reportUrl = skill.securityInfo?.engines?.[0]?.reportUrl;
                return (
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 ${statusInfo.bgColor} ${statusInfo.color} text-xs font-medium rounded-full`}>
                      <IconComp className="w-3.5 h-3.5" />
                      {secStatus === 'safe' ? '安全' : secStatus === 'suspicious' ? '可疑' : '恶意'}
                    </span>
                    {reportUrl && (
                      <a
                        href={reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs text-[#355EF1] hover:text-[#355EF1] transition-colors"
                      >
                        报告
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </span>
                );
              })()}
            </div>
            {/* 元信息行 */}
            <div className="flex items-center flex-wrap gap-2 text-sm text-[#525252]">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] border border-[#E5E5E5] bg-white text-[#334155] text-sm">
                v{skill.version}
              </span>
              <span className="text-[#E2E8F0]">｜</span>
              <span>{skill.slug}</span>
              <span className="text-[#E2E8F0]">｜</span>
              <span>分类：{skill.categories.map((catId: string) => getCategoryName(catId)).join('、')}</span>
              <span className="text-[#E2E8F0]">｜</span>
              <span>范围：{skill.scope === 'public' || !skill.groupIds || skill.groupIds.length === 0
                ? '全部用户'
                : skill.groupIds.map((gId: string) => MOCK_GROUPS.find(g => g.id === gId)?.name || gId).join('、')
              }</span>
            </div>
            {skill.description && (
              <p className="text-sm leading-5 mt-1" style={{ color: "#737373" }}>
                {skill.description}
              </p>
            )}

            {/* 操作按钮组 — 描述下方独占一行（对齐 Agent 详情页风格） */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Button
                variant="claw-primary"
                size="claw"
                onClick={() => setDistributeDialogOpen(true)}
                disabled={hasInProgress}
              >
                {hasInProgress ? '下发中...' : '批量下发'}
                <Send className="w-4 h-4" />
              </Button>

              <TooltipProvider>
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="claw-outline"
                        size="claw"
                        onClick={() => setUpdateDialogOpen(true)}
                        disabled={hasInProgress}
                      >
                        <Pencil className="w-4 h-4" />
                        更新
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {hasInProgress && (
                    <TooltipContent>仅支持状态为正常的 Skill</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="claw-outline"
                size="claw"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                下载
              </Button>

              <TooltipProvider>
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
                    <TooltipContent>仅支持状态为正常的 Skill</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>

      {/* ======== 横向 Segmented Tab（§8.6 规范，参照 Agent 详情页）======== */}
      <div className="py-4">
        <div
          className="inline-flex items-center gap-1 p-1 rounded-[4px]"
          style={{ background: "#F5F5F5" }}
          role="tablist"
          aria-label="技能详情 Tab 切换"
        >
          {[
            { id: "overview", label: "概述" },
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

      {/* ======== Tab 内容 ======== */}
      <div className="pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* 隐藏原始 TabsList，使用上方自定义 Segmented */}
          <TabsList className="hidden">
            <TabsTrigger value="overview">概述</TabsTrigger>
            <TabsTrigger value="files">文件列表</TabsTrigger>
            <TabsTrigger value="distribution">下发记录</TabsTrigger>
          </TabsList>

          {/* 概述 Tab */}
          <TabsContent value="overview" className="mt-0 p-0">
            <SurfaceCard className="p-6">
              <MDXRenderer content={(() => {
                // 如果选中的是最新版本或未选中，用 skill.content
                if (!selectedVersion || selectedVersion === skill.versions?.[0]) {
                  return skill.content || '';
                }
                // 否则从当前版本文件列表中取 SKILL.md 内容
                const versionFiles = currentVersionFiles;
                const skillMdFile = versionFiles.find(f => f.name.toLowerCase() === 'skill.md' || f.name.toLowerCase().endsWith('/skill.md'));
                return skillMdFile?.content || skill.content || '';
              })()} />
            </SurfaceCard>
          </TabsContent>

          {/* 文件列表 Tab */}
          <TabsContent value="files" className="mt-0 p-0">
              <SurfaceCard className="flex h-[47rem] overflow-hidden">
                {/* 左列：版本号选择 */}
                <div className="w-[14%] min-w-[120px] border-r border-[#e5e5e5] flex flex-col">
                  <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center">
                    <p className="text-sm font-medium text-[#09090b]">版本</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {skill.versions?.map((ver: string, idx: number) => {
                      const isLatest = idx === 0;
                      const isSelected = selectedVersion === ver;
                      // 从版本历史中获取详细信息
                      const versionRecord = skill.versionHistory?.find(v => v.version === ver);
                      const dateStr = versionRecord?.date || (() => {
                        const versionDate = new Date(skill.uploadTime);
                        versionDate.setDate(versionDate.getDate() - idx * 14);
                        return `${versionDate.getFullYear()}-${String(versionDate.getMonth() + 1).padStart(2, '0')}-${String(versionDate.getDate()).padStart(2, '0')}`;
                      })();
                      // 安全检测图标：仅最新版本显示当前 skill 的安全状态
                      const secStatus = isLatest ? (skill.securityInfo?.overallStatus || 'not_scanned') : null;
                      return (
                        <button
                          key={ver}
                          onClick={() => setSelectedVersion(ver)}
                          className={`w-full text-left px-3 py-3.5 border-b border-[#f4f4f5] transition-colors ${
                            isSelected
                              ? 'bg-[#f4f4f5]'
                              : 'hover:bg-[#f4f4f5] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-semibold text-[#09090b]">
                              {ver}
                            </span>
                            {isLatest && (
                              <span className="inline-flex h-[18px] items-center justify-center rounded-[2px] border border-[#1447E6] px-1 text-[10px] font-semibold font-['Open_Sans'] leading-none tracking-[0.015em] text-[#355EF1]">
                                New
                              </span>
                            )}
                            <span className="text-[12px] text-[#a1a1aa]">{dateStr}</span>
                            {/* ℹ️ 图标 hover 展示更新说明 */}
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <span className="cursor-pointer inline-flex items-center" onClick={(e) => e.stopPropagation()}>
                                  <Info className="w-3 h-3 text-[#a1a1aa] hover:text-[#09090b]" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[260px] p-3 bg-white text-[#09090b] border border-[#e5e5e5] shadow-lg text-xs">
                                <p className="font-medium mb-1.5 text-[#09090b] text-xs">更新说明</p>
                                <p className="whitespace-pre-line leading-relaxed text-[#525252] text-xs">{versionRecord?.changeLog || '暂无更新说明'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 中列：文件列表 */}
                <div className="w-[22%] min-w-[160px] border-r border-[#e5e5e5] flex flex-col">
                  <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center justify-between">
                    <p className="text-sm font-medium text-[#09090b]">{selectedVersion || skill.version}</p>
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="text-[#71717a] hover:text-[#09090b] transition-colors"
                      title="下载此版本 ZIP"
                    >
                      {isDownloading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 py-2">
                    {renderFileTree(processedFiles)}
                  </div>
                </div>

                {/* 右列：文件详情 */}
                <div className="flex-1 flex flex-col bg-white">
                  {expandedFile ? (
                    <>
                      <div className="h-12 px-3 border-b border-[#e5e5e5] flex items-center justify-between">
                        <p className="text-sm font-medium text-[#09090b]">{expandedFile}</p>
                        {/* 源码/预览 切换 */}
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
                          // 源码模式：所有文件类型都使用语法高亮
                          if (fileViewMode === 'source') {
                            const lang = getFileLanguage(expandedFile);
                            // 异步注册语言
                            registerLanguage(lang);
                            return (
                              <Suspense fallback={
                                <pre className="text-xs text-[#334155] overflow-x-auto whitespace-pre-wrap break-words font-mono leading-5 bg-gray-50 p-3 m-0">
                                  {content}
                                </pre>
                              }>
                                <SyntaxHighlighter
                                  language={lang}
                                  style={hljsStyle}
                                  showLineNumbers
                                  lineNumberStyle={{ color: '#b0b0b0', fontSize: '11px', minWidth: '2.5em', paddingRight: '1em', userSelect: 'none' }}
                                  customStyle={{ margin: 0, padding: '12px 0', fontSize: '12px', lineHeight: '1.6', background: '#ffffff', borderRadius: 0 }}
                                  wrapLongLines
                                >
                                  {content}
                                </SyntaxHighlighter>
                              </Suspense>
                            );
                          }
                          // 预览模式
                          if (isMarkdownFile(expandedFile)) {
                            return (
                              <div className="p-4">
                                <MDXRenderer content={content} />
                              </div>
                            );
                          }
                          // 非 md 文件：预览也使用带行号的语法高亮（与源码一致）
                          const previewLang = getFileLanguage(expandedFile);
                          registerLanguage(previewLang);
                          return (
                            <Suspense fallback={
                              <pre className="text-xs text-[#334155] overflow-x-auto whitespace-pre-wrap break-words font-mono leading-5 bg-gray-50 p-3 m-0">
                                {content}
                              </pre>
                            }>
                              <SyntaxHighlighter
                                language={previewLang}
                                style={hljsStyle}
                                showLineNumbers
                                lineNumberStyle={{ color: '#b0b0b0', fontSize: '11px', minWidth: '2.5em', paddingRight: '1em', userSelect: 'none' }}
                                customStyle={{ margin: 0, padding: '12px 0', fontSize: '12px', lineHeight: '1.6', background: '#ffffff', borderRadius: 0 }}
                                wrapLongLines
                              >
                                {content}
                              </SyntaxHighlighter>
                            </Suspense>
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
              </SurfaceCard>
          </TabsContent>

          {/* 下发记录 Tab */}
          <TabsContent value="distribution" className="mt-0 p-0">
            <SurfaceCard className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#0A0A0A]">下发记录</h3>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {distributionRecords.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-[4px]">
                  <p className="text-[#737373]">还没有下发记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {distributionRecords.map((record, idx) => {
                    const progress = record.totalCount > 0 ? Math.round((record.successCount / record.totalCount) * 100) : 0;
                    return (
                      <div key={record.id} className="border border-gray-200 rounded-[4px] p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-[#0A0A0A]">
                              #{idx + 1} · v{skill.version} {new Date(record.timestamp).toLocaleString('zh-CN')}
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
                          <>
                            <div className="mb-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </>
                        )}
                        

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </SurfaceCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* 批量下发对话框 */}
      <BatchDistributeDialog
        open={distributeDialogOpen}
        onOpenChange={setDistributeDialogOpen}
        skillName={skill.name}
        skillVersion={skill.version}
        skillScope={skill.scope}
        skillGroupIds={skill.groupIds}
        onDistributionStart={handleDistributionStart}
        instances={MOCK_OPENCLAW_INSTANCES}
        groups={MOCK_GROUPS}
      />

      {/* 更新对话框 */}
      {skill && (
        <SkillUpdateDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          skill={skill}
          onConfirm={(updatedSkill) => handleSkillUpdate(updatedSkill)}
          defaultSecurityScan={localStorage.getItem('skill_default_security_scan') !== 'false'}
          onDefaultSecurityScanChange={(value) => {
            localStorage.setItem('skill_default_security_scan', String(value));
          }}
        />
      )}

      {/* 删除确认对话框 */}
      <DeleteSkillDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        skillName={skill.name}
        onConfirm={handleSkillDelete}
      />

      {/* 分发详情对话框 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>下发详情</DialogTitle>
          </DialogHeader>
          
          {activeDistribution && (
            <div className="space-y-4">
              {/* 筛选器 + 搜索框 */}
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

              {/* 实例列表 */}
              <div className="border border-gray-200 rounded-[4px] overflow-y-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-[#334155]">实例名称</th>
                      <th className="px-4 py-2 text-left font-semibold text-[#334155] min-w-[140px]">实例ID</th>
                      <th className="px-4 py-2 text-left font-semibold text-[#334155]">状态</th>
                      <th className="px-4 py-2 text-left font-semibold text-[#334155]">失败原因</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstances.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-[#737373]">
                          没有符合条件的记录
                        </td>
                      </tr>
                    ) : (
                      filteredInstances.map((instance) => (
                        <tr key={instance.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-[#0A0A0A]">{instance.name}</td>
                          <td className="px-4 py-2 text-[#737373] font-mono whitespace-nowrap">{instance.id}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              DISTRIBUTION_STATUS_MAP[instance.distributionStatus]?.color || 'bg-gray-50 text-[#737373]'
                            }`}>
                              {DISTRIBUTION_STATUS_MAP[instance.distributionStatus]?.label || '未下发'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-[#737373]">
                            {instance.failReason || '-'}
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

      {/* 安全检测确认弹窗 (row 47) - 警示弹窗 */}
      <AlertDialog open={securityScanDialogOpen} onOpenChange={setSecurityScanDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setSecurityScanDialogOpen(false)}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#0A0A0A]">
              提交安全检测
              <StatusTag mode="fill" variant="blue">限免</StatusTag>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p className="text-sm text-[#0A0A0A]">
                确认对技能「<span className="font-medium">{skill.name}</span>」提交安全检测？检测将由腾讯云 AI Agent 安全进行，通常几分钟内完成。
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="dialog-confirm"
              onClick={handleSecurityScan}
            >
              确认检测
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
