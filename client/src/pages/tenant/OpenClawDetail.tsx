/**
 * OpenClawDetail - OpenClaw 详细配置页
 * Design: 「流动蓝图」Fluid Blueprint
 * - 三栏布局：模型 | 通道 | 技能
 * - 参考图片风格：白色卡片，标题带彩色图标
 */
import { useState } from "react";
import { useRoute, Link } from "wouter";
import TenantLayout from "@/components/TenantLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft, Trash2, EyeOff, Eye,
  Search, ExternalLink, Brain, MessageSquare, Puzzle,
  ChevronRight, ChevronDown, Info,
} from "lucide-react";
import { MOCK_OPENCLAW_LIST, AVAILABLE_SKILLS } from "@/lib/mockData";

// ─── 通道配置定义 ───────────────────────────────────────────────────────────────

type ChannelField = {
  key: string;
  label: string;
  secret: boolean; // true = 加密显示（保留前3字符）
};

type ChannelConfig = {
  value: string;
  label: string;
  descText: string;
  detailUrl: string;
  hasInfoIcon?: boolean;
  fields?: ChannelField[];
  feishuMode?: true; // 飞书特殊处理
};

const CHANNEL_OPTIONS: ChannelConfig[] = [
  {
    value: "wework",
    label: "企业微信",
    descText: "企业微信是一款高效协同办公的企业通讯与办公工具。",
    detailUrl: "#",
    hasInfoIcon: true,
    fields: [
      { key: "token", label: "企业微信机器人的Token", secret: true },
      { key: "encodingAESKey", label: "企业微信机器人的encodingAESKey", secret: true },
    ],
  },
  {
    value: "qq",
    label: "QQ",
    descText: "一键解锁智能玩法，开启你的个性化QQ机器人之旅。",
    detailUrl: "#",
    fields: [
      { key: "appId", label: "QQ机器人的App ID", secret: false },
      { key: "appSecret", label: "QQ机器人的App Secret", secret: true },
    ],
  },
  {
    value: "feishu",
    label: "飞书",
    descText: "飞书是字节跳动推出的一站式先进协作平台，AI 赋能助力高效办公。",
    detailUrl: "#",
    feishuMode: true,
    // 快捷配置和手动配置都存 appId + appSecret
    fields: [
      { key: "appId", label: "飞书应用的App ID", secret: false },
      { key: "appSecret", label: "飞书应用的App Secret", secret: true },
    ],
  },
  {
    value: "dingtalk",
    label: "钉钉",
    descText: "钉钉是阿里打造的智能办公平台，驱动组织数字化管理升级。",
    detailUrl: "#",
    fields: [
      { key: "clientId", label: "钉钉应用的Client ID", secret: false },
      { key: "clientSecret", label: "钉钉应用的Client Secret", secret: true },
    ],
  },
];

// ─── 模型配置定义 ────────────────────────────────────────────────────────────────

type ModelVersion = {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
};

type ModelProvider = {
  value: string;
  label: string;
  versions: ModelVersion[];
};

const MODEL_PROVIDERS: ModelProvider[] = [
  {
    value: "tencent-deepseek",
    label: "腾讯云 DeepSeek",
    versions: [
      { value: "deepseek-v3", label: "DeepSeek V3 0324" },
      { value: "deepseek-r1", label: "DeepSeek R1" },
    ],
  },
  {
    value: "tencent-hunyuan",
    label: "腾讯云混元",
    versions: [
      { value: "hunyuan-turbos", label: "混元 TurboS Latest" },
      { value: "hunyuan-pro", label: "混元 Pro" },
    ],
  },
  {
    value: "custom",
    label: "自定义模型",
    versions: [
      { value: "custom", label: "自定义模型", badge: "需自费", badgeColor: "bg-amber-50 text-amber-600 border-amber-100" },
    ],
  },
];

const DEFAULT_CUSTOM_JSON = `{
  "provider": "provider_name",
  "base_url": "baseurl",
  "api": "API协议",
  "api_key": "your-api-key-here",
  "model": {
    "id": "model_id",
    "name": "model_name"
  }
}`;

// ─── 工具函数 ────────────────────────────────────────────────────────────────────

/** 加密显示：保留前3字符，后面用 •••••• 替代 */
function maskSecret(val: string): string {
  if (!val) return "";
  if (val.length <= 3) return val;
  return val.slice(0, 3) + "••••••";
}

// ─── 已接入通道数据结构 ───────────────────────────────────────────────────────────

type AppliedChannel = {
  type: string;       // label
  channelValue: string; // value key
  status: "running";
  fields: ChannelField[];
  fieldValues: Record<string, string>;
  feishuConfigMode?: "quick" | "manual"; // 飞书专用
};

// ─── 主组件 ──────────────────────────────────────────────────────────────────────

export default function OpenClawDetail() {
  const [, params] = useRoute("/openclaw/:id");
  const clawId = params?.id;
  const claw = MOCK_OPENCLAW_LIST.find((c) => c.id === clawId) || MOCK_OPENCLAW_LIST[0];

  const clawName = claw.name;

  // ── Model state ──
  const [selectedProvider, setSelectedProvider] = useState(MODEL_PROVIDERS[0].value);
  const [selectedModel, setSelectedModel] = useState(MODEL_PROVIDERS[0].versions[0].value);
  const [customInputMode, setCustomInputMode] = useState<"json" | "form">("json");
  const [customJson, setCustomJson] = useState(DEFAULT_CUSTOM_JSON);
  const [customForm, setCustomForm] = useState({ provider: "", base_url: "", api: "", api_key: "", model_id: "", model_name: "" });
  const [appliedModel, setAppliedModel] = useState({ providerLabel: "腾讯云 DeepSeek", versionLabel: "DeepSeek V3 0324", active: true, isCustom: false, customName: "" });

  const currentProvider = MODEL_PROVIDERS.find(p => p.value === selectedProvider) || MODEL_PROVIDERS[0];
  const currentVersions = currentProvider.versions;

  const handleProviderChange = (providerValue: string) => {
    setSelectedProvider(providerValue);
    const provider = MODEL_PROVIDERS.find(p => p.value === providerValue);
    if (provider) setSelectedModel(provider.versions[0].value);
  };

  // ── Channel state ──
  const [selectedChannel, setSelectedChannel] = useState("wework");
  const [channelFields, setChannelFields] = useState<Record<string, string>>({});
  // 飞书专用：快捷/手动 Tab
  const [feishuConfigMode, setFeishuConfigMode] = useState<"quick" | "manual">("manual");
  // 飞书二维码弹窗
  const [showQrModal, setShowQrModal] = useState(false);
  // 已接入通道
  const [appliedChannels, setAppliedChannels] = useState<AppliedChannel[]>([
    {
      type: "飞书", channelValue: "feishu", status: "running",
      fields: CHANNEL_OPTIONS.find(c => c.value === "feishu")!.fields!,
      fieldValues: { appId: "cli_a1b2c3d4e5f6", appSecret: "abc123456789" },
      feishuConfigMode: "manual",
    },
    {
      type: "QQ", channelValue: "qq", status: "running",
      fields: CHANNEL_OPTIONS.find(c => c.value === "qq")!.fields!,
      fieldValues: { appId: "1234567890", appSecret: "xyz987654321" },
    },
  ]);
  // 已接入通道展开状态（手风琴：同一时间只展开一个，用 index | null）
  const [expandedChannelIdx, setExpandedChannelIdx] = useState<number | null>(null);

  const toggleExpandChannel = (idx: number) => {
    setExpandedChannelIdx(prev => prev === idx ? null : idx);
  };

  // ── Skills state ──
  const [skillSearch, setSkillSearch] = useState("");
  const [installedSkills, setInstalledSkills] = useState(claw.skills || [
    "tavily-search 1.0.0",
    "summarize 1.0.0",
    "agent-browser 0.2.0",
    "find-skills 0.1.0",
    "github 1.0.0",
    "obsidian 1.0.0",
    "notion 1.0.0",
    "weather 1.0.0",
    "tencentcloud-lighthouse-skill 1.0.0",
    "tencent-docs 1.0.3",
  ]);

  // ── Handlers ──

  const handleApplyModel = () => {
    if (selectedProvider === "custom") {
      const customName = customInputMode === "json"
        ? (() => { try { const parsed = JSON.parse(customJson); return parsed?.model?.name || ""; } catch { return ""; } })()
        : customForm.model_name;
      setAppliedModel({ providerLabel: "自定义模型", versionLabel: "", active: true, isCustom: true, customName: customName || "" });
    } else {
      const provider = MODEL_PROVIDERS.find(p => p.value === selectedProvider);
      const version = currentVersions.find(v => v.value === selectedModel);
      if (!provider || !version) return;
      setAppliedModel({ providerLabel: provider.label, versionLabel: version.label, active: true, isCustom: false, customName: "" });
    }
    toast.success("模型已添加并应用");
  };

  const handleAddChannel = () => {
    const ch = CHANNEL_OPTIONS.find((c) => c.value === selectedChannel);
    if (!ch) return;

    // 飞书快捷配置：点击"前往授权"弹出二维码
    if (ch.feishuMode && feishuConfigMode === "quick") {
      setShowQrModal(true);
      return;
    }

    const newEntry: AppliedChannel = {
      type: ch.label,
      channelValue: ch.value,
      status: "running",
      fields: ch.fields || [],
      fieldValues: { ...channelFields },
      feishuConfigMode: ch.feishuMode ? feishuConfigMode : undefined,
    };
    setAppliedChannels([...appliedChannels, newEntry]);
    setChannelFields({});
    toast.success(`${ch.label} 通道已添加`);
  };



  const filteredSkills = AVAILABLE_SKILLS.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const currentChannelConfig = CHANNEL_OPTIONS.find((c) => c.value === selectedChannel);

  // ─── 渲染通道配置输入区 ───────────────────────────────────────────────────────

  const renderChannelInputs = () => {
    if (!currentChannelConfig) return null;

    if (currentChannelConfig.feishuMode) {
      return (
        <div className="space-y-3">
          {/* 手动/快捷 Tab（手动在前，快捷置灰禁用） */}
          <div className="flex rounded-lg border border-gray-200">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors border-r border-gray-200 rounded-l-lg ${feishuConfigMode === "manual" ? "bg-white text-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              onClick={() => setFeishuConfigMode("manual")}
            >
              手动配置
            </button>
            <div className="relative flex-1 group">
              <button
                disabled
                className="w-full py-2 text-sm font-medium bg-gray-50 text-gray-300 cursor-not-allowed rounded-r-lg"
              >
                快捷配置
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                扫码一键配置飞书机器人能力即将开放
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            </div>
          </div>

          {feishuConfigMode === "manual" && (
            <div className="space-y-2">
              {currentChannelConfig.fields!.map((field) => (
                <div key={field.key} className="relative">
                  <Input
                    type={field.secret ? "password" : "text"}
                    placeholder={field.label}
                    value={channelFields[field.key] || ""}
                    onChange={(e) => setChannelFields({ ...channelFields, [field.key]: e.target.value })}
                    className="bg-gray-50 border-gray-200 pr-10"
                  />
                  {field.secret && <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 普通通道
    return (
      <div className="space-y-2">
        {currentChannelConfig.fields?.map((field) => (
          <div key={field.key} className="relative">
            <Input
              type={field.secret ? "password" : "text"}
              placeholder={field.label}
              value={channelFields[field.key] || ""}
              onChange={(e) => setChannelFields({ ...channelFields, [field.key]: e.target.value })}
              className="bg-gray-50 border-gray-200 pr-10"
            />
            {field.secret && <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>
    );
  };

  // ─── 渲染已接入通道的展开配置项 ───────────────────────────────────────────────

  const renderAppliedChannelDetail = (ch: AppliedChannel) => {
    // 将字段 label 转换为简短 key 名（如 "飞书应用的App ID" → "appId"）
    const getShortKey = (field: ChannelField): string => {
      if (field.key === "appId" || field.key === "clientId") return field.key;
      if (field.key === "appSecret" || field.key === "clientSecret") return field.key;
      if (field.key === "token") return "token";
      if (field.key === "encodingAESKey") return "encodingAESKey";
      return field.key;
    };
    return (
      <div className="mx-2 mb-2 rounded-lg bg-white border border-gray-100 px-4 py-3 space-y-2">
        {ch.fields.map((field) => {
          const val = ch.fieldValues[field.key] || "";
          const displayVal = field.secret ? maskSecret(val) : val;
          const shortKey = getShortKey(field);
          return (
            <div key={field.key} className="flex items-start gap-1 text-sm">
              <span className="text-gray-500 shrink-0">{shortKey}：</span>
              <span className="text-gray-800 font-mono break-all">{displayVal || "—"}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
    <TenantLayout>
      <div className="max-w-7xl mx-auto px-6 py-8 page-enter">
        {/* Back */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/my-openclaw">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.1), rgba(88,86,214,0.1))" }}>
            🦞
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{clawName}</h1>
            <span className="badge-running ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              运行中
            </span>
          </div>
        </div>

        {/* Three-column layout - unified height, upper fixed / lower scrollable */}
        <div className="grid grid-cols-3 gap-5" style={{ minHeight: 0, alignItems: "start" }}>

          {/* ===== Model Column ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)", height: "680px" }}>
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">模型 (Models)</h2>
              </div>
            </div>

            {/* Upper: config inputs - fixed */}
            <div className="p-5 space-y-3 flex-shrink-0">
              {/* 模型厂商选择 */}
              <Select value={selectedProvider} onValueChange={handleProviderChange}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="选择模型厂商" />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <span>{p.label}</span>
                        {p.value === "custom" && (
                          <span className="text-xs px-1.5 py-0.5 rounded border font-medium bg-amber-50 text-amber-600 border-amber-100">
                            需自费
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 模型版本选择（自定义模型厂商时隐藏） */}
              {selectedProvider !== "custom" && (
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                    <SelectValue placeholder="选择模型版本" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentVersions.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        <span>{v.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedProvider === "custom" && (
                <div className="space-y-3 pt-1">
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${customInputMode === "json" ? "bg-white text-blue-600 border-r border-gray-200" : "bg-gray-50 text-gray-500 border-r border-gray-200 hover:bg-gray-100"}`}
                      onClick={() => setCustomInputMode("json")}
                    >
                      JSON 输入
                    </button>
                    <button
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${customInputMode === "form" ? "bg-white text-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                      onClick={() => setCustomInputMode("form")}
                    >
                      表单输入
                    </button>
                  </div>

                  {customInputMode === "json" ? (
                    <Textarea
                      value={customJson}
                      onChange={(e) => setCustomJson(e.target.value)}
                      className="font-mono text-xs bg-gray-50 border-gray-200 min-h-[180px] resize-none"
                      spellCheck={false}
                    />
                  ) : (
                    <div className="space-y-2">
                      {[
                        { key: "provider", label: "请输入自定义模型 provider" },
                        { key: "base_url", label: "请输入自定义模型 base_url" },
                        { key: "api", label: "请输入自定义模型 api" },
                        { key: "api_key", label: "请输入自定义模型 api_key" },
                        { key: "model_id", label: "请输入自定义模型 model.id" },
                        { key: "model_name", label: "请输入自定义模型 model.name" },
                      ].map((field) => (
                        <Input
                          key={field.key}
                          placeholder={field.label}
                          value={customForm[field.key as keyof typeof customForm]}
                          onChange={(e) => setCustomForm({ ...customForm, [field.key]: e.target.value })}
                          className="bg-gray-50 border-gray-200 text-sm"
                        />
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 leading-relaxed">
                    使用自定义模型需自行承担 Tokens 费用，不计入公司提供的大模型 Tokens 范围。
                    <a href="#" className="text-blue-500 hover:underline ml-1 inline-flex items-center gap-0.5">
                      自定义模型配置请查看详细教程 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <Button className="w-full text-sm" variant="outline" onClick={handleApplyModel}>
                添加并应用
              </Button>

            </div>
            {/* Lower: applied model - scrollable */}
            <div className="px-5 pb-5 overflow-y-auto flex-1">
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-2">已应用模型</p>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex flex-col min-w-0 mr-2">
                    {appliedModel.isCustom ? (
                      <>
                        <span className="text-sm font-medium text-gray-800 leading-tight">自定义模型</span>
                        {appliedModel.customName && (
                          <span className="text-xs text-gray-400 leading-tight mt-0.5 truncate">{appliedModel.customName}</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-800 leading-tight">{appliedModel.providerLabel}</span>
                        {appliedModel.versionLabel && (
                          <span className="text-xs text-gray-400 leading-tight mt-0.5">{appliedModel.versionLabel}</span>
                        )}
                      </>
                    )}
                  </div>
                  <span className="badge-running text-xs shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    应用中
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Channel Column ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)", height: "680px" }}>
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">通道 (Channels)</h2>
              </div>
            </div>

            {/* Upper: config inputs - fixed */}
            <div className="p-5 space-y-3 flex-shrink-0">
              {/* 通道下拉 - 固定宽度 */}
              <div className="flex items-center gap-2">
                <Select value={selectedChannel} onValueChange={(v) => { setSelectedChannel(v); setChannelFields({}); setFeishuConfigMode("manual"); }}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                    <SelectValue placeholder="选择通道类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map((ch) => (
                      <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentChannelConfig?.hasInfoIcon && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="shrink-0 text-gray-400 hover:text-blue-500 transition-colors">
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="p-0 border-0 shadow-xl bg-transparent" sideOffset={8}>
                      <img
                        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663415970324/bygiZj33T3TUvGMBPvApKE/pasted_file_To1FVK_image_06b2d1cc.png"
                        alt="企业微信通道示意图"
                        className="rounded-xl max-w-xs"
                        style={{ width: 320 }}
                      />
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* 动态配置输入区 */}
              {renderChannelInputs()}

              {/* 操作按钮 */}
              <Button className="w-full text-sm" variant="outline" onClick={handleAddChannel}>
                {currentChannelConfig?.feishuMode && feishuConfigMode === "quick" ? "前往授权" : "添加并应用"}
              </Button>

              {/* 底部说明 */}
              <p className="text-xs text-gray-400 leading-relaxed">
                {currentChannelConfig?.descText}
                <a href={currentChannelConfig?.detailUrl || "#"} className="text-blue-500 hover:underline ml-1">
                  查看详情 ↗
                </a>
              </p>

            </div>
            {/* Lower: applied channels - scrollable */}
            <div className="px-5 pb-5 overflow-y-auto flex-1">
              {appliedChannels.length > 0 && (
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-2">已接入通道</p>
                  <div className="space-y-1">
                    {appliedChannels.map((ch, idx) => (
                      <div key={idx} className="rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                        {/* 折叠行 */}
                        <div className="flex items-center justify-between px-2.5 py-2">
                          <button
                            className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                            onClick={() => toggleExpandChannel(idx)}
                          >
                            {expandedChannelIdx === idx
                              ? <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                              : <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                            }
                            <span className="text-sm font-medium text-gray-800 truncate">{ch.type}</span>
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="badge-running text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                              运行中
                            </span>
                            <button
                              onClick={() => {
                                setAppliedChannels(appliedChannels.filter((_, i) => i !== idx));
                                if (expandedChannelIdx === idx) setExpandedChannelIdx(null);
                              }}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {/* 展开配置项 */}
                        {expandedChannelIdx === idx && renderAppliedChannelDetail(ch)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== Skills Column ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)", height: "680px" }}>            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Puzzle className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">技能 (Skills)</h2>
              </div>
            </div>

            {/* Upper: search + install - fixed */}
            <div className="p-5 space-y-3 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="请输入准确 Skill 名称"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200 text-xs"
                />
              </div>

              <Button className="w-full text-sm" variant="outline" onClick={() => toast.info("功能开发中")}>
                安装技能
              </Button>
            </div>
            {/* Lower: installed skills - scrollable */}
            <div className="px-5 pb-5 overflow-y-auto flex-1">
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-2">已安装技能</p>
                <div className="space-y-1">
                  {(skillSearch ? filteredSkills : installedSkills).map((skill) => (
                    <div key={skill}
                      className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm text-gray-700">{skill}</span>
                    </div>
                  ))}
                  {skillSearch && filteredSkills.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">未找到相关技能</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 飞书二维码弹窗 ===== */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-lg [&>button]:focus-visible:ring-0 [&>button]:focus-visible:ring-offset-0 [&>button]:outline-none">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-gray-900">扫码配置飞书机器人</DialogTitle>
                <DialogDescription className="text-sm text-gray-400 mt-0.5">
                  请使用飞书扫描下方二维码完成授权配置
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex items-center justify-center bg-gray-50 rounded-xl p-8 mt-2">
            {/* 模拟二维码 SVG */}
            <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
              <rect width="180" height="180" fill="white"/>
              {/* 左上角定位块 */}
              <rect x="10" y="10" width="50" height="50" fill="black"/>
              <rect x="18" y="18" width="34" height="34" fill="white"/>
              <rect x="26" y="26" width="18" height="18" fill="black"/>
              {/* 右上角定位块 */}
              <rect x="120" y="10" width="50" height="50" fill="black"/>
              <rect x="128" y="18" width="34" height="34" fill="white"/>
              <rect x="136" y="26" width="18" height="18" fill="black"/>
              {/* 左下角定位块 */}
              <rect x="10" y="120" width="50" height="50" fill="black"/>
              <rect x="18" y="128" width="34" height="34" fill="white"/>
              <rect x="26" y="136" width="18" height="18" fill="black"/>
              {/* 数据模块 - 随机分布 */}
              <rect x="70" y="10" width="8" height="8" fill="black"/>
              <rect x="82" y="10" width="8" height="8" fill="black"/>
              <rect x="94" y="10" width="8" height="8" fill="black"/>
              <rect x="106" y="10" width="8" height="8" fill="black"/>
              <rect x="70" y="22" width="8" height="8" fill="black"/>
              <rect x="94" y="22" width="8" height="8" fill="black"/>
              <rect x="70" y="34" width="8" height="8" fill="black"/>
              <rect x="82" y="34" width="8" height="8" fill="black"/>
              <rect x="106" y="34" width="8" height="8" fill="black"/>
              <rect x="70" y="46" width="8" height="8" fill="black"/>
              <rect x="94" y="46" width="8" height="8" fill="black"/>
              <rect x="70" y="58" width="8" height="8" fill="black"/>
              <rect x="82" y="58" width="8" height="8" fill="black"/>
              <rect x="94" y="58" width="8" height="8" fill="black"/>
              <rect x="106" y="58" width="8" height="8" fill="black"/>
              <rect x="10" y="70" width="8" height="8" fill="black"/>
              <rect x="22" y="70" width="8" height="8" fill="black"/>
              <rect x="46" y="70" width="8" height="8" fill="black"/>
              <rect x="58" y="70" width="8" height="8" fill="black"/>
              <rect x="70" y="70" width="8" height="8" fill="black"/>
              <rect x="94" y="70" width="8" height="8" fill="black"/>
              <rect x="118" y="70" width="8" height="8" fill="black"/>
              <rect x="130" y="70" width="8" height="8" fill="black"/>
              <rect x="154" y="70" width="8" height="8" fill="black"/>
              <rect x="166" y="70" width="8" height="8" fill="black"/>
              <rect x="10" y="82" width="8" height="8" fill="black"/>
              <rect x="34" y="82" width="8" height="8" fill="black"/>
              <rect x="58" y="82" width="8" height="8" fill="black"/>
              <rect x="82" y="82" width="8" height="8" fill="black"/>
              <rect x="106" y="82" width="8" height="8" fill="black"/>
              <rect x="130" y="82" width="8" height="8" fill="black"/>
              <rect x="154" y="82" width="8" height="8" fill="black"/>
              <rect x="10" y="94" width="8" height="8" fill="black"/>
              <rect x="22" y="94" width="8" height="8" fill="black"/>
              <rect x="46" y="94" width="8" height="8" fill="black"/>
              <rect x="70" y="94" width="8" height="8" fill="black"/>
              <rect x="94" y="94" width="8" height="8" fill="black"/>
              <rect x="118" y="94" width="8" height="8" fill="black"/>
              <rect x="142" y="94" width="8" height="8" fill="black"/>
              <rect x="166" y="94" width="8" height="8" fill="black"/>
              <rect x="10" y="106" width="8" height="8" fill="black"/>
              <rect x="34" y="106" width="8" height="8" fill="black"/>
              <rect x="58" y="106" width="8" height="8" fill="black"/>
              <rect x="82" y="106" width="8" height="8" fill="black"/>
              <rect x="106" y="106" width="8" height="8" fill="black"/>
              <rect x="130" y="106" width="8" height="8" fill="black"/>
              <rect x="154" y="106" width="8" height="8" fill="black"/>
              <rect x="70" y="118" width="8" height="8" fill="black"/>
              <rect x="82" y="118" width="8" height="8" fill="black"/>
              <rect x="106" y="118" width="8" height="8" fill="black"/>
              <rect x="118" y="118" width="8" height="8" fill="black"/>
              <rect x="142" y="118" width="8" height="8" fill="black"/>
              <rect x="166" y="118" width="8" height="8" fill="black"/>
              <rect x="70" y="130" width="8" height="8" fill="black"/>
              <rect x="94" y="130" width="8" height="8" fill="black"/>
              <rect x="118" y="130" width="8" height="8" fill="black"/>
              <rect x="130" y="130" width="8" height="8" fill="black"/>
              <rect x="154" y="130" width="8" height="8" fill="black"/>
              <rect x="70" y="142" width="8" height="8" fill="black"/>
              <rect x="82" y="142" width="8" height="8" fill="black"/>
              <rect x="94" y="142" width="8" height="8" fill="black"/>
              <rect x="106" y="142" width="8" height="8" fill="black"/>
              <rect x="130" y="142" width="8" height="8" fill="black"/>
              <rect x="142" y="142" width="8" height="8" fill="black"/>
              <rect x="166" y="142" width="8" height="8" fill="black"/>
              <rect x="70" y="154" width="8" height="8" fill="black"/>
              <rect x="94" y="154" width="8" height="8" fill="black"/>
              <rect x="118" y="154" width="8" height="8" fill="black"/>
              <rect x="142" y="154" width="8" height="8" fill="black"/>
              <rect x="70" y="166" width="8" height="8" fill="black"/>
              <rect x="82" y="166" width="8" height="8" fill="black"/>
              <rect x="106" y="166" width="8" height="8" fill="black"/>
              <rect x="130" y="166" width="8" height="8" fill="black"/>
              <rect x="154" y="166" width="8" height="8" fill="black"/>
              <rect x="166" y="166" width="8" height="8" fill="black"/>
            </svg>
          </div>
        </DialogContent>
      </Dialog>
    </TenantLayout>
    </TooltipProvider>
  );
}
