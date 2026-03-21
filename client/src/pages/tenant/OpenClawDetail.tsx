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
  ChevronRight, ChevronDown, Info, CheckCircle2, Loader2, AlertTriangle, AlertCircle,
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
  weworkMode?: true; // 企业微信特殊处理
};

const CHANNEL_OPTIONS: ChannelConfig[] = [
  {
    value: "wework",
    label: "企业微信",
    descText: "企业微信是一款高效协同办公的企业通讯与办公工具。",
    detailUrl: "#",
    hasInfoIcon: true,
    weworkMode: true,
    fields: [
      { key: "botId", label: "企业微信机器人的botId", secret: false },
      { key: "secret", label: "企业微信机器人的secret", secret: true },
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
  weworkConfigMode?: "quick" | "manual"; // 企业微信专用
};

// ─── 主组件 ──────────────────────────────────────────────────────────────────────

export default function OpenClawDetail() {
  const [, params] = useRoute("/openclaw/:id");
  const clawId = params?.id;
  const claw = MOCK_OPENCLAW_LIST.find((c) => c.id === clawId) || MOCK_OPENCLAW_LIST[0];

  const clawName = claw.name;

  // ── Configuration state ──
  const [isConfiguring, setIsConfiguring] = useState(false); // 配置中状态

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
  // 密码显示/隐藏状态
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  // 飞书专用：快捷/手动 Tab（默认快捷配置）
  const [feishuConfigMode, setFeishuConfigMode] = useState<"quick" | "manual">("quick");
  // 企业微信专用：快捷/手动 Tab
  const [weworkConfigMode, setWeworkConfigMode] = useState<"quick" | "manual">("quick");
  // 飞书二维码弹窗
  const [showQrModal, setShowQrModal] = useState(false);
  // 飞书弹窗阶段："loading" | "qr" | "configuring" | "done"
  const [feishuModalStage, setFeishuModalStage] = useState<"loading" | "qr" | "configuring" | "done" | "failed">("loading");
  // 飞书配置步骤完成状态
  const [feishuStepsDone, setFeishuStepsDone] = useState<number>(0);
  // 飞书授权次数计数（奇数成功，偶数失败）
  const [feishuToggleCount, setFeishuToggleCount] = useState<number>(0);
  const feishuSteps = [
    "创建应用", "获取应用凭证", "写入配置文件", "开启机器人能力",
    "设置事件模式", "添加消息事件", "配置回调地址", "导入基础权限",
    "发布应用", "导入高级权限", "获取用户信息"
  ];
  // 步骤10（index 9）为高级权限步骤，无法免审批，需橙色标识
  const feishuHighPrivilegeStepIdx = 9;
  // 已接入通道密码显示/隐藏状态
  const [visibleAppliedSecrets, setVisibleAppliedSecrets] = useState<Set<string>>(new Set());
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
  // 飞书 pairing code
  const [feishuPairingCode, setFeishuPairingCode] = useState("");

  // ── WebUI 状态 ──
  const [showWebUIProgressDialog, setShowWebUIProgressDialog] = useState(false);
  const [showWebUIResultDialog, setShowWebUIResultDialog] = useState(false);
  const [webUIStep, setWebUIStep] = useState<0 | 1 | 2>(0); // 0=未开始, 1=放通端口完成, 2=生成链接完成
  const webUIUrl = "http://43.139.137.45:38341/knmnz8?token=8512b8ef93cdfd393ad6af...";
  const webUIToken = "8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb";

  const handleOpenWebUI = () => {
    setWebUIStep(0);
    setShowWebUIProgressDialog(true);
    // 第一步：放通端口，1.5秒后完成
    setTimeout(() => {
      setWebUIStep(1);
      // 第二步：生成链接，再过4秒完成
      setTimeout(() => {
        setWebUIStep(2);
        // 两步完成后，等待用户点击「确定」才跳转结果弹窗
      }, 4000);
    }, 1500);
  };

  const handleWebUIProgressConfirm = () => {
    setShowWebUIProgressDialog(false);
    setShowWebUIResultDialog(true);
  };

  const handleFeishuPairing = () => {
    if (!feishuPairingCode.trim()) {
      toast.error("请输入 pairing code");
      return;
    }
    toast.success("匹配成功");
    setFeishuPairingCode("");
  };

  const toggleExpandChannel = (idx: number) => {
    setExpandedChannelIdx(prev => prev === idx ? null : idx);
  };

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAppliedSecretVisibility = (channelIdx: number, fieldKey: string) => {
    const uniqueKey = `${channelIdx}-${fieldKey}`;
    setVisibleAppliedSecrets(prev => {
      const next = new Set(prev);
      if (next.has(uniqueKey)) {
        next.delete(uniqueKey);
      } else {
        next.add(uniqueKey);
      }
      return next;
    });
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
      const newCount = feishuToggleCount + 1;
      setFeishuToggleCount(newCount);
      const willSucceed = newCount % 2 === 1; // 奇数成功，偶数失败
      setFeishuModalStage("loading");
      setFeishuStepsDone(0);
      setShowQrModal(true);
      // 5秒后显示二维码
      setTimeout(() => setFeishuModalStage("qr"), 5000);
      // 再5秒后自动进入配置阶段
      setTimeout(() => {
        setFeishuModalStage("configuring");
        // 每步约0.8秒逐步完成
        for (let i = 1; i <= 10; i++) {
          setTimeout(() => {
            setFeishuStepsDone(i);
            if (i === 10) {
              setTimeout(() => setFeishuModalStage(willSucceed ? "done" : "failed"), 600);
            }
          }, i * 800);
        }
      }, 10000);
      return;
    }

    // 企业微信快捷配置：点击"前往授权"弹出提示
    if (ch.weworkMode && weworkConfigMode === "quick") {
      toast.info("即将跳转至企业微信授权页面，此功能即将开放");
      // 快捷配置添加一个企微机器人占位符
      const newEntry: AppliedChannel = {
        type: "企微机器人",
        channelValue: "wework",
        status: "running",
        fields: ch.fields || [],
        fieldValues: { botId: "auto-authorized", secret: "auto-secret-key" },
        weworkConfigMode: "quick",
      };
      setAppliedChannels([...appliedChannels, newEntry]);
      toast.success("企微机器人已添加");
      return;
    }

    // 企业微信手动配置：显示为"企微机器人"
    const channelType = ch.weworkMode ? "企微机器人" : ch.label;
    const newEntry: AppliedChannel = {
      type: channelType,
      channelValue: ch.value,
      status: "running",
      fields: ch.fields || [],
      fieldValues: { ...channelFields },
      feishuConfigMode: ch.feishuMode ? feishuConfigMode : undefined,
      weworkConfigMode: ch.weworkMode ? weworkConfigMode : undefined,
    };
    setAppliedChannels([...appliedChannels, newEntry]);
    setChannelFields({});
    toast.success(`${channelType} 已添加并应用`);
  };



  const filteredSkills = AVAILABLE_SKILLS.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const currentChannelConfig = CHANNEL_OPTIONS.find((c) => c.value === selectedChannel);

  // ─── 渲染通道配置输入区 ───────────────────────────────────────────────────────

  const renderChannelInputs = () => {
    if (!currentChannelConfig) return null;

    // 企业微信快捷/手动配置
    if (currentChannelConfig.weworkMode) {
      return (
        <div className="space-y-3">
          {/* 快捷/手动 Tab（快捷默认选中） */}
          <div className="flex rounded-lg border border-gray-200">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors rounded-l-lg ${
                weworkConfigMode === "quick" ? "bg-white text-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setWeworkConfigMode("quick")}
            >
              快捷配置
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-gray-200 rounded-r-lg ${
                weworkConfigMode === "manual" ? "bg-white text-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setWeworkConfigMode("manual")}
            >
              手动配置
            </button>
          </div>

          {weworkConfigMode === "manual" && (
            <div className="space-y-2">
              {currentChannelConfig.fields!.map((field) => (
                <div key={field.key} className="relative">
                  <Input
                    type={field.secret && !visibleSecrets.has(field.key) ? "password" : "text"}
                    placeholder={field.label}
                    value={channelFields[field.key] || ""}
                    onChange={(e) => setChannelFields({ ...channelFields, [field.key]: e.target.value })}
                    className="bg-gray-50 border-gray-200 pr-10"
                  />
                  {field.secret && (
                    <button
                      onClick={() => toggleSecretVisibility(field.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      type="button"
                      title={visibleSecrets.has(field.key) ? "隐藏" : "显示"}
                    >
                      {visibleSecrets.has(field.key) ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentChannelConfig.feishuMode) {
      return (
        <div className="space-y-3">
          {/* 快捷配置在左，手动配置在右 */}
          <div className="flex rounded-lg border border-gray-200">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors border-r border-gray-200 rounded-l-lg ${feishuConfigMode === "quick" ? "bg-white text-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              onClick={() => setFeishuConfigMode("quick")}
            >
              快捷配置
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors rounded-r-lg ${feishuConfigMode === "manual" ? "bg-white text-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              onClick={() => setFeishuConfigMode("manual")}
            >
              手动配置
            </button>
          </div>

          {feishuConfigMode === "manual" && (
            <div className="space-y-2">
              {currentChannelConfig.fields!.map((field) => (
                <div key={field.key} className="relative">
                  <Input
                    type={field.secret && !visibleSecrets.has(field.key) ? "password" : "text"}
                    placeholder={field.label}
                    value={channelFields[field.key] || ""}
                    onChange={(e) => setChannelFields({ ...channelFields, [field.key]: e.target.value })}
                    className="bg-gray-50 border-gray-200 pr-10"
                  />
                  {field.secret && (
                    <button
                      onClick={() => toggleSecretVisibility(field.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      type="button"
                      title={visibleSecrets.has(field.key) ? "隐藏" : "显示"}
                    >
                      {visibleSecrets.has(field.key) ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  )}
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
              type={field.secret && !visibleSecrets.has(field.key) ? "password" : "text"}
              placeholder={field.label}
              value={channelFields[field.key] || ""}
              onChange={(e) => setChannelFields({ ...channelFields, [field.key]: e.target.value })}
              className="bg-gray-50 border-gray-200 pr-10"
            />
            {field.secret && (
              <button
                onClick={() => toggleSecretVisibility(field.key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                type="button"
                title={visibleSecrets.has(field.key) ? "隐藏" : "显示"}
              >
                {visibleSecrets.has(field.key) ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ─── 渲染已接入通道的展开配置项 ───────────────────────────────────────────────

  const renderAppliedChannelDetail = (chIdx: number, ch: AppliedChannel) => {
    return (
      <div className="mx-2 mb-2 space-y-2">
        {/* 字段展示 */}
        <div className="rounded-lg bg-white border border-gray-100 px-4 py-3 space-y-2">
          {ch.fields.map((field) => {
            const val = ch.fieldValues[field.key] || "";
            const uniqueKey = `${chIdx}-${field.key}`;
            const isVisible = visibleAppliedSecrets.has(uniqueKey);
            const displayVal = field.secret && !isVisible ? maskSecret(val) : val;
            // 使用字段的 key 作为显示名称
            const displayKey = field.key;
            return (
              <div key={field.key} className="flex items-center gap-1 text-sm">
                <span className="text-gray-500 shrink-0">{displayKey}：</span>
                <span className="text-gray-800 font-mono break-all flex-1">{displayVal || "—"}</span>

              </div>
            );
          })}
        </div>
        {/* 子框2：飞书 pairing code */}
        {ch.channelValue === "feishu" && (
          <div className="rounded-lg bg-white border border-gray-100 px-4 py-3 flex items-center gap-2">
            <Input
              placeholder="（如需）请输入 pairing code"
              value={feishuPairingCode}
              onChange={(e) => setFeishuPairingCode(e.target.value)}
              className="bg-gray-50 border-gray-200 text-sm h-8"
              onKeyDown={(e) => e.key === "Enter" && handleFeishuPairing()}
            />
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 h-8 px-3 text-sm"
              onClick={handleFeishuPairing}
            >
              匹配
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
    <TenantLayout>
      {isConfiguring && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600 font-medium">\u52a0\u8f7d\u4e2d...</p>
          </div>
        </div>
      )}
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
            <button
              onClick={handleOpenWebUI}
              className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-colors cursor-pointer border"
              style={{ background: 'rgba(0, 122, 255, 0.08)', color: '#0055cc', borderColor: 'rgba(0, 122, 255, 0.25)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 122, 255, 0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0, 122, 255, 0.08)')}
            >
              <ExternalLink className="w-3 h-3" />
              开启OpenClaw面板
            </button>
            {isConfiguring && (
              <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-blue-50 rounded-lg">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-xs text-blue-600 font-medium">加载中</span>
              </div>
            )}
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
                    <a href="#" className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 underline underline-offset-2 ml-1 transition-colors">
                      自定义模型配置指引 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    className="w-full text-sm" 
                    variant="outline" 
                    onClick={handleApplyModel}
                    disabled={isConfiguring}
                  >
                    添加并应用
                  </Button>
                </TooltipTrigger>
                {isConfiguring && (
                  <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                    当前TAT状态不在线，无法操作
                  </TooltipContent>
                )}
              </Tooltip>

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
                <Select value={selectedChannel} onValueChange={(v) => { setSelectedChannel(v); setChannelFields({}); setFeishuConfigMode("quick"); setWeworkConfigMode("quick"); }}>
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
                {(currentChannelConfig?.feishuMode && feishuConfigMode === "quick") || (currentChannelConfig?.weworkMode && weworkConfigMode === "quick") ? "前往授权" : "添加并应用"}
              </Button>

              {/* 底部说明 */}
              <p className="text-xs text-gray-400 leading-relaxed">
                {currentChannelConfig?.descText}
                <a href={currentChannelConfig?.detailUrl || "#"} className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 underline underline-offset-2 ml-1 transition-colors">
                  配置指引<ExternalLink className="w-3 h-3" />
                </a>
              </p>

            </div>
            {/* Lower: applied channels - scrollable */}
            <div className="px-5 pb-5 overflow-y-auto flex-1">
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-2">已接入通道（{appliedChannels.length}）</p>
                {appliedChannels.length > 0 && (
                  <div className="space-y-1">
                    {appliedChannels.map((ch, chIdx) => (
                      <div key={chIdx} className="rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                        {/* 折叠行 */}
                        <div className="flex items-center justify-between px-2.5 py-2">
                          <button
                            className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                            onClick={() => toggleExpandChannel(chIdx)}
                          >
                            {expandedChannelIdx === chIdx
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
                                setAppliedChannels(appliedChannels.filter((_, i) => i !== chIdx));
                                if (expandedChannelIdx === chIdx) setExpandedChannelIdx(null);
                              }}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {/* 展开配置项 */}
                        {expandedChannelIdx === chIdx && renderAppliedChannelDetail(chIdx, ch)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              
              <p className="text-xs text-gray-400 leading-relaxed">
                您可以前往 SkillHub 查看您需要安装的技能
                <a href="https://skillhub.tencent.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 underline underline-offset-2 ml-1 transition-colors">
                  浏览 SkillHub<ExternalLink className="w-3 h-3" />
                </a>
              </p>
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

      {/* ===== 飞书授权弹窗（三阶段） ===== */}
      <Dialog open={showQrModal} onOpenChange={(open) => {
        // 仅在 done 阶段或 loading/qr 阶段允许关闭
        if (!open && (feishuModalStage === "done" || feishuModalStage === "loading" || feishuModalStage === "qr")) {
          setShowQrModal(false);
        } else if (!open && feishuModalStage === "configuring") {
          // 配置中不允许关闭
        } else {
          setShowQrModal(open);
        }
      }}>
        <DialogContent className="max-w-lg [&>button]:focus-visible:ring-0 [&>button]:focus-visible:ring-offset-0 [&>button]:outline-none [&>button]:shadow-none [&>button]:border-0 [&>button]:ring-0">

          {/* ── 阶段1&2：loading + qr ── */}
          {(feishuModalStage === "loading" || feishuModalStage === "qr") && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold text-gray-900">扫码配置飞书机器人</DialogTitle>
                    <DialogDescription className="text-sm text-orange-500 mt-0.5 font-medium">
                      请使用飞书账号扫码登录，完成授权后将自动为您创建机器人。
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl min-h-[240px] mt-1 mb-2">
                {feishuModalStage === "loading" ? (
                  <>
                    <Loader2 className="w-12 h-12 text-gray-300 animate-spin mb-4" />
                    <p className="text-sm text-gray-500">正在生成二维码...</p>
                  </>
                ) : (
                  <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
                    <rect width="180" height="180" fill="white"/>
                    <rect x="10" y="10" width="50" height="50" fill="black"/>
                    <rect x="18" y="18" width="34" height="34" fill="white"/>
                    <rect x="26" y="26" width="18" height="18" fill="black"/>
                    <rect x="120" y="10" width="50" height="50" fill="black"/>
                    <rect x="128" y="18" width="34" height="34" fill="white"/>
                    <rect x="136" y="26" width="18" height="18" fill="black"/>
                    <rect x="10" y="120" width="50" height="50" fill="black"/>
                    <rect x="18" y="128" width="34" height="34" fill="white"/>
                    <rect x="26" y="136" width="18" height="18" fill="black"/>
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
                )}
              </div>
            </>
          )}

          {/* ── 阶段3：正在配置 ── */}
          {feishuModalStage === "configuring" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-blue-500" />
                  </div>
                  <DialogTitle className="text-base font-semibold text-gray-900">正在配置飞书机器人</DialogTitle>
                </div>
              </DialogHeader>
              <div className="mt-1 space-y-2.5 py-1 pb-3">
                {feishuSteps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = feishuStepsDone >= stepNum;
                  const isActive = feishuStepsDone === idx;
                  const isHighPrivilege = idx === feishuHighPrivilegeStepIdx;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      {isDone && isHighPrivilege ? (
                        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                      ) : isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                      )}
                      <span className={`text-xs ${
                        isDone && isHighPrivilege ? "text-orange-500 font-medium" :
                        isDone ? "text-gray-600" : isActive ? "text-blue-600 font-medium" : "text-gray-400"
                      }`}>
                        [步骤{stepNum}] {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── 阶段4b：配置失败 ── */}
          {feishuModalStage === "failed" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold text-gray-900">飞书机器人发布失败</DialogTitle>
                    <DialogDescription className="text-sm text-red-500 mt-0.5 font-medium">
                      当前用户权限无法免审批发布飞书机器人，请联系管理员审批通过后再进行手动配置。
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-3 space-y-1.5 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 shrink-0">机器人名称：</span>
                  <span className="text-gray-800 font-medium">OpenClaw机器人-8791</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 shrink-0">管理地址：</span>
                  <a
                    href="https://open.feishu.cn/app/cli_a933983f95385cca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    https://open.feishu.cn/app/cli_a933983f95385cca
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 shrink-0">管理员审批地址：</span>
                  <a
                    href="https://feishu.cn/admin/appCenter/audit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    https://feishu.cn/admin/appCenter/audit
                  </a>
                </div>
              </div>
              <div className="mt-5 flex justify-center">
                <Button
                  onClick={() => setShowQrModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  完成
                </Button>
              </div>
            </>
          )}

          {/* ── 阶段4：配置完成 ── */}
          {feishuModalStage === "done" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
                  <DialogTitle className="text-base font-semibold text-gray-900">飞书机器人授权配置成功</DialogTitle>
                </div>
              </DialogHeader>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 shrink-0">机器人名称：</span>
                  <span className="text-gray-800 font-medium">OpenClaw机器人-4598</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 shrink-0">管理地址：</span>
                  <a
                    href="https://open.feishu.cn/app/cli_a9317ee80379dbc2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    https://open.feishu.cn/app/cli_a9317ee80379dbc2
                  </a>
                </div>
              </div>
              {/* 审批提示 */}
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-orange-600 font-medium mb-2">以下高级权限无法免审批发布，已自动为您提交申请：</p>
                    <ol className="text-sm text-orange-600 ml-4 space-y-1 list-decimal">
                      <li>查看、评论和下载云空间中所有文件</li>
                      <li>查看、评论、编辑和管理云空间中所有文件</li>
                    </ol>
                    <div className="mt-2 space-y-0.5">
                      <p className="text-sm text-orange-600">如需启用，请联系管理员前往审批：</p>
                      <a
                        href="https://feishu.cn/admin/appCenter/audit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline block"
                      >
                        https://feishu.cn/admin/appCenter/audit
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-center">
                <Button
                  onClick={() => {
                    setShowQrModal(false);
                    // 飞书通道唯一性：有则更新，无则新增
                    const feishuConfig = CHANNEL_OPTIONS.find(c => c.value === "feishu");
                    if (feishuConfig) {
                      setAppliedChannels(prev => {
                        const existingIdx = prev.findIndex(c => c.channelValue === "feishu");
                        const updatedEntry: AppliedChannel = {
                          type: "飞书",
                          channelValue: "feishu",
                          status: "running",
                          fields: feishuConfig.fields || [],
                          fieldValues: { appId: "cli_a9317ee80379dbc2", appSecret: "auto-authorized" },
                          feishuConfigMode: "quick",
                        };
                        if (existingIdx >= 0) {
                          const next = [...prev];
                          next[existingIdx] = updatedEntry;
                          return next;
                        }
                        return [...prev, updatedEntry];
                      });
                    }
                    toast.success("飞书机器人已添加并应用");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  完成
                </Button>
              </div>
            </>
          )}

        </DialogContent>
      </Dialog>

      {/* ===== OpenClaw 面板 进度弹窗 ===== */}
      <Dialog open={showWebUIProgressDialog} onOpenChange={(open) => {
        if (!open) setShowWebUIProgressDialog(false);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">开启OpenClaw面板</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1 leading-relaxed">
              OpenClaw 面板（WebUI）是 OpenClaw 官方提供的浏览器操作界面，可直接与 AI 对话，并且有查看会话记录、配置定时任务、监控系统日志等高级功能。
            </DialogDescription>
            <p className="text-xs text-gray-400 mt-2">开启OpenClaw面板将会依次执行以下操作，确定后将自动执行：</p>
          </DialogHeader>
          <div className="mt-1 space-y-2.5 py-1 pb-3">
            {/* 步骤1：放通端口 */}
            <div className="flex items-center gap-3">
              {webUIStep >= 1 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              )}
              <span className={`text-xs ${
                webUIStep >= 1 ? "text-gray-600" : "text-blue-600 font-medium"
              }`}>
                放通端口：{webUIStep >= 1 ? "端口38341已放通" : "正在放通端口38341...预计1~2秒"}
              </span>
            </div>
            {/* 步骤2：生成链接 */}
            <div className="flex items-center gap-3">
              {webUIStep >= 2 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : webUIStep === 1 ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
              )}
              <span className={`text-xs ${
                webUIStep >= 2 ? "text-gray-600" : webUIStep === 1 ? "text-blue-600 font-medium" : "text-gray-400"
              }`}>
                生成链接：{webUIStep >= 2 ? "链接已生成" : webUIStep === 1 ? "正在为您生成OpenClaw面板访问链接，预计5~10秒..." : "等待放通端口完成"}
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWebUIProgressDialog(false)}
              className="text-gray-600 px-6"
            >
              取消
            </Button>
            <Button
              size="sm"
              disabled={webUIStep < 2}
              onClick={handleWebUIProgressConfirm}
              className={`px-6 ${webUIStep >= 2 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 text-white opacity-50 cursor-not-allowed'}`}
            >
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== OpenClaw 面板 结果弹窗 ===== */}
      <Dialog open={showWebUIResultDialog} onOpenChange={(open) => {
        if (!open) setShowWebUIResultDialog(false);
      }}>
        <DialogContent className="w-[90vw] max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">开启OpenClaw面板</DialogTitle>
          </DialogHeader>
          {/* 警告文字 */}
          <div className="text-sm text-orange-600 font-medium bg-orange-50 border border-orange-100 rounded-lg px-3 py-2.5 leading-relaxed break-all">
            访问链接已生成，该链接含有您的 API Key 和加密配置，请勿分享给第三方，以防隐私泄露或资产损失。
          </div>
          {/* 链接和 Token */}
          <div className="mt-2 space-y-2 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 w-full overflow-hidden">
            <div className="flex items-center gap-2 w-full min-w-0">
              <span className="text-xs text-gray-500 shrink-0 w-16">面板链接</span>
              <span className="text-xs text-gray-700 flex-1 truncate font-mono min-w-0">{webUIUrl}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(webUIUrl); toast.success("已复制链接"); }}
                className="shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 w-full min-w-0">
              <span className="text-xs text-gray-500 shrink-0 w-16">面板Token</span>
              <span className="text-xs text-gray-700 flex-1 truncate font-mono min-w-0">{webUIToken}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(webUIToken); toast.success("已复制Token"); }}
                className="shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          {/* 提示文字 */}
          <p className="text-xs text-gray-500 mt-1">
            用浏览器打开面板链接，如面板需要填入网关令牌，则将面板Token粘贴过去，即可进入面板。
          </p>
          <div className="flex justify-center pt-1">
            <Button
              size="sm"
              onClick={() => { window.open(webUIUrl, "_blank"); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              立即访问
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </TenantLayout>
    </TooltipProvider>
  );
}
