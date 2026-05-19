/**
 * OpenClawDetailGuide - OpenClaw 详情页「基础配置」
 * Figma: node 247:5352（Clawpro 交互稿）
 *
 * 修改记录（2026-05-18）：
 *   1) 背景复用「我的 Agent」的线+点阵背景
 *   2) 左侧纵向 Tab 改为横向 Segmented Control（§8.6 规范）
 *   3) 技能区域新增「安装新技能」弹窗交互（含分类筛选 + 搜索 + 已安装标记）
 *   4) 整体视觉刷新至最新设计规范
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import TenantLayout from "@/components/TenantLayout";
import { SurfaceCard } from "@/components/ui/Surface";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Edit3,
  ChevronDown,
  Trash2,
  Search,
  Plus,
  Info,
  ExternalLink,
  RefreshCw,
  X,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Star,
  Download,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AgentAvatar } from "@/components/agent/AgentAvatar";
import { StatusBadge } from "@/components/agent/StatusBadge";
import { MODEL_PROVIDERS, CHANNEL_OPTIONS, type ChannelField, type ChannelConfig } from "@/lib/agentConfigConstants";
import {
  type CustomChannel as AdminCustomChannel,
  loadVisibleCustomChannels,
  onCustomChannelsChange,
  loadBuiltinChannelVisibility,
  onBuiltinChannelVisibilityChange,
} from "@/lib/customChannelStore";
import ToolsMcpPanel from "./ToolsMcpPanel";
import FileSpace from "./FileSpace";
import MemoryPreview from "@/components/MemoryPreview";

// ─── 顶部 Tab 数据（横向 Segmented Control） ─────────────────────────────
type DetailTab = "basic" | "tools" | "memory" | "files" | "doctor";
const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "basic", label: "基础配置" },
  { id: "tools", label: "工具管理" },
  { id: "memory", label: "记忆管理" },
  { id: "files", label: "网盘管理" },
  { id: "doctor", label: "龙虾医院" },
];

// ─── 模拟数据：已接入通道 ─────────────────────────────────────────────────
const MOCK_CHANNELS: { id: string; name: string }[] = [
  { id: "feishu", name: "飞书" },
  { id: "qq", name: "QQ" },
];

// ─── 模拟数据：已安装技能 ─────────────────────────────────────────────────
const MOCK_INSTALLED_SKILLS: { name: string; version: string }[] = [
  { name: "code-interpreter", version: "1.2.0" },
  { name: "image-recognition", version: "0.9.1" },
  { name: "text-to-speech", version: "1.0.0" },
  { name: "pdf-parser", version: "1.1.0" },
  { name: "excel-reader", version: "2.0.0" },
  { name: "web-scraper", version: "1.3.2" },
  { name: "json-formatter", version: "0.8.0" },
  { name: "markdown-converter", version: "1.0.1" },
  { name: "api-tester", version: "2.1.0" },
  { name: "sql-executor", version: "1.5.0" },
  { name: "file-compressor", version: "0.9.0" },
  { name: "email-sender", version: "1.2.3" },
  { name: "calendar-sync", version: "1.0.0" },
  { name: "task-scheduler", version: "0.7.1" },
  { name: "log-analyzer", version: "2.0.0" },
  { name: "data-visualizer", version: "1.4.0" },
  { name: "chart-generator", version: "1.1.0" },
  { name: "csv-processor", version: "0.6.0" },
  { name: "translation-engine", version: "3.0.1" },
  { name: "sentiment-analyzer", version: "1.0.0" },
  { name: "keyword-extractor", version: "0.5.2" },
  { name: "summarizer", version: "2.2.0" },
  { name: "plagiarism-checker", version: "1.0.0" },
  { name: "grammar-fixer", version: "1.3.0" },
  { name: "tone-adjuster", version: "0.9.0" },
  { name: "image-resizer", version: "1.0.0" },
  { name: "screenshot-tool", version: "1.1.0" },
  { name: "video-transcriber", version: "0.8.1" },
  { name: "audio-converter", version: "1.0.0" },
  { name: "ocr-reader", version: "2.0.0" },
  { name: "qr-generator", version: "0.4.0" },
  { name: "barcode-scanner", version: "1.0.0" },
  { name: "color-picker", version: "0.3.0" },
  { name: "font-matcher", version: "0.2.1" },
  { name: "icon-finder", version: "1.0.0" },
  { name: "regex-builder", version: "1.1.0" },
  { name: "cron-parser", version: "0.5.0" },
  { name: "jwt-decoder", version: "1.0.0" },
  { name: "hash-generator", version: "0.8.0" },
  { name: "uuid-creator", version: "1.0.0" },
  { name: "dns-lookup", version: "0.6.0" },
  { name: "port-scanner", version: "1.2.0" },
  { name: "ssl-checker", version: "1.0.0" },
  { name: "ping-monitor", version: "0.9.0" },
  { name: "git-helper", version: "2.1.0" },
  { name: "docker-manager", version: "1.3.0" },
  { name: "k8s-inspector", version: "0.7.0" },
  { name: "ci-cd-trigger", version: "1.0.0" },
  { name: "env-validator", version: "0.4.0" },
  { name: "config-diff", version: "1.0.0" },
  { name: "dependency-checker", version: "1.5.0" },
  { name: "license-scanner", version: "0.3.0" },
  { name: "changelog-gen", version: "1.0.0" },
];

// ─── 模拟数据：安装队列（含 pending / installing / failed 三种状态） ─────
type PendingSkillStatus = "pending" | "installing" | "failed";
type PendingSkill = { id: string; name: string; status: PendingSkillStatus };
// ps-3 和 ps-7 模拟安装失败（与 main 分支保持一致）
const MOCK_FAIL_IDS = new Set(["ps-3", "ps-7"]);
const MOCK_PENDING_SKILLS: PendingSkill[] = [
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
];

// ─── 技能库数据（弹窗用，参考 skillhub.cn 分类体系） ────────────────────────
type SkillCategory = "all" | "ai" | "dev" | "tool" | "efficiency" | "data" | "content" | "security" | "collab";
const SKILL_CATEGORIES: { id: SkillCategory; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "ai", label: "AI" },
  { id: "dev", label: "智能开发" },
  { id: "tool", label: "工具" },
  { id: "efficiency", label: "效率提升" },
  { id: "data", label: "数据分析" },
  { id: "content", label: "内容创作" },
  { id: "security", label: "安全合规" },
  { id: "collab", label: "通讯协作" },
];

interface SkillItem {
  id: string;
  name: string;
  initial: string;
  color: string;
  description: string;
  category: SkillCategory;
  installed: boolean;
  favorites: number;
  downloads: number;
  source: "ClawHub" | "SkillHub";
}

const SKILL_LIBRARY: SkillItem[] = [
  // ── AI ──
  {
    id: "self-improving",
    name: "Self-Improving Agent",
    initial: "S",
    color: "#4A6CF7",
    description: "捕获经验教训、错误和纠正，实现 Agent 持续自我改进。当命令执行失败或用户纠正输出时自动记录并优化后续策略。",
    category: "ai",
    installed: false,
    favorites: 785,
    downloads: 194000,
    source: "ClawHub",
  },
  {
    id: "find-skills",
    name: "Find Skills",
    initial: "F",
    color: "#E05A9C",
    description: "当用户询问\"如何做某事\"或希望扩展功能时，自动从 SkillHub 发现并推荐合适的技能插件。",
    category: "ai",
    installed: false,
    favorites: 1230,
    downloads: 312000,
    source: "SkillHub",
  },
  {
    id: "deepthink",
    name: "DeepThink Reasoner",
    initial: "D",
    color: "#7C3AED",
    description: "深度推理引擎，面对复杂多步骤问题时启用链式思考(CoT)，提升推理准确率和逻辑一致性。",
    category: "ai",
    installed: false,
    favorites: 2150,
    downloads: 458000,
    source: "ClawHub",
  },
  // ── 智能开发 ──
  {
    id: "github",
    name: "Github",
    initial: "G",
    color: "#16A34A",
    description: "通过 gh CLI 与 GitHub 深度集成，管理 Issue、PR、CI/CD 运行、代码审查及 GitHub API 高级查询。",
    category: "dev",
    installed: false,
    favorites: 3420,
    downloads: 890000,
    source: "SkillHub",
  },
  {
    id: "agent-browser",
    name: "Agent Browser",
    initial: "A",
    color: "#E67E22",
    description: "基于 Rust 的高性能无头浏览器，支持页面导航、DOM 操作、截图和结构化数据提取，适合网页自动化任务。",
    category: "dev",
    installed: false,
    favorites: 567,
    downloads: 86000,
    source: "ClawHub",
  },
  {
    id: "code-review",
    name: "Code Review Assistant",
    initial: "C",
    color: "#0891B2",
    description: "智能代码审查助手，自动检测代码中的安全漏洞、性能瓶颈和规范违规，提供修复建议和最佳实践参考。",
    category: "dev",
    installed: true,
    favorites: 1890,
    downloads: 267000,
    source: "SkillHub",
  },
  // ── 工具 ──
  {
    id: "tavily-search",
    name: "Tavily Search",
    initial: "T",
    color: "#2563EB",
    description: "实时互联网搜索引擎，为 Agent 提供最新的网页搜索结果、摘要和事实核查能力，支持多语言查询。",
    category: "tool",
    installed: false,
    favorites: 4210,
    downloads: 1230000,
    source: "SkillHub",
  },
  {
    id: "file-converter",
    name: "File Converter",
    initial: "F",
    color: "#DC2626",
    description: "万能文件格式转换工具，支持 PDF、Word、Excel、Markdown、HTML 等 50+ 格式间的互转。",
    category: "tool",
    installed: false,
    favorites: 923,
    downloads: 156000,
    source: "ClawHub",
  },
  // ── 效率提升 ──
  {
    id: "ai-ppt-generator",
    name: "AI PPT Generator",
    initial: "P",
    color: "#16A34A",
    description: "根据主题和大纲自动生成专业演示文稿，支持多种模板风格，包含配图建议和演讲者注记。",
    category: "efficiency",
    installed: false,
    favorites: 2670,
    downloads: 534000,
    source: "ClawHub",
  },
  {
    id: "meeting-summary",
    name: "Meeting Summary",
    initial: "M",
    color: "#9333EA",
    description: "自动提取会议录音/文字记录的核心要点，生成结构化纪要，包含行动项、决策和待跟进事项。",
    category: "efficiency",
    installed: true,
    favorites: 1560,
    downloads: 345000,
    source: "SkillHub",
  },
  // ── 数据分析 ──
  {
    id: "data-viz",
    name: "Data Visualizer",
    initial: "D",
    color: "#E67E22",
    description: "将结构化数据自动转化为图表（折线图、柱状图、饼图等），支持趋势分析和异常检测提示。",
    category: "data",
    installed: false,
    favorites: 1120,
    downloads: 278000,
    source: "SkillHub",
  },
  {
    id: "sql-assistant",
    name: "SQL Assistant",
    initial: "S",
    color: "#7C3AED",
    description: "自然语言转 SQL 查询，支持 MySQL/PostgreSQL/ClickHouse 等主流数据库，含查询优化建议。",
    category: "data",
    installed: false,
    favorites: 890,
    downloads: 198000,
    source: "ClawHub",
  },
  // ── 内容创作 ──
  {
    id: "xhs-skill",
    name: "小红书创作助手",
    initial: "小",
    color: "#E11D48",
    description: "针对小红书平台优化的内容创作工具，自动生成爆款标题、正文排版、话题标签和发布时间建议。",
    category: "content",
    installed: false,
    favorites: 5680,
    downloads: 1450000,
    source: "SkillHub",
  },
  {
    id: "copywriting",
    name: "AI Copywriter",
    initial: "C",
    color: "#9333EA",
    description: "多风格文案生成器，支持广告文案、品牌故事、产品描述和社交媒体帖子，可指定语气和目标受众。",
    category: "content",
    installed: false,
    favorites: 2340,
    downloads: 567000,
    source: "ClawHub",
  },
  // ── 安全合规 ──
  {
    id: "skill-vetter",
    name: "Skill Vetter",
    initial: "S",
    color: "#4A6CF7",
    description: "技能安全预审工具，在安装第三方技能前自动检查风险信号、权限范围及可疑模式，保障 Agent 运行安全。",
    category: "security",
    installed: true,
    favorites: 3120,
    downloads: 720000,
    source: "ClawHub",
  },
  {
    id: "content-guard",
    name: "Content Guard",
    initial: "C",
    color: "#E67E22",
    description: "内容合规审查引擎，实时检测 Agent 输出中的敏感信息、违规内容和隐私泄露风险，支持自定义规则。",
    category: "security",
    installed: false,
    favorites: 456,
    downloads: 67000,
    source: "SkillHub",
  },
  // ── 通讯协作 ──
  {
    id: "wecom-bot",
    name: "企业微信 Bot",
    initial: "企",
    color: "#2563EB",
    description: "企业微信深度集成，支持群消息推送、审批流转、日程同步和自动回复，适合企业内部协作场景。",
    category: "collab",
    installed: false,
    favorites: 1890,
    downloads: 423000,
    source: "ClawHub",
  },
  {
    id: "feishu-connector",
    name: "飞书 Connector",
    initial: "飞",
    color: "#4A6CF7",
    description: "飞书平台连接器，支持文档协作、多维表格读写、机器人消息和审批流程自动化。",
    category: "collab",
    installed: false,
    favorites: 2100,
    downloads: 389000,
    source: "SkillHub",
  },
];

// ─── 已配置徽标 ──────────────────────────────────────────────────────────
function ConfiguredBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 h-5 px-2 text-xs shrink-0"
      style={{ color: "#16A34A", letterSpacing: "0.015em" }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: "#16A34A" }} />
      已配置
    </span>
  );
}

// ─── 模型选择行 ──────────────────────────────────────────────────────────
function ModelRow({
  provider,
  model,
  showEdit,
  showDelete,
}: {
  provider: string;
  model: string;
  showEdit?: boolean;
  showDelete?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-[4px] px-4 py-3.5"
      style={{ background: "#FAFAFA", border: "1px solid #E6E9EF" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.9)" }}>
          {provider}
        </span>
        <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)" }}>
          {model}
        </span>
      </div>
      {showEdit && (
        <button
          className="text-[#737373] hover:text-[#1447E6] transition-colors"
          aria-label="编辑模型"
          onClick={() => toast.info("编辑模型（demo）")}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      )}
      {showDelete && (
        <button
          className="text-[#737373] hover:text-red-500 transition-colors"
          aria-label="删除模型"
          onClick={() => toast.info("删除模型（demo）")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── 通道行 ──────────────────────────────────────────────────────────────
function ChannelRow({ name }: { name: string }) {
  return (
    <div
      className="flex items-center justify-between rounded-[4px] px-4 py-3.5"
      style={{ background: "#FAFAFA", border: "1px solid #E6E9EF" }}
    >
      <div className="flex items-center gap-2">
        <ChevronDown className="w-4 h-4 text-[#737373]" />
        <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.9)" }}>
          {name}
        </span>
        <span
          className="inline-flex items-center gap-1.5 h-5 px-2 text-xs"
          style={{ color: "#16A34A" }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: "#16A34A" }} />
          运行中
        </span>
      </div>
      <button
        className="text-[#737373] hover:text-red-500 transition-colors"
        aria-label="删除通道"
        onClick={() => toast.info(`删除通道 ${name}（demo）`)}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── 安装新技能弹窗 ──────────────────────────────────────────────────────
function SkillInstallModal({
  open,
  onOpenChange,
  onEnqueue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnqueue?: (names: string[]) => void;
}) {
  const [category, setCategory] = useState<SkillCategory>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "downloads" | "favorites">("default");
  const [addedSkills, setAddedSkills] = useState<string[]>([]);

  const filteredSkills = SKILL_LIBRARY.filter((s) => {
    if (category !== "all" && s.category !== category) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "downloads") return b.downloads - a.downloads;
    if (sortBy === "favorites") return b.favorites - a.favorites;
    // 综合排序：收藏权重 + 下载权重
    return (b.favorites * 10 + b.downloads) - (a.favorites * 10 + a.downloads);
  });

  const handleAdd = (skillId: string) => {
    setAddedSkills((prev) => [...prev, skillId]);
    toast.success("技能已添加到安装列表");
  };

  const handleInstall = () => {
    if (addedSkills.length === 0) {
      toast.warning("请先添加要安装的技能");
      return;
    }
    // 把勾选的技能加入待安装队列（含 name + 默认版本号 1.0.0）
    const names = addedSkills
      .map((id) => SKILL_LIBRARY.find((s) => s.id === id))
      .filter((s): s is (typeof SKILL_LIBRARY)[number] => !!s)
      .map((s) => `${s.name} 1.0.0`);
    onEnqueue?.(names);
    toast.success(`已加入安装队列：${addedSkills.length} 个技能`);
    onOpenChange(false);
    setAddedSkills([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] p-0 overflow-hidden" showCloseButton={false}>
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <DialogHeader className="p-0 m-0 gap-0 space-y-0">
            <DialogTitle className="text-base font-semibold" style={{ color: "rgba(0,0,0,0.88)" }}>
              安装新技能
            </DialogTitle>
            <DialogDescription className="sr-only">
              从技能库中搜索、筛选并安装新的 Agent 技能。
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            className="h-7 w-7 text-[#7b818f] hover:text-[#0A0A0A]"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 当前添加 小标题 */}
        <div className="px-6 pb-2">
          <div className="text-sm font-medium" style={{ color: "#0A0A0A" }}>
            当前添加：{addedSkills.length}个
          </div>
        </div>

        {/* 已添加技能 tag 列表 */}
        {addedSkills.length > 0 && (
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {addedSkills.map((skillId) => {
              const skill = SKILL_LIBRARY.find((s) => s.id === skillId);
              if (!skill) return null;
              return (
                <Badge
                  key={skillId}
                  variant="secondary"
                  className="bg-[#EFF6FF] border-0 text-[#1447E6] gap-1 pr-1"
                >
                  {skill.name}
                  <button
                    onClick={() => setAddedSkills((prev) => prev.filter((id) => id !== skillId))}
                    className="ml-0.5 rounded-full hover:bg-[#1447E6]/10 p-0.5 transition-colors"
                    aria-label={`移除 ${skill.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* 技能库 小标题 */}
        <div className="px-6 pb-2">
          <div className="text-sm font-medium" style={{ color: "#0A0A0A" }}>
            技能库
          </div>
        </div>

        {/* 管理员配置提示 */}
        <div className="px-6 pb-3">
          <div
            className="flex items-start gap-2 p-3 rounded-[4px]"
            style={{ background: "#EBF5FF", border: "1px solid #BFDBFE" }}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#1447E6" }} />
            <span className="text-xs leading-4" style={{ color: "#1447E6" }}>
              管理员配置了
              <a href="#" className="underline font-medium" onClick={(e) => { e.preventDefault(); toast.info("SkillHub 模型（demo）"); }}>
                SkillHub模型
              </a>
              ，不支持模糊搜索，请输入准确Skill名称
            </span>
          </div>
        </div>

        {/* 搜索栏 + 排序（§8.6 规范） */}
        <div className="px-6 pb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "#b0b6c3" }}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="输入 Skill 名称搜索并添加"
              className="h-9 pl-9 rounded-[4px] text-sm"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "default" | "downloads" | "favorites")}>
            <SelectTrigger className="h-9 w-[120px] rounded-[4px] text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">综合排序</SelectItem>
              <SelectItem value="downloads">下载量</SelectItem>
              <SelectItem value="favorites">收藏数</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 分类标签 */}
        <div className="px-6 pb-3">
          <RadioGroup
            value={category}
            onValueChange={(value) => setCategory(value as SkillCategory)}
            className="flex flex-wrap gap-2"
          >
            {SKILL_CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-center">
                <RadioGroupItem value={cat.id} id={`skill-cat-${cat.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`skill-cat-${cat.id}`}
                  className="flex items-center justify-center rounded-[4px] border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#737373] hover:border-[#1447E6] hover:text-[#1447E6] cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary transition-colors"
                >
                  {cat.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* 技能列表 */}
        <div
          className="mx-6 mb-4 rounded-[4px] overflow-hidden max-h-[340px] overflow-y-auto"
          style={{ border: "1px solid #E5E5E5" }}
        >
          {filteredSkills.map((skill, idx) => {
            const isAdded = addedSkills.includes(skill.id);
            return (
              <div key={skill.id}>
                {idx > 0 && <div className="h-px" style={{ background: "#F0F0F0" }} />}
                <div className="flex items-center px-4 py-3.5" style={{ gap: "12px" }}>
                  {/* 左：头像 */}
                  <div
                    className="w-8 h-8 rounded-[6px] flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ background: `${skill.color}20`, color: skill.color }}
                  >
                    {skill.initial}
                  </div>

                  {/* 中：标题 + 描述 */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0 mr-[36px]">
                    <span className="text-sm font-medium truncate" style={{ color: "#0A0A0A" }}>
                      {skill.name}
                    </span>
                    <span className="text-xs leading-4 line-clamp-2" style={{ color: "#737373" }}>
                      {skill.description}
                    </span>
                  </div>

                  {/* 右：数据信息 + 按钮（上下排列） */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="flex items-center gap-3 text-[11px]" style={{ color: "#A3A3A3" }}>
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {skill.favorites >= 1000 ? `${(skill.favorites / 1000).toFixed(1)}k` : skill.favorites}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {skill.downloads >= 10000 ? `${(skill.downloads / 10000).toFixed(1)}万` : skill.downloads}
                      </span>
                      <span>源自 {skill.source}</span>
                    </span>
                    {skill.installed ? (
                      <Button variant="claw-outline" size="sm" disabled className="h-6 px-2 text-xs w-[68px]">
                        已安装
                      </Button>
                    ) : isAdded ? (
                      <Button
                        variant="claw-outline"
                        size="sm"
                        onClick={() => setAddedSkills((prev) => prev.filter((id) => id !== skill.id))}
                        className="h-6 px-2 text-xs w-[68px]"
                      >
                        取消添加
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleAdd(skill.id)} className="h-6 px-2 text-xs w-[68px]">
                        <Plus className="w-3 h-3" />
                        添加
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部操作栏（§8.7 无分割线，按钮右对齐） */}
        <DialogFooter className="mx-0 mb-0 px-6 pb-6 pt-4 gap-3">
          <Button
            variant="claw-outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button onClick={handleInstall}>
            开始安装
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────────────────
export default function OpenClawDetailGuide() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<DetailTab>("basic");
  const [skillSearch] = useState("");
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  // ─── 已安装 / 待安装技能（动态状态机，对齐 main 分支） ───
  const [installedSkills, setInstalledSkills] = useState<{ name: string; version: string }[]>(
    MOCK_INSTALLED_SKILLS,
  );
  const [pendingSkills, setPendingSkills] = useState<PendingSkill[]>(MOCK_PENDING_SKILLS);

  // 进入页面后：所有 pending 同时变为 installing（模拟并行安装）
  useEffect(() => {
    setPendingSkills((prev) =>
      prev.map((s) => (s.status === "pending" ? { ...s, status: "installing" as PendingSkillStatus } : s)),
    );
  }, []);

  // 监听 installing 状态：3s 后一次性出结果（成功推入已安装；失败标记 failed）
  const installingKey = pendingSkills
    .filter((s) => s.status === "installing")
    .map((s) => s.id)
    .join();
  useEffect(() => {
    if (!installingKey) return;
    const timer = setTimeout(() => {
      setPendingSkills((prev) => {
        const installing = prev.filter((s) => s.status === "installing");
        if (installing.length === 0) return prev;
        const successList = installing.filter((s) => !MOCK_FAIL_IDS.has(s.id));
        const failedIds = new Set(
          installing.filter((s) => MOCK_FAIL_IDS.has(s.id)).map((s) => s.id),
        );
        // 删除成功项；失败项标记 failed
        const next = prev
          .filter((s) => !successList.some((ss) => ss.id === s.id))
          .map((s) => (failedIds.has(s.id) ? { ...s, status: "failed" as PendingSkillStatus } : s));
        if (successList.length > 0) {
          // 成功批量加入已安装列表（解析 "name version" 格式）
          setInstalledSkills((list) => [
            ...successList.map((s) => {
              const lastSpace = s.name.lastIndexOf(" ");
              return lastSpace > 0
                ? { name: s.name.slice(0, lastSpace), version: s.name.slice(lastSpace + 1) }
                : { name: s.name, version: "" };
            }),
            ...list,
          ]);
        }
        return next;
      });
    }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installingKey]);

  // 全部重试：所有 failed 重新进入 installing
  const handleRetryAllFailed = () => {
    const failedIds = pendingSkills.filter((s) => s.status === "failed").map((s) => s.id);
    failedIds.forEach((id) => MOCK_FAIL_IDS.delete(id));
    setPendingSkills((prev) =>
      prev.map((s) => (s.status === "failed" ? { ...s, status: "installing" as PendingSkillStatus } : s)),
    );
    if (failedIds.length > 0) toast.info(`已重试 ${failedIds.length} 个失败技能`);
  };

  // 全部删除：移除所有 failed
  const handleDeleteAllFailed = () => {
    const count = pendingSkills.filter((s) => s.status === "failed").length;
    setPendingSkills((prev) => prev.filter((s) => s.status !== "failed"));
    if (count > 0) toast.info(`已删除 ${count} 个失败项`);
  };

  // 把弹窗里勾选的技能加入待安装队列
  const handleEnqueueSkills = (names: string[]) => {
    if (names.length === 0) return;
    setPendingSkills((prev) => [
      ...prev,
      ...names.map((name, i) => ({
        id: `ps-${Date.now()}-${i}`,
        name,
        status: "pending" as PendingSkillStatus,
      })),
    ]);
  };

  const [panelDialogOpen, setPanelDialogOpen] = useState(false);
  const [showAddBackupModel, setShowAddBackupModel] = useState(true);
  const [backupCascadeOpen, setBackupCascadeOpen] = useState(false);
  const [backupHoveredProvider, setBackupHoveredProvider] = useState<string | null>(null);

  // ── Memory Tab state（mock）──
  const [memoryStatus, setMemoryStatus] = useState<"pro" | "free" | "none" | "upgrading">("pro");
  const [proQuotaAvailable] = useState(true);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryDataLoaded, setMemoryDataLoaded] = useState(false);
  useEffect(() => {
    if (activeTab === "memory" && !memoryDataLoaded && (memoryStatus === "free" || memoryStatus === "pro")) {
      setMemoryLoading(true);
      const loadTime = memoryStatus === "free" ? 4000 : 1500;
      const timer = setTimeout(() => {
        setMemoryLoading(false);
        setMemoryDataLoaded(true);
      }, loadTime);
      return () => clearTimeout(timer);
    }
  }, [activeTab, memoryDataLoaded, memoryStatus]);

  // ── Doctor Tab state（一键修复 mock）──
  const [quickFixState, setQuickFixState] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [quickFixFailReason, setQuickFixFailReason] = useState("");
  const quickFixFailReasonsRef = useRef([
    "API KEY 校验未通过",
    "插件依赖加载超时",
    "通道配置文件解析异常",
  ]);
  const quickFixFailIdxRef = useRef(0);
  const runQuickFixMock = useCallback(() => {
    setQuickFixState("loading");
    setQuickFixFailReason("");
    setTimeout(() => {
      // 引导页演示版：默认走成功路径；如需演示失败可改为按计数轮换
      setQuickFixState("success");
      toast.success("一键修复执行完成");
    }, 3000);
  }, []);

  // ── Model state ──
  const [selectedProvider, setSelectedProvider] = useState(MODEL_PROVIDERS[0].value);
  const [selectedModel, setSelectedModel] = useState(MODEL_PROVIDERS[0].versions[0].value);
  const currentProvider = MODEL_PROVIDERS.find(p => p.value === selectedProvider) || MODEL_PROVIDERS[0];
  const currentVersions = currentProvider.versions;

  type AppliedModel = { id: number; providerLabel: string; versionLabel: string; primary: boolean; adminPreset?: boolean };
  const [appliedModels, setAppliedModels] = useState<AppliedModel[]>([
    { id: 1, providerLabel: "腾讯云 Token Plan 企业版专业套餐", versionLabel: "DeepSeek-V4-Pro", primary: true, adminPreset: true },
  ]);
  const [modelIdCounter, setModelIdCounter] = useState(2);

  const handleProviderChange = (providerValue: string) => {
    setSelectedProvider(providerValue);
    const provider = MODEL_PROVIDERS.find(p => p.value === providerValue);
    if (provider) setSelectedModel(provider.versions[0].value);
  };

  const handleApplyModel = () => {
    const provider = MODEL_PROVIDERS.find(p => p.value === selectedProvider);
    const version = currentVersions.find(v => v.value === selectedModel);
    if (!provider || !version) return;
    const newEntry: AppliedModel = {
      id: modelIdCounter,
      providerLabel: provider.label,
      versionLabel: version.label,
      primary: !appliedModels.some(m => m.primary),
    };
    setAppliedModels(prev => [...prev, newEntry]);
    setModelIdCounter(c => c + 1);
    toast.success("模型已添加");
  };

  const handleDeleteModel = (id: number) => {
    setAppliedModels(prev => prev.filter(m => m.id !== id));
    toast.info("模型已删除");
  };

  // ── 主模型编辑态 ──
  const [editingPrimaryId, setEditingPrimaryId] = useState<number | null>(null);
  const [editProvider, setEditProvider] = useState(MODEL_PROVIDERS[0].value);
  const [editModel, setEditModel] = useState(MODEL_PROVIDERS[0].versions[0].value);
  const [editCascadeOpen, setEditCascadeOpen] = useState(false);
  const [editHoveredProvider, setEditHoveredProvider] = useState<string | null>(null);

  const handleEditPrimary = (id: number) => {
    setEditingPrimaryId(id);
    setEditProvider(MODEL_PROVIDERS[0].value);
    setEditModel(MODEL_PROVIDERS[0].versions[0].value);
    setEditCascadeOpen(false);
    setEditHoveredProvider(null);
  };

  const handleConfirmEditPrimary = () => {
    if (editingPrimaryId === null) return;
    const provider = MODEL_PROVIDERS.find(p => p.value === editProvider);
    const version = provider?.versions.find(v => v.value === editModel);
    if (!provider || !version) return;
    setAppliedModels(prev => prev.map(m =>
      m.id === editingPrimaryId
        ? { ...m, providerLabel: provider.label, versionLabel: version.label, adminPreset: false }
        : m
    ));
    setEditingPrimaryId(null);
    toast.success("主模型已修改");
  };

  // ── Channel state ──
  const [selectedChannel, setSelectedChannel] = useState("wework");
  const [channelFields, setChannelFields] = useState<Record<string, string>>({});
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  // 自定义通道（管控端配置）
  const [visibleCustomChannels, setVisibleCustomChannels] = useState<AdminCustomChannel[]>(() => loadVisibleCustomChannels());
  useEffect(() => {
    const unsub = onCustomChannelsChange(() => setVisibleCustomChannels(loadVisibleCustomChannels()));
    return unsub;
  }, []);
  const [builtinChannelVisibility, setBuiltinChannelVisibility] = useState<Record<string, boolean>>(() => loadBuiltinChannelVisibility());
  useEffect(() => {
    const unsub = onBuiltinChannelVisibilityChange(() => setBuiltinChannelVisibility(loadBuiltinChannelVisibility()));
    return unsub;
  }, []);

  // 已接入通道
  type AppliedChannel = {
    type: string;
    channelValue: string;
    status: "running";
    fields: ChannelField[];
    fieldValues: Record<string, string>;
  };
  const [appliedChannels, setAppliedChannels] = useState<AppliedChannel[]>([
    {
      type: "飞书", channelValue: "feishu", status: "running",
      fields: CHANNEL_OPTIONS.find(c => c.value === "feishu")?.fields || [],
      fieldValues: { appId: "cli_a1b2c3d4e5f6", appSecret: "abc123456789" },
    },
    {
      type: "QQ", channelValue: "qq", status: "running",
      fields: CHANNEL_OPTIONS.find(c => c.value === "qq")?.fields || [],
      fieldValues: { appId: "1234567890", appSecret: "xyz987654321" },
    },
  ]);
  const [expandedChannelIdx, setExpandedChannelIdx] = useState<number | null>(null);
  const [visibleAppliedSecrets, setVisibleAppliedSecrets] = useState<Set<string>>(new Set());

  // 合并通道选项（内置 + 管控端自定义）
  const allChannelOptions = [
    ...CHANNEL_OPTIONS.filter(c => builtinChannelVisibility[c.value] !== false),
    ...visibleCustomChannels.map(cc => ({
      value: cc.id,
      label: cc.name,
      descText: "管控端自定义通道",
      fields: cc.credentialFields?.map((f: { key: string; label: string; secret?: boolean }) => ({ key: f.key, label: f.label, secret: f.secret ?? false })) || [],
    } as ChannelConfig)),
  ];
  const currentChannelConfig = allChannelOptions.find(c => c.value === selectedChannel);

  /** 加密显示 */
  const maskSecret = (val: string) => {
    if (!val || val.length <= 3) return val || "";
    return val.slice(0, 3) + "••••••";
  };

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAppliedSecretVisibility = (channelIdx: number, fieldKey: string) => {
    const uniqueKey = `${channelIdx}-${fieldKey}`;
    setVisibleAppliedSecrets(prev => {
      const next = new Set(prev);
      next.has(uniqueKey) ? next.delete(uniqueKey) : next.add(uniqueKey);
      return next;
    });
  };

  const handleApplyChannel = () => {
    const ch = allChannelOptions.find(c => c.value === selectedChannel);
    if (!ch) return;
    const newEntry: AppliedChannel = {
      type: ch.label,
      channelValue: ch.value,
      status: "running",
      fields: ch.fields || [],
      fieldValues: { ...channelFields },
    };
    setAppliedChannels(prev => [...prev, newEntry]);
    setChannelFields({});
    setShowChannelConfig(false);
    toast.success(`${ch.label} 已添加并应用`);
  };

  const handleDeleteChannel = (idx: number) => {
    setAppliedChannels(prev => prev.filter((_, i) => i !== idx));
    toast.info("通道已删除");
  };

  // 通道配置卡是否显示：默认展开（与「无备用模型」逻辑保持一致）；点击取消收起
  const [showChannelConfig, setShowChannelConfig] = useState(true);

  // 点阵高度计算（复用"我的 Agent"方案）
  // 设计意图：点阵从 header 底部横线开始，到底部分隔栏顶部横线结束（下方 75px 区域为深灰背景）
  const roRef = useRef<ResizeObserver | null>(null);
  const middleSectionRef = useRef<HTMLDivElement | null>(null);
  const headerElRef = useRef<HTMLElement | null>(null);
  const bottomBarElRef = useRef<HTMLDivElement | null>(null);
  const [dotsTop, setDotsTop] = useState(112);
  const [dotsBottom, setDotsBottom] = useState(75);

  const recompute = useCallback(() => {
    const middle = middleSectionRef.current;
    const header = headerElRef.current;
    const bottomBar = bottomBarElRef.current;
    if (!middle) return;
    // top: header 底部 = 点阵起点
    if (header) {
      const middleRect = middle.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      setDotsTop(headerRect.bottom - middleRect.top);
    }
    // bottom: 底部分隔栏顶部 = 点阵终点
    if (bottomBar) {
      const middleRect = middle.getBoundingClientRect();
      const barRect = bottomBar.getBoundingClientRect();
      const barTopInMiddle = barRect.top - middleRect.top;
      setDotsBottom(middle.offsetHeight - barTopInMiddle);
    }
  }, []);

  const middleRef = useCallback((node: HTMLDivElement | null) => {
    middleSectionRef.current = node;
    recompute();
  }, [recompute]);

  const headerRef = useCallback((node: HTMLElement | null) => {
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    headerElRef.current = node;
    if (!node) {
      recompute();
      return;
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(node);
    if (middleSectionRef.current) ro.observe(middleSectionRef.current);
    if (bottomBarElRef.current) ro.observe(bottomBarElRef.current);
    roRef.current = ro;
  }, [recompute]);

  const bottomBarRef = useCallback((node: HTMLDivElement | null) => {
    bottomBarElRef.current = node;
    recompute();
    if (node && roRef.current) {
      roRef.current.observe(node);
    }
  }, [recompute]);

  useEffect(() => {
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [recompute]);

  return (
    <TenantLayout>
      {/* 用户端通用骨架（§7.4）：min-w-[1200px] + max-w-[1920px] + 80px 占位带
          min-h-[calc(100vh-64px)] 保证内容少时也能撑满视口，避免底部出现没有点阵/竖线的"裸露背景"区 */}
      <div className="min-w-[1200px] overflow-x-clip">
        <div className="max-w-[1920px] mx-auto flex items-stretch page-enter min-h-[calc(100vh-64px)]">
          {/* 左侧 80px 占位带 */}
          <div aria-hidden className="shrink-0 w-20 self-stretch" />

          {/* 中间内容区：与 MyOpenClaw 对齐，paddingBottom 75px 留出底部空白 */}
          <div ref={middleRef} className="flex-1 min-w-0 relative flex flex-col" style={{ paddingBottom: "75px" }}>
            {/* 左侧点阵装饰层：从 Header 底部横线 ~ 底部分隔栏顶部横线（中间区域） */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                top: `${dotsTop}px`,
                bottom: `${dotsBottom}px`,
                left: "calc((100% - 100vw) / 2)",
                right: "100%",
                backgroundImage:
                  "radial-gradient(circle, #DFE2E5 1px, transparent 1.1px)",
                backgroundSize: "12px 12px",
              }}
            />
            {/* 右侧点阵装饰层 */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                top: `${dotsTop}px`,
                bottom: `${dotsBottom}px`,
                left: "100%",
                right: "calc((100% - 100vw) / 2)",
                backgroundImage:
                  "radial-gradient(circle, #DFE2E5 1px, transparent 1.1px)",
                backgroundSize: "12px 12px",
              }}
            />
            {/* 左右贯穿竖线（top-0 到 bottom-0 全高贯穿） */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 left-0 z-30"
              style={{ width: "1px", backgroundColor: "#E2E8F0" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 right-0 z-30"
              style={{ width: "1px", backgroundColor: "#E2E8F0" }}
            />

            {/* 内容主体 —— flex-1 + flex-col 保证不满一屏时底部吸底，超出一屏时跟随 */}
            <div className="relative flex flex-col flex-1">
              {/* ======== Header ======== */}
              <header ref={headerRef} className="relative flex items-end justify-between gap-6 px-[42px] py-6">
                {/* Header 底部横线（贯穿全视口） */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{
                    left: "calc(50% - 50vw)",
                    width: "100vw",
                    bottom: 0,
                    height: "1px",
                    backgroundColor: "#E2E8F0",
                  }}
                />

                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                  {/* 返回按钮 */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => navigate("/my-openclaw")}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-[4px] hover:bg-[#f5f5f5] transition-colors"
                          style={{ color: "#525252" }}
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>返回</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* 头像 */}
                  <AgentAvatar
                    roleName="设计师"
                    agentName="多分组示例–前端研发"
                    size={64}
                  />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h1
                        className="text-[24px] font-semibold leading-8"
                        style={{ color: "#0A0A0A", letterSpacing: "-1px" }}
                      >
                        多分组示例–前端研发
                      </h1>
                      {/* 运行中徽标 */}
                      <StatusBadge status="running" />
                    </div>
                    <div
                      className="flex items-center flex-wrap"
                      style={{
                        gap: "4px",
                        fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "20px",
                        color: "#334155",
                      }}
                    >
                      <span
                        className="inline-flex items-center"
                        style={{
                          padding: "2px 6px",
                          borderRadius: "2px",
                          border: "1px solid #DAE0E9",
                          background: "linear-gradient(180deg, #FFFFFF 0%, #F9FBFC 100%)",
                          color: "#334155",
                        }}
                      >
                        通用助手
                      </span>
                      <span style={{ color: "#E2E8F0" }}>｜</span>
                      <span>类型：OpenClaw</span>
                      <span style={{ color: "#E2E8F0" }}>｜</span>
                      <span>ID：ins-grpdemo02</span>
                      <span style={{ color: "#E2E8F0" }}>｜</span>
                      <span>分组：默认</span>
                    </div>
                  </div>
                </div>
                </div>

                {/* 右：操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="claw-outline"
                    size="claw"
                    onClick={() => {
                      toast.success("配置已更新至最新版本");
                    }}
                  >
                    一键更新
                  </Button>
                  <Button
                    variant="claw-outline"
                    size="claw"
                    onClick={() => setPanelDialogOpen(true)}
                  >
                    开启Agent面板
                  </Button>
                  <Button
                    variant="claw-outline"
                    size="claw"
                    onClick={() => navigate("/admin/agent-migration")}
                  >
                    Agent 迁移
                  </Button>
                  <Button
                    variant="claw-primary"
                    size="claw"
                    onClick={() => {
                      localStorage.setItem("openclaw_view_mode", "chat");
                      navigate("/my-openclaw");
                    }}
                  >
                    开始对话
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.00065 14.6663C11.6825 14.6663 14.6673 11.6815 14.6673 7.99967C14.6673 4.31777 11.6825 1.33301 8.00065 1.33301C4.31875 1.33301 1.33398 4.31777 1.33398 7.99967C1.33398 9.77461 2.0276 11.3875 3.15856 12.5821L2.00065 14.6663H8.00065Z" fill="url(#paint0_radial_2181_1771)"/>
                      <rect x="7.5" y="6" width="1.5" height="2" rx="0.75" fill="#D9D9D9"/>
                      <rect x="10.5" y="6" width="1.5" height="2" rx="0.75" fill="#D9D9D9"/>
                      <defs>
                        <radialGradient id="paint0_radial_2181_1771" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14.6673 7.99968) rotate(-180) scale(13.3333 22.1605)">
                          <stop offset="0.839437" stopColor="white"/>
                          <stop offset="1" stopColor="#23C1FF"/>
                        </radialGradient>
                      </defs>
                    </svg>
                  </Button>
                </div>
              </header>

              {/* ======== 横向 Segmented Tab（§8.6 规范）======== */}
              <div className="relative px-[42px] py-4">
                <div
                  className="inline-flex items-center gap-1 p-1 rounded-[4px]"
                  style={{ background: "#F5F5F5" }}
                  role="tablist"
                  aria-label="详情页 Tab 切换"
                >
                  {DETAIL_TABS.map((t) => {
                    const active = t.id === activeTab;
                    return (
                      <button
                        key={t.id}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-3 py-1.5 text-sm rounded-[3px] transition-all duration-150 ${
                          active
                            ? "bg-white text-[#0A0A0A] font-medium"
                            : "text-[#737373] hover:text-[#0A0A0A] font-normal"
                        }`}
                        style={active ? { boxShadow: "var(--shadow-segment)" } : undefined}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ======== 三栏卡片 ======== */}
              <div className="px-[42px] py-0 flex-1">
              {activeTab === "basic" && (
                <div className="grid grid-cols-3 gap-6">
                  {/* ===== 01/ 模型（Models） ===== */}
                  <SurfaceCard className="flex flex-col p-6 gap-4">
                    {/* 标题区 */}
                    <div
                      className="flex items-start justify-between pb-5 min-h-[76px]"
                      style={{ borderBottom: "1px solid #E5E5E5" }}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-2">
                          <span
                            className="text-[18px] leading-6"
                            style={{ fontFamily: "Menlo, Consolas, 'Courier New', monospace", color: "#1447E6" }}
                          >
                            01/
                          </span>
                          <span className="text-[18px] font-medium leading-6" style={{ color: "#020617" }}>
                            模型
                          </span>
                          <span className="text-[15px] leading-6" style={{ color: "#D6D6D6" }}>
                            Models
                          </span>
                        </div>
                        <p className="text-sm leading-5" style={{ color: "#737373" }}>
                          Agent 的"大脑"，决定 Agent 的智能水平和能力范围
                        </p>
                      </div>
                      <ConfiguredBadge />
                    </div>

                    {/* 已应用模型 */}
                    <div className="pt-2">
                      {/* 主模型 */}
                      {appliedModels.filter(m => m.primary).length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-2" style={{ color: "rgba(0,0,0,0.8)" }}>
                            主模型（{appliedModels.filter(m => m.primary).length}）
                          </div>
                          {appliedModels.filter(m => m.primary).map((model) => (
                            <div key={model.id} className="flex flex-col gap-2 mb-2 last:mb-0">
                              <div
                                className="rounded-[4px] p-3 flex flex-col gap-2"
                                style={{ border: "1px solid #E5E5E5" }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium" style={{ color: "#0A0A0A" }}>
                                      {model.providerLabel}
                                    </span>
                                    <span className="text-xs" style={{ color: "#737373" }}>{model.versionLabel}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      aria-label="编辑"
                                      className="text-[#737373] hover:text-[#1447E6] transition-colors"
                                      onClick={() => handleEditPrimary(model.id)}
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                {model.adminPreset && (
                                  <span
                                    className="inline-flex self-start items-center px-2 py-0.5 text-xs rounded-[3px]"
                                    style={{ border: "1px solid #E5E5E5", color: "#737373" }}
                                  >
                                    管理员预置
                                  </span>
                                )}
                              </div>

                              {/* 主模型「修改为」编辑卡 —— 与添加备用模型卡片样式一致 */}
                              {editingPrimaryId === model.id && (
                                <div className="rounded-[4px] bg-[#FAFAFA] border border-[#E5E5E5] p-3 flex flex-col gap-2">
                                  <div className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.8)" }}>
                                    修改为
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {/* 模型选择级联（与备用模型一致的视觉） */}
                                    {(() => {
                                      const editDisplayLabel = (() => {
                                        const p = MODEL_PROVIDERS.find(p => p.value === editProvider);
                                        const v = p?.versions.find(v => v.value === editModel);
                                        return p && v ? `${p.label} / ${v.label}` : "选择模型";
                                      })();
                                      return (
                                        <div className="relative flex-1">
                                          <button
                                            type="button"
                                            onClick={() => setEditCascadeOpen(!editCascadeOpen)}
                                            className="w-full flex items-center justify-between h-10 px-3 text-sm rounded-[4px] border border-[#E5E5E5] bg-white hover:border-[#1447E6] transition-colors text-left"
                                          >
                                            <span className="truncate" style={{ color: editDisplayLabel === "选择模型" ? "#A3A3A3" : "#0A0A0A" }}>
                                              {editDisplayLabel}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform ${editCascadeOpen ? "rotate-180" : ""}`} />
                                          </button>
                                          {editCascadeOpen && (
                                            <>
                                              <div className="fixed inset-0 z-40" onClick={() => { setEditCascadeOpen(false); setEditHoveredProvider(null); }} />
                                              <div
                                                className="absolute left-0 top-full mt-1 z-50 bg-white border border-[#E5E5E5] rounded-[4px] py-1 w-full"
                                                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                                              >
                                                {MODEL_PROVIDERS.filter(p => p.value !== "custom").map((p) => (
                                                  <div
                                                    key={p.value}
                                                    className="relative"
                                                    onMouseEnter={() => setEditHoveredProvider(p.value)}
                                                    onMouseLeave={() => setEditHoveredProvider(null)}
                                                  >
                                                    <div
                                                      className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                                                        editProvider === p.value ? "bg-blue-50 text-[#1447E6]" : "text-[#0A0A0A] hover:bg-[#F5F5F5]"
                                                      }`}
                                                    >
                                                      {p.label}
                                                      <ChevronDown className="w-3.5 h-3.5 text-[#737373] -rotate-90" />
                                                    </div>
                                                    {editHoveredProvider === p.value && (
                                                      <div
                                                        className="absolute left-full top-0 ml-1 bg-white border border-[#E5E5E5] rounded-[4px] py-1 min-w-[180px]"
                                                        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                                                      >
                                                        {p.versions.map((v) => (
                                                          <div
                                                            key={v.value}
                                                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                                              editProvider === p.value && editModel === v.value
                                                                ? "bg-blue-50 text-[#1447E6] font-medium"
                                                                : "text-[#0A0A0A] hover:bg-[#F5F5F5]"
                                                            }`}
                                                            onClick={() => {
                                                              setEditProvider(p.value);
                                                              setEditModel(v.value);
                                                              setEditCascadeOpen(false);
                                                              setEditHoveredProvider(null);
                                                            }}
                                                          >
                                                            {v.label}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      className="flex-1"
                                      onClick={handleConfirmEditPrimary}
                                    >
                                      确认
                                    </Button>
                                    <Button
                                      variant="claw-outline"
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => setEditingPrimaryId(null)}
                                    >
                                      取消
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* 备用模型（始终展示标题） */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium" style={{ color: "rgba(0,0,0,0.8)" }}>
                            备用模型（{appliedModels.filter(m => !m.primary).length}）
                          </div>
                          {!showAddBackupModel && (
                            <button
                              className="inline-flex items-center gap-1 text-xs hover:opacity-80"
                              style={{ color: "#1447E6" }}
                              onClick={() => setShowAddBackupModel(true)}
                            >
                              <Plus className="w-3 h-3" />
                              添加备用模型
                            </button>
                          )}
                        </div>
                        {/* 添加模型操作区（仅由 showAddBackupModel 控制；点击取消即收起） */}
                        {showAddBackupModel && (
                        <div className="rounded-[4px] bg-[#FAFAFA] border border-[#E5E5E5] p-3 flex flex-col gap-3 mb-3">
                    {/* 模型选择（级联：厂商 > 版本） */}
                    <div className="relative w-full">
                      <button
                        type="button"
                        onClick={() => setBackupCascadeOpen(!backupCascadeOpen)}
                        className="w-full flex items-center justify-between h-10 px-3 text-sm rounded-[4px] border border-[#E5E5E5] bg-white hover:border-[#1447E6] transition-colors text-left"
                      >
                        <span className="truncate" style={{ color: (() => { const p = MODEL_PROVIDERS.find(p => p.value === selectedProvider); const v = p?.versions.find(v => v.value === selectedModel); return p && v ? "#0A0A0A" : "#A3A3A3"; })() }}>
                          {(() => { const p = MODEL_PROVIDERS.find(p => p.value === selectedProvider); const v = p?.versions.find(v => v.value === selectedModel); return p && v ? `${p.label} / ${v.label}` : "选择模型"; })()}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform ${backupCascadeOpen ? "rotate-180" : ""}`} />
                      </button>
                      {backupCascadeOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => { setBackupCascadeOpen(false); setBackupHoveredProvider(null); }} />
                          <div
                            className="absolute left-0 top-full mt-1 z-50 bg-white border border-[#E5E5E5] rounded-[4px] py-1 w-full"
                            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                          >
                            {MODEL_PROVIDERS.filter(p => p.value !== "custom").map((p) => (
                              <div
                                key={p.value}
                                className="relative"
                                onMouseEnter={() => setBackupHoveredProvider(p.value)}
                                onMouseLeave={() => setBackupHoveredProvider(null)}
                              >
                                <div
                                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                                    selectedProvider === p.value ? "bg-blue-50 text-[#1447E6]" : "text-[#0A0A0A] hover:bg-[#F5F5F5]"
                                  }`}
                                >
                                  {p.label}
                                  <ChevronDown className="w-3.5 h-3.5 text-[#737373] -rotate-90" />
                                </div>
                                {backupHoveredProvider === p.value && (
                                  <div
                                    className="absolute left-full top-0 ml-1 bg-white border border-[#E5E5E5] rounded-[4px] py-1 min-w-[180px]"
                                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                                  >
                                    {p.versions.map((v) => (
                                      <div
                                        key={v.value}
                                        className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                          selectedProvider === p.value && selectedModel === v.value
                                            ? "bg-blue-50 text-[#1447E6] font-medium"
                                            : "text-[#0A0A0A] hover:bg-[#F5F5F5]"
                                        }`}
                                        onClick={() => {
                                          setSelectedProvider(p.value);
                                          setSelectedModel(v.value);
                                          setBackupCascadeOpen(false);
                                          setBackupHoveredProvider(null);
                                        }}
                                      >
                                        {v.label}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                          {/* 操作按钮（底部均分） */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => { handleApplyModel(); setShowAddBackupModel(false); }}
                            >
                              添加
                            </Button>
                            <Button
                              variant="claw-outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setBackupCascadeOpen(false);
                                setBackupHoveredProvider(null);
                                setShowAddBackupModel(false);
                              }}
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                        )}
                        {/* 备用模型列表 */}
                        {appliedModels.filter(m => !m.primary).length > 0 && (
                          <div className="space-y-2">
                            {appliedModels.filter(m => !m.primary).map((model) => (
                              <div
                                key={model.id}
                                className="rounded-[4px] p-3 flex items-center justify-between"
                                style={{ border: "1px solid #E5E5E5" }}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium" style={{ color: "#0A0A0A" }}>
                                    {model.providerLabel}
                                  </span>
                                  <span className="text-xs" style={{ color: "#737373" }}>{model.versionLabel}</span>
                                </div>
                                <button
                                  className="text-[#737373] hover:text-[#DC2626] transition-colors"
                                  onClick={() => handleDeleteModel(model.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </SurfaceCard>

                  {/* ===== 02/ 通道（Channels） ===== */}
                  <SurfaceCard className="flex flex-col p-6 gap-4">
                    {/* 标题区 */}
                    <div
                      className="flex items-start justify-between pb-5 min-h-[76px]"
                      style={{ borderBottom: "1px solid #E5E5E5" }}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-2">
                          <span
                            className="text-[18px] leading-6"
                            style={{ fontFamily: "Menlo, Consolas, 'Courier New', monospace", color: "#1447E6" }}
                          >
                            02/
                          </span>
                          <span className="text-[18px] font-medium leading-6" style={{ color: "#020617" }}>
                            通道
                          </span>
                          <span className="text-[15px] leading-6" style={{ color: "#D6D6D6" }}>
                            Channels
                          </span>
                        </div>
                        <p className="text-sm leading-5" style={{ color: "#737373" }}>
                          用户与 Agent 交互的入口，支持微信、QQ、飞书等
                        </p>
                      </div>
                      <ConfiguredBadge />
                    </div>

                    {/* 通道配置：始终展示「已接入通道」小标题 + 添加配置卡 / 添加按钮 + 通道列表 */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium" style={{ color: "rgba(0,0,0,0.8)" }}>
                          已接入通道（{appliedChannels.length}）
                        </div>
                        {!showChannelConfig && (
                          <button
                            className="inline-flex items-center gap-1 text-xs hover:opacity-80"
                            style={{ color: "#1447E6" }}
                            onClick={() => setShowChannelConfig(true)}
                          >
                            <Plus className="w-3 h-3" />
                            添加通道
                          </button>
                        )}
                      </div>

                        {/* 点击「添加通道」后，配置卡出现在小标题下方 */}
                        {showChannelConfig && (
                          <div className="rounded-[4px] bg-[#FAFAFA] border border-[#E5E5E5] p-3 space-y-3 mb-3">
                            {/* 通道选择下拉 */}
                            <Select value={selectedChannel} onValueChange={(v) => { setSelectedChannel(v); setChannelFields({}); }}>
                              <SelectTrigger className="w-full rounded-[4px] border-[#E5E5E5] bg-white">
                                <SelectValue placeholder="选择通道类型" />
                              </SelectTrigger>
                              <SelectContent>
                                {allChannelOptions.map((c) => (
                                  <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* 通道配置表单 */}
                            {currentChannelConfig?.fields && currentChannelConfig.fields.length > 0 && (
                              <div className="space-y-3">
                                {currentChannelConfig.fields.map((field) => (
                                  <div key={field.key} className="space-y-1">
                                    <label className="text-xs font-medium text-[#525252]">{field.label}</label>
                                    <div className="relative">
                                      <Input
                                        type={field.secret && !visibleSecrets.has(field.key) ? "password" : "text"}
                                        placeholder={`请输入${field.label}`}
                                        value={channelFields[field.key] || ""}
                                        onChange={(e) => setChannelFields({ ...channelFields, [field.key]: e.target.value })}
                                        className="h-9 rounded-[4px] text-sm pr-9 bg-white"
                                      />
                                      {field.secret && (
                                        <button
                                          type="button"
                                          onClick={() => toggleSecretVisibility(field.key)}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A] transition-colors"
                                        >
                                          {visibleSecrets.has(field.key) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 前往授权 + 取消 按钮 */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => { handleApplyChannel(); setShowChannelConfig(false); }}
                              >
                                前往授权
                              </Button>
                              <Button
                                variant="claw-outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  setChannelFields({});
                                  setShowChannelConfig(false);
                                }}
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        )}

                        {appliedChannels.length > 0 && (
                        <div className="space-y-2">
                          {appliedChannels.map((ch, idx) => (
                            <div
                              key={`${ch.channelValue}-${idx}`}
                              className="rounded-[4px] border border-[#E5E5E5] overflow-hidden"
                            >
                              {/* 通道头部 */}
                              <div
                                className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedChannelIdx(prev => prev === idx ? null : idx)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium" style={{ color: "#0A0A0A" }}>{ch.type}</span>
                                  <Badge variant="secondary" className="bg-[rgba(22,163,74,0.08)] border-0 text-[#16A34A] text-[10px]">
                                    运行中
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteChannel(idx); }}
                                    className="p-1 rounded text-[#737373] hover:text-[#DC2626] transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  {expandedChannelIdx === idx
                                    ? <ChevronDown className="w-4 h-4 text-[#737373]" />
                                    : <ChevronDown className="w-4 h-4 text-[#737373] -rotate-90" />
                                  }
                                </div>
                              </div>
                              {/* 展开的配置详情 */}
                              {expandedChannelIdx === idx && ch.fields.length > 0 && (
                                <div className="border-t border-[#E5E5E5] px-4 py-3 bg-[#FAFAFA] space-y-2">
                                  {ch.fields.map((field) => {
                                    const val = ch.fieldValues[field.key] || "";
                                    const uniqueKey = `${idx}-${field.key}`;
                                    const isVisible = visibleAppliedSecrets.has(uniqueKey);
                                    const displayVal = field.secret && !isVisible ? maskSecret(val) : val;
                                    return (
                                      <div key={field.key} className="flex items-center gap-1 text-sm">
                                        <span className="text-[#737373] shrink-0">{field.label}：</span>
                                        <span className="text-[#0A0A0A] font-mono break-all flex-1">{displayVal || "—"}</span>
                                        {field.secret && (
                                          <button
                                            onClick={() => toggleAppliedSecretVisibility(idx, field.key)}
                                            className="text-[#737373] hover:text-[#0A0A0A] transition-colors p-0.5"
                                          >
                                            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        )}
                      </div>
                  </SurfaceCard>

                  {/* ===== 03/ 技能（Skills） ===== */}
                  <SurfaceCard className="flex flex-col p-6 gap-3">
                    <div
                      className="flex items-start justify-between pb-5 min-h-[76px]"
                      style={{ borderBottom: "1px solid #E5E5E5" }}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-2">
                          <span
                            className="text-[18px] leading-6"
                            style={{ fontFamily: "Menlo, Consolas, 'Courier New', monospace", color: "#0052D9" }}
                          >
                            03/
                          </span>
                          <span className="text-[18px] font-medium leading-6" style={{ color: "#020617" }}>
                            技能
                          </span>
                          <span className="text-[15px] leading-6" style={{ color: "#D6D6D6" }}>
                            Skills
                          </span>
                        </div>
                        <p className="text-sm leading-5" style={{ color: "#737373" }}>
                          为 Agent 添加搜索、绘图等扩展能力
                        </p>
                      </div>
                      <ConfiguredBadge />
                    </div>

                    {/* 安装技能按钮 */}
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => setSkillModalOpen(true)}
                    >
                      安装技能
                    </Button>

                    {/* 已安装技能列表 */}
                    <div className="flex flex-col gap-3 mt-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium" style={{ color: "rgba(0,0,0,0.8)" }}>
                          已安装技能（{installedSkills.filter((s) => skillSearch ? s.name.includes(skillSearch) : true).length}）
                        </div>
                      </div>
                      {/* Skill 搜索输入框 */}
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                          style={{ color: "rgba(0,0,0,0.4)" }}
                        />
                        <Input
                          placeholder="输入skill名称搜索"
                          className="h-9 pl-9 rounded-[4px] text-sm"
                        />
                      </div>
                      <div
                        className="rounded-[4px] flex flex-col h-[280px] overflow-y-auto"
                        style={{ background: "#FAFAFA", border: "1px solid #E6E9EF" }}
                      >
                        {installedSkills.filter((s) =>
                          skillSearch ? s.name.includes(skillSearch) : true,
                        ).map((s, idx) => (
                          <div
                            key={`${s.name}-${idx}`}
                            className="flex items-center px-4 text-sm h-9 shrink-0"
                            style={{ color: "#0A0A0A" }}
                          >
                            {s.name} {s.version}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 待安装技能（动态状态机：pending / installing / failed） */}
                    {pendingSkills.length > 0 && (
                      <div className="flex flex-col gap-3 mt-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium" style={{ color: "rgba(0,0,0,0.8)" }}>
                            待安装技能（{pendingSkills.length}）
                          </div>
                          {pendingSkills.some((s) => s.status === "failed") && (
                            <div className="flex items-center gap-3">
                              <button
                                className="inline-flex items-center gap-1 text-xs hover:opacity-80"
                                style={{ color: "#1447E6" }}
                                onClick={handleRetryAllFailed}
                              >
                                <RefreshCw className="w-3 h-3" />
                                重试
                              </button>
                              <button
                                className="inline-flex items-center gap-1 text-xs hover:opacity-80"
                                style={{ color: "#1447E6" }}
                                onClick={handleDeleteAllFailed}
                              >
                                <Trash2 className="w-3 h-3" />
                                删除
                              </button>
                            </div>
                          )}
                        </div>
                        <div
                          className="rounded-[4px] flex flex-col max-h-[280px] overflow-y-auto"
                          style={{ background: "#FAFAFA", border: "1px solid #E6E9EF" }}
                        >
                          {pendingSkills.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between px-4 h-9 shrink-0"
                            >
                              <span className="text-sm truncate" style={{ color: "#0A0A0A" }}>
                                {s.name}
                              </span>
                              {s.status === "installing" && (
                                <span
                                  className="inline-flex items-center gap-1 text-xs flex-shrink-0"
                                  style={{ color: "#1447E6" }}
                                >
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  安装中
                                </span>
                              )}
                              {s.status === "pending" && (
                                <span className="text-xs flex-shrink-0" style={{ color: "#737373" }}>
                                  待安装
                                </span>
                              )}
                              {s.status === "failed" && (
                                <span
                                  className="inline-flex items-center gap-1 text-xs flex-shrink-0"
                                  style={{ color: "#DC2626" }}
                                >
                                  <XCircle className="w-3 h-3" />
                                  安装失败
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </SurfaceCard>
                </div>
              )}

              {/* 工具管理 tab */}
              {activeTab === "tools" && (
                <div className="w-full">
                  <ToolsMcpPanel />
                </div>
              )}

              {/* 记忆管理 tab */}
              {activeTab === "memory" && (
                <SurfaceCard className="p-0">
                  <div className="px-6 pt-6 pb-4 border-b border-[#E5E5E5]">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold" style={{ color: "#0A0A0A" }}>Memory Pro 服务</h2>
                      <Badge variant="secondary" className="bg-[rgba(22,163,74,0.08)] border-0 text-[#16A34A]">已开启</Badge>
                    </div>
                    <p className="text-sm mt-1" style={{ color: "#737373", lineHeight: "17px" }}>基于腾讯云向量数据库的企业级记忆服务，实现语义级记忆检索与数据管理。</p>
                  </div>
                  <div className="p-6">
                    <MemoryPreview
                      memoryStatus={memoryStatus}
                      proQuotaAvailable={proQuotaAvailable}
                      showConfidence={false}
                      isLoading={memoryLoading}
                      onStatusChange={async (newStatus) => {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        setMemoryStatus(newStatus);
                      }}
                    />
                  </div>
                </SurfaceCard>
              )}

              {/* 网盘管理 tab */}
              {activeTab === "files" && (
                <FileSpace
                  clawName="OpenClaw 引导预览"
                  clawId="guide-preview"
                  basePath="https://smh3jsttekkpsoqw.api.tencentsmh.cn"
                  libraryId="smh3jsttekkpsoqw"
                  spaceId="space232t1yug3w7up"
                  getAccessToken={async () => ({
                    accessToken:
                      "acctk021cf0f24emnem68z3dzwr734zcdpl74fd7783cgdesppskermqhhu7d9pnns4exa5gvc84n2yfhdq5unt754belzzvkwcd5psjuznzwt7jbcs2zsm5c3828ba4",
                    expiresAt: Date.now() + 3600 * 24 * 1000,
                  })}
                />
              )}

              {/* 龙虾医院 tab（仅含「一键修复」卡片，引导页不嵌入龙虾医生对话） */}
              {activeTab === "doctor" && (
                <div className="flex flex-col gap-5">
                  <SurfaceCard className="p-6">
                    <h2 className="text-base font-semibold mb-2" style={{ color: "#0A0A0A" }}>一键修复</h2>
                    <p className="text-sm mb-4" style={{ color: "#737373" }}>
                      适合龙虾配置文件中 API KEY、插件、通道等配置异常导致无法启动等常见问题，系统自动检测并尝试修复。
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm" style={{ color: "#334155" }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#A3A3A3" }} />
                        自动执行
                        <code className="px-2 py-0.5 rounded-[2px] font-mono text-xs" style={{ backgroundColor: "#F5F5F5", color: "#334155" }}>agent doctor --fix</code>
                      </li>
                      <li className="flex items-center gap-2 text-sm" style={{ color: "#334155" }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#A3A3A3" }} />
                        自动恢复常见配置问题
                      </li>
                      <li className="flex items-center gap-2 text-sm" style={{ color: "#334155" }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#A3A3A3" }} />
                        恢复前会将配置文件备份
                      </li>
                    </ul>
                    <div className="pt-4" style={{ borderTop: "1px solid #E5E5E5" }}>
                      {quickFixState === "idle" && (
                        <Button variant="claw-primary" size="claw-sm" onClick={runQuickFixMock}>
                          一键修复
                        </Button>
                      )}
                      {quickFixState === "loading" && (
                        <div className="inline-flex items-center gap-2 px-3 h-8 rounded-[4px] text-xs" style={{ backgroundColor: "#F5F5F5", color: "#737373" }}>
                          <span className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: "#E5E5E5", borderTopColor: "#737373" }} />
                          正在执行修复
                        </div>
                      )}
                      {quickFixState === "success" && (
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="badge-running inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                            修复成功
                          </span>
                          <span className="text-xs" style={{ color: "#737373" }}>Gateway 已正常启动，请前往 Agent 对话确认问题是否已解决</span>
                        </div>
                      )}
                      {quickFixState === "failed" && (
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="badge-stopped inline-flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            修复失败
                          </span>
                          <span className="text-xs" style={{ color: "#737373" }}>{quickFixFailReason}，建议开启龙虾医生进行深度诊断</span>
                        </div>
                      )}
                    </div>
                  </SurfaceCard>

                  {/* 引导页提示：龙虾医生对话需进入实例详情 */}
                  <SurfaceCard className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-base font-semibold" style={{ color: "#0A0A0A" }}>龙虾医生</h2>
                      <Badge variant="secondary" className="text-[#737373] bg-[#F5F5F5] border-transparent rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium">
                        未开启
                      </Badge>
                    </div>
                    <p className="text-sm" style={{ color: "#737373" }}>
                      支持自然语言对话式排障，需在管控端开启「允许用户使用龙虾医生」后，
                      进入实例详情页查看完整对话能力。
                    </p>
                  </SurfaceCard>
                </div>
              )}
              </div>

              {/* 底部分隔栏（对齐 MyOpenClaw 分页栏样式）：自带顶部贯穿全视口横线，
                  作为点阵装饰层的下边界；下方由父容器 paddingBottom:75px 留出空白 */}
              <div ref={bottomBarRef} className="relative mt-6 px-6 py-3 h-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{
                    left: "calc(50% - 50vw)",
                    width: "100vw",
                    top: 0,
                    height: "1px",
                    backgroundColor: "#E2E8F0",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 右侧 80px 占位带 */}
          <div aria-hidden className="shrink-0 w-20 self-stretch" />
        </div>
      </div>

      {/* 安装新技能弹窗 */}
      <SkillInstallModal open={skillModalOpen} onOpenChange={setSkillModalOpen} onEnqueue={handleEnqueueSkills} />

      {/* 开启 Agent 面板弹窗 */}
      <Dialog open={panelDialogOpen} onOpenChange={setPanelDialogOpen}>
        <DialogContent className="sm:max-w-fit">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">开启面板</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-5">
            <div className="bg-orange-50 border border-orange-100 rounded-[4px] px-4 py-3">
              <p className="text-sm font-semibold text-orange-600 leading-relaxed">
                访问链接已生成，该链接含有您的 API Key 和加密配置，请勿分享给第三方，以防隐私泄露或资产损失。
              </p>
            </div>
            <div className="rounded-[4px] border border-[#E5E5E5] overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm text-muted-foreground w-24 shrink-0">WebSocket URL</span>
                <a
                  href="http://43.139.137.45:38341/knmnz8?token=8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-foreground font-mono truncate hover:underline cursor-pointer"
                >
                  http://43.139.137.45:38341/knmnz8?token=8512b8ef...
                </a>
                <button
                  className="p-1.5 rounded-[4px] hover:bg-[#EFF6FF] text-[#737373] hover:text-[#1447E6] transition-colors"
                  onClick={() => { navigator.clipboard.writeText("http://43.139.137.45:38341/knmnz8?token=8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb"); toast.success("已复制"); }}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="h-px bg-[#F0F0F0]" />
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm text-muted-foreground w-24 shrink-0">网关令牌</span>
                <span className="flex-1 text-sm text-foreground font-mono truncate">
                  8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb
                </span>
                <button
                  className="p-1.5 rounded-[4px] hover:bg-[#EFF6FF] text-[#737373] hover:text-[#1447E6] transition-colors"
                  onClick={() => { navigator.clipboard.writeText("8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb"); toast.success("已复制"); }}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              用浏览器打开 WebSocket URL，如面板需要填入网关令牌，则将网关令牌复制并粘贴过去，即可进入面板。
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="claw-outline"
              onClick={() => setPanelDialogOpen(false)}
            >
              关闭
            </Button>
            <Button
              onClick={() => { window.open("http://43.139.137.45:38341/knmnz8?token=8512b8ef93cdfd393ad6af5efa42c1e54981f3cb69f381eb", "_blank"); }}
            >
              立即访问
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TenantLayout>
  );
}
