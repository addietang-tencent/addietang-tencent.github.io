import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Upload, X, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import JSZip from 'jszip';
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
  status: 'success' | 'error' | 'pending' | 'parsing';
  error?: string;
  skillmdContent?: string;
  skillmdParsed?: {
    name?: string;
    description?: string;
  };
  files?: Array<{ name: string; size: number }>;
}

// 解析 SKILL.md 文件内容
const parseSkillMd = (content: string): { name?: string; description?: string } | null => {
  const lines = content.split('\n').map(line => line.trim());
  
  // 检查第一行是否为 ---
  if (lines[0] !== '---') {
    return null;
  }

  const result: { name?: string; description?: string } = {};
  
  // 从第二行开始解析 name 和 description
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('---')) {
      break;
    }
    
    if (line.startsWith('name:')) {
      result.name = line.substring(5).trim();
    } else if (line.startsWith('description:')) {
      result.description = line.substring(12).trim();
    }
  }

  return Object.keys(result).length > 0 ? result : null;
};

// 真实 ZIP 文件解析
const parseZipFile = async (file: File): Promise<{
  files: Array<{ name: string; size: number }>;
  skillmdContent?: string;
  skillmdParsed?: { name?: string; description?: string };
  error?: string;
}> => {
  try {
    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);
    
    const files: Array<{ name: string; size: number }> = [];
    let skillmdContent: string | undefined;
    let skillmdFound = false;

    // 遍历 ZIP 中的所有文件
    loaded.forEach((relativePath, zipEntry) => {
      // 跳过文件夹
      if (zipEntry.dir) {
        return;
      }

      // 检查是否是根目录下的 SKILL.md（不区分大小写）
      const pathParts = relativePath.split('/');
      if (pathParts.length === 1 && pathParts[0].toLowerCase() === 'skill.md') {
        skillmdFound = true;
      }

      // 记录文件信息
      files.push({
        name: relativePath,
        size: (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize : 0,
      });
    });

    // 排序文件列表，SKILL.md 放第一个
    files.sort((a, b) => {
      if (a.name.toLowerCase() === 'skill.md') return -1;
      if (b.name.toLowerCase() === 'skill.md') return 1;
      return a.name.localeCompare(b.name);
    });

    // 如果找到 SKILL.md，读取其内容
    if (skillmdFound) {
      const skillmdEntry = Object.keys(loaded.files).find(
        key => key.toLowerCase() === 'skill.md'
      );
      if (skillmdEntry) {
        skillmdContent = await loaded.file(skillmdEntry)!.async('text');
      }
    }

    const skillmdParsed = skillmdContent ? parseSkillMd(skillmdContent) : undefined;

    return {
      files,
      skillmdContent,
      skillmdParsed: skillmdParsed || undefined,
    };
  } catch (error) {
    return {
      files: [],
      error: `ZIP 文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
};

export default function SkillUploadDialog({ open, onOpenChange, onConfirm }: SkillUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当对话框关闭时，清空上传状态
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setUploadedFiles([]);
      setExpandedFile(null);
      setFormData({
        slug: '',
        name: '',
        description: '',
        version: '1.0.0',
        categories: [],
      });
    }
    onOpenChange(newOpen);
  };
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    version: '1.0.0',
    categories: [] as string[],
  });

  const hasSuccessfulUpload = uploadedFiles.some(f => f.status === 'success');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // 新上传时删除旧的
    setUploadedFiles([]);
    setExpandedFile(null);
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

      // 创建解析中的文件项
      const uploadedFile: UploadedFile = {
        name: fileName,
        size: file.size,
        status: 'parsing',
      };

      newFiles.push(uploadedFile);
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);

    // 异步解析文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.zip')) continue;

      const parseResult = await parseZipFile(file);
      
      // 检查是否存在 SKILL.md
      const hasSKILLMd = parseResult.files.some(f => f.name.toLowerCase() === 'skill.md');
      
      setUploadedFiles(prev => {
        const updated = [...prev];
        const fileIndex = updated.findIndex(f => f.name === file.name);
        
        if (fileIndex !== -1) {
          if (parseResult.error) {
            // ZIP 解析失败
            updated[fileIndex] = {
              name: file.name,
              size: file.size,
              status: 'error',
              error: parseResult.error,
            };
          } else if (!hasSKILLMd) {
            // 没有 SKILL.md
            updated[fileIndex] = {
              name: file.name,
              size: file.size,
              status: 'error',
              error: '不存在 SKILL.md 文件或者不在根目录下，请修改后重试',
              files: parseResult.files,
            };
          } else {
            // 解析成功
            updated[fileIndex] = {
              name: file.name,
              size: file.size,
              status: 'success',
              files: parseResult.files,
              skillmdContent: parseResult.skillmdContent,
              skillmdParsed: parseResult.skillmdParsed,
            };

            // 自动填充表单数据
            if (parseResult.skillmdParsed?.name && !formData.name) {
              setFormData(prev => ({ ...prev, name: parseResult.skillmdParsed!.name! }));
            }
            if (parseResult.skillmdParsed?.description && !formData.description) {
              setFormData(prev => ({ ...prev, description: parseResult.skillmdParsed!.description! }));
            }
          }
        }
        
        return updated;
      });
    }
  };

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // 新上传时删除旧的
    setUploadedFiles([]);
    setExpandedFile(null);

    const folderName = '文件夹上传';
    
    // 创建解析中的文件夹项
    setUploadedFiles([{
      name: folderName,
      size: 0,
      status: 'parsing',
    }]);

    // 异步处理文件夹上传
    setTimeout(async () => {
      const fileList: { name: string; size: number }[] = [];
      let skillmdContent: string | undefined;
      let skillmdFound = false;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        fileList.push({
          name: file.webkitRelativePath || file.name,
          size: file.size,
        });

        // 检查是否是 SKILL.md
        if ((file.webkitRelativePath || file.name).toLowerCase().endsWith('skill.md')) {
          const pathParts = (file.webkitRelativePath || file.name).split('/');
          if (pathParts.length === 2 && pathParts[0] && pathParts[1].toLowerCase() === 'skill.md') {
            skillmdFound = true;
            skillmdContent = await file.text();
          }
        }
      }

      // 只保留 SKILL.md 文件在列表中显示
      const skillmdFile = fileList.find(f => f.name.toLowerCase().endsWith('skill.md'));
      const displayFiles = skillmdFile ? [{ name: 'SKILL.md', size: skillmdFile.size }] : [];

      const skillmdParsed = skillmdContent ? parseSkillMd(skillmdContent) : undefined;

      if (!skillmdFound) {
        setUploadedFiles(prev => prev.map(f => 
          f.name === folderName 
            ? {
                name: folderName,
                size: 0,
                status: 'error',
                error: '不存在 Skill.md 文件或者不在根目录下，请修改后重试',
                files: displayFiles,
              }
            : f
        ));
      } else {
        setUploadedFiles(prev => prev.map(f => 
          f.name === folderName 
            ? {
                name: folderName,
                size: 0,
                status: 'success',
                files: displayFiles,
                skillmdContent,
                skillmdParsed: skillmdParsed || undefined,
              }
            : f
        ));

        // 自动填充表单数据
        if (skillmdParsed?.name && !formData.name) {
          setFormData(prev => ({ ...prev, name: skillmdParsed.name! }));
        }
        if (skillmdParsed?.description && !formData.description) {
          setFormData(prev => ({ ...prev, description: skillmdParsed.description! }));
        }
      }
    }, 0);
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.name !== fileName));
    // 删除文件时，也清空表单数据
    setFormData({
      slug: '',
      name: '',
      description: '',
      version: '1.0.0',
      categories: [],
    });
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
      content: `# ${formData.name}\n\n${formData.description}`,
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                <Button 
                  variant="outline"
                  onClick={() => folderInputRef.current?.click()}
                >
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
              <input
                ref={folderInputRef}
                type="file"
                multiple
                onChange={handleFolderSelect}
                className="hidden"
                {...({ webkitdirectory: '' } as any)}
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
                        {file.status !== 'parsing' && (
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
                        )}
                        {file.status === 'parsing' && (
                          <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                        )}

                        <div className="flex items-center gap-2">
                          {file.status === 'success' && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          {file.status === 'parsing' && (
                            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                          )}
                          {file.status === 'pending' && (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                          )}
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {file.status === 'parsing' && '正在解析...'}
                              {file.status === 'success' && file.files && `包含 ${file.files.length} 个文件`}
                              {file.status === 'error' && file.error}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.status === 'success' && (
                          <span className="text-xs font-medium text-green-600">成功</span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-xs font-medium text-red-600">失败</span>
                        )}
                        {file.status !== 'parsing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(file.name)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 文件详情展开 */}
                    {expandedFile === file.name && file.files && file.status !== 'parsing' && (
                      <div className="border-t border-gray-200 bg-white p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">查看文件列表</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {file.files.map((f) => (
                            <div key={f.name} className="flex justify-between text-xs text-gray-600">
                              <span>{f.name}</span>
                              <span>{(f.size / 1024).toFixed(2)} KB</span>
                            </div>
                          ))}
                        </div>

                        {file.skillmdParsed && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">SKILL.md 校验通过</p>
                            <div className="text-xs text-green-600 space-y-1">
                              {file.skillmdParsed.name && (
                                <p>
                                  <span className="font-medium">name:</span> {file.skillmdParsed.name}
                                </p>
                              )}
                              {file.skillmdParsed.description && (
                                <p>
                                  <span className="font-medium">description:</span>{' '}
                                  {file.skillmdParsed.description}
                                </p>
                              )}
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

          {/* 技能信息表单 - 只有在上传成功后才启用 */}
          <div className={`space-y-4 border-t border-gray-200 pt-4 ${!hasSuccessfulUpload ? 'opacity-50 pointer-events-none' : ''}`}>
            <Label className="text-base font-semibold">技能信息</Label>

            <div>
              <Label htmlFor="slug" className="text-sm">
                唯一标识 (slug) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                disabled={!hasSuccessfulUpload}
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g., doc-summarizer"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Skill 的唯一标识符，仅允许小写字母、数字和连字符</p>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm">
                显示名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                disabled={!hasSuccessfulUpload}
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
              <Textarea
                id="description"
                disabled={!hasSuccessfulUpload}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="技能的简要描述"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="version" className="text-sm">
                版本号 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="version"
                disabled={!hasSuccessfulUpload}
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
                    disabled={!hasSuccessfulUpload}
                    onClick={() => {
                      if (!hasSuccessfulUpload) return;
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
                    } ${!hasSuccessfulUpload ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          {!hasSuccessfulUpload && uploadedFiles.length === 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              请先上传 Skill 文件，然后填写技能信息
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={!hasSuccessfulUpload}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发布 Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
