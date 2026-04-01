import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Search, Grid3x3, List, Send, Edit2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocation } from 'wouter';
import { MOCK_SKILLS, DEFAULT_CATEGORIES, MOCK_OPENCLAW_INSTANCES } from './mockData';
import SkillUploadDialog from './SkillUploadDialog';
import SkillDetail from './SkillDetail';
import BatchDistributeDialog from './BatchDistributeDialog';
import EditCategoriesDialog from './EditCategoriesDialog';
import { Skill } from './types';
import {
  getSkillDistributionSummary,
  hasInProgressDistribution,
  addDistributionRecord,
  updateDistributionRecord,
  createDistributionRecordId,
  type CachedDistributionRecord,
  type SkillDistributionSummary,
} from './distributionCache';

// localStorage 缓存 key
const SKILLS_CACHE_KEY = 'skillhub_enterprise_skills_cache';

// 从 localStorage 加载缓存的 skills
const loadCachedSkills = (): Skill[] => {
  try {
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
  // 下发状态缓存：key 是 skillId，value 是摘要
  const [distributionSummaries, setDistributionSummaries] = useState<Record<string, SkillDistributionSummary>>({});

  // skills 变化时同步到 localStorage
  useEffect(() => {
    saveCachedSkills(skills);
  }, [skills]);

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

  const filteredSkills = skills.filter((skill: any) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 ||
      skill.categories.some((catId: string) => selectedCategories.includes(catId));
    return matchesSearch && matchesCategory;
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

  const getDistributionStatusDisplay = (skill: any) => {
    const summary = distributionSummaries[skill.id];
    if (!summary) return null;
    if (summary.lastDistributionStatus === 'not_distributed') return null;

    const isDistributing = summary.lastDistributionStatus === 'distributing';

    let label: string;
    let colorClass: string;

    if (isDistributing) {
      label = `下发中 ${summary.lastDistributionProgress}%`;
      colorClass = 'text-blue-600 bg-blue-50';
    } else {
      const total = summary.lastDistributionInstanceCount || 0;
      const success = summary.lastDistributionSuccessCount ?? total;
      label = `已下发(${success}/${total}成功)`;
      if (success === total) {
        // 全部成功：绿色底绿色字
        colorClass = 'text-green-700 bg-green-50';
      } else {
        // 部分成功：黄色底黄色字
        colorClass = 'text-yellow-700 bg-yellow-50';
      }
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDefaultTabForDetail('distribution');
          setSelectedSkillId(skill.id);
        }}
        className={`inline-block px-3 py-1 rounded text-sm font-medium ${colorClass} cursor-pointer hover:opacity-80 transition-opacity`}
      >
        {label}
      </button>
    );
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
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategories(prev =>
                  prev.includes(cat.id)
                    ? prev.filter(id => id !== cat.id)
                    : [...prev, cat.id]
                );
              }}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                selectedCategories.includes(cat.id)
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
          {sortedSkills.map(skill => (
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
                <TooltipProvider>
                  <Tooltip delayDuration={1000}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSkillId(skill.id);
                          setEditingSkillCategories(skill.categories);
                          setEditCategoryDialogOpen(true);
                        }}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors ml-1"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                      仅修改Skill的分类，近期会上线更新功能，届时可更换文件或修改Skill名称等信息。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* 描述 */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{skill.description}</p>

              {/* 下发状态 */}
              {getDistributionStatusDisplay(skill) && (
                <div className="mb-3">
                  {getDistributionStatusDisplay(skill)}
                </div>
              )}

              {/* 下发按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDistribute(skill.id);
                }}
                disabled={isDistributing(skill.id)}
                className={`w-full cursor-pointer ${
                  isDistributing(skill.id)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                title={isDistributing(skill.id) ? '有下发任务进行中，请等待完成' : ''}
              >
                <Send className="w-4 h-4 mr-2" />
                {isDistributing(skill.id) ? '下发中' : '下发'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 列表视图 */}
      {viewMode === 'list' && sortedSkills.length > 0 && (
        <div className="space-y-3">
          {sortedSkills.map(skill => (
            <div
              key={skill.id}
              onClick={() => handleViewDetail(skill.id)}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-all cursor-pointer hover:shadow-md hover:bg-gray-50"
            >
              {/* 第一行：名称 + 版本 + 分类 + 状态 + 下发按钮 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                    v{skill.version}
                  </span>
                  <div className="flex flex-wrap gap-1 items-center">
                    {skill.categories.map((catId: string) => (
                      <span
                        key={catId}
                        className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {getCategoryName(catId)}
                      </span>
                    ))}
                    <TooltipProvider>
                      <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSkillId(skill.id);
                              setEditingSkillCategories(skill.categories);
                              setEditCategoryDialogOpen(true);
                            }}
                            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors ml-1"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                          仅修改Skill的分类，近期会上线更新功能，届时可更换文件或修改Skill名称等信息。
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* 下发状态 */}
                {getDistributionStatusDisplay(skill) && (
                  <div className="mx-3">
                    {getDistributionStatusDisplay(skill)}
                  </div>
                )}

                {/* 下发按钮 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDistribute(skill.id);
                  }}
                  disabled={isDistributing(skill.id)}
                  className={`shrink-0 cursor-pointer ml-2 ${
                    isDistributing(skill.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  title={isDistributing(skill.id) ? '有下发任务进行中，请等待完成' : ''}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isDistributing(skill.id) ? '下发中' : '下发'}
                </Button>
              </div>
              {/* 第二行：描述 */}
              <p className="text-sm text-gray-600 line-clamp-2">{skill.description}</p>
            </div>
          ))}
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
          onDistributionStart={handleDistributeStart}
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

    </div>
  );
}
