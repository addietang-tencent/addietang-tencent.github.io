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
import { Eye, Code, ChevronDown, ChevronRight, Globe, Terminal, AlignLeft, Sparkles, Plus, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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
  type MCPCredentialField,
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
                "transport": "streamable-http",
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
                "transport": "stdio",
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
| \`transport\` | ✅ | 固定值 \`"sse"\` |
| \`url\` | ✅ | 必须以 http 或 https 开头（常见以 \`/sse\` 结尾） |
| \`headers\` | — | 如 MCP Server 要求 Token 认证，在此填写；否则可删除 |
| \`security_zone\` | — | 如 MCP 部署在 DevCloud，填写 \`"devnet"\` |
| \`timeout\` | — | 超时时间，单位秒，默认 60 |
| \`username\` | — | 用户标识 |`,
  'streamable-http': `| 字段 | 必填 | 说明 |
|------|------|------|
| \`transport\` | ✅ | 固定值 \`"streamable-http"\` |
| \`url\` | ✅ | 必须以 http 或 https 开头（常见以 \`/mcp\` 结尾）。<br/>支持将凭据注入 Query 参数拼接到 URL 中，格式示例：\`http://mcp.cn?key1=<>&key2=<>\`，其中参数名（如 key1）需按 MCP 服务要求命名 |
| \`headers\` | — | 如 MCP Server 要求 Token 认证，在此填写；否则可删除 |
| \`security_zone\` | — | 如 MCP 部署在 DevCloud，填写 \`"devnet"\` |
| \`timeout\` | — | 超时时间，单位秒，默认 60 |
| \`username\` | — | 用户标识 |`,
  stdio: `| 字段 | 必填 | 说明 |
|------|------|------|
| \`transport\` | ✅ | 固定值 \`"stdio"\` |
| \`command\` | ✅ | 可执行文件路径（支持绝对/相对路径） |
| \`args\` | — | 传给命令的参数数组，没有可留空 \`[]\` |
| \`env\` | — | 启动时的环境变量，没有可整段删除 |
| \`cwd\` | — | 子进程工作目录，默认继承 Agent 目录 |
| \`timeout\` | — | 超时时间，单位秒，默认 60 |`,
};

// ── 连接方式对应的 server 内部 JSON 模板（不含 server key） ──────
const SERVER_VALUE_TEMPLATES: Record<MCPTransportType, string> = {
  sse: [
    `"transport": "sse",`,
    `"url": "MCP服务的URL",`,
    `"headers": {`,
    `  "Authorization": "<your-token>"`,
    `},`,
    `"timeout": 60`,
  ].join('\n'),
  'streamable-http': [
    `"transport": "streamable-http",`,
    `"url": "MCP服务的URL",`,
    `"headers": {`,
    `  "Authorization": "<your-token>"`,
    `},`,
    `"timeout": 60`,
  ].join('\n'),
  stdio: [
    `"transport": "stdio",`,
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
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  if (nonEmptyLines.length === 0) return text;
  const minIndent = Math.min(...nonEmptyLines.map(l => l.match(/^(\s*)/)?.[1].length ?? 0));
  if (minIndent === 0) return text;
  const trimmed = lines.map(l => (l.trim().length > 0 ? l.slice(minIndent) : '')).join('\n');
  return trimmed.replace(/\n+$/, '');
}

/** 将用户编辑的 server 内部内容组装成完整 JSON 字符串 */
function assembleFullJson(serverName: string, serverValueContent: string): string {
  const indentedLines = serverValueContent
    .split('\n')
    .map(line => (line.trim() ? `        ${line}` : ''))
    .join('\n');
  const escapedName = JSON.stringify(serverName);
  return `{\n  "mcp": {\n    "servers": {\n      ${escapedName}: {\n${indentedLines}\n      }\n    }\n  }\n}`;
}

/**
 * 从服务配置文本中提取 headers 里所有含占位符 <...> 的字段
 * 返回 { headerKey, placeholder } 数组，支持多行 headers
 */
function extractCredentialPlaceholders(serverValueContent: string): Array<{ headerKey: string; placeholder: string }> {
  const results: Array<{ headerKey: string; placeholder: string }> = [];
  const lineRegex = /"([^"]+)"\s*:\s*"([^"]*<([^>]+)>[^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = lineRegex.exec(serverValueContent)) !== null) {
    results.push({ headerKey: m[1], placeholder: m[3] });
  }
  return results;
}

/** name 格式校验 */
const NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9\-]{0,63}$/;

interface MCPAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mcp: MCPService) => void;
  existingNames?: string[];
}

interface FormErrors {
  name?: string;
  displayName?: string;
  connectionCategory?: string;
  transport?: string;
  configJson?: string;
  /** 凭据字段校验错误，以 headerKey 为 key */
  credentialFields?: Record<string, string>;
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
  const [connectionCategory, setConnectionCategory] = useState<MCPConnectionCategory | ''>('');
  const [remoteProtocol, setRemoteProtocol] = useState<'streamable-http' | 'sse'>('streamable-http');
  const [serverValueContent, setServerValueContent] = useState('');
  const [configRefExpanded, setConfigRefExpanded] = useState(false);
  const [usageDoc, setUsageDoc] = useState('');
  const [toolDoc, setToolDoc] = useState('');
  const [usageViewMode, setUsageViewMode] = useState<'edit' | 'preview'>('edit');
  const [toolViewMode, setToolViewMode] = useState<'edit' | 'preview'>('edit');
  const [errors, setErrors] = useState<FormErrors>({});
  const [credentialHostingEnabled, setCredentialHostingEnabled] = useState(false);
  /** 凭据托管全局模式：'hosted' = 填写真实凭据；'placeholder' = 保留占位符 */
  const [credentialMode, setCredentialMode] = useState<'hosted' | 'placeholder'>('hosted');
  const [ipWhitelist, setIpWhitelist] = useState<string[]>(['']);
  /** 凭据字段列表，随 headers 动态更新，只存 headerKey + value */
  const [credentialFields, setCredentialFields] = useState<MCPCredentialField[]>([]);
  /** 正在校验的字段 headerKey */
  const [validatingKey, setValidatingKey] = useState<string | null>(null);

  const effectiveTransportType: MCPTransportType | '' =
    connectionCategory === 'local'
      ? 'stdio'
      : connectionCategory === 'remote'
        ? remoteProtocol
        : '';

  const allTemplateValues = Object.values(SERVER_VALUE_TEMPLATES);

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
    setCredentialHostingEnabled(false);
    setCredentialMode('hosted');
    setIpWhitelist(['']);
    setCredentialFields([]);
    setValidatingKey(null);
  }, []);

  useEffect(() => {
    if (open) {
      setUsageDoc(DEFAULT_USAGE_DOC);
      setToolDoc(DEFAULT_TOOL_DOC);
    } else {
      resetForm();
    }
  }, [open, resetForm]);

  /**
   * 根据最新的 serverValueContent 同步更新 credentialFields：
   * - 新增 header key → 追加一条默认 placeholder 配置
   * - 删除 header key → 移除对应配置
   * - 已有 key 保持不变（不覆盖用户已设置的 mode/value）
   */
  const syncCredentialFields = useCallback((content: string, fields: MCPCredentialField[]): MCPCredentialField[] => {
    const placeholders = extractCredentialPlaceholders(content);
    const updated: MCPCredentialField[] = placeholders.map(({ headerKey }) => {
      const existing = fields.find(f => f.headerKey === headerKey);
      return existing ?? { headerKey };
    });
    return updated;
  }, []);

  // 当 serverValueContent 变化时，同步凭据字段列表
  useEffect(() => {
    if (credentialHostingEnabled) {
      setCredentialFields(prev => syncCredentialFields(serverValueContent, prev));
    }
  }, [serverValueContent, credentialHostingEnabled, syncCredentialFields]);

  const handleCategoryChange = (category: MCPConnectionCategory) => {
    setConnectionCategory(category);
    if (category === 'local') {
      if (!serverValueContent || allTemplateValues.includes(serverValueContent)) {
        setServerValueContent(SERVER_VALUE_TEMPLATES.stdio);
      }
    } else if (category === 'remote') {
      if (!serverValueContent || allTemplateValues.includes(serverValueContent)) {
        setServerValueContent(SERVER_VALUE_TEMPLATES[remoteProtocol]);
      }
    }
    setConfigRefExpanded(false);
  };

  const handleRemoteProtocolChange = (protocol: 'streamable-http' | 'sse') => {
    setRemoteProtocol(protocol);
    if (!serverValueContent || allTemplateValues.includes(serverValueContent)) {
      setServerValueContent(SERVER_VALUE_TEMPLATES[protocol]);
    }
  };

  const handleCredentialHostingChange = (enabled: boolean) => {
    setCredentialHostingEnabled(enabled);
    if (enabled) {
      // 开启时立即从当前配置提取凭据字段
      setCredentialFields(prev => syncCredentialFields(serverValueContent, prev));
    } else {
      setCredentialFields([]);
    }
  };

  // ── 校验逻辑 ──────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = '请输入服务标识';
    } else if (!NAME_PATTERN.test(name.trim())) {
      newErrors.name = '仅支持英文字母、数字、连字符，长度 1-64 个字符';
    } else if (existingNames.some(n => n === name.trim())) {
      newErrors.name = '该标识已存在，请使用其他名称';
    }

    if (!connectionCategory) {
      newErrors.connectionCategory = '请选择连接方式';
    }

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
          if (!newErrors.configJson && transport) {
            if (server.transport && server.transport !== transport) {
              newErrors.configJson = `transport 与连接方式不一致（期望 "${transport}"，实际 "${server.transport}"）`;
            }
          }
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

  /** Mock 校验凭据有效性：以 "invalid" 开头的值判定为无效 */
  const mockValidateCredential = async (value: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(!value.toLowerCase().startsWith('invalid'));
      }, 800);
    });
  };

  const handleNext = async () => {
    if (!validate()) return;

    // 开启凭据托管且选择「填写真实凭据」时，校验所有填写了内容的字段
    if (credentialHostingEnabled && credentialMode === 'hosted') {
      for (const field of credentialFields) {
        if (field.value?.trim()) {
          setValidatingKey(field.headerKey);
          const isValid = await mockValidateCredential(field.value.trim());
          setValidatingKey(null);
          if (!isValid) {
            setErrors(prev => ({
              ...prev,
              credentialFields: { ...(prev.credentialFields ?? {}), [field.headerKey]: `${field.headerKey} 凭据无效，请检查后重新填写` },
            }));
            return;
          }
        }
      }
    }

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
      transport: effectiveTransportType as MCPTransportType,
      configJson: fullJson,
      usageDoc: usageDoc.trim() || undefined,
      toolDoc: toolDoc.trim() || undefined,
      credentialHostingEnabled,
      credentialMode: credentialHostingEnabled ? credentialMode : undefined,
      ipWhitelist: credentialHostingEnabled ? ipWhitelist.filter(ip => ip.trim()) : undefined,
      credentialFields: credentialHostingEnabled && credentialMode === 'hosted' ? credentialFields : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onConfirm(newMCP);
    toast.success('MCP 服务创建成功');
    onOpenChange(false);
  };

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

        {/* ── 步骤指示器 ──────────────────────────── */}
        <div className="flex justify-center mb-2 px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
              }`}>1</span>
              <span className={`text-sm ${step === 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>基本信息</span>
            </div>
            <div className="w-16 h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
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
              {/* 提示 */}
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <span className="text-gray-400 text-sm mt-0.5 shrink-0">💡</span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  用户可在租户端自选配此 MCP，请注意敏感数据泄露风险。
                </p>
              </div>
              <div className="space-y-4">
                <Label className="text-base font-semibold">基本信息</Label>

                {/* 服务标识 */}
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

                {/* 名称 */}
                <div>
                  <Label htmlFor="mcp-display-name" className="text-sm">名称</Label>
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

                {/* 连接方式 */}
                <div>
                  <Label className="text-sm">
                    连接方式 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-3 mt-2">
                    {(Object.keys(MCP_CONNECTION_CATEGORY_MAP) as MCPConnectionCategory[]).map((cat) => {
                      const isSelected = connectionCategory === cat;
                      const IconComp = cat === 'remote' ? Globe : Terminal;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryChange(cat)}
                          className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border-2 transition-all ${
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

                  {/* 远程协议子选项 */}
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
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-all text-sm ${
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
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
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

                {/* 固化外层 + 可编辑 server 内部字段 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden font-mono text-xs">
                  <div className="bg-gray-50 text-gray-400 px-3 py-1.5 border-b border-gray-100 select-none leading-relaxed text-xs whitespace-pre">
                    <div>{'{'}</div>
                    <div>{'  "mcp": {'}</div>
                    <div>{'    "servers": {'}</div>
                    <div>{'      '}<span className="text-gray-500">{`"${displayServerName}"`}</span>{': {'}</div>
                  </div>
                  <div className="relative">
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
                  <div className="bg-gray-50 text-gray-400 px-3 py-1.5 border-t border-gray-100 select-none leading-relaxed text-xs whitespace-pre">
                    <div>{'      }'}</div>
                    <div>{'    }'}</div>
                    <div>{'  }'}</div>
                    <div>{'}'}</div>
                  </div>
                </div>
                {errors.configJson && (
                  <p className="text-xs text-red-500 mt-1">{errors.configJson}</p>
                )}

                {/* 需填写字段展示（凭据托管开启时隐藏） */}
                {!credentialHostingEnabled && (() => {
                  const matches = serverValueContent.match(/<([^>]+)>/g);
                  const extractFieldKeys = (content: string, placeholders: string[]): string[] => {
                    const keys: string[] = [];
                    placeholders.forEach(ph => {
                      const keyMatch = content.match(new RegExp(`"([^"]+)"\\s*:\\s*"[^"]*${ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`));
                      if (keyMatch) keys.push(keyMatch[1]);
                    });
                    return Array.from(new Set(keys));
                  };
                  const placeholders = matches ?? [];
                  const fieldKeys = placeholders.length > 0 ? extractFieldKeys(serverValueContent, placeholders) : [];
                  return (
                    <div className="flex items-center gap-2 mt-2 mb-1 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
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

              {/* ── 凭据托管开关（始终显示，不随服务配置折叠） ──────────── */}
              <div className="space-y-3 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">凭据托管</Label>
                    <p className="text-xs text-gray-400 mt-0.5">开启后，平台将托管该 MCP 服务的访问凭据</p>
                  </div>
                  <Switch
                    checked={credentialHostingEnabled}
                    onCheckedChange={handleCredentialHostingChange}
                  />
                </div>

                {/* 凭据字段配置列表 */}
                <AnimatePresence>
                {credentialHostingEnabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                  <div className="space-y-4 pt-2">
                    {credentialFields.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        服务配置的 <code className="px-1 py-0.5 bg-gray-100 rounded font-mono">headers</code> 中暂无字段，请先在服务配置中添加 headers。
                      </p>
                    ) : (
                      <>
                        {/* 凭据配置标题 */}
                        <p className="text-sm font-medium text-gray-700">凭据配置</p>

                        {/* 全局模式选择：一次选择，所有字段统一应用 */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCredentialMode('hosted');
                              setErrors(prev => ({ ...prev, credentialFields: undefined }));
                            }}
                            className={`flex-1 flex flex-col items-start px-3 py-2 rounded-lg border-2 transition-all text-left ${
                              credentialMode === 'hosted'
                                ? 'border-blue-500 bg-blue-50/60'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`text-xs font-medium ${credentialMode === 'hosted' ? 'text-blue-700' : 'text-gray-700'}`}>
                              填写真实凭据
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5">用户端直接使用，无需再填写</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCredentialMode('placeholder');
                              setErrors(prev => ({ ...prev, credentialFields: undefined }));
                            }}
                            className={`flex-1 flex flex-col items-start px-3 py-2 rounded-lg border-2 transition-all text-left ${
                              credentialMode === 'placeholder'
                                ? 'border-blue-500 bg-blue-50/60'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`text-xs font-medium ${credentialMode === 'placeholder' ? 'text-blue-700' : 'text-gray-700'}`}>
                              保留占位符
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5">用户端自行填写凭据</span>
                          </button>
                        </div>

                        {/* 选择「填写真实凭据」时，展示多行 key/value 输入 */}
                        {credentialMode === 'hosted' && (
                          <div className="space-y-2">
                            {credentialFields.map((field) => (
                              <div key={field.headerKey} className="flex items-center gap-2">
                                <span className="w-40 shrink-0 px-2 py-2 text-xs font-mono bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-left truncate block" title={field.headerKey}>
                                  {field.headerKey}
                                </span>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                      setCredentialFields(prev =>
                                        prev.map(f => f.headerKey === field.headerKey ? { ...f, value: e.target.value } : f)
                                      );
                                      if (errors.credentialFields?.[field.headerKey]) {
                                        setErrors(prev => {
                                          const cf = { ...(prev.credentialFields ?? {}) };
                                          delete cf[field.headerKey];
                                          return { ...prev, credentialFields: cf };
                                        });
                                      }
                                    }}
                                    placeholder="请输入真实凭据"
                                    className={`w-full px-3 py-2 text-sm font-mono bg-white border rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                      errors.credentialFields?.[field.headerKey] ? 'border-red-400' : 'border-gray-300'
                                    }`}
                                    disabled={validatingKey === field.headerKey}
                                  />
                                  {errors.credentialFields?.[field.headerKey] && (
                                    <p className="text-xs text-red-500 mt-1">{errors.credentialFields[field.headerKey]}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                            <p className="text-xs text-gray-400 mt-1">必须填写真实凭据，填写错误将导致调用失败</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* IP 白名单 */}
                    <div className="space-y-2 pt-1 border-t border-gray-100">
                      <label className="text-sm font-medium text-gray-700">IP 白名单</label>
                      <p className="text-xs text-gray-400">
                        仅允许以下 IP 地址访问该 MCP 服务，支持单个 IP 或 CIDR 格式，不填写则所有 IP 均可访问
                      </p>
                      <div className="space-y-2">
                        {ipWhitelist.map((ip, ipIdx) => (
                          <div key={ipIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={ip}
                              onChange={(e) => {
                                const next = [...ipWhitelist];
                                next[ipIdx] = e.target.value;
                                setIpWhitelist(next);
                              }}
                              placeholder="e.g., 192.168.1.100 或 10.0.0.0/8"
                              className="flex-1 px-3 py-2 text-sm font-mono border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            {ipWhitelist.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setIpWhitelist(ipWhitelist.filter((_, i) => i !== ipIdx))}
                                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setIpWhitelist([...ipWhitelist, ''])}
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          添加 IP
                        </button>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>
            {/* ── 底部按钮（第一步） ──────────── */}
            <div className="sticky bottom-0 bg-white pt-4 pb-6 border-t border-gray-200 flex justify-end gap-3 px-6">
              <Button variant="claw-outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                variant="dialog-confirm"
                onClick={handleNext}
                disabled={validatingKey !== null}
              >
                {validatingKey !== null ? '校验中…' : '下一步'}
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
              {/* 使用说明 */}
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
                  <div className="border border-gray-200 rounded-md p-4 max-h-[240px] overflow-y-auto bg-white">
                    {usageDoc.trim() ? (
                      <MDXRenderer content={usageDoc} />
                    ) : (
                      <p className="text-sm text-gray-400">暂无内容</p>
                    )}
                  </div>
                )}
              </div>

              {/* 工具说明 */}
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
                  <div className="border border-gray-200 rounded-md p-4 max-h-[240px] overflow-y-auto bg-white">
                    {toolDoc.trim() ? (
                      <MDXRenderer content={toolDoc} />
                    ) : (
                      <p className="text-sm text-gray-400">暂无内容</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 底部按钮（第二步） */}
            <div className="sticky bottom-0 bg-white pt-4 pb-6 border-t border-gray-200 flex justify-between px-6">
              <Button variant="claw-outline" onClick={handleBack}>
                上一步
              </Button>
              <div className="flex gap-3">
                <Button variant="claw-outline" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button variant="dialog-confirm" onClick={handleSubmit}>
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
