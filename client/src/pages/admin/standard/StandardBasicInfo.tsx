/**
 * StandardBasicInfo - 管控端基础信息配置页（OneID 专用模式）
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side (浅灰背景)
 *
 * 布局：左宽右窄双栏（与普通模式一致）
 *   左侧：7 步分步引导（步骤 1-2 内嵌表单，步骤 3 跳转腾讯统一身份，步骤 4 用户登录方式多选，步骤 5-7 跳转引导）
 *   右侧上：平台基础信息（只读）
 *   右侧下：产品动态时间轴
 *
 * 与普通模式差异：
 *   - 步骤 1 多一个「同步企业信息」按钮
 *   - 步骤 3 指向腾讯统一身份而非用户管理
 *   - 新增步骤 4 用户登录方式多选
 *   - 后续步骤顺延为 5/6/7
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Upload,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Zap,
  MapPin,
  Globe,
  Cloud,
  Sparkles,
  Wrench,
  RefreshCw,
  Loader2,
  ChevronDown,
  X,
  Pencil,
} from "lucide-react";
import {
  SITE_CONFIG,
  MOCK_SSO_IM_TYPE_OPTIONS,
  type SsoImTypeOption,
} from "@/lib/mockData";

// ─── 类型 ────────────────────────────────────────────────────────────────────

type TokenLimit = number | "unlimited";

// ─── Mock 完成状态 ───────────────────────────────────────────────────────────

const MOCK_STEP_STATUS: Record<number, boolean> = {
  1: true,  // 平台名称与品牌 — 已完成
  2: true,  // 用户默认配额 — 已完成
  3: false, // 导入企业用户 — 未完成
  4: false, // 用户登录方式 — 未完成
  5: true,  // 配置模型 — 已完成
  6: false, // 配置通道 — 未完成
  7: false, // 配置网络和安全组 — 未完成
};

// ─── 产品动态 Mock 数据 ───────────────────────────────────────────────────────

const PRODUCT_UPDATES = [
  {
    version: "v2.4.0",
    date: "2026-03-28",
    type: "feature" as const,
    title: "记忆管理功能上线",
    summary: "支持 Pro / Free 版本切换，Pro 版提供长期记忆存储与跨会话召回能力，管理员可在后台统一管理企业内所有用户的记忆数据，包括查看、导出和批量清理，同时支持按部门维度设置记忆容量配额。",
  },
  {
    version: "v2.3.0",
    date: "2026-03-10",
    type: "feature" as const,
    title: "模型配置支持设置默认模型",
    summary: "管理员可在模型列表中指定一个默认模型，新建 OpenClaw 实例时自动预填。",
  },
  {
    version: "v2.2.1",
    date: "2026-02-25",
    type: "improvement" as const,
    title: "通道配置体验优化",
    summary: "自定义通道新增凭证字段管理，支持多字段动态配置，降低接入成本。",
  },
  {
    version: "v2.2.0",
    date: "2026-02-10",
    type: "feature" as const,
    title: "技能库新增公共技能包分发",
    summary: "管理员可将企业技能包一键分发给指定用户或全体成员，支持批量操作。",
  },
  {
    version: "v2.1.2",
    date: "2026-01-22",
    type: "improvement" as const,
    title: "用户管理体验优化",
    summary: "批量导入用户支持预览和校验，导入失败时提供详细错误提示，降低操作成本。",
  },
  {
    version: "v2.1.0",
    date: "2026-01-08",
    type: "feature" as const,
    title: "平台策略新增 Tokens 用量统计",
    summary: "管理员可在平台策略页查看全平台及各用户的 Tokens 消耗趋势，便于资源管控。",
  },
  {
    version: "v2.0.0",
    date: "2025-12-20",
    type: "feature" as const,
    title: "通道配置支持自定义通道接入",
    summary: "新增自定义通道类型，支持企业自有 IM 系统通过 Webhook 方式接入 OpenClaw。",
  },
];

// ─── 子组件：步骤序号徽章 ─────────────────────────────────────────────────────

function StepBadge({ step }: { step: number; done: boolean }) {
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gray-100 text-gray-500 text-xs font-bold">
      {step}
    </div>
  );
}

// ─── 子组件：步骤卡片外壳 ─────────────────────────────────────────────────────

function StepCard({
  step,
  done,
  title,
  description,
  children,
}: {
  step: number;
  done: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 transition-all"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <StepBadge step={step} done={done} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {done ? (
              <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full">
                已完成
              </span>
            ) : (
              <span className="text-xs font-medium text-orange-500 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                待完成
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="border-t border-gray-50 pt-4">{children}</div>
    </div>
  );
}

// ─── 子组件：配额内联编辑器 ───────────────────────────────────────────────────

function InlineQuotaField({
  label,
  hint,
  value,
  type,
  onSave,
}: {
  label: string;
  hint: string;
  value: TokenLimit | number;
  type: "integer" | "token";
  onSave: (v: TokenLimit | number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TokenLimit | number>(value);
  const [inputStr, setInputStr] = useState(
    value === "unlimited" ? "" : String(value)
  );

  const displayValue =
    value === "unlimited" || value === -1
      ? "无限制"
      : Number(value).toLocaleString();

  const unitText = type === "token" && value !== "unlimited" ? "Tokens / 天" : type === "integer" ? "个" : "";

  const handleSave = () => {
    if (type === "integer") {
      const n = parseInt(inputStr, 10);
      if (isNaN(n) || n < 0 || n > 999) {
        toast.error("请输入 0-999 之间的整数");
        return;
      }
      onSave(n);
    } else {
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
    toast.success(`${label}已保存`);
  };

  const blockInvalidKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", ".", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setInputStr(val);
    setDraft(val ? Number(val) : 0);
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-600">
        {label}
        {hint && <span className="text-gray-400 font-normal ml-1">{hint}</span>}
      </Label>

      {!editing ? (
        <button
          onClick={() => {
            setDraft(value);
            setInputStr(value === "unlimited" ? "" : String(value));
            setEditing(true);
          }}
          className="w-full flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 h-9 text-sm text-gray-700 font-medium hover:border-gray-300 transition-colors text-left group"
        >
          <span>{displayValue}</span>
          {unitText && <span className="text-gray-400 font-normal ml-1">{unitText}</span>}
          <Pencil className="w-3 h-3 text-gray-300 group-hover:text-blue-500 ml-2 shrink-0 transition-colors" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          {type === "token" && (
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => {
                  setDraft("unlimited");
                  setInputStr("");
                }}
                className={`text-xs py-1 px-2.5 rounded-md border transition-colors ${
                  draft === "unlimited"
                    ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                无限制
              </button>
              <button
                onClick={() => {
                  setDraft(0);
                  setInputStr(inputStr || "0");
                }}
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
          {(type === "integer" || draft !== "unlimited") && (
            <Input
              type="number"
              value={inputStr}
              min={0}
              onKeyDown={blockInvalidKeys}
              onChange={handleInputChange}
              className="bg-white border-gray-200 text-sm h-9 min-w-0 flex-1"
              placeholder={type === "integer" ? "0-999" : "请输入数量"}
              autoFocus
            />
          )}
          {type === "token" && draft === "unlimited" && (
            <div className="flex-1" />
          )}
          <div className="flex gap-1 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(false)}
              className="h-9 px-3 text-xs text-gray-600"
            >
              取消
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              className="h-9 px-3 text-xs text-gray-600"
            >
              保存
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export default function StandardBasicInfo() {
  const [, navigate] = useLocation();

  // ── 步骤 1：平台名称与品牌 ──
  const [siteName, setSiteName] = useState("A公司企业版OpenClaw");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const MAX_FILE_SIZE = 512 * 1024;

  // ── 步骤 2：用户默认配额 ──
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

  // ── 步骤 4：用户登录方式 ──
  const [ssoImTypes, setSsoImTypes] = useState<string[]>([]);
  const ssoImTypeOptions: SsoImTypeOption[] = MOCK_SSO_IM_TYPE_OPTIONS;
  const originalSsoImTypesRef = useRef<string[]>([]);

  // ── 同步企业信息 ──
  const handleSyncEnterprise = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSiteName("A公司企业版OpenClaw");
      toast.success("企业信息已同步成功");
    }, 1500);
  };

  // ── 汇总：未完成步骤数 ──
  const incompleteCount = Object.values(MOCK_STEP_STATUS).filter((v) => !v).length;

  return (
    <div className="page-enter">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">基础信息配置</h1>
        <p className="text-sm text-gray-500 mt-1">
          以下为必要的初始化配置，全部完成后用户端方可正常使用，更多高级配置可随时前往对应功能页调整
        </p>
      </div>

      {/* 双栏主体 */}
      <div className="flex gap-6 items-start">
        {/* ── 左侧：分步引导 ── */}
        <div className="min-w-0 space-y-4" style={{ flex: "1 1 0" }}>

          {/* 步骤 1：平台名称与品牌（含同步企业信息按钮） */}
          <StepCard
            step={1}
            done={MOCK_STEP_STATUS[1]}
            title="设置平台名称与品牌"
            description="配置展示在用户端的网站名称和 Logo"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="siteName" className="text-xs font-medium text-gray-600">
                  网站名称
                  <span className="text-gray-400 font-normal ml-1">将展示在用户端左上角常驻和首页</span>
                </Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="例如：A公司企业版OpenClaw"
                  className="bg-gray-50 border-gray-200 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  网站 Logo
                  <span className="text-gray-400 font-normal ml-1">
                    建议尺寸 200×200px，不超过 512KB
                  </span>
                </Label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    A
                  </div>
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors bg-gray-50">
                    <Upload className="w-3.5 h-3.5" />
                    更换 Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          if (file.size > MAX_FILE_SIZE) {
                            setLogoError("Logo 文件不能超过 512KB，请压缩后重试");
                            setLogo(null);
                          } else {
                            setLogoError(null);
                            setLogo(file);
                            toast.success("Logo 已上传");
                          }
                        }
                      }}
                    />
                  </label>
                  {logo && (
                    <span className="text-xs text-green-600 font-medium">{logo.name}</span>
                  )}
                </div>
                {logoError && (
                  <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                    {logoError}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSyncEnterprise}
                  disabled={syncing}
                  className="text-xs text-gray-600 flex items-center gap-1.5"
                >
                  {syncing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  同步企业信息
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("平台名称与品牌已保存")}
                  className="text-xs text-gray-600"
                >
                  保存
                </Button>
              </div>
            </div>
          </StepCard>

          {/* 步骤 2：用户默认配额 */}
          <StepCard
            step={2}
            done={MOCK_STEP_STATUS[2]}
            title="配置用户默认配额"
            description="设置新用户创建时自动应用的 OpenClaw 数量上限和每日 Tokens 上限，有效控制企业成本"
          >
            <div className="space-y-4">
              <InlineQuotaField
                label="单用户 OpenClaw 数量上限"
                hint=""
                value={clawLimit}
                type="integer"
                onSave={handleSaveClawLimit}
              />
              <InlineQuotaField
                label="单用户每日 Tokens 上限"
                hint=""
                value={tokenLimit}
                type="token"
                onSave={handleSaveTokenLimit}
              />
            </div>
          </StepCard>

          {/* 步骤 3：导入企业用户（前往腾讯统一身份） */}
          <StepCard
            step={3}
            done={MOCK_STEP_STATUS[3]}
            title="导入企业用户"
            description="前往腾讯统一身份平台导入企业用户，导入完成后可在用户管理页进行管理"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                window.open(
                  "https://ci-741.account.tencentcs.com/?redirectUrl=https%3A%2F%2Fe17himtkr0083u.ci-741.workspace.tencentcs.com%2Fadmin%2F%23%2Fusers#/login",
                  "_blank"
                );
              }}
              className="text-xs text-gray-600 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              前往腾讯统一身份
            </Button>
          </StepCard>

          {/* 步骤 4：用户登录方式（OneID 专属） */}
          <StepCard
            step={4}
            done={MOCK_STEP_STATUS[4]}
            title="设置用户登录方式"
            description="设置当前平台用户的默认登录方式，需与腾讯统一身份平台保持一致"
          >
            <div className="space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-left hover:border-gray-300 transition-colors h-9 data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                      {ssoImTypes.length === 0 ? (
                        <span className="text-gray-400">请选择登录方式</span>
                      ) : (
                        ssoImTypes.map((val) => {
                          const opt = ssoImTypeOptions.find((o) => o.value === val);
                          return (
                            <span
                              key={val}
                              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5 text-xs font-medium shrink-0"
                            >
                              {opt?.label ?? val}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-blue-900 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSsoImTypes((prev) => prev.filter((t) => t !== val));
                                }}
                              />
                            </span>
                          );
                        })
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-[var(--radix-popover-trigger-width)]"
                  align="start"
                  sideOffset={4}
                >
                  <div className="max-h-60 overflow-y-auto py-1">
                    {ssoImTypeOptions.map((opt) => {
                      const checked = ssoImTypes.includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                            checked ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              if (v) {
                                setSsoImTypes((prev) => [...prev, opt.value]);
                              } else {
                                setSsoImTypes((prev) => prev.filter((t) => t !== opt.value));
                              }
                            }}
                            className="shrink-0"
                          />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                      );
                    })}
                    {ssoImTypeOptions.length === 0 && (
                      <div className="px-3 py-4 text-sm text-gray-400 text-center">暂无可选登录方式</div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  originalSsoImTypesRef.current = [...ssoImTypes];
                  toast.success("用户登录方式已保存");
                }}
                className="text-xs text-gray-600"
              >
                保存
              </Button>
            </div>
          </StepCard>

          {/* 步骤 5：配置模型 */}
          <StepCard
            step={5}
            done={MOCK_STEP_STATUS[5]}
            title="配置至少一个模型"
            description="为用户端配置至少一个可用的 AI 模型，用户在创建 OpenClaw 时将从已配置的模型中选择"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/model-config")}
              className="text-xs flex items-center gap-1.5 text-gray-600"
            >
              前往模型配置
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </StepCard>

          {/* 步骤 6：配置通道 */}
          <StepCard
            step={6}
            done={MOCK_STEP_STATUS[6]}
            title="配置至少一个通道"
            description="通道决定用户可以通过哪些聊天软件（企业微信、飞书、钉钉等）与 OpenClaw 对话，至少配置一个"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/channel-config")}
              className="text-xs flex items-center gap-1.5 text-gray-600"
            >
              前往通道配置
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </StepCard>

          {/* 步骤 7：配置安全组 */}
          <StepCard
            step={7}
            done={MOCK_STEP_STATUS[7]}
            title="配置安全组"
            description="为 OpenClaw 云设备配置安全组规则，确保访问安全"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/security-group")}
              className="text-xs flex items-center gap-1.5 text-gray-600"
            >
              前往安全组管理
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </StepCard>
        </div>

        {/* ── 右侧：基础信息 + 产品动态 ── */}
        <div className="shrink-0 space-y-4" style={{ width: "352px" }}>

          {/* 平台基础信息 */}
          <div
            className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-4">平台基础信息</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">所在地域</p>
                  <p className="text-sm text-gray-700 font-medium mt-0.5">{SITE_CONFIG.region}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">域名</p>
                  <p className="text-sm text-gray-700 font-medium mt-0.5 break-all">https://nmyy3n7z.clawpro.cloud/</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Cloud className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">关联腾讯云账号</p>
                  <p className="text-sm text-gray-700 font-medium mt-0.5">{SITE_CONFIG.tencentUin}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 产品动态 */}
          <div
            className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-4">产品动态</h2>
            <div className="space-y-4">
              {PRODUCT_UPDATES.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        item.type === "feature"
                          ? "bg-blue-50"
                          : "bg-purple-50"
                      }`}
                    >
                      {item.type === "feature" ? (
                        <Sparkles className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Wrench className="w-3 h-3 text-purple-500" />
                      )}
                    </div>
                    {idx < PRODUCT_UPDATES.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 mt-1.5 mb-0" style={{ minHeight: "16px" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          item.type === "feature"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-purple-50 text-purple-600"
                        }`}
                        style={{ fontSize: "10px" }}
                      >
                        {item.type === "feature" ? "功能上线" : "体验优化"}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mb-0.5">{item.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{item.summary}</p>
                    <p className="text-xs text-gray-300 mt-1">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50">
              <button className="text-xs text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1">
                查看全部更新
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
