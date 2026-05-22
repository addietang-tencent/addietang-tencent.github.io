/**
 * BasicInfo - 管控端基础信息配置页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side (浅灰背景)
 *
 * 布局：左宽右窄双栏
 *   左侧：6 步分步引导（步骤 1-2 内嵌表单，步骤 3-6 跳转引导）
 *   右侧上：平台基础信息（只读）
 *   右侧下：产品动态时间轴
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Zap,
  MapPin,
  Globe,
  Cloud,
  Sparkles,
  Wrench,
  Pencil,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/mockData";

// ─── 类型 ────────────────────────────────────────────────────────────────────

type TokenLimit = number | "unlimited";

// ─── Mock 完成状态（模拟部分完成、部分未完成） ────────────────────────────────

const MOCK_STEP_STATUS: Record<number, boolean> = {
  1: true,  // 平台名称与品牌 — 已完成（有默认值）
  2: true,  // 用户默认配额 — 已完成（有默认值）
  3: false, // 导入企业用户 — 未完成
  4: true,  // 配置模型 — 已完成
  5: false, // 配置通道 — 未完成
  6: true,  // 配置镜像 — 已完成（默认有公共镜像）
  7: true,  // 配置私有网络 — 已完成（默认有预设VPC）
  8: false, // 配置安全组 — 未完成
};

// ─── 产品动态 Mock 数据 ───────────────────────────────────────────────────────

const PRODUCT_UPDATES = [
  {
    version: "",
    date: "2026-03-28",
    type: "feature" as const,
    title: "内置大模型支持多模态",
    summary: "内置大模型现已支持文本与图片解析，提升对话理解能力。自定义模型暂不支持多模态。",
  },
  {
    version: "",
    date: "2026-03-15",
    type: "feature" as const,
    title: "记忆管理功能上线",
    summary: '记忆管理功能直击"失忆"助理痛点，让 AI Agent记住你、理解你，更有企业级记忆增强版孵化中。',
  },
  {
    version: "",
    date: "2026-03-01",
    type: "improvement" as const,
    title: "模型支持设为默认",
    summary: "管理员可在模型配置页将模型设为默认，用户端新建 OpenClaw 时直接应用，无需手动添加。",
  },
  {
    version: "",
    date: "2026-02-15",
    type: "feature" as const,
    title: "公共技能库上线",
    summary: "管控端支持在技能配置页直接浏览上万个精选公共技能，自由挑选市场上的优质技能为龙虾赋能。",
  },
  {
    version: "",
    date: "2026-02-01",
    type: "feature" as const,
    title: "初始技能包上线，搭配免费 50G 存储",
    summary: "管理员可在技能配置页自由配置初始技能包并加入专有存储空间，OpenClaw 创建时极速下载预装技能。",
  },
  {
    version: "",
    date: "2026-01-15",
    type: "feature" as const,
    title: "ClawPro 新增法兰克福地域",
    summary: "ClawPro 法兰克福地域上线，支持欧洲区域就近部署（仅后端支持）。",
  },
  {
    version: "",
    date: "2025-12-20",
    type: "improvement" as const,
    title: "所有用户默认共用 1 个私有网络",
    summary: "企业内所有用户统一使用平台自动分配的 1 个 VPC，建议将安全组规则设置为内网不互通，以实现 OpenClaw 云服务器间隔离。",
  },
];

// ─── 子组件：步骤序号徽章 ─────────────────────────────────────────────────────

function StepBadge({ step }: { step: number; done: boolean }) {
  return (
    <span className="text-[#1447E6] text-lg font-normal font-['Menlo'] leading-[26px] shrink-0">
      {String(step).padStart(2, '0')}
    </span>
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
      className="bg-white rounded-[4px] border border-[#e5e5e5] p-6 transition-all overflow-hidden"
    >
      <div className="flex items-start gap-3.5">
        <StepBadge step={step} done={done} />
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="text-[16px] font-semibold text-[#0A0A0A] leading-6">{title}</p>
            {done ? (
              <StatusTag variant="green" dot>已完成</StatusTag>
            ) : (
              <StatusTag variant="gray" dot>待完成</StatusTag>
            )}
          </div>
          <p className="text-[14px] text-[#334155] leading-6">{description}</p>
          <div className="mt-5">{children}</div>
        </div>
      </div>
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
    <div className="space-y-2">
      <Label className="text-xs font-medium ">
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
          className="w-full max-w-[360px] flex items-center bg-white border border-[#E5E5E5] rounded-[4px] px-3 h-9 text-sm text-[#020617] font-medium hover:border-[#1447E6] transition-colors text-left group"
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
                className={`text-xs py-1 px-2.5 rounded-[4px] border transition-colors ${
                  draft === "unlimited"
                    ? "border-[#1447E6] bg-blue-50 text-[#355EF1] font-medium"
                    : "border-[#E5E5E5] text-[#020617] hover:border-[#1447E6]"
                }`}
              >
                无限制
              </button>
              <button
                onClick={() => {
                  setDraft(0);
                  setInputStr(inputStr || "0");
                }}
                className={`text-xs py-1 px-2.5 rounded-[4px] border transition-colors ${
                  draft !== "unlimited"
                    ? "border-[#1447E6] bg-blue-50 text-[#355EF1] font-medium"
                    : "border-[#E5E5E5] text-[#020617] hover:border-[#1447E6]"
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
              className="h-9 px-3 text-xs "
            >
              取消
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              className="h-9 px-3 text-xs "
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

export default function BasicInfo() {
  const [, navigate] = useLocation();

  // ── 步骤 1：平台名称与品牌 ──
  const [siteName, setSiteName] = useState("A公司企业版OpenClaw");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 512 * 1024;

  // ── 步骤 2：用户默认配额（与平台策略页共享 localStorage） ──
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

  // ── 汇总：未完成步骤数 ──
  const incompleteCount = Object.values(MOCK_STEP_STATUS).filter((v) => !v).length;

  return (
    <div className="page-enter">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-[#0A0A0A] leading-7">基础信息配置</h1>
        <p className="text-[14px] text-[#334155] mt-2 leading-6">
          以下为必要的初始化配置，全部完成后用户端方可正常使用，更多高级配置可随时前往对应功能页调整
        </p>
      </div>



      {/* 双栏主体 */}
        <div className="flex gap-6 items-start">
        {/* ── 左侧：分步引导 ── */}
        <div className="min-w-0 space-y-5" style={{ flex: "1 1 0" }}>

          {/* 步骤 1：平台名称与品牌 */}
          <StepCard
            step={1}
            done={MOCK_STEP_STATUS[1]}
            title="设置平台名称与品牌"
            description="配置展示在用户端的网站名称和logo"
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-[#020617] leading-[22px]">网站名称</p>
                  <p className="text-[12px] text-[#737373] leading-5">将展示在用户端左上角常驻和首页</p>
                </div>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="例如：A公司企业版Agent"
                  className="w-full max-w-[360px] h-9 border-[#E5E5E5] rounded-[4px] text-sm text-[#020617]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-[#020617] leading-[22px]">网站logo</p>
                  <p className="text-[12px] text-[#737373] leading-5">建议尺寸200x200px，不超过512kb</p>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/icon/上传图片默认icon.svg" alt="" className="w-14 h-14 shrink-0 rounded-[6px]" />
                  <label className="flex items-center gap-2 px-4 py-[5px] border border-dashed border-[#ddd] rounded-[3px] text-sm text-[rgba(0,0,0,0.9)] hover:border-[#1447E6] cursor-pointer transition-colors bg-white">
                    <Upload className="w-4 h-4" />
                    更换logo
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
                  <div className="relative w-full rounded-[4px] border border-amber-200 bg-amber-50 text-amber-950 px-4 py-3 text-sm flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    {logoError}
                  </div>
                )}
              </div>
              <button
                onClick={() => toast.success("平台名称与品牌已保存")}
                className="w-14 h-8 border border-[#e5e5e5] rounded-[4px] bg-white text-sm text-[#020617] leading-[22px] tracking-[0.21px] hover:bg-[#f5f5f5] transition-colors"
              >
                保存
              </button>
            </div>
          </StepCard>

          {/* 步骤 2：用户默认配额 */}
          <StepCard
            step={2}
            done={MOCK_STEP_STATUS[2]}
            title="配置用户默认配额"
            description="设置新用户创建时自动应用的 Agent 数量上限和每日 Tokens 上限，有效控制企业成本"
          >
            <div className="space-y-4">
              <InlineQuotaField
                label="单用户 Agent 数量上限"
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

          {/* 步骤 3：导入企业用户 */}
          <StepCard
            step={3}
            done={MOCK_STEP_STATUS[3]}
            title="导入企业用户"
            description="前往用户管理页添加企业用户，添加后即可使用平台"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/members")}
              className="text-xs flex items-center gap-1.5 "
            >
              前往用户管理
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </StepCard>

          {/* 步骤 4：配置模型 */}
          <StepCard
            step={4}
            done={MOCK_STEP_STATUS[4]}
            title="配置至少一个模型"
            description="为用户端配置至少一个全部用户可见的 AI 模型，用户创建 OpenClaw 时将从中选择"
          >
            <div className="space-y-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/admin/model-config")}
                className="text-xs flex items-center gap-1.5 "
              >
                前往模型配置
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <div className="pt-3 mt-4 border-t border-dashed border-[#e5e5e5]"><p className="text-[13px] text-[#a1a1aa]">如企业按分组配置，请前往<button onClick={() => navigate("/admin/members?view=group")} className="text-[#355EF1] hover:underline">用户管理 - 分组视图</button>查看各分组配置情况，未完成初始化的分组会有黄点标记</p></div>
            </div>
          </StepCard>

          {/* 步骤 5：配置通道 */}
          <StepCard
            step={5}
            done={MOCK_STEP_STATUS[5]}
            title="配置至少一个通道"
            description="为用户端配置至少一个全部用户启用的通道，用户创建 OpenClaw 时可选择对话平台"
          >
            <div className="space-y-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/admin/channel-config")}
                className="text-xs flex items-center gap-1.5 "
              >
                前往通道配置
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <div className="pt-3 mt-4 border-t border-dashed border-[#e5e5e5]"><p className="text-[13px] text-[#a1a1aa]">如企业按分组配置，请前往<button onClick={() => navigate("/admin/members?view=group")} className="text-[#355EF1] hover:underline">用户管理 - 分组视图</button>查看各分组配置情况，未完成初始化的分组会有黄点标记</p></div>
            </div>
          </StepCard>

          {/* 步骤 6：配置镜像 */}
          <StepCard
            step={6}
            done={MOCK_STEP_STATUS[6]}
            title="配置至少一个镜像"
            description="为用户端配置至少一个全部用户启用的镜像，系统默认已启用公共镜像"
          >
            <div className="space-y-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/admin/image-management")}
                className="text-xs flex items-center gap-1.5 "
              >
                前往镜像管理
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <div className="pt-3 mt-4 border-t border-dashed border-[#e5e5e5]"><p className="text-[13px] text-[#a1a1aa]">如企业按分组配置，请前往<button onClick={() => navigate("/admin/members?view=group")} className="text-[#355EF1] hover:underline">用户管理 - 分组视图</button>查看各分组配置情况，未完成初始化的分组会有黄点标记</p></div>
            </div>
          </StepCard>

          {/* 步骤 7：配置私有网络 */}
          <StepCard
            step={7}
            done={MOCK_STEP_STATUS[7]}
            title="配置私有网络"
            description="配置私有网络的预设策略，系统默认已创建一个预设 VPC"
          >
            <div className="space-y-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/admin/security-group?tab=vpc")}
                className="text-xs flex items-center gap-1.5 "
              >
                前往私有网络管理
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <div className="pt-3 mt-4 border-t border-dashed border-[#e5e5e5]"><p className="text-[13px] text-[#a1a1aa]">如企业按分组配置，请前往<button onClick={() => navigate("/admin/members?view=group")} className="text-[#355EF1] hover:underline">用户管理 - 分组视图</button>查看各分组配置情况，未完成初始化的分组会有黄点标记</p></div>
            </div>
          </StepCard>

          {/* 步骤 8：配置安全组 */}
          <StepCard
            step={8}
            done={MOCK_STEP_STATUS[8]}
            title="配置安全组"
            description="为 OpenClaw 云设备配置安全组规则，确保访问安全"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/security-group")}
              className="text-xs flex items-center gap-1.5 "
            >
              前往安全组管理
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </StepCard>
        </div>

        {/* ── 右侧：基础信息 + API文档 + 产品动态 ── */}
        <div className="shrink-0 flex flex-col gap-5" style={{ width: "352px" }}>

          {/* 平台基础信息 */}
          <div
            className="bg-white rounded-[4px] border border-[#e5e5e5] p-5"
          >
            <p className="text-[16px] font-semibold text-[#0A0A0A] tracking-[0.07px] mb-5">平台基础信息</p>
            <div className="flex flex-col gap-5">
              <div className="flex gap-4 items-center">
                <img src="/icon/所在地域.svg" alt="" className="w-9 h-9 shrink-0 rounded-[4px]" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] text-[#737373] leading-5">所在地域</p>
                  <p className="text-[14px] font-medium text-[#0A0A0A] leading-[22px]">{SITE_CONFIG.region}</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <img src="/icon/域名.svg" alt="" className="w-9 h-9 shrink-0 rounded-[4px]" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] text-[#737373] leading-5">域名</p>
                  <p className="text-[14px] font-medium text-[#0A0A0A] leading-[22px]">https://nmyy3n7z.clawpro.cloud/</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <img src="/icon/关联腾讯云账号.svg" alt="" className="w-9 h-9 shrink-0 rounded-[4px]" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] text-[#737373] leading-5">关联腾讯云账号</p>
                  <p className="text-[14px] font-medium text-[#0A0A0A] leading-[22px]">{SITE_CONFIG.tencentUin}</p>
                </div>
              </div>
            </div>
          </div>

          {/* API 文档 */}
          <div
            className="bg-white rounded-[4px] border border-[#e5e5e5] p-5 cursor-pointer group transition-colors"
            onClick={() => window.open("/admin/api-docs", "_blank")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/icon/api文档-icon.svg" alt="" className="w-9 h-9 shrink-0 rounded-[4px]" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[14px] font-medium text-[#0A0A0A] group-hover:text-[#355EF1] transition-colors">API 文档</p>
                  <p className="text-[12px] text-[#737373] leading-5 group-hover:text-[#355EF1] transition-colors">查阅开放接口与调用示例</p>
                </div>
              </div>
              <img src="/icon/arrow-left-stroke.svg" alt="" className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:[filter:invert(32%)_sepia(98%)_saturate(1497%)_hue-rotate(215deg)_brightness(96%)_contrast(95%)] transition-all rotate-[-45deg]" />
            </div>
          </div>

          {/* 产品动态 */}
          <div
            className="bg-white rounded-[4px] border border-[#e5e5e5] p-5"
          >
            <p className="text-[16px] font-semibold text-[#0A0A0A] tracking-[0.07px] mb-6">产品动态</p>
            <div className="flex flex-col gap-3">
              {PRODUCT_UPDATES.map((item, idx) => (
                <div key={idx}>
                  {/* 分隔线 */}
                  {idx > 0 && (
                    <div className="w-2 h-3 mb-3 border-l border-black/9 ml-[1px]" />
                  )}
                  {/* 条目 */}
                  <div className="flex flex-col gap-1">
                    {/* 图标 + 标签行 */}
                    <div className="flex items-center justify-between">
                      <img
                        src={item.type === "feature" ? "/icon/功能上新icon.svg" : "/icon/体验优化-icon.svg"}
                        alt=""
                        className="w-[18px] h-[18px]"
                      />
                      <StatusTag variant={item.type === "feature" ? "green" : "blue"}>
                        {item.type === "feature" ? "功能上新" : "体验优化"}
                      </StatusTag>
                    </div>
                    {/* 标题 */}
                    <p className="text-[14px] font-medium text-[#0A0A0A] leading-5">{item.title}</p>
                    {/* 描述 */}
                    <p className="text-[12px] text-[#737373] leading-5 line-clamp-2 h-10 overflow-hidden">{item.summary}</p>
                    {/* 日期 */}
                    <p className="text-[12px] text-[#A3A3A3] leading-5">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* 查看全部更新按钮 */}
            <button className="mt-6 border border-[#e5e5e5] rounded-[4px] px-3 py-2 flex items-center gap-1 text-[12px] text-[#0A0A0A] leading-5 hover:bg-[#f5f5f5] transition-colors">
              查看全部更新
              <img src="/icon/arrow-left-stroke.svg" alt="" className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
