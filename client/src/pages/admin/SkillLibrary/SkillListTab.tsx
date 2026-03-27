import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Search, Grid3x3, List, Send, Edit2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { MOCK_SKILLS, DEFAULT_CATEGORIES, MOCK_OPENCLAW_INSTANCES } from './mockData';
import SkillUploadDialog from './SkillUploadDialog';
import SkillDetail from './SkillDetail';
import DistributeDialog from './DistributeDialog';
import EditCategoriesDialog from './EditCategoriesDialog';

interface SkillListTabProps {
  onSelectSkill?: (skillId: string) => void;
}

export default function SkillListTab({ onSelectSkill }: SkillListTabProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [skills, setSkills] = useState(MOCK_SKILLS);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [batchDistributeSkillId, setBatchDistributeSkillId] = useState<string | null>(null);
  const [batchDistributeDialogOpen, setBatchDistributeDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [distributeSkillId, setDistributeSkillId] = useState<string | null>(null);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

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
    const newSkill = {
      id: `skill-${Date.now()}`,
      ...skillData,
      uploadTime: new Date(),
    };
    setSkills([...skills, newSkill]);
  };

  const handleViewDetail = (skillId: string) => {
    if (onSelectSkill) {
      onSelectSkill(skillId);
    } else {
      setSelectedSkillId(skillId);
    }
  };

  const handleBatchDistribute = (skillId: string) => {
    setBatchDistributeSkillId(skillId);
    setBatchDistributeDialogOpen(true);
  };

  const handleDistribute = (skillId: string) => {
    setDistributeSkillId(skillId);
    setDistributeDialogOpen(true);
  };

  const handleDistributeStart = (selectedInstanceIds: string[]) => {
    // 更新 skill 的下发状态
    setSkills(skills.map(skill =>
      skill.id === distributeSkillId
        ? {
            ...skill,
            lastDistributionStatus: 'in_progress',
            lastDistributionProgress: 0,
            lastDistributionTime: new Date(),
          }
        : skill
    ));

    // 模拟进度更新
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        // 完成下发
        setSkills(prevSkills =>
          prevSkills.map(skill =>
            skill.id === distributeSkillId
              ? {
                  ...skill,
                  lastDistributionStatus: 'success',
                  lastDistributionProgress: 100,
                }
              : skill
          )
        );
      } else {
        setSkills(prevSkills =>
          prevSkills.map(skill =>
            skill.id === distributeSkillId
              ? {
                  ...skill,
                  lastDistributionProgress: Math.min(progress, 99),
                }
              : skill
          )
        );
      }
    }, 1000);
  };

  const handleViewDistributeProgress = () => {
    // 跳转到详情页的安装方式 Tab
    if (distributeSkillId) {
      handleViewDetail(distributeSkillId);
      setDistributeDialogOpen(false);
    }
  };

  const getDistributionStatusDisplay = (skill: any) => {
    if (!skill.lastDistributionStatus) return null;

    const statusConfig: Record<string, { label: string; color: string }> = {
      'in_progress': { label: `下发中 ${(skill.lastDistributionProgress || 0).toFixed(1)}%`, color: 'text-blue-600 bg-blue-50' },
      'success': { label: '下发成功', color: 'text-green-600 bg-green-50' },
      'partial': { label: '部分成功', color: 'text-yellow-600 bg-yellow-50' },
      'failed': { label: '下发失败', color: 'text-red-600 bg-red-50' },
    };

    const config = statusConfig[skill.lastDistributionStatus];
    if (!config) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          // 跳转到详情-安装方式 Tab
          setSelectedSkillId(skill.id);
          // 设置默认 Tab 为安装方式
          setTimeout(() => {
            const tabTrigger = document.querySelector('[value="安装方式"]') as HTMLElement;
            if (tabTrigger) tabTrigger.click();
          }, 100);
        }}
        className={`inline-block px-3 py-1 rounded text-sm font-medium ${config.color} cursor-pointer hover:opacity-80 transition-opacity`}
      >
        {config.label}
      </button>
    );
  };

  // 如果选中了 Skill，显示详情页
  if (selectedSkillId) {
    return (
      <SkillDetail
        skillId={selectedSkillId}
        skills={skills}
        onBack={() => setSelectedSkillId(null)}
        defaultTab="overview"
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
        {categories.length > 0 && (
          <button
            onClick={() => setEditCategoryDialogOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="编辑分类"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
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
              <div className="flex flex-wrap gap-1 mb-3">
                {skill.categories.map((catId: string) => (
                  <span
                    key={catId}
                    className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {getCategoryName(catId)}
                  </span>
                ))}
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
                disabled={skill.lastDistributionStatus === 'in_progress'}
                className={`w-full cursor-pointer ${
                  skill.lastDistributionStatus === 'in_progress'
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                title={skill.lastDistributionStatus === 'in_progress' ? '安装中' : ''}
              >
                <Send className="w-4 h-4 mr-2" />
                {skill.lastDistributionStatus === 'in_progress' ? '安装中' : '下发'}
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
                  <div className="flex flex-wrap gap-1">
                    {skill.categories.map((catId: string) => (
                      <span
                        key={catId}
                        className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {getCategoryName(catId)}
                      </span>
                    ))}
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
                  disabled={skill.lastDistributionStatus === 'in_progress'}
                  className={`shrink-0 cursor-pointer ml-2 ${
                    skill.lastDistributionStatus === 'in_progress'
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  title={skill.lastDistributionStatus === 'in_progress' ? '安装中' : ''}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {skill.lastDistributionStatus === 'in_progress' ? '安装中' : '下发'}
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
      />

      {distributeSkillId && (
        <DistributeDialog
          open={distributeDialogOpen}
          onOpenChange={setDistributeDialogOpen}
          skillName={skills.find(s => s.id === distributeSkillId)?.name || ''}
          instances={MOCK_OPENCLAW_INSTANCES}
          onDistribute={handleDistributeStart}
          onViewProgress={handleViewDistributeProgress}
        />
      )}

      {/* 编辑分类弹窗 */}
      <EditCategoriesDialog
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
        categories={categories}
        selectedCategoryIds={selectedCategories}
        onConfirm={(selectedCategoryIds) => {
          setSelectedCategories(selectedCategoryIds);
        }}
      />

    </div>
  );
}
