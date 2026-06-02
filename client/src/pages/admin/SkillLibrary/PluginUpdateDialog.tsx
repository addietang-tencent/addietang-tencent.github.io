/**
 * PluginUpdateDialog - 更新插件弹窗
 * 参考发布插件和 Skill 更新交互，仅包含插件包上传与插件信息。
 */
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertCircle, CheckCircle, ChevronDown, ChevronRight, FileText, Loader, Upload, X } from 'lucide-react';
import JSZip from 'jszip';
import { type Plugin } from './PluginUploadDialog';
import { compareSemver, isValidSemver } from './downloadUtils';

interface PluginUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plugin: Plugin;
  onConfirm: (updatedPlugin: Plugin) => void;
}

interface UploadedFile {
  name: string;
  size: number;
  status: 'success' | 'error' | 'parsing';
  error?: string;
  pluginJsonFound?: boolean;
  packageJsonFound?: boolean;
  pluginJsonParsed?: { name?: string; description?: string };
  files?: Array<{ name: string; size: number; content?: string }>;
}

const PLUGIN_MANIFEST_FILE = 'openclaw.plugin.json';
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
      if (fileName === PLUGIN_MANIFEST_FILE && parts.length <= 2) {
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
      if (a.name.toLowerCase().endsWith(PLUGIN_MANIFEST_FILE)) return -1;
      if (b.name.toLowerCase().endsWith(PLUGIN_MANIFEST_FILE)) return 1;
      return a.name.localeCompare(b.name);
    });

    let pluginJsonParsed: { name?: string; description?: string } | undefined;
    if (pluginJsonFound) {
      const pluginJsonFile = files.find(f => f.name.endsWith(PLUGIN_MANIFEST_FILE));
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

export default function PluginUpdateDialog({ open, onOpenChange, plugin, onConfirm }: PluginUpdateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    updateNote: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [currentFilesExpanded, setCurrentFilesExpanded] = useState(false);
  const [versionError, setVersionError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && plugin) {
      setFormData({
        name: plugin.name,
        description: plugin.description,
        version: '',
        updateNote: '',
      });
      setUploadedFiles([]);
      setExpandedFile(null);
      setCurrentFilesExpanded(false);
      setVersionError('');
    }
  }, [open, plugin]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setUploadedFiles([]);
      setExpandedFile(null);
      setCurrentFilesExpanded(false);
      setVersionError('');
    }
    onOpenChange(newOpen);
  };

  const validateVersion = (version: string): string => {
    const nextVersion = version.trim();
    if (!nextVersion) return '请填写新版本号';
    if (!isValidSemver(nextVersion)) return '版本号格式必须为 x.y.z';
    if (compareSemver(nextVersion, plugin.version) <= 0) return `新版本号需高于上个版本号 v${plugin.version}`;
    return '';
  };

  const handleVersionChange = (value: string) => {
    setFormData(prev => ({ ...prev, version: value }));
    setVersionError(validateVersion(value));
  };


  const handleRemoveFile = (name: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== name));
    if (expandedFile === name) setExpandedFile(null);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadedFiles([]);
    setExpandedFile(null);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.zip')) {
      setUploadedFiles([{ name: file.name, size: file.size, status: 'error', error: '只支持 ZIP 文件' }]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadedFiles([{ name: file.name, size: file.size, status: 'parsing' }]);
    const parseResult = await parseZipFile(file);

    if (parseResult.error) {
      setUploadedFiles([{ name: file.name, size: file.size, status: 'error', error: parseResult.error }]);
    } else if (!parseResult.pluginJsonFound && !parseResult.packageJsonFound) {
      setUploadedFiles([{ name: file.name, size: file.size, status: 'error', error: '不存在 openclaw.plugin.json 和 package.json 文件，请修改后重试', files: parseResult.files }]);
    } else if (!parseResult.pluginJsonFound) {
      setUploadedFiles([{ name: file.name, size: file.size, status: 'error', error: '不存在 openclaw.plugin.json 文件，请修改后重试', files: parseResult.files }]);
    } else if (!parseResult.packageJsonFound) {
      setUploadedFiles([{ name: file.name, size: file.size, status: 'error', error: '不存在 package.json 文件，请修改后重试', files: parseResult.files }]);
    } else {
      setUploadedFiles([{ name: file.name, size: file.size, status: 'success', files: parseResult.files, pluginJsonFound: true, packageJsonFound: true, pluginJsonParsed: parseResult.pluginJsonParsed }]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files) handleFileSelect({ target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const pluginSlug = plugin.slug || '';
  const trimmedName = formData.name.trim();
  const trimmedVersion = formData.version.trim();
  const isSlugValid = pluginSlug.trim().length > 0;
  const isNameValid = trimmedName.length > 0;
  const isVersionFilled = trimmedVersion.length > 0;
  const isVersionValid = isVersionFilled && isValidSemver(trimmedVersion);
  const isVersionHigher = isVersionValid && compareSemver(trimmedVersion, plugin.version) > 0;
  const hasSelectedPackage = uploadedFiles.length > 0;
  const isUploadedFileValid = !hasSelectedPackage || uploadedFiles.every(f => f.status === 'success');
  const canSave = isSlugValid && isNameValid && isVersionFilled && isVersionValid && isVersionHigher && isUploadedFileValid;

  const handleSave = () => {
    const nextVersion = formData.version.trim();
    const nextName = formData.name.trim();

    if (!pluginSlug.trim()) {
      toast.error('唯一标识不能为空');
      return;
    }

    if (!nextName) {
      toast.error('请填写显示名称');
      return;
    }

    const verErr = validateVersion(nextVersion);
    if (verErr) {
      setVersionError(verErr);
      toast.error(verErr);
      return;
    }

    if (!isUploadedFileValid) {
      toast.error('请先上传有效的插件 ZIP 文件，或删除无效文件后沿用当前内容');
      return;
    }

    const newUpload = uploadedFiles.find(f => f.status === 'success');
    const nextFiles = newUpload?.files || plugin.files || [];
    const updatedPlugin: Plugin = {
      ...plugin,
      name: nextName,
      description: formData.description,
      version: nextVersion,
      files: nextFiles,
      content: `# ${nextName}\n\n${formData.description}`,
      uploadTime: new Date(),
      versions: [nextVersion, ...(plugin.versions || [])],
      versionHistory: [
        {
          version: nextVersion,
          date: new Date().toISOString().split('T')[0],
          changeLog: formData.updateNote || undefined,
          files: nextFiles,
        },
        ...(plugin.versionHistory || []),
      ],
    };

    onConfirm(updatedPlugin);
    toast.success('插件更新成功');
    handleOpenChange(false);

  };

  const currentFiles = plugin.files || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>

      <DialogContent className="sm:max-w-[532px] max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>更新插件</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-3">
            <Label className="text-base font-semibold">插件包上传</Label>
            <div
              onDragOver={hasSelectedPackage ? undefined : handleDragOver}
              onDrop={hasSelectedPackage ? undefined : handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${hasSelectedPackage ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-blue-400'}`}
            >
              <Upload className={`w-6 h-6 mx-auto mb-2 ${hasSelectedPackage ? 'text-gray-300' : 'text-gray-400'}`} />
              <p className={`text-sm mb-2 ${hasSelectedPackage ? 'text-gray-400' : 'text-gray-600'}`}>
                {hasSelectedPackage ? '如需替换，请先删除下方文件' : '点击或拖拽 ZIP 文件上传'}
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
                      <li className="leading-relaxed"><span className="font-medium">命名建议：</span>为便于管理，建议压缩包（或内部文件夹）的名称，与下方唯一标识保持一致。</li>
                    </ol>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="claw-outline" size="claw-sm" onClick={() => fileInputRef.current?.click()} disabled={hasSelectedPackage}>上传 ZIP</Button>
              </div>
              <input ref={fileInputRef} type="file" accept=".zip" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">已上传文件</Label>
              {uploadedFiles.map((file) => (
                <div key={file.name} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {file.status !== 'parsing' && (
                        <button onClick={() => setExpandedFile(expandedFile === file.name ? null : file.name)} className="flex items-center gap-1 shrink-0">
                          {expandedFile === file.name ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                        </button>
                      )}
                      <div className="flex items-center gap-2 min-w-0">
                        {file.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                        {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                        {file.status === 'parsing' && <Loader className="w-5 h-5 text-blue-600 animate-spin shrink-0" />}
                        <div className="text-left min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
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
                      <p className="text-xs font-semibold text-gray-700">文件列表</p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {file.files.map((f) => (
                          <div key={f.name} className="flex justify-between gap-3 text-xs text-gray-600">
                            <span className="truncate">{f.name}</span>
                            <span className="shrink-0">{(f.size / 1024).toFixed(2)} KB</span>
                          </div>
                        ))}
                      </div>
                      {(file.pluginJsonFound || file.packageJsonFound) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                          {file.pluginJsonFound && <p className="text-xs font-semibold text-green-600">openclaw.plugin.json 校验通过</p>}
                          {file.packageJsonFound && <p className="text-xs font-semibold text-green-600">package.json 校验通过</p>}
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
          )}

          <div className="space-y-2">
            <Label className="text-base font-semibold">当前内容</Label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button onClick={() => setCurrentFilesExpanded(prev => !prev)} className="flex items-center gap-1 shrink-0" disabled={currentFiles.length === 0}>
                    {currentFilesExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                  </button>
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 text-gray-500 shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900">当前文件</p>
                      <p className="text-xs text-gray-500">{currentFiles.length > 0 ? `包含 ${currentFiles.length} 个文件` : '当前插件暂无文件内容'}</p>
                    </div>
                  </div>
                </div>
              </div>
              {currentFilesExpanded && currentFiles.length > 0 && (
                <div className="border-t border-gray-200 bg-white p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">文件列表</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {currentFiles.map((f) => (
                      <div key={f.name} className="flex justify-between gap-3 text-xs text-gray-600">
                        <span className="truncate">{f.name}</span>
                        <span className="shrink-0">{(f.size / 1024).toFixed(2)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div><Label className="text-base font-semibold">插件信息</Label></div>

            <div>
              <Label htmlFor="plugin-update-slug" className="text-sm">唯一标识 (slug) <span className="text-red-500">*</span></Label>
              <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                  <Input id="plugin-update-slug" value={pluginSlug} readOnly className={`mt-1 bg-gray-50 text-gray-500 cursor-not-allowed ${!isSlugValid ? 'border-red-400 focus:ring-red-400' : ''}`} />
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p>唯一标识不允许修改</p>
                </TooltipContent>
              </Tooltip>
              {!isSlugValid && <p className="text-xs text-red-500 mt-1">唯一标识不能为空</p>}
            </div>

            <div>
              <Label htmlFor="plugin-update-name" className="text-sm">显示名称 <span className="text-red-500">*</span></Label>
              <Input id="plugin-update-name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className={`mt-1 ${!isNameValid ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {!isNameValid && <p className="text-xs text-red-500 mt-1">请填写显示名称</p>}
            </div>

            <div>
              <Label htmlFor="plugin-update-desc" className="text-sm">描述</Label>
              <Textarea id="plugin-update-desc" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="mt-1" rows={2} />
            </div>


            <div>
              <Label htmlFor="plugin-update-version" className="text-sm">版本号 <span className="text-red-500">*</span></Label>
              <Input
                id="plugin-update-version"
                value={formData.version}
                onChange={(e) => handleVersionChange(e.target.value)}
                placeholder={`新版本号需高于上一版本号 ${plugin.version}`}
                className={`mt-1 ${versionError ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {versionError && <p className="text-xs text-red-500 mt-1">{versionError}</p>}
            </div>

            <div>
              <Label htmlFor="plugin-update-note" className="text-sm">更新说明</Label>
              <Textarea
                id="plugin-update-note"
                value={formData.updateNote}
                onChange={(e) => setFormData(prev => ({ ...prev, updateNote: e.target.value }))}
                placeholder="请填写本次更新内容"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 space-y-1">
            <p className="text-xs text-gray-500 leading-relaxed">提示：仅更新企业插件库中的插件版本。</p>
            <p className="text-xs text-gray-500 leading-relaxed">已下发至 Agent 实例的插件不会同步升级，需手动重新下发。</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="claw-outline" onClick={() => handleOpenChange(false)}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleSave} disabled={!canSave}>
              保存更新
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

  );
}
