/**
 * MemberManagement - 管控端用户管理页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 */
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Search, Plus, ChevronDown, Info, Upload, Download,
  Trash2, UserX, UserCheck, MoreHorizontal, Pencil, Key,
  ChevronLeft, ChevronRight, Copy, CheckCircle, AlertTriangle,
  Loader2, X, FileText, ExternalLink, RefreshCw, Users, Check,
  FolderOpen, UserMinus, FolderPlus, ChevronUp,
} from "lucide-react";
import { useAdminMode } from "@/contexts/AdminModeContext";

const PAGE_SIZE = 10;

// ─── 分组选择框触发器（自适应截断） ──────────────────────────────────────────
function GroupSelectTrigger({ names }: { names: string[] }) {
  if (names.length === 0) {
    return (
      <div className="w-full overflow-hidden">
        <button type="button" className="w-full flex items-center justify-between h-9 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-normal hover:bg-gray-50">
          <span className="text-muted-foreground truncate">请选择分组</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0 ml-1" />
        </button>
      </div>
    );
  }

  const fullText = names.join(", ");
  const displayText = names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;

  const btn = (
    <div className="w-full overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between h-9 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-normal hover:bg-gray-50">
        <span className="text-gray-900 truncate text-left" style={{ minWidth: 0, flex: "1 1 0%" }}>{displayText}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0 ml-1" />
      </button>
    </div>
  );

  if (names.length > 1) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent className="max-w-[300px]">{fullText}</TooltipContent>
      </Tooltip>
    );
  }
  return btn;
}

// 生成更多 mock 数据以演示翻页
// vpcType: "auto" = 我们帮用户创建的 VPC（自动分配）；"custom" = 用户指定 VPC
// vpcName: 自动分配时形如 "openclaw/{username}"，自定义时为 null
// hasVpcResources: 自动分配 VPC 下是否有关联云资源（null 表示自定义 VPC 不适用）
const MOCK_MEMBERS_BASE = [
  // 规则：有 OpenClaw 必有关联资源；无 OpenClaw 可能有也可能没有关联资源
  { id: "alice@acompany.com", role: "admin", status: "active", clawLimit: 5, tokenLimit: 100000, clawCount: 3, joinTime: "2025-01-10", vpcType: "auto" as const, vpcName: "openclaw/alice", hasVpcResources: true },   // 有 claw → 必有资源
  { id: "bob@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-02-15", vpcType: "custom" as const, vpcName: null, hasVpcResources: null },              // 自定义 VPC
  { id: "carol@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 2, joinTime: "2025-03-01", vpcType: "auto" as const, vpcName: "openclaw/carol", hasVpcResources: true },  // 有 claw → 必有资源
  { id: "david@acompany.com", role: "member", status: "disabled", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-03-20", vpcType: "auto" as const, vpcName: "openclaw/david", hasVpcResources: true }, // 无 claw，但还有残留资源
  { id: "eve@acompany.com", role: "member", status: "active", clawLimit: 5, tokenLimit: 80000, clawCount: 4, joinTime: "2025-04-05", vpcType: "custom" as const, vpcName: null, hasVpcResources: null },              // 自定义 VPC
  { id: "frank@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-04-12", vpcType: "auto" as const, vpcName: "openclaw/frank", hasVpcResources: true },  // 有 claw → 必有资源
  { id: "grace@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 2, joinTime: "2025-05-01", vpcType: "custom" as const, vpcName: null, hasVpcResources: null },             // 自定义 VPC
  { id: "henry@acompany.com", role: "member", status: "disabled", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-05-18", vpcType: "auto" as const, vpcName: "openclaw/henry", hasVpcResources: false }, // 无 claw，且资源已清空
  { id: "iris@acompany.com", role: "member", status: "active", clawLimit: 5, tokenLimit: 80000, clawCount: 3, joinTime: "2025-06-02", vpcType: "auto" as const, vpcName: "openclaw/iris", hasVpcResources: true },   // 有 claw → 必有资源
  { id: "jack@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-06-20", vpcType: "custom" as const, vpcName: null, hasVpcResources: null },              // 自定义 VPC
  { id: "kate@acompany.com", role: "admin", status: "active", clawLimit: 5, tokenLimit: 100000, clawCount: 2, joinTime: "2025-07-05", vpcType: "auto" as const, vpcName: "openclaw/kate", hasVpcResources: true },   // 有 claw → 必有资源
  { id: "leo@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-07-22", vpcType: "auto" as const, vpcName: "openclaw/leo", hasVpcResources: false },    // 无 claw，资源已清空
  { id: "mike@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2026-03-20", vpcType: "custom" as const, vpcName: null, hasVpcResources: null },             // 自定义 VPC
  { id: "nina@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2026-03-20", vpcType: "auto" as const, vpcName: "openclaw/nina", hasVpcResources: true },   // 无 claw，但还有残留资源
  { id: "oscar@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2026-03-20", vpcType: "auto" as const, vpcName: "openclaw/oscar", hasVpcResources: false }, // 无 claw，资源已清空
];

// ─── Mock 部门数据（仅 OneID 模式使用） ─────────────────────────────────────────
interface DepartmentNode {
  id: string;
  name: string;
  path?: string;
  children?: DepartmentNode[];
}

const MOCK_DEPARTMENTS: DepartmentNode[] = [
  {
    id: "dept-root",
    name: "全公司",
    path: "全公司",
    children: [
      {
        id: "dept-tech",
        name: "技术部",
        path: "全公司/技术部",
        children: [
          { id: "dept-fe", name: "前端组", path: "全公司/技术部/前端组" },
          { id: "dept-be", name: "后端组", path: "全公司/技术部/后端组" },
          { id: "dept-ai", name: "AI 组", path: "全公司/技术部/AI 组" },
        ],
      },
      {
        id: "dept-product",
        name: "产品部",
        path: "全公司/产品部",
        children: [
          { id: "dept-pm", name: "产品策划", path: "全公司/产品部/产品策划" },
          { id: "dept-design", name: "设计组", path: "全公司/产品部/设计组" },
        ],
      },
      { id: "dept-hr", name: "人力资源", path: "全公司/人力资源" },
      { id: "dept-finance", name: "财务部", path: "全公司/财务部" },
    ],
  },
];

/** 用户归属 mock 映射 */
const MOCK_MEMBER_DEPARTMENTS: Record<string, string> = {
  "alice@acompany.com": "全公司/技术部/前端组",
  "bob@acompany.com": "全公司/技术部/后端组",
  "carol@acompany.com": "全公司/技术部/AI 组",
  "david@acompany.com": "全公司/产品部/产品策划",
  "eve@acompany.com": "全公司/产品部/设计组",
  "frank@acompany.com": "全公司/技术部/前端组",
  "grace@acompany.com": "全公司/技术部/后端组",
  "henry@acompany.com": "全公司/人力资源",
  "iris@acompany.com": "全公司/技术部/AI 组",
  "jack@acompany.com": "全公司/财务部",
  "kate@acompany.com": "全公司/技术部/前端组",
  "leo@acompany.com": "全公司/产品部/产品策划",
  "mike@acompany.com": "全公司/技术部/后端组",
  "nina@acompany.com": "全公司/产品部/设计组",
  "oscar@acompany.com": "全公司/财务部",
};

const LAST_CLAW_LIMIT = 3;
const LAST_TOKEN_LIMIT = 50000;

// ─── 分组数据模型 ─────────────────────────────────────────────────────────────
interface MemberGroup {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: string;
}

const MOCK_GROUPS_INIT: MemberGroup[] = [
  { id: "grp-1", name: "产品组", memberIds: ["carol@acompany.com", "david@acompany.com", "eve@acompany.com", "alice@acompany.com"], createdAt: "2025-06-01" },
  { id: "grp-2", name: "研发组", memberIds: ["alice@acompany.com", "bob@acompany.com", "frank@acompany.com", "grace@acompany.com", "kate@acompany.com"], createdAt: "2025-06-05" },
  { id: "grp-3", name: "设计组", memberIds: ["iris@acompany.com", "jack@acompany.com", "frank@acompany.com"], createdAt: "2025-07-10" },
  { id: "grp-4", name: "产品运营与市场推广团队", memberIds: ["alice@acompany.com", "kate@acompany.com"], createdAt: "2025-08-15" },
];

// ─── 分组关联配置 mock 数据 ──────────────────────────────────────────────────
interface GroupRelatedConfig {
  type: string;
  typePath: string; // 跳转路径
  items: { id: string; name: string }[];
}

const MOCK_GROUP_CONFIGS: Record<string, GroupRelatedConfig[]> = {
  "grp-1": [
    { type: "模型配置", typePath: "/admin/model-config", items: [
      { id: "m1", name: "腾讯云混元 - 混元 TurboS Latest" },
    ]},
    { type: "企业技能", typePath: "/admin/skill-config", items: [
      { id: "s1", name: "Web 搜索" }, { id: "s2", name: "代码解释器" }, { id: "s3", name: "文档分析" },
    ]},
  ],
  "grp-2": [
    { type: "模型配置", typePath: "/admin/model-config", items: [
      { id: "m1", name: "腾讯云混元 - 混元 TurboS Latest" }, { id: "m2", name: "腾讯云 DeepSeek - DeepSeek V3 0324" },
    ]},
    { type: "企业技能", typePath: "/admin/skill-config", items: [
      { id: "s1", name: "Web 搜索" }, { id: "s2", name: "代码解释器" }, { id: "s3", name: "文档分析" },
      { id: "s4", name: "图片生成" }, { id: "s5", name: "数据分析" }, { id: "s6", name: "翻译助手" },
      { id: "s7", name: "知识库问答" }, { id: "s8", name: "邮件撰写" }, { id: "s9", name: "会议纪要" }, { id: "s10", name: "PPT 生成" },
    ]},
    { type: "通道配置", typePath: "/admin/channel-config", items: [
      { id: "c1", name: "默认通道" }, { id: "c2", name: "高级通道" }, { id: "c3", name: "专属通道" },
    ]},
  ],
  "grp-3": [],
  "grp-4": [
    { type: "企业技能", typePath: "/admin/skill-config", items: [
      { id: "s1", name: "Web 搜索" }, { id: "s4", name: "图片生成" },
    ]},
  ],
};
function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let pwd = "Oc@";
  for (let i = 0; i < 8; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

const emptyNewMember = {
  id: "", role: "member", clawLimit: LAST_CLAW_LIMIT, tokenLimit: LAST_TOKEN_LIMIT,
  notificationEmail: "", groupIds: [] as string[],
};

const emptyEditForm = {
  id: "", role: "member", clawLimit: LAST_CLAW_LIMIT, tokenLimit: LAST_TOKEN_LIMIT, groupIds: [] as string[],
};

const emptyResetForm = {
  notificationEmail: "",
};

// ─── TokenLimit 输入框：默认填数字，右侧「无限制」文字按钮切换 ─────────────────
const TOKEN_UNLIMITED = -1;

function TokenLimitInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const isUnlimited = value === TOKEN_UNLIMITED;
  const [inputStr, setInputStr] = React.useState<string>(isUnlimited ? "" : String(value));

  React.useEffect(() => {
    if (!isUnlimited) setInputStr(String(value));
  }, [value, isUnlimited]);

  return (
    <div className="space-y-2">
      <Select
        value={isUnlimited ? "unlimited" : "custom"}
        onValueChange={(v) => {
          if (v === "unlimited") {
            onChange(TOKEN_UNLIMITED);
          } else {
            setInputStr("50000");
            onChange(50000);
          }
        }}
      >
        <SelectTrigger className="bg-gray-50 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">自定义数量</SelectItem>
          <SelectItem value="unlimited">无限制</SelectItem>
        </SelectContent>
      </Select>
      {!isUnlimited && (
        <Input
          type="number"
          value={inputStr}
          onChange={(e) => {
            setInputStr(e.target.value);
            if (e.target.value !== "") onChange(Number(e.target.value));
          }}
          onBlur={() => {
            if (inputStr === "" || isNaN(Number(inputStr))) {
              setInputStr("0");
              onChange(0);
            }
          }}
          className="bg-gray-50"
          placeholder="请输入数量"
        />
      )}
    </div>
  );
}

// ─── 添加用户表单（无密码） ────────────────────────
function AddMemberFormFields({
  values,
  onChange,
  existingMemberIds = [],
  groups = [],
  onOpenCreateGroupDialog,
  groupPopoverReopenKey = 0,
}: {
  values: typeof emptyNewMember;
  onChange: (v: typeof emptyNewMember) => void;
  existingMemberIds?: string[];
  groups?: MemberGroup[];
  onOpenCreateGroupDialog?: () => void;
  groupPopoverReopenKey?: number;
}) {
  const [clawStr, setClawStr] = React.useState<string>(String(values.clawLimit));
  const [idError, setIdError] = React.useState<string>("");
  const [groupSearchStr, setGroupSearchStr] = React.useState("");
  const [groupPopoverOpen, setGroupPopoverOpen] = React.useState(false);
  const groupReopenMounted = React.useRef(false);
  const groupListRef = React.useRef<HTMLDivElement>(null);

  // 当 groupPopoverReopenKey 变化时（非首次 mount），重新打开 Popover 并滚到底部
  React.useEffect(() => {
    if (!groupReopenMounted.current) { groupReopenMounted.current = true; return; }
    if (groupPopoverReopenKey > 0) {
      setGroupPopoverOpen(true);
      setTimeout(() => {
        if (groupListRef.current) groupListRef.current.scrollTop = groupListRef.current.scrollHeight;
      }, 100);
    }
  }, [groupPopoverReopenKey]);

  React.useEffect(() => {
    setClawStr(String(values.clawLimit));
  }, [values.clawLimit]);

  const handleIdBlur = () => {
    if (values.id.trim() && existingMemberIds.includes(values.id.trim())) {
      setIdError("成员ID已存在，请使用其他ID");
    } else {
      setIdError("");
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupSearchStr.toLowerCase())
  );

  const toggleGroup = (gId: string) => {
    const next = values.groupIds.includes(gId)
      ? values.groupIds.filter((id) => id !== gId)
      : [...values.groupIds, gId];
    onChange({ ...values, groupIds: next });
  };

  return (
    <div className="py-2 space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">用户信息</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              用户 ID <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>填写企业用户的唯一 ID，例如企业邮箱或企业用户唯一名称，作为企业用户登录用户端的账号</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              placeholder="例如：alice@acompany.com"
              value={values.id}
              onChange={(e) => {
                onChange({ ...values, id: e.target.value });
                setIdError("");
              }}
              onBlur={handleIdBlur}
              className={`bg-gray-50 ${idError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
            />
            {idError && <p className="text-xs text-red-500 font-medium">{idError}</p>}
          </div>

          <div className="space-y-2">
            <Label>用户角色 <span className="text-red-500">*</span></Label>
            <Select value={values.role} onValueChange={(v) => onChange({ ...values, role: v })}>
              <SelectTrigger className="bg-gray-50 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 用户分组 */}
          <div className="space-y-2">
            <Label>用户分组</Label>
            <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
              <PopoverTrigger asChild>
                <div>
                  <GroupSelectTrigger names={groups.filter((g) => values.groupIds.includes(g.id)).map((g) => g.name)} />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popper-anchor-width)", minWidth: 280 }}>
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input className="w-full h-7 pl-8 pr-2 text-xs border border-gray-200 rounded-md outline-none focus:border-blue-300 bg-white placeholder:text-gray-400" placeholder="搜索分组..." value={groupSearchStr} onChange={(e) => setGroupSearchStr(e.target.value)} />
                  </div>
                </div>
                <div ref={groupListRef} className="max-h-[180px] overflow-y-auto py-1 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                  {filteredGroups.map((g) => (
                    <button key={g.id} className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${values.groupIds.includes(g.id) ? "text-blue-600" : "text-gray-700"}`} onClick={() => toggleGroup(g.id)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${values.groupIds.includes(g.id) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                        {values.groupIds.includes(g.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="truncate">{g.name}</span>
                    </button>
                  ))}
                  {filteredGroups.length === 0 && groupSearchStr.trim() && (
                    <p className="text-xs text-gray-400 text-center py-3">未找到匹配的分组</p>
                  )}
                  {filteredGroups.length === 0 && !groupSearchStr.trim() && (
                    <p className="text-xs text-gray-400 text-center py-3">暂无分组</p>
                  )}
                </div>
                <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {values.groupIds.length > 0 ? (
                      <span className="text-xs text-gray-400">已选 {values.groupIds.length} 个分组</span>
                    ) : (
                      <span className="text-[11px] text-gray-400"> </span>
                    )}
                    {values.groupIds.length > 0 && (
                      <button className="text-xs text-blue-500 hover:text-blue-600 hover:underline" onClick={() => onChange({ ...values, groupIds: [] })}>清除筛选</button>
                    )}
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 shrink-0"
                    onClick={() => { setGroupPopoverOpen(false); onOpenCreateGroupDialog?.(); }}
                  >
                    <FolderPlus className="w-3 h-3" />新建分组
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              信息发送
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>信息发送会产生额外的短信/邮件费用，合并到腾讯云账单计费</TooltipContent>
              </Tooltip>
            </Label>
            <Input type="email" placeholder="输入用户接收账号密码的邮箱地址" value={values.notificationEmail} onChange={(e) => onChange({ ...values, notificationEmail: e.target.value })} className="bg-gray-50" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">用户配额</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              OpenClaw 数量上限 <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>单个企业用户最多可以创建的 OpenClaw 数量</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              value={clawStr}
              onChange={(e) => {
                setClawStr(e.target.value);
                if (e.target.value !== "") onChange({ ...values, clawLimit: Number(e.target.value) });
              }}
              onBlur={() => {
                if (clawStr === "" || isNaN(Number(clawStr))) {
                  setClawStr("0");
                  onChange({ ...values, clawLimit: 0 });
                }
              }}
              className="bg-gray-50" placeholder="请输入数量"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              每日 Tokens 数量上限 <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>单个企业用户每日最多可消耗的 Tokens 数量</TooltipContent>
              </Tooltip>
            </Label>
            <TokenLimitInput value={values.tokenLimit} onChange={(v) => onChange({ ...values, tokenLimit: v })} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 编辑用户表单（无密码、无信息发送，成员ID只读） ──────────────────────────
function EditMemberFormFields({
  values,
  onChange,
  isInitialAdmin = false,
  groups = [],
  onOpenCreateGroupDialog,
  groupPopoverReopenKey = 0,
}: {
  values: typeof emptyEditForm;
  onChange: (v: typeof emptyEditForm) => void;
  isInitialAdmin?: boolean;
  groups?: MemberGroup[];
  onOpenCreateGroupDialog?: () => void;
  groupPopoverReopenKey?: number;
}) {
  const [clawStr, setClawStr] = React.useState<string>(String(values.clawLimit));
  const [groupSearchStr, setGroupSearchStr] = React.useState("");
  const [groupPopoverOpen, setGroupPopoverOpen] = React.useState(false);
  const groupReopenMounted = React.useRef(false);
  const groupListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setClawStr(String(values.clawLimit));
  }, [values.clawLimit]);

  React.useEffect(() => {
    if (!groupReopenMounted.current) { groupReopenMounted.current = true; return; }
    if (groupPopoverReopenKey > 0) {
      setGroupPopoverOpen(true);
      setTimeout(() => {
        if (groupListRef.current) groupListRef.current.scrollTop = groupListRef.current.scrollHeight;
      }, 100);
    }
  }, [groupPopoverReopenKey]);

  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(groupSearchStr.toLowerCase()));
  const toggleGroup = (gId: string) => {
    const next = values.groupIds.includes(gId) ? values.groupIds.filter((id) => id !== gId) : [...values.groupIds, gId];
    onChange({ ...values, groupIds: next });
  };

  return (
    <div className="py-2 space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">用户信息</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              用户 ID
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>用户 ID 为唯一标识，不可修改</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              value={values.id}
              readOnly
              className="bg-gray-100 cursor-not-allowed select-none text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label>用户角色</Label>
            <Select value={values.role} onValueChange={(v) => !isInitialAdmin && onChange({ ...values, role: v })} disabled={isInitialAdmin}>
              <SelectTrigger className={`w-full ${isInitialAdmin ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-gray-50"}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 用户分组 */}
          <div className="space-y-2">
            <Label>用户分组</Label>
            <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
              <PopoverTrigger asChild>
                <div>
                  <GroupSelectTrigger names={groups.filter((g) => values.groupIds.includes(g.id)).map((g) => g.name)} />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popper-anchor-width)", minWidth: 280 }}>
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input className="w-full h-7 pl-8 pr-2 text-xs border border-gray-200 rounded-md outline-none focus:border-blue-300 bg-white placeholder:text-gray-400" placeholder="搜索分组..." value={groupSearchStr} onChange={(e) => setGroupSearchStr(e.target.value)} />
                  </div>
                </div>
                <div ref={groupListRef} className="max-h-[180px] overflow-y-auto py-1 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                  {filteredGroups.map((g) => (
                    <button key={g.id} className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${values.groupIds.includes(g.id) ? "text-blue-600" : "text-gray-700"}`} onClick={() => toggleGroup(g.id)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${values.groupIds.includes(g.id) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                        {values.groupIds.includes(g.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="truncate">{g.name}</span>
                    </button>
                  ))}
                  {filteredGroups.length === 0 && groupSearchStr.trim() && <p className="text-xs text-gray-400 text-center py-3">未找到匹配的分组</p>}
                  {filteredGroups.length === 0 && !groupSearchStr.trim() && <p className="text-xs text-gray-400 text-center py-3">暂无分组</p>}
                </div>
                <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {values.groupIds.length > 0 ? (
                      <span className="text-xs text-gray-400">已选 {values.groupIds.length} 个分组</span>
                    ) : (
                      <span className="text-[11px] text-gray-400"> </span>
                    )}
                    {values.groupIds.length > 0 && (
                      <button className="text-xs text-blue-500 hover:text-blue-600 hover:underline" onClick={() => onChange({ ...values, groupIds: [] })}>清除筛选</button>
                    )}
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 shrink-0"
                    onClick={() => { setGroupPopoverOpen(false); onOpenCreateGroupDialog?.(); }}
                  >
                    <FolderPlus className="w-3 h-3" />新建分组
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="border-t border-gray-100" />

      {/* 第二大块：用户配额 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">用户配额</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              OpenClaw 数量上限
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>单个企业用户最多可以创建的 OpenClaw 数量</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              value={clawStr}
              onChange={(e) => {
                setClawStr(e.target.value);
                if (e.target.value !== "") onChange({ ...values, clawLimit: Number(e.target.value) });
              }}
              onBlur={() => {
                if (clawStr === "" || isNaN(Number(clawStr))) {
                  setClawStr("0");
                  onChange({ ...values, clawLimit: 0 });
                }
              }}
              className="bg-gray-50"
              placeholder="请输入数量"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              每日 Tokens 数量上限
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>单个企业用户每日最多可消耗的 Tokens 数量</TooltipContent>
              </Tooltip>
            </Label>
            <TokenLimitInput
              value={values.tokenLimit}
              onChange={(v) => onChange({ ...values, tokenLimit: v })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OneID 编辑用户表单（用户 ID / 角色 / 部门 只读，仅配额可编辑） ──────────
const emptyOneidEditForm = {
  id: "", role: "member", department: "", clawLimit: LAST_CLAW_LIMIT, tokenLimit: LAST_TOKEN_LIMIT, groupIds: [] as string[],
};

function OneidEditMemberFormFields({
  values,
  onChange,
  groups = [],
  onOpenCreateGroupDialog,
  groupPopoverReopenKey = 0,
}: {
  values: typeof emptyOneidEditForm;
  onChange: (v: typeof emptyOneidEditForm) => void;
  groups?: MemberGroup[];
  onOpenCreateGroupDialog?: () => void;
  groupPopoverReopenKey?: number;
}) {
  const [clawStr, setClawStr] = React.useState<string>(String(values.clawLimit));
  const [groupSearchStr, setGroupSearchStr] = React.useState("");
  const [groupPopoverOpen, setGroupPopoverOpen] = React.useState(false);
  const groupReopenMounted = React.useRef(false);
  const groupListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setClawStr(String(values.clawLimit));
  }, [values.clawLimit]);

  React.useEffect(() => {
    if (!groupReopenMounted.current) { groupReopenMounted.current = true; return; }
    if (groupPopoverReopenKey > 0) {
      setGroupPopoverOpen(true);
      setTimeout(() => {
        if (groupListRef.current) groupListRef.current.scrollTop = groupListRef.current.scrollHeight;
      }, 100);
    }
  }, [groupPopoverReopenKey]);

  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(groupSearchStr.toLowerCase()));
  const toggleGroup = (gId: string) => {
    const next = values.groupIds.includes(gId) ? values.groupIds.filter((id) => id !== gId) : [...values.groupIds, gId];
    onChange({ ...values, groupIds: next });
  };

  return (
    <div className="py-2 space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">用户信息</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              用户 ID
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>用户 ID 由统一身份平台管理</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              value={values.id}
              readOnly
              className="bg-gray-100 cursor-not-allowed select-none text-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label>用户角色</Label>
            <Select value={values.role} disabled>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed opacity-60 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>用户归属</Label>
            <Input
              value={values.department || "—"}
              readOnly
              className="bg-gray-100 cursor-not-allowed select-none text-gray-400"
            />
          </div>

          {/* 用户分组 */}
          <div className="space-y-2">
            <Label>用户分组</Label>
            <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
              <PopoverTrigger asChild>
                <div>
                  <GroupSelectTrigger names={groups.filter((g) => values.groupIds.includes(g.id)).map((g) => g.name)} />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popper-anchor-width)", minWidth: 280 }}>
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input className="w-full h-7 pl-8 pr-2 text-xs border border-gray-200 rounded-md outline-none focus:border-blue-300 bg-white placeholder:text-gray-400" placeholder="搜索分组..." value={groupSearchStr} onChange={(e) => setGroupSearchStr(e.target.value)} />
                  </div>
                </div>
                <div ref={groupListRef} className="max-h-[180px] overflow-y-auto py-1 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                  {filteredGroups.map((g) => (
                    <button key={g.id} className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${values.groupIds.includes(g.id) ? "text-blue-600" : "text-gray-700"}`} onClick={() => toggleGroup(g.id)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${values.groupIds.includes(g.id) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                        {values.groupIds.includes(g.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="truncate">{g.name}</span>
                    </button>
                  ))}
                  {filteredGroups.length === 0 && groupSearchStr.trim() && <p className="text-xs text-gray-400 text-center py-3">未找到匹配的分组</p>}
                  {filteredGroups.length === 0 && !groupSearchStr.trim() && <p className="text-xs text-gray-400 text-center py-3">暂无分组</p>}
                </div>
                <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {values.groupIds.length > 0 ? (
                      <span className="text-xs text-gray-400">已选 {values.groupIds.length} 个分组</span>
                    ) : (
                      <span className="text-[11px] text-gray-400"> </span>
                    )}
                    {values.groupIds.length > 0 && (
                      <button className="text-xs text-blue-500 hover:text-blue-600 hover:underline" onClick={() => onChange({ ...values, groupIds: [] })}>清除筛选</button>
                    )}
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 shrink-0"
                    onClick={() => { setGroupPopoverOpen(false); onOpenCreateGroupDialog?.(); }}
                  >
                    <FolderPlus className="w-3 h-3" />新建分组
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* 用户配额（可编辑） */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">用户配额</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              OpenClaw 数量上限
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>单个企业用户最多可以创建的 OpenClaw 数量</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              value={clawStr}
              onChange={(e) => {
                setClawStr(e.target.value);
                if (e.target.value !== "") onChange({ ...values, clawLimit: Number(e.target.value) });
              }}
              onBlur={() => {
                if (clawStr === "" || isNaN(Number(clawStr))) {
                  setClawStr("0");
                  onChange({ ...values, clawLimit: 0 });
                }
              }}
              className="bg-gray-50"
              placeholder="请输入数量"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              每日 Tokens 数量上限
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>单个企业用户每日最多可消耗的 Tokens 数量</TooltipContent>
              </Tooltip>
            </Label>
            <TokenLimitInput
              value={values.tokenLimit}
              onChange={(v) => onChange({ ...values, tokenLimit: v })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 部门树选择器 ───────────────────────────────────────────────────────────
function DepartmentTreeNode({
  node,
  level,
  selected,
  expanded,
  onToggle,
  onSelect,
}: {
  node: DepartmentNode;
  level: number;
  selected: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${isSelected ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
          }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            className="w-4 h-4 flex items-center justify-center flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </span>
        )}
        <span className={`text-sm truncate flex-1 ${isSelected ? "text-blue-600 font-medium" : ""}`}>{node.name}</span>
        {isSelected && <Check className="w-4 h-4 ml-auto text-blue-600 flex-shrink-0" />}
      </div>
      {hasChildren && isExpanded && node.children!.map((child) => (
        <DepartmentTreeNode
          key={child.id}
          node={child}
          level={level + 1}
          selected={selected}
          expanded={expanded}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function DepartmentFilter({
  departments,
  value,
  onChange,
}: {
  departments: DepartmentNode[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setTempValue(value);
  }, [open, value]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    onChange(tempValue);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setOpen(false);
  };

  // 查找选中节点（递归）
  const findNode = (nodes: DepartmentNode[], id: string): DepartmentNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNode(n.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedNode = tempValue ? findNode(departments, tempValue) : undefined;
  const triggerNode = value ? findNode(departments, value) : undefined;
  const pathParts = selectedNode?.path?.split("/").filter(Boolean) || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`w-[120px] justify-between bg-white text-sm font-normal hover:bg-white data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50 ${triggerNode ? "text-foreground" : "text-muted-foreground"
            }`}
        >
          <span className="truncate">{triggerNode?.name || "全部部门"}</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-1 shrink-0 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="max-h-[280px] overflow-y-auto p-2">
          <div
            className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${tempValue === "" ? "bg-blue-50" : "hover:bg-gray-100"
              }`}
            onClick={() => setTempValue("")}
          >
            <span className={`text-sm flex-1 ${tempValue === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}>全部部门</span>
            {tempValue === "" && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
          </div>
          {departments.map((dept) => (
            <DepartmentTreeNode
              key={dept.id}
              node={dept}
              level={0}
              selected={tempValue}
              expanded={expanded}
              onToggle={toggleExpand}
              onSelect={setTempValue}
            />
          ))}
        </div>
        <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-1 text-xs overflow-hidden">
            {tempValue === "" ? (
              <span className="text-blue-600 font-medium truncate">全部部门</span>
            ) : pathParts.length > 0 ? (
              pathParts.map((part, idx) => (
                <span key={idx} className="flex items-center gap-1 shrink-0">
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                  <span className={idx === pathParts.length - 1 ? "text-blue-600 font-medium truncate" : "text-gray-500 truncate"}>
                    {part}
                  </span>
                </span>
              ))
            ) : (
              <span className="text-gray-400 truncate">未选择</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-7 px-2" onClick={handleCancel}>取消</Button>
            <Button size="sm" className="text-xs h-7 px-3" style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }} onClick={handleConfirm}>确认</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── 创建/重置成功弹窗 ────────────────────────────────────────────────────────
function CredentialResultDialog({
  open,
  onClose,
  title,
  memberId,
  password,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  memberId: string;
  password: string;
}) {
  const [copied, setCopied] = useState(false);
  // 每次弹窗打开时重置复制状态
  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);
  // 全加密：用 • 替换所有字符
  const maskedPassword = "•".repeat(password.length);

  const handleCopy = () => {
    const text = `账号：${memberId}\n密码：${password}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-1 pb-3 space-y-3">
          {/* 账号密码展示 */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">用户 ID</span>
              <span className="text-sm font-mono text-gray-800 select-all">{memberId}</span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">初始密码</span>
              <span className="text-sm font-mono text-gray-800 tracking-widest select-none">{maskedPassword}</span>
            </div>
          </div>

          {/* 警示文案 */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              关闭弹窗后将无法再次查看此密码，请复制后妥善保存，并通过安全渠道告知用户。
            </p>
          </div>

          {/* 复制按钮 */}
          <Button
            className="w-full"
            style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            onClick={handleCopy}
          >
            {copied ? (
              <><CheckCircle className="w-4 h-4 mr-2" />已复制</>
            ) : (
              <><Copy className="w-4 h-4 mr-2" />复制账号密码</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemberManagement() {
  // 获取 hasOneid 状态
  const { hasOneid } = useAdminMode();

  const [members, setMembers] = useState(MOCK_MEMBERS_BASE);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isInitialAdminEdit, setIsInitialAdminEdit] = useState(false);

  // OneID 模式专用状态
  const [deptFilter, setDeptFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "member">("all");
  const [oneidEditForm, setOneidEditForm] = useState({ ...emptyOneidEditForm });
  const [isSyncing, setIsSyncing] = useState(false);

  // 排序：管理员置顶（按加入时间升序），普通用户按加入时间降序
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    if (a.role === "admin" && b.role === "admin") {
      return new Date(a.joinTime).getTime() - new Date(b.joinTime).getTime();
    }
    return new Date(b.joinTime).getTime() - new Date(a.joinTime).getTime();
  });

  // 初始管理员：排序后第一位
  const initialAdminId = sortedMembers.find((m) => m.role === "admin")?.id;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  // 批量导入弹窗状态
  const [batchImportStep, setBatchImportStep] = useState<"upload" | "importing" | "done">("upload");
  const [batchImportFile, setBatchImportFile] = useState<File | null>(null);
  const [batchImportProgress, setBatchImportProgress] = useState(0); // 0~100
  const [batchImportResult, setBatchImportResult] = useState<{ success: number; fail: number } | null>(null);
  const [showResetDialog, setShowResetDialog] = useState<string | null>(null);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [addBtnHovered, setAddBtnHovered] = useState(false);

  const [newMember, setNewMember] = useState({ ...emptyNewMember });
  const [editForm, setEditForm] = useState({ ...emptyEditForm });
  const [resetForm, setResetForm] = useState({ ...emptyResetForm });

  // 创建/重置成功弹窗
  const [credentialDialog, setCredentialDialog] = useState<{
    open: boolean;
    title: string;
    memberId: string;
    password: string;
  }>({ open: false, title: "", memberId: "", password: "" });

  // 删除检查弹窗
  const [deleteCheckDialog, setDeleteCheckDialog] = useState<{
    open: boolean;
    memberId: string;
    clawCount: number;
    vpcType: "auto" | "custom";
    vpcName: string | null;
    hasVpcResources: boolean | null;
    clawRefreshing: boolean;
    vpcRefreshing: boolean;
  } | null>(null);
  // 二次确认弹窗
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; memberId: string; vpcType: "auto" | "custom"; vpcName: string | null } | null>(null);
  // 禁用确认弹窗（新：所有用户均可禁用，只需二次确认）
  const [disableConfirmDialog, setDisableConfirmDialog] = useState<{ open: boolean; memberId: string; clawCount: number } | null>(null);
  // 启用确认弹窗
  const [enableConfirmDialog, setEnableConfirmDialog] = useState<{ open: boolean; memberId: string; clawCount: number } | null>(null);

  // ─── 分组相关状态 ─────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"all" | "group">("all");
  const [groups, setGroups] = useState<MemberGroup[]>(MOCK_GROUPS_INIT);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(MOCK_GROUPS_INIT.length > 0 ? MOCK_GROUPS_INIT[0].id : "__ungrouped__");
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [deleteGroupDialog, setDeleteGroupDialog] = useState<{ open: boolean; groupId: string; groupName: string; memberCount: number; configRefreshing: boolean } | null>(null);
  const [showAddToGroupDialog, setShowAddToGroupDialog] = useState(false);
  const [addToGroupSearch, setAddToGroupSearch] = useState("");
  const [addToGroupSelected, setAddToGroupSelected] = useState<string[]>([]);
  const [addToGroupDeptFilter, setAddToGroupDeptFilter] = useState("");
  const [groupPage, setGroupPage] = useState(1);
  const [groupListSearch, setGroupListSearch] = useState("");
  const [groupPopoverReopenKey, setGroupPopoverReopenKey] = useState(0);
  const [removeFromGroupDialog, setRemoveFromGroupDialog] = useState<{ open: boolean; groupId: string; groupName: string; memberId: string } | null>(null);
  const [configSectionExpanded, setConfigSectionExpanded] = useState(false);

  // 筛选逻辑：hasOneid 模式时支持部门和角色筛选
  const filtered = sortedMembers.filter((m) => {
    // 搜索筛选
    if (!m.id.toLowerCase().includes(search.toLowerCase())) return false;
    // OneID 模式：部门筛选
    if (hasOneid && deptFilter) {
      const memberDept = MOCK_MEMBER_DEPARTMENTS[m.id] || "";
      // 根据部门 ID 匹配部门路径
      const findDeptPath = (nodes: DepartmentNode[], id: string): string | undefined => {
        for (const n of nodes) {
          if (n.id === id) return n.path;
          if (n.children) {
            const found = findDeptPath(n.children, id);
            if (found) return found;
          }
        }
        return undefined;
      };
      const selectedPath = findDeptPath(MOCK_DEPARTMENTS, deptFilter);
      if (selectedPath && !memberDept.startsWith(selectedPath)) return false;
    }
    // OneID 模式：角色筛选
    if (hasOneid && roleFilter !== "all" && m.role !== roleFilter) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAdd = () => {
    if (!newMember.id.trim()) { toast.error("请输入用户 ID"); return; }
    const pwd = generatePassword();
    setMembers([...members, {
      id: newMember.id, role: newMember.role, status: "active",
      clawLimit: newMember.clawLimit, tokenLimit: newMember.tokenLimit,
      clawCount: 0, joinTime: new Date().toISOString().slice(0, 10),
      vpcType: "auto" as const, vpcName: `openclaw/${newMember.id.split("@")[0]}`, hasVpcResources: false,
    }]);
    // 将新用户添加到选中的分组
    if (newMember.groupIds.length > 0) {
      setGroups(groups.map((g) =>
        newMember.groupIds.includes(g.id)
          ? { ...g, memberIds: [...g.memberIds, newMember.id] }
          : g
      ));
    }
    setShowAddDialog(false);
    setNewMember({ ...emptyNewMember });
    setCredentialDialog({ open: true, title: "成员已创建", memberId: newMember.id, password: pwd });
  };

  const openEditDialog = (member: typeof MOCK_MEMBERS_BASE[0]) => {
    const memberGroupIds = groups.filter((g) => g.memberIds.includes(member.id)).map((g) => g.id);
    if (hasOneid) {
      setOneidEditForm({
        id: member.id,
        role: member.role,
        department: MOCK_MEMBER_DEPARTMENTS[member.id] || "",
        clawLimit: member.clawLimit,
        tokenLimit: member.tokenLimit,
        groupIds: memberGroupIds,
      });
    } else {
      setEditForm({
        id: member.id,
        role: member.role,
        clawLimit: member.clawLimit,
        tokenLimit: member.tokenLimit,
        groupIds: memberGroupIds,
      });
      setIsInitialAdminEdit(member.id === initialAdminId);
    }
    setEditMemberId(member.id);
  };

  const handleEdit = () => {
    const targetId = editMemberId!;
    const newGroupIds = hasOneid ? oneidEditForm.groupIds : editForm.groupIds;
    if (hasOneid) {
      setMembers(members.map((m) =>
        m.id === targetId
          ? { ...m, clawLimit: oneidEditForm.clawLimit, tokenLimit: oneidEditForm.tokenLimit }
          : m
      ));
    } else {
      setMembers(members.map((m) =>
        m.id === targetId
          ? { ...m, role: editForm.role, clawLimit: editForm.clawLimit, tokenLimit: editForm.tokenLimit }
          : m
      ));
    }
    // 同步分组数据：先从所有组中移除该用户，再添加到选中的组
    setGroups(groups.map((g) => {
      const without = g.memberIds.filter((id) => id !== targetId);
      if (newGroupIds.includes(g.id)) {
        return { ...g, memberIds: [...new Set([...without, targetId])] };
      }
      return { ...g, memberIds: without };
    }));
    setEditMemberId(null);
    toast.success("用户信息已更新");
  };

  // 手动同步（OneID 模式）
  const handleSync = useCallback(() => {
    setIsSyncing(true);
    // 模拟同步过程
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("同步完成，用户数据已更新");
    }, 2000);
  }, []);

  const handleToggleStatus = (id: string) => {
    setMembers(members.map((m) =>
      m.id === id ? { ...m, status: m.status === "active" ? "disabled" : "active" } : m
    ));
    toast.success("状态已更新");
  };

  const openDeleteCheck = (member: typeof MOCK_MEMBERS_BASE[0]) => {
    setDeleteCheckDialog({
      open: true,
      memberId: member.id,
      clawCount: member.clawCount,
      vpcType: member.vpcType,
      vpcName: member.vpcName,
      hasVpcResources: member.hasVpcResources,
      clawRefreshing: false,
      vpcRefreshing: false,
    });
  };

  const openDisableConfirm = (member: typeof MOCK_MEMBERS_BASE[0]) => {
    setDisableConfirmDialog({ open: true, memberId: member.id, clawCount: member.clawCount });
  };

  const openEnableConfirm = (member: typeof MOCK_MEMBERS_BASE[0]) => {
    setEnableConfirmDialog({ open: true, memberId: member.id, clawCount: member.clawCount });
  };

  const handleDisable = (id: string) => {
    setMembers(members.map((m) => m.id === id ? { ...m, status: "disabled" } : m));
    setDisableConfirmDialog(null);
    toast.success("用户已禁用");
  };

  const handleEnable = (id: string) => {
    setMembers(members.map((m) => m.id === id ? { ...m, status: "active" } : m));
    setEnableConfirmDialog(null);
    toast.success("用户已启用");
  };

  const handleDelete = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    setDeleteConfirmDialog(null);
    toast.success("用户已删除");
  };

  const handleReset = () => {
    const pwd = generatePassword();
    const memberId = showResetDialog ?? "";
    setShowResetDialog(null);
    setResetForm({ ...emptyResetForm });
    setCredentialDialog({ open: true, title: "密码已重置", memberId, password: pwd });
  };

  // ─── 分组操作 ─────────────────────────────────────────────────────────────
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) { toast.error("请输入分组名称"); return; }
    if (groups.some((g) => g.name === newGroupName.trim())) { toast.error("分组名称已存在"); return; }
    const newGroup: MemberGroup = { id: `grp-${Date.now()}`, name: newGroupName.trim(), memberIds: [], createdAt: new Date().toISOString().slice(0, 10) };
    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setShowCreateGroupDialog(false);
    setSelectedGroupId(newGroup.id);
    // 如果添加用户弹窗打开，自动选中新分组并重新打开 Popover
    if (showAddDialog) {
      setNewMember((prev) => ({ ...prev, groupIds: [...prev.groupIds, newGroup.id] }));
      setTimeout(() => setGroupPopoverReopenKey((k) => k + 1), 150);
    }
    // 如果编辑用户弹窗打开，自动选中新分组并重新打开 Popover
    if (editMemberId) {
      if (hasOneid) {
        setOneidEditForm((prev) => ({ ...prev, groupIds: [...prev.groupIds, newGroup.id] }));
      } else {
        setEditForm((prev) => ({ ...prev, groupIds: [...prev.groupIds, newGroup.id] }));
      }
      setTimeout(() => setGroupPopoverReopenKey((k) => k + 1), 150);
    }
    toast.success("分组已创建");
  };

  const handleRenameGroup = (groupId: string) => {
    if (!editingGroupName.trim()) return;
    if (groups.some((g) => g.id !== groupId && g.name === editingGroupName.trim())) { toast.error("分组名称已存在"); return; }
    setGroups(groups.map((g) => g.id === groupId ? { ...g, name: editingGroupName.trim() } : g));
    setEditingGroupId(null);
    toast.success("分组已重命名");
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
    setDeleteGroupDialog(null);
    if (selectedGroupId === groupId) {
      const remaining = groups.filter((g) => g.id !== groupId);
      setSelectedGroupId(remaining.length > 0 ? remaining[0].id : "__ungrouped__");
    }
    toast.success("分组已删除，用户保留");
  };

  const handleRemoveFromGroup = (groupId: string, memberId: string) => {
    setGroups(groups.map((g) => g.id === groupId ? { ...g, memberIds: g.memberIds.filter((id) => id !== memberId) } : g));
    toast.success("已从分组中移除");
  };

  const handleAddMembersToGroup = () => {
    if (addToGroupSelected.length === 0) return;
    setGroups(groups.map((g) => {
      if (g.id !== selectedGroupId) return g;
      const newIds = [...new Set([...g.memberIds, ...addToGroupSelected])];
      return { ...g, memberIds: newIds };
    }));
    setShowAddToGroupDialog(false);
    setAddToGroupSearch("");
    setAddToGroupSelected([]);
    toast.success(`已添加 ${addToGroupSelected.length} 名用户到分组`);
  };

  // 分组视图的数据
  const getGroupMembers = () => {
    if (selectedGroupId === "__ungrouped__") {
      const allGroupedIds = new Set(groups.flatMap((g) => g.memberIds));
      return sortedMembers.filter((m) => !allGroupedIds.has(m.id));
    }
    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group) return [];
    return sortedMembers.filter((m) => group.memberIds.includes(m.id));
  };

  const groupFiltered = viewMode === "group" ? getGroupMembers() : [];
  const groupTotalPages = Math.max(1, Math.ceil(groupFiltered.length / PAGE_SIZE));
  const groupCurrentPage = Math.min(groupPage, groupTotalPages);
  const groupPaginated = groupFiltered.slice((groupCurrentPage - 1) * PAGE_SIZE, groupCurrentPage * PAGE_SIZE);

  return (
    <>
      <div className="page-enter">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
            <p className="text-sm text-gray-500 mt-1">管理企业用户的访问权限和资源配额
              {hasOneid && (
                <>
                  <span className="mx-2">|</span>
                  <button
                    onClick={async () => {
                      window.open(
                        "https://xxx.com/login",
                        "_blank"
                      );
                    }}
                    className="text-gray-500 hover:text-blue-500 inline-flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    前往腾讯统一身份管理用户
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </p>
          </div>
          {/* OneID 模式：右上角手动同步按钮 */}
          {hasOneid && (
            <Button
              variant="outline"
              className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />同步中...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" />手动同步</>
              )}
            </Button>
          )}
        </div>

        {/* Search + Filter + Actions Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* 视图切换按钮组（最左侧，两种模式通用） */}
            <div
              className="inline-flex items-center rounded-lg p-1 gap-0.5 bg-white border border-gray-200 h-9"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <button
                className={`h-7 px-3 rounded-md text-xs font-medium transition-all duration-200 ${viewMode === "all" ? "font-semibold text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                onClick={() => { setViewMode("all"); setPage(1); }}
              >
                全部
              </button>
              <button
                className={`h-7 px-3 rounded-md text-xs font-medium transition-all duration-200 ${viewMode === "group" ? "font-semibold text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                onClick={() => { setViewMode("group"); setGroupPage(1); }}
              >
                分组
              </button>
            </div>
            {/* OneID 模式：部门筛选 */}
            {hasOneid && (
              <DepartmentFilter
                departments={MOCK_DEPARTMENTS}
                value={deptFilter}
                onChange={(v) => { setDeptFilter(v); setPage(1); }}
              />
            )}
            {/* OneID 模式：角色筛选 */}
            {hasOneid && (
              <Select
                value={roleFilter}
                onValueChange={(v) => { setRoleFilter(v as "all" | "admin" | "member"); setPage(1); }}
              >
                <SelectTrigger className="w-[130px] bg-white border-gray-200 data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50 [&_svg:last-child]:transition-transform [&_svg:last-child]:duration-200 data-[state=open]:[&_svg:last-child]:rotate-180">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="member">用户</SelectItem>
                </SelectContent>
              </Select>
            )}
            {/* 搜索框 */}
            <div className="relative w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索用户 ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 bg-white border-gray-200"
              />
            </div>
            {/* 清除筛选按钮 - 当有任何筛选条件时显示 */}
            {(deptFilter || search.trim() || roleFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 h-9 px-3"
                onClick={() => {
                  setDeptFilter("");
                  setSearch("");
                  setRoleFilter("all");
                  setPage(1);
                }}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                清除筛选
              </Button>
            )}
          </div>
        </div>

        {/* Table - 全部视图 */}
        {viewMode === "all" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden w-full min-w-0"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          {/* 卡片 header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">全部用户</h2>
            {!hasOneid && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50 h-8 w-8"
                  title="导出用户列表"
                  onClick={() => {
                    const headers = ["用户ID", "姓名", "角色", "状态", "创建时间"];
                    const rows = members.map((m: any) => [m.id || "", m.name || m.username || "", m.role || "", m.status || "", m.createdAt || m.created_at || ""]);
                    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
                    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `用户列表_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("用户列表已导出");
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                {members.length >= 16 ? (
                  <div
                    className="relative inline-block cursor-not-allowed"
                    onMouseEnter={() => setAddBtnHovered(true)}
                    onMouseLeave={() => setAddBtnHovered(false)}
                  >
                    <div className="relative">
                      <Button className="pointer-events-none select-none h-8 text-sm" style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }} tabIndex={-1} aria-disabled="true">
                        <Plus className="w-4 h-4 mr-1.5" />添加用户<ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                      <div className="absolute inset-0 rounded-md bg-white/50 pointer-events-none" />
                    </div>
                    {addBtnHovered && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-md bg-gray-900 px-3 py-2 text-xs text-white leading-relaxed text-left shadow-lg pointer-events-none">
                        当前用户数已达上限，无法再添加
                      </div>
                    )}
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="h-8 text-sm" style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                        <Plus className="w-4 h-4 mr-1.5" />添加用户<ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowAddDialog(true)}><Plus className="w-4 h-4 mr-2" />单个添加</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowBatchDialog(true)}><Upload className="w-4 h-4 mr-2" />批量导入</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
          <div className="overflow-x-auto" style={{ overscrollBehaviorX: "contain" }}>
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    用户 ID
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-default inline-flex"><Info className="w-3.5 h-3.5 text-gray-400" /></span></TooltipTrigger>
                      <TooltipContent>企业用户的唯一 ID，例如企业邮箱或企业用户唯一名称</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                {hasOneid && (
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      用户归属
                      <Tooltip>
                        <TooltipTrigger asChild><span className="cursor-default inline-flex"><Info className="w-3.5 h-3.5 text-gray-400" /></span></TooltipTrigger>
                        <TooltipContent>用户在统一身份平台中的组织归属</TooltipContent>
                      </Tooltip>
                    </div>
                  </th>
                )}
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">角色</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">状态</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">分组</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    OpenClaw 上限
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-default inline-flex"><Info className="w-3.5 h-3.5 text-gray-400" /></span></TooltipTrigger>
                      <TooltipContent>单个企业用户最多可以创建的 OpenClaw 数量</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    每日 Tokens 上限
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-default inline-flex"><Info className="w-3.5 h-3.5 text-gray-400" /></span></TooltipTrigger>
                      <TooltipContent>单个企业用户每日最多可消耗的 Tokens 数量</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">加入时间</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap sticky right-0 z-10 w-[1%]" style={{ backgroundColor: "#fbfbfd" }}>操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((member) => {
                const memberGroups = groups.filter((g) => g.memberIds.includes(member.id));
                const groupNames = memberGroups.map((g) => g.name);
                return (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{member.id}</span>
                  </td>
                  {hasOneid && (
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate max-w-[140px]" title={MOCK_MEMBER_DEPARTMENTS[member.id] || "—"}>
                          {MOCK_MEMBER_DEPARTMENTS[member.id] || "—"}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={member.role === "admin" ? "border-blue-200 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500"}>
                      {member.role === "admin" ? "管理员" : "用户"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {member.status === "active" ? (
                      <span className="badge-running text-xs"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />正常</span>
                    ) : (
                      <span className="badge-stopped text-xs"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />禁用</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 max-w-[140px]">
                    {groupNames.length === 0 ? (
                      <span className="text-sm text-gray-300">—</span>
                    ) : groupNames.length === 1 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="badge-shutdown max-w-[130px] truncate inline-block align-middle cursor-default">{groupNames[0]}</span>
                        </TooltipTrigger>
                        <TooltipContent>{groupNames[0]}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 cursor-default">
                            <span className="badge-shutdown max-w-[100px] truncate inline-block align-middle">{groupNames[0]}</span>
                            <span className="badge-shutdown whitespace-nowrap">+{groupNames.length - 1}</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{groupNames.join(", ")}</TooltipContent>
                      </Tooltip>
                    )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{member.clawLimit}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{member.tokenLimit.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{member.joinTime}</span>
                  </td>
                  <td className="px-4 py-4 sticky right-0 bg-white z-10 w-[1%]">
                    <div className="flex items-center justify-center gap-0.5">
                    {hasOneid ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-blue-600 h-7 w-7 p-0"
                            onClick={() => openEditDialog(member)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>编辑</TooltipContent>
                      </Tooltip>
                    ) : (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-blue-600 h-7 w-7 p-0"
                              onClick={() => openEditDialog(member)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>编辑</TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 h-7 w-7 p-0 !ring-0 !outline-none focus-visible:!ring-0 focus-visible:!border-transparent">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.id === initialAdminId ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center px-2 py-1.5 text-xs text-gray-300 cursor-not-allowed select-none rounded-sm">
                                    <Key className="w-3.5 h-3.5 mr-2" />重置密码
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-[220px] text-xs leading-relaxed">初始管理员账号不允许重置密码</TooltipContent>
                              </Tooltip>
                            ) : (
                              <DropdownMenuItem className="text-xs text-gray-500 focus:text-gray-700 focus:bg-gray-50" onClick={() => { setShowResetDialog(member.id); setResetForm({ ...emptyResetForm }); }}>
                                <Key className="w-3.5 h-3.5 mr-2" />重置密码
                              </DropdownMenuItem>
                            )}
                            {member.id === initialAdminId ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center px-2 py-1.5 text-xs text-gray-300 cursor-not-allowed select-none rounded-sm">
                                    <UserX className="w-3.5 h-3.5 mr-2" />禁用
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left">初始管理员账号不可禁用</TooltipContent>
                              </Tooltip>
                            ) : member.status === "active" ? (
                              <DropdownMenuItem className="text-xs text-gray-500 focus:text-gray-700 focus:bg-gray-50" onClick={() => openDisableConfirm(member)}>
                                <UserX className="w-3.5 h-3.5 mr-2" />禁用
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-xs text-gray-500 focus:text-gray-700 focus:bg-gray-50" onClick={() => openEnableConfirm(member)}>
                                <UserCheck className="w-3.5 h-3.5 mr-2" />启用
                              </DropdownMenuItem>
                            )}
                            {member.id === initialAdminId ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center px-2 py-1.5 text-xs text-gray-300 cursor-not-allowed select-none rounded-sm">
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />删除
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left">初始管理员账号不可删除</TooltipContent>
                              </Tooltip>
                            ) : (
                              <DropdownMenuItem className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => openDeleteCheck(member)}>
                                <Trash2 className="w-3.5 h-3.5 mr-2" />删除
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {/* 底部翻页 */}
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">共 {filtered.length} 名用户，第 {currentPage} / {totalPages} 页</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push("...");
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                    if (currentPage < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }
                  return pages.map((p, idx) =>
                    typeof p === "string" ? (
                      <span key={`ellipsis-${idx}`} className="h-7 w-7 flex items-center justify-center text-xs text-gray-400">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${p === currentPage ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
                        style={p === currentPage ? { background: "#007AFF" } : undefined}
                        onClick={() => setPage(p as number)}
                      >{p}</button>
                    )
                  );
                })()}
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        )}

        {/* 分组视图 */}
        {viewMode === "group" && (
          <div className="flex gap-4">
            {/* 左侧分组列表 */}
            <div
              className="w-[280px] shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden self-start"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
            >
              {/* 顶部：新建分组 + 搜索 */}
              <div className="p-3 flex items-center gap-2">
                <button
                  className="shrink-0 flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  onClick={() => { setShowCreateGroupDialog(true); setNewGroupName(""); }}
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  新建
                </button>
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    className="w-full h-8 pl-7 pr-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-300 bg-white placeholder:text-gray-400"
                    placeholder="搜索分组..."
                    value={groupListSearch}
                    onChange={(e) => setGroupListSearch(e.target.value)}
                  />
                </div>
              </div>
              {/* 分组列表 */}
              <div className="max-h-[400px] overflow-y-auto">
                {/* 已有分组 */}
                {groups
                  .filter((g) => g.name.toLowerCase().includes(groupListSearch.toLowerCase()))
                  .map((group) => (
                  <div key={group.id} className={`flex items-center gap-1 px-4 py-2.5 transition-colors ${selectedGroupId === group.id ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                    {editingGroupId === group.id ? (
                      <div className="flex-1 flex items-center gap-1 min-w-0">
                        <input
                          className="flex-1 min-w-0 h-6 px-2 text-sm border border-blue-300 rounded outline-none bg-white"
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameGroup(group.id); if (e.key === "Escape") setEditingGroupId(null); }}
                          autoFocus
                        />
                        <button
                          className="w-5 h-5 flex items-center justify-center rounded text-green-600 hover:bg-green-50 transition-colors shrink-0"
                          title="保存"
                          onMouseDown={(e) => { e.preventDefault(); handleRenameGroup(group.id); }}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 transition-colors shrink-0"
                          title="取消"
                          onMouseDown={(e) => { e.preventDefault(); setEditingGroupId(null); }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        className={`flex-1 flex items-center gap-2 text-sm text-left min-w-0 ${selectedGroupId === group.id ? "text-blue-600 font-medium" : "text-gray-700"}`}
                        onClick={() => { setSelectedGroupId(group.id); setGroupPage(1); }}
                      >
                        <Users className="w-4 h-4 flex-shrink-0 opacity-60" />
                        <span className="truncate">{group.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">({group.memberIds.length})</span>
                      </button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors shrink-0 ${selectedGroupId === group.id ? "text-blue-500 hover:bg-blue-100" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-xs text-gray-600 focus:text-gray-600 focus:bg-gray-50" onClick={() => { setEditingGroupId(group.id); setEditingGroupName(group.name); }}>
                          <Pencil className="w-3.5 h-3.5 mr-2" />重命名
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => setDeleteGroupDialog({ open: true, groupId: group.id, groupName: group.name, memberCount: group.memberIds.length, configRefreshing: false })}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" />删除分组
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                {/* 暂无分组提示 */}
                {groups.filter((g) => g.name.toLowerCase().includes(groupListSearch.toLowerCase())).length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-gray-400">暂无分组</p>
                  </div>
                )}
                {/* 未分组（放在最下面） */}
                <div className={`flex items-center gap-1 px-4 py-2.5 transition-colors border-t border-gray-100 ${selectedGroupId === "__ungrouped__" ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                <button
                  className={`flex-1 flex items-center gap-2 text-sm text-left min-w-0 ${selectedGroupId === "__ungrouped__" ? "text-blue-600 font-medium" : "text-gray-700"}`}
                  onClick={() => { setSelectedGroupId("__ungrouped__"); setGroupPage(1); }}
                >
                  <Users className="w-4 h-4 flex-shrink-0 opacity-60" />
                  <span className="truncate">未分组</span>
                  <span className="text-xs text-gray-400 shrink-0">({(() => { const allGroupedIds = new Set(groups.flatMap((g) => g.memberIds)); return sortedMembers.filter((m) => !allGroupedIds.has(m.id)).length; })()})</span>
                </button>
                <div className="w-6 h-6 shrink-0" />
                </div>
              </div>
            </div>

            {/* 右侧用户列表 */}
            <div className="flex-1 min-w-0">
              <div
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
              >
                {/* 卡片 header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 min-h-[56px]">
                  <h2 className="font-semibold text-gray-900">
                    {selectedGroupId === "__ungrouped__" ? "未分组" : groups.find((g) => g.id === selectedGroupId)?.name || ""}
                  </h2>
                  {selectedGroupId !== "__ungrouped__" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-sm border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => { setShowAddToGroupDialog(true); setAddToGroupSearch(""); setAddToGroupSelected([]); }}
                    >
                      <Plus className="w-4 h-4 mr-1" />添加用户到分组
                    </Button>
                  )}
                </div>

                {groupFiltered.length === 0 ? (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <Users className="w-12 h-12 text-gray-200" />
                    <p className="text-sm text-gray-400">
                      {selectedGroupId === "__ungrouped__" ? "所有用户均已分组" : "该分组暂无用户"}
                    </p>
                    {selectedGroupId !== "__ungrouped__" && (
                      <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => { setShowAddToGroupDialog(true); setAddToGroupSearch(""); setAddToGroupSelected([]); }}>
                        <Plus className="w-3.5 h-3.5 mr-1" />添加用户到分组
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">用户 ID</th>
                          {hasOneid && (
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">用户归属</th>
                          )}
                          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">角色</th>
                          {selectedGroupId !== "__ungrouped__" && (
                            <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">操作</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {groupPaginated.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900">{member.id}</span></td>
                            {hasOneid && (
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-600 truncate max-w-[140px]" title={MOCK_MEMBER_DEPARTMENTS[member.id] || "—"}>
                                    {MOCK_MEMBER_DEPARTMENTS[member.id] || "—"}
                                  </span>
                                </div>
                              </td>
                            )}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge variant="outline" className={member.role === "admin" ? "border-blue-200 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500"}>
                                {member.role === "admin" ? "管理员" : "用户"}
                              </Badge>
                            </td>
                            {selectedGroupId !== "__ungrouped__" && (
                              <td className="px-4 py-4 text-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 h-7 w-7 p-0" onClick={() => setRemoveFromGroupDialog({ open: true, groupId: selectedGroupId, groupName: groups.find((g) => g.id === selectedGroupId)?.name || "", memberId: member.id })}>
                                      <UserMinus className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>从分组中移除</TooltipContent>
                                </Tooltip>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                    {/* 翻页 */}
                    <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xs text-gray-400">共 {groupFiltered.length} 名用户，第 {groupCurrentPage} / {groupTotalPages} 页</span>
                      {groupTotalPages > 1 && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400" disabled={groupCurrentPage === 1} onClick={() => setGroupPage(groupCurrentPage - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          {(() => {
                            const pages: (number | string)[] = [];
                            if (groupTotalPages <= 7) {
                              for (let i = 1; i <= groupTotalPages; i++) pages.push(i);
                            } else {
                              pages.push(1);
                              if (groupCurrentPage > 3) pages.push("...");
                              for (let i = Math.max(2, groupCurrentPage - 1); i <= Math.min(groupTotalPages - 1, groupCurrentPage + 1); i++) pages.push(i);
                              if (groupCurrentPage < groupTotalPages - 2) pages.push("...");
                              pages.push(groupTotalPages);
                            }
                            return pages.map((p, idx) =>
                              typeof p === "string" ? (
                                <span key={`gellipsis-${idx}`} className="h-7 w-7 flex items-center justify-center text-xs text-gray-400">…</span>
                              ) : (
                                <button
                                  key={p}
                                  className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${p === groupCurrentPage ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
                                  style={p === groupCurrentPage ? { background: "#007AFF" } : undefined}
                                  onClick={() => setGroupPage(p as number)}
                                >{p}</button>
                              )
                            );
                          })()}
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400" disabled={groupCurrentPage === groupTotalPages} onClick={() => setGroupPage(groupCurrentPage + 1)}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
          </DialogHeader>
          <AddMemberFormFields
            values={newMember}
            onChange={setNewMember}
            existingMemberIds={members.map((m) => m.id)}
            groups={groups}
            onOpenCreateGroupDialog={() => { setShowCreateGroupDialog(true); setNewGroupName(""); }}
            groupPopoverReopenKey={groupPopoverReopenKey}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button onClick={handleAdd} style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editMemberId} onOpenChange={(open) => { if (!open) setEditMemberId(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          {hasOneid ? (
            <OneidEditMemberFormFields
              values={oneidEditForm}
              onChange={setOneidEditForm}
              groups={groups}
              onOpenCreateGroupDialog={() => { setShowCreateGroupDialog(true); setNewGroupName(""); }}
              groupPopoverReopenKey={groupPopoverReopenKey}
            />
          ) : (
            <EditMemberFormFields
              values={editForm}
              onChange={setEditForm}
              isInitialAdmin={isInitialAdminEdit}
              groups={groups}
              onOpenCreateGroupDialog={() => { setShowCreateGroupDialog(true); setNewGroupName(""); }}
              groupPopoverReopenKey={groupPopoverReopenKey}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMemberId(null)}>取消</Button>
            <Button onClick={handleEdit} style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Import Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={(open) => {
        if (!open) {
          setShowBatchDialog(false);
          // 重置状态
          setTimeout(() => {
            setBatchImportStep("upload");
            setBatchImportFile(null);
            setBatchImportProgress(0);
            setBatchImportResult(null);
          }, 300);
        }
      }}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
          if (batchImportStep === "importing") e.preventDefault();
        }}>
          <DialogHeader>
            <DialogTitle>批量导入用户</DialogTitle>
          </DialogHeader>



          {/* ── 上传阶段 ── */}
          {batchImportStep === "upload" && (
            <div className="space-y-4 py-1">
              {/* Step 1: 下载模板 */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">第一步：下载模板并填写用户信息</p>
                <p className="text-xs text-gray-500 leading-relaxed">下载 CSV 模板，按格式填写信息后保存。<span className="text-orange-500 font-medium">单次最多导入 1000 个用户。</span></p>
                <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => {
                  // 生成模板 CSV 并下载
                  const header = "用户邮箱,姓名,角色(admin/member),每日Tokens上限(-1表示无限制)";
                  const example = "user@example.com,张三,member,100000";
                  const blob = new Blob([header + "\n" + example], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = "批量导入用户模板.csv"; a.click();
                  URL.revokeObjectURL(url);
                  toast.success("模板已下载");
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  下载导入模板
                </Button>
              </div>

              {/* Step 2: 上传文件 */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">第二步：上传填写好的 CSV 文件</p>
                {!batchImportFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mb-1.5" />
                    <span className="text-sm text-gray-500">点击选择 CSV 文件</span>
                    <span className="text-xs text-gray-400 mt-0.5">仅支持 .csv 格式</span>
                    <input type="file" accept=".csv" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setBatchImportFile(file);
                      }} />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-green-300 bg-green-50">
                    <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{batchImportFile.name}</p>
                      <p className="text-xs text-gray-500">{(batchImportFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors flex-shrink-0"
                      onClick={() => setBatchImportFile(null)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 导入中阶段 ── */}
          {batchImportStep === "importing" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-base font-semibold text-gray-800">正在导入中...</p>
                <p className="text-sm text-gray-500">预计需要 1 ~ 2 分钟，请勿关闭弹窗</p>
                <p className="text-xs text-gray-400">导入完成后将自动显示结果通知</p>
              </div>
            </div>
          )}

          <DialogFooter>
            {batchImportStep === "upload" && (
              <>
                <Button variant="outline" onClick={() => {
                  setShowBatchDialog(false);
                  setTimeout(() => {
                    setBatchImportStep("upload");
                    setBatchImportFile(null);
                    setBatchImportProgress(0);
                    setBatchImportResult(null);
                  }, 300);
                }}>取消</Button>
                <Button
                  disabled={!batchImportFile}
                  onClick={() => {
                    // 开始导入
                    setBatchImportStep("importing");
                    setBatchImportProgress(0);
                    // 模拟进度：90 秒内从 0 到 95%，最后跳到 100%
                    const totalMs = 90000;
                    const intervalMs = 1000;
                    const steps = totalMs / intervalMs;
                    let current = 0;
                    const timer = setInterval(() => {
                      current += 1;
                      const pct = Math.min(95, Math.round((current / steps) * 95));
                      setBatchImportProgress(pct);
                      if (current >= steps) {
                        clearInterval(timer);
                        setBatchImportProgress(100);
                        setTimeout(() => {
                          const result = { success: 85, fail: 15 };
                          setBatchImportResult(result);
                          setBatchImportStep("upload");
                          setShowBatchDialog(false);
                          setTimeout(() => {
                            setBatchImportStep("upload");
                            setBatchImportFile(null);
                            setBatchImportProgress(0);
                            setBatchImportResult(null);
                          }, 300);
                          // Toast with download link
                          toast.success(
                            `导入完成：成功 ${result.success} 条，失败 ${result.fail} 条`,
                            {
                              duration: 10000,
                              action: {
                                label: "下载详情报告",
                                onClick: () => {
                                  const rows = ["用户邮箱,导入状态,备注"];
                                  for (let i = 1; i <= result.success; i++) {
                                    rows.push(`success_user_${i}@example.com,成功,`);
                                  }
                                  for (let i = 1; i <= result.fail; i++) {
                                    rows.push(`fail_user_${i}@example.com,失败,邮箱格式错误`);
                                  }
                                  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url; a.download = "导入详情报告.csv"; a.click();
                                  URL.revokeObjectURL(url);
                                },
                              },
                            }
                          );
                        }, 500);
                      }
                    }, intervalMs);
                  }}
                >
                  确认导入
                </Button>
              </>
            )}

          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!showResetDialog} onOpenChange={(open) => { if (!open) { setShowResetDialog(null); setResetForm({ ...emptyResetForm }); } }}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              确认重置用户 <span className="font-semibold text-gray-900">{showResetDialog}</span> 的密码？系统将自动生成新密码。
            </p>

            {/* 信息发送 - 弱化视觉 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">（选填）信息发送</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default inline-flex">
                      <Info className="w-3 h-3 text-gray-300" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>信息发送会产生额外的短信/邮件费用，合并到腾讯云账单计费</TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="email"
                placeholder="输入用户接收新密码的邮箱地址"
                value={resetForm.notificationEmail}
                onChange={(e) => setResetForm({ ...resetForm, notificationEmail: e.target.value })}
                className="bg-gray-50 text-sm placeholder:text-gray-300 border-gray-200"
                tabIndex={-1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowResetDialog(null); setResetForm({ ...emptyResetForm }); }}>取消</Button>
            <Button onClick={handleReset} style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credential Result Dialog (创建成功 / 密码已重置) */}
      <CredentialResultDialog
        open={credentialDialog.open}
        onClose={() => setCredentialDialog((d) => ({ ...d, open: false }))}
        title={credentialDialog.title}
        memberId={credentialDialog.memberId}
        password={credentialDialog.password}
      />

      {/* Delete Check Dialog - 第一步：资源情况说明 */}
      <Dialog
        open={!!deleteCheckDialog?.open}
        onOpenChange={(open) => { if (!open) setDeleteCheckDialog(null); }}
      >
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>删除用户</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {/* 用户 ID */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">用户 ID</span>
              <span className="text-sm font-medium text-gray-900">{deleteCheckDialog?.memberId}</span>
            </div>

            {/* 名下 OpenClaw 数量（单行） */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">名下 OpenClaw 数量</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${(deleteCheckDialog?.clawCount ?? 0) > 0 ? "text-red-600" : "text-green-600"
                  }`}>
                  {deleteCheckDialog?.clawRefreshing
                    ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    : <>{deleteCheckDialog?.clawCount ?? 0} 个</>
                  }
                </span>
                <button
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  title="刷新"
                  onClick={() => {
                    if (!deleteCheckDialog) return;
                    setDeleteCheckDialog({ ...deleteCheckDialog, clawRefreshing: true });
                    setTimeout(() => {
                      const newCount = Math.random() > 0.5 ? deleteCheckDialog.clawCount : 0;
                      setDeleteCheckDialog({ ...deleteCheckDialog, clawCount: newCount, clawRefreshing: false });
                    }, 1200);
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 自动分配 VPC：私有网络单行，关联资源状态用括号跟在 VPC 名称后 */}
            {deleteCheckDialog?.vpcType === "auto" && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">私有网络</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    <a
                      href="https://console.cloud.tencent.com/vpc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {deleteCheckDialog?.vpcName}
                    </a>
                    {deleteCheckDialog?.vpcRefreshing ? (
                      <span className="text-gray-400 ml-1">(检查中...)</span>
                    ) : deleteCheckDialog?.hasVpcResources ? (
                      <span className="text-red-600 ml-1">(有关联云资源)</span>
                    ) : (
                      <span className="text-green-600 ml-1">(无关联资源)</span>
                    )}
                  </span>
                  <button
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    title="刷新"
                    onClick={() => {
                      if (!deleteCheckDialog) return;
                      setDeleteCheckDialog({ ...deleteCheckDialog, vpcRefreshing: true });
                      setTimeout(() => {
                        const newHasResources = Math.random() > 0.5 ? deleteCheckDialog.hasVpcResources : false;
                        setDeleteCheckDialog({ ...deleteCheckDialog, hasVpcResources: newHasResources, vpcRefreshing: false });
                      }, 1200);
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* 状态框：根据条件是否满足显示红色（无法删除）或绿色（可删除） */}
            {(() => {
              const clawOk = (deleteCheckDialog?.clawCount ?? 0) === 0;
              const vpcOk = deleteCheckDialog?.vpcType === "custom" || deleteCheckDialog?.hasVpcResources === false;
              const allOk = clawOk && vpcOk;

              if (allOk) {
                // 绿色框：条件已满足
                return (
                  <div className="rounded-lg bg-green-50 border border-green-300 px-4 py-3 text-sm text-green-700">
                    {deleteCheckDialog?.vpcType === "auto"
                      ? `该用户名下没有 OpenClaw，且私有网络无关联资源，可以删除。`
                      : `该用户名下没有 OpenClaw，可以删除。`
                    }
                  </div>
                );
              }

              // 红色框：条件未满足，先说条件再说操作建议，每个问题各一段
              const reasons: React.ReactNode[] = [];
              if (!clawOk) {
                reasons.push(
                  <p key="claw">
                    删除用户需要该用户名下没有任何 OpenClaw。可让用户自行删除，或由管理员在 OpenClaw 监控页手动删除。
                  </p>
                );
              }
              if (deleteCheckDialog?.vpcType === "auto" && !vpcOk) {
                reasons.push(
                  <p key="vpc">
                    删除用户需要系统自动分配的私有网络下无关联云资源。请前往{" "}
                    <a href="https://console.cloud.tencent.com/vpc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline hover:text-red-700">腾讯云控制台<ExternalLink className="w-3 h-3 inline-block" /></a>
                    {" "}解除后，再刷新检查。
                  </p>
                );
              }

              return (
                <div className="rounded-lg bg-red-50 border border-red-400 px-4 py-3 text-sm text-red-600 space-y-2">
                  <p className="font-semibold">无法删除该用户</p>
                  {reasons}
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCheckDialog(null)}>取消</Button>
            {/* 所有条件满足时才显示确认删除按钮 */}
            {(deleteCheckDialog?.clawCount ?? 0) === 0 &&
              (deleteCheckDialog?.vpcType === "custom" || deleteCheckDialog?.hasVpcResources === false) && (
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => {
                    const d = deleteCheckDialog!;
                    setDeleteCheckDialog(null);
                    setDeleteConfirmDialog({ open: true, memberId: d.memberId, vpcType: d.vpcType, vpcName: d.vpcName });
                  }}
                >
                  确认删除
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Confirm Dialog（新：所有用户均可禁用，说明后果） */}
      <Dialog
        open={!!disableConfirmDialog?.open}
        onOpenChange={(open) => { if (!open) setDisableConfirmDialog(null); }}
      >
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>禁用用户</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">用户 ID</span>
              <span className="text-sm font-medium text-gray-900">{disableConfirmDialog?.memberId}</span>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">名下 OpenClaw 数量</span>
              <span className="text-sm font-semibold text-gray-800">{disableConfirmDialog?.clawCount ?? 0} 个</span>
            </div>
            <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-600 space-y-2">
              <p className="font-medium">禁用后将产生以下影响：</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>该用户将<span className="font-semibold">无法再登录</span>用户端</li>
                <li>名下所有 OpenClaw 云服务器<span className="font-semibold">关机</span>（数据不删除）</li>
                <li>用户将<span className="font-semibold">无法与 OpenClaw 机器人对话</span></li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableConfirmDialog(null)}>取消</Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => handleDisable(disableConfirmDialog!.memberId)}
            >
              确认禁用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable Confirm Dialog */}
      <Dialog
        open={!!enableConfirmDialog?.open}
        onOpenChange={(open) => { if (!open) setEnableConfirmDialog(null); }}
      >
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>启用用户</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">用户 ID</span>
              <span className="text-sm font-medium text-gray-900">{enableConfirmDialog?.memberId}</span>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">名下 OpenClaw 数量</span>
              <span className="text-sm font-semibold text-gray-800">{enableConfirmDialog?.clawCount ?? 0} 个</span>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-300 px-4 py-3 text-sm text-green-700 space-y-2">
              <p className="font-medium">启用后将产生以下影响：</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>该用户可以<span className="font-semibold">继续登录</span>用户端</li>
                <li>名下所有 OpenClaw 云服务器将<span className="font-semibold">开机</span>，恢复运行</li>
                <li>用户可以<span className="font-semibold">恢复与 OpenClaw 机器人对话</span></li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnableConfirmDialog(null)}>取消</Button>
            <Button
              className="bg-green-700 hover:bg-green-800 text-white"
              onClick={() => handleEnable(enableConfirmDialog!.memberId)}
            >
              确认启用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog (二次确认) - 第二步：列出将删除的资源 */}
      <Dialog
        open={!!deleteConfirmDialog?.open}
        onOpenChange={(open) => { if (!open) setDeleteConfirmDialog(null); }}
      >
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>确认删除用户</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm text-gray-600">以下资源将被删除：</p>

            {/* 资源列表：每行左边有删除 icon */}
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 space-y-2">
              {/* 用户账号 */}
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="text-sm text-red-600">
                  用户账号：<span className="font-medium">{deleteConfirmDialog?.memberId}</span>
                </span>
              </div>
              {/* 自动分配 VPC：一并删除 */}
              {deleteConfirmDialog?.vpcType === "auto" && deleteConfirmDialog?.vpcName && (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="text-sm text-red-600">
                    私有网络：<span className="font-medium">{deleteConfirmDialog.vpcName}</span>
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-red-600 font-medium">删除后无法恢复，请谨慎确认。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialog(null)}>取消</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleDelete(deleteConfirmDialog!.memberId)}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建分组 Dialog */}
      <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
        <DialogContent className="sm:max-w-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>新建分组</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label>分组名称</Label>
              <Input
                placeholder="请输入分组名称"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateGroup(); }}
                className="bg-gray-50"
                autoFocus
              />
              <p className="text-xs text-gray-400">分组名称为唯一标识，不能与已有分组重名，创建后支持修改</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateGroupDialog(false)}>取消</Button>
            <Button onClick={handleCreateGroup} style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>确认创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除分组确认 Dialog */}
      <Dialog open={!!deleteGroupDialog?.open} onOpenChange={(open) => { if (!open) setDeleteGroupDialog(null); }}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>删除分组</DialogTitle>
          </DialogHeader>
          {(() => {
            const configs = deleteGroupDialog ? (MOCK_GROUP_CONFIGS[deleteGroupDialog.groupId] || []) : [];
            const hasRelatedConfigs = configs.some((c) => c.items.length > 0);
            return (
              <div className="py-2 space-y-3">
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">分组名称</span>
                  <span className="text-sm font-medium text-gray-900">{deleteGroupDialog?.groupName}</span>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">分组内用户数</span>
                  <span className="text-sm font-semibold text-gray-800">{deleteGroupDialog?.memberCount ?? 0} 人</span>
                </div>

                {/* 已应用配置 */}
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">已应用配置</span>
                    <button
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      title="刷新"
                      onClick={() => {
                        if (!deleteGroupDialog) return;
                        setDeleteGroupDialog({ ...deleteGroupDialog, configRefreshing: true });
                        setTimeout(() => {
                          setDeleteGroupDialog((prev) => prev ? { ...prev, configRefreshing: false } : null);
                        }, 1200);
                      }}
                    >
                      {deleteGroupDialog?.configRefreshing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {hasRelatedConfigs ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {configs.filter((c) => c.items.length > 0).map((c) => (
                        <span key={c.type} className="badge-shutdown">{c.type}({c.items.length})</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-green-600">无关联配置</span>
                  )}
                </div>

                {/* 状态提示 */}
                {hasRelatedConfigs ? (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 space-y-2">
                    <p className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />以上配置的应用范围包含该分组，请先前往对应配置页面移除该分组后再执行删除。</p>
                    <p className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />删除分组后，组内用户不会被删除，仅解除分组关联。</p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-green-50 border border-green-300 px-4 py-3 text-sm text-green-700">
                    该分组无关联配置，可安全删除。删除后组内用户不会被删除，仅解除分组关联。
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGroupDialog(null)}>取消</Button>
            {(() => {
              const configs = deleteGroupDialog ? (MOCK_GROUP_CONFIGS[deleteGroupDialog.groupId] || []) : [];
              const hasRelatedConfigs = configs.some((c) => c.items.length > 0);
              return !hasRelatedConfigs && (
                <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => deleteGroupDialog && handleDeleteGroup(deleteGroupDialog.groupId)}>
                  确认删除
                </Button>
              );
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 从分组中移除确认 Dialog */}
      <Dialog open={!!removeFromGroupDialog?.open} onOpenChange={(open) => { if (!open) setRemoveFromGroupDialog(null); }}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>从分组中移除</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">用户 ID</span>
                <span className="text-sm font-medium text-gray-900">{removeFromGroupDialog?.memberId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">分组名称</span>
                <span className="text-sm font-medium text-gray-900">{removeFromGroupDialog?.groupName}</span>
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-600 leading-relaxed">
              移除后，该用户在此分组下的可见范围和权限将被收回。用户不会被删除，仅解除与该分组的关联。
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveFromGroupDialog(null)}>取消</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => {
              if (removeFromGroupDialog) {
                handleRemoveFromGroup(removeFromGroupDialog.groupId, removeFromGroupDialog.memberId);
                setRemoveFromGroupDialog(null);
              }
            }}>
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加用户到分组 Dialog */}
      <Dialog open={showAddToGroupDialog} onOpenChange={(open) => { if (!open) { setShowAddToGroupDialog(false); setAddToGroupSearch(""); setAddToGroupSelected([]); setAddToGroupDeptFilter(""); } }}>
        <DialogContent className="sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>添加用户到「{groups.find((g) => g.id === selectedGroupId)?.name || ""}」</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="flex items-center gap-2">
              {hasOneid && (
                <DepartmentFilter
                  departments={MOCK_DEPARTMENTS}
                  value={addToGroupDeptFilter}
                  onChange={setAddToGroupDeptFilter}
                />
              )}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索用户 ID..."
                  value={addToGroupSearch}
                  onChange={(e) => setAddToGroupSearch(e.target.value)}
                  className="pl-9 bg-white border-gray-200"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[420px] overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50 bg-white">
              {(() => {
                const currentGroup = groups.find((g) => g.id === selectedGroupId);
                let searchFiltered = members.filter((m) => m.id.toLowerCase().includes(addToGroupSearch.toLowerCase()));
                // OneID 模式：部门筛选
                if (hasOneid && addToGroupDeptFilter) {
                  const findDeptPath = (nodes: DepartmentNode[], id: string): string | undefined => {
                    for (const n of nodes) {
                      if (n.id === id) return n.path;
                      if (n.children) { const f = findDeptPath(n.children, id); if (f) return f; }
                    }
                    return undefined;
                  };
                  const selectedPath = findDeptPath(MOCK_DEPARTMENTS, addToGroupDeptFilter);
                  if (selectedPath) {
                    searchFiltered = searchFiltered.filter((m) => (MOCK_MEMBER_DEPARTMENTS[m.id] || "").startsWith(selectedPath));
                  }
                }
                if (searchFiltered.length === 0) return <p className="text-xs text-gray-400 text-center py-6">没有可添加的用户</p>;
                return searchFiltered.map((m) => {
                  const isAlreadyInGroup = currentGroup?.memberIds.includes(m.id) ?? false;
                  const memberGroupNames = groups.filter((g) => g.memberIds.includes(m.id)).map((g) => g.name);
                  const groupDisplay = memberGroupNames.length === 0 ? "未分组"
                    : memberGroupNames.length <= 2 ? memberGroupNames.join(", ")
                    : `${memberGroupNames.slice(0, 2).join(", ")} +${memberGroupNames.length - 2}`;
                  const row = (
                    <label key={m.id} className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${isAlreadyInGroup ? "opacity-50 cursor-not-allowed bg-gray-100" : "bg-white hover:bg-gray-50 cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={isAlreadyInGroup || addToGroupSelected.includes(m.id)}
                        disabled={isAlreadyInGroup}
                        onChange={() => {
                          if (isAlreadyInGroup) return;
                          setAddToGroupSelected((prev) =>
                            prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                          );
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-900 block truncate">{m.id}</span>
                        {hasOneid && MOCK_MEMBER_DEPARTMENTS[m.id] && (
                          <span className="text-xs text-gray-400 block truncate">{MOCK_MEMBER_DEPARTMENTS[m.id]}</span>
                        )}
                        {groupDisplay && (
                          memberGroupNames.length > 2 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-gray-400 block truncate cursor-default">{groupDisplay}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[300px]">{memberGroupNames.join(", ")}</TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-gray-400 block truncate">{groupDisplay}</span>
                          )
                        )}
                      </div>
                      <Badge variant="outline" className={m.role === "admin" ? "border-blue-200 text-blue-600 bg-blue-50 text-xs shrink-0" : "border-gray-200 text-gray-500 text-xs shrink-0"}>
                        {m.role === "admin" ? "管理员" : "用户"}
                      </Badge>
                    </label>
                  );
                  return isAlreadyInGroup ? (
                    <Tooltip key={m.id}>
                      <TooltipTrigger asChild>{row}</TooltipTrigger>
                      <TooltipContent>已在该分组</TooltipContent>
                    </Tooltip>
                  ) : row;
                });
              })()}
            </div>
            {addToGroupSelected.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">已选择 {addToGroupSelected.length} 名用户</span>
                <button className="text-xs text-blue-500 hover:text-blue-600 hover:underline" onClick={() => setAddToGroupSelected([])}>清除筛选</button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddToGroupDialog(false); setAddToGroupSearch(""); setAddToGroupSelected([]); setAddToGroupDeptFilter(""); }}>取消</Button>
            <Button onClick={handleAddMembersToGroup} disabled={addToGroupSelected.length === 0} style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
