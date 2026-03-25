import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Grid3x3, List } from 'lucide-react';
import { useLocation } from 'wouter';
import { MOCK_SKILLS, DEFAULT_CATEGORIES } from './mockData';
import SkillUploadDialog from './SkillUploadDialog';
import SkillDetail from './SkillDetail';

interface SkillListTabProps {
  onSelectSkill?: (skillId: string) => void;
}

export default function SkillListTab({ onSelectSkill }: SkillListTabProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [skills, setSkills] = useState(MOCK_SKILLS);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

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
    if (sortBy === 'desc') {
      return b.uploadTime.getTime() - a.uploadTime.getTime();
    } else {
      return a.uploadTime.getTime() - b.uploadTime.getTime();
    }
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

  // 如果选中了 Skill，显示详情页
  if (selectedSkillId) {
    return (
      <SkillDetail
        skillId={selectedSkillId}
        onBack={() => setSelectedSkillId(null)}
        skills={skills}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索技能名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'asc' | 'desc')}>
            <SelectTrigger className="w-40 bg-white border border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">上传时间倒序</SelectItem>
              <SelectItem value="asc">上传时间顺序</SelectItem>
            </SelectContent>
          </Select>
          
          {/* 视图切换 */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'card'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="卡片视图"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => setUploadDialogOpen(true)}>
            + 发布 Skill
          </Button>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {DEFAULT_CATEGORIES.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategories(prev =>
                prev.includes(cat.id)
                  ? prev.filter(id => id !== cat.id)
                  : [...prev, cat.id]
              );
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategories.includes(cat.id)
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
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
              className="rounded-lg border border-gray-200 bg-white p-4 transition-all cursor-pointer hover:shadow-md"
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

              {/* 查看详情按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetail(skill.id);
                }}
                className="w-full cursor-pointer"
              >
                查看详情
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
              className="rounded-lg border border-gray-200 bg-white p-4 transition-all cursor-pointer hover:shadow-md"
            >
              {/* 第一行：名称 + 版本 + 分类 + 查看详情按钮 */}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetail(skill.id);
                  }}
                  className="shrink-0 cursor-pointer ml-2"
                >
                  查看详情
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
    </div>
  );
}