/**
 * PlatformPolicy - 平台策略页面
 * 基础信息 → 平台策略
 * 包含：用户配额 / 模型配额 / 功能权限开关
 * 风格：与管控端其他页面保持一致（白色卡片、浅色边框、圆角）
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, Pencil, Check, X, Terminal, Monitor, Loader2, Cpu } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ─── 类型 ────────────────────────────────────────────────────────────────────

type TokenLimit = number | "unlimited"; // -1 或 "unlimited" 表示无限制

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
  onToggle: (v: boolean) => void;
  extraContent?: React.ReactNode;
}

function ToggleCard({ icon, iconBg, title, description, checked, loading, onToggle, extraContent }: ToggleCardProps) {
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
              <span className="text-xs text-blue-500 font-medium">配置中，请勿关闭</span>
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
  const [allowCustomModel, setAllowCustomModel] = useState(() => {
    return localStorage.getItem("admin_allow_custom_model") === "true";
  });
  const [allowTerminal, setAllowTerminal] = useState(() => {
    return localStorage.getItem("admin_allow_terminal") === "true";
  });
  const [allowPanelAccess, setAllowPanelAccess] = useState(() => {
    return localStorage.getItem("admin_allow_panel_access") === "true";
  });
  const [panelPort, setPanelPort] = useState<string | null>(() => {
    return localStorage.getItem("admin_panel_port");
  });
  const [panelAccessLoading, setPanelAccessLoading] = useState(false);

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
      setPanelAccessLoading(true);
      setTimeout(() => {
        const randomPort = String(Math.floor(Math.random() * 1000) + 9000);
        setAllowPanelAccess(true);
        setPanelPort(randomPort);
        localStorage.setItem("admin_allow_panel_access", "true");
        localStorage.setItem("admin_panel_port", randomPort);
        setPanelAccessLoading(false);
        toast.success("已开启用户端访问 OpenClaw 面板");
      }, 3000);
    } else {
      setAllowPanelAccess(false);
      setPanelPort(null);
      localStorage.setItem("admin_allow_panel_access", "false");
      localStorage.removeItem("admin_panel_port");
      toast.success("已禁止用户端访问 OpenClaw 面板");
    }
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
            title="单用户 OpenClaw 数量上限"
            description="此为每位用户的初始默认值，可在「用户管理」添加用户时进行调整，也可后续对单个用户单独修改"
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
          <ToggleCard
            icon={<Cpu className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
            title="允许用户添加自定义模型"
            description="开启后，用户可在 OpenClaw 中自行添加自定义模型，不在企业管控和 Tokens 覆盖范围内"
            checked={allowCustomModel}
            onToggle={handleToggleCustomModel}
          />
          <ToggleCard
            icon={<Terminal className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
            title="允许用户进入 OpenClaw 终端"
            description="开启后，所有用户在用户端可看到「进入终端」选项，进入对应 OpenClaw 云服务器的终端"
            checked={allowTerminal}
            onToggle={handleToggleTerminal}
          />
          <ToggleCard
            icon={<Monitor className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
            title="允许用户访问 OpenClaw 面板"
            description="开启后，系统会为企业分配一个随机端口并自动添加一条安全组规则放通该端口，用户可通过该端口访问 OpenClaw 面板"
            checked={allowPanelAccess}
            loading={panelAccessLoading}
            onToggle={handleTogglePanelAccess}
            extraContent={
              allowPanelAccess && panelPort ? (
                <div className="inline-flex items-start gap-2.5 bg-blue-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-blue-700 leading-relaxed">
                    已为您分配随机端口 {panelPort}，如果开启后用户端仍无法访问面板，请在网络管理的
                    <button
                      onClick={() => navigate("/admin/security-group")}
                      className="underline underline-offset-2 font-medium hover:text-blue-900 transition-colors mx-0.5"
                    >
                      安全组规则
                    </button>
                    处检查是否已放通该端口
                  </span>
                </div>
              ) : null
            }
          />
        </div>
      </section>
    </div>
  );
}
