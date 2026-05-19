/**
 * MCPAddDialog - 新增 MCP 服务弹窗
 * 包含基本信息、连接方式切换、JSON 配置（固化外层结构，用户仅编辑服务器内容）、Markdown 编辑预览
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Code, ChevronDown, ChevronRight, Globe, Terminal, AlignLeft, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import MDXRenderer from '@/components/MDXRenderer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type MCPTransportType,
  type MCPConnectionCategory,
  type MCPService,
  MCP_CONNECTION_CATEGORY_MAP,
  MCP_REMOTE_PROTOCOL_MAP,
  MCP_TRANSPORT_MAP,
} from './types';

// ── 使用说明默认模板 ────────────────────────────────────
const DEFAULT_USAGE_DOC = `# 功能特点
此MCP具备的功能,比如：天气的MCP服务，支持天气的按小时查询、按天查询等功能

# 在 Openclaw 中使用
在 Openclaw 中添加mcp.json：

## 远程服务（Streamable HTTP / SSE）
\`\`\`json
{
    "mcp": {
        "servers": {
            "your-server-name": {
                "transportType": "streamable-http",
                "url": "MCP服务的URL",
                "headers": {
                    "Authorization": "<your-token>"
                },
                "timeout": 60
            }
        }
    }
}
\`\`\`

## 本地命令（STDIO）
\`\`\`json
{
    "mcp": {
        "servers": {
            "your-server-name": {
                "transportType": "stdio",
                "command": "python3",
                "args": ["/opt/mcp/your-server.py"],
                "env": {
                    "PYTHONUNBUFFERED": "1"
                },
                "cwd": "/path/to/your/workdir",
                "timeout": 60
            }
        }
    }
}
\`\`\`
`;

// ── 工具说明默认模板 ────────────────────────────────────
const DEFAULT_TOOL_DOC = `# 工具1：工具1的名称
功能：工具1具备的功能

---

参数：
* 参数1（必填）：参数1的详细内容
* 参数2（必填）：参数2的详细内容

| 参数 | 是否必填 | 内容 |
|------|-----|-----------|
| 参数1 | 必填 | 参数1的详细内容 |
| 参数2 | 必填 | 参数2的详细内容 |
`;

// ── 配置参考文档（可折叠查看） ──────────────────────────
const CONFIG_REFERENCE: Record<MCPTransportType, string> = {
  sse: `| 字段 | 必填 | 说明 |
|------|------|------|
| \`transportType\` | ✅ | 固定值 \`"sse"\` |
| \`url\` | ✅ | 必须以 http 或 https 开头（常见以 \`/sse\` 结尾） |
| \`headers\` | — | 如 MCP Server 要求 Token 认证，在此填写；否则可删除 |
| \`security_zone\` | — | 如 MCP 部署在 DevCloud，填写 \`"devnet"\` |
| \`timeout\` | — | 超时时间，单位秒，默认 60 |
| \`username\` | — | 用户标识 |`,
  'streamable-http': `| 字段 | 必填 | 说明 |
|------|------|------|
| \`transportType\` | ✅ | 固定值 \`"streamable-http"\` |
| \`url\` | ✅ | 必须以 http 或 https 开头（常见以 \`/mcp\` 结尾） |
| \`headers\` | — | 如 MCP Server 要求 Token 认证，在此填写；否则可删除 |
| \`security_zone\` | — | 如 MCP 部署在 DevCloud，填写 \`"devnet"\` |
| \`timeout\` | — | 超时时间，单位秒，默认 60 |
| \`username\` | — | 用户标识 |`,
  stdio: `| 字段 | 必填 | 说明 |
|------|------|------|
| \`transportType\` | ✅ | 固定值 \`"stdio"\` |
| \`command\` | ✅ | 可执行文件路径（支持绝对/相对路径） |
| \`args\` | — | 传给命令的参数数组，没有可留空 \`[]\` |
| \`env\` | — | 启动时的环境变量，没有可整段删除 |
| \`cwd\` | — | 子进程工作目录，默认继承 Agent 目录 |
| \`timeout\` | — | 超时时间，单位秒，默认 60 |`,
};

// ── 连接方式对应的 server 内部 JSON 模板（不含 server key） ──────
// 用户只编辑 server 对象的内部字段，外层 { "mcp": { "servers": { "{name}": { ... } } } } 由系统固化
const SERVER_VALUE_TEMPLATES: Record<MCPTransportType, string> = {
  sse: [
    `"transportType": "sse",`,
    `"url": "MCP服务的URL",`,
    `"headers": {`,
    `  "Authorization": "<your-token>"`,
    `},`,
    `"timeout": 60`,
  ].join('\n'),
  'streamable-http': [
    `"transportType": "streamable-http",`,
    `"url": "MCP服务的URL",`,
    `"headers": {`,
    `  "Authorization": "<your-token>"`,
    `},`,
    `"timeout": 60`,
  ].join('\n'),
  stdio: [
    `"transportType": "stdio",`,
    `"command": "python3",`,
    `"args": ["/opt/mcp/your-server.py"],`,
    `"env": {`,
    `  "PYTHONUNBUFFERED": "1"`,
    `},`,
    `"cwd": "/path/to/your/workdir",`,
    `"timeout": 60`,
  ].join('\n'),
};

/** 整理缩进：移除所有行的最小公共前导空白，清理尾部空行 */
function trimCommonIndent(text: string): string {
  const lines = text.replace(/\t/g, '    ').split('\n');
  // 过滤出非空行，计算最小缩进
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  if (nonEmptyLines.length === 0) return text;
  const minIndent = Math.min(...nonEmptyLines.map(l => l.match(/^(\s*)/)?.[1].length ?? 0));
  if (minIndent === 0) return text;
  // 移除每行的公共缩进
  const trimmed = lines.map(l => (l.trim().length > 0 ? l.slice(minIndent) : '')).join('\n');
  // 移除尾部多余空行
  return trimmed.replace(/\n+$/, '');
}

/** 将用户编辑的 server 内部内容组装成完整 JSON 字符串 */
function assembleFullJson(serverName: string, serverValueContent: string): string {
  // 给用户输入的每一行加上 8 个空格的缩进（第四层在完整 JSON 中的位置，每层 2 空格）
  const indentedLines = serverValueContent
    .split('\n')
    .map(line => (line.trim() ? `        ${line}` : ''))
    .join('\n');
  const escapedName = JSON.stringify(serverName);
  return `{\n  "mcp": {\n    "servers": {\n      ${escapedName}: {\n${indentedLines}\n      }\n    }\n  }\n}`;
}

/** 从完整 JSON 中提取指定 server 的内部内容（不含 key 和外层花括号） */
function extractServerValue(fullJson: string, serverName: string): string {
  try {
    const parsed = JSON.parse(fullJson);
    const server = parsed?.mcp?.servers?.[serverName];
    if (!server || typeof server !== 'object') return '';
    const inner = JSON.stringify(server, null, 2);
    const lines = inner.split('\n');
    if (lines.length <= 2) return '';
    return lines.slice(1, -1).map(l => l.replace(/^  /, '')).join('\n');
  } catch {
    return '';
  }
}

/** name 格式校验：仅允许英文字母、数字、连字符，1-64 字符（参考 MCP 规范 SEP-986） */
const NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9\-]{0,63}$/;

interface MCPAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mcp: MCPService) => void;
  /** 已存在的 MCP 名称列表，用于名称去重校验 */
  existingNames?: string[];
}

interface FormErrors {
  name?: string;
  displayName?: string;
  connectionCategory?: string;
  transportType?: string;
  configJson?: string;
}

export default function MCPAddDialog({
  open,
  onOpenChange,
  onConfirm,
  existingNames = [],
}: MCPAddDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  /** 连接类别：远程服务 / 本地命令 */
  const [connectionCategory, setConnectionCategory] = useState<MCPConnectionCategory | ''>('');
  /** 远程服务的协议子类型（仅在 connectionCategory === 'remote' 时使用） */
  const [remoteProtocol, setRemoteProtocol] = useState<'streamable-http' | 'sse'>('streamable-http');
  // 用户只编辑 server 对象的内部字段
  const [serverValueContent, setServerValueContent] = useState('');
  const [configRefExpanded, setConfigRefExpanded] = useState(false);
  const [usageDoc, setUsageDoc] = useState('');
  const [toolDoc, setToolDoc] = useState('');
  const [usageViewMode, setUsageViewMode] = useState<'edit' | 'preview'>('edit');
  const [toolViewMode, setToolViewMode] = useState<'edit' | 'preview'>('edit');
  const [errors, setErrors] = useState<FormErrors>({});

  /** 当前实际的 transportType（由 connectionCategory + remoteProtocol 派生） */
  const effectiveTransportType: MCPTransportType | '' =
    connectionCategory === 'local'
      ? 'stdio'
      : connectionCategory === 'remote'
        ? remoteProtocol
        : '';

  /** 用于判断用户编辑区是否仍是模板（未改动时可自动替换） */
  const allTemplateValues = Object.values(SERVER_VALUE_TEMPLATES);

  // 重置表单
  const resetForm = useCallback(() => {
    setStep(1);
    setName('');
    setDisplayName('');
    setDescription('');
    setConnectionCategory('');
    setRemoteProtocol('streamable-http');
    setServerValueContent('');
    setConfigRefExpanded(false);
    setUsageDoc(DEFAULT_USAGE_DOC);
    setToolDoc(DEFAULT_TOOL_DOC);
    setUsageViewMode('edit');
    setToolViewMode('edit');
    setErrors({});
  }, []);

  useEffect(() => {
    if (open) {
      setUsageDoc(DEFAULT_USAGE_DOC);
      setToolDoc(DEFAULT_TOOL_DOC);
    } else {
      resetForm();
    }
  }, [open, resetForm]);

  // 切换连接类别
  const handleCategoryChange = (category: MCPConnectionCategory) => {
    setConnectionCategory(category);
    if (category === 'local') {
      // 本地命令 → 直接填充 stdio 模板
      if (!serverValueContent || allTemplateValues.includes(serverValueContent)) {
        setServerValueContent(SERVER_VALUE_TEMPLATES.stdio);
      }
    } else if (category === 'remote') {
      // 远程服务 → 填充当前选中的协议模板
      if (!serverValueContent || allTemplateValues.includes(serverValueContent)) {
        setServerValueContent(SERVER_VALUE_TEMPLATES[remoteProtocol]);
      }
    }
    setConfigRefExpanded(false);
  };

  // 切换远程协议子类型
  const handleRemoteProtocolChange = (protocol: 'streamable-http' | 'sse') => {
    setRemoteProtocol(protocol);
    if (!serverValueContent || allTemplateValues.includes(serverValueContent)) {
      setServerValueContent(SERVER_VALUE_TEMPLATES[protocol]);
    }
  };

  // ── 校验逻辑 ──────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // name 校验
    if (!name.trim()) {
      newErrors.name = '请输入服务标识';
    } else if (!NAME_PATTERN.test(name.trim())) {
      newErrors.name = '仅支持英文字母、数字、连字符，长度 1-64 个字符';
    } else if (existingNames.some(n => n === name.trim())) {
      newErrors.name = '该标识已存在，请使用其他名称';
    }

    // 连接类别校验
    if (!connectionCategory) {
      newErrors.connectionCategory = '请选择连接方式';
    }

    // JSON 校验
    const transport = effectiveTransportType;
    if (!serverValueContent.trim()) {
      newErrors.configJson = '请填写服务配置';
    } else if (name.trim() && NAME_PATTERN.test(name.trim())) {
      const fullJson = assembleFullJson(name.trim(), serverValueContent);
      try {
        const parsed = JSON.parse(fullJson);
        const server = parsed?.mcp?.servers?.[name.trim()];

        if (!server || typeof server !== 'object') {
          newErrors.configJson = '配置格式错误，请检查 JSON 语法';
        } else {
          // transportType 匹配校验
          if (!newErrors.configJson && transport) {
            if (server.transportType && server.transportType !== transport) {
              newErrors.configJson = `transportType 与连接方式不一致（期望 "${transport}"，实际 "${server.transportType}"）`;
            }
          }
          // URL / command 校验
          if (!newErrors.configJson && transport) {
            if (transport === 'sse' || transport === 'streamable-http') {
              if (!server.url || (typeof server.url === 'string' && !/^https?:\/\//.test(server.url) && server.url !== 'MCP服务的URL')) {
                newErrors.configJson = 'URL 必须以 http 或 https 开头';
              }
            }
            if (transport === 'stdio') {
              if (!server.command || (typeof server.command === 'string' && !server.command.trim())) {
                newErrors.configJson = '请输入可执行命令';
              }
            }
          }
        }
      } catch {
        newErrors.configJson = 'JSON 格式错误，请检查';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = (): boolean => validate();

  const handleNext = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const fullJson = assembleFullJson(trimmedName, serverValueContent);
    const newMCP: MCPService = {
      name: trimmedName,
      displayName: displayName.trim() || trimmedName,
      description: description.trim(),
      version: '1.0.0',
      versions: ['1.0.0'],
      transportType: effectiveTransportType as MCPTransportType,
      configJson: fullJson,
      usageDoc: usageDoc.trim() || undefined,
      toolDoc: toolDoc.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onConfirm(newMCP);
    toast.success('MCP 服务创建成功');
    onOpenChange(false);
  };

  /** 显示用的 name，用于固化行展示 */
  const displayServerName = name.trim() && NAME_PATTERN.test(name.trim()) ? name.trim() : 'your-server-name';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>新增 MCP 服务</DialogTitle>
        </DialogHeader>

        {/* ── 步骤指示器（居中） ──────────────────────────── */}
        <div className="flex justify-center mb-2 px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                step === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-600'
              }`}>1</span>
              <span className={`text-sm ${step === 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>基本信息</span>
            </div>
            <div className="w-16 h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                step === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>2</span>
              <span className={`text-sm ${step === 2 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>文档说明</span>
            </div>
          </div>
        </div>

        {/* ── 第一步：基本信息 + 服务配置 ────────── */}
        <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col min-h-0 flex-1"
          >
            <div className="flex-1 overflow-y-auto space-y-5 px-6">
              {/* 用户自填字段提示 */}
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <span className="text-gray-400 text-sm mt-0.5 shrink-0">💡</span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  用户可在租户端自选配此 MCP，请注意敏感数据泄露风险。
                </p>
              </div>
              <div className="space-y-4">
                <Label className="text-base font-semibold">基本信息</Label>

                {/* 服务标识 (name) — 唯一 key */}
                <div>
                  <Label htmlFor="mcp-name" className="text-sm">
                    服务标识 <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-400 mt-0.5 mb-1">
                    唯一标识，对应 JSON 中的 server key，创建后不可修改
                  </p>
                  <Input
                    id="mcp-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., weather-mcp"
                    className="mt-1 font-mono text-sm"
                  />
                  {errors.name ? (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">仅支持英文字母、数字、连字符，长度 1-64 个字符</p>
                  )}
                </div>

                {/* 名称 (displayName) */}
                <div>
                  <Label htmlFor="mcp-display-name" className="text-sm">
                    名称
                  </Label>
                  <p className="text-xs text-gray-400 mt-0.5 mb-1">
                    可选的显示名称，不填则默认与服务标识一致
                  </p>
                  <Input
                    id="mcp-display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., 天气 MCP 服务"
                    className="mt-1"
                  />
                </div>

                {/* 描述 */}
                <div>
                  <Label htmlFor="mcp-desc" className="text-sm">描述</Label>
                  <Textarea
                    id="mcp-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="MCP 服务的简要说明"
                    className="mt-1 resize-none"
                    rows={2}
                  />
                </div>

                {/* 连接方式 — 两级 Radio */}
                <div>
                  <Label className="text-sm">
                    连接方式 <span className="text-red-500">*</span>
                  </Label>
                  {/* 第一级：远程服务 / 本地命令 */}
                  <div className="flex gap-3 mt-2">
                    {(Object.keys(MCP_CONNECTION_CATEGORY_MAP) as MCPConnectionCategory[]).map((cat) => {
                      const isSelected = connectionCategory === cat;
                      const IconComp = cat === 'remote' ? Globe : Terminal;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryChange(cat)}
                          className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/60'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <IconComp className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div className="text-left">
                            <div className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                              {MCP_CONNECTION_CATEGORY_MAP[cat].label}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {MCP_CONNECTION_CATEGORY_MAP[cat].description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.connectionCategory && (
                    <p className="text-xs text-red-500 mt-1">{errors.connectionCategory}</p>
                  )}

                  {/* 第二级：远程服务的协议子选项 */}
                  <AnimatePresence>
                  {connectionCategory === 'remote' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                    <div className="mt-3 ml-1">
                      <Label className="text-xs text-gray-500 mb-1.5 block">传输协议</Label>
                      <div className="flex gap-2">
                        {(Object.keys(MCP_REMOTE_PROTOCOL_MAP) as ('streamable-http' | 'sse')[]).map((proto) => {
                          const isSelected = remoteProtocol === proto;
                          const info = MCP_REMOTE_PROTOCOL_MAP[proto];
                          return (
                            <button
                              key={proto}
                              type="button"
                              onClick={() => handleRemoteProtocolChange(proto)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-sm ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50/60 text-blue-700 font-medium'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-blue-500' : 'bg-gray-300'}`} />
                              {info.label}
                              {info.tag && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  proto === 'streamable-http'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {info.tag}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── 服务配置 (JSON) ────────────────────── */}
              <AnimatePresence>
              {effectiveTransportType && (
              <motion.div
                key={`config-section-${effectiveTransportType}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <Label className="text-base font-semibold">
                  服务配置 <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mb-1">
                  外层结构 <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">mcp.servers.{displayServerName}</code> 已固定，仅需编辑服务器字段内容；可用 <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">&lt;&gt;</code> 框住需用户填写的内容。
                </p>

                {/* 可折叠的配置参考 */}
                {effectiveTransportType && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setConfigRefExpanded(!configRefExpanded)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {configRefExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      查看「{MCP_TRANSPORT_MAP[effectiveTransportType].label}」配置参考
                    </button>
                    {configRefExpanded && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-white max-h-[320px] overflow-y-auto">
                        <div className="prose prose-sm max-w-none text-xs">
                          <MDXRenderer content={CONFIG_REFERENCE[effectiveTransportType]} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 固化外层 + 可编辑 server 内部字段 的编辑器 */}
                <div className="border border-gray-200 rounded-xl overflow-hidden font-mono text-xs">
                  {/* 固定前缀行（不可编辑）— 4 层深度，2 空格缩进 */}
                  <div className="bg-gray-50 text-gray-400 px-3 py-1.5 border-b border-[#e5e5e5] select-none leading-relaxed text-xs whitespace-pre">
                    <div>{'{'}</div>
                    <div>{'  "mcp": {'}</div>
                    <div>{'    "servers": {'}</div>
                    <div>{'      '}<span className="text-gray-500">{`"${displayServerName}"`}</span>{': {'}</div>
                  </div>
                  {/* 可编辑区域（第四层内容） */}
                  <div className="relative">
                    {/* 整理缩进按钮 — 悬浮在编辑区右上角 */}
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setServerValueContent(trimCommonIndent(serverValueContent))}
                            className="absolute top-1.5 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <AlignLeft className="w-3 h-3" />
                            整理缩进
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          移除多余的公共缩进空格
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Textarea
                      value={serverValueContent}
                      onChange={(e) => setServerValueContent(e.target.value)}
                      placeholder={connectionCategory ? '已填入模板，可直接修改配置字段' : '请先选择连接方式'}
                      className="border-0 rounded-none font-mono text-xs min-h-[120px] focus-visible:ring-0 focus-visible:ring-offset-0 resize-y leading-relaxed"
                      rows={6}
                      style={{ paddingLeft: 'calc(0.75rem + 8ch)', fontSize: '12px' }}
                    />
                  </div>
                  {/* 固定后缀行（不可编辑） */}
                  <div className="bg-gray-50 text-gray-400 px-3 py-1.5 border-t border-[#e5e5e5] select-none leading-relaxed text-xs whitespace-pre">
                    <div>{'      }'}</div>
                    <div>{'    }'}</div>
                    <div>{'  }'}</div>
                    <div>{'}'}</div>
                  </div>
                </div>
                {errors.configJson && (
                  <p className="text-xs text-red-500 mt-1">{errors.configJson}</p>
                )}
                {/* 展示配置中检测到的需用户填写字段 */}
                {(() => {
                  const matches = serverValueContent.match(/<([^>]+)>/g);
                  // 从配置文本中提取包含占位符的 JSON key 名称
                  const extractFieldKeys = (content: string, placeholders: string[]): string[] => {
                    const keys: string[] = [];
                    placeholders.forEach(ph => {
                      // 匹配 "KeyName": "...<placeholder>..." 或 "KeyName": "<placeholder>" 模式
                      const keyMatch = content.match(new RegExp(`"([^"]+)"\\s*:\\s*"[^"]*${ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`));
                      if (keyMatch) {
                        keys.push(keyMatch[1]);
                      }
                    });
                    return [...new Set(keys)];
                  };
                  const placeholders = matches ? [...new Set(matches)] : [];
                  const fieldKeys = placeholders.length > 0 ? extractFieldKeys(serverValueContent, placeholders) : [];
                  return (
                    <div className="flex items-center gap-2 mt-2 mb-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <div className="text-xs text-blue-700 leading-relaxed flex items-center gap-1.5 flex-wrap">
                        <span>需填写字段：</span>
                        {fieldKeys.length > 0 ? (
                          fieldKeys.map((f, i) => (
                            <span key={f} className="inline-flex items-center">
                              {i > 0 && <span className="mx-0.5 text-blue-300">、</span>}
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium text-xs">{f}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-blue-400">无</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* ── 底部按钮（第一步） ────────────────── */}
            <div className="sticky bottom-0 bg-white pt-4 pb-6 border-t border-gray-200 flex justify-end gap-3 px-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                下一步
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── 第二步：使用说明 + 工具说明 ────────── */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col min-h-0 flex-1"
          >
            <div className="flex-1 overflow-y-auto space-y-5 px-6">
              {/* ── 使用说明 (Markdown) ────────────────── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">使用说明</Label>
                  <div className="flex items-center gap-0.5 bg-gray-200/60 rounded p-0.5">
                    <button
                      type="button"
                      onClick={() => setUsageViewMode('edit')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        usageViewMode === 'edit'
                          ? 'bg-white text-gray-900 shadow-sm font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsageViewMode('preview')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        usageViewMode === 'preview'
                          ? 'bg-white text-gray-900 shadow-sm font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      预览
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Markdown 格式，说明如何使用该 MCP 服务</p>
                {usageViewMode === 'edit' ? (
                  <Textarea
                    value={usageDoc}
                    onChange={(e) => setUsageDoc(e.target.value)}
                    placeholder="# 使用说明&#10;&#10;在此编写 Markdown 格式的使用说明..."
                    className="mt-1 font-mono text-xs max-h-[240px] overflow-y-auto"
                    rows={10}
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4 max-h-[240px] overflow-y-auto bg-white">
                    {usageDoc.trim() ? (
                      <MDXRenderer content={usageDoc} />
                    ) : (
                      <p className="text-sm text-gray-400">暂无内容</p>
                    )}
                  </div>
                )}
              </div>

              {/* ── 工具说明 (Markdown) ────────────────── */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">工具说明</Label>
                  <div className="flex items-center gap-0.5 bg-gray-200/60 rounded p-0.5">
                    <button
                      type="button"
                      onClick={() => setToolViewMode('edit')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        toolViewMode === 'edit'
                          ? 'bg-white text-gray-900 shadow-sm font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setToolViewMode('preview')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        toolViewMode === 'preview'
                          ? 'bg-white text-gray-900 shadow-sm font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      预览
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Markdown 格式，说明该 MCP 暴露的工具及参数</p>
                {toolViewMode === 'edit' ? (
                  <Textarea
                    value={toolDoc}
                    onChange={(e) => setToolDoc(e.target.value)}
                    placeholder="# 工具列表&#10;&#10;在此编写 Markdown 格式的工具说明..."
                    className="mt-1 font-mono text-xs max-h-[240px] overflow-y-auto"
                    rows={10}
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4 max-h-[240px] overflow-y-auto bg-white">
                    {toolDoc.trim() ? (
                      <MDXRenderer content={toolDoc} />
                    ) : (
                      <p className="text-sm text-gray-400">暂无内容</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── 底部按钮（第二步） ────────────────── */}
            <div className="sticky bottom-0 bg-white pt-4 pb-6 border-t border-gray-200 flex justify-between px-6">
              <Button variant="outline" onClick={handleBack}>
                上一步
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                  创建 MCP
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
