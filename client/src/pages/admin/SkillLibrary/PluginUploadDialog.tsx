/**
 * PluginUploadDialog - 发布插件弹窗
 * 复用 SkillUploadDialog 的逻辑，去掉分类字段，用词换成「插件」
 */
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Upload, X, ChevronDown, ChevronRight, Loader, FileText, Download, Search as SearchIcon, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import JSZip from 'jszip';
import { type SkillScope } from './types';
import { MOCK_GROUPS } from './mockData';
import { downloadSampleSkillZip } from './downloadUtils';

export interface Plugin {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  scope: SkillScope;
  groupIds: string[];
  uploadTime: Date;
  versions: string[];
  files: Array<{ name: string; size: number; content?: string }>;
  content?: string;
}

interface PluginUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (plugin: Plugin) => void;
  existingSlugs?: string[];
}

interface UploadedFile {
  name: string;
  size: number;
  status: 'success' | 'error' | 'pending' | 'parsing';
  error?: string;
  skillmdContent?: string;
  skillmdParsed?: { name?: string; description?: string };
  files?: Array<{ name: string; size: number; content?: string }>;
}

const TEXT_EXTENSIONS = ['.md', '.mdx', '.xml', '.json', '.txt', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.sh', '.bat', '.py', '.js', '.ts', '.css', '.html', '.htm', '.svg', '.env', '.gitignore', '.dockerfile'];
const isTextFile = (name: string) => {
  const lower = name.toLowerCase();
  if (!lower.includes('.') && !lower.includes('/')) return true;
  return TEXT_EXTENSIONS.some(ext => lower.endsWith(ext));
};

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

const parseZipFile = async (file: File) => {
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
        try { content = await zipEntry.async('text'); } catch { /* ignore */ }
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

const emptyForm = () => ({
  slug: '',
  name: '',
  description: '',
  version: '1.0.0',
  scope: 'public' as SkillScope,
  groupIds: [] as string[],
});

export default function PluginUploadDialog({ open, onOpenChange, onConfirm, existingSlugs = [] }: PluginUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm());
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const hasSuccessfulUpload = uploadedFiles.some(f => f.status === 'success');

  const resetAll = () => {
    setUploadedFiles([]);
    setExpandedFile(null);
    setFormData(emptyForm());
    setGroupSearchQuery('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetAll();
    onOpenChange(newOpen);
  };

  const handleRemoveFile = (name: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== name));
    if (expandedFile === name) setExpandedFile(null);
  };

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
        const idx = updated.findIndex(f => f.name === file.name);
        if (idx !== -1) {
          if (parseResult.error) {
            updated[idx] = { name: file.name, size: file.size, status: 'error', error: parseResult.error };
          } else if (!hasSKILLMd) {
            updated[idx] = { name: file.name, size: file.size, status: 'error', error: '不存在 SKILL.md 文件，请修改后重试', files: parseResult.files };
          } else {
            updated[idx] = { name: file.name, size: file.size, status: 'success', files: parseResult.files, skillmdContent: parseResult.skillmdContent, skillmdParsed: parseResult.skillmdParsed };
            if (parseResult.skillmdParsed?.name && !formData.name) setFormData(prev => ({ ...prev, name: parseResult.skillmdParsed!.name! }));
            if (parseResult.skillmdParsed?.description && !formData.description) setFormData(prev => ({ ...prev, description: parseResult.skillmdParsed!.description! }));
          }
        }
        return updated;
      });
    }
  };

  const handlePublish = () => {
    const successFiles = uploadedFiles.filter(f => f.status === 'success');
    if (successFiles.length === 0) { toast.error('请先上传有效的插件 ZIP 文件'); return; }
    if (!formData.slug || !formData.name || !formData.version) { toast.error('请填写所有必填字段'); return; }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) { toast.error('slug 仅支持小写字母/数字/连字符 -'); return; }
    if (existingSlugs.includes(formData.slug)) { toast.error('该 slug 已存在，请修改后重试'); return; }

    const successFile = uploadedFiles.find(f => f.status === 'success');
    const newPlugin: Plugin = {
      id: `plugin-${Date.now()}`,
      slug: formData.slug,
      name: formData.name,
      description: formData.description,
      version: formData.version,
      scope: formData.scope,
      groupIds: formData.scope === 'public' ? [] : formData.groupIds,
      uploadTime: new Date(),
      content: successFile?.skillmdContent || `# ${formData.name}\n\n${formData.description}`,
      versions: [formData.version],
      files: successFile?.files || [],
    };

    onConfirm(newPlugin);
    toast.success('插件发布成功');
    resetAll();
    onOpenChange(false);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files) handleFileSelect({ target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[532px] max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>发布新插件</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 文件上传区域 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">选择上传方式</Label>
            <div
              onDragOver={uploadedFiles.length > 0 ? undefined : handleDragOver}
              onDrop={uploadedFiles.length > 0 ? undefined : handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${uploadedFiles.length > 0 ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-blue-400'}`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 ${uploadedFiles.length > 0 ? 'text-gray-300' : 'text-gray-400'}`} />
              <p className={`text-sm mb-2 ${uploadedFiles.length > 0 ? 'text-gray-400' : 'text-gray-600'}`}>点击或拖拽文件上传</p>

              <div className="flex items-center justify-center gap-4 mb-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" onClick={(e) => e.stopPropagation()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />填写要求
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-4" align="center" side="bottom">
                    <p className="text-sm font-semibold text-gray-900 mb-3">上传要求</p>
                    <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-5">
                      <li>ZIP 包/文件夹必须包含 SKILL.md 文件（建议 SKILL 大写）</li>
                      <li className="leading-relaxed">
                        SKILL.md 文件需包含 YAML 格式的插件名称和描述，name 和 description 后必须有空格
                        <pre className="mt-1.5 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 font-mono whitespace-pre leading-relaxed">{`---\nname: my-plugin\ndescription: this is my plugin.\n---`}</pre>
                      </li>
                      <li>建议文件夹/ZIP 包名称和 name 名称保持一致</li>
                    </ol>
                  </PopoverContent>
                </Popover>
                <button type="button" onClick={(e) => { e.stopPropagation(); downloadSampleSkillZip(); toast.success('样例文件下载中...'); }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />下载样例
                </button>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadedFiles.length > 0}>上传 ZIP</Button>
                <Button variant="outline" onClick={() => folderInputRef.current?.click()} disabled={uploadedFiles.length > 0}>选择文件夹</Button>
              </div>
              <input ref={fileInputRef} type="file" accept=".zip" multiple onChange={handleFileSelect} className="hidden" />
              <input ref={folderInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" {...({ webkitdirectory: '' } as any)} />
            </div>
          </div>

          {/* 已上传文件列表 */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">已上传文件</Label>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.name} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        {file.status !== 'parsing' && (
                          <button onClick={() => setExpandedFile(expandedFile === file.name ? null : file.name)} className="flex items-center gap-1">
                            {expandedFile === file.name ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                          </button>
                        )}
                        <div className="flex items-center gap-2">
                          {file.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                          {file.status === 'parsing' && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
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
                        {file.status === 'success' && <span className="text-xs font-medium text-green-600">成功</span>}
                        {file.status === 'error' && <span className="text-xs font-medium text-red-600">失败</span>}
                        {file.status !== 'parsing' && (
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file.name)}><X className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </div>
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
                              {file.skillmdParsed.name && <p><span className="font-medium">name:</span> {file.skillmdParsed.name}</p>}
                              {file.skillmdParsed.description && <p><span className="font-medium">description:</span> {file.skillmdParsed.description}</p>}
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

          {uploadedFiles.length === 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">请先上传插件文件，然后填写插件信息</p>
            </div>
          )}

          {/* 插件信息表单 */}
          <div className={`space-y-4 border-t border-gray-200 pt-4 ${!hasSuccessfulUpload ? 'opacity-50 pointer-events-none' : ''}`}>
            <div><Label className="text-base font-semibold">插件信息</Label></div>

            <div>
              <Label htmlFor="p-slug" className="text-sm">唯一标识 (slug) <span className="text-red-500">*</span></Label>
              <Input id="p-slug" disabled={!hasSuccessfulUpload} value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g., my-plugin-1" className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">仅支持小写字母/数字/连字符 - 。企业内唯一，发布后不可修改。</p>
            </div>

            <div>
              <Label htmlFor="p-name" className="text-sm">显示名称 <span className="text-red-500">*</span></Label>
              <Input id="p-name" disabled={!hasSuccessfulUpload} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., 我的自定义插件" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="p-desc" className="text-sm">描述</Label>
              <Textarea id="p-desc" disabled={!hasSuccessfulUpload} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="插件的简要描述" className="mt-1" rows={2} />
            </div>

            <div>
              <Label htmlFor="p-version" className="text-sm">版本号 <span className="text-red-500">*</span></Label>
              <Input id="p-version" disabled={!hasSuccessfulUpload} value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} placeholder="e.g., 1.0.0" className="mt-1" />
            </div>

            {/* 应用范围 */}
            <div>
              <Label className="text-sm">应用范围</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-1.5">
                  <button disabled={!hasSuccessfulUpload} onClick={() => setFormData(prev => ({ ...prev, scope: 'public', groupIds: [] }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${formData.scope === 'public' ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'} ${!hasSuccessfulUpload ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    全部用户
                  </button>
                  <button disabled={!hasSuccessfulUpload} onClick={() => setFormData(prev => ({ ...prev, scope: 'private' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${formData.scope === 'private' ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'} ${!hasSuccessfulUpload ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    按分组
                  </button>

                  {formData.scope === 'private' && hasSuccessfulUpload && (
                    <Popover>
                      <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors min-w-[120px]">
                              <span className="truncate">{formData.groupIds.length > 0 ? `已选 ${formData.groupIds.length} 个分组` : '选择分组…'}</span>
                              <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                            </button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        {formData.groupIds.length > 0 && (
                          <TooltipContent side="bottom" className="max-w-[280px]">
                            <p className="text-xs leading-relaxed">{formData.groupIds.map(gid => MOCK_GROUPS.find(g => g.id === gid)?.name || gid).join('，')}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                      <PopoverContent className="w-64 p-0" align="start" sideOffset={6}>
                        <div className="p-2 border-b border-gray-100">
                          <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input placeholder="搜索分组…" value={groupSearchQuery} onChange={(e) => setGroupSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors" />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1">
                          {MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).map(group => {
                            const checked = formData.groupIds.includes(group.id);
                            return (
                              <button key={group.id} onClick={() => setFormData(prev => ({ ...prev, groupIds: prev.groupIds.includes(group.id) ? prev.groupIds.filter(id => id !== group.id) : [...prev.groupIds, group.id] }))}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left">
                                <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                                  {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                </span>
                                <span className="text-xs text-gray-700 truncate">{group.name}</span>
                              </button>
                            );
                          })}
                          {MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())).length === 0 && (
                            <p className="text-[11px] text-gray-400 py-3 text-center">无匹配分组</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                          <p className="text-[11px] text-gray-400">已选 {formData.groupIds.length} 个分组</p>
                          {formData.groupIds.length > 0 && (
                            <button onClick={() => setFormData(prev => ({ ...prev, groupIds: [] }))} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">清除</button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>取消</Button>
            <Button onClick={handlePublish} disabled={!hasSuccessfulUpload} className="bg-blue-600 hover:bg-blue-700">发布插件</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
