import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { Skill } from './types';
import { DEFAULT_CATEGORIES } from './mockData';

interface SkillUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (skill: Skill) => void;
}

export default function SkillUploadDialog({ open, onOpenChange, onConfirm }: SkillUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [skillDescription, setSkillDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.zip')) {
      setFile(selectedFile);
      // 这里可以模拟解析 SKILL.md
      if (!name) setName('My Awesome Skill');
      if (!description) setDescription('简要描述你的 Skill...');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.zip')) {
      setFile(droppedFile);
    }
  };

  const handlePublish = () => {
    if (!slug || !name || !version) {
      alert('请填写必填字段');
      return;
    }

    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      slug,
      name,
      description,
      version,
      categories: selectedCategories,
      uploadTime: new Date(),
      content: skillDescription,
    };

    onConfirm(newSkill);
    resetForm();
  };

  const resetForm = () => {
    setFile(null);
    setSlug('');
    setName('');
    setDescription('');
    setVersion('');
    setSelectedCategories([]);
    setSkillDescription('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>发布新技能</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 文件上传 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">文件上传</label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">点击/拖拽文件上传到企业专属Skill库</p>
              <p className="text-xs text-gray-500 mb-3">仅支持 .zip文件/文件夹 （最大50MB）</p>
              <p className="text-xs text-gray-500 mb-4">SKILL.md 需位于根目录下</p>
              <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Button variant="outline" className="cursor-pointer">
                  选择文件
                </Button>
              </label>
              {file && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600">
                  <span>✓ {file.name}</span>
                  <button onClick={() => setFile(null)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 唯一标识 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              唯一标识（slug） <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="my-awesome-skill"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Skill 的唯一标识符，仅允许小写字母、数字和连字符</p>
          </div>

          {/* 显示名称 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              显示名称 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="My Awesome Skill"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">描述</label>
            <Input
              placeholder="简要描述你的 Skill..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">分类</label>
            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* 版本号 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              版本号 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="x.x.x，例如1.0.1"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Skill 描述 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Skill 描述</label>
            <Textarea
              placeholder="输入 Skill 的详细描述..."
              value={skillDescription}
              onChange={(e) => setSkillDescription(e.target.value)}
              className="w-full"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handlePublish}>
            发布 Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
