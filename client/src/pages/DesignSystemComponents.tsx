import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CircleAlert,
  FileText,
  Info,
  PanelLeft,
  Plus,
  Search,
  Settings,
} from "lucide-react";

import { Button, SmallIconStateButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Alert,
  AlertDescription,
  AlertInfoIcon,
  AlertOperationInfoIcon,
  AlertProductNewsIcon,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableActionCell,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import {
  Segment,
  SegmentContent,
  SegmentItem,
  SegmentList,
} from "@/components/ui/segment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusTag } from "@/components/ui/status-tag";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  SurfaceCard,
  SurfaceConfig,
  SurfaceInner,
  SurfaceOverlay,
} from "@/components/ui/Surface";
import {
  BodyMedium,
  BodyText,
  CardTitle,
  CodeText,
  InlineNumber,
  MetaMedium,
  MetaText,
  PanelTitle,
  SectionTitle,
  StatNumber,
  StepText,
  TenantHeroTitle,
  TenantPageTitle,
  TinyText,
} from "@/components/ui/Typography";
import {
  AdminSidebarBadge,
  AdminSidebarGroupLabel,
  AdminSidebarHeaderAction,
  AdminSidebarLogo,
  AdminSidebarMenu,
  AdminSidebarMenuButton,
  AdminSidebarMenuItem,
} from "@/components/ui/admin-sidebar";
import {
  CenterTabs,
  HelpIcon,
  NavDivider,
  NavIconButton,
  NotificationPanel,
  SwitchAdminIcon,
  UserMenu,
} from "@/components/topnav";
import type { Notification } from "@/components/topnav";

const ADMIN_ICON_BASE = "/assets/admin-sidebar";
const DOCUMENTED_COMPONENT_COUNT = "31+";

const GROUP_LABELS = {
  foundation: "基础视觉",
  action: "操作组件",
  form: "表单组件",
  feedback: "反馈组件",
  data: "数据展示",
  navigation: "导航与布局",
  admin: "管控端专属",
} as const;

type GroupKey = keyof typeof GROUP_LABELS;
type Platform = "Global 全局" | "Tenant 用户端" | "Admin 管控端";
type ComponentId =
  | "typography"
  | "surface-card"
  | "surface-inner"
  | "surface-config"
  | "surface-overlay"
  | "button"
  | "input"
  | "textarea"
  | "select"
  | "date-picker"
  | "checkbox"
  | "radio-group"
  | "switch"
  | "alert"
  | "dialog"
  | "alert-dialog"
  | "tooltip"
  | "popover"
  | "progress"
  | "table"
  | "pagination"
  | "badge"
  | "status-tag"
  | "empty"
  | "segment"
  | "tabs"
  | "topnav"
  | "admin-sidebar";

type ApplicationPage = {
  name: string;
  path: string;
  platform: Platform;
  priority: "高" | "中" | "补充";
  usage: string;
};

type ComponentMeta = {
  id: ComponentId;
  group: GroupKey;
  name: string;
  cnName: string;
  description: string;
  owner: string;
  maintainer?: string;
  source: string;
  doc: string;
  platform: Platform;
  adoption: "高频参考" | "核心参考" | "常用" | "专用" | "持续补充中";
  applicationSummary: string;
  applicationScope: string;
  moduleCount: number;
  instanceCount: number;
  tags: string[];
  usage: string[];
  notes: string[];
  migration: string[];
  applicationPages?: ApplicationPage[];
};

const baseGuidance = {
  global: ["优先复用全局组件，不建议在业务页面重新拼装相同样式。", "页面效果校准时，以本页真实组件状态为参考。"],
  tenant: ["用户端组件需要关注导航、内容骨架、文字层级和卡片层级的一致性。", "未来用户端与管控端如出现圆角或密度差异，以端类型组件规范为准。"],
  admin: ["管控端组件需要关注信息密度、表格、导航、配置表单和操作反馈。", "管控端专属组件不套用用户端页面骨架。"],
};

const COMPONENTS: ComponentMeta[] = [
  {
    id: "typography",
    group: "foundation",
    name: "Typography",
    cnName: "字体语义组件",
    description: "统一标题、正文、Meta、数字、代码与步骤文字的语义入口。",
    owner: "miekoyychen / addietang",
    source: "client/src/components/ui/Typography.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Typography 字体组件",
    platform: "Global 全局",
    adoption: "核心参考",
    applicationSummary: "核心文字体系，新增用户端页面优先参考。",
    applicationScope: "页面标题、卡片标题、正文说明、数字、路径与步骤标识",
    moduleCount: 18,
    instanceCount: 74,
    tags: ["已接入预览", "核心参考"],
    usage: ["页面标题、模块标题、卡片标题", "正文说明、辅助信息、时间与 ID", "统计数字、表格数字、代码路径"],
    notes: ["新增页面优先使用 Typography 语义组件。", "不要用散落的 text-gray-* 表达基础文字色。", "数字、代码、步骤标识优先使用专用组件。"],
    migration: ["页面标题 → TenantPageTitle / TenantHeroTitle", "卡片标题 → CardTitle", "ID / Token / 路径 → CodeText", "统计大数字 → StatNumber"],
  },
  {
    id: "surface-card",
    group: "foundation",
    name: "SurfaceCard",
    cnName: "表层卡片容器",
    description: "用于页面主区块、列表卡、统计卡和可点击信息卡。",
    owner: "miekoyychen / addietang",
    source: "client/src/components/ui/Surface.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Surface 卡片规范",
    platform: "Global 全局",
    adoption: "高频参考",
    applicationSummary: "卡片容器高频参考，已用于多个主流程页面。",
    applicationScope: "页面主区块、列表卡、统计卡、Agent 卡",
    moduleCount: 36,
    instanceCount: 86,
    tags: ["已接入预览", "高频参考"],
    usage: ["页面主区块", "可点击信息卡", "统计卡片"],
    notes: ["主卡片使用 SurfaceCard，不建议手写卡片阴影。", "需要可点击微动效时使用 hover 属性。"],
    migration: ["手写主卡片 → SurfaceCard", "可点击卡片 → SurfaceCard hover"],
  },
  {
    id: "surface-inner",
    group: "foundation",
    name: "SurfaceInner",
    cnName: "内嵌卡片容器",
    description: "用于卡片内部的子面板、表格容器和分组面板。",
    owner: "miekoyychen / addietang",
    source: "client/src/components/ui/Surface.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Surface 卡片规范",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "常用于卡片内的二级信息分组。",
    applicationScope: "子面板、内嵌表格、分组容器",
    moduleCount: 22,
    instanceCount: 43,
    tags: ["已接入预览", "常用"],
    usage: ["卡片内分组面板", "表格外壳", "二级信息区"],
    notes: ["内嵌卡片强调低层级，不要使用强阴影。", "与 SurfaceCard 嵌套使用时保持信息层级清晰。"],
    migration: ["卡片内子容器 → SurfaceInner", "表格外壳 → SurfaceInner"],
  },
  {
    id: "surface-config",
    group: "foundation",
    name: "SurfaceConfig",
    cnName: "高亮配置卡",
    description: "用于管理端操作要点、引导卡和需要略强存在感的配置卡。",
    owner: "miekoyychen / addietang",
    source: "client/src/components/ui/Surface.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Surface 卡片规范",
    platform: "Admin 管控端",
    adoption: "常用",
    applicationSummary: "管控端配置说明与重点操作区域常用。",
    applicationScope: "操作要点、引导卡、Pro 推荐卡、配置说明区",
    moduleCount: 12,
    instanceCount: 24,
    tags: ["已接入预览", "Admin 管控端"],
    usage: ["管理端配置说明", "重点操作引导", "推荐配置卡"],
    notes: ["用于需要强调的配置卡，不要替代所有普通卡片。", "管控端场景优先参考。"],
    migration: ["强调型配置卡 → SurfaceConfig", "管理端引导卡 → SurfaceConfig"],
  },
  {
    id: "surface-overlay",
    group: "foundation",
    name: "SurfaceOverlay",
    cnName: "浮层容器",
    description: "用于自定义浮层容器，Dialog、Popover 等通常已经内置浮层样式。",
    owner: "miekoyychen / addietang",
    source: "client/src/components/ui/Surface.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Surface 卡片规范",
    platform: "Global 全局",
    adoption: "专用",
    applicationSummary: "专用于少量自定义浮层场景。",
    applicationScope: "自定义下拉、浮动说明、自定义菜单外壳",
    moduleCount: 6,
    instanceCount: 10,
    tags: ["已接入预览", "专用"],
    usage: ["自定义浮层", "自定义菜单", "临时信息面板"],
    notes: ["Dialog / Popover / DropdownMenu 通常不需要再包 SurfaceOverlay。", "仅在自定义浮层外壳时使用。"],
    migration: ["自定义浮层外壳 → SurfaceOverlay"],
  },
  {
    id: "button",
    group: "action",
    name: "Button",
    cnName: "按钮",
    description: "覆盖主操作、次级操作、弹窗确认、危险操作与表格文字操作。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/button.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Button 组件",
    platform: "Global 全局",
    adoption: "高频参考",
    applicationSummary: "高频参考，已在多个核心页面中使用。",
    applicationScope: "页面主操作、弹窗确认、卡片操作、表格操作",
    moduleCount: 42,
    instanceCount: 128,
    tags: ["已接入预览", "高频参考"],
    usage: ["页面主操作和创建入口", "卡片底部详情、刷新、重试", "弹窗确认、取消、危险操作", "表格操作列文本按钮"],
    notes: ["主操作使用 claw-primary，次级操作使用 claw-outline。", "表格操作列优先使用 link-dark 或 TableActionCell。", "不建议覆盖组件内置颜色、圆角和 disabled 态。"],
    migration: ["手写主按钮 → Button variant=\"claw-primary\"", "手写次级按钮 → Button variant=\"claw-outline\"", "弹窗确认 → Button variant=\"dialog-confirm\"", "表格操作 → TableActionCell + Button"],
  },
  {
    id: "input",
    group: "form",
    name: "Input",
    cnName: "输入框",
    description: "用于单行文本输入、搜索输入和弹窗字段输入。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/input.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Input 组件",
    platform: "Global 全局",
    adoption: "高频参考",
    applicationSummary: "表单场景高频参考，已在配置页和弹窗中广泛使用。",
    applicationScope: "表单输入、搜索筛选、弹窗字段",
    moduleCount: 39,
    instanceCount: 96,
    tags: ["已接入预览", "高频参考"],
    usage: ["配置表单", "搜索输入", "弹窗字段"],
    notes: ["默认白底，不建议额外加灰色底。", "错误态使用 aria-invalid 并配合错误说明。", "弹窗内也必须复用 Input。"],
    migration: ["原生 input → Input", "手写搜索框 → Input + Search icon"],
  },
  {
    id: "textarea",
    group: "form",
    name: "Textarea",
    cnName: "多行文本域",
    description: "用于说明、备注、配置描述等多行文本输入。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/textarea.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · 其他组件速查",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "常用于配置说明和备注填写。",
    applicationScope: "备注、描述、说明、长文本输入",
    moduleCount: 14,
    instanceCount: 22,
    tags: ["已接入预览", "常用"],
    usage: ["备注填写", "描述输入", "长文本配置"],
    notes: ["视觉状态与 Input 保持一致。", "不要手写不同边框和 focus 态。"],
    migration: ["原生 textarea → Textarea"],
  },
  {
    id: "select",
    group: "form",
    name: "Select",
    cnName: "下拉选择",
    description: "用于单选下拉，Trigger 与 Input 对齐。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/select.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Select 组件",
    platform: "Global 全局",
    adoption: "高频参考",
    applicationSummary: "表单选择场景高频参考，常用于配置和筛选。",
    applicationScope: "表单选择、筛选条件、弹窗内选择",
    moduleCount: 33,
    instanceCount: 78,
    tags: ["已接入预览", "高频参考"],
    usage: ["配置项选择", "筛选条件", "弹窗内选择"],
    notes: ["Trigger 与 Input 高度、边框和 focus 状态保持一致。", "不建议使用原生 select 拼临时样式。"],
    migration: ["原生 select → Select", "弹窗选择器 → Select"],
  },
  {
    id: "date-picker",
    group: "form",
    name: "DatePicker",
    cnName: "日期选择",
    description: "用于日期字段选择，基于 Popover 与 Calendar 组合。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/date-picker.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · DatePicker 组件",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "常用于时间筛选和日期配置。",
    applicationScope: "日期筛选、有效期设置、配置时间",
    moduleCount: 10,
    instanceCount: 16,
    tags: ["已接入预览", "常用"],
    usage: ["日期筛选", "有效期配置", "时间范围表单"],
    notes: ["触发器样式与 Input 对齐。", "禁用、hover、focus 状态参考本页真实示例。"],
    migration: ["手写日期触发器 → DatePicker"],
  },
  {
    id: "checkbox",
    group: "form",
    name: "Checkbox",
    cnName: "复选框",
    description: "用于确认项、多选项和表格选择。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/checkbox.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Checkbox 组件",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "常用于确认、选择和批量操作。",
    applicationScope: "确认勾选、多选、表格选择",
    moduleCount: 16,
    instanceCount: 28,
    tags: ["已接入预览", "常用"],
    usage: ["确认项", "多选配置", "表格选择"],
    notes: ["checked 状态使用品牌蓝。", "Label 与 Checkbox 组合保持可点击区域清晰。"],
    migration: ["手写复选框 → Checkbox"],
  },
  {
    id: "radio-group",
    group: "form",
    name: "RadioGroup",
    cnName: "单选组",
    description: "用于互斥选项选择。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/radio-group.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · 其他组件速查",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "常用于配置项中的单选模式。",
    applicationScope: "模式选择、类型选择、单选配置",
    moduleCount: 8,
    instanceCount: 14,
    tags: ["已接入预览", "常用"],
    usage: ["互斥选项", "模式选择", "类型选择"],
    notes: ["选项文字使用 Label，确保可读和可点。", "不要用多个 Checkbox 伪装单选。"],
    migration: ["手写单选 → RadioGroup"],
  },
  {
    id: "switch",
    group: "form",
    name: "Switch",
    cnName: "开关",
    description: "用于功能开关、配置启停和状态切换。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/switch.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Switch 组件",
    platform: "Global 全局",
    adoption: "高频参考",
    applicationSummary: "开关类配置高频参考。",
    applicationScope: "功能启停、配置开关、状态切换",
    moduleCount: 20,
    instanceCount: 36,
    tags: ["已接入预览", "高频参考"],
    usage: ["功能启停", "配置开关", "状态切换"],
    notes: ["开启色使用品牌蓝。", "不要手写轨道和 thumb 样式。"],
    migration: ["手写开关 → Switch"],
  },
  {
    id: "alert",
    group: "feedback",
    name: "Alert",
    cnName: "提示条",
    description: "用于信息提示、操作说明、警告提示和产品动态。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/alert.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Alert 提示组件",
    platform: "Global 全局",
    adoption: "高频参考",
    applicationSummary: "页面提示与操作说明高频参考。",
    applicationScope: "信息提示、操作说明、警告、产品动态",
    moduleCount: 24,
    instanceCount: 54,
    tags: ["已接入预览", "高频参考"],
    usage: ["页面常驻说明", "操作上下文提示", "警告提示", "产品动态通知"],
    notes: ["普通说明用 info，操作说明用 operation-info。", "warning 标准图标使用 CircleAlert。", "不要手写 bg-blue / bg-amber 提示条。"],
    migration: ["手写提示条 → Alert", "产品动态提示 → Alert variant=\"product-news\""],
  },
  {
    id: "dialog",
    group: "feedback",
    name: "Dialog",
    cnName: "弹窗",
    description: "用于普通表单、信息确认和详情查看。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/dialog.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Dialog 组件",
    platform: "Global 全局",
    adoption: "高频参考",
    applicationSummary: "弹窗场景高频参考，常用于表单与确认。",
    applicationScope: "表单弹窗、详情弹窗、普通确认",
    moduleCount: 31,
    instanceCount: 68,
    tags: ["已接入预览", "高频参考"],
    usage: ["表单弹窗", "详情查看", "普通确认"],
    notes: ["危险确认使用 AlertDialog。", "弹窗内 Input / Select / Table 也复用全局组件。"],
    migration: ["手写弹窗 → Dialog", "危险确认 Dialog → AlertDialog"],
  },
  {
    id: "alert-dialog",
    group: "feedback",
    name: "AlertDialog",
    cnName: "危险确认弹窗",
    description: "用于删除、停用等需要确认的危险操作。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/alert-dialog.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · AlertDialog",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "危险操作确认的标准承载。",
    applicationScope: "删除、停用、不可逆操作确认",
    moduleCount: 12,
    instanceCount: 20,
    tags: ["已接入预览", "常用"],
    usage: ["删除确认", "停用确认", "危险操作二次确认"],
    notes: ["危险确认不要使用普通 Dialog。", "确认按钮使用 destructive 语义。"],
    migration: ["危险操作确认 → AlertDialog"],
  },
  {
    id: "tooltip",
    group: "feedback",
    name: "Tooltip",
    cnName: "气泡提示",
    description: "用于短说明、术语解释和禁用原因提示。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/tooltip.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · 其他组件速查",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "轻量说明常用组件。",
    applicationScope: "短说明、禁用原因、术语解释",
    moduleCount: 18,
    instanceCount: 35,
    tags: ["已接入预览", "常用"],
    usage: ["icon 说明", "禁用原因", "字段提示"],
    notes: ["Tooltip 只承载短文案。", "复杂内容使用 Popover。"],
    migration: ["手写 hover 提示 → Tooltip"],
  },
  {
    id: "popover",
    group: "feedback",
    name: "Popover",
    cnName: "气泡浮层",
    description: "用于轻量操作、说明和临时筛选。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/popover.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · 其他组件速查",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "轻量浮层常用组件。",
    applicationScope: "临时筛选、轻量说明、快捷操作",
    moduleCount: 14,
    instanceCount: 25,
    tags: ["已接入预览", "常用"],
    usage: ["临时筛选", "快捷操作", "轻量说明"],
    notes: ["复杂流程不要放在 Popover 中。", "对齐、圆角、阴影以真实组件为准。"],
    migration: ["手写浮层 → Popover"],
  },
  {
    id: "progress",
    group: "feedback",
    name: "Progress",
    cnName: "进度条",
    description: "用于任务进度、资源使用比例和加载进度展示。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/progress.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · 进度条",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "任务和资源进度展示常用。",
    applicationScope: "任务进度、资源额度、加载进度",
    moduleCount: 10,
    instanceCount: 16,
    tags: ["已接入预览", "常用"],
    usage: ["资源额度", "任务进度", "加载进度"],
    notes: ["颜色需根据业务语义选择。", "不要手写轨道和填充样式。"],
    migration: ["手写进度条 → Progress"],
  },
  {
    id: "table",
    group: "data",
    name: "Table",
    cnName: "表格",
    description: "统一表头、行高、hover、选中行和数据单元格。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/table.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Table 表格组件规范",
    platform: "Global 全局",
    adoption: "高频参考",
    applicationSummary: "数据列表高频参考，管控端尤其常用。",
    applicationScope: "配置列表、资源列表、弹窗内列表",
    moduleCount: 26,
    instanceCount: 62,
    tags: ["已接入预览", "高频参考"],
    usage: ["管理端配置列表", "资源选择列表", "状态与数量数据展示"],
    notes: ["表格结构统一使用 Table 系列组件。", "分页放在表格容器内部、Table 外部。"],
    migration: ["原生 table + 自定义 class → Table 系列组件"],
  },
  {
    id: "pagination",
    group: "data",
    name: "Pagination",
    cnName: "分页器",
    description: "统一页面级列表和弹窗内列表的分页展示与交互。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/pagination.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Pagination 分页器规范",
    platform: "Global 全局",
    adoption: "高频参考",
    applicationSummary: "列表分页高频参考。",
    applicationScope: "页面级表格、弹窗列表、简洁翻页",
    moduleCount: 18,
    instanceCount: 36,
    tags: ["已接入预览", "高频参考"],
    usage: ["页面级表格底部分页", "弹窗内资源列表", "简洁翻页"],
    notes: ["页面级使用默认尺寸，弹窗内可用 small。", "不建议页面内自行实现分页按钮。"],
    migration: ["手写分页按钮 → Pagination"],
  },
  {
    id: "badge",
    group: "data",
    name: "Badge",
    cnName: "徽章",
    description: "用于轻量标签、状态分类和辅助信息标识。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/badge.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Badge",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "轻量标签常用组件。",
    applicationScope: "分类标签、角标、辅助信息",
    moduleCount: 16,
    instanceCount: 32,
    tags: ["已接入预览", "常用"],
    usage: ["分类标签", "角标", "辅助状态"],
    notes: ["复杂业务状态优先使用 StatusTag。", "不要随意新增 Badge 色值。"],
    migration: ["手写标签 → Badge"],
  },
  {
    id: "status-tag",
    group: "data",
    name: "StatusTag",
    cnName: "状态标签",
    description: "用于运行中、待完成、进行中、异常等状态表达。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/status-tag.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · StatusTag",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "业务状态表达常用组件。",
    applicationScope: "运行状态、配置状态、任务状态",
    moduleCount: 24,
    instanceCount: 58,
    tags: ["已接入预览", "常用"],
    usage: ["运行中", "待完成", "进行中", "异常"],
    notes: ["优先使用已有语义色，不要新增随意色。", "需要强调状态时可带 dot。"],
    migration: ["手写状态胶囊 → StatusTag"],
  },
  {
    id: "empty",
    group: "data",
    name: "Empty",
    cnName: "空状态",
    description: "用于列表无数据、筛选无结果和初始空场景。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/empty.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · 空状态",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "空场景表达常用组件。",
    applicationScope: "无数据、无结果、初始引导",
    moduleCount: 12,
    instanceCount: 21,
    tags: ["已接入预览", "常用"],
    usage: ["无数据", "搜索无结果", "初始引导"],
    notes: ["空状态应包含说明和下一步行动。", "图标、标题、描述和操作要成组出现。"],
    migration: ["散落空状态 → Empty 系列组件"],
  },
  {
    id: "segment",
    group: "data",
    name: "Segment",
    cnName: "分段选择器",
    description: "用于内容区分类切换和详情页子导航。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/segment.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Segment 分段选择器规范",
    platform: "Global 全局",
    adoption: "核心参考",
    applicationSummary: "内容区分类切换核心参考。",
    applicationScope: "详情页分区、内容分类、局部状态切换",
    moduleCount: 21,
    instanceCount: 40,
    tags: ["已接入预览", "核心参考"],
    usage: ["详情页配置分区", "内容分类", "局部状态切换"],
    notes: ["内容区子分类优先使用 Segment。", "不要散落手写 button 组合表达切换状态。"],
    migration: ["手写分类按钮组 → Segment"],
  },
  {
    id: "tabs",
    group: "data",
    name: "Tabs",
    cnName: "标签页",
    description: "用于页面内轻量标签切换。",
    owner: "addietang / miekoyychen",
    source: "client/src/components/ui/tabs.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · Tabs",
    platform: "Global 全局",
    adoption: "常用",
    applicationSummary: "轻量标签切换常用。",
    applicationScope: "标签页切换、内容面板切换",
    moduleCount: 17,
    instanceCount: 31,
    tags: ["已接入预览", "常用"],
    usage: ["内容面板", "轻量标签", "弹窗内分区"],
    notes: ["Segment 更适合内容区子分类。", "Tabs 用于轻量标签面板。"],
    migration: ["手写 tab → Tabs / Segment"],
  },
  {
    id: "topnav",
    group: "navigation",
    name: "TopNav",
    cnName: "用户端顶部导航",
    description: "用户端顶部导航壳，承载左侧 Logo、中间 Tabs 和右侧功能区。",
    owner: "miekoyychen / addietang",
    maintainer: "jingsujiang / brennali",
    source: "client/src/components/topnav/TopNav.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · 用户端导航栏完整规范",
    platform: "Tenant 用户端",
    adoption: "核心参考",
    applicationSummary: "用户端导航核心参考。",
    applicationScope: "用户端主导航、功能入口、用户菜单承载",
    moduleCount: 8,
    instanceCount: 18,
    tags: ["已接入预览", "Tenant 用户端"],
    usage: ["用户端主导航", "页面 Tab 切换", "右侧功能入口"],
    notes: ["用户端导航采用 1200px 最小宽度策略。", "不要重新拼装顶部导航结构。"],
    migration: ["手写用户端顶部导航 → TopNav"],
  },
  {
    id: "admin-sidebar",
    group: "admin",
    name: "AdminSidebar",
    cnName: "管控端侧边栏",
    description: "管控端左侧导航结构，包含品牌区、分组、菜单项和底部用户区。",
    owner: "miekoyychen",
    source: "client/src/components/ui/admin-sidebar.tsx",
    doc: "SKILL-GLOBAL-COMPONENTS.md · AdminSidebar",
    platform: "Admin 管控端",
    adoption: "核心参考",
    applicationSummary: "管控端导航核心参考。",
    applicationScope: "管控端主导航、分组菜单、收起展开",
    moduleCount: 4,
    instanceCount: 16,
    tags: ["已接入预览", "Admin 管控端"],
    usage: ["管控端主导航", "分组菜单", "收起展开侧栏"],
    notes: ["AdminSidebar 仅用于管控端。", "侧栏 token 由 miekoyychen 维护。", "不要覆盖侧栏内部样式。"],
    migration: ["手写管控端菜单 → AdminSidebar"],
  },
];

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[4px] border border-[#DDE7F2] bg-white px-4 py-3">
      <span className="text-xs text-[#737373]">{label}</span>
      <div className="mt-2 flex items-end gap-2">
        <span className="font-din text-2xl font-bold leading-none tabular-nums text-[#020617]">{value}</span>
        <span className="pb-0.5 text-xs text-[#737373]">{hint}</span>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <Badge variant="outline" className="rounded-[2px] px-2 py-0 text-[11px]">{children}</Badge>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <PanelTitle>{title}</PanelTitle>
      {children}
    </section>
  );
}

function GuidanceBlock({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "usage" | "notice" | "migration";
}) {
  const config = {
    usage: { text: "text-[#1447E6]" },
    notice: { text: "text-[#B8640A]" },
    migration: { text: "text-[#334155]" },
  }[variant];

  return (
    <div className="min-w-0 border-t border-[#EAF1F8] pt-3">
      <div className="mb-2 flex items-center">
        <BodyMedium>{title}</BodyMedium>
      </div>
      <ul className="grid gap-1.5">
        {items.map((item, index) => (
          <li key={item} className="grid grid-cols-[14px_minmax(0,1fr)] items-start gap-1.5">
            <span className={`block h-5 text-[11px] font-medium leading-5 tabular-nums ${config.text}`}>{String(index + 1).padStart(2, "0")}</span>
            <MetaText as="span" tone="secondary" className="leading-5">{item}</MetaText>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewPanel({
  title,
  children,
  layout = "center",
}: {
  title: string;
  children: React.ReactNode;
  layout?: "center" | "wide";
}) {
  return (
    <div className="relative mt-3 rounded-[4px] border border-[#DDE7F2] bg-white">
      <div className="absolute -top-3 left-6 bg-white px-2">
        <BodyMedium>{title}</BodyMedium>
      </div>
      <div className="flex min-h-[340px] items-center justify-center p-10 pt-12">
        <div className={layout === "wide" ? "mx-auto w-full max-w-[960px]" : "mx-auto w-fit max-w-full"}>{children}</div>
      </div>
    </div>
  );
}

function TypographyPreview() {
  const rows = [
    ["TenantHeroTitle", <TenantHeroTitle key="hero">模型额度与用量总览</TenantHeroTitle>, "用户端 Hero 标题"],
    ["TenantPageTitle", <TenantPageTitle key="page">Agent 详情</TenantPageTitle>, "页面标题"],
    ["SectionTitle", <SectionTitle key="section">组件分类展示</SectionTitle>, "大模块标题"],
    ["PanelTitle", <PanelTitle key="panel">全状态真实示例</PanelTitle>, "面板标题"],
    ["CardTitle", <CardTitle key="card">Alice 的技术助手</CardTitle>, "卡片标题"],
    ["BodyText", <BodyText key="body">这里展示组件使用说明和推荐参考方式。</BodyText>, "正文说明"],
    ["MetaText", <MetaText key="meta">更新于 2026-05-24 00:00</MetaText>, "辅助信息"],
    ["StatNumber", <StatNumber key="stat">128,000</StatNumber>, "统计数字"],
    ["CodeText", <CodeText key="code">client/src/components/ui/button.tsx</CodeText>, "路径 / ID"],
    ["StepText", <StepText key="step">Step 1</StepText>, "步骤标识"],
  ] as const;
  const toneCards = [
    { token: "primary", name: "标题色", value: "#0A0A0A", color: "#0A0A0A" },
    { token: "emphasis", name: "强调", value: "#020617", color: "#020617" },
    { token: "secondary", name: "正文", value: "#334155", color: "#334155" },
    { token: "muted", name: "辅助", value: "#737373", color: "#737373" },
    { token: "weak", name: "极弱", value: "#A3A3A3", color: "#A3A3A3" },
    { token: "brand", name: "活跃", value: "#1447E6", color: "#1447E6" },
    { token: "danger", name: "危险", value: "#DC2626", color: "#DC2626" },
  ] as const;

  return (
    <div className="space-y-4">
      <PreviewPanel title="Typography token 一览" layout="wide">
        <div className="divide-y divide-[#EAF1F8]">
          {rows.map(([name, example, usage]) => (
            <div key={name} className="grid grid-cols-[180px_minmax(0,1fr)_160px] items-center gap-4 py-3">
              <CodeText>{name}</CodeText>
              <div className="min-w-0">{example}</div>
              <MetaText>{usage}</MetaText>
            </div>
          ))}
        </div>
      </PreviewPanel>
      <PreviewPanel title="Tone 色阶示例" layout="wide">
        <div className="grid grid-cols-7 gap-2.5">
          {toneCards.map((tone) => (
            <div key={tone.token} className="overflow-hidden rounded-[4px] border border-[#EAF1F8] bg-white">
              <div className="h-11" style={{ backgroundColor: tone.color }} />
              <div className="px-2.5 py-2">
                <BodyMedium className="block truncate text-xs">{tone.name}</BodyMedium>
                <CodeText className="mt-0.5 block text-[11px]">{tone.value}</CodeText>
                <MetaText className="mt-1 block truncate">{tone.token}</MetaText>
              </div>
            </div>
          ))}
        </div>
      </PreviewPanel>
    </div>
  );
}

function SurfacePreview({ id }: { id: ComponentId }) {
  const panels = {
    "surface-card": <SurfaceCard hover className="rounded-[4px] p-5"><CardTitle>SurfaceCard</CardTitle><MetaText className="mt-2 block">页面主区块、列表卡、统计卡。开启 hover 可微抬。</MetaText></SurfaceCard>,
    "surface-inner": <SurfaceInner className="rounded-[4px] p-5"><CardTitle>SurfaceInner</CardTitle><MetaText className="mt-2 block">卡片内子面板或表格容器。</MetaText></SurfaceInner>,
    "surface-config": <SurfaceConfig className="rounded-[4px] p-5"><CardTitle>SurfaceConfig</CardTitle><MetaText className="mt-2 block">管理端高亮配置卡、引导卡。</MetaText></SurfaceConfig>,
    "surface-overlay": <SurfaceOverlay className="rounded-[4px] p-5"><CardTitle>SurfaceOverlay</CardTitle><MetaText className="mt-2 block">自定义浮层容器；Dialog / Popover 通常已内置浮层样式。</MetaText></SurfaceOverlay>,
  };
  return <PreviewPanel title="真实卡片层级示例">{panels[id as keyof typeof panels]}</PreviewPanel>;
}

function ButtonPreview() {
  const variants = [
    ["claw-primary", <Button key="primary" variant="claw-primary" size="claw">创建 Agent</Button>],
    ["claw-outline", <Button key="outline" variant="claw-outline" size="claw">详细配置</Button>],
    ["dialog-confirm", <Button key="dialog" variant="dialog-confirm" size="claw-sm">确认</Button>],
    ["destructive", <Button key="destructive" variant="destructive" size="claw">删除</Button>],
    ["ghost", <Button key="ghost" variant="ghost" size="claw">Ghost</Button>],
    ["plain", <Button key="plain" variant="plain" size="sm" data-state="active">筛选项</Button>],
    ["link", <Button key="link" variant="link" size="sm">查看文档</Button>],
    ["link-dark", <Button key="link-dark" variant="link-dark" size="sm">编辑</Button>],
  ] as const;

  return (
    <div className="space-y-4">
      <PreviewPanel title="Variant 状态" layout="wide">
        <div className="mx-auto grid max-w-[760px] grid-cols-4 gap-x-8 gap-y-7">
          {variants.map(([name, node]) => (
            <div key={name} className="flex min-h-[72px] flex-col items-center justify-end gap-2 text-center">
              <MetaText>{name}</MetaText>
              <div className="flex h-10 items-center justify-center">{node}</div>
            </div>
          ))}
        </div>
      </PreviewPanel>
      <PreviewPanel title="尺寸 / 图标 / Disabled / SmallIconStateButton" layout="wide">
        <div className="mx-auto flex max-w-[760px] flex-wrap items-center justify-center gap-3">
          <Button variant="claw-primary" size="claw-lg"><Plus />Large 40</Button>
          <Button variant="claw-primary" size="claw"><Plus />Default 36</Button>
          <Button variant="claw-primary" size="claw-sm"><Plus />Small 32</Button>
          <Button variant="claw-outline" size="claw-square" aria-label="设置"><Settings /></Button>
          <Button variant="claw-outline" size="claw" disabled>Disabled</Button>
          <SmallIconStateButton icon={Plus} label="添加" />
          <SmallIconStateButton icon={Settings} label="配置" />
          <SmallIconStateButton icon={Plus} label="添加" state="disabled" />
        </div>
      </PreviewPanel>
    </div>
  );
}

function FormPreview({ id }: { id: ComponentId }) {
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [date, setDate] = useState("2026-05-24");

  const map: Partial<Record<ComponentId, React.ReactNode>> = {
    input: (
      <PreviewPanel title="Input 状态">
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="请输入企业邮箱" />
          <Input defaultValue="miekoyychen@tencent.com" />
          <div className="space-y-1"><Input aria-invalid defaultValue="miekoyychen" /><MetaText tone="danger">请输入正确企业邮箱</MetaText></div>
          <Input defaultValue="addietang@tencent.com" disabled />
          <div className="relative col-span-2"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A3A3A3]" /><Input className="pl-9" placeholder="搜索组件名、使用场景、源码路径" /></div>
        </div>
      </PreviewPanel>
    ),
    textarea: <PreviewPanel title="Textarea 状态"><Textarea placeholder="请输入页面效果校准说明" /><Textarea className="mt-3" defaultValue="已沉淀组件需优先复用真实组件样式。" /></PreviewPanel>,
    select: (
      <PreviewPanel title="Select 可交互示例">
        <Select defaultValue="admin">
          <SelectTrigger className="w-[320px]"><SelectValue placeholder="请选择范围" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="global">Global 全局</SelectItem>
            <SelectItem value="tenant">Tenant 用户端</SelectItem>
            <SelectItem value="admin">Admin 管控端</SelectItem>
          </SelectContent>
        </Select>
      </PreviewPanel>
    ),
    "date-picker": <PreviewPanel title="DatePicker 可交互示例"><DatePicker value={date} onChange={setDate} className="w-[320px]" /></PreviewPanel>,
    checkbox: <PreviewPanel title="Checkbox 状态"><div className="flex items-center gap-2"><Checkbox id="component-check" checked={checked} onCheckedChange={(next) => setChecked(next === true)} /><Label htmlFor="component-check">已接入真实组件示例</Label></div><div className="mt-4 flex items-center gap-2"><Checkbox id="disabled-check" disabled /><Label htmlFor="disabled-check">Disabled</Label></div></PreviewPanel>,
    "radio-group": (
      <PreviewPanel title="RadioGroup 可交互示例">
        <RadioGroup defaultValue="preview" className="flex gap-5">
          <div className="flex items-center gap-2"><RadioGroupItem value="preview" id="r-preview" /><Label htmlFor="r-preview">真实预览</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="guide" id="r-guide" /><Label htmlFor="r-guide">使用指引</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="migration" id="r-migration" /><Label htmlFor="r-migration">迁移建议</Label></div>
        </RadioGroup>
      </PreviewPanel>
    ),
    switch: <PreviewPanel title="Switch 可交互示例"><div className="flex items-center gap-2"><Switch checked={switchOn} onCheckedChange={setSwitchOn} /><BodyMedium>{switchOn ? "开启组件预览" : "关闭组件预览"}</BodyMedium></div></PreviewPanel>,
  };

  return <>{map[id]}</>;
}

function AlertPreview() {
  return (
    <PreviewPanel title="Alert 类型" layout="wide">
      <div className="space-y-3">
        <Alert variant="info"><AlertInfoIcon /><AlertDescription>普通信息提示，适合页面常驻说明和功能告知。</AlertDescription></Alert>
        <Alert variant="operation-info"><AlertOperationInfoIcon /><AlertTitle>操作说明</AlertTitle><AlertDescription>用于批量操作前后的辅助说明。</AlertDescription></Alert>
        <Alert variant="warning"><CircleAlert /><AlertTitle>注意事项</AlertTitle><AlertDescription>用于配置缺失、配额不足等非阻断提醒。</AlertDescription></Alert>
        <Alert variant="product-news"><AlertProductNewsIcon /><AlertDescription>【产品动态】组件展示台已接入新的全状态示例。</AlertDescription></Alert>
      </div>
    </PreviewPanel>
  );
}

function DialogPreview() {
  return (
    <PreviewPanel title="Dialog 可交互示例">
      <Dialog>
        <DialogTrigger asChild><Button variant="claw-outline" size="claw-sm">打开表单弹窗</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增组件说明</DialogTitle>
            <DialogDescription>弹窗内表单控件继续复用全局 Input 与 Select。</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="组件名称" />
            <Select defaultValue="feedback">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="feedback">反馈组件</SelectItem><SelectItem value="data">数据展示</SelectItem></SelectContent>
            </Select>
          </div>
          <DialogFooter><Button variant="claw-outline" size="claw-sm">取消</Button><Button variant="dialog-confirm" size="claw-sm">确认</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PreviewPanel>
  );
}

function AlertDialogPreview() {
  return (
    <PreviewPanel title="AlertDialog 危险确认">
      <AlertDialog>
        <AlertDialogTrigger asChild><Button variant="destructive" size="claw-sm">危险确认</Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该示例？</AlertDialogTitle>
            <AlertDialogDescription>危险操作请使用 AlertDialog 承载。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PreviewPanel>
  );
}

function FloatingPreview({ id }: { id: ComponentId }) {
  if (id === "tooltip") {
    return <PreviewPanel title="Tooltip 可交互示例"><TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="claw-outline" size="claw-sm">悬停查看说明</Button></TooltipTrigger><TooltipContent>Tooltip 用于短说明，不承载复杂内容。</TooltipContent></Tooltip></TooltipProvider></PreviewPanel>;
  }
  if (id === "popover") {
    return <PreviewPanel title="Popover 可交互示例"><Popover><PopoverTrigger asChild><Button variant="claw-outline" size="claw-sm">打开浮层</Button></PopoverTrigger><PopoverContent className="w-72"><CardTitle>Popover 浮层</CardTitle><MetaText className="mt-2 block">适合临时筛选、简短说明或轻量操作。</MetaText></PopoverContent></Popover></PreviewPanel>;
  }
  return <PreviewPanel title="Progress 状态"><div className="max-w-sm space-y-2"><div className="flex justify-between"><MetaText>示例覆盖度</MetaText><InlineNumber>72%</InlineNumber></div><Progress value={72} /></div></PreviewPanel>;
}

function TablePreview() {
  const rows = [["Button", "操作组件", "已接入", 42], ["Input", "表单组件", "已接入", 39], ["Table", "数据展示", "高频参考", 26]] as const;
  return (
    <PreviewPanel title="Table / TableActionCell 表格结构与操作列" layout="wide">
      <div className="overflow-hidden rounded-[4px] border border-[#DDE7F2] bg-white">
        <Table>
          <TableHeader><TableRow><TableHead>组件</TableHead><TableHead>分类</TableHead><TableHead>状态</TableHead><TableHead className="text-right">应用范围</TableHead><TableHead className="w-[160px]">操作</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map(([name, group, status, modules]) => (
              <TableRow key={name}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{group}</TableCell>
                <TableCell><StatusTag variant={status === "高频参考" ? "blue" : "green"} dot>{status}</StatusTag></TableCell>
                <TableCell className="text-right tabular-nums">约 {modules} 个页面/模块</TableCell>
                <TableActionCell><div className="flex gap-3"><Button variant="link-dark" size="sm">查看</Button><Button variant="link-dark" size="sm">复制用法</Button></div></TableActionCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PreviewPanel>
  );
}

function PaginationPreview() {
  return (
    <div className="space-y-4">
      <PreviewPanel title="默认 / 总数 / 每页条数 / 快速跳转" layout="wide"><Pagination total={245} showTotal={(total, range) => `${range[0]}-${range[1]} 共 ${total} 条`} showSizeChanger showQuickJumper /></PreviewPanel>
      <PreviewPanel title="简洁模式 / 小尺寸 / Disabled"><div className="space-y-4"><Pagination total={45} simple /><Pagination total={120} size="small" showTotal={(total) => `共 ${total} 条`} /><Pagination total={120} disabled /></div></PreviewPanel>
    </div>
  );
}

function SegmentTabsPreview({ id }: { id: ComponentId }) {
  if (id === "segment") {
    return (
      <PreviewPanel title="Segment 可交互切换">
        <Segment defaultValue="style">
          <SegmentList><SegmentItem value="style">样式</SegmentItem><SegmentItem value="usage">使用指引</SegmentItem><SegmentItem value="migration">迁移建议</SegmentItem><SegmentItem value="disabled" disabled>禁用项</SegmentItem></SegmentList>
          <SegmentContent value="style"><BodyText>用于详情页子内容切换，选中态为白底深色文字。</BodyText></SegmentContent>
          <SegmentContent value="usage"><BodyText>内容区分类切换优先使用 Segment。</BodyText></SegmentContent>
          <SegmentContent value="migration"><BodyText>手写按钮组可以逐步迁移为 Segment。</BodyText></SegmentContent>
        </Segment>
      </PreviewPanel>
    );
  }
  return (
    <PreviewPanel title="Tabs 可交互切换">
      <Tabs defaultValue="preview">
        <TabsList><TabsTrigger value="preview">真实预览</TabsTrigger><TabsTrigger value="guide">使用指引</TabsTrigger><TabsTrigger value="notes">注意事项</TabsTrigger></TabsList>
        <TabsContent value="preview"><BodyText>Tabs 适合轻量级内容标签切换。</BodyText></TabsContent>
        <TabsContent value="guide"><BodyText>保持 active、hover 和 disabled 状态一致。</BodyText></TabsContent>
        <TabsContent value="notes"><BodyText>不建议用散落的 button 组合替代。</BodyText></TabsContent>
      </Tabs>
    </PreviewPanel>
  );
}

function StatusPreview({ id }: { id: ComponentId }) {
  if (id === "badge") {
    return <PreviewPanel title="Badge variants"><div className="flex flex-wrap items-center gap-3"><Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="outline">Outline</Badge><Badge variant="destructive">Destructive</Badge></div></PreviewPanel>;
  }
  if (id === "status-tag") {
    return <PreviewPanel title="StatusTag variants"><div className="flex flex-wrap items-center gap-3"><StatusTag variant="green" dot>运行中</StatusTag><StatusTag variant="blue" dot>进行中</StatusTag><StatusTag variant="gray">待完成</StatusTag><StatusTag variant="red" dot>异常</StatusTag></div></PreviewPanel>;
  }
  return (
    <PreviewPanel title="Empty 空状态">
      <Empty className="border border-dashed border-[#DDE7F2]"><EmptyHeader><EmptyMedia variant="icon"><Bot /></EmptyMedia><EmptyTitle>暂无组件记录</EmptyTitle><EmptyDescription>可以通过筛选条件查看其他组件分类。</EmptyDescription></EmptyHeader><EmptyContent><Button variant="claw-outline" size="claw-sm">清空筛选</Button></EmptyContent></Empty>
    </PreviewPanel>
  );
}

const notifications: Notification[] = [
  { id: "n1", message: "组件展示台已更新：Button 与 Alert 已接入全状态示例", timestamp: "刚刚", category: "notice", read: false },
  { id: "n2", message: "设计规范同步：Typography 新增 CodeText 示例", timestamp: "10 分钟前", category: "success", read: true },
];

function TopNavPreview() {
  return (
    <div className="space-y-4">
      <PreviewPanel title="TopNav 组合结构" layout="wide">
        <div className="overflow-x-auto rounded-[4px] border border-[#DDE7F2] bg-white">
          <div className="min-w-[1200px]">
            <div className="grid h-[64px] grid-cols-[1fr_auto_1fr] items-center gap-6 border-b border-[#D8E4F0] px-10">
              <div className="flex items-center gap-2"><img src="/landing-assets/60.svg" alt="ClawPro" className="size-7" /><BodyMedium className="text-[22px]">ClawPro</BodyMedium></div>
              <CenterTabs activeValue="/my-openclaw" items={[{ label: "我的 Agent", value: "/my-openclaw" }, { label: "技能广场", value: "/skill-square" }, { label: "模型额度", value: "/model-quota" }]} />
              <div className="flex items-center justify-end gap-3"><NavIconButton icon={<HelpIcon />} label="使用指南" /><NavDivider /><NotificationPanel notifications={notifications} /><NavDivider /><NavIconButton icon={<SwitchAdminIcon />} label="管控端" /><NavDivider /><UserMenu username="miekoyychen" /></div>
            </div>
            <div className="bg-gradient-to-b from-white to-[#F5F5F5] px-10 py-8"><MetaText>TopNav 作为用户端导航组件包展示，内部包含 CenterTabs、NavIconButton、NotificationPanel 和 UserMenu。</MetaText></div>
          </div>
        </div>
      </PreviewPanel>
      <div className="grid grid-cols-2 gap-4">
        <PreviewPanel title="CenterTabs">
          <CenterTabs activeValue="/my-openclaw" items={[{ label: "我的 Agent", value: "/my-openclaw" }, { label: "技能广场", value: "/skill-square" }, { label: "模型额度", value: "/model-quota" }]} />
        </PreviewPanel>
        <PreviewPanel title="NavIconButton / UserMenu">
          <div className="flex flex-wrap items-center gap-3"><NavIconButton icon={<HelpIcon />} label="使用指南" /><NavDivider /><NavIconButton icon={<SwitchAdminIcon />} label="管控端" /><NavDivider /><UserMenu username="miekoyychen" /></div>
        </PreviewPanel>
      </div>
    </div>
  );
}

function AdminSidebarPreview() {
  return (
    <div className="space-y-4">
      <PreviewPanel title="AdminSidebar 关键元素" layout="wide">
        <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5">
          <div className="rounded-[4px] border border-[#DDE7F2] bg-white p-4 [--admin-sidebar-action-bg:#ffffff] [--admin-sidebar-action-border:#d8e4f0] [--admin-sidebar-foreground:#0A0A0A] [--admin-sidebar-muted:#737373] [--admin-sidebar-item-height:32px] [--admin-sidebar-item-radius:4px]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AdminSidebarLogo className="shrink-0" />
                <div><BodyMedium>ClawPro 管控端</BodyMedium><MetaText className="block">Enterprise Console</MetaText></div>
              </div>
              <AdminSidebarHeaderAction aria-label="折叠"><PanelLeft className="size-4" /></AdminSidebarHeaderAction>
            </div>
            <AdminSidebarGroupLabel>基础信息</AdminSidebarGroupLabel>
            <AdminSidebarMenu>
              <AdminSidebarMenuItem><AdminSidebarMenuButton isActive><img src={`${ADMIN_ICON_BASE}/platform-policy.svg`} alt="" />平台策略<AdminSidebarBadge>New</AdminSidebarBadge></AdminSidebarMenuButton></AdminSidebarMenuItem>
              <AdminSidebarMenuItem><AdminSidebarMenuButton><img src={`${ADMIN_ICON_BASE}/user-management.svg`} alt="" />用户管理</AdminSidebarMenuButton></AdminSidebarMenuItem>
              <AdminSidebarMenuItem><AdminSidebarMenuButton><img src={`${ADMIN_ICON_BASE}/model-config.svg`} alt="" />模型配置</AdminSidebarMenuButton></AdminSidebarMenuItem>
              <AdminSidebarMenuItem><AdminSidebarMenuButton><img src={`${ADMIN_ICON_BASE}/skill-config.svg`} alt="" />技能配置<AdminSidebarBadge variant="coming-soon" /></AdminSidebarMenuButton></AdminSidebarMenuItem>
            </AdminSidebarMenu>
          </div>
          <SurfaceInner className="rounded-[4px] p-5"><PanelTitle>展示说明</PanelTitle><BodyText className="mt-2">AdminSidebar 作为管控端导航组件包展示，内部包含分组标题、菜单项、Active 状态和侧栏 Badge。</BodyText></SurfaceInner>
        </div>
      </PreviewPanel>
      <PreviewPanel title="AdminSidebarBadge 状态">
        <div className="flex items-center gap-3 [--admin-sidebar-muted:#737373]"><AdminSidebarBadge>New</AdminSidebarBadge><AdminSidebarBadge variant="coming-soon" /><AdminSidebarBadge variant="custom">原镜像管理</AdminSidebarBadge></div>
      </PreviewPanel>
    </div>
  );
}

function getComponentIntro(component: ComponentMeta) {
  return `用于${component.applicationScope}；${component.applicationSummary}`;
}

function getApplicationPages(component: ComponentMeta): ApplicationPage[] {
  if (component.applicationPages?.length) return component.applicationPages;

  if (component.platform === "Tenant 用户端") {
    return [
      { name: "我的 Agent", path: "/my-openclaw", platform: "Tenant 用户端", priority: "高", usage: "用户端导航、卡片列表和主操作入口" },
      { name: "技能广场", path: "/skill-square", platform: "Tenant 用户端", priority: "高", usage: "用户端卡片、筛选和状态展示" },
      { name: "模型额度", path: "/model-quota", platform: "Tenant 用户端", priority: "中", usage: "用户端数据概览、表格和额度状态" },
    ];
  }

  if (component.platform === "Admin 管控端") {
    return [
      { name: "平台策略", path: "/admin/platform-policy", platform: "Admin 管控端", priority: "高", usage: "管控端配置卡、表单和操作说明" },
      { name: "模型配置", path: "/admin/model-config", platform: "Admin 管控端", priority: "高", usage: "管控端表单、按钮、筛选和表格操作" },
      { name: "成员管理", path: "/admin/members", platform: "Admin 管控端", priority: "中", usage: "管控端列表、弹窗和权限配置" },
    ];
  }

  if (["table", "pagination", "status-tag", "badge", "empty"].includes(component.id)) {
    return [
      { name: "模型配置", path: "/admin/model-config", platform: "Admin 管控端", priority: "高", usage: "表格、状态标签、分页和行操作" },
      { name: "Tokens 监控", path: "/admin/tokens-monitor", platform: "Admin 管控端", priority: "高", usage: "数据列表、统计和分页" },
      { name: "会话管理", path: "/admin/session-management", platform: "Admin 管控端", priority: "中", usage: "列表状态、操作列和筛选" },
    ];
  }

  if (["surface-card", "surface-inner", "surface-config", "typography"].includes(component.id)) {
    return [
      { name: "我的 Agent", path: "/my-openclaw", platform: "Tenant 用户端", priority: "高", usage: "用户端卡片、文字层级和页面骨架" },
      { name: "OpenClaw 详情", path: "/openclaw/1", platform: "Tenant 用户端", priority: "高", usage: "详情页标题、卡片层级和配置展示" },
      { name: "平台策略", path: "/admin/platform-policy", platform: "Admin 管控端", priority: "中", usage: "管控端配置卡和说明区" },
    ];
  }

  return [
    { name: "模型配置", path: "/admin/model-config", platform: "Admin 管控端", priority: "高", usage: "配置页常用基础组件组合" },
    { name: "成员管理", path: "/admin/members", platform: "Admin 管控端", priority: "中", usage: "表单、弹窗和列表操作" },
    { name: "我的 Agent", path: "/my-openclaw", platform: "Tenant 用户端", priority: "补充", usage: "用户端组件效果参考" },
  ];
}

function renderPreview(id: ComponentId) {
  if (id === "typography") return <TypographyPreview />;
  if (["surface-card", "surface-inner", "surface-config", "surface-overlay"].includes(id)) return <SurfacePreview id={id} />;
  if (id === "button") return <ButtonPreview />;
  if (["input", "textarea", "select", "date-picker", "checkbox", "radio-group", "switch"].includes(id)) return <FormPreview id={id} />;
  if (id === "alert") return <AlertPreview />;
  if (id === "dialog") return <DialogPreview />;
  if (id === "alert-dialog") return <AlertDialogPreview />;
  if (["tooltip", "popover", "progress"].includes(id)) return <FloatingPreview id={id} />;
  if (id === "table") return <TablePreview />;
  if (id === "pagination") return <PaginationPreview />;
  if (["segment", "tabs"].includes(id)) return <SegmentTabsPreview id={id} />;
  if (["badge", "status-tag", "empty"].includes(id)) return <StatusPreview id={id} />;
  if (id === "topnav") return <TopNavPreview />;
  if (id === "admin-sidebar") return <AdminSidebarPreview />;
  return null;
}

export default function DesignSystemComponents() {
  const [selectedId, setSelectedId] = useState<ComponentId>("button");
  const [keyword, setKeyword] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"全部组件" | Platform>("全部组件");

  const filteredComponents = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return COMPONENTS.filter((item) => {
      const matchesKeyword = !kw || [item.name, item.cnName, item.description, item.source, item.platform, item.adoption, item.applicationScope, ...item.tags].some((text) => text.toLowerCase().includes(kw));
      const matchesPlatform = platformFilter === "全部组件" || item.platform === platformFilter;
      return matchesKeyword && matchesPlatform;
    });
  }, [platformFilter, keyword]);

  const selected = COMPONENTS.find((item) => item.id === selectedId) ?? COMPONENTS[0];
  const applicationPages = useMemo(() => getApplicationPages(selected), [selected]);
  const grouped = useMemo(() => {
    return (Object.keys(GROUP_LABELS) as GroupKey[]).map((group) => ({
      group,
      label: GROUP_LABELS[group],
      items: filteredComponents.filter((item) => item.group === group),
    })).filter((group) => group.items.length > 0);
  }, [filteredComponents]);

  const platformCount = (platform: Platform) => COMPONENTS.filter((item) => item.platform === platform).length;

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#0A0A0A]">
      <header className="relative overflow-hidden border-b border-[#DDE7F2] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFF_100%)]">
        <div className="pointer-events-none absolute right-[-140px] top-[-180px] h-[380px] w-[380px] rounded-full bg-[#1447E6]/10 blur-3xl" />
        <div className="pointer-events-none absolute left-[20%] top-[-220px] h-[320px] w-[320px] rounded-full bg-[#60A5FA]/8 blur-3xl" />
        <div className="relative mx-auto max-w-[1680px] px-8 py-7">
          <div className="flex items-start justify-between gap-8">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex h-6 items-center rounded-[4px] border border-[#DDE7F2] bg-white/75 px-2.5 text-xs font-medium text-[#334155]">
                  内部设计资产
                </span>
                <span className="inline-flex h-6 items-center rounded-[4px] border border-[#DDE7F2] bg-white/75 px-2.5 text-xs font-medium text-[#334155]">
                  组件规范维护：miekoyychen / addietang
                </span>
                <span className="inline-flex h-6 items-center rounded-[4px] border border-[#DDE7F2] bg-white/75 px-2.5 text-xs font-medium text-[#334155]">
                  数据来源: SKILL-GLOBAL-COMPONENTS.md
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TenantPageTitle>ClawPro 全局组件展示台</TenantPageTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="flex size-6 items-center justify-center rounded-full text-[#737373] transition-colors hover:bg-white hover:text-[#1447E6]" aria-label="说明">
                        <Info className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[360px]">
                      当前展示台优先接入设计团队高频参考组件；底层能力组件会按页面修复和设计规范沉淀节奏持续补充。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <BodyText className="mt-2 max-w-3xl">展示 ClawPro 已沉淀的全局组件资产，包括真实样式、交互状态、使用指引和页面效果校准参考。</BodyText>
            </div>
            <div className="grid w-[360px] shrink-0 grid-cols-2 gap-3">
              <StatCard label="已沉淀规范组件" value={DOCUMENTED_COMPONENT_COUNT} hint="项" />
              <StatCard label="已接入预览组件" value={`${COMPONENTS.length}`} hint="个" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1680px] px-8 py-8">
        <div className="mb-5">
          <SectionTitle>组件分类展示</SectionTitle>
          <BodyText className="mt-1">按分类浏览单个组件，查看真实样式、所有状态、交互示例、使用指引与页面效果校准参考。</BodyText>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(["全部组件", "Global 全局", "Tenant 用户端", "Admin 管控端"] as const).map((item) => {
                const active = platformFilter === item;
                const count = item === "全部组件" ? COMPONENTS.length : platformCount(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPlatformFilter(item)}
                    className={`h-8 rounded-[4px] border px-4 text-sm transition-colors ${active ? "border-[#020617] bg-[#020617] text-white" : "border-[#DDE7F2] bg-white text-[#020617] hover:border-[#9FB6D8]"}`}
                  >
                    {item} <span className={active ? "text-white/70" : "text-[#737373]"}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="relative w-[360px] max-w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A3A3A3]" />
              <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="border-[#DDE7F2] pl-9 hover:border-[#9FB6D8] focus:border-[#1447E6]" placeholder="搜索组件" />
            </div>
          </div>
        </div>

        <SurfaceCard className="overflow-hidden rounded-[4px] border-[#DDE7F2] bg-white">
          <div className="grid grid-cols-[300px_minmax(0,1fr)] items-stretch bg-white">
            <aside className="self-stretch border-r border-[#DDE7F2] bg-[#F7FAFF]">
              <div className="sticky top-4 max-h-[calc(100vh-32px)] overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="space-y-5">
                  {grouped.map((group) => (
                    <div key={group.group}>
                      <div className="mb-2 flex items-center justify-between px-2">
                        <MetaText className="uppercase tracking-[0.08em]">{group.label}</MetaText>
                        <MetaText>{group.items.length} 个</MetaText>
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const active = item.id === selectedId;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedId(item.id)}
                            className={`relative w-full rounded-[4px] px-3 py-2 text-left transition-colors ${active ? "bg-white text-[#0A0A0A]" : "text-[#0A0A0A] hover:bg-white/70"}`}
                          >
                            {active && <span className="absolute left-0 top-2 bottom-2 w-px bg-[#0A0A0A]" />}
                            <BodyMedium className="block truncate pl-1" tone="emphasis">{item.name}</BodyMedium>
                            <MetaText className="mt-1 block truncate pl-1">{item.cnName} · 约 {item.moduleCount} 个页面/模块</MetaText>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="min-w-0 space-y-7 bg-white p-6">
              <div className="pb-1">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <TenantPageTitle>{selected.name}</TenantPageTitle>
                      <BodyText>{selected.cnName}</BodyText>
                    </div>
                    <BodyText className="mt-2 max-w-3xl">{getComponentIntro(selected)}</BodyText>
                    <details className="group mt-2 inline-block">
                      <summary className="flex w-max cursor-pointer list-none items-center gap-1 whitespace-nowrap text-sm font-normal text-[#334155] transition-colors hover:text-[#0A0A0A] [&::-webkit-details-marker]:hidden">
                        <span className="transition-transform group-open:rotate-90">›</span>
                        更多信息
                      </summary>
                      <div className="mt-2 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t border-[#DDE7F2] pt-2">
                        <MetaText>维护人</MetaText><MetaText tone="secondary">{selected.maintainer ?? selected.owner}</MetaText>
                        <MetaText>源码路径</MetaText><CodeText>{selected.source}</CodeText>
                        <MetaText>规范来源</MetaText><CodeText>{selected.doc}</CodeText>
                      </div>
                    </details>
                  </div>
                  <div className="w-[280px] shrink-0 border-l border-[#DDE7F2] pl-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div><MetaText>应用范围</MetaText><div className="mt-2"><StatNumber>{selected.moduleCount}</StatNumber><MetaText className="ml-1">页面/模块</MetaText></div></div>
                      <div><MetaText>组件实例</MetaText><div className="mt-2"><StatNumber>{selected.instanceCount}</StatNumber><MetaText className="ml-1">处</MetaText></div></div>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="mt-3 text-sm font-medium text-[#1447E6] transition-colors hover:text-[#0A226F] hover:underline">
                          查看应用页面（{applicationPages.length}）
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[540px] p-0">
                        <div className="border-b border-[#DDE7F2] px-4 py-3">
                          <BodyMedium>应用页面</BodyMedium>
                          <MetaText className="mt-1 block">按参考优先级排序，点击行可打开页面查看实际效果。</MetaText>
                        </div>
                        <div className="divide-y divide-[#DDE7F2]">
                          {applicationPages.map((page, index) => (
                            <a key={`${page.path}-${page.name}`} href={page.path} target="_blank" rel="noreferrer" className="grid grid-cols-[28px_120px_100px_minmax(0,1fr)_88px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F8FAFF]">
                              <MetaText>{index + 1}</MetaText>
                              <BodyMedium className="truncate">{page.name}</BodyMedium>
                              <MetaText className="truncate">{page.platform}</MetaText>
                              <MetaText className="truncate" tone="secondary">{page.usage}</MetaText>
                              <span className="inline-flex items-center justify-end gap-1 text-xs font-medium text-[#1447E6]">打开页面<ArrowRight className="size-3" /></span>
                            </a>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <DetailSection title="真实组件预览与全状态展示">
                {renderPreview(selected.id)}
              </DetailSection>

              <DetailSection title="使用指引">
                <div className="grid grid-cols-3 gap-8">
                  <GuidanceBlock title="推荐使用场景" items={selected.usage} variant="usage" />
                  <GuidanceBlock title="注意事项" items={selected.notes} variant="notice" />
                  <GuidanceBlock title="页面效果校准 / 迁移建议" items={selected.migration} variant="migration" />
                </div>
              </DetailSection>
            </section>
          </div>
        </SurfaceCard>
      </main>
    </div>
  );
}
