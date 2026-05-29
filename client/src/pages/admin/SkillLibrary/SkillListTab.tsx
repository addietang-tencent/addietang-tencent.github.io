import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusTag } from '@/components/ui/status-tag';
import { SurfaceCard } from '@/components/ui/Surface';
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActionCell } from '@/components/ui/table';

import { Search, Grid3x3, List, Send, MoreHorizontal, Download, Trash2, Pencil, Loader, ChevronDown, Check, Edit2, ShieldCheck, ShieldAlert, ShieldX, ScanSearch, ExternalLink, Info, Settings2, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { MOCK_SKILLS, DEFAULT_CATEGORIES, MOCK_OPENCLAW_INSTANCES, MOCK_GROUPS } from './mockData';
import SkillUploadDialog from './SkillUploadDialog';
import SkillDetail from './SkillDetail';
import BatchDistributeDialog from './BatchDistributeDialog';
import EditCategoriesDialog from './EditCategoriesDialog';
import EditScopePopover from './EditScopeDialog';
import SkillUpdateDialog from './SkillUpdateDialog';
import DeleteSkillDialog from './DeleteSkillDialog';
import CategoryManagementDialog from './CategoryManagementDialog';
import { Skill, type SkillScope, SECURITY_STATUS_MAP, type SecurityStatus } from './types';
import {
  getSkillDistributionSummary,
  addDistributionRecord,
  updateDistributionRecord,
  createDistributionRecordId,
  type CachedDistributionRecord,
  type SkillDistributionSummary,
} from './distributionCache';
import { downloadSkillAsZip } from './downloadUtils';

// localStorage 缓存 key
const SKILLS_CACHE_KEY = 'skillhub_enterprise_skills_cache';
const SKILLS_CACHE_VERSION_KEY = 'skillhub_enterprise_skills_cache_version';
// 当 MOCK 数据结构变更时递增此版本号，强制刷新缓存
const SKILLS_CACHE_VERSION = '8';

// 从 localStorage 加载缓存的 skills
const loadCachedSkills = (): Skill[] => {
  try {
    const cachedVersion = localStorage.getItem(SKILLS_CACHE_VERSION_KEY);
    // 缓存版本不匹配时清除旧缓存，使用最新 MOCK 数据
    if (cachedVersion !== SKILLS_CACHE_VERSION) {
      localStorage.removeItem(SKILLS_CACHE_KEY);
      localStorage.setItem(SKILLS_CACHE_VERSION_KEY, SKILLS_CACHE_VERSION);
      return MOCK_SKILLS;
    }
    const cached = localStorage.getItem(SKILLS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // 恢复 Date 对象
      return parsed.map((s: any) => ({
        ...s,
        uploadTime: new Date(s.uploadTime),
        lastDistributionTime: s.lastDistributionTime ? new Date(s.lastDistributionTime) : undefined,
      }));
    }
  } catch (e) {
    console.warn('加载缓存 skills 失败:', e);
  }
  return MOCK_SKILLS;
};

// 保存 skills 到 localStorage
const saveCachedSkills = (skills: Skill[]) => {
  try {
    localStorage.setItem(SKILLS_CACHE_KEY, JSON.stringify(skills));
    localStorage.setItem(SKILLS_CACHE_VERSION_KEY, SKILLS_CACHE_VERSION);
  } catch (e) {
    console.warn('缓存 skills 失败:', e);
  }
};

interface SkillListTabProps {
  onSelectSkill?: (skillId: string) => void;
  securityServiceActive?: boolean;
}

/** 仅当子元素文本溢出（出现 ...）时，hover 1s 后才显示 Tooltip */
function OverflowTooltip({ content, children }: { content: React.ReactNode; children: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  return (
    <Tooltip
      delayDuration={1000}
      open={open}
      onOpenChange={(next) => {
        if (next) {
          const el = triggerRef.current;
          if (el && el.scrollWidth > el.clientWidth) {
            setOpen(true);
          }
          // 没溢出时 open 保持 false，tooltip 不弹
        } else {
          setOpen(false);
        }
      }}
    >
      <TooltipTrigger asChild ref={triggerRef}>
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{content}</TooltipContent>
    </Tooltip>
  );
}

export default function SkillListTab({ onSelectSkill, securityServiceActive: securityServiceActiveProp }: SkillListTabProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [skills, setSkills] = useState<Skill[]>(loadCachedSkills);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [defaultTabForDetail, setDefaultTabForDetail] = useState<string>('overview');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [distributeSkillId, setDistributeSkillId] = useState<string | null>(null);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillCategories, setEditingSkillCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  // 标签分类管理弹窗
  const [categoryManageDialogOpen, setCategoryManageDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateSkillId, setUpdateSkillId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSkillId, setDeleteSkillId] = useState<string | null>(null);
  const [downloadingSkillId, setDownloadingSkillId] = useState<string | null>(null);
  // 安全检测确认弹窗
  const [securityScanDialogOpen, setSecurityScanDialogOpen] = useState(false);
  const [securityScanSkillId, setSecurityScanSkillId] = useState<string | null>(null);
  // 安全检测服务开通状态：优先使用 prop，否则从 localStorage 读取
  const [securityServiceActiveLocal, setSecurityServiceActiveLocal] = useState<boolean>(() => {
    const saved = localStorage.getItem('skill_security_service_active');
    return saved === 'true';
  });
  const securityServiceActive = securityServiceActiveProp !== undefined ? securityServiceActiveProp : securityServiceActiveLocal;
  const setSecurityServiceActive = (val: boolean) => {
    setSecurityServiceActiveLocal(val);
    localStorage.setItem('skill_security_service_active', String(val));
  };
  const [securityApplyDialogOpen, setSecurityApplyDialogOpen] = useState(false);
  const [securitySuccessDialogOpen, setSecuritySuccessDialogOpen] = useState(false);
  const [securityServiceUsed, setSecurityServiceUsed] = useState(156); // mock 已用额度
  // 默认行为设置（默认不勾选）
  const [defaultSecurityScan, setDefaultSecurityScan] = useState<boolean>(() => {
    const saved = localStorage.getItem('skill_default_security_scan');
    return saved !== null ? saved === 'true' : false;
  });
  // 应用范围筛选：含 'public'=全部用户, 含 'grp-xxx'=特定分组（多选）
  // 空 Set = 未选任何范围（按钮显示"选择应用范围"）；全选时包含 public + 所有 groupId
  const allScopeKeys = useMemo(() => ['public', ...MOCK_GROUPS.map(g => g.id)], []);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [scopeSearchQuery, setScopeSearchQuery] = useState('');
  const scopeDropdownRef = useRef<HTMLDivElement>(null);
  // 保存编辑弹窗打开前的滚动位置（含表格水平滚动），关闭后恢复
  const scrollPositionRef = useRef<{ x: number; y: number; tableScrollLeft?: number } | null>(null);
  // 表格水平滚动容器 ref（用于保存/恢复滚动位置）
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // 下发状态缓存：key 是 skillId，value 是摘要
  const [distributionSummaries, setDistributionSummaries] = useState<Record<string, SkillDistributionSummary>>({});

  // skills 变化时同步到 localStorage
  useEffect(() => {
    saveCachedSkills(skills);
  }, [skills]);

  // 追踪已启动检测计时器的 skill ID，避免重复
  const scanTimersRef = useRef<Set<string>>(new Set());

  // 对所有处于 scanning 状态的 skill，mock 10s 后自动随机完成检测（实际提示为预计 5 分钟）
  useEffect(() => {
    const scanningSkills = skills.filter(
      s => s.securityInfo?.overallStatus === 'scanning' && !scanTimersRef.current.has(s.id)
    );
    if (scanningSkills.length === 0) return;

    const timers = scanningSkills.map(s => {
      scanTimersRef.current.add(s.id);
      return setTimeout(() => {
        const rand = Math.random();
        let result: SecurityStatus;
        if (rand < 0.5) result = 'safe';
        else if (rand < 0.8) result = 'suspicious';
        else result = 'malicious';

        const safeDims = [
          { name: '供应链风险', status: 'safe' as const, detail: '未发现可疑的第三方依赖引入或供应链污染行为' },
          { name: '命令执行风险', status: 'safe' as const, detail: '未检测到危险的系统命令调用或子进程执行操作' },
          { name: '网络请求与数据外传', status: 'safe' as const, detail: '未发现未经授权的网络请求或敏感数据外传行为' },
          { name: '文件操作与敏感路径访问', status: 'safe' as const, detail: '未检测到对敏感系统路径或凭证文件的异常访问' },
          { name: 'Prompt 注入风险', status: 'safe' as const, detail: '未发现试图篡改 AI Agent 行为的 Prompt 注入指令' },
          { name: '远程脚本下载执行', status: 'safe' as const, detail: '未检测到从远程服务器下载并执行脚本的行为' },
          { name: '可疑编码/混淆', status: 'safe' as const, detail: '未发现可疑的代码编码混淆或加密逃逸技术' },
          { name: '其他安全风险', status: 'safe' as const, detail: '未检测到其他类别的异常安全风险行为' },
        ];
        const suspiciousDims = [
          { name: '供应链风险', status: 'safe' as const, detail: '未发现可疑的第三方依赖引入或供应链污染行为' },
          { name: '命令执行风险', status: 'suspicious' as const, detail: '检测到潜在的系统命令调用，存在一定风险' },
          { name: '网络请求与数据外传', status: 'safe' as const, detail: '未发现未经授权的网络请求或敏感数据外传行为' },
          { name: '文件操作与敏感路径访问', status: 'safe' as const, detail: '未检测到对敏感系统路径或凭证文件的异常访问' },
          { name: 'Prompt 注入风险', status: 'safe' as const, detail: '未发现试图篡改 AI Agent 行为的 Prompt 注入指令' },
          { name: '远程脚本下载执行', status: 'safe' as const, detail: '未检测到从远程服务器下载并执行脚本的行为' },
          { name: '可疑编码/混淆', status: 'suspicious' as const, detail: '发现部分代码使用了 Base64 编码包裹，需人工确认' },
          { name: '其他安全风险', status: 'safe' as const, detail: '未检测到其他类别的异常安全风险行为' },
        ];
        const maliciousDims = [
          { name: '供应链风险', status: 'malicious' as const, detail: '发现恶意第三方依赖注入，存在供应链污染' },
          { name: '命令执行风险', status: 'malicious' as const, detail: '检测到危险的系统命令调用，执行反弹 shell' },
          { name: '网络请求与数据外传', status: 'malicious' as const, detail: '发现向外部 C2 服务器发送敏感数据' },
          { name: '文件操作与敏感路径访问', status: 'safe' as const, detail: '未检测到对敏感系统路径或凭证文件的异常访问' },
          { name: 'Prompt 注入风险', status: 'suspicious' as const, detail: '发现可能篡改 AI Agent 行为的指令片段' },
          { name: '远程脚本下载执行', status: 'malicious' as const, detail: '检测到从远程服务器下载并执行恶意脚本' },
          { name: '可疑编码/混淆', status: 'malicious' as const, detail: '发现大量代码使用多层编码混淆，隐藏恶意逻辑' },
          { name: '其他安全风险', status: 'safe' as const, detail: '未检测到其他类别的异常安全风险行为' },
        ];

        const dims = result === 'safe' ? safeDims : result === 'suspicious' ? suspiciousDims : maliciousDims;
        const score2 = result === 'safe' ? 85 : result === 'suspicious' ? 55 : 15;
        const engine2Status = result as 'safe' | 'suspicious' | 'malicious';

        setSkills(prev => {
          const target = prev.find(sk => sk.id === s.id);
          // 如果已不是 scanning（已被其他地方完成），跳过
          if (!target || target.securityInfo?.overallStatus !== 'scanning') {
            scanTimersRef.current.delete(s.id);
            return prev;
          }
          const updated = prev.map(sk =>
            sk.id === s.id
              ? {
                  ...sk,
                  securityInfo: {
                    overallStatus: result,
                    contentHash: Math.random().toString(36).slice(2, 18),
                    engines: [
                      { engineName: '科恩实验室', status: 'safe' as const, reportUrl: '#', score: 92, dimensions: safeDims },
                      { engineName: '云鼎实验室', status: engine2Status, reportUrl: '#', score: score2, dimensions: dims },
                    ],
                  },
                }
              : sk
          );
          saveCachedSkills(updated);
          const resultLabel = result === 'safe' ? '安全' : result === 'suspicious' ? '可疑' : '恶意';
          toast.info(`「${s.name}」安全检测完成：${resultLabel}`);
          return updated;
        });
        scanTimersRef.current.delete(s.id);
      }, 10000);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [skills]);

  // 点击外部关闭应用范围下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(e.target as Node)) {
        setScopeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 从缓存加载所有 skill 的下发摘要
  const refreshDistributionSummaries = useCallback(() => {
    const summaries: Record<string, SkillDistributionSummary> = {};
    skills.forEach(s => {
      const summary = getSkillDistributionSummary(s.id);
      if (summary) summaries[s.id] = summary;
    });
    setDistributionSummaries(summaries);
  }, [skills]);

  // 首次加载 + 监听缓存更新事件
  useEffect(() => {
    refreshDistributionSummaries();
    const handler = () => refreshDistributionSummaries();
    window.addEventListener('distribution-cache-updated', handler);
    return () => window.removeEventListener('distribution-cache-updated', handler);
  }, [refreshDistributionSummaries]);

  const getCategoryName = (catId: string) => {
    return DEFAULT_CATEGORIES.find((cat: any) => cat.id === catId)?.name || catId;
  };

  const getGroupName = (groupId: string) => {
    return MOCK_GROUPS.find(g => g.id === groupId)?.name || groupId;
  };

  /** 获取 Skill 的应用范围显示标签数组 */
  const getScopeLabels = (skill: Skill): string[] => {
    if (skill.scope === 'public' || !skill.groupIds || skill.groupIds.length === 0) {
      return ['全部用户'];
    }
    return skill.groupIds.map(id => getGroupName(id));
  };

  /** 获取 Skill 的应用范围显示文本（用于卡片等单行场景） */
  const getScopeDisplay = (skill: Skill) => {
    return getScopeLabels(skill).join('、');
  };

  const filteredSkills = skills.filter((skill: any) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null ||
      skill.categories.some((catId: string) => catId === selectedCategory);
    // 应用范围筛选（多选）
    let matchesScope = true;
    if (selectedScopes.size === 0) {
      // 没有选中任何范围 → 不筛选，显示全部
      matchesScope = true;
    } else {
      const hasPublic = selectedScopes.has('public');
      const groupScopes = Array.from(selectedScopes).filter(s => s !== 'public');
      // 满足任一选中条件即匹配
      const matchPublic = hasPublic && (skill.scope === 'public' || !skill.groupIds || skill.groupIds.length === 0);
      const matchGroup = groupScopes.length > 0 && skill.scope === 'private' && skill.groupIds?.some(gid => selectedScopes.has(gid));
      matchesScope = !!(matchPublic || matchGroup);
    }
    return matchesSearch && matchesCategory && matchesScope;
  });

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    return b.uploadTime.getTime() - a.uploadTime.getTime();
  });

  const handleUploadSkill = (skillData: any) => {
    // skillData 已经是 SkillUploadDialog 中构造好的完整 Skill 对象
    // 确保必要字段存在
    const newSkill: Skill = {
      ...skillData,
      id: skillData.id || `skill-${Date.now()}`,
      uploadTime: skillData.uploadTime instanceof Date ? skillData.uploadTime : new Date(),
      versions: skillData.versions || [skillData.version || '1.0.0'],
      files: skillData.files || [],
    };
    setSkills(prev => {
      const updated = [...prev, newSkill];
      // 立即同步缓存，确保不丢数据
      saveCachedSkills(updated);
      return updated;
    });
  };

  // 安全检测提交确认
  const handleSecurityScanConfirm = () => {
    if (!securityScanSkillId) return;
    setSkills(prev => prev.map(s =>
      s.id === securityScanSkillId
        ? { ...s, securityInfo: { overallStatus: 'scanning' as SecurityStatus, engines: [] } }
        : s
    ));
    toast.success('已提交安全检测，预计 5 分钟后完成');
    setSecurityScanDialogOpen(false);
    setSecurityScanSkillId(null);
    // 模拟：10秒后随机变为安全/可疑/恶意（mock 模拟，实际预计 5 分钟）
    const targetId = securityScanSkillId;
    setTimeout(() => {
      const rand = Math.random();
      let result: SecurityStatus;
      if (rand < 0.5) result = 'safe';
      else if (rand < 0.8) result = 'suspicious';
      else result = 'malicious';

      const safeDims = [
        { name: '供应链风险', status: 'safe' as const, detail: '未发现可疑的第三方依赖引入或供应链污染行为' },
        { name: '命令执行风险', status: 'safe' as const, detail: '未检测到危险的系统命令调用或子进程执行操作' },
        { name: '网络请求与数据外传', status: 'safe' as const, detail: '未发现未经授权的网络请求或敏感数据外传行为' },
        { name: '文件操作与敏感路径访问', status: 'safe' as const, detail: '未检测到对敏感系统路径或凭证文件的异常访问' },
        { name: 'Prompt 注入风险', status: 'safe' as const, detail: '未发现试图篡改 AI Agent 行为的 Prompt 注入指令' },
        { name: '远程脚本下载执行', status: 'safe' as const, detail: '未检测到从远程服务器下载并执行脚本的行为' },
        { name: '可疑编码/混淆', status: 'safe' as const, detail: '未发现可疑的代码编码混淆或加密逃逸技术' },
        { name: '其他安全风险', status: 'safe' as const, detail: '未检测到其他类别的异常安全风险行为' },
      ];

      const suspiciousDims = [
        { name: '供应链风险', status: 'safe' as const, detail: '未发现可疑的第三方依赖引入或供应链污染行为' },
        { name: '命令执行风险', status: 'suspicious' as const, detail: '检测到潜在的系统命令调用，存在一定风险' },
        { name: '网络请求与数据外传', status: 'safe' as const, detail: '未发现未经授权的网络请求或敏感数据外传行为' },
        { name: '文件操作与敏感路径访问', status: 'safe' as const, detail: '未检测到对敏感系统路径或凭证文件的异常访问' },
        { name: 'Prompt 注入风险', status: 'safe' as const, detail: '未发现试图篡改 AI Agent 行为的 Prompt 注入指令' },
        { name: '远程脚本下载执行', status: 'safe' as const, detail: '未检测到从远程服务器下载并执行脚本的行为' },
        { name: '可疑编码/混淆', status: 'suspicious' as const, detail: '发现部分代码使用了 Base64 编码包裹，需人工确认' },
        { name: '其他安全风险', status: 'safe' as const, detail: '未检测到其他类别的异常安全风险行为' },
      ];

      const maliciousDims = [
        { name: '供应链风险', status: 'malicious' as const, detail: '发现恶意第三方依赖注入，存在供应链污染' },
        { name: '命令执行风险', status: 'malicious' as const, detail: '检测到危险的系统命令调用，执行反弹 shell' },
        { name: '网络请求与数据外传', status: 'malicious' as const, detail: '发现向外部 C2 服务器发送敏感数据' },
        { name: '文件操作与敏感路径访问', status: 'safe' as const, detail: '未检测到对敏感系统路径或凭证文件的异常访问' },
        { name: 'Prompt 注入风险', status: 'suspicious' as const, detail: '发现可能篡改 AI Agent 行为的指令片段' },
        { name: '远程脚本下载执行', status: 'malicious' as const, detail: '检测到从远程服务器下载并执行恶意脚本' },
        { name: '可疑编码/混淆', status: 'malicious' as const, detail: '发现大量代码使用多层编码混淆，隐藏恶意逻辑' },
        { name: '其他安全风险', status: 'safe' as const, detail: '未检测到其他类别的异常安全风险行为' },
      ];

      const dims = result === 'safe' ? safeDims : result === 'suspicious' ? suspiciousDims : maliciousDims;
      const score = result === 'safe' ? 92 : result === 'suspicious' ? 55 : 15;
      const engineStatus = result as 'safe' | 'suspicious' | 'malicious';

      setSkills(prev => prev.map(s =>
        s.id === targetId && s.securityInfo?.overallStatus === 'scanning'
          ? {
              ...s,
              securityInfo: {
                overallStatus: result,
                contentHash: Math.random().toString(36).slice(2, 18),
                engines: [
                  { engineName: '腾讯云 AI Agent 安全', status: engineStatus, reportUrl: '#', score, dimensions: dims },
                ],
              },
            }
          : s
      ));
      const resultLabel = result === 'safe' ? '安全' : result === 'suspicious' ? '可疑' : '恶意';
      toast.info(`安全检测完成：${resultLabel}`);
    }, 10000);
  };

  const handleViewDetail = (skillId: string) => {
    if (onSelectSkill) {
      onSelectSkill(skillId);
    } else {
      setSelectedSkillId(skillId);
    }
  };

  const handleDistribute = (skillId: string) => {
    setDistributeSkillId(skillId);
    setDistributeDialogOpen(true);
  };

  const handleDistributeStart = (selectedInstanceIds: string[], selectedInstancesData: any[]) => {
    if (!distributeSkillId) return;
    
    // 创建下发记录并写入缓存
    const recordId = createDistributionRecordId();
    const newRecord: CachedDistributionRecord = {
      id: recordId,
      skillId: distributeSkillId,
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

    // 关闭对话框
    setDistributeDialogOpen(false);
    
    // 显示下发开始通知
    toast.success('已开始下发流程');

    // 模拟进度更新
    const totalCount = selectedInstanceIds.length;
    let completed = 0;
    const interval = setInterval(() => {
      completed += Math.floor(Math.random() * 3) + 1;
      if (completed >= totalCount) {
        completed = totalCount;
        clearInterval(interval);
        // 模拟随机失败
        const failedCount = Math.floor(Math.random() * 2);
        const successCount = totalCount - failedCount;
        // 完成下发 - 更新缓存
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
        toast.success('下发完成');
      } else {
        // 更新进度 - 更新缓存
        updateDistributionRecord(recordId, (record) => ({
          ...record,
          successCount: completed,
          inProgressCount: totalCount - completed,
        }));
      }
    }, 800);
  };

  const handleViewDistributeProgress = () => {
    // 跳转到详情页的下发记录 Tab
    if (distributeSkillId) {
      setSelectedSkillId(distributeSkillId);
      setDistributeDialogOpen(false);
      setDefaultTabForDetail('distribution');
      // 设置默认 Tab 为下发记录
      setTimeout(() => {
        const tabTrigger = document.querySelector('[value="distribution"]') as HTMLElement;
        if (tabTrigger) tabTrigger.click();
      }, 100);
    }
  };

  // 更新 Skill
  const handleUpdate = (skillId: string) => {
    setUpdateSkillId(skillId);
    setUpdateDialogOpen(true);
  };

  const handleSkillUpdated = (updatedSkill: Skill) => {
    setSkills(prev => {
      const updated = prev.map(s => s.id === updatedSkill.id ? updatedSkill : s);
      saveCachedSkills(updated);
      return updated;
    });
    setUpdateDialogOpen(false);
    setUpdateSkillId(null);
  };

  // 删除 Skill
  const handleDelete = (skillId: string) => {
    setDeleteSkillId(skillId);
    setDeleteDialogOpen(true);
  };

  const handleSkillDeleted = () => {
    if (!deleteSkillId) return;
    const skillName = skills.find(s => s.id === deleteSkillId)?.name || '';
    setSkills(prev => {
      const updated = prev.filter(s => s.id !== deleteSkillId);
      saveCachedSkills(updated);
      return updated;
    });
    toast.success(`Skill「${skillName}」已删除`);
    setDeleteDialogOpen(false);
    setDeleteSkillId(null);
  };

  // 下载 Skill
  const handleDownload = async (skill: Skill) => {
    setDownloadingSkillId(skill.id);
    try {
      await downloadSkillAsZip(skill);
      toast.success(`「${skill.name}」下载完成`);
    } catch {
      toast.error('下载失败，请重试');
    } finally {
      setDownloadingSkillId(null);
    }
  };

  /** 检查某个 skill 是否有进行中的下发或删除（用于禁用按钮） */
  const isDistributing = (skillId: string): boolean => {
    const summary = distributionSummaries[skillId];
    return summary?.hasInProgress || false;
  };

  // 如果选中了 Skill，显示详情页
  if (selectedSkillId) {
    return (
      <SkillDetail
        skillId={selectedSkillId}
        skills={skills}
        onBack={() => {
          setSelectedSkillId(null);
          setDefaultTabForDetail('overview');
        }}
        defaultTab={defaultTabForDetail}
        onSkillUpdate={(updatedSkill) => {
          setSkills(prev => {
            const updated = prev.map(s => s.id === updatedSkill.id ? updatedSkill : s);
            saveCachedSkills(updated);
            return updated;
          });
        }}
        onSkillDelete={(id) => {
          setSkills(prev => {
            const updated = prev.filter(s => s.id !== id);
            saveCachedSkills(updated);
            return updated;
          });
          setSelectedSkillId(null);
        }}
        securityServiceActive={securityServiceActive}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索和工具栏 */}
      <div className="flex items-center gap-2">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索技能名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border border-gray-200"
          />
        </div>

        {/* 应用范围下拉筛选 — 多选 checkbox 层级结构 */}
        <div className="relative" ref={scopeDropdownRef}>
          <Tooltip delayDuration={1000} open={scopeDropdownOpen ? false : undefined}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setScopeDropdownOpen(prev => !prev)}
                  className="flex items-center justify-between gap-1 min-w-[10rem] max-w-[20rem] h-9 px-3 border border-gray-200 rounded-[4px] bg-white text-sm text-gray-700 hover:border-[#1447E6] transition-colors"
                >
                  <span className="truncate text-left">
                    {selectedScopes.size === 0
                      ? '选择应用范围'
                      : selectedScopes.size === allScopeKeys.length && allScopeKeys.every(k => selectedScopes.has(k))
                        ? '全部应用范围'
                        : Array.from(selectedScopes).map(s => s === 'public' ? '全部用户' : MOCK_GROUPS.find(g => g.id === s)?.name || s).join('、')}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${scopeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[280px]">
                <p className="break-words">
                  {selectedScopes.size === 0
                    ? '选择应用范围'
                    : selectedScopes.size === allScopeKeys.length && allScopeKeys.every(k => selectedScopes.has(k))
                      ? '全部应用范围'
                      : Array.from(selectedScopes).map(s => s === 'public' ? '全部用户' : MOCK_GROUPS.find(g => g.id === s)?.name || s).join('、')}
                </p>
              </TooltipContent>
            </Tooltip>
          {scopeDropdownOpen && (() => {
            const filteredGroups = MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(scopeSearchQuery.toLowerCase()));
            const showPublic = !scopeSearchQuery || '全部用户'.includes(scopeSearchQuery);
            const showGroupSection = !scopeSearchQuery || '按分组'.includes(scopeSearchQuery) || filteredGroups.length > 0;

            const toggleScope = (key: string) => {
              setSelectedScopes(prev => {
                const next = new Set(prev);
                if (next.has(key)) {
                  next.delete(key);
                } else {
                  next.add(key);
                }
                return next;
              });
            };

            return (
            <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
              {/* 搜索框 */}
              <div className="px-2 pb-1.5 pt-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="搜索..."
                    value={scopeSearchQuery}
                    onChange={(e) => setScopeSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              {/* 全部应用范围 — 全选/全不选切换 */}
              {(!scopeSearchQuery || '全部应用范围'.includes(scopeSearchQuery)) && (() => {
                const isAllSelected = allScopeKeys.length > 0 && allScopeKeys.every(k => selectedScopes.has(k));
                return (
                <button
                  type="button"
                  onClick={() => {
                    if (isAllSelected) {
                      // 全选状态 → 清空所有勾选
                      setSelectedScopes(new Set());
                    } else {
                      // 非全选（包括空Set或部分选中） → 全选
                      setSelectedScopes(new Set(allScopeKeys));
                    }
                    setScopeSearchQuery('');
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className={`flex items-center justify-center w-4 h-4 rounded border flex-shrink-0 ${
                    isAllSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {isAllSelected && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="truncate text-left">全部应用范围</span>
                </button>
                );
              })()}
              {/* 全部用户 区域 */}
              {showPublic && (
                <>
                  <div className="px-3 pt-2 pb-1 text-xs font-medium text-gray-400 select-none">
                    全部用户
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleScope('public')}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`flex items-center justify-center w-4 h-4 rounded border flex-shrink-0 ${
                      selectedScopes.has('public') ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedScopes.has('public') && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className="truncate text-left">全部用户</span>
                  </button>
                </>
              )}
              {/* 按分组 区域 */}
              {showGroupSection && (
                <>
                  <div className="px-3 pt-2.5 pb-1 text-xs font-medium text-gray-400 select-none">
                    按分组
                  </div>
                  <div className="max-h-44 overflow-y-auto">
                    {filteredGroups.map(group => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => toggleScope(group.id)}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span className={`flex items-center justify-center w-4 h-4 rounded border flex-shrink-0 ${
                          selectedScopes.has(group.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                        }`}>
                          {selectedScopes.has(group.id) && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span className="truncate text-left" title={group.name}>{group.name}</span>
                      </button>
                    ))}
                    {filteredGroups.length === 0 && !showPublic && scopeSearchQuery && (
                      <p className="text-xs text-gray-400 py-2 text-center">没有匹配的结果</p>
                    )}
                  </div>
                </>
              )}
              {/* 底部：已选数量 + 清除筛选 */}
              {selectedScopes.size > 0 && (
                <div className="border-t border-gray-200 mt-1 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">已选 {selectedScopes.size} 个应用范围</span>
                  <Button
                    type="button"
                    variant="claw-outline"
                    size="claw-sm"
                    onClick={() => {
                      setSelectedScopes(new Set());
                      setScopeSearchQuery('');
                    }}
                  >
                    清除
                  </Button>
                </div>
              )}
            </div>
            );
          })()}
        </div>

        {/* 视图切换 + 发布按钮 */}
        <div className="flex items-center justify-end gap-2">

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
            + 发布 Skill
          </Button>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex items-start gap-2 mb-4 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <Button variant="plain" size="sm" data-state={selectedCategory === null ? "active" : undefined} onClick={() => setSelectedCategory(null)}>
            全部
          </Button>
          {categories.map((cat: any) => (
            <Button key={cat.id} variant="plain" size="sm" data-state={selectedCategory === cat.id ? "active" : undefined} onClick={() => setSelectedCategory(cat.id)}>
              {cat.name}
            </Button>
          ))}
        </div>
        <Button
          variant="claw-outline"
          size="claw-sm"
          onClick={() => setCategoryManageDialogOpen(true)}
          className="flex-shrink-0"
        >
          <Settings2 className="w-4 h-4" />
          标签分类管理
        </Button>
      </div>

      {/* 空状态 */}
      {sortedSkills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">还没有发布任何 SKILL</p>
        </div>
      )}

      {/* 卡片视图 */}
      {viewMode === 'card' && sortedSkills.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {sortedSkills.map(skill => {
            const summary = distributionSummaries[skill.id];
            const distributing = isDistributing(skill.id);
            return (
              <div
                key={skill.id}
                onClick={() => handleViewDetail(skill.id)}
                className="rounded-xl border border-gray-200 bg-white p-4 transition-colors cursor-pointer hover:border-[#D4D4D4] hover:bg-[#FAFAFA]"
              >
                {/* 头部：名称 + 安全检测图标 + 版本（右上） */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#0A0A0A] truncate">{skill.name}</h3>
                    {/* 安全检测小图标 */}
                    {(() => {
                      const secStatus = skill.securityInfo?.overallStatus || 'not_scanned';
                      if (secStatus === 'not_scanned') {
                        return (
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span className="inline-flex flex-shrink-0 cursor-default" onClick={(e) => e.stopPropagation()}>
                                <ShieldCheck className="w-3.5 h-3.5 text-[#D4D4D4]" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <span className="text-xs">未检测</span>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      if (secStatus === 'scanning') {
                        return (
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span className="inline-flex flex-shrink-0 cursor-default" onClick={(e) => e.stopPropagation()}>
                                <Loader className="w-3.5 h-3.5 text-[#1447E6] animate-spin" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <span className="text-xs">安全检测中</span>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      const statusInfo = SECURITY_STATUS_MAP[secStatus];
                      const IconComp = secStatus === 'safe' ? ShieldCheck : secStatus === 'suspicious' ? ShieldAlert : ShieldX;
                      return (
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <span
                              className="inline-flex flex-shrink-0 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultTabForDetail('overview');
                                setSelectedSkillId(skill.id);
                              }}
                            >
                              <IconComp className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <span className="text-xs">安全检测：{statusInfo.label}</span>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })()}
                  </div>
                  <span className="text-xs font-mono text-[#737373] tabular-nums shrink-0 mt-0.5">
                    v{skill.version}
                  </span>
                </div>

                {/* 分类 — 标准 Badge variant="outline"，最多 3 个 + +N */}
                <div className="flex flex-wrap gap-1 mb-3 items-center">
                  {(() => {
                    const maxVisible = 3;
                    const total = skill.categories.length;
                    const visible = skill.categories.slice(0, maxVisible);
                    const overflow = total - maxVisible;
                    return (
                      <>
                        {visible.map((catId: string) => (
                          <Badge key={catId} variant="outline">
                            {getCategoryName(catId)}
                          </Badge>
                        ))}
                        {overflow > 0 && (
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
                                <Badge variant="outline" className="cursor-default">
                                  +{overflow}
                                </Badge>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[320px]">
                              <div className="flex flex-wrap gap-1">
                                {skill.categories.map((catId: string) => (
                                  <span key={catId} className="text-xs">
                                    {getCategoryName(catId)}
                                  </span>
                                )).reduce<React.ReactNode[]>((acc, cur, idx) => {
                                  if (idx > 0) acc.push(<span key={`sep-${idx}`} className="text-xs">,&nbsp;</span>);
                                  acc.push(cur);
                                  return acc;
                                }, [])}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip delayDuration={1000}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                scrollPositionRef.current = { x: window.scrollX, y: window.scrollY };
                                setEditingSkillId(skill.id);
                                setEditingSkillCategories(skill.categories);
                                setEditCategoryDialogOpen(true);
                              }}
                              className="p-0.5 text-[#A3A3A3] hover:text-[#0A0A0A] rounded transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">编辑分类</TooltipContent>
                        </Tooltip>
                      </>
                    );
                  })()}
                </div>

                {/* 描述 — 两行截断 */}
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-[#737373] line-clamp-2 mb-3 cursor-default leading-relaxed min-h-[34px]">
                      {skill.description || '-'}
                    </p>
                  </TooltipTrigger>
                  {skill.description && skill.description.length > 60 && (
                    <TooltipContent side="bottom" className="max-w-[320px]">
                      <p className="text-xs whitespace-pre-wrap">{skill.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>

                {/* 应用范围 — 直接展示 outline badge（去掉冗余前缀文字） */}
                <div className="flex items-center gap-1 mb-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-[#A3A3A3] mr-1">应用范围</span>
                  <EditScopePopover
                    groups={MOCK_GROUPS}
                    currentScope={skill.scope || 'public'}
                    currentGroupIds={skill.groupIds || []}
                    scopeLabels={getScopeLabels(skill)}
                    isPublic={skill.scope === 'public' || !skill.groupIds || skill.groupIds.length === 0}
                    onConfirm={(scope, groupIds) => {
                      setSkills(prev => prev.map(s =>
                        s.id === skill.id ? { ...s, scope, groupIds } : s
                      ));
                      toast.success('应用范围修改成功');
                    }}
                  />
                </div>

                {/* 操作 — 下发 / 更新 / 更多 全部使用次级按钮（claw-outline），保持卡片视觉克制 */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#F5F5F5]" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="claw-outline"
                    size="sm"
                    onClick={() => handleDistribute(skill.id)}
                    disabled={distributing}
                    className="h-8"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    {distributing ? (summary?.lastDistributionStatus === ('deleting' as any) ? '卸载中' : '下发中') : '下发'}
                  </Button>
                  <Button
                    variant="claw-outline"
                    size="sm"
                    onClick={() => handleUpdate(skill.id)}
                    disabled={distributing}
                    className="h-8"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    更新
                  </Button>
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="claw-outline" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDownload(skill)}
                          disabled={downloadingSkillId === skill.id}
                        >
                          {downloadingSkillId === skill.id
                            ? <Loader className="w-4 h-4 mr-2 animate-spin" />
                            : <Download className="w-4 h-4 mr-2" />}
                          下载
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(skill.id)}
                          disabled={distributing}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 表格视图 — 名称列固定左侧、操作列固定右侧，中间列可水平滚动 */}
      {viewMode === 'list' && sortedSkills.length > 0 && (
        <SurfaceCard className="overflow-hidden">
          <Table variant="elevated-white" containerRef={tableScrollRef} scrollX={1520}>
            <TableHeader>
              <TableRow>
                <TableHead fixed="left" className="w-[260px]" style={{ width: 260 }}>
                  技能信息
                </TableHead>
                <TableHead className="w-[100px]" style={{ width: 100 }}>状态</TableHead>
                <TableHead className="w-[160px]" style={{ width: 160 }}>下发</TableHead>
                <TableHead className="w-[80px]" style={{ width: 80 }}>版本</TableHead>
                <TableHead className="w-[360px]" style={{ width: 360 }}>描述</TableHead>
                <TableHead className="min-w-[160px]">分类</TableHead>
                <TableHead className="w-[190px]" style={{ width: 190 }}>应用范围</TableHead>
                <TableHead className="w-[130px]" style={{ width: 130 }}>最后更新</TableHead>
                <TableHead fixed="right" className="w-[168px]" style={{ width: 168 }}>
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {sortedSkills.map(skill => {
                  const summary = distributionSummaries[skill.id];
                  const distributing = isDistributing(skill.id);
                  
                  // 下发/删除状态显示：两行结构
                  const hasDistribution = summary && summary.lastDistributionStatus !== 'not_distributed';
                  let statusLine1 = '正常'; // 第一行：状态
                  let statusLine2 = '未下发'; // 第二行：下发进度
                  let statusVariant: 'green' | 'blue' | 'red' = 'green';
                  let distributionVariant: 'green' | 'blue' | 'red' = 'red';
                  if (summary) {
                    if (summary.lastDistributionStatus === 'deleting' as any) {
                      statusLine1 = '卸载中';
                      statusLine2 = `${summary.lastDistributionProgress || 0}%`;
                      statusVariant = 'red';
                      distributionVariant = 'red';
                    } else if (summary.lastDistributionStatus === 'distributing') {
                      statusLine1 = '下发中';
                      statusLine2 = `${summary.lastDistributionProgress || 0}%`;
                      statusVariant = 'blue';
                      distributionVariant = 'blue';
                    } else if (hasDistribution) {
                      const total = summary.lastDistributionInstanceCount || 0;
                      const success = summary.lastDistributionSuccessCount ?? total;
                      statusLine2 = `已下发（${success}/${total}成功）`;
                      distributionVariant = success === total ? 'green' : 'red';
                    }
                  }

                  return (
                    <TableRow
                      key={skill.id}
                      onClick={() => handleViewDetail(skill.id)}
                      className="cursor-pointer"
                    >
                      {/* 技能信息 — 固定左侧 */}
                      <TableCell
                        fixed="left"
                        className=""
                        style={{ width: 260 }}
                      >
                        <div className="min-w-0">
                          <OverflowTooltip content={skill.name}>
                            <div className="font-medium text-[#0A0A0A] truncate max-w-[230px]">{skill.name}</div>
                          </OverflowTooltip>
                          <OverflowTooltip content={skill.slug}>
                            <div className="text-xs text-[#737373] font-mono mt-0.5 truncate max-w-[230px]">{skill.slug}</div>
                          </OverflowTooltip>
                        </div>
                      </TableCell>
                      {/* 状态 — StatusTag 文本模式 */}
                      <TableCell className="">
                        <StatusTag
                          mode="text"
                          variant={statusVariant === 'green' ? 'green' : statusVariant === 'blue' ? 'blue' : 'red'}
                        >
                          {statusLine1}
                        </StatusTag>
                      </TableCell>
                      {/* 下发状态 — 纯文字 */}
                      <TableCell className="">
                        {hasDistribution ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefaultTabForDetail('distribution');
                              setSelectedSkillId(skill.id);
                            }}
                            className="text-sm text-[#334155] hover:text-[#1447E6] transition-colors"
                            title={statusLine2}
                          >
                            {statusLine2}
                          </button>
                        ) : (
                          <span className="text-sm text-[#A3A3A3]">{statusLine2}</span>
                        )}
                      </TableCell>
                      {/* 版本号 */}
                      <TableCell className="">
                        <span className="text-sm text-[#334155]">v{skill.version}</span>
                      </TableCell>
                      {/* 描述 */}
                      <TableCell className="" style={{ width: 360, overflow: 'hidden' }}>
                        <Tooltip delayDuration={1000}>
                          <TooltipTrigger asChild>
                            <span
                              className="block cursor-default text-sm leading-relaxed text-[#334155]"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-all',
                              }}
                            >{skill.description || '-'}</span>
                          </TooltipTrigger>
                          {skill.description && skill.description.length > 40 && (
                            <TooltipContent side="bottom" className="max-w-[400px]">
                              <p className="text-xs whitespace-pre-wrap">{skill.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TableCell>
                      {/* 分类 — 纯文本展示（用「/」分隔），自适应列宽，hover 展示全部，可点击编辑 */}
                      <TableCell className="" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const names = skill.categories.map((catId: string) => getCategoryName(catId));
                          const fullText = names.join(' / ');
                          return (
                            <div className="flex items-center gap-1 min-w-0">
                              {names.length > 0 ? (
                                <Tooltip delayDuration={500}>
                                  <TooltipTrigger asChild>
                                    <span className="text-sm text-[#0A0A0A] whitespace-nowrap">
                                      {fullText}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[320px]">
                                    <span className="text-xs">{fullText}</span>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-sm text-[#A3A3A3]">—</span>
                              )}
                              <Tooltip delayDuration={1000}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      scrollPositionRef.current = { x: window.scrollX, y: window.scrollY, tableScrollLeft: tableScrollRef.current?.scrollLeft };
                                      setEditingSkillId(skill.id);
                                      setEditingSkillCategories(skill.categories);
                                      setEditCategoryDialogOpen(true);
                                    }}
                                    className="p-0.5 text-gray-400 hover:text-gray-900 rounded transition-colors flex-shrink-0"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  编辑分类
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          );
                        })()}
                      </TableCell>
                      {/* 应用范围 — 使用 Popover 编辑 */}
                      <TableCell className="" onClick={(e) => e.stopPropagation()}>
                        <EditScopePopover
                          groups={MOCK_GROUPS}
                          currentScope={skill.scope || 'public'}
                          currentGroupIds={skill.groupIds || []}
                          scopeLabels={getScopeLabels(skill)}
                          isPublic={skill.scope === 'public' || !skill.groupIds || skill.groupIds.length === 0}
                          onConfirm={(scope, groupIds) => {
                            setSkills(prev => prev.map(s =>
                              s.id === skill.id ? { ...s, scope, groupIds } : s
                            ));
                            toast.success('应用范围修改成功');
                          }}
                        />
                      </TableCell>
                      {/* 最后更新时间 */}
                      <TableCell className="">
                        <span className="text-sm text-[#334155] tabular-nums">
                          {skill.uploadTime.toLocaleDateString('zh-CN')}
                        </span>
                      </TableCell>
                      {/* 操作 — 固定右侧：下发 / 更新 / 更多(下载、删除) */}
                      <TableActionCell
                        fixed="right"
                        className=""
                        style={{ width: 168 }}
                        actionsClassName="h-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="link"
                          onClick={() => handleDistribute(skill.id)}
                          disabled={distributing}
                        >
                          {distributing ? (summary?.lastDistributionStatus === ('deleting' as any) ? '卸载中' : '下发中') : '下发'}
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => handleUpdate(skill.id)}
                          disabled={distributing}
                        >
                          更新
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="link" aria-label="更多操作">
                              更多
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* 安全检测（仅未检测时显示） */}
                            {(skill.securityInfo?.overallStatus === 'not_scanned' || !skill.securityInfo) && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSecurityScanSkillId(skill.id);
                                  setSecurityScanDialogOpen(true);
                                }}
                              >
                                <ScanSearch className="w-4 h-4 mr-2" />
                                安全检测
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDownload(skill)}
                              disabled={downloadingSkillId === skill.id}
                            >
                              {downloadingSkillId === skill.id
                                ? <Loader className="w-4 h-4 mr-2 animate-spin" />
                                : <Download className="w-4 h-4 mr-2" />}
                              下载
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(skill.id)}
                              disabled={distributing}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableActionCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
        </SurfaceCard>
      )}

      <SkillUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onConfirm={handleUploadSkill}
        existingSlugs={skills.map(s => s.slug)}
        defaultSecurityScan={defaultSecurityScan}
        onDefaultSecurityScanChange={(value) => {
          setDefaultSecurityScan(value);
          localStorage.setItem('skill_default_security_scan', String(value));
          toast.success('默认行为已保存');
        }}
        securityServiceActive={securityServiceActive}
      />

      {distributeSkillId && (
        <BatchDistributeDialog
          open={distributeDialogOpen}
          onOpenChange={setDistributeDialogOpen}
          skillName={skills.find(s => s.id === distributeSkillId)?.name || ''}
          skillVersion={skills.find(s => s.id === distributeSkillId)?.version}
          skillScope={skills.find(s => s.id === distributeSkillId)?.scope}
          skillGroupIds={skills.find(s => s.id === distributeSkillId)?.groupIds}
          onDistributionStart={handleDistributeStart}
          instances={MOCK_OPENCLAW_INSTANCES}
          groups={MOCK_GROUPS}
        />
      )}

      {/* 更新对话框 */}
      {updateSkillId && (() => {
        const updateSkill = skills.find(s => s.id === updateSkillId);
        return updateSkill ? (
          <SkillUpdateDialog
            open={updateDialogOpen}
            onOpenChange={(open) => {
              setUpdateDialogOpen(open);
              if (!open) setUpdateSkillId(null);
            }}
            skill={updateSkill}
            onConfirm={handleSkillUpdated}
            defaultSecurityScan={defaultSecurityScan}
            onDefaultSecurityScanChange={(value) => {
              setDefaultSecurityScan(value);
              localStorage.setItem('skill_default_security_scan', String(value));
              toast.success('默认行为已保存');
            }}
            securityServiceActive={securityServiceActive}
          />
        ) : null;
      })()}

      {/* 删除确认对话框 */}
      {deleteSkillId && (
        <DeleteSkillDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setDeleteSkillId(null);
          }}
          skillName={skills.find(s => s.id === deleteSkillId)?.name || ''}
          onConfirm={handleSkillDeleted}
        />
      )}

      {/* 标签分类管理弹窗 */}
      <CategoryManagementDialog
        open={categoryManageDialogOpen}
        onOpenChange={setCategoryManageDialogOpen}
        categories={categories}
        setCategories={setCategories}
        skills={skills}
      />

       {/* 编辑分类弹窗 */}
      <EditCategoriesDialog
        open={editCategoryDialogOpen}
        onOpenChange={(open) => {
          setEditCategoryDialogOpen(open);
          if (!open) {
            setEditingSkillId(null);
            setEditingSkillCategories([]);
            // 恢复弹窗打开前的滚动位置
            if (scrollPositionRef.current) {
              const saved = scrollPositionRef.current;
              requestAnimationFrame(() => {
                window.scrollTo(saved.x, saved.y);
                if (saved.tableScrollLeft !== undefined && tableScrollRef.current) {
                  tableScrollRef.current.scrollLeft = saved.tableScrollLeft;
                }
                scrollPositionRef.current = null;
              });
            }
          }
        }}
        categories={categories}
        selectedCategoryIds={editingSkillCategories}
        skillName={editingSkillId ? skills.find(s => s.id === editingSkillId)?.name : undefined}
        onConfirm={(selectedCategoryIds) => {
          if (editingSkillId) {
            setSkills(prev => prev.map(skill => 
              skill.id === editingSkillId 
                ? { ...skill, categories: selectedCategoryIds }
                : skill
            ));
            toast.success('分类修改成功');
            setEditCategoryDialogOpen(false);
            setEditingSkillId(null);
            setEditingSkillCategories([]);
            // 恢复弹窗打开前的滚动位置
            if (scrollPositionRef.current) {
              const saved = scrollPositionRef.current;
              requestAnimationFrame(() => {
                window.scrollTo(saved.x, saved.y);
                if (saved.tableScrollLeft !== undefined && tableScrollRef.current) {
                  tableScrollRef.current.scrollLeft = saved.tableScrollLeft;
                }
                scrollPositionRef.current = null;
              });
            }
          }
        }}
      />

      {/* 安全检测确认弹窗 */}
      <AlertDialog open={securityScanDialogOpen} onOpenChange={setSecurityScanDialogOpen}>
        <AlertDialogContent className="sm:max-w-[420px]">
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
            <AlertDialogTitle className="flex items-center gap-2">
              提交安全检测
              <Badge variant="secondary" className="rounded-full bg-[#F0F2F8] text-[#1447E6] text-[10px] px-2 py-0.5 border-0">限免</Badge>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {securityServiceUsed >= 1000 ? (
                '免费试用额度已用完，请前往官网提交工单提额，产品可选择 云安全中心。'
              ) : (
                <>确认对技能「{securityScanSkillId ? skills.find(s => s.id === securityScanSkillId)?.name : ''}」提交安全检测？检测将由腾讯云 AI Agent 安全进行，通常几分钟内完成。</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setSecurityScanDialogOpen(false); setSecurityScanSkillId(null); }}>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="dialog-confirm"
              onClick={handleSecurityScanConfirm}
              disabled={securityServiceUsed >= 1000}
              className="disabled:cursor-not-allowed"
            >
              确认检测
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 安全检测服务 — 申请开通弹窗 (row 49) - 普通弹窗 */}
      <Dialog open={securityApplyDialogOpen} onOpenChange={setSecurityApplyDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
        >
          <DialogHeader>
            <DialogTitle>申请免费试用（Skills 风险检测 API）</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex-1">
            <div className="rounded-[4px] border border-gray-200 bg-white px-4 py-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#525252]">试用有效期</span>
                <span className="text-sm text-[#0A0A0A]">有效期至 2026 年 6 月 30 日</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#525252]">调用额度</span>
                <div className="text-right">
                  <span className="text-sm text-[#0A0A0A]">1000 次</span>
                  <p className="text-xs text-[#737373]">有效期到期后，剩余未使用的额度将清空</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#525252]">操作指引</span>
                <a
                  href="https://cloud.tencent.com/document/api/664/131590"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1447E6] hover:underline flex items-center gap-1 text-sm"
                >
                  说明文档
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecurityApplyDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                setSecurityServiceActive(true);
                localStorage.setItem('skill_security_service_active', 'true');
                setSecurityApplyDialogOpen(false);
                setSecuritySuccessDialogOpen(true);
              }}
            >
              立即领取
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 安全检测服务 — 开通成功弹窗 */}
      <Dialog open={securitySuccessDialogOpen} onOpenChange={setSecuritySuccessDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </span>
              试用额度已开通
            </DialogTitle>
            <DialogDescription className="pt-2">
              1000次调用额度，有效期至 2026-06-30
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">使用 API</p>
              <p className="text-sm text-gray-600">
                您可以前往查看{' '}
                <a
                  href="https://cloud.tencent.com/document/api/664/131590"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5"
                >
                  说明文档
                  <ExternalLink className="w-3 h-3" />
                </a>
                ，基于说明文档调用并测试 API。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="dialog-confirm"
              onClick={() => setSecuritySuccessDialogOpen(false)}
            >
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
