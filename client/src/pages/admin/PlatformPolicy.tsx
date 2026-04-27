/**
 * PlatformPolicy - 平台策略页面
 * 基础信息 → 平台策略
 * 包含：用户配额 / 模型配额 / 功能权限开关
 * 风格：与管控端其他页面保持一致（白色卡片、浅色边框、圆角）
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, Pencil, Check, X, Terminal, Monitor, Loader2, Cpu, Stethoscope, HelpCircle, Cloud, Info, MessageSquare, Brain, Cable, BarChart3, MessagesSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── 类型 ────────────────────────────────────────────────────────────────────

type TokenLimit = number | "unlimited"; // -1 或 "unlimited" 表示无限制

// 网络管理页默认安全组的本地快照（用于平台策略读/补规则）
type SnapshotInboundRule = {
  id: string;
  source: string;
  protocol: string;
  port: string;
  policy: string;
  remark?: string;
};

type DefaultSecurityGroupSnapshot = {
  id?: string;
  name?: string;
  inboundRules: SnapshotInboundRule[];
};

// 端口/协议覆盖判断：判断某条规则的端口字段是否覆盖指定目标端口
// 支持："ALL" / "80,443,6080" / "6000-7000" / "6080"
function doesPortCoverTarget(port: string, target: number): boolean {
  const trimmed = (port || "").trim();
  if (!trimmed) return false;
  if (trimmed.toUpperCase() === "ALL") return true;
  if (trimmed.includes(",")) {
    return trimmed.split(",").some((p) => doesPortCoverTarget(p, target));
  }
  if (trimmed.includes("-")) {
    const [s, e] = trimmed.split("-").map((x) => Number(x.trim()));
    if (Number.isFinite(s) && Number.isFinite(e)) {
      return s <= target && target <= e;
    }
    return false;
  }
  return Number(trimmed) === target;
}

// 判断一条入方向规则是否放通了目标端口（源 0.0.0.0/0、策略允许、TCP/ALL）
function isInboundRuleCoverPort(rule: SnapshotInboundRule, target: number): boolean {
  if (!rule) return false;
  if (rule.source !== "0.0.0.0/0") return false;
  if (rule.policy !== "允许") return false;
  const proto = (rule.protocol || "").toUpperCase();
  if (proto !== "TCP" && proto !== "ALL") return false;
  return doesPortCoverTarget(rule.port, target);
}

// 云端浏览器所需 6080 放通
const CLOUD_BROWSER_REQUIRED_PORT = 6080;
function isCloudBrowserInboundRule(rule: SnapshotInboundRule): boolean {
  return isInboundRuleCoverPort(rule, CLOUD_BROWSER_REQUIRED_PORT);
}

// ─── 子组件：应用范围指示器（带 Popover 编辑） ─────────────────────────────────

function ScopeIndicator({ groupTooltip = "按分组设置不同配额 — 即将开放" }: { groupTooltip?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400">应用范围</span>
      <span className="badge-loading whitespace-nowrap">全部用户</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="text-gray-300 hover:text-blue-500 transition-colors"
            title="编辑应用范围"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start" sideOffset={6}>
          <div className="px-3.5 pt-3.5 pb-2.5 space-y-2.5">
            <div className="flex gap-1.5">
              <button className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors border-blue-200 bg-blue-50 text-blue-600">
                全部用户
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors border-gray-200 bg-white text-gray-300 cursor-not-allowed">
                    按分组
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[220px]">
                  {groupTooltip}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-gray-100">
            <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => { setOpen(false); toast.success("应用范围已更新"); }}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              确认
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── 子组件：访问方式指示器（带 Popover 编辑） ─────────────────────────────────

function AccessModeIndicator({ mode, onSave }: { mode: "public" | "private"; onSave: (m: "public" | "private") => void }) {
  const [open, setOpen] = useState(false);
  const [draftMode, setDraftMode] = useState(mode);

  const handleOpenChange = (v: boolean) => {
    if (v) setDraftMode(mode);
    setOpen(v);
  };

  const handleConfirm = () => {
    onSave(draftMode);
    setOpen(false);
    toast.success(draftMode === "public" ? "已切换为公网访问" : "已切换为私网访问");
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400">访问方式</span>
      <span className="badge-shutdown whitespace-nowrap">
        {mode === "public" ? "公网访问" : "私网访问"}
      </span>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className="text-gray-300 hover:text-blue-500 transition-colors"
            title="编辑访问方式"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start" sideOffset={6}>
          <div className="px-3.5 pt-3.5 pb-2.5 space-y-2.5">
            <div className="flex gap-1.5">
              <button
                onClick={() => setDraftMode("public")}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  draftMode === "public"
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                公网访问
              </button>
              <button
                onClick={() => setDraftMode("private")}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  draftMode === "private"
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                私网访问
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-gray-100">
            <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              onClick={handleConfirm}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              确认
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default">
            <Info className="w-3 h-3 text-gray-400" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[320px] leading-relaxed">
          <p className="mb-1.5"><span className="font-medium">公网访问：</span>用户通过公网直接访问 Agent 面板（WebUI），连接云服务器公网 IP。适用于大多数场景，推荐选择。</p>
          <p><span className="font-medium">私网访问：</span>用户通过同一私有网络访问 Agent 面板（WebUI），连接云服务器内网 IP。使用前需先自行将企业内网与腾讯云私有网络（VPC）打通，并在「网络管理」中将云服务器绑定至该 VPC。配置完成后，企业用户可通过企业内网访问面板，但无法通过公网访问。</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// ─── 子组件：配额卡片 ─────────────────────────────────────────────────────────

interface QuotaCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  value: TokenLimit | number;
  onSave: (v: TokenLimit | number) => void;
  type: "integer" | "token"; // integer: 0-999 整数; token: >=0 或无限制
}

function QuotaCard({ icon, iconBg, title, description, value, onSave, type }: QuotaCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TokenLimit | number>(value);
  const [inputStr, setInputStr] = useState(value === "unlimited" ? "" : String(value));

  const displayValue = () => {
    if (value === "unlimited" || value === -1) {
      return <span className="text-gray-700 font-medium">无限制</span>;
    }
    return <span className="text-gray-700 font-medium">{Number(value).toLocaleString()}</span>;
  };

  const handleEdit = () => {
    setDraft(value);
    setInputStr(value === "unlimited" || value === -1 ? "" : String(value));
    setEditing(true);
  };

  const handleSave = () => {
    if (type === "integer") {
      const n = parseInt(inputStr, 10);
      if (isNaN(n) || n < 0 || n > 999) {
        toast.error("请输入 0-999 之间的整数");
        return;
      }
      onSave(n);
    } else {
      // token type
      if (draft === "unlimited") {
        onSave("unlimited");
      } else {
        const n = parseInt(inputStr, 10);
        if (isNaN(n) || n < 0) {
          toast.error("请输入大于等于 0 的整数");
          return;
        }
        onSave(n);
      }
    }
    setEditing(false);
    toast.success(`${title}已保存`);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft(value);
    setInputStr(value === "unlimited" || value === -1 ? "" : String(value));
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      {/* 卡片头部 */}
      <div className="flex items-center gap-3 mb-1.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      {/* 描述文字 */}
      <p className="text-xs text-gray-400 mb-3 leading-relaxed">{description}</p>

      {/* 分隔线 */}
      <div className="border-t border-gray-100 mb-3" />

      {/* 应用范围 */}
      <div className="mb-3">
        <ScopeIndicator />
      </div>

      {/* 值展示 / 编辑区 */}
      {!editing ? (
        <div className="flex items-center justify-between">
          <div className="text-sm">{displayValue()}</div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            编辑
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* token 类型：无限制 / 自定义 切换按钮 */}
          {type === "token" && (
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => { setDraft("unlimited"); setInputStr(""); }}
                className={`text-xs py-1 px-2.5 rounded-md border transition-colors ${
                  draft === "unlimited"
                    ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                无限制
              </button>
              <button
                onClick={() => { setDraft(0); setInputStr(inputStr || "0"); }}
                className={`text-xs py-1 px-2.5 rounded-md border transition-colors ${
                  draft !== "unlimited"
                    ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                自定义
              </button>
            </div>
          )}
          {/* 数字输入框：integer 类型始终显示；token 类型仅在「自定义」时显示 */}
          {(type === "integer" || draft !== "unlimited") && (
            <Input
              type="number"
              value={inputStr}
              min={0}
              max={type === "integer" ? 999 : undefined}
              onChange={(e) => {
                setInputStr(e.target.value);
                setDraft(Number(e.target.value));
              }}
              className="bg-gray-50 border-gray-200 text-sm h-8 min-w-0 flex-1"
              placeholder={type === "integer" ? "0-999" : "请输入数量"}
              autoFocus
            />
          )}
          {/* 占位：token 且无限制时，让右侧按钮靠右 */}
          {type === "token" && draft === "unlimited" && (
            <div className="flex-1" />
          )}
          {/* 取消 / 保存 */}
          <div className="flex gap-1 shrink-0">
            <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
              <X className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 子组件：功能开关卡片（方形，与配额卡片一致） ─────────────────────────────

interface ToggleCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  checked: boolean;
  loading?: boolean;
  /** 加载中提示文案，默认「配置中，请勿关闭」。标题较长的卡片可传更短的文案避免标题被挤换行。 */
  loadingLabel?: string;
  onToggle: (v: boolean) => void;
  afterScope?: React.ReactNode;
  extraContent?: React.ReactNode;
}

function ToggleCard({ icon, iconBg, title, description, checked, loading, loadingLabel, onToggle, afterScope, extraContent }: ToggleCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      {/* 卡片头部：icon + 标题 + 开关 */}
      <div className="flex items-center gap-3 mb-1.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 flex-1">{title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          {loading && (
            <div className="flex items-center gap-1.5">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-xs text-blue-500 font-medium whitespace-nowrap">{loadingLabel ?? "配置中，请勿关闭"}</span>
            </div>
          )}
          <Switch
            checked={checked}
            disabled={loading}
            onCheckedChange={onToggle}
          />
        </div>
      </div>

      {/* 描述文字 */}
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>

      {/* 分隔线 + 应用范围 */}
      <div className="mt-3 border-t border-gray-100 pt-3 space-y-2.5">
        <ScopeIndicator groupTooltip="按分组设置功能权限 — 即将开放" />
        {afterScope}
      </div>

      {/* 额外内容（如端口信息） */}
      {extraContent && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          {extraContent}
        </div>
      )}
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export default function PlatformPolicy() {
  const [, navigate] = useLocation();

  // ── 用户配额状态 ──
  const [clawLimit, setClawLimit] = useState<number>(() => {
    const v = localStorage.getItem("policy_claw_limit");
    return v !== null ? Number(v) : 3;
  });
  const [tokenLimit, setTokenLimit] = useState<TokenLimit>(() => {
    const mode = localStorage.getItem("policy_token_limit_mode");
    if (mode === "unlimited") return "unlimited";
    const v = localStorage.getItem("policy_token_limit");
    return v !== null ? Number(v) : 500000;
  });

  // ── 模型配额状态 ──
  const [globalTokenLimit, setGlobalTokenLimit] = useState<TokenLimit>(() => {
    const mode = localStorage.getItem("globalLimitMode");
    if (mode === "unlimited") return "unlimited";
    const v = localStorage.getItem("globalLimit");
    return v !== null ? Number(v) : 1000000;
  });

  // ── 功能权限开关状态 ──
  const [allowUserConfigModel, setAllowUserConfigModel] = useState(() => {
    const v = localStorage.getItem("admin_allow_user_config_model");
    return v !== null ? v === "true" : true; // 默认开启
  });
  const [allowUserConfigChannel, setAllowUserConfigChannel] = useState(() => {
    const v = localStorage.getItem("admin_allow_user_config_channel");
    return v !== null ? v === "true" : true; // 默认开启
  });
  const [allowCustomModel, setAllowCustomModel] = useState(() => {
    return localStorage.getItem("admin_allow_custom_model") === "true";
  });
  const [allowTerminal, setAllowTerminal] = useState(() => {
    return localStorage.getItem("admin_allow_terminal") === "true";
  });
  const [panelAccessMode, setPanelAccessMode] = useState<"public" | "private">(() => {
    return (localStorage.getItem("admin_panel_access_mode") as "public" | "private") || "public";
  });
  const [allowPanelAccess, setAllowPanelAccess] = useState(() => {
    return localStorage.getItem("admin_allow_panel_access") === "true";
  });
  const [panelPort, setPanelPort] = useState<string | null>(() => {
    return localStorage.getItem("admin_panel_port");
  });
  const [panelAccessLoading, setPanelAccessLoading] = useState(false);
  // 本次自动追加的 面板端口 放通规则 id（用于在卡片内展示"已自动添加"提示）
  const [panelSgRuleId, setPanelSgRuleId] = useState<string | null>(() => {
    return localStorage.getItem("admin_panel_sg_rule_id");
  });

  // ── 云端浏览器开关状态 ──
  const [allowCloudBrowser, setAllowCloudBrowser] = useState(() => {
    return localStorage.getItem("admin_allow_cloud_browser") === "true";
  });
  // 本次自动追加的 6080 放通规则 id（用于在卡片内展示"已自动添加"提示）
  const [cloudBrowserSgRuleId, setCloudBrowserSgRuleId] = useState<string | null>(() => {
    return localStorage.getItem("admin_cloud_browser_sg_rule_id");
  });
  const [cloudBrowserLoading, setCloudBrowserLoading] = useState(false);

  // ── 对话视图开关状态 ──
  const [allowChatView, setAllowChatView] = useState(() => {
    const v = localStorage.getItem("admin_allow_chat_view");
    return v !== null ? v === "true" : true; // 默认开启
  });

  // ── 龙虾医生开关状态 ──
  const [allowLobsterDoctor, setAllowLobsterDoctor] = useState(() => {
    return localStorage.getItem("admin_allow_lobster_doctor") === "true";
  });
  const [showLobsterDoctorDialog, setShowLobsterDoctorDialog] = useState(false);

  // ── 模型额度页面可见性开关状态 ──
  const [allowModelQuota, setAllowModelQuota] = useState(() => {
    const v = localStorage.getItem("admin_allow_model_quota");
    return v !== null ? v === "true" : true; // 默认开启
  });

  // ── 保存处理 ──
  const handleSaveClawLimit = (v: TokenLimit | number) => {
    const n = Number(v);
    setClawLimit(n);
    localStorage.setItem("policy_claw_limit", String(n));
  };

  const handleSaveTokenLimit = (v: TokenLimit | number) => {
    setTokenLimit(v);
    if (v === "unlimited") {
      localStorage.setItem("policy_token_limit_mode", "unlimited");
    } else {
      localStorage.setItem("policy_token_limit_mode", "custom");
      localStorage.setItem("policy_token_limit", String(v));
    }
  };

  const handleSaveGlobalTokenLimit = (v: TokenLimit | number) => {
    setGlobalTokenLimit(v);
    if (v === "unlimited") {
      localStorage.setItem("globalLimitMode", "unlimited");
      window.dispatchEvent(new StorageEvent("storage", { key: "globalLimitMode", newValue: "unlimited", storageArea: localStorage }));
    } else {
      localStorage.setItem("globalLimitMode", "custom");
      localStorage.setItem("globalLimit", String(v));
      window.dispatchEvent(new StorageEvent("storage", { key: "globalLimitMode", newValue: "custom", storageArea: localStorage }));
    }
  };

  const handleToggleUserConfigModel = (v: boolean) => {
    setAllowUserConfigModel(v);
    localStorage.setItem("admin_allow_user_config_model", String(v));
    toast.success(v ? "已允许用户配置模型" : "已禁止用户配置模型");
  };

  const handleToggleUserConfigChannel = (v: boolean) => {
    setAllowUserConfigChannel(v);
    localStorage.setItem("admin_allow_user_config_channel", String(v));
    toast.success(v ? "已允许用户配置通道" : "已禁止用户配置通道");
  };

  const handleToggleModelQuota = (v: boolean) => {
    setAllowModelQuota(v);
    localStorage.setItem("admin_allow_model_quota", String(v));
    toast.success(v ? "已允许用户查看模型额度" : "已隐藏模型额度页面");
  };

  const handleToggleCustomModel = (v: boolean) => {
    setAllowCustomModel(v);
    localStorage.setItem("admin_allow_custom_model", String(v));
    toast.success(v ? "已允许用户添加自定义模型" : "已禁止用户添加自定义模型");
  };

  const handleToggleTerminal = (v: boolean) => {
    setAllowTerminal(v);
    localStorage.setItem("admin_allow_terminal", String(v));
    toast.success(v ? "已允许用户进入终端" : "已禁止用户进入终端");
  };

  const handleTogglePanelAccess = (v: boolean) => {
    if (v) {
      // 前置校验：没有默认安全组时阻止开启（与「允许用户访问 Agent 云端浏览器」一致）
      const snapshotRaw = localStorage.getItem("admin_default_security_group_snapshot");
      let snapshot: DefaultSecurityGroupSnapshot | null = null;
      if (snapshotRaw) {
        try {
          snapshot = JSON.parse(snapshotRaw) as DefaultSecurityGroupSnapshot;
        } catch {
          snapshot = null;
        }
      }
      if (!snapshot || !Array.isArray(snapshot.inboundRules)) {
        toast.error("请先前往网络管理配置 ClawPro 的安全组，再开启该功能");
        return;
      }

      setPanelAccessLoading(true);
      setTimeout(() => {
        const randomPort = String(Math.floor(Math.random() * 1000) + 9000);
        const portNum = Number(randomPort);

        // 若快照内已有覆盖该端口的放通规则，则不重复添加；否则追加一条并记录 id
        const hasCovered = snapshot!.inboundRules.some((r) =>
          isInboundRuleCoverPort(r, portNum),
        );
        if (!hasCovered) {
          const newRule: SnapshotInboundRule = {
            id: `panel-${Date.now()}`,
            source: "0.0.0.0/0",
            protocol: "TCP",
            port: randomPort,
            policy: "允许",
            remark: "Agent 面板访问",
          };
          const nextSnapshot: DefaultSecurityGroupSnapshot = {
            ...snapshot!,
            inboundRules: [...snapshot!.inboundRules, newRule],
          };
          localStorage.setItem(
            "admin_default_security_group_snapshot",
            JSON.stringify(nextSnapshot),
          );
          localStorage.setItem("admin_panel_sg_rule_id", newRule.id);
          setPanelSgRuleId(newRule.id);
        } else {
          // 已有覆盖规则：清除"自动添加"标记
          localStorage.removeItem("admin_panel_sg_rule_id");
          setPanelSgRuleId(null);
        }

        setAllowPanelAccess(true);
        setPanelPort(randomPort);
        localStorage.setItem("admin_allow_panel_access", "true");
        localStorage.setItem("admin_panel_port", randomPort);
        setPanelAccessLoading(false);
        toast.success("已开启用户端访问 Agent 面板");
      }, 3000);
    } else {
      setAllowPanelAccess(false);
      setPanelPort(null);
      localStorage.setItem("admin_allow_panel_access", "false");
      localStorage.removeItem("admin_panel_port");
      // 关闭时清掉"自动添加"标记（规则保留在安全组中，与云端浏览器行为一致）
      localStorage.removeItem("admin_panel_sg_rule_id");
      setPanelSgRuleId(null);
      toast.success("已禁止用户端访问 Agent 面板");
    }
  };

  const handleToggleChatView = (v: boolean) => {
    setAllowChatView(v);
    localStorage.setItem("admin_allow_chat_view", String(v));
    toast.success(v ? "已允许用户使用对话视图" : "已关闭对话视图");
  };

  const handleToggleCloudBrowser = (v: boolean) => {
    if (!v) {
      setAllowCloudBrowser(false);
      localStorage.setItem("admin_allow_cloud_browser", "false");
      toast.success("已关闭 Agent 云端浏览器");
      return;
    }

    // 读取默认安全组快照（由网络管理页同步写入的镜像；未配置时为 null）
    const snapshotRaw = localStorage.getItem("admin_default_security_group_snapshot");
    let snapshot: DefaultSecurityGroupSnapshot | null = null;
    if (snapshotRaw) {
      try {
        snapshot = JSON.parse(snapshotRaw) as DefaultSecurityGroupSnapshot;
      } catch {
        snapshot = null;
      }
    }

    // 无安全组：阻止开启（快速失败，不进入 loading）
    if (!snapshot || !Array.isArray(snapshot.inboundRules)) {
      toast.error("请先前往网络管理配置 ClawPro 的安全组，再开启该功能");
      return;
    }

    // 进入等待态：模拟后端下发规则/生效过程，与「允许用户访问 Agent 面板」保持一致
    setCloudBrowserLoading(true);
    setTimeout(() => {
      const hasCovered = snapshot!.inboundRules.some(isCloudBrowserInboundRule);
      if (!hasCovered) {
        // 自动追加一条 6080 放通规则
        const newRule: SnapshotInboundRule = {
          id: `cb-${Date.now()}`,
          source: "0.0.0.0/0",
          protocol: "TCP",
          port: "6080",
          policy: "允许",
          remark: "云端浏览器访问",
        };
        const nextSnapshot: DefaultSecurityGroupSnapshot = {
          ...snapshot!,
          inboundRules: [...snapshot!.inboundRules, newRule],
        };
        localStorage.setItem(
          "admin_default_security_group_snapshot",
          JSON.stringify(nextSnapshot),
        );
        localStorage.setItem("admin_cloud_browser_sg_rule_id", newRule.id);
        setCloudBrowserSgRuleId(newRule.id);
      } else {
        // 已有覆盖规则：清除"自动添加"标记，避免误展示提示条
        localStorage.removeItem("admin_cloud_browser_sg_rule_id");
        setCloudBrowserSgRuleId(null);
      }

      setAllowCloudBrowser(true);
      localStorage.setItem("admin_allow_cloud_browser", "true");
      setCloudBrowserLoading(false);
      toast.success("已开启 Agent 云端浏览器");
    }, 3000);
  };

  const handleToggleLobsterDoctor = (v: boolean) => {
    setAllowLobsterDoctor(v);
    localStorage.setItem("admin_allow_lobster_doctor", String(v));
    toast.success(v ? "已允许用户使用龙虾医生" : "已关闭龙虾医生功能");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">平台策略</h1>
        <p className="text-sm text-gray-500 mt-1">管理平台默认配额、全局限制和功能权限开关</p>
      </div>

      {/* ── 板块一：用户配额 ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">用户配额</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuotaCard
            icon={<Zap className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            title="单用户 Agent 数量上限"
            description="单用户最多可以创建的 Agent 数量，新用户创建时自动应用此默认值，可在用户管理中对单个用户单独调整"
            value={clawLimit}
            onSave={handleSaveClawLimit}
            type="integer"
          />
          <QuotaCard
            icon={<Zap className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            title="单用户每日 Tokens 上限"
            description="单用户每日最多可消耗的 Tokens 数量，新用户创建时自动应用此默认值，可在用户管理中对单个用户单独调整"
            value={tokenLimit}
            onSave={handleSaveTokenLimit}
            type="token"
          />
        </div>
      </section>

      {/* ── 板块二：模型配额 ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">模型配额</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuotaCard
            icon={<Zap className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
            title="每日全局 Tokens 上限"
            description="全局 Tokens 指所有企业用户使用所有模型所消耗的总 Tokens 数量，达到上限后当日将暂停服务"
            value={globalTokenLimit}
            onSave={handleSaveGlobalTokenLimit}
            type="token"
          />
        </div>
      </section>

      {/* ── 板块三：功能权限开关 ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">功能权限开关</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="self-start">
            <ToggleCard
              icon={<Brain className="w-4 h-4 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-green-600"
              title="允许用户配置模型"
              description="开启后，用户可在 Agent 详细配置中自行选择和切换模型。关闭后，模型配置区域将锁定，用户无法调整（适用于管理员已统一预配置模型的场景）"
              checked={allowUserConfigModel}
              onToggle={handleToggleUserConfigModel}
            />
          </div>
          <div className="self-start">
            <ToggleCard
              icon={<MessageSquare className="w-4 h-4 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-green-600"
              title="允许用户配置通道"
              description="开启后，用户可在 Agent 详细配置中自行添加和管理通道。关闭后，通道配置区域将锁定，用户无法调整（适用于管理员已统一预配置通道的场景）"
              checked={allowUserConfigChannel}
              onToggle={handleToggleUserConfigChannel}
            />
          </div>
          <div className="self-start">
            <ToggleCard
              icon={<Cpu className="w-4 h-4 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-green-600"
              title="允许用户添加自定义模型"
              description="开启后，用户可在 Agent 中自行添加自定义模型，不在企业管控和 Tokens 覆盖范围内（注意需要先开启「允许用户配置模型」）"
              checked={allowCustomModel}
              onToggle={handleToggleCustomModel}
            />
          </div>
          <ToggleCard
            icon={<Terminal className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
            title="允许用户进入 Agent 终端"
            description="开启后，所有用户在用户端可看到「进入终端」选项，进入对应 Agent 云服务器的终端。"
            checked={allowTerminal}
            onToggle={handleToggleTerminal}
          />
          <ToggleCard
            icon={<Monitor className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
            title="允许用户访问 Agent 面板"
            description="开启后，系统会为企业分配一个随机端口并自动添加一条安全组规则放通该端口，用户可通过该端口访问 Agent 面板"
            checked={allowPanelAccess}
            loading={panelAccessLoading}
            onToggle={handleTogglePanelAccess}
            afterScope={
              <AccessModeIndicator
                mode={panelAccessMode}
                onSave={(m) => {
                  setPanelAccessMode(m);
                  localStorage.setItem("admin_panel_access_mode", m);
                }}
              />
            }
            extraContent={
              allowPanelAccess && panelPort ? (
                <div className="inline-flex items-start gap-2.5 bg-blue-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-blue-700 leading-relaxed">
                    {panelSgRuleId
                      ? `已为您分配随机端口 ${panelPort} 并自动为默认安全组添加该端口放通规则，`
                      : `已为您分配随机端口 ${panelPort}，`}
                    如用户端仍无法访问面板，请在网络管理的
                    <button
                      onClick={() => navigate("/admin/security-group")}
                      className="underline underline-offset-2 font-medium hover:text-blue-900 transition-colors mx-0.5"
                    >
                      安全组规则
                    </button>
                    处检查是否生效
                  </span>
                </div>
              ) : null
            }
            />
          <div className="self-start">
            <ToggleCard
              icon={<MessagesSquare className="w-4 h-4 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-green-600"
              title="允许用户使用对话视图"
              description="开启后，用户可在「我的 Agent」中使用对话视图，通过浏览器与 AI 对话（建议提前配置默认模型，用户创建 Agent 后 AI 即可正常回复）"
              checked={allowChatView}
              onToggle={handleToggleChatView}
            />
          </div>
          <div className="self-start">
            <ToggleCard
              icon={<Cloud className="w-4 h-4 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-green-600"
              title="允许用户访问 Agent 云端浏览器"
              description="开启后，用户可在「我的 Agent」对话视图里访问云端浏览器，查看 AI 浏览器执行过程并进入操作（注意需要先开启「允许用户使用对话视图」）"
              checked={allowCloudBrowser}
              loading={cloudBrowserLoading}
              loadingLabel="配置中"
              onToggle={handleToggleCloudBrowser}
              extraContent={
                allowCloudBrowser && cloudBrowserSgRuleId ? (
                  <div className="inline-flex items-start gap-2.5 bg-blue-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-blue-700 leading-relaxed">
                      已自动为当前安全组添加 6080 端口放通规则，如用户端仍无法访问云端浏览器，请在网络管理的
                      <button
                        onClick={() => navigate("/admin/security-group")}
                        className="underline underline-offset-2 font-medium hover:text-blue-900 transition-colors mx-0.5"
                      >
                        安全组规则
                      </button>
                      处检查是否生效
                    </span>
                  </div>
                ) : null
              }
            />
          </div>
          <div className="self-start">
            <ToggleCard
              icon={<Stethoscope className="w-4 h-4 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-green-600"
              title="允许用户使用龙虾医生"
              description="开启后，所有用户在用户端可免费使用「龙虾医生」 AI 诊断功能，自动检测并对话式修复 Agent 运行问题。"
              checked={allowLobsterDoctor}
              onToggle={handleToggleLobsterDoctor}
              extraContent={
                allowLobsterDoctor ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      龙虾医生每次诊断会产生部分底层资源费用和 Token 消耗，详见{" "}
                      <button
                        onClick={() => setShowLobsterDoctorDialog(true)}
                        className="inline-flex items-center text-blue-700 hover:opacity-70 transition-opacity"
                        title="查看详情"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </p>
                  </div>
                ) : null
              }
            />
          </div>
          <div className="self-start">
            <ToggleCard
              icon={<BarChart3 className="w-4 h-4 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-green-600"
              title="允许用户查看模型额度"
              description="开启后，用户可在顶部导航栏看到「模型额度」入口，查看个人的 Token 使用情况"
              checked={allowModelQuota}
              onToggle={handleToggleModelQuota}
            />
          </div>
        </div>
      </section>

      {/* 云端浏览器开启确认弹窗已移除：改为依据默认安全组快照自动补规则或 toast 阻止开启 */}

      {/* 龙虾医生详情弹窗 */}
      <Dialog open={showLobsterDoctorDialog} onOpenChange={setShowLobsterDoctorDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="py-1 space-y-4 text-sm text-gray-600 leading-relaxed">
            {/* 工作原理 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">工作原理</p>
              <p>当用户点击「开始诊断」后，ClawPro 平台将完成以下步骤：</p>
              <ol className="space-y-1.5 pl-5 list-decimal">
                <li>创建一个临时按量计费的龙虾医生 Agent 节点</li>
                <li>通过该节点对用户的目标 Agent 进行检测和修复</li>
                <li>诊断结束后，临时节点自动销毁，不留存任何数据</li>
              </ol>
            </div>
            {/* 说明 */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-sm font-medium text-gray-900">说明</p>
              <ol className="space-y-1.5 pl-5 list-decimal text-gray-600">
                <li>
                  <span className="font-medium text-gray-700">资源费用</span>：底层云资源费用可在{" "}
                  <a
                    href="https://console.cloud.tencent.com/expense"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                  >
                    腾讯云费用中心
                  </a>
                  {" "}查看
                </li>
                <li>
                  <span className="font-medium text-gray-700">Token 消耗</span>：诊断消耗的 Token 计入对应用户的 Token 消耗，可在{" "}
                  <button
                    onClick={() => { setShowLobsterDoctorDialog(false); navigate("/admin/tokens-monitor"); }}
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                  >
                    Tokens 监控
                  </button>
                  {" "}查看
                </li>
                <li>
                  <span className="font-medium text-gray-700">诊断模型</span>：诊断所用模型将按照当前已启用的模型顺序使用，可前往{" "}
                  <button
                    onClick={() => { setShowLobsterDoctorDialog(false); navigate("/admin/model-config"); }}
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                  >
                    模型配置
                  </button>
                  {" "}调整
                </li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
