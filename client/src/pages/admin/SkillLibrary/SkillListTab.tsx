import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Search, Grid3x3, List, Send, Edit2, MoreHorizontal, Download, Trash2, Pencil, Loader, ChevronDown, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocation } from 'wouter';
import { MOCK_SKILLS, DEFAULT_CATEGORIES, MOCK_OPENCLAW_INSTANCES, MOCK_GROUPS } from './mockData';
import SkillUploadDialog from './SkillUploadDialog';
import SkillDetail from './SkillDetail';
import BatchDistributeDialog from './BatchDistributeDialog';
import EditCategoriesDialog from './EditCategoriesDialog';
import EditScopeDialog from './EditScopeDialog';
import SkillUpdateDialog from './SkillUpdateDialog';
import DeleteSkillDialog from './DeleteSkillDialog';
import { Skill, type SkillScope } from './types';
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
const SKILLS_CACHE_VERSION = '4';

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
}

export default function SkillListTab({ onSelectSkill }: SkillListTabProps) {
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
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateSkillId, setUpdateSkillId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSkillId, setDeleteSkillId] = useState<string | null>(null);
  const [downloadingSkillId, setDownloadingSkillId] = useState<string | null>(null);
  // 应用范围筛选：null=全部, 'public'=全部用户, 'group-xxx'=特定分组
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [scopeSearchQuery, setScopeSearchQuery] = useState('');
  const scopeDropdownRef = useRef<HTMLDivElement>(null);
  // 编辑应用范围弹窗
  const [editScopeDialogOpen, setEditScopeDialogOpen] = useState(false);
  const [editingScopeSkillId, setEditingScopeSkillId] = useState<string | null>(null);
  const [editingScopeValue, setEditingScopeValue] = useState<SkillScope>('public');
  const [editingScopeGroupIds, setEditingScopeGroupIds] = useState<string[]>([]);

  // 下发状态缓存：key 是 skillId，value 是摘要
  const [distributionSummaries, setDistributionSummaries] = useState<Record<string, SkillDistributionSummary>>({});

  // skills 变化时同步到 localStorage
  useEffect(() => {
    saveCachedSkills(skills);
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
    // 应用范围筛选
    let matchesScope = true;
    if (selectedScope === 'public') {
      matchesScope = skill.scope === 'public' || !skill.groupIds || skill.groupIds.length === 0;
    } else if (selectedScope && selectedScope.startsWith('group-')) {
      matchesScope = skill.scope === 'private' && skill.groupIds?.includes(selectedScope);
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

  /** 检查某个 skill 是否有进行中的下发（用于禁用按钮） */
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
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索和工具栏 */}
      <div className="flex items-center justify-between gap-6">
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

        {/* 应用范围下拉筛选 — 自定义下拉支持搜索 */}
        <div className="relative" ref={scopeDropdownRef}>
          <Tooltip delayDuration={1000} open={scopeDropdownOpen ? false : undefined}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setScopeDropdownOpen(prev => !prev)}
                  className="flex items-center justify-between gap-1 w-40 h-9 px-3 border border-gray-200 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="truncate text-left">
                    {selectedScope === null
                      ? '全部应用范围'
                      : selectedScope === 'public'
                        ? '全部用户'
                        : MOCK_GROUPS.find(g => g.id === selectedScope)?.name || selectedScope}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${scopeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-700 text-xs border border-gray-200 shadow-sm max-w-[280px]">
                <p className="break-words">
                  {selectedScope === null
                    ? '全部应用范围'
                    : selectedScope === 'public'
                      ? '全部用户'
                      : MOCK_GROUPS.find(g => g.id === selectedScope)?.name || selectedScope}
                </p>
              </TooltipContent>
            </Tooltip>
          {scopeDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              {/* 搜索框 */}
              <div className="px-2 pb-1.5 pt-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    placeholder="搜索..."
                    value={scopeSearchQuery}
                    onChange={(e) => setScopeSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-2 h-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              {/* 全部应用范围 — 选中时点击不做任何操作（单选模式） */}
              {(!scopeSearchQuery || '全部应用范围'.includes(scopeSearchQuery)) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedScope(null);
                    setScopeDropdownOpen(false);
                    setScopeSearchQuery('');
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    selectedScope === null ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate text-left">全部应用范围</span>
                  {selectedScope === null && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              )}
              {/* 全部用户 */}
              {(!scopeSearchQuery || '全部用户'.includes(scopeSearchQuery)) && (
                <button
                  type="button"
                  onClick={() => { setSelectedScope('public'); setScopeDropdownOpen(false); setScopeSearchQuery(''); }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    selectedScope === 'public' ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate text-left">全部用户</span>
                  {selectedScope === 'public' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              )}
              {/* 分组列表 */}
              <div className="max-h-40 overflow-y-auto">
                {MOCK_GROUPS
                  .filter(g => g.name.toLowerCase().includes(scopeSearchQuery.toLowerCase()))
                  .map(group => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => { setSelectedScope(group.id); setScopeDropdownOpen(false); setScopeSearchQuery(''); }}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedScope === group.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span className="truncate text-left" title={group.name}>{group.name}</span>
                      {selectedScope === group.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                {MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(scopeSearchQuery.toLowerCase())).length === 0 && scopeSearchQuery && (
                  <p className="text-xs text-gray-400 py-2 text-center">没有匹配的分组</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 视图切换、发布按钮 */}
        <div className="flex items-center justify-end gap-4">

          {/* 视图切换 */}
          <div className="flex items-center gap-1 border border-gray-200 rounded p-1 bg-white">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'card'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="卡片视图"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => setUploadDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            + 发布 Skill
          </Button>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex items-center gap-2 mb-4 flex-wrap border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 text-sm rounded-full border transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white font-medium border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            全部
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-sm rounded-full border transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white font-medium border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 空状态 */}
      {sortedSkills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">还没有发布任何 SKILL</p>
          <Button onClick={() => setUploadDialogOpen(true)} className="mt-4">
            + 发布 SKILL
          </Button>
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
                className="rounded-lg border border-gray-200 bg-white p-4 transition-all cursor-pointer hover:shadow-md hover:bg-gray-50"
              >
                {/* 名称 + 版本 */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1">{skill.name}</h3>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                    v{skill.version}
                  </span>
                </div>

                {/* 分类 */}
                <div className="flex flex-wrap gap-1 mb-3 items-center">
                  {skill.categories.map((catId: string) => (
                    <span
                      key={catId}
                      className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {getCategoryName(catId)}
                    </span>
                  ))}
                  <Tooltip delayDuration={1000}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSkillId(skill.id);
                            setEditingSkillCategories(skill.categories);
                            setEditCategoryDialogOpen(true);
                          }}
                          className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-white text-gray-700 text-xs border border-gray-200 shadow-sm">
                        编辑分类
                      </TooltipContent>
                    </Tooltip>
                </div>

                {/* 描述 */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{skill.description || '-'}</p>

                {/* 应用范围 — 灰色胶囊标签 */}
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  <span className="text-xs text-gray-400">范围：</span>
                  {getScopeLabels(skill).map((label, idx) => (
                    <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {label}
                    </span>
                  ))}
                  <Tooltip delayDuration={1000}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingScopeSkillId(skill.id);
                            setEditingScopeValue(skill.scope || 'public');
                            setEditingScopeGroupIds([...(skill.groupIds || [])]);
                            setEditScopeDialogOpen(true);
                          }}
                          className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-white text-gray-700 text-xs border border-gray-200 shadow-sm">
                        编辑应用范围
                      </TooltipContent>
                    </Tooltip>
                </div>

                {/* 操作 */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDistribute(skill.id)}
                    disabled={distributing}
                    className={`h-7 text-xs ${distributing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {distributing ? '下发中' : '下发'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdate(skill.id)}
                    disabled={distributing}
                    className={`h-7 text-xs ${distributing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    更新
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0">
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
                        className=""
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 表格视图 — 名称列固定左侧、操作列固定右侧，中间列可水平滚动 */}
      {viewMode === 'list' && sortedSkills.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-sm" style={{ minWidth: '1430px', width: '100%', tableLayout: 'fixed' }}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 sticky left-0 z-10"
                    style={{ width: '180px', minWidth: '180px' }}
                  >
                    名称/Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wide" style={{ width: '150px', minWidth: '150px' }}>状态/下发动态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '80px', minWidth: '80px' }}>版本号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '350px', minWidth: '350px' }}>描述</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '200px', minWidth: '200px' }}>分类</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '200px', minWidth: '200px' }}>应用范围</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide" style={{ width: '120px', minWidth: '120px' }}>最后更新</th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 sticky right-0 z-10"
                    style={{ width: '220px', minWidth: '220px', boxShadow: '-4px 0 8px -4px rgba(0,0,0,0.06)' }}
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSkills.map(skill => {
                  const summary = distributionSummaries[skill.id];
                  const distributing = isDistributing(skill.id);
                  
                  // 下发状态显示：两行结构
                  const hasDistribution = summary && summary.lastDistributionStatus !== 'not_distributed';
                  let statusLine1 = '正常'; // 第一行：状态
                  let statusLine2 = '未下发'; // 第二行：下发进度
                  let statusLine1Color = 'text-gray-700';
                  let statusLine2Color = 'text-gray-400';
                  let statusLine2Bg = ''; // 底色
                  let statusLine2HoverBg = ''; // hover 加深底色
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
                      statusLine2 = `已下发（${success}/${total}成功）`;
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
                    <tr
                      key={skill.id}
                      onClick={() => handleViewDetail(skill.id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      {/* 名称 / Slug — 固定左侧 */}
                      <td
                        className="px-4 py-3 bg-white sticky left-0 z-10 group-hover:bg-gray-50 transition-colors"
                        style={{ minWidth: '180px' }}
                      >
                        <div className="font-medium text-gray-900 truncate" title={skill.name}>{skill.name}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5 truncate" title={skill.slug}>{skill.slug}</div>
                      </td>
                      {/* 状态/最近下发进度 */}
                      <td className="px-4 py-3" style={{ minWidth: '150px' }}>
                        <div className={`text-sm font-medium ${statusLine1Color}`}>{statusLine1}</div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasDistribution) {
                              setDefaultTabForDetail('distribution');
                              setSelectedSkillId(skill.id);
                            }
                          }}
                          className={hasDistribution
                            ? `inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded text-xs font-medium cursor-pointer transition-colors ${statusLine2Color} ${statusLine2Bg} ${statusLine2HoverBg}`
                            : `text-xs mt-0.5 ${statusLine2Color}`
                          }
                        >
                          {statusLine2}
                        </div>
                      </td>
                      {/* 版本号 */}
                      <td className="px-4 py-3" style={{ minWidth: '80px' }}>
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          v{skill.version}
                        </span>
                      </td>
                      {/* 描述 */}
                      <td className="px-4 py-3" style={{ minWidth: '400px' }}>
                        <span className="text-sm text-gray-600 line-clamp-2">{skill.description || '-'}</span>
                      </td>
                      {/* 分类 — 最多显示 2 个标签，超出 +N，右侧编辑按钮 */}
                      <td className="px-4 py-3" style={{ minWidth: '200px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 flex-wrap">
                          {skill.categories.slice(0, 4).map((catId: string) => (
                            <span key={catId} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {getCategoryName(catId)}
                            </span>
                          ))}
                          {skill.categories.length > 4 && (
                            <Tooltip delayDuration={1000}>
                                <TooltipTrigger asChild>
                                  <span className="inline-block px-1.5 py-0.5 bg-white text-gray-500 text-xs rounded border border-gray-200 cursor-default hover:bg-gray-50 transition-colors">
                                    +{skill.categories.length - 4}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-white text-gray-700 text-xs max-w-[240px] border border-gray-200 shadow-sm">
                                  <div className="flex flex-wrap gap-1">
                                    {skill.categories.slice(4).map((catId: string) => (
                                      <span key={catId} className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                        {getCategoryName(catId)}
                                      </span>
                                    ))}
                                  </div>
                                </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip delayDuration={1000}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSkillId(skill.id);
                                    setEditingSkillCategories(skill.categories);
                                    setEditCategoryDialogOpen(true);
                                  }}
                                  className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-white text-gray-700 text-xs border border-gray-200 shadow-sm">
                                编辑分类
                              </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                      {/* 应用范围 — 灰色胶囊标签，复用分类列样式 */}
                      <td className="px-4 py-3" style={{ minWidth: '200px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 flex-wrap">
                          {getScopeLabels(skill).slice(0, 4).map((label, idx) => (
                            <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {label}
                            </span>
                          ))}
                          {getScopeLabels(skill).length > 4 && (
                            <Tooltip delayDuration={1000}>
                                <TooltipTrigger asChild>
                                  <span className="inline-block px-1.5 py-0.5 bg-white text-gray-500 text-xs rounded border border-gray-200 cursor-default hover:bg-gray-50 transition-colors">
                                    +{getScopeLabels(skill).length - 4}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-white text-gray-700 text-xs max-w-[240px] border border-gray-200 shadow-sm">
                                  <div className="flex flex-wrap gap-1">
                                    {getScopeLabels(skill).slice(4).map((label, idx) => (
                                      <span key={idx} className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                        {label}
                                      </span>
                                    ))}
                                  </div>
                                </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip delayDuration={1000}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingScopeSkillId(skill.id);
                                    setEditingScopeValue(skill.scope || 'public');
                                    setEditingScopeGroupIds([...(skill.groupIds || [])]);
                                    setEditScopeDialogOpen(true);
                                  }}
                                  className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-white text-gray-700 text-xs border border-gray-200 shadow-sm">
                                编辑应用范围
                              </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                      {/* 最后更新时间 */}
                      <td className="px-4 py-3" style={{ minWidth: '120px' }}>
                        <span className="text-sm text-gray-500">
                          {skill.uploadTime.toLocaleDateString('zh-CN')}
                        </span>
                      </td>
                      {/* 操作 — 固定右侧：下发 / 更新 / 更多(下载、删除) */}
                      <td
                        className="px-4 py-3 bg-white sticky right-0 z-10 group-hover:bg-gray-50 transition-colors"
                        style={{ minWidth: '220px', boxShadow: '-4px 0 8px -4px rgba(0,0,0,0.06)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {/* 下发按钮 */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDistribute(skill.id)}
                            disabled={distributing}
                            className={`h-7 text-xs min-w-[62px] ${distributing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {distributing ? '下发中' : '下发'}
                          </Button>
                          {/* 更新按钮 */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdate(skill.id)}
                            disabled={distributing}
                            className={`h-7 text-xs ${distributing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            更新
                          </Button>
                          {/* 更多下拉：下载 / 删除 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SkillUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onConfirm={handleUploadSkill}
        existingSlugs={skills.map(s => s.slug)}
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

       {/* 编辑分类弹窗 */}
      <EditCategoriesDialog
        open={editCategoryDialogOpen}
        onOpenChange={(open) => {
          setEditCategoryDialogOpen(open);
          if (!open) {
            setEditingSkillId(null);
            setEditingSkillCategories([]);
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
          }
        }}
      />

      {/* 编辑应用范围弹窗 */}
      <EditScopeDialog
        open={editScopeDialogOpen}
        onOpenChange={(open) => {
          setEditScopeDialogOpen(open);
          if (!open) {
            setEditingScopeSkillId(null);
            setEditingScopeValue('public');
            setEditingScopeGroupIds([]);
          }
        }}
        groups={MOCK_GROUPS}
        currentScope={editingScopeValue}
        currentGroupIds={editingScopeGroupIds}
        skillName={editingScopeSkillId ? skills.find(s => s.id === editingScopeSkillId)?.name : undefined}
        onConfirm={(scope, groupIds) => {
          if (editingScopeSkillId) {
            setSkills(prev => prev.map(skill =>
              skill.id === editingScopeSkillId
                ? { ...skill, scope, groupIds }
                : skill
            ));
            toast.success('应用范围修改成功');
            setEditScopeDialogOpen(false);
            setEditingScopeSkillId(null);
            setEditingScopeValue('public');
            setEditingScopeGroupIds([]);
          }
        }}
      />

    </div>
  );
}
