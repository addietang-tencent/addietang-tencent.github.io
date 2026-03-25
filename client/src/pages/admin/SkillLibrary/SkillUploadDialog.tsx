import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Upload, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Skill } from './types';
import { DEFAULT_CATEGORIES } from './mockData';

interface SkillUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (skill: Skill) => void;
}

interface UploadedFile {
  name: string;
  size: number;
  status: 'success' | 'error' | 'pending';
  error?: string;
  skillmdContent?: string;
  skillmdParsed?: {
    name?: string;
    description?: string;
  };
  files?: Array<{ name: string; size: number }>;
}

export default function SkillUploadDialog({ open, onOpenChange, onConfirm }: SkillUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    version: '1.0.0',
    categories: [] as string[],
    skillDescription: '',
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;

      if (!fileName.endsWith('.zip')) {
        newFiles.push({
          name: fileName,
          size: file.size,
          status: 'error',
          error: '只支持 ZIP 文件',
        });
        continue;
      }

      // 模拟 ZIP 文件解析
      const uploadedFile: UploadedFile = {
        name: fileName,
        size: file.size,
        status: 'pending',
        files: [
          { name: 'SKILL.md', size: 2.5 },
          { name: '_meta.json', size: 0.5 },
          { name: 'config.yaml', size: 1.2 },
        ],
      };

      // 模拟 SKILL.md 解析
      const skillmdContent = `# ${fileName.replace('.zip', '')}\n\nThis is a sample skill description.`;
      uploadedFile.skillmdContent = skillmdContent;
      uploadedFile.skillmdParsed = {
        name: fileName.replace('.zip', ''),
        description: 'Sample skill description',
      };

      // 检查 SKILL.md 是否包含 description
      if (uploadedFile.skillmdParsed?.description) {
        uploadedFile.status = 'success';
      } else {
        uploadedFile.status = 'error';
        uploadedFile.error = 'SKILL.md 必须包含 description 字段';
      }

      newFiles.push(uploadedFile);
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.name !== fileName));
  };

  const handlePublish = () => {
    const successFiles = uploadedFiles.filter(f => f.status === 'success');
    if (successFiles.length === 0) {
      alert('请先上传有效的 Skill ZIP 文件');
      return;
    }

    if (!formData.slug || !formData.name || !formData.version) {
      alert('请填写所有必填字段');
      return;
    }

    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      slug: formData.slug,
      name: formData.name,
      description: formData.description,
      version: formData.version,
      categories: formData.categories,
      uploadTime: new Date(),
      content: formData.skillDescription,
    };

    onConfirm(newSkill);

    // 重置表单
    setUploadedFiles([]);
    setFormData({
      slug: '',
      name: '',
      description: '',
      version: '1.0.0',
      categories: [],
      skillDescription: '',
    });
    onOpenChange(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files) {
      const event = {
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>发布新技能</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 文件上传区域 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">选择上传方式</Label>
            <p className="text-sm text-gray-600">支持 ZIP 文件或选择整个文件夹上传</p>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">点击或拖拽文件上传</p>
              <p className="text-xs text-gray-500 mb-3">支持 ZIP 文件或选择整个文件夹上传</p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  上传 ZIP
                </Button>
                <Button variant="outline">
                  选择文件夹
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* 已上传文件列表 */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">已上传文件</Label>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.name} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* 文件项头部 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => setExpandedFile(expandedFile === file.name ? null : file.name)}
                          className="flex items-center gap-1"
                        >
                          {expandedFile === file.name ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          {file.status === 'success' && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          {file.status === 'pending' && (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                          )}
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {file.files ? `包含 ${file.files.length} 个文件` : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.status === 'success' && (
                          <span className="text-xs font-medium text-green-600">成功</span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-xs font-medium text-red-600">{file.error}</span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.name)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 文件详情展开 */}
                    {expandedFile === file.name && file.files && (
                      <div className="border-t border-gray-200 bg-white p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">查看文件列表</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {file.files.map((f) => (
                            <div key={f.name} className="flex justify-between text-xs text-gray-600">
                              <span>{f.name}</span>
                              <span>{f.size} KB</span>
                            </div>
                          ))}
                        </div>

                        {file.skillmdParsed && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">SKILL.md 校验通过</p>
                            <div className="text-xs text-green-600 space-y-1">
                              <p>
                                <span className="font-medium">name:</span> {file.skillmdParsed.name}
                              </p>
                              <p>
                                <span className="font-medium">description:</span>{' '}
                                {file.skillmdParsed.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 技能信息表单 */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <Label className="text-base font-semibold">技能信息</Label>

            <div>
              <Label htmlFor="slug" className="text-sm">
                唯一标识 (slug) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g., doc-summarizer"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="name" className="text-sm">
                显示名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 文档总结助手"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm">
                描述
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="技能的简要描述"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="version" className="text-sm">
                版本号 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g., 1.0.0"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">分类</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DEFAULT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        categories: prev.categories.includes(cat.id)
                          ? prev.categories.filter(id => id !== cat.id)
                          : [...prev.categories, cat.id]
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.categories.includes(cat.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="skillDescription" className="text-sm">
                技能描述
              </Label>
              <Textarea
                id="skillDescription"
                value={formData.skillDescription}
                onChange={(e) => setFormData({ ...formData, skillDescription: e.target.value })}
                placeholder="技能的详细描述（支持 Markdown 格式）"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handlePublish} className="bg-blue-600 hover:bg-blue-700">
            发布 Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
