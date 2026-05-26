import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, AlertTriangle, X, ChevronDown, ChevronRight, Loader, FileText, Download, Search as SearchIcon, Check, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatusTag } from '@/components/ui/status-tag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import JSZip from 'jszip';
import { Skill, type SkillScope } from './types';
import { DEFAULT_CATEGORIES, MOCK_GROUPS } from './mockData';
import { downloadSampleSkillZip } from './downloadUtils';

interface SkillUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (skill: Skill) => void;
  existingSlugs?: string[];
  defaultSecurityScan?: boolean;
  onDefaultSecurityScanChange?: (value: boolean) => void;
  securityServiceActive?: boolean;
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
  files?: Array<{ name: string; size: number; content?: string }>;
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
// 可读取内容的文本文件扩展名
const TEXT_EXTENSIONS = ['.md', '.mdx', '.xml', '.json', '.txt', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.sh', '.bat', '.py', '.js', '.ts', '.css', '.html', '.htm', '.svg', '.env', '.gitignore', '.dockerfile'];

const isTextFile = (name: string) => {
  const lower = name.toLowerCase();
  if (!lower.includes('.') && !lower.includes('/')) return true; // Dockerfile, Makefile 等
  return TEXT_EXTENSIONS.some(ext => lower.endsWith(ext));
};

const parseZipFile = async (file: File): Promise<{
  files: Array<{ name: string; size: number; content?: string }>;
  skillmdContent?: string;
  skillmdParsed?: { name?: string; description?: string };
  error?: string;
}> => {
  try {
    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);
    
    const files: Array<{ name: string; size: number; content?: string }> = [];
    let skillmdContent: string | undefined;
    let skillmdFound = false;
    const fileEntries: Array<{ relativePath: string; zipEntry: JSZip.JSZipObject }> = [];

    // 遍历 ZIP 中的所有文件
    loaded.forEach((relativePath, zipEntry) => {
      // 跳过文件夹
      if (zipEntry.dir) {
        return;
      }

      // 跳过系统文件（Mac 系统文件）
      if (relativePath.startsWith('__MACOSX/') || relativePath.endsWith('.DS_Store')) {
        return;
      }

      // 检查是否是 SKILL.md（不区分大小写）
      if (relativePath.toLowerCase().endsWith('skill.md')) {
        skillmdFound = true;
      }

      fileEntries.push({ relativePath, zipEntry });
    });

    // 异步读取所有文本文件的内容
    for (const { relativePath, zipEntry } of fileEntries) {
      const size = (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize : 0;
      let content: string | undefined;

      // 对文本文件读取内容
      if (isTextFile(relativePath)) {
        try {
          content = await zipEntry.async('text');
        } catch {
          // 读取失败则不填充 content
        }
      }

      files.push({ name: relativePath, size, content });
    }

    // 排序文件列表，SKILL.md 放第一个
    files.sort((a, b) => {
      if (a.name.toLowerCase() === 'skill.md') return -1;
      if (b.name.toLowerCase() === 'skill.md') return 1;
      return a.name.localeCompare(b.name);
    });

    // 从已读取的文件中获取 SKILL.md 内容
    if (skillmdFound) {
      const skillmdFile = files.find(f => f.name.toLowerCase().endsWith('skill.md'));
      if (skillmdFile?.content) {
        skillmdContent = skillmdFile.content;
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

export default function SkillUploadDialog({ open, onOpenChange, onConfirm, existingSlugs = [], defaultSecurityScan = false, onDefaultSecurityScanChange = () => {}, securityServiceActive = true }: SkillUploadDialogProps) {
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
        scope: 'public',
        groupIds: [],
      });
      setGroupSearchQuery('');
      setEnableSecurityScan(false);
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
    scope: 'public' as SkillScope,
    groupIds: [] as string[],
  });
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [enableSecurityScan, setEnableSecurityScan] = useState(false);

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
      const hasSKILLMd = parseResult.files.some(f => f.name.toLowerCase().endsWith('skill.md'));
      
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
              error: '不存在 SKILL.md 文件，请修改后重试',
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
      const fileList: { name: string; size: number; content?: string }[] = [];
      let skillmdContent: string | undefined;
      let skillmdFound = false;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = file.webkitRelativePath || file.name;
        let content: string | undefined;

        // 对文本文件读取内容
        if (isTextFile(relativePath)) {
          try {
            content = await file.text();
          } catch {
            // 读取失败则不填充 content
          }
        }

        fileList.push({
          name: relativePath,
          size: file.size,
          content,
        });

        // 检查是否是 SKILL.md
        if (relativePath.toLowerCase().endsWith('skill.md')) {
          const pathParts = relativePath.split('/');
          if (pathParts.length === 2 && pathParts[0] && pathParts[1].toLowerCase() === 'skill.md') {
            skillmdFound = true;
            skillmdContent = content || await file.text();
          }
        }
      }

      // 保留所有文件，但不显示根目录本身
      const displayFiles = fileList.filter(f => {
        const pathParts = f.name.split('/');
        return pathParts.length > 1; // 排除根目录
      }).map(f => {
        const pathParts = f.name.split('/');
        return {
          name: pathParts.slice(1).join('/'), // 移除根目录前缀
          size: f.size,
          content: f.content,
        };
      });

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
      scope: 'public',
      groupIds: [],
    });
    setGroupSearchQuery('');
  };

  const handlePublish = () => {
    const successFiles = uploadedFiles.filter(f => f.status === 'success');
    if (successFiles.length === 0) {
      toast.error('请先上传有效的 Skill ZIP 文件');
      return;
    }

    if (!formData.slug || !formData.name || !formData.version) {
      toast.error('请填写所有必填字段');
      return;
    }

    // 校验 slug 格式
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error('slug 仅支持小写字母/数字/连字符 -');
      return;
    }

    // 校验 slug 是否重复
    if (existingSlugs.includes(formData.slug)) {
      toast.error('该 slug 已存在，请修改后重试');
      return;
    }

    const successFile = uploadedFiles.find(f => f.status === 'success');

    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      slug: formData.slug,
      name: formData.name,
      description: formData.description,
      version: formData.version,
      categories: formData.categories,
      scope: formData.scope,
      groupIds: formData.scope === 'public' ? [] : formData.groupIds,
      uploadTime: new Date(),
      content: successFile?.skillmdContent || `# ${formData.name}\n\n${formData.description}`,
      versions: [formData.version],
      files: successFile?.files || [],
      securityInfo: enableSecurityScan
        ? { overallStatus: 'scanning', engines: [] }
        : { overallStatus: 'not_scanned', engines: [] },
    };

    onConfirm(newSkill);

    // 显示成功提示
    toast.success('技能发布成功');

    // 重置表单
    setUploadedFiles([]);
    setFormData({
      slug: '',
      name: '',
      description: '',
      version: '1.0.0',
      categories: [],
      scope: 'public',
      groupIds: [],
    });
    setGroupSearchQuery('');
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
        <DialogContent className="sm:max-w-2xl" style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }} onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>发布新技能</DialogTitle>
          </DialogHeader>

        <DialogBody className="flex-1">
        <div className="space-y-5">
          {/* 提示文字 - 只有在没有上传文件时显示 */}
          {uploadedFiles.length === 0 && (
            <div
              role="alert"
              className="relative w-full rounded-[4px] border px-4 py-3 flex items-start gap-2 text-xs border-[#FCD28C] bg-[#FFFBED] text-[#181818] [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:mt-0.5 [&>svg]:text-[#FCA004]"
            >
              <AlertTriangle className="w-4 h-4" />
              <div className="flex-1 min-w-0 leading-5">
                <p>请先上传 Skill 文件，然后填写技能信息。</p>
              </div>
            </div>
          )}

          {/* 文件上传区域 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#0A0A0A]">
              {uploadedFiles.length > 0 ? '文件' : '选择上传方式'}
            </Label>
            {uploadedFiles.length > 0 && (
              <p className="text-xs text-[#737373]">
                如需替换，请先删除当前文件
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="ml-2 text-[#1447E6] hover:underline cursor-pointer">查看上传要求</button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[360px] p-4" align="start" side="bottom">
                    <ol className="text-xs text-[#737373] space-y-2 list-decimal pl-5">
                      <li>ZIP 包/文件夹 <strong>根目录</strong> 必须包含 SKILL.md 文件（建议 SKILL 大写）</li>
                      <li className="leading-relaxed">
                        SKILL.md 文件需包含 YAML 格式的技能名称和描述，name 和 description 后必须有空格
                        <pre className="mt-1.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] px-3 py-2 text-xs text-[#334155] font-mono whitespace-pre leading-relaxed">
{`---
name: skill-creator
description: this is a skill creator.
---`}
                        </pre>
                      </li>
                      <li>建议文件夹/ZIP 包名称和 name 名称保持一致</li>
                    </ol>
                  </PopoverContent>
                </Popover>
              </p>
            )}

            {uploadedFiles.length === 0 && (
            <>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border border-dashed rounded-[4px] p-4 text-center transition-colors border-[#E5E5E5] hover:border-[#1447E6]"
            >
              <p className="text-sm mb-3 text-[#737373]">
                点击或拖拽文件上传
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  上传 ZIP
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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

            {/* 上传要求卡片（含 下载样例 链接按钮）—— 放在虚线框外 */}
            <div className="border border-[#E5E5E5] rounded-[4px] p-4 text-left bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#0A0A0A]">
                  上传要求
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSampleSkillZip();
                    toast.success('样例文件下载中...');
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  下载样例
                </Button>
              </div>
              <ol className="text-xs text-[#737373] space-y-2 list-decimal pl-5">
                <li>ZIP 包/文件夹 <strong>根目录</strong> 必须包含 SKILL.md 文件（建议 SKILL 大写）</li>
                <li className="leading-relaxed">
                  SKILL.md 文件需包含 YAML 格式的技能名称和描述，name 和 description 后必须有空格
                  <pre className="mt-1.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] px-3 py-2 text-xs text-[#334155] font-mono whitespace-pre leading-relaxed">
{`---
name: skill-creator
description: this is a skill creator.
---`}
                  </pre>
                </li>
                <li>建议文件夹/ZIP 包名称和 name 名称保持一致</li>
              </ol>
            </div>
            </>
            )}
          </div>

          {/* 已上传文件列表 */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.name} className="border border-[#E5E5E5] rounded-[4px] bg-white overflow-hidden">
                  {/* 文件项头部 */}
                  <div
                    className="flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                    onClick={() => file.status !== 'parsing' && setExpandedFile(expandedFile === file.name ? null : file.name)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {file.status === 'success' && (
                        <span className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-[#525252]" />
                        </span>
                      )}
                      {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                      {file.status === 'parsing' && <Loader className="w-5 h-5 text-[#355EF1] animate-spin shrink-0" />}
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-normal text-[#0A0A0A]">{file.name}</p>
                        {file.status === 'success' && file.files && (
                          <span className="text-xs text-[#737373] shrink-0">包含 {file.files.length} 个文件</span>
                        )}
                        {file.status === 'parsing' && <span className="text-xs text-[#737373]">正在解析...</span>}
                        {file.status === 'error' && <span className="text-xs text-red-500 truncate">{file.error}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {file.status !== 'parsing' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRemoveFile(file.name); }} className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <span className="h-7 w-7 flex items-center justify-center">
                            {expandedFile === file.name ? <ChevronDown className="w-4 h-4 text-[#737373]" /> : <ChevronRight className="w-4 h-4 text-[#737373]" />}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 文件详情展开 */}
                  {expandedFile === file.name && file.files && file.status !== 'parsing' && (
                    <div className="border-t border-[#E5E5E5] bg-white p-3 space-y-2">
                      <p className="text-xs font-medium text-[#0A0A0A]">文件列表</p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {file.files.map((f) => (
                          <div key={f.name} className="flex justify-between text-xs text-[#737373]">
                            <span>{f.name}</span>
                            <span>{(f.size / 1024).toFixed(2)} KB</span>
                          </div>
                        ))}
                      </div>

                      {file.skillmdParsed && (
                        <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                          <p className="text-xs font-medium text-[#0A0A0A] mb-2">SKILL.md 校验通过</p>
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
          )}

          {/* 技能信息表单 - 只有在上传成功后才显示 */}
          {hasSuccessfulUpload && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="slug" className="text-sm font-medium text-[#0A0A0A]">
                唯一标识 (slug) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                disabled={!hasSuccessfulUpload}
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g., doc-summarizer-1"
                className="mt-1"
              />
              <p className="text-xs text-[#737373] mt-1">仅支持小写字母/数字/连字符 - 。企业内唯一，发布后不可修改。</p>
            </div>

          <div>
              <Label htmlFor="name" className="text-sm font-medium text-[#0A0A0A]">
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
              <Label htmlFor="description" className="text-sm font-medium text-[#0A0A0A]">
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
              <Label htmlFor="version" className="text-sm font-medium text-[#0A0A0A]">
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
              <Label className="text-sm font-medium text-[#0A0A0A]">分类</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DEFAULT_CATEGORIES.map(cat => {
                  const isSelected = formData.categories.includes(cat.id);
                  return (
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
                      className={`h-8 px-4 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border transition-colors whitespace-nowrap inline-flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#020617] border-[#020617] text-white'
                          : 'bg-white border-[#e4e4e4] text-[#020617] hover:border-[#020617]'
                      } ${!hasSuccessfulUpload ? 'cursor-not-allowed' : ''}`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 应用范围 */}
            <div>
              <Label className="text-sm font-medium text-[#0A0A0A]">应用范围</Label>
              <div className="mt-2 space-y-3">
                {/* 两个胶囊切换按钮 + 下拉框同行 */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={!hasSuccessfulUpload}
                    onClick={() => {
                      if (!hasSuccessfulUpload) return;
                      setFormData(prev => ({ ...prev, scope: 'public', groupIds: [] }));
                    }}
                    className={`h-8 px-4 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border transition-colors ${
                      formData.scope === 'public'
                        ? 'bg-[#020617] border-[#020617] text-white'
                        : 'bg-white border-[#e4e4e4] text-[#020617] hover:border-[#020617]'
                    } ${!hasSuccessfulUpload ? 'cursor-not-allowed' : ''}`}
                  >
                    全部用户
                  </button>
                  <button
                    disabled={!hasSuccessfulUpload}
                    onClick={() => {
                      if (!hasSuccessfulUpload) return;
                      setFormData(prev => ({ ...prev, scope: 'private' }));
                    }}
                    className={`h-8 px-4 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border transition-colors ${
                      formData.scope === 'private'
                        ? 'bg-[#020617] border-[#020617] text-white'
                        : 'bg-white border-[#e4e4e4] text-[#020617] hover:border-[#020617]'
                    } ${!hasSuccessfulUpload ? 'cursor-not-allowed' : ''}`}
                  >
                    按分组
                  </button>

                  {/* 选择按分组后，右侧出现下拉选择器 */}
                  {formData.scope === 'private' && hasSuccessfulUpload && (
                    <Popover>
                      <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <button className="flex items-center justify-between gap-2 h-8 px-4 flex-1 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border border-[#E5E5E5] bg-white text-[#0A0A0A] hover:border-[#1447E6] hover:bg-[#FAFAFA] data-[state=open]:border-[#1447E6] data-[state=open]:bg-[#FAFAFA] transition-colors">
                              <span className="truncate">
                                {formData.groupIds.length > 0
                                  ? `已选 ${formData.groupIds.length} 个分组`
                                  : '选择分组…'}
                              </span>
                              <ChevronDown className="w-3 h-3 text-[#A3A3A3] shrink-0" />
                            </button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        {formData.groupIds.length > 0 && (
                          <TooltipContent side="bottom" className="max-w-[280px]">
                            <p className="text-xs leading-relaxed">
                              {formData.groupIds.map(gid => MOCK_GROUPS.find(g => g.id === gid)?.name || gid).join('，')}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                      <PopoverContent className="w-64 p-0" align="start" sideOffset={6}>
                        <div className="p-2 border-b border-[#e5e5e5]">
                          <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                            <input
                              placeholder="搜索分组…"
                              value={groupSearchQuery}
                              onChange={(e) => setGroupSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E5E5E5] rounded-[4px] bg-[#FAFAFA] outline-none focus:border-[#1447E6] transition-colors"
                            />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1">
                          {MOCK_GROUPS
                            .filter(g => g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()))
                            .map(group => {
                              const checked = formData.groupIds.includes(group.id);
                              return (
                                <button
                                  key={group.id}
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      groupIds: prev.groupIds.includes(group.id)
                                        ? prev.groupIds.filter(id => id !== group.id)
                                        : [...prev.groupIds, group.id]
                                    }));
                                  }}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[4px] hover:bg-[#FAFAFA] transition-colors text-left"
                                >
                                  <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                                    checked ? 'bg-[#1447E6] border-[#1447E6]' : 'border-[#E5E5E5] bg-white'
                                  }`}>
                                    {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                  </span>
                                  <span className="text-xs text-[#0A0A0A] truncate">{group.name}</span>
                                </button>
                              );
                            })}
                          {MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).length === 0 && (
                            <p className="text-[11px] text-[#A3A3A3] py-3 text-center">无匹配分组</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 border-t border-[#E5E5E5]">
                          <p className="text-[11px] text-[#A3A3A3]">
                            已选 {formData.groupIds.length} 个分组
                          </p>
                          {formData.groupIds.length > 0 && (
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, groupIds: [] }))}
                              className="text-[11px] text-[#1447E6] hover:opacity-80 transition-opacity"
                            >
                              清除
                            </button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            {/* 安全检测 */}
            <div className="border border-[#E5E5E5] rounded-[4px] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0A0A0A]">提交后进行安全检测</span>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <span><StatusTag mode="fill" variant="blue" className="cursor-default">限免</StatusTag></span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[260px] leading-relaxed">
                      限时免费，该检测能力正在公测中，暂不收费，后续如需收费，仅对增量检测收费，并及时与您同步收费方式。
                    </TooltipContent>
                  </Tooltip>
                  {!securityServiceActive && (
                    <StatusTag mode="fill" variant="gray">未开通</StatusTag>
                  )}
                </div>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span>
                      <Switch
                        checked={enableSecurityScan}
                        onCheckedChange={(checked) => setEnableSecurityScan(checked)}
                        disabled={!hasSuccessfulUpload || !securityServiceActive}
                      />
                    </span>
                  </TooltipTrigger>
                  {!securityServiceActive && (
                    <TooltipContent side="top" className="text-xs max-w-[280px]">
                      安全检测服务尚未开通，请前往技能库列表页右上角免费开通试用（26年6月30日前1000次免费试用）。
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
              <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                {!securityServiceActive
                  ? '安全检测服务尚未开通，请前往技能库列表页右上角免费开通试用（26年6月30日前1000次免费试用）。'
                  : '开启后将由腾讯云 AI Agent 安全对技能文件进行安全分析，包括代码结构、依赖安全、命令执行、网络请求、文件操作、Prompt 注入等维度的全面审查。检测通常在几分钟内完成。'}
              </p>
              {securityServiceActive && (
                <label className={`flex items-center gap-2 mt-3 ${enableSecurityScan ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                  <Checkbox
                    checked={defaultSecurityScan}
                    onCheckedChange={(checked) => {
                      onDefaultSecurityScanChange(checked === true);
                    }}
                    disabled={!enableSecurityScan}
                  />
                  <span className={`text-xs ${enableSecurityScan ? 'text-[#737373]' : 'text-[#A3A3A3]'}`}>设置上传/更新时默认提交安全检测</span>
                </label>
              )}
            </div>
          </div>
          )}
        </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="dialog-confirm"
            onClick={handlePublish}
            disabled={!hasSuccessfulUpload}
          >
            发布 Skill
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}