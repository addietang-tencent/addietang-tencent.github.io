/**
 * OpenClawDetail - OpenClaw 详细配置页
 * Design: 「流动蓝图」Fluid Blueprint
 * - 三栏布局：模型 | 通道 | 技能
 * - 参考图片风格：白色卡片，标题带彩色图标
 * - Header：名称、动态状态 badge（8 种状态）、一键更新、开启 OpenClaw 面板
 * - 基础配置 Tab：模型配置、通道配置、技能配置
 */
import { useState, useEffect, useRef } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
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
  ChevronRight, ChevronDown, Info, CheckCircle2, Loader2, AlertTriangle, AlertCircle, ArrowUpCircle, Monitor, RotateCcw, XCircle, ArrowUpToLine, ArrowLeftRight,
  Copy, Terminal, Database, Clock, Shield,
} from "lucide-react";
import { MOCK_OPENCLAW_LIST, AVAILABLE_SKILLS } from "@/lib/mockData";
import { findClawById, onClawListChange } from "@/lib/openclawStore";
import FileSpace from "./FileSpace";
import MemoryPreview from "@/components/MemoryPreview";

// ─── 实例状态配置（与 MyOpenClaw 保持一致） ──────────────────────────────────────

type OpenClawStatus = "creating" | "createFail" | "running" | "shutdown" | "loading" | "loadFail" | "maintaining" | "pending";

const INSTANCE_STATUS_CONFIG: Record<OpenClawStatus, {
  label: string;
  badgeClass: string;
  dotColor?: string;
  spinning?: boolean;
  tooltipText?: string;
}> = {
  creating: {
    label: "创建中",
    badgeClass: "badge-loading",
    dotColor: "#007AFF",
    spinning: true,
    tooltipText: "正在创建中，请稍候",
  },
  createFail: {
    label: "创建失败",
    badgeClass: "badge-stopped",
    dotColor: "#FF3B30",
    tooltipText: "创建失败，可删除后重新创建",
  },
  running: {
    label: "运行中",
    badgeClass: "badge-running",
    dotColor: "#34C759",
  },
  shutdown: {
    label: "已关机",
    badgeClass: "badge-shutdown",
    dotColor: "#9CA3AF",
    tooltipText: "已关机，如需恢复请联系管理员",
  },
  loading: {
    label: "加载中",
    badgeClass: "badge-loading",
    dotColor: "#007AFF",
    spinning: true,
    tooltipText: "加载中，请稍候",
  },
  loadFail: {
    label: "加载失败",
    badgeClass: "badge-stopped",
    dotColor: "#FF3B30",
    tooltipText: "加载失败，可点击重试恢复",
  },
  maintaining: {
    label: "维护中",
    badgeClass: "badge-pending",
    dotColor: "#FF9500",
    tooltipText: "维护中，请稍候",
  },
  pending: {
    label: "待处理",
    badgeClass: "badge-stopped",
    dotColor: "#FF3B30",
    tooltipText: "已停用，请联系管理员处理",
  },
};
import {
  type CustomChannel as AdminCustomChannel,
  loadVisibleCustomChannels,
  onCustomChannelsChange,
  loadBuiltinChannelVisibility,
  onBuiltinChannelVisibilityChange,
} from "@/lib/customChannelStore";

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
  wechatMode?: true; // 微信特殊处理
  adminCustomMode?: true; // 管控端配置的自定义通道
  adminCustomId?: string; // 对应的自定义通道 ID
  builtinId?: string; // 对应管控端内置通道 ID，用于可见性过滤
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
    value: "wework-app",
    label: "企业微信应用",
    descText: "通过企业微信应用接口，将 OpenClaw 接入企业微信应用，支持消息互动与业务集成。",
    detailUrl: "#",
    fields: [
      { key: "corpId",         label: "企业微信应用的Corp ID",           secret: false },
      { key: "corpSecret",     label: "企业微信应用的Corp Secret",       secret: true  },
      { key: "agentId",        label: "企业微信应用的Agent ID",          secret: false },
      { key: "token",          label: "企业微信应用的Token",             secret: false },
      { key: "encodingAesKey", label: "企业微信应用的Encoding AES Key", secret: true  },
    ],
    builtinId: "wework-app",
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
  {
    value: "wechat",
    label: "微信",
    descText: "通过微信扫码授权，将 OpenClaw 接入微信，支持微信消息交互。",
    detailUrl: "#",
    wechatMode: true,
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

  // 优先从共享 store 读取（包含动态创建的 claw 及 roleName），fallback 到 mock 数据
  const [clawData, setClawData] = useState(() =>
    (clawId ? findClawById(clawId) : undefined) ?? MOCK_OPENCLAW_LIST.find((c) => c.id === clawId) ?? MOCK_OPENCLAW_LIST[0]
  );
  useEffect(() => {
    const unsub = onClawListChange(() => {
      if (clawId) {
        const updated = findClawById(clawId);
        if (updated) setClawData(updated);
      }
    });
    return unsub;
  }, [clawId]);
  const claw = clawData;

  const clawName = claw.name;
  const clawStatus = (claw.status || "running") as OpenClawStatus;
  const statusCfg = INSTANCE_STATUS_CONFIG[clawStatus] ?? INSTANCE_STATUS_CONFIG.running;

  // ── Configuration state ──
  const [isConfiguring, setIsConfiguring] = useState(false); // 配置中状态
  const [quickFixState, setQuickFixState] = useState<"idle" | "loading" | "success">("idle");

  // 读取管控端「允许用户使用龙虾医生」开关状态（默认关闭）
  const [lobsterDoctorEnabled, setLobsterDoctorEnabled] = useState(
    () => localStorage.getItem("admin_allow_lobster_doctor") === "true"
  );
  // 监听 localStorage 变化，管控端切换开关后用户端实时响应
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "admin_allow_lobster_doctor") {
        setLobsterDoctorEnabled(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ── Model state ──
  const [selectedProvider, setSelectedProvider] = useState(MODEL_PROVIDERS[0].value);
  const [selectedModel, setSelectedModel] = useState(MODEL_PROVIDERS[0].versions[0].value);
  const [customInputMode, setCustomInputMode] = useState<"json" | "form">("json");
  const [customJson, setCustomJson] = useState(DEFAULT_CUSTOM_JSON);
  const [customForm, setCustomForm] = useState({ provider: "", base_url: "", api: "", api_key: "", model_id: "", model_name: "" });
  const [customMultimodal, setCustomMultimodal] = useState(false);
  // 多条模型列表，每条有唯一 id；primary 表示主模型，其余为备选模型，所有模型均为应用中状态
  type AppliedModel = { id: number; providerLabel: string; versionLabel: string; primary: boolean; isCustom: boolean; customName: string; addedAt: number; multimodal?: boolean; isDefault?: boolean; };
  const [appliedModels, setAppliedModels] = useState<AppliedModel[]>([
    { id: 1, providerLabel: "腾讯云 DeepSeek", versionLabel: "DeepSeek V3 0324", primary: true, isCustom: false, customName: "", addedAt: Date.now(), isDefault: true },
  ]);
  const [modelIdCounter, setModelIdCounter] = useState(2);
  // 模型操作二次确认弹窗
  const [modelConfirmDialog, setModelConfirmDialog] = useState<{
    open: boolean;
    type: "set-primary" | "delete" | "delete-backup";
    modelId: number | null;
  }>({ open: false, type: "set-primary", modelId: null });

  const currentProvider = MODEL_PROVIDERS.find(p => p.value === selectedProvider) || MODEL_PROVIDERS[0];
  const currentVersions = currentProvider.versions;

  const handleProviderChange = (providerValue: string) => {
    setSelectedProvider(providerValue);
    const provider = MODEL_PROVIDERS.find(p => p.value === providerValue);
    if (provider) setSelectedModel(provider.versions[0].value);
  };

  // 自定义通道（从管控端 localStorage 读取可见的自定义通道）
  const [visibleCustomChannels, setVisibleCustomChannels] = useState<AdminCustomChannel[]>(() => loadVisibleCustomChannels());

  useEffect(() => {
    const unsub = onCustomChannelsChange(() => {
      setVisibleCustomChannels(loadVisibleCustomChannels());
    });
    return unsub;
  }, []);

  // 内置通道可见性（从管控端 localStorage 读取）
  const [builtinChannelVisibility, setBuiltinChannelVisibility] = useState<Record<string, boolean>>(
    () => loadBuiltinChannelVisibility()
  );

  useEffect(() => {
    const unsub = onBuiltinChannelVisibilityChange(() => {
      setBuiltinChannelVisibility(loadBuiltinChannelVisibility());
    });
    return unsub;
  }, []);
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
  // 微信二维码弹窗
  const [showWechatQrModal, setShowWechatQrModal] = useState(false);
  // 微信弹窗阶段："checking" | "generating" | "qr"
  const [wechatModalStage, setWechatModalStage] = useState<"checking" | "generating" | "qr">("checking");

  // ── 一键更新状态 ──
  const [showUpdateConfirmDialog, setShowUpdateConfirmDialog] = useState(false);
  const [showUpdateBubble, setShowUpdateBubble] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState("basic");

  // ── 智能体迁移状态 ──
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [migrationStep, setMigrationStep] = useState<"export" | "waitUpload" | "import" | "importing" | "success" | "failed">("export");
  const [migrationCosUrl, setMigrationCosUrl] = useState("");
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationUploaded, setMigrationUploaded] = useState(false);
  const [migrationChecking, setMigrationChecking] = useState(false);
  const [migrationError, setMigrationError] = useState("");

  const migrationBatchId = `${clawData?.instanceId || "unknown"}-${Date.now()}`;
  const migrationCosBucket = "clawpro-migrate-1302061491";
  const migrationCosKey = `single/${clawData?.instanceId || "unknown"}-${Math.random().toString(36).substring(2, 8)}.tgz`;
  const migrationPresignedUrl = `https://${migrationCosBucket}.cos.ap-guangzhou.myqcloud.com/${migrationCosKey}?q-sign-algorithm=sha1&q-ak=AKID****&q-sign-time=****&q-signature=****`;

  const migrationExportCommand = `# 在源端 OpenClaw 终端执行以下命令
openclaw gateway stop
tar -czf /tmp/openclaw-export.tgz -C /root .openclaw
curl -X PUT --upload-file /tmp/openclaw-export.tgz \\
  "${migrationPresignedUrl}"
rm -f /tmp/openclaw-export.tgz
openclaw gateway start
echo "✅ 导出完成，数据已上传到 COS"`;

  const handleCheckUpload = () => {
    setMigrationChecking(true);
    setTimeout(() => {
      setMigrationUploaded(true);
      setMigrationChecking(false);
      setMigrationStep("import");
      toast.success("检测到已上传的数据包");
    }, 1500);
  };

  const handleStartMigration = () => {
    setMigrationStep("importing");
    setMigrationProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => {
          if (Math.random() < 0.9) {
            setMigrationStep("success");
            toast.success("迁移成功！OpenClaw 已重启");
          } else {
            setMigrationStep("failed");
            setMigrationError("Gateway 重启超时，请手动检查");
          }
        }, 500);
      }
      setMigrationProgress(Math.min(p, 100));
    }, 800);
  };

  const resetMigration = () => {
    setMigrationStep("export");
    setMigrationCosUrl("");
    setMigrationProgress(0);
    setMigrationUploaded(false);
    setMigrationChecking(false);
    setMigrationError("");
  };

  const [showUpdateProgressDialog, setShowUpdateProgressDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStepsDone, setUpdateStepsDone] = useState<number>(0);
  const updateSteps = [
    "环境准备",
    "OpenClaw 安装",
    "Doctor 修复",
    "Gateway 安装",
    "Clawhub 安装",
    "插件安装",
    "Skills 安装",
    "安装收尾",
  ];
  const handleStartUpdate = () => {
    setShowUpdateConfirmDialog(false);
    setIsUpdating(true);
    setUpdateStepsDone(0);
    setShowUpdateProgressDialog(true);
    // 随机间隔逐步完成 8 步
    let done = 0;
    const runNext = () => {
      if (done >= updateSteps.length) {
        setIsUpdating(false);
        setShowUpdateProgressDialog(false);
        toast.success("OpenClaw 已更新至最新版本");
        return;
      }
      const delay = 800 + Math.random() * 2200; // 0.8s ~ 3s 随机
      setTimeout(() => {
        done += 1;
        setUpdateStepsDone(done);
        runNext();
      }, delay);
    };
    runNext();
  };

  // ── WebUI 状态 ──
  const [showWebUIProgressDialog, setShowWebUIProgressDialog] = useState(false);
  const [showWebUIResultDialog, setShowWebUIResultDialog] = useState(false);
  const [webUIStep, setWebUIStep] = useState<0 | 1 | 2>(0); // 0=未开始, 1=放通端口完成, 2=生成链接完成
  // 失败状态："none" | "port" | "link"
  const [webUIFailedStep, setWebUIFailedStep] = useState<"none" | "port" | "link">("none");
  // 打开次数计数（奇数成功，偶数失败）
  const [webUIOpenCount, setWebUIOpenCount] = useState(0);
  const webUIUrl = "http://43.139.137.45:38341/knmnz8?token=8512b8ef93cdfd393ad6af...";
  const webUIToken = "8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb";

  const runWebUIFlow = (isFail: boolean) => {
    setWebUIStep(0);
    setWebUIFailedStep("none");
    if (isFail) {
      // 失败流程：1.5秒后放通端口失败
      setTimeout(() => {
        setWebUIFailedStep("port");
      }, 1500);
    } else {
      // 成功流程：1.5秒后放通端口完成，再4秒后生成链接完成
      setTimeout(() => {
        setWebUIStep(1);
        setTimeout(() => {
          setWebUIStep(2);
        }, 4000);
      }, 1500);
    }
  };

  // 从 localStorage 读取管理员是否开启了用户端访问权限
  const allowPanelAccess = localStorage.getItem("admin_allow_panel_access") === "true";

  const handleOpenWebUI = () => {
    if (!allowPanelAccess) {
      toast.error("管理员未开启访问权限");
      return;
    }
    const newCount = webUIOpenCount + 1;
    setWebUIOpenCount(newCount);
    setShowWebUIProgressDialog(true);
    runWebUIFlow(newCount % 2 === 0); // 偶数次失败
  };

  const handleWebUIProgressConfirm = () => {
    setShowWebUIProgressDialog(false);
    setShowWebUIResultDialog(true);
  };

  const handleWebUIRetry = () => {
    const newCount = webUIOpenCount + 1;
    setWebUIOpenCount(newCount);
    runWebUIFlow(newCount % 2 === 0);
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
  const [skillInstallConfirm, setSkillInstallConfirm] = useState<{ open: boolean; skillName: string }>({
    open: false,
    skillName: "",
  });
  const [installedSkills, setInstalledSkills] = useState<string[]>([
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
    "slack 2.1.0",
    "jira 1.5.2",
    "confluence 1.3.0",
    "gitlab 1.2.1",
    "linear 0.8.0",
    "figma-export 1.0.0",
    "google-calendar 2.0.1",
    "airtable 1.1.0",
    "zapier-webhook 0.5.0",
    "stripe-billing 1.0.0",
    "sendgrid-email 1.2.0",
    "twilio-sms 0.9.0",
    "aws-s3 2.3.0",
    "openai-dalle 1.0.0",
    "huggingface-inference 1.0.0",
    "elasticsearch 2.0.0",
    "redis-cache 1.1.0",
    "mongodb-query 1.4.0",
    "postgres-sql 2.2.0",
    "docker-exec 0.8.0",
    "kubernetes-deploy 1.0.0",
    "terraform-plan 0.5.0",
    "ansible-run 1.2.0",
    "prometheus-alert 1.0.0",
    "grafana-dashboard 0.9.0",
    "datadog-monitor 1.1.0",
    "pagerduty-incident 1.0.0",
    "zoom-meeting 2.0.0",
    "teams-message 1.3.0",
    "discord-bot 0.7.0",
    "telegram-send 1.0.0",
    "wechat-work 2.1.0",
    "dingtalk-notify 1.5.0",
  ]);

  // ── Handlers ──

  const handleApplyModel = () => {
    let newEntry: AppliedModel;
    if (selectedProvider === "custom") {
      const customName = customInputMode === "json"
        ? (() => { try { const parsed = JSON.parse(customJson); return parsed?.model?.name || ""; } catch { return ""; } })()
        : customForm.model_name;
      newEntry = { id: modelIdCounter, providerLabel: "自定义模型", versionLabel: "", primary: false, isCustom: true, customName: customName || "", addedAt: Date.now(), multimodal: customMultimodal };
    } else {
      const provider = MODEL_PROVIDERS.find(p => p.value === selectedProvider);
      const version = currentVersions.find(v => v.value === selectedModel);
      if (!provider || !version) return;
      newEntry = { id: modelIdCounter, providerLabel: provider.label, versionLabel: version.label, primary: false, isCustom: false, customName: "", addedAt: Date.now() };
    }
    setAppliedModels(prev => {
      // 当前无主模型时（列表为空或全部为备选），新模型直接成为主模型
      const hasPrimary = prev.some(m => m.primary);
      if (!hasPrimary) return [...prev, { ...newEntry, primary: true }];
      return [...prev, newEntry];
    });
    setModelIdCounter(c => c + 1);
    const hasPrimary = appliedModels.some(m => m.primary);
    toast.success(hasPrimary ? "备用模型已添加" : "已设为主模型");
  };

  const handleAddChannel = () => {
    // 先在全部通道选项（包括自定义）中查找
    const ch = allChannelOptions.find((c) => c.value === selectedChannel);
    if (!ch) return;

    // 管控端自定义通道处理
    if (ch.adminCustomMode) {
      const newEntry: AppliedChannel = {
        type: ch.label,
        channelValue: ch.value,
        status: "running",
        fields: ch.fields || [],
        fieldValues: { ...channelFields },
      };
      setAppliedChannels([...appliedChannels, newEntry]);
      setChannelFields({});
      toast.success(`${ch.label} 已添加并应用`);
      return;
    }

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

    // 微信：点击"前往授权"弹出二维码（带 loading 流程）
    if (ch.wechatMode) {
      setWechatModalStage("checking");
      setShowWechatQrModal(true);
      // 2秒后切换到"正在生成二维码"
      setTimeout(() => setWechatModalStage("generating"), 2000);
      // 再2秒后显示二维码
      setTimeout(() => {
        setWechatModalStage("qr");
        // 二维码出现后5秒自动关闭并添加通道
        setTimeout(() => {
          setShowWechatQrModal(false);
          setAppliedChannels(prev => {
            const existingIdx = prev.findIndex(c => c.channelValue === "wechat");
            const newEntry: AppliedChannel = {
              type: "微信 ClawBot",
              channelValue: "wechat",
              status: "running",
              fields: [],
              fieldValues: {},
            };
            if (existingIdx >= 0) {
              const next = [...prev];
              next[existingIdx] = newEntry;
              return next;
            }
            return [...prev, newEntry];
          });
          toast.success("微信 ClawBot 已添加");
        }, 5000);
      }, 4000);
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

  // ── Pending skills state ──
  type PendingSkillStatus = "pending" | "installing" | "failed";
  type PendingSkill = { id: string; name: string; status: PendingSkillStatus };
  // ps-3 和 ps-7 模拟安装失败
  const MOCK_FAIL_IDS = new Set(["ps-3", "ps-7"]);

  const [pendingSkills, setPendingSkills] = useState<PendingSkill[]>([
    { id: "ps-1", name: "code-interpreter 1.2.0", status: "pending" },
    { id: "ps-2", name: "image-recognition 0.9.1", status: "pending" },
    { id: "ps-3", name: "data-analysis 2.0.0", status: "pending" },
    { id: "ps-4", name: "text-to-speech 1.0.0", status: "pending" },
    { id: "ps-5", name: "pdf-parser 1.1.0", status: "pending" },
    { id: "ps-6", name: "excel-reader 2.0.0", status: "pending" },
    { id: "ps-7", name: "video-transcribe 0.7.0", status: "pending" },
    { id: "ps-8", name: "sentiment-analysis 1.0.0", status: "pending" },
    { id: "ps-9", name: "ocr-scanner 1.3.0", status: "pending" },
    { id: "ps-10", name: "sql-query 2.1.0", status: "pending" },
    { id: "ps-11", name: "web-scraper 0.6.0", status: "pending" },
    { id: "ps-12", name: "chart-generator 1.0.0", status: "pending" },
  ]);

  // 并行安装：页面加载后所有 pending 技能同时变为 installing，同时出结果
  useEffect(() => {
    const pendingList = pendingSkills.filter(s => s.status === "pending");
    if (pendingList.length === 0) return;
    // 所有 pending 同时变为 installing
    setPendingSkills(prev =>
      prev.map(s => s.status === "pending" ? { ...s, status: "installing" as PendingSkillStatus } : s)
    );
  }, []);

  // 监听 installing 技能，3秒后一次性批量更新所有结果
  useEffect(() => {
    const installingSkills = pendingSkills.filter(s => s.status === "installing");
    if (installingSkills.length === 0) return;
    const timer = setTimeout(() => {
      const successSkills = installingSkills.filter(s => !MOCK_FAIL_IDS.has(s.id));
      const failedIds = new Set(installingSkills.filter(s => MOCK_FAIL_IDS.has(s.id)).map(s => s.id));
      // 一次性更新 pendingSkills：删除成功的，失败的标记 failed
      setPendingSkills(prev =>
        prev
          .filter(s => !successSkills.some(ss => ss.id === s.id))
          .map(s => failedIds.has(s.id) ? { ...s, status: "failed" as PendingSkillStatus } : s)
      );
      // 一次性批量添加到已安装列表
      if (successSkills.length > 0) {
        setInstalledSkills(prev => [...successSkills.map(s => s.name), ...prev]);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [pendingSkills.filter(s => s.status === "installing").map(s => s.id).join()]);

  // 全部重试：所有失败技能同时重新安装
  const handleRetryAllFailed = () => {
    const failedIds = pendingSkills.filter(s => s.status === "failed").map(s => s.id);
    failedIds.forEach(id => MOCK_FAIL_IDS.delete(id));
    setPendingSkills(prev =>
      prev.map(s => s.status === "failed" ? { ...s, status: "installing" as PendingSkillStatus } : s)
    );
  };

  // 全部删除：移除所有失败技能
  const handleDeleteAllFailed = () => {
    setPendingSkills(prev => prev.filter(s => s.status !== "failed"));
  };

  // 内置通道按管控端开关过滤（没有 builtinId 的项目为全局内置，始终显示）
  const visibleBuiltinChannels = CHANNEL_OPTIONS.filter((ch) => {
    if (!ch.builtinId) return true;
    return builtinChannelVisibility[ch.builtinId] !== false;
  });

  // 合并内置通道 + 可见的自定义通道（动态构建 ChannelConfig）
  const allChannelOptions: ChannelConfig[] = [
    ...CHANNEL_OPTIONS,
    ...visibleCustomChannels.map((cc) => ({
      value: `admin_custom_${cc.id}`,
      label: cc.name,
      descText: `企业自定义通道（Channel ID: ${cc.channelId}）`,
      detailUrl: "#",
      adminCustomMode: true as const,
      adminCustomId: cc.id,
      fields: cc.credentialFields.map((f) => ({
        key: f.key || f.id, // 使用管控端配置的 key，写入配置文件
        label: f.label,     // 用户看到的标签
        secret: true,       // 凭证字段默认加密显示
      })),
    } as ChannelConfig & { adminCustomMode: true; adminCustomId: string })),
  ];

  const currentChannelConfig = allChannelOptions.find((c) => c.value === selectedChannel);

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

    // 微信：无需额外输入，直接显示"前往授权"按钮（由外部按钮处理）
    if (currentChannelConfig.wechatMode) {
      return null;
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

    // 管控端自定义通道：渲染管理员定义的凭证字段
    if (currentChannelConfig.adminCustomMode) {
      if (!currentChannelConfig.fields || currentChannelConfig.fields.length === 0) {
        return (
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400">该通道无需额外凭证信息</p>
          </div>
        );
      }
      return (
        <div className="space-y-2">
          {currentChannelConfig.fields.map((field) => (
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

  // ─── 渲染已接入通道的展开配置项 ─────────────────────────────────────────────

  const renderAppliedChannelDetail = (chIdx: number, ch: AppliedChannel) => {
    // 判断是否是管控端自定义通道（value 以 admin_custom_ 开头）
    const isAdminCustom = ch.channelValue.startsWith("admin_custom_");

    return (
      <div className="mx-2 mb-2 space-y-2">
        {isAdminCustom ? (
          /* 管控端自定义通道：展示字段 key，内容加密 */
          <div className="rounded-lg bg-white border border-gray-100 px-4 py-3 space-y-2">
            {ch.fields.length === 0 ? (
              <p className="text-xs text-gray-400">无凭证字段</p>
            ) : (
              ch.fields.map((field) => {
                const val = ch.fieldValues[field.key] || "";
                const displayVal = maskSecret(val);
                return (
                  <div key={field.key} className="flex items-center gap-1 text-sm">
                    <span className="text-gray-500 font-mono shrink-0">{field.key}：</span>
                    <span className="text-gray-800 font-mono break-all flex-1">{displayVal || "—"}</span>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-white border border-gray-100 px-4 py-3 space-y-2">
            {ch.fields.map((field) => {
              const val = ch.fieldValues[field.key] || "";
              const uniqueKey = `${chIdx}-${field.key}`;
              const isVisible = visibleAppliedSecrets.has(uniqueKey);
              const displayVal = field.secret && !isVisible ? maskSecret(val) : val;
              const displayKey = field.key;
              return (
                <div key={field.key} className="flex items-center gap-1 text-sm">
                  <span className="text-gray-500 shrink-0">{displayKey}：</span>
                  <span className="text-gray-800 font-mono break-all flex-1">{displayVal || "—"}</span>
                </div>
              );
            })}
          </div>
        )}
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
          <div className="flex items-center justify-between gap-4 mb-8">
          {/* 左侧：图标 + 名称/ID/badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.1), rgba(88,86,214,0.1))" }}>
              🦞
            </div>
            <div>
            {/* 第一行：名称 + 状态 badge（8 种状态动态渲染） */}
          <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{clawName}</h1>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={statusCfg.badgeClass}>
                        {statusCfg.spinning ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ backgroundColor: statusCfg.dotColor }}
                          />
                        )}
                        {statusCfg.label}
                      </span>
                    </TooltipTrigger>
                    {statusCfg.tooltipText && (
                      <TooltipContent side="top" className="text-xs">
                        {statusCfg.tooltipText}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
              {/* 第二行：角色胶囊标签 + 实例 ID */}
              <div className="flex items-center gap-2 mt-0.5">
                {claw.roleName && (
                  <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.08), rgba(88,86,214,0.05))", color: "#5c6b7a", border: "1px solid rgba(0,122,255,0.1)" }}>
                    {claw.roleName}
                  </span>
                )}
                <p className="text-xs text-gray-400">{claw.instanceId}</p>
              </div>
            </div>
          </div>
          {/* 右侧：操作按鈕 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 一键更新按鈕 + 气泡 */}
            <div className="relative flex items-center">
              {showUpdateBubble && !isUpdating && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <div className="relative bg-blue-600 text-white text-xs rounded-lg px-3 py-2 shadow-sm leading-none whitespace-nowrap">
                    <button
                      onClick={() => setShowUpdateBubble(false)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-400 hover:bg-gray-500 rounded-full flex items-center justify-center text-white transition-colors"
                      style={{ fontSize: "10px", lineHeight: 1 }}
                    >
                      ×
                    </button>
                    重磅来袭！升级版本，一键接入微信！
                    <div className="absolute top-full right-4 w-0 h-0"
                      style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #2563eb" }} />
                  </div>
                </div>
              )}
              {isUpdating ? (
                <button
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer leading-none"
                  title="查看更新进度"
                  onClick={() => setShowUpdateProgressDialog(true)}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  更新中
                </button>
              ) : (
                <button
                  onClick={() => setShowUpdateConfirmDialog(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer leading-none"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  一键更新
                </button>
              )}
            </div>
            {/* 开启面板按鈕 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleOpenWebUI}
                  disabled={!allowPanelAccess}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors leading-none ${
                    allowPanelAccess
                      ? "text-gray-600 bg-white border-gray-200 hover:bg-gray-50 cursor-pointer"
                      : "text-gray-400 bg-white border-gray-200 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  开启OpenClaw面板
                </button>
              </TooltipTrigger>
              {!allowPanelAccess && (
                <TooltipContent side="top" className="text-xs">
                  管理员未开启访问权限
                </TooltipContent>
              )}
            </Tooltip>
            {activeDetailTab === "basic" && (
              <button
                onClick={() => { setMigrationOpen(true); resetMigration(); }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer leading-none"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                智能体迁移
              </button>
            )}
          </div>
        </div>

        {/* Left tab nav + content area */}
        <div className="flex gap-5" style={{ alignItems: "start" }}>

          {/* ===== Left vertical tab nav ===== */}
          <div className="flex flex-col gap-1 flex-shrink-0 w-36">
            {([
              { id: "basic", label: "基础配置" },
              { id: "memory", label: "记忆管理" },
              { id: "files", label: "网盘管理" },
              { id: "doctor", label: "龙虾医院" },
            ] as { id: string; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors border-l-2 ${
                  activeDetailTab === tab.id
                    ? "border-blue-600 text-gray-900 font-semibold"
                    : "border-transparent text-gray-500 font-normal hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ===== Tab content ===== */}
          <div className="flex-1 min-w-0">

          {/* 基础配置 tab */}
          {activeDetailTab === "basic" && (
            <div className="grid grid-cols-3 gap-5" style={{ minHeight: 0, alignItems: "start" }}>

          {/* ===== Model Column ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)", height: "749px" }}>
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">模型 (Models)</h2>
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="overflow-y-auto flex-1">
            {/* Upper: config inputs */}
            <div className="p-5 space-y-3">
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

                  {/* 多模态开关 */}
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">多模态模型</span>
                      <span className="text-xs text-gray-400 mt-0.5">支持图片、文字多模态输入</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={customMultimodal}
                      onClick={() => setCustomMultimodal(v => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                        customMultimodal ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                          customMultimodal ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

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
                    {appliedModels.some(m => m.primary) ? "添加备用模型" : "设为主模型"}
                  </Button>
                </TooltipTrigger>
                {isConfiguring && (
                  <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                    当前TAT状态不在线，无法操作
                  </TooltipContent>
                )}
              </Tooltip>

            </div>
            {/* Lower: model list */}
            <div className="px-5 pb-5">
              <div className="pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-xs text-gray-400">已应用模型</p>
                </div>
                {/* 主模型分组 */}
                {appliedModels.some(m => m.primary) && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1.5">主模型</p>
                    <div className="space-y-1.5">
                      {appliedModels.filter(m => m.primary).map((model) => (
                        <div
                          key={model.id}
                          className="rounded-lg border transition-all bg-gray-50 border-gray-100 p-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                              <div className="flex flex-col min-w-0 overflow-hidden">
                                {model.isCustom ? (
                                  <>
                                    <span className="text-sm font-medium text-gray-800 leading-tight truncate block">自定义模型</span>
                                    {model.customName && (
                                      <span className="text-xs text-gray-400 leading-tight mt-0.5 truncate block">{model.customName}</span>
                                    )}
                                    {model.multimodal && (
                                      <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-500 border border-blue-100 w-fit">多模态</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm font-medium text-gray-800 leading-tight truncate block">{model.providerLabel}</span>
                                    {model.versionLabel && (
                                      <span className="text-xs text-gray-400 leading-tight mt-0.5 truncate block">{model.versionLabel}</span>
                                    )}
                                    {model.isDefault && (
                                      <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200 w-fit">管理员预置</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="badge-running pointer-events-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                主模型
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModelConfirmDialog({ open: true, type: "delete", modelId: model.id });
                                    }}
                                    className="p-1 rounded text-gray-300 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                                  删除模型
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* 备选模型分组 */}
                {appliedModels.some(m => !m.primary) && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">备选模型</p>
                    <div className="mb-2 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-xs text-blue-700 leading-relaxed">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      <span>主模型不可用时会自动切换备选模型，此时备选模型消耗的token将统计到主模型下</span>
                    </div>
                    <div className="space-y-1.5">
                      {[...appliedModels.filter(m => !m.primary)].sort((a, b) => b.addedAt - a.addedAt).map((model) => (
                        <div
                          key={model.id}
                          className="rounded-lg border transition-all bg-white border-gray-100 hover:bg-gray-50 p-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                              <div className="flex flex-col min-w-0 overflow-hidden">
                                {model.isCustom ? (
                                  <>
                                    <span className="text-sm font-medium text-gray-800 leading-tight truncate block">自定义模型</span>
                                    {model.customName && (
                                      <span className="text-xs text-gray-400 leading-tight mt-0.5 truncate block">{model.customName}</span>
                                    )}
                                    {model.multimodal && (
                                      <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-500 border border-blue-100 w-fit">多模态</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm font-medium text-gray-800 leading-tight truncate block">{model.providerLabel}</span>
                                    {model.versionLabel && (
                                      <span className="text-xs text-gray-400 leading-tight mt-0.5 truncate block">{model.versionLabel}</span>
                                    )}
                                    {model.isDefault && (
                                      <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200 w-fit">管理员预置</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400 pointer-events-none">
                                备选
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModelConfirmDialog({ open: true, type: "set-primary", modelId: model.id });
                                    }}
                                    className="p-1 rounded opacity-60 hover:opacity-90 transition-opacity focus:outline-none"
                                    aria-label="切换为主模型"
                                  >
                                    <img src="/images/icon-switch.png" className="w-3.5 h-3.5" alt="切换" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                                  切换为主模型
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModelConfirmDialog({ open: true, type: "delete-backup", modelId: model.id });
                                    }}
                                    className="p-1 rounded text-gray-300 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                                  删除模型
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>{/* end scrollable */}
          </div>

          {/* ===== Channel Column ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)", height: "749px" }}>
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
                    {visibleBuiltinChannels.map((ch) => (
                      <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                    ))}
                    {visibleCustomChannels.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs text-gray-400 font-medium border-t border-gray-100 mt-1 pt-2">自定义通道</div>
                        {visibleCustomChannels.map((cc) => (
                          <SelectItem key={`admin_custom_${cc.id}`} value={`admin_custom_${cc.id}`}>{cc.name}</SelectItem>
                        ))}
                      </>
                    )}
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
                {(currentChannelConfig?.feishuMode && feishuConfigMode === "quick") || (currentChannelConfig?.weworkMode && weworkConfigMode === "quick") || currentChannelConfig?.wechatMode ? "前往授权" : "添加并应用"}
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
                          {ch.channelValue === "wechat" ? (
                            <span className="text-sm font-medium text-gray-800 truncate flex-1 min-w-0 pl-[18px]">{ch.type}</span>
                          ) : (
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
                          )}
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
                        {/* 展开配置项（微信无展开） */}
                        {ch.channelValue !== "wechat" && expandedChannelIdx === chIdx && renderAppliedChannelDetail(chIdx, ch)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== Skills Column ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)", height: "749px" }}>
            <div className="p-5 border-b border-gray-50">
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

              {(() => {
                const hasQueueing = pendingSkills.some(s => s.status === "installing" || s.status === "pending");
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="w-full block" tabIndex={hasQueueing ? 0 : -1}>
                        <Button
                          className="w-full text-sm"
                          variant="outline"
                          disabled={hasQueueing}
                          onClick={hasQueueing ? undefined : () => {
                            if (!skillSearch.trim()) {
                              toast.warning("请先输入准确的 Skill 名称");
                              return;
                            }
                            setSkillInstallConfirm({ open: true, skillName: skillSearch.trim() });
                          }}
                        >
                          安装技能
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {hasQueueing && (
                      <TooltipContent side="top" className="text-xs max-w-[220px] text-justify">
                        当前有技能正在安装队列中，请等待安装完成后再添加新技能，以免影响 OpenClaw 的正常运行。
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })()}
              
              {/* 不支持搜索时的提示信息 */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-blue-700 leading-relaxed">
                  管理员配置了
                  <a href="https://skillhub.tencent.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline underline-offset-1 font-medium">
                    SkillHub地址
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                  ，不支持搜索，请输入准确Skill名称
                </div>
              </div>
            </div>
            {/* Lower: two scrollable sections */}
            <div className="px-5 pb-5 flex flex-col flex-1 min-h-0 gap-3">

              {/* 已安装技能 - scrollable */}
              <div className="flex flex-col flex-1 min-h-0 pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-2 flex-shrink-0">已安装技能（{skillSearch ? filteredSkills.length : installedSkills.length}）</p>
                <div className="overflow-y-auto flex-1 space-y-1">
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

              {/* 待安装技能 - scrollable */}
              {pendingSkills.length > 0 && (
                <div className="flex flex-col flex-1 min-h-0 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1 mb-2 flex-shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default flex items-center">
                          <Info className="w-3 h-3 text-gray-300 hover:text-gray-400 transition-colors" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-[220px] text-justify">
                        待安装技能通常为管理员为您预配置的初始技能，安装过程不影响正常对话。只要模型与通道配置完毕，即可随时开始与 OpenClaw 对话。
                      </TooltipContent>
                    </Tooltip>
                    <p className="text-xs text-gray-400">待安装技能（{pendingSkills.length}）</p>
                    {pendingSkills.some(s => s.status === "failed") && (
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={handleRetryAllFailed}
                          className="text-xs text-blue-600 hover:text-blue-700 underline underline-offset-1 flex items-center gap-0.5"
                        >
                          <RotateCcw className="w-3 h-3" />
                          重试
                        </button>
                        <button
                          onClick={handleDeleteAllFailed}
                          className="text-xs text-blue-600 hover:text-blue-700 underline underline-offset-1 flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1 space-y-1">
                    {pendingSkills.map((skill) => (
                      <div key={skill.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-sm text-gray-700 truncate flex-1 mr-2">{skill.name}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {skill.status === "installing" && (
                            <>
                              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                              <span className="text-xs text-blue-500">安装中</span>
                            </>
                          )}
                          {skill.status === "pending" && (
                            <span className="text-xs text-gray-400">待安装</span>
                          )}
                          {skill.status === "failed" && (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-xs text-red-500">安装失败</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

            </div>
          )}{/* end basic tab */}

          {/* 记忆管理 tab */}
          {activeDetailTab === "memory" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ minHeight: "400px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <MemoryPreview memoryServiceEnabled={true} openclawVersion="3.24" />
            </div>
          )}

          {/* 网盘空间 tab */}
          {activeDetailTab === "files" && (
            <FileSpace
              clawName={clawName}
              clawId={clawId || ""}
              basePath="https://smh3jsttekkpsoqw.api.tencentsmh.cn"
              libraryId="smh3jsttekkpsoqw"
              spaceId="space232t1yug3w7up"
              getAccessToken={async () => ({
                accessToken: "acctk021cf0f24emnem68z3dzwr734zcdpl74fd7783cgdesppskermqhhu7d9pnns4exa5gvc84n2yfhdq5unt754belzzvkwcd5psjuznzwt7jbcs2zsm5c3828ba4",
                expiresAt: Date.now() + 3600 * 24 * 1000,
              })}
            />
          )}

          {/* 龙虾医院 tab */}
          {activeDetailTab === "doctor" && (
            <div className="flex flex-col gap-5">

              {/* ===== 一键修复卡片 ===== */}
              <div className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                <div className="p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-2">一键修复</h2>
                  <p className="text-sm text-gray-500 mb-4">适合龙虾配置文件中 API KEY、插件、通道等配置异常导致无法启动等常见问题，系统自动检测并尝试修复。</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                      自动执行
                      <code className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-xs">openclaw doctor --fix</code>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                      自动恢复常见配置问题
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                      恢复前会将配置文件备份
                    </li>
                  </ul>
                  <div className="border-t border-gray-100 pt-4">
                    {quickFixState === "idle" && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-sm"
                        onClick={() => {
                          setQuickFixState("loading");
                          setTimeout(() => setQuickFixState("success"), 3000);
                        }}
                      >
                        <span>🩺</span>
                        一键修复
                      </Button>
                    )}
                    {quickFixState === "loading" && (
                      <Button variant="outline" className="flex items-center gap-2 text-sm" disabled>
                        <svg className="animate-spin w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        尝试修复中
                      </Button>
                    )}
                    {quickFixState === "success" && (
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-800">执行完成</span>
                        </span>
                        <span className="text-xs text-gray-400">请前往 OpenClaw 对话确认问题是否已解决</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== 龙虾医生对话卡片（受管控端「允许用户使用龙虾医生」开关控制） ===== */}
              {lobsterDoctorEnabled && (
                <DoctorChatCard instanceId={claw.instanceId} instanceName={claw.instanceId} />
              )}

            </div>
          )}

          </div>{/* end tab content */}
        </div>{/* end flex outer */}
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
                <DialogTitle className="text-base font-semibold text-gray-900">扫码配置飞书机器人</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  请使用飞书账号扫码登录，完成授权后将自动为您创建机器人。
                </DialogDescription>
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
                <DialogTitle className="text-base font-semibold text-gray-900">正在配置飞书机器人</DialogTitle>
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
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <DialogTitle className="text-base font-semibold text-gray-900">飞书机器人发布失败</DialogTitle>
                </div>
                <DialogDescription className="text-sm text-red-500 mt-1 font-medium">
                  当前用户权限无法免审批发布飞书机器人，请联系管理员审批通过后再进行手动配置。
                </DialogDescription>
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
              <div className="mt-3 space-y-1.5 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
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
            <DialogDescription className="sr-only">开启OpenClaw面板</DialogDescription>
            <div className="mt-2 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-xs text-blue-700 leading-relaxed">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>OpenClaw 面板（WebUI）是 OpenClaw 官方提供的浏览器操作界面，可直接在浏览器与 AI 对话，并且有查看会话记录、配置定时任务、监控系统日志等高级功能。</span>
            </div>
            <p className="text-sm text-gray-500 mt-3">开启OpenClaw面板将会依次执行以下操作，确定后将自动执行：</p>
          </DialogHeader>
          <div className="mt-1 space-y-2.5 py-1 pb-3">
            {/* 步骤1：放通端口 */}
            <div className="flex items-center gap-3">
              {webUIFailedStep === "port" ? (
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              ) : webUIStep >= 1 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              )}
              <span className={`text-xs ${
                webUIFailedStep === "port" ? "text-orange-500 font-medium" :
                webUIStep >= 1 ? "text-gray-600" : "text-blue-600 font-medium"
              }`}>
                {webUIFailedStep === "port"
                  ? "放通端口：放通端口失败，请重试"
                  : webUIStep >= 1
                  ? "放通端口：端口38341已放通"
                  : "放通端口：正在放通端口38341...预计1~2秒"}
              </span>
            </div>
            {/* 步骤2：生成链接 */}
            <div className="flex items-center gap-3">
              {webUIFailedStep === "link" ? (
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              ) : webUIStep >= 2 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : webUIStep === 1 ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
              )}
              <span className={`text-xs ${
                webUIFailedStep === "link" ? "text-orange-500 font-medium" :
                webUIStep >= 2 ? "text-gray-600" :
                webUIStep === 1 ? "text-blue-600 font-medium" : "text-gray-400"
              }`}>
                {webUIFailedStep === "link"
                  ? "生成链接：生成链接失败，请重试"
                  : webUIStep >= 2
                  ? "生成链接：链接已生成"
                  : webUIStep === 1
                  ? "生成链接：正在为您生成OpenClaw面板访问链接，预计5~10秒..."
                  : "生成链接：等待放通端口完成"}
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
              disabled={webUIStep < 2 && webUIFailedStep === "none"}
              onClick={webUIFailedStep !== "none" ? handleWebUIRetry : handleWebUIProgressConfirm}
              className={`px-6 ${(webUIStep >= 2 || webUIFailedStep !== "none") ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 text-white opacity-50 cursor-not-allowed'}`}
            >
              {webUIFailedStep !== "none" ? "重试" : "确定"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== OpenClaw 面板 结果弹窗 ===== */}
      <Dialog open={showWebUIResultDialog} onOpenChange={(open) => {
        if (!open) setShowWebUIResultDialog(false);
      }}>
        <DialogContent className="w-[90vw] max-w-lg overflow-hidden">
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
              <span className="text-xs text-gray-500 shrink-0 w-16">WebSocket URL</span>
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
              <span className="text-xs text-gray-500 shrink-0 w-16">网关令牌</span>
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
            用浏览器打开 WebSocket URL，如面板需要填入网关令牌，则将网关令牌复制并粘贴过去，即可进入面板。
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

      {/* ===== 一键更新 确认弹窗 ===== */}
      <Dialog open={showUpdateConfirmDialog} onOpenChange={setShowUpdateConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">更新确认</DialogTitle>
            <DialogDescription className="sr-only">更新确认</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed space-y-2 py-1">
            <p>更新版本预计需要 5～10 分钟不等，请您耐心等待。更新期间 OpenClaw 网关服务暂停，面板不可操作。</p>
            <p>更新版本后模型（Models）、通道（Channels）、技能（Skills）和记忆均不会丢失。</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpdateConfirmDialog(false)}
              className="text-gray-600 px-5"
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleStartUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5"
            >
              确认
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== 一键更新 进度弹窗 ===== */}
      <Dialog open={showUpdateProgressDialog} onOpenChange={(open) => {
        if (!open) setShowUpdateProgressDialog(false);
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">正在更新 OpenClaw</DialogTitle>
            <DialogDescription className="sr-only">更新进度</DialogDescription>
          </DialogHeader>
          <div className="mt-1 space-y-2.5 py-1 pb-3">
            {updateSteps.map((step, idx) => {
              const stepNum = idx + 1;
              const isDone = updateStepsDone >= stepNum;
              const isActive = updateStepsDone === idx;
              return (
                <div key={step} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                  <span className={`text-xs ${
                    isDone ? "text-gray-600" : isActive ? "text-blue-600 font-medium" : "text-gray-400"
                  }`}>
                    [步骤{stepNum}] {step}
                  </span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== 微信扫码登录弹窗 ===== */}
      <Dialog open={showWechatQrModal} onOpenChange={(open) => {
        // 仅在 qr 阶段允许手动关闭（loading 阶段不允许）
        if (!open && wechatModalStage === "qr") setShowWechatQrModal(false);
      }}>
        <DialogContent className="max-w-sm [&>button]:focus-visible:ring-0 [&>button]:focus-visible:ring-offset-0 [&>button]:outline-none [&>button]:shadow-none [&>button]:border-0 [&>button]:ring-0">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">微信扫码登录</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              使用微信（需要 iOS、Android系统 8.0.70 以上版本）"扫一扫"完成接入
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl min-h-[220px] mt-1 mb-2">
            {wechatModalStage === "checking" && (
              <>
                <Loader2 className="w-10 h-10 text-gray-300 animate-spin mb-3" />
                <p className="text-sm text-gray-500">正在检查网关…</p>
              </>
            )}
            {wechatModalStage === "generating" && (
              <>
                <Loader2 className="w-10 h-10 text-gray-300 animate-spin mb-3" />
                <p className="text-sm text-gray-500">正在生成二维码…</p>
              </>
            )}
            {wechatModalStage === "qr" && (
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
                <rect x="82" y="10" width="8" height="8" fill="black"/>
                <rect x="94" y="10" width="8" height="8" fill="black"/>
                <rect x="70" y="22" width="8" height="8" fill="black"/>
                <rect x="106" y="22" width="8" height="8" fill="black"/>
                <rect x="82" y="34" width="8" height="8" fill="black"/>
                <rect x="94" y="34" width="8" height="8" fill="black"/>
                <rect x="70" y="46" width="8" height="8" fill="black"/>
                <rect x="106" y="46" width="8" height="8" fill="black"/>
                <rect x="82" y="58" width="8" height="8" fill="black"/>
                <rect x="10" y="70" width="8" height="8" fill="black"/>
                <rect x="34" y="70" width="8" height="8" fill="black"/>
                <rect x="58" y="70" width="8" height="8" fill="black"/>
                <rect x="82" y="70" width="8" height="8" fill="black"/>
                <rect x="106" y="70" width="8" height="8" fill="black"/>
                <rect x="130" y="70" width="8" height="8" fill="black"/>
                <rect x="154" y="70" width="8" height="8" fill="black"/>
                <rect x="22" y="82" width="8" height="8" fill="black"/>
                <rect x="46" y="82" width="8" height="8" fill="black"/>
                <rect x="70" y="82" width="8" height="8" fill="black"/>
                <rect x="118" y="82" width="8" height="8" fill="black"/>
                <rect x="142" y="82" width="8" height="8" fill="black"/>
                <rect x="166" y="82" width="8" height="8" fill="black"/>
                <rect x="10" y="94" width="8" height="8" fill="black"/>
                <rect x="34" y="94" width="8" height="8" fill="black"/>
                <rect x="94" y="94" width="8" height="8" fill="black"/>
                <rect x="118" y="94" width="8" height="8" fill="black"/>
                <rect x="154" y="94" width="8" height="8" fill="black"/>
                <rect x="22" y="106" width="8" height="8" fill="black"/>
                <rect x="58" y="106" width="8" height="8" fill="black"/>
                <rect x="82" y="106" width="8" height="8" fill="black"/>
                <rect x="130" y="106" width="8" height="8" fill="black"/>
                <rect x="166" y="106" width="8" height="8" fill="black"/>
                <rect x="70" y="118" width="8" height="8" fill="black"/>
                <rect x="94" y="118" width="8" height="8" fill="black"/>
                <rect x="118" y="118" width="8" height="8" fill="black"/>
                <rect x="154" y="118" width="8" height="8" fill="black"/>
                <rect x="82" y="130" width="8" height="8" fill="black"/>
                <rect x="106" y="130" width="8" height="8" fill="black"/>
                <rect x="130" y="130" width="8" height="8" fill="black"/>
                <rect x="70" y="142" width="8" height="8" fill="black"/>
                <rect x="94" y="142" width="8" height="8" fill="black"/>
                <rect x="142" y="142" width="8" height="8" fill="black"/>
                <rect x="166" y="142" width="8" height="8" fill="black"/>
                <rect x="82" y="154" width="8" height="8" fill="black"/>
                <rect x="118" y="154" width="8" height="8" fill="black"/>
                <rect x="142" y="154" width="8" height="8" fill="black"/>
                <rect x="70" y="166" width="8" height="8" fill="black"/>
                <rect x="106" y="166" width="8" height="8" fill="black"/>
                <rect x="130" y="166" width="8" height="8" fill="black"/>
                <rect x="154" y="166" width="8" height="8" fill="black"/>
              </svg>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== 模型操作二次确认弹窗 ===== */}
      <Dialog
        open={modelConfirmDialog.open}
        onOpenChange={(open) => !open && setModelConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-blue-600">
              {modelConfirmDialog.type === "delete" ? "确认删除主模型" : modelConfirmDialog.type === "delete-backup" ? "确认删除备选模型" : "切换主模型"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed pt-1">
              {modelConfirmDialog.type === "delete"
                ? "删除后将自动切换备选模型作为主模型，切换过程中将导致相关的 Gateway 服务重启"
                : modelConfirmDialog.type === "delete-backup"
                ? "删除后将导致相关的 Gateway 服务重启，确认删除么"
                : "将此模型设为主模型后，原主模型将降为备选模型。切换过程中会自动重启 Gateway 服务，是否继续？"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModelConfirmDialog(prev => ({ ...prev, open: false }))}
            >
              取消
            </Button>
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const { type, modelId } = modelConfirmDialog;
                setModelConfirmDialog(prev => ({ ...prev, open: false }));
                if (type === "set-primary" && modelId !== null) {
                  setAppliedModels(prev => prev.map(m => ({ ...m, primary: m.id === modelId })));
                  toast.success("已设为主模型");
                } else if (type === "delete-backup" && modelId !== null) {
                  setAppliedModels(prev => prev.filter(m => m.id !== modelId));
                  toast.success("备选模型已删除");
                } else if (type === "delete" && modelId !== null) {
                  setAppliedModels(prev => {
                    const next = prev.filter(m => m.id !== modelId);
                    const wasPrimary = prev.find(m => m.id === modelId)?.primary ?? false;
                    // 删除主模型后自动将列表中第一个升为主模型
                    if (wasPrimary && next.length > 0) {
                      next[0] = { ...next[0], primary: true };
                    }
                    return next;
                  });
                  toast.success("主模型已删除，已自动升级备选模型");
                }
              }}
            >
              {modelConfirmDialog.type === "delete" || modelConfirmDialog.type === "delete-backup" ? "确认删除" : "确认设置"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== 技能安装二次确认弹窗 ===== */}
      <Dialog
        open={skillInstallConfirm.open}
        onOpenChange={(open) => !open && setSkillInstallConfirm(prev => ({ ...prev, open: false }))}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-blue-600">确认安装技能</DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed pt-1">
              确认安装名称为
              <span className="font-semibold text-gray-900 mx-1">{skillInstallConfirm.skillName}</span>
              的技能？
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 mt-1">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">部分技能(Skills)可能存在安全风险，安装前请确认其安全性。</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSkillInstallConfirm(prev => ({ ...prev, open: false }))}
            >
              取消
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const name = skillInstallConfirm.skillName;
                setSkillInstallConfirm({ open: false, skillName: "" });
                setSkillSearch("");
                // 添加到待安装队列
                setPendingSkills(prev => [
                  ...prev,
                  { id: `ps-${Date.now()}`, name, status: "pending" as const },
                ]);
                toast.success(`技能「${name}」已加入安装队列`);
              }}
            >
              确认安装
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== 智能体迁移弹窗 ==================== */}
      <Dialog open={migrationOpen} onOpenChange={setMigrationOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              迁移 OpenClaw 至当前实例
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              将源端 OpenClaw 的配置、通道状态、会话历史导入到「{clawData?.name}」
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* 注意事项 */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1.5">
              <p className="text-xs text-amber-800 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> 注意事项
              </p>
              <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4 leading-relaxed">
                <li>源端 OpenClaw 的配置、通道登录状态、会话历史将完整导入到当前实例</li>
                <li>源端仅做读取打包，不影响源端正常运行</li>
                <li>导入将覆盖当前实例的 ~/.openclaw/ 目录，导入前自动备份，失败自动回滚</li>
                <li>COS 临时数据保留 24 小时后自动清理</li>
              </ul>
            </div>

            {/* Step 1: 导出源端配置 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  migrationStep === "export" || migrationStep === "waitUpload"
                    ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                }`}>
                  {migrationStep !== "export" && migrationStep !== "waitUpload" ? <CheckCircle2 className="w-3 h-3" /> : "1"}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">导出源端 OpenClaw 配置</h3>
              </div>
              <p className="text-xs text-gray-500 ml-7">
                请复制下方命令，在源 OpenClaw 终端或 IM 机器人对话框中执行。
              </p>
              <div className="ml-7 relative bg-gray-50 border border-gray-200 rounded-lg p-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(migrationExportCommand); toast.success("命令已复制"); }}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                  title="复制命令"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all leading-relaxed pr-8">{migrationExportCommand}</pre>
              </div>
              <div className="ml-7 text-xs text-gray-400 space-y-0.5">
                <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> 上传链接有效期 1 小时，超时请刷新页面重新获取</p>
              </div>
            </div>

            {/* Step 2: 检测上传 & 导入 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  migrationStep === "export" || migrationStep === "waitUpload" ? "bg-gray-300 text-gray-600"
                  : migrationStep === "import" ? "bg-blue-500 text-white"
                  : "bg-green-500 text-white"
                }`}>
                  {migrationStep === "success" || migrationStep === "importing" ? <CheckCircle2 className="w-3 h-3" /> : "2"}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">将源端配置导入当前实例</h3>
              </div>

              {!migrationUploaded && (migrationStep === "export" || migrationStep === "waitUpload") && (
                <div className="ml-7 space-y-2">
                  <p className="text-xs text-gray-500">执行完导出命令后，点击检测上传状态：</p>
                  <button
                    onClick={handleCheckUpload}
                    disabled={migrationChecking}
                    className="inline-flex items-center gap-1.5 text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors text-gray-600 bg-white border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {migrationChecking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                    {migrationChecking ? "检测中..." : "检测上传状态"}
                  </button>
                </div>
              )}

              {migrationStep === "import" && (
                <div className="ml-7 space-y-3">
                  <div className="rounded-lg bg-green-50 border border-green-200 p-2.5">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 已检测到上传的数据包
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> 重要提醒
                    </p>
                    <p className="text-xs text-red-600 mt-1 leading-relaxed">
                      执行导入将<strong>覆盖</strong>当前实例「{clawData?.name}」的全部 OpenClaw 配置（~/.openclaw/ 目录）。
                      导入前会自动备份，失败时自动回滚。
                    </p>
                  </div>
                  <button
                    onClick={handleStartMigration}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-4 py-2 transition-colors text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    导入并重启 OpenClaw
                  </button>
                </div>
              )}

              {migrationStep === "importing" && (
                <div className="ml-7 space-y-2">
                  <p className="text-xs text-blue-600 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> 正在导入...
                  </p>
                  <Progress value={migrationProgress} className="h-1.5" />
                  <p className="text-xs text-gray-400">
                    下载数据包 → 备份当前配置 → 解压覆盖 → 重启 Gateway
                  </p>
                </div>
              )}
            </div>

            {/* Step 3: Result */}
            {migrationStep === "success" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <h3 className="text-sm font-semibold text-green-700">迁移成功</h3>
                </div>
                <div className="ml-7 rounded-lg bg-green-50 border border-green-200 p-3 space-y-1.5">
                  <p className="text-xs text-green-700">OpenClaw 配置数据已成功导入，Gateway 已重启。</p>
                  <p className="text-xs text-green-600">COS 临时数据已清理。</p>
                </div>
                <div className="ml-7">
                  <button onClick={() => setMigrationOpen(false)}
                    className="text-xs font-medium text-blue-600 hover:underline">
                    关闭
                  </button>
                </div>
              </div>
            )}

            {migrationStep === "failed" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <XCircle className="w-3 h-3" />
                  </div>
                  <h3 className="text-sm font-semibold text-red-700">迁移失败</h3>
                </div>
                <div className="ml-7 rounded-lg bg-red-50 border border-red-200 p-3 space-y-1.5">
                  <p className="text-xs text-red-700">{migrationError}</p>
                  <p className="text-xs text-red-600">已自动回滚至导入前状态，当前实例配置未受影响。</p>
                </div>
                <div className="ml-7 flex gap-2">
                  <button onClick={resetMigration}
                    className="text-xs font-medium text-blue-600 hover:underline">
                    重试
                  </button>
                  <button onClick={() => setMigrationOpen(false)}
                    className="text-xs font-medium text-gray-500 hover:underline">
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </TenantLayout>
    </TooltipProvider>
  );
}

// ─── 龙虾医生对话卡片 ────────────────────────────────────────────────────────────

// ─── 消息类型定义 ────────────────────────────────────────────────────────────


// ─── 类型定义 ────────────────────────────────────────────────────────────────

type DiagCheckItem = {
  label: string;
  status: "ok" | "error" | "warn";
  detail?: string;
};

// 操作确认卡片（修改三：取代旧版 RepairCard）
type ActionCard = {
  id: string;
  description: string; // 具体说明「做什么」
  // 状态: null=待确认, "confirmed"=已确认, "cancelled"=已取消, "running"=执行中, "done"=完成, "failed"=失败
  status: null | "confirmed" | "cancelled" | "running" | "done" | "failed";
  resultText?: string; // 执行结果说明
};

type SessionEndCard = {
  dataAuthorized: boolean | null; // null=未操作
};

type DoctorMessageContent =
  | { type: "text"; text: string }
  | { type: "check_list"; items: DiagCheckItem[] }
  | { type: "action_card"; card: ActionCard }
  | { type: "result_tags"; tags: { label: string; ok: boolean }[] }
  | { type: "session_end"; card: SessionEndCard }
  | { type: "end_ask_resolved" }
  | { type: "end_ask_rollback" }
  | { type: "end_ask_continue" } // 回滚完成后再次询问
  | { type: "snapshot_confirm" }; // 快照确认内嵌卡片

type DoctorMsg =
  | { kind: "system"; text: string }
  | { kind: "assistant"; parts: DoctorMessageContent[] }
  | { kind: "user"; text: string };

type HistoryRecord = {
  id: string;
  time: string;
  instanceId: string; // 实例 ID，用于按实例过滤历史记录
  instanceName: string;
  result: "all_ok" | "partial" | "all_fixed" | "failed";
  messages: DoctorMsg[];
  firstUserMsg?: string; // 本次会话第一条用户消息（用于历史列表展示）
};

// ─── 小工具组件 ────────────────────────────────────────────────────────────

const RESULT_LABEL: Record<HistoryRecord["result"], { text: string; cls: string }> = {
  all_ok:    { text: "全部正常",   cls: "bg-green-100 text-green-700" },
  partial:   { text: "部分修复",   cls: "bg-orange-100 text-orange-700" },
  all_fixed: { text: "全部修复",   cls: "bg-green-100 text-green-700" },
  failed:    { text: "未能修复",   cls: "bg-red-100 text-red-700" },
};

// 检测结果列表
function CheckList({ items }: { items: DiagCheckItem[] }) {
  return (
    <div className="space-y-1.5 mt-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.status === "ok" ? "bg-green-500" :
              item.status === "error" ? "bg-red-500" : "bg-orange-400"
            }`}
          />
          <span className="text-gray-700 w-28 flex-shrink-0">{item.label}</span>
          <span className={`${
            item.status === "ok" ? "text-gray-400" :
            item.status === "error" ? "text-red-600 font-medium" : "text-orange-600 font-medium"
          }`}>
            {item.detail ?? (item.status === "ok" ? "正常" : "异常")}
          </span>
        </div>
      ))}
    </div>
  );
}

// 操作确认卡片（修改三）
function ActionCardView({
  card,
  onConfirm,
  onCancel,
  readonly,
}: {
  card: ActionCard;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  readonly?: boolean;
}) {
  return (
    <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm text-gray-800 leading-relaxed mb-3">{card.description}</p>
      {/* 待确认 */}
      {card.status === null && !readonly && (
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(card.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            执行修复
          </button>
          <button
            onClick={() => onCancel(card.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      )}
      {/* 已确认 */}
      {card.status === "confirmed" && (
        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
          <span>✓</span> 已确认
        </span>
      )}
      {/* 执行中 */}
      {card.status === "running" && (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          正在执行…
        </span>
      )}
      {/* 完成 */}
      {card.status === "done" && (
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <span className="text-green-500">✓</span>
              <span className="text-gray-800">执行完成</span>
            </span>
            <span className="text-xs text-gray-400">请前往 OpenClaw 对话确认问题是否已解决</span>
          </div>
          {card.resultText && <p className="text-xs text-gray-600 mt-1">{card.resultText}</p>}
        </div>
      )}
      {/* 失败 */}
      {card.status === "failed" && (
        <div>
          <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium mb-1">
            <span>✕</span> 执行失败
          </span>
          {card.resultText && <p className="text-xs text-gray-500 mt-1">{card.resultText}</p>}
        </div>
      )}
      {/* 已取消 */}
      {card.status === "cancelled" && (
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <span>—</span> 已取消
        </span>
      )}
      {/* 只读：待确认状态显示为置灰按钮 */}
      {card.status === null && readonly && (
        <div className="flex gap-2">
          <button disabled className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-200 text-gray-400 cursor-not-allowed">确定</button>
          <button disabled className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white border border-gray-100 cursor-not-allowed">取消</button>
        </div>
      )}
    </div>
  );
}

// 修复结果标签
function ResultTags({ tags }: { tags: { label: string; ok: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tags.map((t, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            t.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {t.label}
          {t.ok ? " ✓" : " 未修复"}
        </span>
      ))}
    </div>
  );
}

// 数据授权区域（修改六：每次会话结束都出现）
function DataAuthSection({
  persistDataAuth,
  sessionDataAuth,
  onAuthorize,
  onDeny,
  readonly,
  readonlyAuth,
}: {
  persistDataAuth: boolean | null;
  sessionDataAuth: boolean | null;
  onAuthorize: () => void;
  onDeny: () => void;
  readonly?: boolean;
  readonlyAuth?: boolean | null;
}) {
  if (readonly) {
    // 只读模式：展示历史授权结果
    if (readonlyAuth === true) {
      return <p className="text-xs text-green-600 flex items-center gap-1 mt-2">✓ 已授权诊断记录使用</p>;
    }
    if (readonlyAuth === false) {
      return <p className="text-xs text-gray-400 mt-2">未授权诊断记录使用</p>;
    }
    return null;
  }

  // 情况 C：已选择「不授权」— 完全不显示
  if (persistDataAuth === false && sessionDataAuth === null) return null;

  // 情况 B：已选择「同意长期授权」
  if (persistDataAuth === true || sessionDataAuth === true) {
    return (
      <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
        ✓ 已授权
      </p>
    );
  }

  // 情况 A：首次（从未询问过）
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mt-3">
      <p className="text-xs font-semibold text-gray-800 mb-1">帮我们让虾医生变得更好 🦞</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        是否长期授权我们使用您的诊断记录（仅含问题类型和修复结果，不含任何对话内容），用于提升龙虾医生能力？您可随时在设置中修改。
      </p>
      <div className="flex gap-2">
        <button
          onClick={onAuthorize}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors"
        >
          同意长期授权
        </button>
        <button
          onClick={onDeny}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          不授权
        </button>
      </div>
    </div>
  );
}

// 打字动画气泡
function TypingBubble() {
  return (
    <div className="flex gap-3 py-1">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

// ─── 历史记录持久化（localStorage）────────────────────────────────────────────
// 注意：不再使用任何硬编码假数据，所有历史记录来自真实会话

const HISTORY_STORAGE_KEY = "doctor_history_openclaw_1";

function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryRecord[];
  } catch {
    return [];
  }
}

function saveHistory(records: HistoryRecord[]) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

// ─── 以下为已删除的 MOCK_HISTORY 假数据占位符（保留注释供参考）────────────────
// MOCK_HISTORY 已完全删除，历史记录改为 localStorage 真实持久化
// 如需查看历史记录格式，参考 HistoryRecord 类型定义

// ─── 以下为原 MOCK_HISTORY 末尾的假数据（已删除）────────────────────────────
// 原有两条假数据（h1: 2026-03-31, h2: 2026-03-28）已全部删除
// 用户首次使用时历史记录为空，显示「暂无历史诊断记录」

// ─── 占位：原 MOCK_HISTORY 的第一条（已删除，保留结构注释）────────────────────
// {
//   id: "h1", time: "2026-03-31 14:22", instanceName: "ins-running01", result: "partial",
//   messages: [ ... ] // 完整对话消息
// }

// ─── 以下为原 MOCK_HISTORY 的第二条（已删除）────────────────────────────────
// {
//   id: "h2", time: "2026-03-28 09:05", instanceName: "ins-running01", result: "all_ok",
//   messages: [ ... ]
// }

// ─── 主组件 DoctorChatCard（历史记录改为真实持久化）────────────────────────────
// 以下为原 MOCK_HISTORY 第一条的 messages 开头（已删除）
// 此注释块仅用于标记删除位置，不影响代码运行

// ─── 原 MOCK_HISTORY 剩余部分（已删除）─────────────────────────────────────────
// 以下为被删除的假数据末尾，保留注释以便 diff 追踪
// 如需恢复假数据用于测试，请参考 git history

// ─── 假数据完全删除，以下为真实主组件 ─────────────────────────────────────────


// ─── 主组件 DoctorChatCard ────────────────────────────────────────────────────────────

type ViewMode = "idle" | "history_list" | "history_detail" | "active";
// key 按实例 ID 区分，每台实例独立记录授权状态
const getDataAuthKey = (id: string) => `doctor_data_auth_${id}`;
const getDiagAuthKey = (id: string) => `doctor_diag_auth_${id}`;

// 自动检测修复队列
const REPAIR_QUEUE: Array<{
  id: string;
  description: string;
  resultText: string;
}> = [
  {
    id: "card_feishu",
    description: "刷新飞书 Bot 的 App Secret Token，并重启通道连接，恢复消息收发。",
    resultText: "Token 已刷新，通道连接已恢复正常。",
  },
  {
    id: "card_tavily",
    description: "强制重启 tavily-search 技能进程，并重新加载技能配置。",
    resultText: "技能进程已重启，运行状态恢复正常。",
  },
];

// AI 系统提示词（修改八）
const SYSTEM_PROMPT = `你是龙虾医生（Lobster Doctor），ClawPro 企业版 OpenClaw 平台内置的 AI 运维助手。

你的核心能力：
1. 自动检测标准项目（网络连通性、模型接口、IM 通道、技能插件运行状态）
2. 根据用户描述，针对性分析和解决任意 OpenClaw 运行问题
3. 执行具体操作（开放端口、重启服务、修改配置、回滚快照等），执行前必须展示操作确认卡片
4. 给出建议和指导，即使当前无法直接解决，也能说明方向

你的工作原则：
- 不展示任何 Token、费用、模型名称等计费信息
- 回答简洁专业，直接切入问题
- 需要执行操作时，先说明要做什么，等用户确认后再执行
- 用中文回复，不超过 200 字

当前上下文：用户正在使用 ClawPro 用户端，对其 OpenClaw 实例进行诊断和修复。`;

// ─── 点赞/点踩图标组件 ─────────────────────────────────────────────────────────
function ThumbUpIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#6b7280" : "none"} stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
function ThumbDownIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#6b7280" : "none"} stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

// ─── 主组件 DoctorChatCard（历史记录改为真实持久化）────────────────────────────
// ─── 主组件 DoctorChatCard ────────────────────────────────────────────────────────────
function DoctorChatCard({ instanceId, instanceName }: { instanceId: string; instanceName: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [messages, setMessages] = useState<DoctorMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // 是否正在流式输出（用于暂停按钮）
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  // 诊断阶段
  const [diagPhase, setDiagPhase] = useState<
    "idle" | "initializing" | "diagnosing" | "waiting_user" | "asking_snapshot" | "asking_resolved" | "asking_rollback" | "asking_continue" | "destroying" | "ended"
  >("idle");
  const [selectedHistory, setSelectedHistory] = useState<HistoryRecord | null>(null);
  // 开始诊断授权弹窗
  const [showDiagAuthModal, setShowDiagAuthModal] = useState(false);
  // 快照是否已确认（每次诊断只询问一次）
  const [snapshotConfirmed, setSnapshotConfirmed] = useState(false);
  // 10分钟无操作自动结束计时器
  const autoEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  // 指令库下拉菜单
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  // 操作卡片状态 map: cardId -> ActionCard["status"]
  const [cardStatus, setCardStatus] = useState<Record<string, ActionCard["status"]>>({});
  const [cardResults, setCardResults] = useState<Record<string, string>>({});
  // 当前待处理的修复卡片队列索引（串行）
  const [repairQueueIdx, setRepairQueueIdx] = useState(0);
  // 历史记录（从 localStorage 加载，按当前实例过滤）
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() =>
    loadHistory().filter((r) => r.instanceId === instanceId)
  );
  // 记录会话开始时间
  const sessionStartTimeRef = useRef<string>("");
  // 数据授权永久状态
  const [persistDataAuth, setPersistDataAuth] = useState<boolean | null>(() => {
    const v = localStorage.getItem(getDataAuthKey(instanceId));
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  });
  const [sessionDataAuth, setSessionDataAuth] = useState<boolean | null>(null);
  // 结果标签（用于会话结束汇总）
  const [resultTags, setResultTags] = useState<{ label: string; ok: boolean }[]>([]);
  // 点赞/点踩状态 map: msgIdx -> "up" | "down" | null
  const [thumbs, setThumbs] = useState<Record<number, "up" | "down" | null>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ─── 开始诊断（真正执行）───────────────────────────────────────────────────────
  const doStartDiagnosis = () => {
    // 记录会话开始时间
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    sessionStartTimeRef.current = timeStr;
    setViewMode("active");
    setMessages([{ kind: "system", text: "正在为您创建龙虾医生实例，预计需要 1-2 分钟，请稍候…" }]);
    setDiagPhase("initializing");
    setCardStatus({});
    setCardResults({});
    setRepairQueueIdx(0);
    setSessionDataAuth(null);
    setResultTags([]);
    setThumbs({});
    setSnapshotConfirmed(false);
    // 模拟初始化完成（1.5s 后进入 diagnosing）
    setTimeout(() => {
      setMessages((prev) => [...prev, { kind: "system", text: "初始化完成" }]);
      setDiagPhase("diagnosing");
      startAutoEndTimer();
      runDiagnosis();
    }, 1500);
  };

  // ─── 开始诊断（入口：检查首次授权）──────────────────────────────────────────────
  const handleStartDiagnosis = () => {
    const diagAuthGranted = localStorage.getItem(getDiagAuthKey(instanceId)) === "true";
    if (!diagAuthGranted) {
      setShowDiagAuthModal(true);
      return;
    }
    doStartDiagnosis();
  };

  // ─── 授权弹窗：同意并开始 ────────────────────────────────────────────────────────
  const handleDiagAuthConfirm = () => {
    localStorage.setItem(getDiagAuthKey(instanceId), "true");
    setShowDiagAuthModal(false);
    doStartDiagnosis();
  };

  // ─── 10 分钟无操作自动结束 ────────────────────────────────────────────────────────
  const startAutoEndTimer = () => {
    if (autoEndTimerRef.current) clearTimeout(autoEndTimerRef.current);
    lastActivityRef.current = Date.now();
    autoEndTimerRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { kind: "system", text: "检测到您已超过 10 分钟无操作，本次诊断将自动结束。" }]);
      triggerSessionEnd();
    }, 10 * 60 * 1000);
  };

  const resetAutoEndTimer = () => {
    if (autoEndTimerRef.current) {
      clearTimeout(autoEndTimerRef.current);
      autoEndTimerRef.current = setTimeout(() => {
        setMessages((prev) => [...prev, { kind: "system", text: "检测到您已超过 10 分钟无操作，本次诊断将自动结束。" }]);
        triggerSessionEnd();
      }, 10 * 60 * 1000);
    }
  };

  // ─── 诊断检测逻辑（从 handleStartDiagnosis 拆出）────────────────────────────────
  const runDiagnosis = () => {
    setIsTyping(true);  // 打招呼
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { kind: "assistant", parts: [{ type: "text", text: "您好！我是龙虾医生 🦞\n我将对您的 OpenClaw 实例进行全面检测" }] },
      ]);
    }, 800);

    // 检测结果
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          kind: "assistant",
          parts: [
            { type: "text", text: "检测完成，发现 2 个问题：" },
            {
              type: "check_list",
              items: [
                { label: "网络连通性", status: "ok" },
                { label: "模型接口", status: "ok" },
                { label: "飞书通道", status: "error", detail: "认证 Token 已过期" },
                { label: "QQ 通道", status: "ok" },
                { label: "tavily-search", status: "error", detail: "进程崩溃" },
              ],
            },
          ],
        },
      ]);
    }, 2200);

    // 快照确认内嵌卡片（在修复卡片之前询问用户）
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          kind: "assistant",
          parts: [
            { type: "text", text: "检测完成，在开始修复之前，我需要先为您的当前配置创建一份快照，以便修复后出现问题时可以随时回滚，是否同意？" },
            { type: "snapshot_confirm" },
          ],
        },
      ]);
      setDiagPhase("asking_snapshot");
    }, 3200);
  };

  // ─── 快照确认：同意 ────────────────────────────────────────────────────────────────────────────────────
  const handleSnapshotConfirm = () => {
    setSnapshotConfirmed(true);
    setMessages((prev) => [
      ...prev,
      { kind: "system", text: "已创建配置快照，开始推送修复方案…" },
    ]);
    // 推送第一张修复卡片
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          kind: "assistant",
          parts: [
            { type: "text", text: "针对飞书通道认证失效，我有以下修复方案：" },
            {
              type: "action_card",
              card: {
                id: "feishu_token",
                title: "刷新飞书 Bot 的 App Secret Token，并重启通道连接，恢复消息收发。",
                description: "刷新飞书 Bot 的 App Secret Token，并重启通道连接，恢复消息收发。",
                status: null,
                resultText: undefined,
              },
            },
          ],
        },
      ]);
      setRepairQueueIdx(0);
      setDiagPhase("waiting_user");
    }, 600);
  };

  // ─── 快照确认：取消修复 ────────────────────────────────────────────────────────────────────────────────
  const handleSnapshotCancel = () => {
    setMessages((prev) => [
      ...prev,
      { kind: "system", text: "已取消修复。您可继续向龙虾医生提问。" },
    ]);
    setDiagPhase("diagnosing");
  };

   // ─── 结束诊断（用户主动点击）───────────────────────────────────────────────
  const handleEndDiagnosis = () => {
    // 直接销毁，不再询问问题是否已解决
    triggerSessionEnd();
  };

  // ─── 确认操作卡片 ────────────────────────────────────────────────────────────────
  const handleConfirmAction = (cardId: string) => {
    // AI 动态生成的授权卡片：点击执行后发送已授权消息给 AI
    if (cardId.startsWith("ai_action_")) {
      setCardStatus((prev) => ({ ...prev, [cardId]: "running" }));
      // 找到该卡片的描述
      const desc = messages
        .flatMap((m) => m.kind === "assistant" ? m.parts : [])
        .find((p) => p.type === "action_card" && (p as { type: string; card: ActionCard }).card.id === cardId)
        ? (messages
            .flatMap((m) => m.kind === "assistant" ? m.parts : [])
            .find((p) => p.type === "action_card" && (p as { type: string; card: ActionCard }).card.id === cardId) as { type: string; card: ActionCard })
            .card.description
        : "执行该操作";
      // 添加用户授权消息
      setMessages((prev) => [...prev, { kind: "user", text: `已授权，请执行：${desc}` }]);
      // 调用 AI
      setTimeout(() => {
        callAI(`已授权，请执行：${desc}`).then(() => {
          setCardStatus((prev) => ({ ...prev, [cardId]: "done" }));
          setCardResults((prev) => ({ ...prev, [cardId]: "操作已执行" }));
        });
      }, 300);
      return;
    }
    setCardStatus((prev) => ({ ...prev, [cardId]: "running" }));
    setTimeout(() => {
      const ok = true; // mock 成功
      setCardStatus((prev) => ({ ...prev, [cardId]: ok ? "done" : "failed" }));
      const resultText = ok ? "Token 已刷新，通道连接已恢复正常。" : "修复失败，请手动检查飞书配置。";
      setCardResults((prev) => ({ ...prev, [cardId]: resultText }));

      if (ok) {
        setResultTags((prev) => [...prev, { label: "飞书通道", ok: true }]);
      }

      // 飞书修复完成后，推送第二张卡片（tavily-search）
      if (cardId === "feishu_token") {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              kind: "assistant",
              parts: [
                { type: "text", text: ok ? "飞书通道已成功修复。" : "飞书通道修复失败，建议手动检查。" },
              ],
            },
          ]);
          // 第二张卡片
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                kind: "assistant",
                parts: [
                  { type: "text", text: "对 tavily-search 进程崩溃问题：" },
                  {
                    type: "action_card",
                    card: {
                      id: "tavily_restart",
                      title: "强制重启 tavily-search 技能进程，并重新加载技能配置。",
                      description: "强制重启 tavily-search 技能进程，并重新加载技能配置。",
                      status: null,
                      resultText: undefined,
                    },
                  },
                ],
              },
            ]);
            setRepairQueueIdx(1);
          }, 600);
        }, 400);
      }

      // tavily 修复完成后，进入「等待用户」状态
      if (cardId === "tavily_restart") {
        const tavilyOk = false; // mock 失败
        setResultTags((prev) => [...prev, { label: "tavily-search", ok: tavilyOk }]);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              kind: "assistant",
              parts: [
                { type: "text", text: "以上是自动检测到的问题，已逐项处理完毕。如需进一步排查，可在下方输入框描述问题；或点击「结束诊断」结束本次会话。" },
              ],
            },
          ]);
          setDiagPhase("waiting_user");
        }, 600);
      }
    }, 2000);
  };

  // ─── 取消操作卡片 ────────────────────────────────────────────────────────────────
  const handleCancelAction = (cardId: string) => {
    setCardStatus((prev) => ({ ...prev, [cardId]: "cancelled" }));
    // AI 动态生成的卡片：取消后不做额外操作
    if (cardId.startsWith("ai_action_")) return;
    if (cardId === "feishu_token") {
      setResultTags((prev) => [...prev, { label: "飞书通道", ok: false }]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            kind: "assistant",
            parts: [
              { type: "text", text: "已跳过飞书通道修复。" },
            ],
          },
        ]);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              kind: "assistant",
              parts: [
                { type: "text", text: "对 tavily-search 进程崩溃问题：" },
                {
                  type: "action_card",
                  card: {
                    id: "tavily_restart",
                    title: "强制重启 tavily-search 技能进程，并重新加载技能配置。",
                    description: "强制重启 tavily-search 技能进程，并重新加载技能配置。",
                    status: null,
                    resultText: undefined,
                  },
                },
              ],
            },
          ]);
          setRepairQueueIdx(1);
        }, 600);
      }, 400);
    } else if (cardId === "tavily_restart") {
      setResultTags((prev) => [...prev, { label: "tavily-search", ok: false }]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            kind: "assistant",
            parts: [
              { type: "text", text: "以上是自动检测到的问题，已逐项处理完毕。如需进一步排查，可在下方输入框描述问题；或点击「结束诊断」结束本次会话。" },
            ],
          },
        ]);
        setDiagPhase("waiting_user");
      }, 600);
    }
  };

  // ─── 确认回滚 ────────────────────────────────────────────────────────────────────
  const handleConfirmRollback = (_cardId: string) => {
    setCardStatus((prev) => ({ ...prev, rollback_snapshot: "running" }));
    setTimeout(() => {
      setCardStatus((prev) => ({ ...prev, rollback_snapshot: "done" }));
      setCardResults((prev) => ({ ...prev, rollback_snapshot: "配置已回滚至诊断前快照，OpenClaw 已重启。" }));
      triggerSessionEnd();
    }, 2000);
  };

  // ─── 已解决，结束诊断 ─────────────────────────────────────────────────────────────
  const handleResolvedYes = () => {
    setDiagPhase("destroying");
    triggerSessionEnd();
  };

  // ─── 没有完全解决 ─────────────────────────────────────────────────────────────────
  const handleResolvedNo = () => {
    setDiagPhase("asking_rollback");
    setMessages((prev) => [
      ...prev,
      {
        kind: "assistant",
        parts: [
          { type: "text", text: "好的，是否需要回滚到诊断前的配置快照？这将撤销本次所有修复操作。" },
          {
            type: "action_card",
            card: {
              id: "rollback_snapshot",
              title: "回滚到诊断前快照",
              description: "将配置恢复到诊断开始前的状态，撤销本次所有修复操作。",
              status: null,
              resultText: undefined,
            },
          },
        ],
      },
    ]);
  };

  // ─── 回滚：不需要，直接结束 ───────────────────────────────────────────────────────
  const handleRollbackNo = () => {
    triggerSessionEnd();
  };

  // ─── 用户主动提问后：已解决 ───────────────────────────────────────────────────────
  const handleContinueResolved = () => {
    setDiagPhase("destroying");
    triggerSessionEnd();
  };

  // ─── 用户主动提问后：继续诊断 ─────────────────────────────────────────────────────
  const handleContinueDiag = () => {
    setDiagPhase("waiting_user");
    setMessages((prev) => [
      ...prev,
      { kind: "system", text: "继续诊断中，请描述您的问题" },
    ]);
  };

  // ─── 触发会话结束 ─────────────────────────────────────────────────────────────────
  const triggerSessionEnd = () => {
    setDiagPhase("destroying");
    // 系统提示：正在销毁
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { kind: "system", text: "正在销毁虾医生实例…" },
      ]);
    }, 300);
    // 系统提示：已销毁
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { kind: "system", text: "本次诊断已结束 · 虾医生实例已销毁" },
      ]);
    }, 1500);
    // 汇总消息
    setTimeout(() => {
      setMessages((prev) => {
        const tags = resultTags.length > 0 ? resultTags : [];
        const endMsg: DoctorMsg = {
          kind: "assistant",
          parts: [
            { type: "text", text: "好的，本次诊断结束。" },
            ...(tags.length > 0 ? [{ type: "result_tags" as const, tags }] : []),
            { type: "session_end", card: { dataAuthorized: sessionDataAuth } },
          ],
        };
        // 保存历史记录
        const fixedCount = tags.filter((t) => t.ok).length;
        const totalCount = tags.length;
        const result: HistoryRecord["result"] =
          totalCount === 0 ? "all_ok" :
          fixedCount === totalCount ? "all_fixed" :
          fixedCount > 0 ? "partial" : "failed";
        // 找到本次会话第一条用户消息
        const allMsgs = [...prev, endMsg];
        const firstUser = allMsgs.find((m) => m.kind === "user");
        const firstUserMsg = firstUser && firstUser.kind === "user" ? firstUser.text.slice(0, 30) : undefined;
        const newRecord: HistoryRecord = {
          id: Date.now().toString(),
          time: sessionStartTimeRef.current,
          instanceId,
          instanceName,
          result,
          messages: allMsgs,
          firstUserMsg,
        };
        // 全量记录保存（所有实例），展示时再按实例过滤
        const allHistory = [newRecord, ...loadHistory()].slice(0, 50);
        saveHistory(allHistory);
        setHistoryRecords(allHistory.filter((r) => r.instanceId === instanceId));
        return [...prev, endMsg];
      });
      setDiagPhase("ended");
    }, 2500);
  };

  // ─── AI 对话（用户主动提问）──────────────────────────────────────────────────────
  const callAI = async (userText: string) => {
    setIsTyping(false);
    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 构建上下文
    const history = messages
      .filter((m) => m.kind === "user" || m.kind === "assistant")
      .map((m) => {
        if (m.kind === "user") return { role: "user" as const, content: m.text };
        const text = m.parts.filter((p) => p.type === "text").map((p) => (p as { type: "text"; text: string }).text).join("\n");
        return { role: "assistant" as const, content: text };
      });

    const systemPrompt = `你是龙虾医生，一个专业的 OpenClaw 运维助手。你的职责是帮助用户诊断并修复 OpenClaw 运行问题。

【重要规则，必须严格遵守】
1. 用简洁、友好的中文回复，不超过 150 字
2. 当用户要求执行任何操作（重启服务、修改配置、刷新 Token、重启通道等）时，你必须在回复的最后一行单独输出以下格式，不得省略：
   [ACTION:操作的简短描述]
   示例：[ACTION:重启飞书通道服务] 或 [ACTION:刷新飞书 Bot App Secret Token]
3. 绝对不能说"请确认授权"、"请授权"等文字，也不能要求用户发送"授权"——系统会自动弹出授权按钮
4. 不要在未获授权的情况下声称已执行任何操作
5. 如果用户消息包含"已授权，请执行："，则直接说明已执行并给出结果，不再输出 [ACTION:...]`;

    try {
      // 先插入一条「正在思考」占位消息
      setMessages((prev) => [
        ...prev,
        { kind: "assistant", parts: [{ type: "text", text: "…" }] },
      ]);

      const resp = await fetch("/api/ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: userText },
          ],
          max_tokens: 400,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) throw new Error(`API error ${resp.status}`);

      const data = await resp.json();
      const rawText = data.choices?.[0]?.message?.content ?? "（无回复）";

      // 解析 [ACTION:...] 标记
      const actionMatch = rawText.match(/\[ACTION:([^\]]+)\]/);
      const cleanText = rawText.replace(/\[ACTION:[^\]]+\]/g, "").trim();
      const actionDesc = actionMatch ? actionMatch[1].trim() : null;

      // 用真实回复替换占位消息，如有 ACTION 则追加 action_card
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.kind === "assistant") {
          const parts: DoctorMessageContent[] = [{ type: "text", text: cleanText }];
          if (actionDesc) {
            const cardId = `ai_action_${Date.now()}`;
            parts.push({
              type: "action_card",
              card: {
                id: cardId,
                description: actionDesc,
                status: null,
              },
            });
          }
          updated[updated.length - 1] = { ...last, parts };
        }
        return updated;
      });

      // 用户手动对话时，回复后恢复 waiting_user 状态，不追加「是否解决」
      setDiagPhase("waiting_user");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // 用户暂停，不追加询问
      } else {
        setMessages((prev) => [
          ...prev,
          { kind: "assistant", parts: [{ type: "text", text: "抱歉，我暂时无法回复，请稍后再试。" }] },
        ]);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // ─── 发送消息 ─────────────────────────────────────────────────────────────────────
  const handleSend = () => {
    const text = input.trim();
    if (!text || inputDisabled) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setMessages((prev) => [...prev, { kind: "user", text }]);
    setDiagPhase("waiting_user");
    resetAutoEndTimer();
    callAI(text);
  };

  // ─── 暂停 AI 输出 ─────────────────────────────────────────────────────────────────
  const handleStopStreaming = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  // ─── 数据授权 ─────────────────────────────────────────────────────────────────────
  const saveDataAuth = (val: boolean) => {
    setPersistDataAuth(val);
    setSessionDataAuth(val);
    localStorage.setItem(getDataAuthKey(instanceId), String(val));
  };

  // ─── 渲染单条消息 ─────────────────────────────────────────────────────────────────
  const renderMsg = (msg: DoctorMsg, idx: number, readonly = false) => {
    if (msg.kind === "system") {
      return (
        <div key={idx} className="flex justify-center">
          <span className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-400">{msg.text}</span>
        </div>
      );
    }
    if (msg.kind === "user") {
      return (
        <div key={idx} className="flex justify-end">
          <div className="max-w-[75%] px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
            {msg.text}
          </div>
        </div>
      );
    }
    // assistant
    const thumb = thumbs[idx] ?? null;
    return (
      <div key={idx} className="flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm leading-relaxed text-gray-800 py-1">
            {msg.parts.map((part, pi) => {
              if (part.type === "text") return <p key={pi} className={pi > 0 ? "mt-2" : ""}>{part.text}</p>;
              if (part.type === "check_list") return <CheckList key={pi} items={part.items} />;
              if (part.type === "action_card") {
                const status = readonly ? part.card.status : (cardStatus[part.card.id] ?? null);
                const resultText = readonly ? part.card.resultText : (cardResults[part.card.id] ?? undefined);
                const confirmFn = part.card.id === "rollback_snapshot" ? handleConfirmRollback : handleConfirmAction;
                return (
                  <ActionCardView
                    key={pi}
                    card={{ ...part.card, status, resultText }}
                    onConfirm={confirmFn}
                    onCancel={part.card.id === "rollback_snapshot"
                      ? () => { setCardStatus((prev) => ({ ...prev, rollback_snapshot: "cancelled" })); triggerSessionEnd(); }
                      : handleCancelAction
                    }
                    readonly={readonly || diagPhase === "ended"}
                  />
                );
              }
              if (part.type === "result_tags") return <ResultTags key={pi} tags={part.tags} />;
              if (part.type === "end_ask_resolved") {
                // 已移除「已解决/没有完全解决」选项，直接不渲染
                return null;
              }
              if (part.type === "end_ask_rollback") {
                if (readonly) return null;
                if (diagPhase !== "asking_rollback") return null;
                return (
                  <div key={pi} className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleConfirmRollback("rollback_snapshot")}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-white border border-red-300 hover:bg-red-50 transition-colors"
                    >
                      回滚到诊断前快照
                    </button>
                    <button
                      onClick={handleRollbackNo}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      不需要，直接结束
                    </button>
                  </div>
                );
              }
              if (part.type === "end_ask_continue") {
                // 已移除「已解决」选项，直接不渲染
                return null;
              }
              if (part.type === "snapshot_confirm") {
                if (readonly) return null;
                if (diagPhase !== "asking_snapshot") return null;
                return (
                  <div key={pi} className="flex gap-2 mt-3">
                    <button
                      onClick={handleSnapshotConfirm}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                    >
                      同意，创建快照并开始修复
                    </button>
                    <button
                      onClick={handleSnapshotCancel}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      取消修复
                    </button>
                  </div>
                );
              }
              if (part.type === "session_end") {
                // 数据授权已合并进首次授权弹窗，此处不再单独展示
                return null;
              }
              return null;
            })}
          </div>
          {/* 点赞/点踩已移除 */}
        </div>
      </div>
    );
  };

  const isReadonly = viewMode === "history_detail";
  const displayMessages = (viewMode === "history_detail" && selectedHistory) ? selectedHistory.messages : messages;

  // 输入框状态控制
  const inputDisabled = isReadonly || isTyping || diagPhase === "ended" || diagPhase === "idle" || diagPhase === "destroying";
  const inputPlaceholder =
    diagPhase === "idle" ? "点击「开始诊断」开始" :
    diagPhase === "ended" ? "本次诊断已结束，点击「再次诊断」开始新会话" :
    isReadonly ? "历史记录（只读）" :
    "向虾医生提问，或描述您遇到的问题…";
  const inputHint =
    isReadonly ? "历史记录（只读）" :
    diagPhase === "ended" ? "本次诊断已结束" :
    diagPhase === "idle" ? "" :
    "诊断中，您可随时向虾医生提问";

  // 「开始/结束/再次诊断」按钮文字和状态
  const diagBtnLabel =
    diagPhase === "idle" ? "🩺 开始诊断" :
    diagPhase === "ended" ? "🩺 再次诊断" :
    diagPhase === "initializing" ? "⏳ 初始化中…" :
    "🩺 结束诊断";
  const diagBtnAction =
    (diagPhase === "idle" || diagPhase === "ended") ? handleStartDiagnosis :
    diagPhase === "initializing" ? (() => {}) : handleEndDiagnosis;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 relative"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      {/* ─── 首次诊断授权弹窗 ─── */}
      <Dialog open={showDiagAuthModal} onOpenChange={(open) => { if (!open) setShowDiagAuthModal(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">诊断前授权确认</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-700 font-medium">龙虾医生将：</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-gray-400 flex-shrink-0">·</span>
                <span>创建一只临时龙虾，对您的 OpenClaw 进行检测和修复</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-gray-400 flex-shrink-0">·</span>
                <span>将诊断记录授权给平台，持续优化龙虾医生能力</span>
              </li>
            </ul>
            <p className="text-xs text-gray-400">初始化约需 1-2 分钟，请稍作等待。</p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              className="bg-gray-900 text-white hover:bg-gray-700 text-sm h-9 px-5"
              onClick={handleDiagAuthConfirm}
            >
              同意
            </Button>
            <Button
              variant="outline"
              className="text-sm h-9 px-5"
              onClick={() => setShowDiagAuthModal(false)}
            >
              取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 标题栏 */}
      <div className="px-6 pt-5 pb-0">
        <h2 className="text-base font-semibold text-gray-900">龙虾医生</h2>
      </div>

      {/* 副标题 + 按钮行 */}
      <div className="px-6 pt-3 pb-4">
        <p className="text-sm text-gray-500 mb-3">AI 智能诊断，帮助您发现并修复 OpenClaw 运行问题</p>
        <div className="flex items-center gap-2">
          {/* 开始/再次诊断：只在 idle/ended 状态显示（active 时按鈕已移到对话区底部） */}
          {viewMode !== "history_detail" && (diagPhase === "idle" || diagPhase === "ended") && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-sm h-8 px-4"
              onClick={diagBtnAction}
              disabled={false}
            >
              {diagBtnLabel}
            </Button>
          )}
          {/* 返回历史：次要按钮 */}
          {viewMode === "history_detail" && (
            <Button
              variant="outline"
              size="sm"
              className="text-sm h-8 px-3"
              onClick={() => setViewMode("history_list")}
            >
              ← 返回历史
            </Button>
          )}
          {/* 历史记录：次要按钮 */}
          {viewMode !== "history_detail" && (
            <Button
              variant="outline"
              size="sm"
              className="text-sm h-8 px-3"
              onClick={() =>
                setViewMode((v) =>
                  v === "history_list" ? (diagPhase === "ended" || diagPhase === "idle" ? "idle" : "active") : "history_list"
                )
              }
            >
              {viewMode === "history_list" ? "关闭历史" : "历史记录"}
            </Button>
          )}
        </div>
      </div>

      {/* ─── 状态 A：空态 ─── */}
      {viewMode === "idle" && (
        <div className="px-6 pb-8">
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-6 gap-1.5">
            <p className="text-sm font-medium text-gray-600">龙虾医生待命中</p>
            <p className="text-xs text-gray-400">点击「开始诊断」后，将为您开启一只龙虾医生，通过它对当前 OpenClaw 进行全面检测和对话式修复，龙虾医生初始化约需 1-2 分钟。</p>
          </div>
        </div>
      )}

      {/* ─── 状态 B：历史记录列表 ─── */}
      {viewMode === "history_list" && (
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500">历史诊断记录</p>
          </div>
          {historyRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-10 gap-2">
              <p className="text-sm text-gray-500">暂无历史诊断记录</p>
              <p className="text-xs text-gray-400">完成一次诊断后，记录会自动保存在这里</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
              {historyRecords.map((rec) => {
                return (
                  <div key={rec.id} className="flex items-center group">
                    <button
                      onClick={() => { setSelectedHistory(rec); setViewMode("history_detail"); }}
                      className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <p className="text-sm text-gray-700 truncate flex-1 min-w-0 pr-4">{rec.firstUserMsg ?? "全面检测"}</p>
                      <p className="text-xs text-gray-400 flex-shrink-0">{rec.time}</p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = historyRecords.filter((r) => r.id !== rec.id);
                        saveHistory(updated);
                        setHistoryRecords(updated);
                      }}
                      className="px-3 py-3 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="删除此记录"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── 状态 B 只读 + 状态 C 活跃对话 ─── */}
      {(viewMode === "active" || viewMode === "history_detail") && (
        <>
          {/* 历史模式顶部提示条 */}
          {isReadonly && selectedHistory && (
            <div className="mx-6 mb-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-400">
              {selectedHistory.time} · 历史诊断记录（只读）
            </div>
          )}

          {/* 消息列表 */}
          <div
            className="overflow-y-auto px-6 space-y-4 pb-2 pt-2"
            style={{ minHeight: "300px", maxHeight: "440px" }}
          >
            {displayMessages.map((msg, idx) => renderMsg(msg, idx, isReadonly))}
            {isTyping && <TypingBubble />}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 — 参考图样式：底部独立大圆角卡片 */}
          <div className="px-5 pb-5 pt-2">
            <div
              className={`rounded-2xl border bg-white transition-colors ${
                inputDisabled
                  ? "border-gray-100 opacity-60"
                  : "border-gray-200 focus-within:border-gray-300"
              }`}
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              {/* 文本输入区 */}
              <textarea
                ref={textareaRef}
                value={input}
                rows={1}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isStreaming && !inputDisabled) handleSend();
                  }
                }}
                placeholder={inputPlaceholder}
                disabled={inputDisabled}
                className="w-full px-4 pt-3 pb-1 text-sm bg-transparent focus:outline-none disabled:cursor-not-allowed resize-none overflow-hidden leading-relaxed text-gray-800 placeholder:text-gray-400"
                style={{ minHeight: "44px" }}
              />
              {/* 底部工具栏 */}
              <div className="relative flex items-center justify-between px-3 pb-2.5 pt-1">
                {/* 左侧：+ 按鈕 + 指令库按鈕 */}
                <div className="flex items-center gap-1">
                  {/* + 按鈕 */}
                  <button
                    disabled={inputDisabled}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="附件"
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="2" x2="8" y2="14" />
                      <line x1="2" y1="8" x2="14" y2="8" />
                    </svg>
                  </button>
                  {/* 指令库按鈕 */}
                  <div className="relative">
                    <button
                      disabled={inputDisabled}
                      onClick={() => setShowCommandMenu((v) => !v)}
                      className="flex items-center gap-1 px-2.5 h-7 rounded-full border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      {/* 星形图标 */}
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M6 0l1.2 3.8H11l-3.1 2.3 1.2 3.8L6 7.6l-3.1 2.3 1.2-3.8L1 3.8h3.8z" />
                      </svg>
                      指令库
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2.5 4l2.5 2.5L7.5 4" />
                      </svg>
                    </button>
                    {/* 指令库下拉浮层 */}
                    {showCommandMenu && (
                      <div
                        className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-20"
                        onMouseLeave={() => setShowCommandMenu(false)}
                      >
                        {[
                          { cmd: "/new", desc: "新建会话" },
                          { cmd: "/compact", desc: "压缩上下文" },
                          { cmd: "/status", desc: "查看状态" },
                          { cmd: "/stop", desc: "停止当前任务" },
                          { cmd: "/commands", desc: "全部指令" },
                        ].map(({ cmd, desc }) => (
                          <button
                            key={cmd}
                            onClick={() => {
                              setInput(cmd + " ");
                              setShowCommandMenu(false);
                              textareaRef.current?.focus();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left whitespace-nowrap"
                          >
                            <span className="font-mono text-gray-700 flex-shrink-0">{cmd}</span>
                            <span className="text-gray-400">{desc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* 右侧：发送按鈕 */}
                <div className="flex items-center gap-2">
                  {/* 发送/暂停按鈕 */}
                  {isStreaming ? (
                    <button
                      onClick={handleStopStreaming}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                      title="暂停输出"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                        <rect x="2" y="1.5" width="3" height="9" rx="1" />
                        <rect x="7" y="1.5" width="3" height="9" rx="1" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={inputDisabled || !input.trim()}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="发送（Enter）"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M7 12V2M7 2L3 6M7 2L11 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* 结束诊断按钮（对话框外部，次要按钮样式） */}
            {viewMode === "active" && diagPhase !== "idle" && diagPhase !== "ended" && (
              <div className="flex justify-end mt-2 px-1">
                <button
                  onClick={diagBtnAction}
                  disabled={diagPhase === "destroying" || diagPhase === "initializing"}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {diagPhase === "initializing" ? "初始化中…" : "结束诊断"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
