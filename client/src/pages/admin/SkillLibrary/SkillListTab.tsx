import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Grid3x3, List } from 'lucide-react';
import { MOCK_SKILLS, DEFAULT_CATEGORIES } from './mockData';
import { Skill } from './types';
import SkillUploadDialog from './SkillUploadDialog';

export default function SkillListTab() {
  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 ||
      skill.categories.some(cat => selectedCategories.includes(cat));
    return matchesSearch && matchesCategory;
  });

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    const timeA = a.uploadTime.getTime();
    const timeB = b.uploadTime.getTime();
    return sortBy === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const handleUploadSkill = (newSkill: Skill) => {
    setSkills([...skills, newSkill]);
    setUploadDialogOpen(false);
  };

  const getCategoryName = (id: string) => {
    return DEFAULT_CATEGORIES.find(cat => cat.id === id)?.name || id;
  };

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 mb-4">还没有发布任何 SKILL</p>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          +发布SKILL
        </Button>
        <SkillUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onConfirm={handleUploadSkill}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索技能名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          上传
        </Button>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DEFAULT_CATEGORIES.map(cat => (
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
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 排序 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">排序：</span>
        <button
          onClick={() => setSortBy('desc')}
          className={`px-3 py-1 rounded text-sm ${
            sortBy === 'desc'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          上传时间倒序
        </button>
        <button
          onClick={() => setSortBy('asc')}
          className={`px-3 py-1 rounded text-sm ${
            sortBy === 'asc'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          上传时间顺序
        </button>
      </div>

      {/* 列表/网格视图 */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {sortedSkills.map(skill => (
            <div
              key={skill.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    版本 {skill.version} • {skill.uploadTime.toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
              <div className="flex flex-wrap gap-2">
                {skill.categories.map(catId => (
                  <span
                    key={catId}
                    className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {getCategoryName(catId)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {sortedSkills.map(skill => (
            <div
              key={skill.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{skill.name}</h3>
              <p className="text-xs text-gray-500 mb-3">v{skill.version}</p>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{skill.description}</p>
              <div className="flex flex-wrap gap-1">
                {skill.categories.map(catId => (
                  <span
                    key={catId}
                    className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {getCategoryName(catId)}
                  </span>
                ))}
              </div>
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
