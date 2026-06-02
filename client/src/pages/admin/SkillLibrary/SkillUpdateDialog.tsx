/**
 * 更新 Skill 对话框（F-02）
 * - 预填当前 Skill 信息
 * - 可编辑 name、description、version、changeLog、categories
 * - changeLog 支持一键生成模板
 * - 可选上传新 ZIP 替换文件
 * - 版本号格式校验 + 必须高于当前版本
 */
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertInfoIcon } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, X, ChevronDown, ChevronRight, Loader, Sparkles, FileText, Download, Search as SearchIcon, Check, Trash2 } from 'lucide-react';
import JSZip from 'jszip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { StatusTag } from '@/components/ui/status-tag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { type Skill, type SkillScope } from './types';
import { DEFAULT_CATEGORIES, MOCK_GROUPS } from './mockData';
import { isValidSemver, compareSemver, downloadSampleSkillZip } from './downloadUtils';

interface SkillUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: Skill;
  onConfirm: (updatedSkill: Skill, changeLog: string) => void;
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
  if (lines[0] !== '---') return null;
  const result: { name?: string; description?: string } = {};
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('---')) break;
    if (line.startsWith('name:')) result.name = line.substring(5).trim();
    else if (line.startsWith('description:')) result.description = line.substring(12).trim();
  }
  return Object.keys(result).length > 0 ? result : null;
};

// 可读取内容的文本文件扩展名
const TEXT_EXTENSIONS = ['.md', '.mdx', '.xml', '.json', '.txt', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.sh', '.bat', '.py', '.js', '.ts', '.css', '.html', '.htm', '.svg', '.env', '.gitignore', '.dockerfile'];
const isTextFile = (name: string) => {
  const lower = name.toLowerCase();
  if (!lower.includes('.') && !lower.includes('/')) return true;
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

    loaded.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir) return;
      if (relativePath.startsWith('__MACOSX/') || relativePath.endsWith('.DS_Store')) return;
      if (relativePath.toLowerCase().endsWith('skill.md')) skillmdFound = true;
      fileEntries.push({ relativePath, zipEntry });
    });

    for (const { relativePath, zipEntry } of fileEntries) {
      const size = (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize : 0;
      let content: string | undefined;
      if (isTextFile(relativePath)) {
        try { content = await zipEntry.async('text'); } catch { /* skip */ }
      }
      files.push({ name: relativePath, size, content });
    }

    files.sort((a, b) => {
      if (a.name.toLowerCase() === 'skill.md') return -1;
      if (b.name.toLowerCase() === 'skill.md') return 1;
      return a.name.localeCompare(b.name);
    });

    if (skillmdFound) {
      const skillmdFile = files.find(f => f.name.toLowerCase().endsWith('skill.md'));
      if (skillmdFile?.content) skillmdContent = skillmdFile.content;
    }

    const skillmdParsed = skillmdContent ? parseSkillMd(skillmdContent) : undefined;
    return { files, skillmdContent, skillmdParsed: skillmdParsed || undefined };
  } catch (error) {
    return { files: [], error: `ZIP 文件解析失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
};

export default function SkillUpdateDialog({ open, onOpenChange, skill, onConfirm, defaultSecurityScan = false, onDefaultSecurityScanChange = () => {}, securityServiceActive = true }: SkillUpdateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    changeLog: '',
    categories: [] as string[],
    scope: 'public' as SkillScope,
    groupIds: [] as string[],
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [versionError, setVersionError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [enableSecurityScan, setEnableSecurityScan] = useState(false);

  // 初始化 - 回显已有文件和当前 Skill 信息
  useEffect(() => {
    if (open && skill) {
      setFormData({
        name: skill.name,
        description: skill.description,
        version: '',
        changeLog: '',
        categories: [...skill.categories],
        scope: skill.scope || 'public',
        groupIds: [...(skill.groupIds || [])],
      });
      setGroupSearchQuery('');
      setEnableSecurityScan(false);
      // 回显已有文件
      if (skill.files && skill.files.length > 0) {
        setUploadedFiles([{
          name: '当前文件',
          size: 0,
          status: 'success',
          files: skill.files,
        }]);
      } else {
        setUploadedFiles([]);
      }
      setExpandedFile(null);
      setVersionError('');
    }
  }, [open, skill]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setUploadedFiles([]);
      setExpandedFile(null);
      setVersionError('');
    }
    onOpenChange(newOpen);
  };

  // 版本号校验
  const validateVersion = (version: string): string => {
    if (!version) return '';
    if (!isValidSemver(version)) return '版本号格式必须为 x.y.z';
    if (compareSemver(version, skill.version) <= 0) return `新版本号需高于上个版本号 ${skill.version}`;
    return '';
  };

  const handleVersionChange = (value: string) => {
    setFormData(prev => ({ ...prev, version: value }));
    setVersionError(validateVersion(value));
  };

  // 一键生成 changeLog
  const handleGenerateChangeLog = () => {
    const changes: string[] = [];
    let idx = 1;
    if (formData.name !== skill.name) {
      changes.push(`${idx}、修改名称字段`);
      idx++;
    }
    if (formData.description !== skill.description) {
      changes.push(`${idx}、修改描述字段`);
      idx++;
    }
    // 检查是否有新上传文件（非回显的原始文件）
    const hasNewUpload = uploadedFiles.some(f => f.name !== '当前文件' && f.status === 'success');
    if (hasNewUpload) {
      changes.push(`${idx}、更新SKILL文件`);
    }
    if (changes.length === 0) {
      changes.push('无变更');
    }
    setFormData(prev => ({ ...prev, changeLog: changes.join('\n') }));
  };

  // 文件上传处理 (ZIP)
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadedFiles([]);
    setExpandedFile(null);
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.zip')) {
        newFiles.push({ name: file.name, size: file.size, status: 'error', error: '只支持 ZIP 文件' });
        continue;
      }
      newFiles.push({ name: file.name, size: file.size, status: 'parsing' });
    }
    setUploadedFiles(newFiles);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.zip')) continue;
      const parseResult = await parseZipFile(file);
      const hasSKILLMd = parseResult.files.some(f => f.name.toLowerCase().endsWith('skill.md'));
      setUploadedFiles(prev => {
        const updated = [...prev];
        const fileIndex = updated.findIndex(f => f.name === file.name);
        if (fileIndex !== -1) {
          if (parseResult.error) {
            updated[fileIndex] = { name: file.name, size: file.size, status: 'error', error: parseResult.error };
          } else if (!hasSKILLMd) {
            updated[fileIndex] = { name: file.name, size: file.size, status: 'error', error: '不存在 SKILL.md 文件，请修改后重试', files: parseResult.files };
          } else {
            updated[fileIndex] = { name: file.name, size: file.size, status: 'success', files: parseResult.files, skillmdContent: parseResult.skillmdContent, skillmdParsed: parseResult.skillmdParsed };
          }
        }
        return updated;
      });
    }
    // 清空 input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 文件夹上传处理
  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setUploadedFiles([]);
    setExpandedFile(null);

    const folderName = '文件夹上传';
    setUploadedFiles([{ name: folderName, size: 0, status: 'parsing' }]);

    setTimeout(async () => {
      const fileList: { name: string; size: number; content?: string }[] = [];
      let skillmdContent: string | undefined;
      let skillmdFound = false;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = file.webkitRelativePath || file.name;
        let content: string | undefined;
        if (isTextFile(relativePath)) {
          try { content = await file.text(); } catch { /* skip */ }
        }
        fileList.push({ name: relativePath, size: file.size, content });
        if (relativePath.toLowerCase().endsWith('skill.md')) {
          const pathParts = relativePath.split('/');
          if (pathParts.length === 2 && pathParts[1].toLowerCase() === 'skill.md') {
            skillmdFound = true;
            skillmdContent = content || await file.text();
          }
        }
      }

      const displayFiles = fileList.filter(f => f.name.split('/').length > 1).map(f => {
        const pathParts = f.name.split('/');
        return { name: pathParts.slice(1).join('/'), size: f.size, content: f.content };
      });

      const skillmdParsed = skillmdContent ? parseSkillMd(skillmdContent) : undefined;

      if (!skillmdFound) {
        setUploadedFiles(prev => prev.map(f =>
          f.name === folderName
            ? { name: folderName, size: 0, status: 'error', error: '不存在 Skill.md 文件或者不在根目录下，请修改后重试', files: displayFiles }
            : f
        ));
      } else {
        setUploadedFiles(prev => prev.map(f =>
          f.name === folderName
            ? { name: folderName, size: 0, status: 'success', files: displayFiles, skillmdContent, skillmdParsed: skillmdParsed || undefined }
            : f
        ));
      }
    }, 0);
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleRemoveFile = (fileName?: string) => {
    if (fileName && fileName !== '当前文件') {
      // 删除新上传的文件，还原为原始文件
      if (skill.files && skill.files.length > 0) {
        setUploadedFiles([{
          name: '当前文件',
          size: 0,
          status: 'success',
          files: skill.files,
        }]);
      } else {
        setUploadedFiles([]);
      }
    } else {
      // 删除"当前文件"，清空列表，上传区恢复可用
      setUploadedFiles([]);
    }
    setExpandedFile(null);
  };

  const handleSave = () => {
    if (!formData.version) {
      toast.error('请填写新版本号');
      return;
    }
    const verErr = validateVersion(formData.version);
    if (verErr) {
      setVersionError(verErr);
      toast.error(verErr);
      return;
    }

    // 获取新的文件列表
    const newUpload = uploadedFiles.find(f => f.name !== '当前文件' && f.status === 'success');
    const newFiles = newUpload?.files || skill.files || [];
    const newContent = newUpload?.skillmdContent || skill.content;

    const updatedSkill: Skill = {
      ...skill,
      name: formData.name,
      description: formData.description,
      version: formData.version,
      categories: formData.categories,
      scope: formData.scope,
      groupIds: formData.scope === 'public' ? [] : formData.groupIds,
      files: newFiles,
      content: newContent,
      versions: [formData.version, ...(skill.versions || [])],
      versionHistory: [
        {
          version: formData.version,
          date: new Date().toISOString().split('T')[0],
          changeLog: formData.changeLog || undefined,
          files: newFiles,
        },
        ...(skill.versionHistory || []),
      ],
      uploadTime: new Date(),
      securityInfo: enableSecurityScan
        ? { overallStatus: 'scanning', engines: [] }
        : skill.securityInfo,
    };

    onConfirm(updatedSkill, formData.changeLog);
    toast.success(`Skill「${skill.name}」已更新至 v${formData.version}`);
    handleOpenChange(false);
  };

  const hasNewUpload = uploadedFiles.length > 0;
  const hasCurrentFile = uploadedFiles.some(f => f.name === '当前文件');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-visible" style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }} onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>更新 Skill</DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1">
        <div className="space-y-5">
          {/* 更新提示 */}
          <Alert variant="warning">
            <AlertInfoIcon />
            <AlertDescription>
              仅更新企业技能库中的技能版本。已下发至 Agent 实例的技能不会同步升级，需手动重新下发。
            </AlertDescription>
          </Alert>

          {/* 文件替换 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#0A0A0A]">文件（可选替换）</Label>
            {hasCurrentFile && (
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
                        <pre className="mt-1.5 bg-[#FAFAFA] border border-gray-200 rounded-[4px] px-3 py-2 text-xs text-[#334155] font-mono whitespace-pre leading-relaxed">
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

            {!hasCurrentFile && (
            <>
            <div
              onDragOver={hasNewUpload ? undefined : (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={hasNewUpload ? undefined : (e: React.DragEvent) => {
                e.preventDefault(); e.stopPropagation();
                const files = e.dataTransfer.files;
                if (files) {
                  const event = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleFileSelect(event);
                }
              }}
              className={`border border-dashed rounded-[4px] p-4 text-center transition-colors ${
                hasNewUpload
                  ? 'border-gray-200 bg-[#FAFAFA] cursor-not-allowed'
                  : 'border-gray-200 hover:border-[#1447E6]'
              }`}
            >
              <p className={`text-sm mb-3 ${hasNewUpload ? 'text-[#A3A3A3]' : 'text-[#737373]'}`}>
                {hasNewUpload ? '如需替换，请先删除下方文件' : '点击或拖拽文件上传'}
              </p>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={hasNewUpload}>
                  上传 ZIP
                </Button>
                <Button variant="outline" size="sm" onClick={() => folderInputRef.current?.click()} disabled={hasNewUpload}>
                  选择文件夹
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept=".zip" multiple onChange={handleFileSelect} className="hidden" />
              <input ref={folderInputRef} type="file" multiple onChange={handleFolderSelect} className="hidden" {...({ webkitdirectory: '' } as any)} />
            </div>

            {/* 上传要求卡片（含 下载样例 链接按钮）—— 放在虚线框外 */}
            <div className="border border-gray-200 rounded-[4px] p-4 text-left bg-white">
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
                  <pre className="mt-1.5 bg-[#FAFAFA] border border-gray-200 rounded-[4px] px-3 py-2 text-xs text-[#334155] font-mono whitespace-pre leading-relaxed">
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
                <div key={file.name} className="border border-gray-200 rounded-[4px] bg-white overflow-hidden">
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

                  {expandedFile === file.name && file.files && file.status !== 'parsing' && (
                    <div className="border-t border-gray-200 bg-white p-3 space-y-2">
                      <p className="text-xs font-medium text-[#0A0A0A]">文件列表</p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {file.files.map((f) => (
                          <div key={f.name} className="flex justify-between text-xs text-[#737373]">
                            <span>{f.name}</span>
                            <span>{(f.size / 1024).toFixed(2)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Slug（只读） */}
          <div>
            <Label htmlFor="update-slug" className="text-sm font-medium text-[#0A0A0A]">
              唯一标识 (slug) <span className="text-red-500">*</span>
            </Label>
            <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                  <Input
                    id="update-slug"
                    value={skill.slug}
                    disabled
                    className="mt-1"
                  />
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p>slug 不允许修改</p>
                </TooltipContent>
              </Tooltip>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="update-name" className="text-sm font-medium text-[#0A0A0A]">
              显示名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="update-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="update-desc" className="text-sm font-medium text-[#0A0A0A]">描述</Label>
            <Textarea
              id="update-desc"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Version */}
          <div>
            <Label htmlFor="update-version" className="text-sm font-medium text-[#0A0A0A]">
              版本号 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="update-version"
              value={formData.version}
              onChange={(e) => handleVersionChange(e.target.value)}
              placeholder={`新版本号需高于上一版本号 ${skill.version}`}
              className={`mt-1 ${versionError ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {versionError && (
              <p className="text-xs text-red-500 mt-1">{versionError}</p>
            )}
          </div>

          {/* 分类 */}
          <div>
            <Label className="text-sm font-medium text-[#0A0A0A]">分类</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DEFAULT_CATEGORIES.map(cat => {
                const isSelected = formData.categories.includes(cat.id);
                return (
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
                    className={`h-8 px-4 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border transition-colors whitespace-nowrap inline-flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                        : 'bg-white border-[#EAEEF4] text-[#020617] hover:border-[#020617]'
                    }`}
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
                  onClick={() => setFormData(prev => ({ ...prev, scope: 'public', groupIds: [] }))}
                  className={`h-8 px-4 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border transition-colors ${
                    formData.scope === 'public'
                      ? 'bg-[#020617] border-[#020617] text-white'
                      : 'bg-white border-[#EAEEF4] text-[#020617] hover:border-[#020617]'
                  }`}
                >
                  全部用户
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, scope: 'private' }))}
                  className={`h-8 px-4 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border transition-colors ${
                    formData.scope === 'private'
                      ? 'bg-[#020617] border-[#020617] text-white'
                      : 'bg-white border-[#EAEEF4] text-[#020617] hover:border-[#020617]'
                  }`}
                >
                  按分组
                </button>

                {/* 选择按分组后，右侧出现下拉选择器 */}
                {formData.scope === 'private' && (
                  <Popover>
                    <Tooltip delayDuration={1000}>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="flex items-center justify-between gap-2 h-8 px-4 flex-1 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border border-gray-200 bg-white text-[#0A0A0A] hover:border-[#1447E6] hover:bg-[#FAFAFA] data-[state=open]:border-[#1447E6] data-[state=open]:bg-[#FAFAFA] transition-colors">
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
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                          <input
                            placeholder="搜索分组…"
                            value={groupSearchQuery}
                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-[4px] bg-[#FAFAFA] outline-none focus:border-[#1447E6] transition-colors"
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
                                  checked ? 'bg-[#1447E6] border-[#1447E6]' : 'border-gray-200 bg-white'
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
                      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200">
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

          {/* 更新说明 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="update-changelog" className="text-sm font-medium text-[#0A0A0A]">更新说明</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateChangeLog}
                className="h-7 px-2 text-xs gap-1"
              >
                <Sparkles className="w-3 h-3" />
                一键生成
              </Button>
            </div>
            <Textarea
              id="update-changelog"
              value={formData.changeLog}
              onChange={(e) => setFormData(prev => ({ ...prev, changeLog: e.target.value }))}
              placeholder="请填写本次更新内容"
              className="mt-1"
              rows={3}
            />
          </div>

          {/* 安全检测 */}
          <div className="border border-gray-200 rounded-[4px] p-4">
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
                      disabled={!securityServiceActive}
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
        </DialogBody>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="dialog-confirm"
            onClick={handleSave}
            disabled={!formData.version || !!versionError}
          >
            保存更新
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
