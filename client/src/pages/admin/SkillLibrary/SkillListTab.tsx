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
import { Plus, Search } from 'lucide-react';
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
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索技能名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'asc' | 'desc')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">上传时间倒序</SelectItem>
              <SelectItem value="asc">上传时间顺序</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            上传
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

      {/* 列表视图（卡片式）*/}
      <div className="space-y-3">
        {sortedSkills.map(skill => (
          <div
            key={skill.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                    v{skill.version}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{skill.description}</p>
                <div className="flex items-center gap-2">
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
              </div>
              <div className="text-right text-xs text-gray-500 ml-4 shrink-0">
                {skill.uploadTime.toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SkillUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onConfirm={handleUploadSkill}
      />
    </div>
  );
}
