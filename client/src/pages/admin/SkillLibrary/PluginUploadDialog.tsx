/**
 * PluginUploadDialog - 发布插件弹窗
 * 只支持上传 ZIP，校验 openclaw.plugin.json
 */
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Upload, X, ChevronDown, ChevronRight, Loader, FileText, Download } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import JSZip from 'jszip';
import { type SkillScope } from './types';

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
  pluginJsonFound?: boolean;
  packageJsonFound?: boolean;
  pluginJsonParsed?: { name?: string; description?: string };
  files?: Array<{ name: string; size: number; content?: string }>;
}

const TEXT_EXTENSIONS = ['.md', '.mdx', '.xml', '.json', '.txt', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.sh', '.bat', '.py', '.js', '.ts', '.css', '.html', '.htm', '.svg', '.env', '.gitignore', '.dockerfile'];
const isTextFile = (name: string) => {
  const lower = name.toLowerCase();
  if (!lower.includes('.') && !lower.includes('/')) return true;
  return TEXT_EXTENSIONS.some(ext => lower.endsWith(ext));
};

const parseZipFile = async (file: File) => {
  try {
    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);
    const files: Array<{ name: string; size: number; content?: string }> = [];
    let pluginJsonFound = false;
    let packageJsonFound = false;
    const fileEntries: Array<{ relativePath: string; zipEntry: JSZip.JSZipObject }> = [];

    loaded.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir) return;
      if (relativePath.startsWith('__MACOSX/') || relativePath.endsWith('.DS_Store')) return;
      const parts = relativePath.split('/');
      const fileName = parts[parts.length - 1];
      // 根目录或单层文件夹下
      if (fileName === 'openclaw.plugin.json' && parts.length <= 2) {
        pluginJsonFound = true;
      }
      if (fileName === 'package.json' && parts.length <= 2) {
        packageJsonFound = true;
      }
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
      if (a.name.toLowerCase().endsWith('openclaw.plugin.json')) return -1;
      if (b.name.toLowerCase().endsWith('openclaw.plugin.json')) return 1;
      return a.name.localeCompare(b.name);
    });

    // 解析 openclaw.plugin.json 内容
    let pluginJsonParsed: { name?: string; description?: string } | undefined;
    if (pluginJsonFound) {
      const pluginJsonFile = files.find(f => f.name.endsWith('openclaw.plugin.json'));
      if (pluginJsonFile?.content) {
        try {
          const parsed = JSON.parse(pluginJsonFile.content);
          pluginJsonParsed = {};
          if (parsed.name && typeof parsed.name === 'string') pluginJsonParsed.name = parsed.name;
          if (parsed.description && typeof parsed.description === 'string') pluginJsonParsed.description = parsed.description;
        } catch { /* JSON 解析失败则不填充 */ }
      }
    }

    return { files, pluginJsonFound, packageJsonFound, pluginJsonParsed };
  } catch (error) {
    return { files: [] as Array<{ name: string; size: number; content?: string }>, pluginJsonFound: false, packageJsonFound: false, pluginJsonParsed: undefined, error: `ZIP 文件解析失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
};

const emptyForm = () => ({
  slug: '',
  name: '',
  description: '',
  version: '1.0.0',
});

export default function PluginUploadDialog({ open, onOpenChange, onConfirm, existingSlugs = [] }: PluginUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasSuccessfulUpload = uploadedFiles.some(f => f.status === 'success');

  const resetAll = () => {
    setUploadedFiles([]);
    setExpandedFile(null);
    setFormData(emptyForm());
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

      setUploadedFiles(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(f => f.name === file.name);
        if (idx !== -1) {
          if (parseResult.error) {
            updated[idx] = { name: file.name, size: file.size, status: 'error', error: parseResult.error };
          } else if (!parseResult.pluginJsonFound && !parseResult.packageJsonFound) {
            updated[idx] = { name: file.name, size: file.size, status: 'error', error: '不存在 openclaw.plugin.json 和 package.json 文件，请修改后重试', files: parseResult.files };
          } else if (!parseResult.pluginJsonFound) {
            updated[idx] = { name: file.name, size: file.size, status: 'error', error: '不存在 openclaw.plugin.json 文件，请修改后重试', files: parseResult.files };
          } else if (!parseResult.packageJsonFound) {
            updated[idx] = { name: file.name, size: file.size, status: 'error', error: '不存在 package.json 文件，请修改后重试', files: parseResult.files };
          } else {
            updated[idx] = { name: file.name, size: file.size, status: 'success', files: parseResult.files, pluginJsonFound: true, packageJsonFound: true, pluginJsonParsed: parseResult.pluginJsonParsed };
            // 自动填充表单
            if (parseResult.pluginJsonParsed?.name && !formData.name) {
              setFormData(prev => ({ ...prev, name: parseResult.pluginJsonParsed!.name! }));
            }
            if (parseResult.pluginJsonParsed?.description && !formData.description) {
              setFormData(prev => ({ ...prev, description: parseResult.pluginJsonParsed!.description! }));
            }
          }
        }
        return updated;
      });
    }
    // 清空 input 以允许重复选择同一文件
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      scope: 'public',
      groupIds: [],
      uploadTime: new Date(),
      content: `# ${formData.name}\n\n${formData.description}`,
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
            <Label className="text-base font-semibold">上传插件包</Label>
            <div
              onDragOver={uploadedFiles.length > 0 ? undefined : handleDragOver}
              onDrop={uploadedFiles.length > 0 ? undefined : handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${uploadedFiles.length > 0 ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-blue-400'}`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 ${uploadedFiles.length > 0 ? 'text-gray-300' : 'text-gray-400'}`} />
              <p className={`text-sm mb-2 ${uploadedFiles.length > 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                {uploadedFiles.length > 0 ? '如需替换，请先删除下方文件' : '点击或拖拽 ZIP 文件上传'}
              </p>

              <div className="flex items-center justify-center gap-4 mb-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" onClick={(e) => e.stopPropagation()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />上传要求
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-4" align="center" side="bottom">
                    <p className="text-sm font-semibold text-gray-900 mb-3">上传要求</p>
                    <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-5">
                      <li className="leading-relaxed"><span className="font-medium">必需文件：</span>插件ZIP包根目录必须包含 <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">openclaw.plugin.json</code> 和 <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">package.json</code> 文件，系统据此识别插件。</li>
                      <li className="leading-relaxed"><span className="font-medium">命名建议：</span>为便于管理，建议压缩包（或内部文件夹）的名称，与下方您将填写的"唯一标识"保持一致。</li>
                    </ol>
                  </PopoverContent>
                </Popover>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = '/system-info-plugin.zip';
                    link.download = 'system-info-plugin.zip';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('样例文件下载中...');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />下载样例
                </button>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadedFiles.length > 0}>上传 ZIP</Button>
              </div>
              <input ref={fileInputRef} type="file" accept=".zip" onChange={handleFileSelect} className="hidden" />
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
                        {(file.pluginJsonFound || file.packageJsonFound) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                            {file.pluginJsonFound && (
                              <p className="text-xs font-semibold text-green-600">openclaw.plugin.json 校验通过</p>
                            )}
                            {file.packageJsonFound && (
                              <p className="text-xs font-semibold text-green-600">package.json 校验通过</p>
                            )}
                            {file.pluginJsonParsed && (
                              <div className="text-xs text-green-600 space-y-0.5 mt-1">
                                {file.pluginJsonParsed.name && <p><span className="font-medium">name:</span> {file.pluginJsonParsed.name}</p>}
                                {file.pluginJsonParsed.description && <p><span className="font-medium">description:</span> {file.pluginJsonParsed.description}</p>}
                              </div>
                            )}
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

          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>取消</Button>
            <Button onClick={handlePublish} disabled={!hasSuccessfulUpload} className="bg-blue-600 hover:bg-blue-700">发布插件</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
