/**
 * MemberManagement - 管控端用户管理页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { SegmentGroup, SegmentOption } from "@/components/ui/segment";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusTag } from "@/components/ui/status-tag";
import { SurfaceInner } from "@/components/ui/Surface";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle, AlertOperationInfoIcon, AlertInfoIcon } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoPopover } from "@/components/ui/info-popover";
import { toast } from "sonner";
import {
  Search, Plus, ChevronDown, Info, Upload, Download,
  Trash2, UserX, UserCheck, MoreHorizontal, Pencil, Key,
  ChevronLeft, ChevronRight, Copy, CheckCircle, AlertCircle, AlertTriangle, CircleAlert,
  Loader2, X, FileText, ExternalLink, RefreshCw, Users, Check,
  FolderOpen, UserMinus, FolderPlus, ChevronUp, Link2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAdminMode } from "@/contexts/AdminModeContext";
import AuthSourceImportDialog, { ConfiguredAuthSource } from "./AuthSourceImportDialog";
// ─── 新：分组视图（多层级 + 节点健康度 + 覆盖状态 + 就地决策，v2.0） ────
import NewGroupView from "./MemberManagement/GroupView";
import { MOCK_USERS as MM_MOCK_USERS, MOCK_USER_OVERRIDES as MM_MOCK_OVERRIDES, MOCK_SYNC_RESULT as MM_MOCK_SYNC_RESULT, MOCK_GROUPS as MM_MOCK_GROUPS, MOCK_MANUAL_GROUPS as MM_MOCK_MANUAL_GROUPS, MOCK_USERS_MANUAL as MM_MOCK_USERS_MANUAL, getPrimaryDeptPath as mmGetPrimaryDeptPath } from "./MemberManagement/mock";
import type { UserOverrideInfo as MMUserOverrideInfo, UserOrg as MMUserOrg, UserGroup as MMUserGroup } from "./MemberManagement/types";

const PAGE_SIZE = 10;

// ─── 分组选择框触发器（自适应截断） ──────────────────────────────────────────
function GroupSelectTrigger({ names, onRemove, onClear, lockedNames = [] }: { names: string[]; onRemove?: (name: string) => void; onClear?: () => void; lockedNames?: string[] }) {
  const [hover, setHover] = React.useState(false);
  const lockedSet = React.useMemo(() => new Set(lockedNames), [lockedNames]);
  if (names.length === 0) {
    return (
      <div className="w-full overflow-hidden">
        <button type="button" className="w-full flex items-center justify-between min-h-9 px-3 rounded-[4px] border border-[#E5E5E5] bg-white text-sm font-normal hover:border-[#1447E6] transition-colors">
          <span className="text-muted-foreground truncate">请选择分组</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button type="button" className="w-full flex items-center flex-wrap gap-1 min-h-9 px-2 py-1.5 rounded-[4px] border border-[#E5E5E5] bg-white text-sm font-normal hover:border-[#1447E6] transition-colors relative pr-7">
        {names.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#f5f5f5] text-[#525252] text-[11px] shrink-0"
          >
            {name}
            {onRemove && !lockedSet.has(name) && (
              <span onClick={(e) => { e.stopPropagation(); onRemove(name); }} className="text-[#A3A3A3] hover:text-[#737373] cursor-pointer">
                <X className="w-3 h-3" />
              </span>
            )}
          </span>
        ))}
        {hover && onClear ? (
          <span
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center cursor-pointer"
          >
            <X className="w-2.5 h-2.5 text-white" />
          </span>
        ) : (
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50 shrink-0" />
        )}
      </button>
    </div>
  );
}

// 生成更多 mock 数据以演示翻页
// vpcType: "auto" = 我们帮用户创建的 VPC（自动分配）；"custom" = 用户指定 VPC
// vpcName: 自动分配时形如 "openclaw/{username}"，自定义时为 null
// hasVpcResources: 自动分配 VPC 下是否有关联云资源（null 表示自定义 VPC 不适用）
const MOCK_MEMBERS_BASE = [
  // 规则：有 Agent 必有关联资源；无 Agent 可能有也可能没有关联资源
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
  { id: "longname-user@very-long-domain-example.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2026-05-01", vpcType: "auto" as const, vpcName: "openclaw/longname", hasVpcResources: true },  // 超长 ID 测试截断
  { id: "product-ops-admin@enterprise-acompany.com", role: "member", status: "active", clawLimit: 5, tokenLimit: 100000, clawCount: 2, joinTime: "2026-05-02", vpcType: "custom" as const, vpcName: null, hasVpcResources: null },             // 超长 ID 测试截断
];

// ─── OneID 模式用户 → 用户信息快速查表（按 userId） ───────────────
const MM_USERS_BY_ID = new Map<string, MMUserOrg>(MM_MOCK_USERS.map((u) => [u.userId, u]));

/** 获取用户所有 oneid-dept 类型部门的完整路径（主部门排首位） */
function getMmUserDeptPaths(userId: string): Array<{ path: string; isPrimary: boolean }> {
  const user = MM_USERS_BY_ID.get(userId);
  if (!user) return [];
  const deptGroupIds = user.groupIds.filter((gid) => {
    const g = MM_MOCK_GROUPS.find((g) => g.id === gid);
    return g?.source === "oneid-dept";
  });
  if (deptGroupIds.length === 0) return [];
  return deptGroupIds
    .map((gid) => ({
      path: mmGetPrimaryDeptPath(gid, MM_MOCK_GROUPS),
      isPrimary: gid === user.primaryGroupId,
    }))
    .sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0));
}

/** 获取用户的「分组」展示项（组织架构 + 自定义分组），用于全部视图的分组列 */
function getMmUserGroupItems(userId: string): Array<{
  id: string;
  path: string;
  kind: "oneid-dept" | "oneid-group";
}> {
  const user = MM_USERS_BY_ID.get(userId);
  if (!user) return [];
  const result: Array<{ id: string; path: string; kind: "oneid-dept" | "oneid-group" }> = [];
  user.groupIds.forEach((gid) => {
    const g = MM_MOCK_GROUPS.find((g) => g.id === gid);
    if (!g) return;
    if (g.source === "oneid-dept") {
      result.push({ id: gid, path: mmGetPrimaryDeptPath(gid, MM_MOCK_GROUPS), kind: "oneid-dept" });
    } else if (g.source === "oneid-group") {
      result.push({ id: gid, path: mmGetPrimaryDeptPath(gid, MM_MOCK_GROUPS), kind: "oneid-group" });
    }
  });
  return result;
}

// ─── 普通模式：MOCK_USERS_MANUAL 扩展为 member 兼容的数据结构 ─────────────
// 补齐 Agent/VPC 相关字段，便于全部视图渲染
const MM_MANUAL_MEMBER_EXTRAS: Record<string, { clawLimit: number; tokenLimit: number; clawCount: number; joinTime: string; vpcType: "auto" | "custom"; vpcName: string | null; hasVpcResources: boolean | null }> = {
  // ── 产品组 ──
  "anna@acompany.com":   { clawLimit: 3, tokenLimit: 50000,  clawCount: 2, joinTime: "2025-06-05", vpcType: "auto",   vpcName: "openclaw/anna",   hasVpcResources: true },
  "bill@acompany.com":   { clawLimit: 5, tokenLimit: 100000, clawCount: 3, joinTime: "2025-06-05", vpcType: "auto",   vpcName: "openclaw/bill",   hasVpcResources: true },
  "cara@acompany.com":   { clawLimit: 3, tokenLimit: 50000,  clawCount: 0, joinTime: "2025-06-10", vpcType: "custom", vpcName: null,              hasVpcResources: null },
  // ── 研发组 ──
  "daniel@acompany.com": { clawLimit: 10, tokenLimit: 200000, clawCount: 4, joinTime: "2025-06-01", vpcType: "auto", vpcName: "openclaw/daniel", hasVpcResources: true },
  "eric@acompany.com":   { clawLimit: 5, tokenLimit: 100000, clawCount: 2, joinTime: "2025-06-01", vpcType: "auto",  vpcName: "openclaw/eric",   hasVpcResources: true },
  // ── 研发-前端 ──
  "fiona@acompany.com":  { clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-06-15", vpcType: "auto",   vpcName: "openclaw/fiona",   hasVpcResources: true },
  "george@acompany.com": { clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-06-20", vpcType: "auto",   vpcName: "openclaw/george",  hasVpcResources: false },
  "helen@acompany.com":  { clawLimit: 3, tokenLimit: 50000, clawCount: 2, joinTime: "2025-07-01", vpcType: "custom", vpcName: null,               hasVpcResources: null },
  "ivan@acompany.com":   { clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-07-05", vpcType: "auto",   vpcName: "openclaw/ivan",    hasVpcResources: true },
  // ── 研发-后端 ──
  "jason@acompany.com":  { clawLimit: 3, tokenLimit: 50000, clawCount: 3, joinTime: "2025-07-10", vpcType: "auto",   vpcName: "openclaw/jason",   hasVpcResources: true },
  "kelly@acompany.com":  { clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-07-15", vpcType: "custom", vpcName: null,               hasVpcResources: null },
  "lucas@acompany.com":  { clawLimit: 5, tokenLimit: 80000, clawCount: 2, joinTime: "2025-07-20", vpcType: "auto",   vpcName: "openclaw/lucas",   hasVpcResources: true },
  // ── 设计组 ──
  "mia@acompany.com":    { clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-08-01", vpcType: "auto",   vpcName: "openclaw/mia",     hasVpcResources: true },
  "nick@acompany.com":   { clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-08-05", vpcType: "auto",   vpcName: "openclaw/nick",    hasVpcResources: false },
  // ── 产品运营与市场推广团队 ──
  "olivia@acompany.com": { clawLimit: 3, tokenLimit: 50000,  clawCount: 1, joinTime: "2025-09-01", vpcType: "auto",   vpcName: "openclaw/olivia", hasVpcResources: true },
  "paul@acompany.com":   { clawLimit: 5, tokenLimit: 100000, clawCount: 2, joinTime: "2025-09-05", vpcType: "auto",   vpcName: "openclaw/paul",   hasVpcResources: true },
  "quinn@acompany.com":  { clawLimit: 3, tokenLimit: 50000,  clawCount: 0, joinTime: "2025-09-10", vpcType: "custom", vpcName: null,               hasVpcResources: null },
  // ── 未分组 ──
  "ryan@acompany.com":   { clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-10-01", vpcType: "auto",   vpcName: "openclaw/ryan",    hasVpcResources: false },
  "susan@acompany.com":  { clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-10-05", vpcType: "auto",   vpcName: "openclaw/susan",   hasVpcResources: true },
};

/** 普通模式下：由 MOCK_USERS_MANUAL + 扩展字段组合得到的 members 基础数据（19 人） */
const MOCK_MEMBERS_MANUAL_BASE = MM_MOCK_USERS_MANUAL.map((u) => {
  const extras = MM_MANUAL_MEMBER_EXTRAS[u.userId] ?? {
    clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-06-01", vpcType: "auto" as const, vpcName: `openclaw/${u.userId.split("@")[0]}`, hasVpcResources: false,
  };
  return {
    id: u.userId,
    role: u.role ?? "member",
    status: u.status ?? "active",
    ...extras,
  };
});

// ─── OneID 模式：MOCK_USERS 扩展为 member 兼容的数据结构 ─────────────
// 其中 alice~oscar 15 人复用 MOCK_MEMBERS_BASE 里已 mock 的 Agent/VPC 字段；
// ceo / tim / peter 3 人是分组视图新增的高管，需要单独 mock Agent/VPC 字段
const MM_ONEID_EXTRA_MEMBERS: Record<string, { clawLimit: number; tokenLimit: number; clawCount: number; joinTime: string; vpcType: "auto" | "custom"; vpcName: string | null; hasVpcResources: boolean | null }> = {
  "ceo@acompany.com":   { clawLimit: 10, tokenLimit: 200000, clawCount: 0, joinTime: "2024-12-01", vpcType: "auto", vpcName: "openclaw/ceo",   hasVpcResources: false },
  "tim@acompany.com":   { clawLimit: 5,  tokenLimit: 100000, clawCount: 2, joinTime: "2024-12-15", vpcType: "auto", vpcName: "openclaw/tim",   hasVpcResources: true },
  "peter@acompany.com": { clawLimit: 5,  tokenLimit: 100000, clawCount: 1, joinTime: "2024-12-15", vpcType: "auto", vpcName: "openclaw/peter", hasVpcResources: true },
};

/** OneID 模式下：由 MOCK_USERS + 扩展字段组合得到的 members 基础数据（18 人） */
const MOCK_MEMBERS_ONEID_BASE = MM_MOCK_USERS.map((u) => {
  // 1) 优先用 MOCK_MEMBERS_BASE 里已 mock 好的字段（alice~oscar 15 人）
  const baseMember = MOCK_MEMBERS_BASE.find((m) => m.id === u.userId);
  if (baseMember) {
    return baseMember;
  }
  // 2) 否则用 MM_ONEID_EXTRA_MEMBERS 里 ceo / tim / peter 的 mock
  const extras = MM_ONEID_EXTRA_MEMBERS[u.userId] ?? {
    clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-01-01", vpcType: "auto" as const, vpcName: `openclaw/${u.userId.split("@")[0]}`, hasVpcResources: false,
  };
  return {
    id: u.userId,
    role: (u.role ?? "member") as "admin" | "member",
    status: (u.status ?? "active") as "active" | "disabled",
    ...extras,
  };
}) as typeof MOCK_MEMBERS_BASE;

/** 普通模式下：构造分组完整路径（如 "研发组 / 研发-前端"） */
function getManualGroupPath(groupId: string): string {
  const map = new Map(MM_MOCK_MANUAL_GROUPS.map((g) => [g.id, g]));
  const chain: string[] = [];
  let cur = map.get(groupId);
  while (cur) {
    chain.unshift(cur.name);
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return chain.length > 0 ? chain.join(" / ") : "—";
}

/** 普通模式下：获取某用户的分组完整路径列表 */
function getManualUserGroupPaths(userId: string): Array<{ id: string; path: string }> {
  const user = MM_MOCK_USERS_MANUAL.find((u) => u.userId === userId);
  if (!user) return [];
  return user.groupIds.map((gid) => ({ id: gid, path: getManualGroupPath(gid) }));
}

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
    name: "A公司",
    path: "A公司",
    children: [
      {
        id: "dept-tech",
        name: "技术部",
        path: "A公司/技术部",
        children: [
          { id: "dept-fe", name: "前端组", path: "A公司/技术部/前端组" },
          { id: "dept-be", name: "后端组", path: "A公司/技术部/后端组" },
          { id: "dept-ai", name: "AI 组", path: "A公司/技术部/AI 组" },
        ],
      },
      {
        id: "dept-product",
        name: "产品部",
        path: "A公司/产品部",
        children: [
          { id: "dept-pm", name: "产品策划", path: "A公司/产品部/产品策划" },
          { id: "dept-design", name: "设计组", path: "A公司/产品部/设计组" },
        ],
      },
      { id: "dept-hr", name: "人力资源", path: "A公司/人力资源" },
      { id: "dept-finance", name: "财务部", path: "A公司/财务部" },
    ],
  },
];

/** 用户归属 mock 映射 */
const MOCK_MEMBER_DEPARTMENTS: Record<string, string> = {
  "alice@acompany.com": "A公司/技术部/前端组",
  "bob@acompany.com": "A公司/技术部/后端组",
  "carol@acompany.com": "A公司/技术部/AI 组",
  "david@acompany.com": "A公司/产品部/产品策划",
  "eve@acompany.com": "A公司/产品部/设计组",
  "frank@acompany.com": "A公司/技术部/前端组",
  "grace@acompany.com": "A公司/技术部/后端组",
  "henry@acompany.com": "A公司/人力资源",
  "iris@acompany.com": "A公司/技术部/AI 组",
  "jack@acompany.com": "A公司/财务部",
  "kate@acompany.com": "A公司/技术部/前端组",
  "leo@acompany.com": "A公司/产品部/产品策划",
  "mike@acompany.com": "A公司/技术部/后端组",
  "nina@acompany.com": "A公司/产品部/设计组",
  "oscar@acompany.com": "A公司/财务部",
};

const LAST_CLAW_LIMIT = 3;
const LAST_TOKEN_LIMIT = 50000;

// ─── 平台策略：预设策略默认值（可被管理员修改） ─────────────────────────────────
const PRESET_POLICY_CLAW_LIMIT = 3;
const PRESET_POLICY_TOKEN_LIMIT = 50000;

// ─── 平台策略：按分组配额（模拟平台策略页配置的结果） ────────────────────────────
/** 普通模式分组配额 */
const GROUP_POLICY_QUOTAS: Record<string, { clawLimit: number; tokenLimit: number }> = {
  "mgrp-product": { clawLimit: 3, tokenLimit: 50000 },
  "mgrp-rd": { clawLimit: 5, tokenLimit: 100000 },
  "mgrp-rd-fe": { clawLimit: 5, tokenLimit: 100000 },
  "mgrp-rd-be": { clawLimit: 5, tokenLimit: 100000 },
  "mgrp-design": { clawLimit: 3, tokenLimit: 50000 },
  "mgrp-ops": { clawLimit: 3, tokenLimit: 50000 },
};
/** OneID 模式分组配额（按部门/用户组） */
const ONEID_GROUP_POLICY_QUOTAS: Record<string, { clawLimit: number; tokenLimit: number }> = {
  "dept-tech": { clawLimit: 5, tokenLimit: 100000 },
  "dept-fe": { clawLimit: 5, tokenLimit: 100000 },
  "dept-be": { clawLimit: 5, tokenLimit: 100000 },
  "dept-ai": { clawLimit: 10, tokenLimit: 200000 },
  "dept-product": { clawLimit: 3, tokenLimit: 80000 },
  "dept-pm": { clawLimit: 3, tokenLimit: 80000 },
  "dept-design": { clawLimit: 3, tokenLimit: 50000 },
  "dept-operation": { clawLimit: 3, tokenLimit: 50000 },
  "og-frontend": { clawLimit: 5, tokenLimit: 100000 },
  "og-backend": { clawLimit: 5, tokenLimit: 100000 },
  "og-ai-core": { clawLimit: 10, tokenLimit: 200000 },
};

// ─── 用户在分组中创建的 Agent 实例（mock） ────────────────────────────────────
/** 格式：userId -> groupId -> 实例列表 */
const MOCK_USER_GROUP_AGENTS: Record<string, Record<string, Array<{ id: string; name: string }>>> = {
  // 普通模式：fiona 在研发-前端有 1 个实例
  "fiona@acompany.com": {
    "mgrp-rd-fe": [
      { id: "claw-fiona-1", name: "Fiona 的前端助手" },
    ],
  },
  // 普通模式：lucas 在研发-后端有 2 个实例（lucas 兼任前端+后端）
  "lucas@acompany.com": {
    "mgrp-rd-be": [
      { id: "claw-lucas-1", name: "Lucas 的后端服务" },
      { id: "claw-lucas-2", name: "Lucas 的 API 测试" },
    ],
  },
  // OneID 模式：alice 在技术部有实例
  "alice@acompany.com": {
    "dept-tech": [
      { id: "claw-alice-1", name: "Alice 的代码助手" },
      { id: "claw-alice-2", name: "Alice 的文档生成器" },
      { id: "claw-alice-3", name: "Alice 的测试工具" },
    ],
  },
  // OneID 模式：bob 在前端组有实例
  "bob@acompany.com": {
    "dept-fe": [
      { id: "claw-bob-1", name: "Bob 的组件库助手" },
    ],
  },
};

// ─── 分组数据模型 ─────────────────────────────────────────────────────────────
export interface MemberGroup {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: string;
}

export const MOCK_GROUPS_INIT: MemberGroup[] = [
  { id: "grp-1", name: "产品组", memberIds: ["carol@acompany.com", "david@acompany.com", "eve@acompany.com", "alice@acompany.com"], createdAt: "2025-06-01" },
  { id: "grp-2", name: "研发组", memberIds: ["bob@acompany.com", "frank@acompany.com", "grace@acompany.com", "kate@acompany.com"], createdAt: "2025-06-05" },
  { id: "grp-3", name: "设计组", memberIds: ["iris@acompany.com", "jack@acompany.com"], createdAt: "2025-07-10" },
  { id: "grp-4", name: "产品运营与市场推广团队", memberIds: ["leo@acompany.com", "nina@acompany.com"], createdAt: "2025-08-15" },
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
        <SelectTrigger className="bg-white w-full">
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
          className="bg-white"
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
  userGroups = [],
  onOpenCreateGroupDialog,
  groupPopoverReopenKey = 0,
}: {
  values: typeof emptyNewMember;
  onChange: (v: typeof emptyNewMember) => void;
  existingMemberIds?: string[];
  groups?: MemberGroup[];
  userGroups?: MMUserGroup[];
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

  // 使用 userGroups 渲染（有层级和 source），fallback 到 groups
  const hasUserGroups = userGroups.length > 0;
  const ugMap = React.useMemo(() => new Map(userGroups.map((g) => [g.id, g])), [userGroups]);
  const getUgPath = (gId: string): string => {
    const chain: string[] = [];
    let node = ugMap.get(gId);
    while (node) { chain.unshift(node.name); node = node.parentId ? ugMap.get(node.parentId) : undefined; }
    return chain.join(" / ");
  };
  // OneID 模式：组织架构 + 用户组；普通模式：全部 manual 分组
  const deptGroups = React.useMemo(() => userGroups.filter((g) => g.source === "oneid-dept"), [userGroups]);
  const ogGroups = React.useMemo(() => userGroups.filter((g) => g.source === "oneid-group"), [userGroups]);
  const manualUGroups = React.useMemo(() => userGroups.filter((g) => g.source === "manual"), [userGroups]);
  // 构建树
  const buildTree = (list: typeof userGroups) => {
    const map = new Map(list.map((g) => [g.id, { ...g, children: [] as typeof list }]));
    const roots: Array<typeof list[0] & { children: typeof list }> = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };
  const deptTree = React.useMemo(() => buildTree(deptGroups), [deptGroups]);
  const ogTree = React.useMemo(() => buildTree(ogGroups), [ogGroups]);
  const manualTree = React.useMemo(() => buildTree(manualUGroups), [manualUGroups]);
  // 展开状态
  const [treeExpanded, setTreeExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => setTreeExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  // 搜索
  const matchSearch = (g: { id: string; name: string }) => {
    if (!groupSearchStr.trim()) return true;
    const q = groupSearchStr.toLowerCase();
    return g.name.toLowerCase().includes(q) || getUgPath(g.id).toLowerCase().includes(q);
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupSearchStr.toLowerCase())
  );

  const toggleGroup = (gId: string) => {
    const next = values.groupIds.includes(gId) ? values.groupIds.filter((x) => x !== gId) : [...values.groupIds, gId];
    onChange({ ...values, groupIds: next });
  };

  // 获取已选分组的显示名称
  const selectedNames = React.useMemo(() => {
    if (hasUserGroups) {
      return values.groupIds.map((id) => getUgPath(id)).filter(Boolean);
    }
    return groups.filter((g) => values.groupIds.includes(g.id)).map((g) => g.name);
  }, [values.groupIds, hasUserGroups, groups, userGroups]);

  // 树形节点渲染
  const renderTreeNode = (node: any, depth: number): React.ReactNode => {
    if (!matchSearch(node) && !(node.children?.length > 0 && node.children.some((c: any) => matchSearch(c)))) return null;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = treeExpanded.has(node.id);
    const isSelected = values.groupIds.includes(node.id);
    return (
      <div key={node.id}>
        <div
          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${isSelected ? "hover:bg-[#fafafa] text-[#355EF1]" : "hover:bg-[#fafafa] text-[#525252]"}`}
          style={{ paddingLeft: 8 + depth * 16 }}
          onClick={() => toggleGroup(node.id)}
        >
          {hasChildren ? (
            <span
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              className="w-4 h-4 flex items-center justify-center text-[#A3A3A3] hover:text-[#737373] shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"}`}>
            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
          </span>
          <span className="truncate">{node.name}</span>
        </div>
        {hasChildren && isExpanded && node.children.map((c: any) => renderTreeNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <div className="py-2 space-y-6">
      <div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              用户 ID <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer inline-flex">
                    <Info className="w-3.5 h-3.5 text-[#A3A3A3]" />
                  </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>填写企业用户的唯一 ID，例如企业邮箱或企业用户唯一名称，作为企业用户登录用户端的账号</TooltipContent>
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
              className={`bg-white ${idError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
            />
            {idError && <p className="text-xs text-red-500 font-medium">{idError}</p>}
          </div>

          <div className="space-y-2">
            <Label>用户角色 <span className="text-red-500">*</span></Label>
            <Select value={values.role} onValueChange={(v) => onChange({ ...values, role: v })}>
              <SelectTrigger className="bg-white w-full">
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
                  <GroupSelectTrigger
                    names={selectedNames}
                    onRemove={(name) => {
                      const id = values.groupIds.find((gid) => selectedNames.indexOf(name) === values.groupIds.indexOf(gid));
                      if (id) onChange({ ...values, groupIds: values.groupIds.filter((x) => x !== id) });
                    }}
                    onClear={() => onChange({ ...values, groupIds: [] })}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popper-anchor-width)", minWidth: 280 }}>
                <div className="p-2 border-b border-[#e5e5e5]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                    <input className="w-full h-7 pl-8 pr-2 text-xs border border-[#e5e5e5] rounded-[4px] outline-none focus:border-blue-300 bg-white placeholder:text-[#A3A3A3]" placeholder="搜索分组..." value={groupSearchStr} onChange={(e) => setGroupSearchStr(e.target.value)} />
                  </div>
                </div>
                <div ref={groupListRef} className="max-h-[280px] overflow-y-auto py-1 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                  {hasUserGroups ? (
                    <>
                      {/* OneID 模式：组织架构 + 用户组 */}
                      {deptTree.length > 0 && (
                        <div className="mb-1">
                          <div className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-[#A3A3A3] uppercase tracking-wide">部门</div>
                          {deptTree.map((n) => renderTreeNode(n, 0))}
                        </div>
                      )}
                      {ogTree.length > 0 && (
                        <div className="mb-1">
                          <div className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-[#A3A3A3] uppercase tracking-wide">自定义分组</div>
                          {ogTree.map((n) => renderTreeNode(n, 0))}
                        </div>
                      )}
                      {/* 普通模式：直接树形，无小标题 */}
                      {deptTree.length === 0 && ogTree.length === 0 && manualTree.length > 0 && (
                        <div className="mb-1">
                          {manualTree.map((n) => renderTreeNode(n, 0))}
                        </div>
                      )}
                      {deptTree.length === 0 && ogTree.length === 0 && manualTree.length === 0 && (
                        <p className="text-xs text-[#A3A3A3] text-center py-3">{groupSearchStr.trim() ? "未找到匹配的分组" : "暂无分组"}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {filteredGroups.map((g) => (
                        <button key={g.id} className={`w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-[#fafafa] transition-colors ${values.groupIds.includes(g.id) ? "text-[#355EF1]" : "text-[#525252]"}`} onClick={() => toggleGroup(g.id)}>
                          <span className="truncate">{g.name}</span>
                          {values.groupIds.includes(g.id) && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                        </button>
                      ))}
                      {filteredGroups.length === 0 && (
                        <p className="text-xs text-[#A3A3A3] text-center py-3">{groupSearchStr.trim() ? "未找到匹配的分组" : "暂无分组"}</p>
                      )}
                    </>
                  )}
                </div>

              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              信息发送
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer inline-flex">
                    <Info className="w-3.5 h-3.5 text-[#A3A3A3]" />
                  </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>信息发送会产生额外的短信/邮件费用，合并到腾讯云账单计费</TooltipContent>
              </Tooltip>
            </Label>
            <Input type="email" placeholder="输入用户接收账号密码的邮箱地址" value={values.notificationEmail} onChange={(e) => onChange({ ...values, notificationEmail: e.target.value })} className="bg-white" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-[#0A0A0A] mb-3">用户配额</p>
        {values.groupIds.length > 0 ? (
          <div className="space-y-3">
            <SurfaceInner className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>分组</TableHead>
                    <TableHead>Agent 上限</TableHead>
                    <TableHead>每日 Tokens 上限</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {values.groupIds.map((gId) => {
                    const quotaMap = hasUserGroups && userGroups.some((g) => g.source === 'oneid-dept' || g.source === 'oneid-group') ? ONEID_GROUP_POLICY_QUOTAS : GROUP_POLICY_QUOTAS;
                    const ugName = hasUserGroups ? getUgPath(gId) : gId;
                    const quota = quotaMap[gId] ?? { clawLimit: PRESET_POLICY_CLAW_LIMIT, tokenLimit: PRESET_POLICY_TOKEN_LIMIT };
                    return (
                      <TableRow key={gId} className="hover:bg-transparent">
                        <TableCell>{ugName}</TableCell>
                        <TableCell className="tabular-nums">{quota.clawLimit}</TableCell>
                        <TableCell className="tabular-nums">{quota.tokenLimit.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </SurfaceInner>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              该用户已加入分组，配额由平台策略统一管理。如需修改请前往<a href="/admin/platform-policy" className="text-blue-500 hover:text-[#355EF1] hover:underline">平台策略</a>页进行配置。
            </p>
          </div>
        ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Agent 数量上限 <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer inline-flex">
                    <Info className="w-3.5 h-3.5 text-[#A3A3A3]" />
                  </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>单个企业用户最多可以创建的 Agent 数量</TooltipContent>
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
              className="bg-white" placeholder="请输入数量"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              每日 Tokens 数量上限 <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer inline-flex">
                    <Info className="w-3.5 h-3.5 text-[#A3A3A3]" />
                  </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>单个企业用户每日最多可消耗的 Tokens 数量</TooltipContent>
              </Tooltip>
            </Label>
            <TokenLimitInput value={values.tokenLimit} onChange={(v) => onChange({ ...values, tokenLimit: v })} />
          </div>
        </div>
        )}
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
  userGroups = [],
  onOpenCreateGroupDialog,
  groupPopoverReopenKey = 0,
}: {
  values: typeof emptyEditForm;
  onChange: (v: typeof emptyEditForm) => void;
  isInitialAdmin?: boolean;
  groups?: MemberGroup[];
  userGroups?: MMUserGroup[];
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


  // 使用 userGroups 渲染（有层级和 source），fallback 到 groups
  const hasUserGroups = userGroups.length > 0;
  const ugMap = React.useMemo(() => new Map(userGroups.map((g) => [g.id, g])), [userGroups]);
  const getUgPath = (gId: string): string => {
    const chain: string[] = [];
    let node = ugMap.get(gId);
    while (node) { chain.unshift(node.name); node = node.parentId ? ugMap.get(node.parentId) : undefined; }
    return chain.join(" / ");
  };
  const deptGroups = React.useMemo(() => userGroups.filter((g) => g.source === "oneid-dept"), [userGroups]);
  const ogGroups = React.useMemo(() => userGroups.filter((g) => g.source === "oneid-group"), [userGroups]);
  const manualUGroups = React.useMemo(() => userGroups.filter((g) => g.source === "manual"), [userGroups]);
  const buildTree = (list: typeof userGroups) => {
    const map = new Map(list.map((g) => [g.id, { ...g, children: [] as typeof list }]));
    const roots: Array<typeof list[0] & { children: typeof list }> = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };
  const deptTree = React.useMemo(() => buildTree(deptGroups), [deptGroups]);
  const ogTree = React.useMemo(() => buildTree(ogGroups), [ogGroups]);
  const manualTree = React.useMemo(() => buildTree(manualUGroups), [manualUGroups]);
  const [treeExpanded, setTreeExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => setTreeExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const matchSearch = (g: { id: string; name: string }) => {
    if (!groupSearchStr.trim()) return true;
    const q = groupSearchStr.toLowerCase();
    return g.name.toLowerCase().includes(q) || getUgPath(g.id).toLowerCase().includes(q);
  };
  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(groupSearchStr.toLowerCase()));
  const toggleGroup = (gId: string) => {
    const next = values.groupIds.includes(gId) ? values.groupIds.filter((x) => x !== gId) : [...values.groupIds, gId];
    onChange({ ...values, groupIds: next });
  };

  const selectedNames = React.useMemo(() => {
    if (hasUserGroups) {
      return values.groupIds.map((id) => getUgPath(id)).filter(Boolean);
    }
    return groups.filter((g) => values.groupIds.includes(g.id)).map((g) => g.name);
  }, [values.groupIds, hasUserGroups, groups, userGroups]);

  const renderTreeNode = (node: any, depth: number): React.ReactNode => {
    if (!matchSearch(node) && !(node.children?.length > 0 && node.children.some((c: any) => matchSearch(c)))) return null;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = treeExpanded.has(node.id);
    const isSelected = values.groupIds.includes(node.id);
    return (
      <div key={node.id}>
        <div
          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${isSelected ? "hover:bg-[#fafafa] text-[#355EF1]" : "hover:bg-[#fafafa] text-[#525252]"}`}
          style={{ paddingLeft: 8 + depth * 16 }}
          onClick={() => toggleGroup(node.id)}
        >
          {hasChildren ? (
            <span
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              className="w-4 h-4 flex items-center justify-center text-[#A3A3A3] hover:text-[#737373] shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"}`}>
            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
          </span>
          <span className="truncate">{node.name}</span>
        </div>
        {hasChildren && isExpanded && node.children.map((c: any) => renderTreeNode(c, depth + 1))}
      </div>
    );
  };
  return (
    <div className="py-2 space-y-6">
      <div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              用户 ID
              <InfoPopover content="用户 ID 为唯一标识，不可修改" />
            </Label>
            <Input
              value={values.id}
              disabled
              className="bg-[#f5f5f5] cursor-not-allowed opacity-60 disabled:bg-[#f5f5f5] disabled:text-[#A3A3A3] disabled:cursor-not-allowed disabled:opacity-60 disabled:pointer-events-auto"
            />
          </div>

          <div className="space-y-2">
            <Label>用户角色</Label>
            <Select value={values.role} onValueChange={(v) => !isInitialAdmin && onChange({ ...values, role: v })} disabled={isInitialAdmin}>
              <SelectTrigger className={`w-full ${isInitialAdmin ? "bg-[#f5f5f5] cursor-not-allowed opacity-60" : "bg-white"}`}>
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
                  <GroupSelectTrigger
                    names={selectedNames}
                    onRemove={(name) => {
                      const id = values.groupIds.find((gid) => selectedNames.indexOf(name) === values.groupIds.indexOf(gid));
                      if (id) onChange({ ...values, groupIds: values.groupIds.filter((x) => x !== id) });
                    }}
                    onClear={() => onChange({ ...values, groupIds: [] })}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popper-anchor-width)", minWidth: 280 }}>
                <div className="p-2 border-b border-[#e5e5e5]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                    <input className="w-full h-7 pl-8 pr-2 text-xs border border-[#e5e5e5] rounded-[4px] outline-none focus:border-blue-300 bg-white placeholder:text-[#A3A3A3]" placeholder="搜索分组..." value={groupSearchStr} onChange={(e) => setGroupSearchStr(e.target.value)} />
                  </div>
                </div>
                <div ref={groupListRef} className="max-h-[280px] overflow-y-auto py-1 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                  {hasUserGroups ? (
                    <>
                      {/* OneID 模式：组织架构 + 用户组 */}
                      {deptTree.length > 0 && (
                        <div className="mb-1">
                          <div className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-[#A3A3A3] uppercase tracking-wide">部门</div>
                          {deptTree.map((n) => renderTreeNode(n, 0))}
                        </div>
                      )}
                      {ogTree.length > 0 && (
                        <div className="mb-1">
                          <div className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-[#A3A3A3] uppercase tracking-wide">自定义分组</div>
                          {ogTree.map((n) => renderTreeNode(n, 0))}
                        </div>
                      )}
                      {/* 普通模式：直接树形，无小标题 */}
                      {deptTree.length === 0 && ogTree.length === 0 && manualTree.length > 0 && (
                        <div className="mb-1">
                          {manualTree.map((n) => renderTreeNode(n, 0))}
                        </div>
                      )}
                      {deptTree.length === 0 && ogTree.length === 0 && manualTree.length === 0 && (
                        <p className="text-xs text-[#A3A3A3] text-center py-3">{groupSearchStr.trim() ? "未找到匹配的分组" : "暂无分组"}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {filteredGroups.map((g) => (
                        <button key={g.id} className={`w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-[#fafafa] transition-colors ${values.groupIds.includes(g.id) ? "text-[#355EF1]" : "text-[#525252]"}`} onClick={() => toggleGroup(g.id)}>
                          <span className="truncate">{g.name}</span>
                          {values.groupIds.includes(g.id) && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                        </button>
                      ))}
                      {filteredGroups.length === 0 && (
                        <p className="text-xs text-[#A3A3A3] text-center py-3">{groupSearchStr.trim() ? "未找到匹配的分组" : "暂无分组"}</p>
                      )}
                    </>
                  )}
                </div>

              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 第二大块：用户配额 */}
      <div>
        <p className="text-sm font-medium text-[#0A0A0A] mb-3">用户配额</p>
        {values.groupIds.length > 0 ? (
          <div className="space-y-3">
            <SurfaceInner className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>分组</TableHead>
                    <TableHead>Agent 上限</TableHead>
                    <TableHead>每日 Tokens 上限</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {values.groupIds.map((gId) => {
                    const quotaMap = hasUserGroups && userGroups.some((g) => g.source === 'oneid-dept' || g.source === 'oneid-group') ? ONEID_GROUP_POLICY_QUOTAS : GROUP_POLICY_QUOTAS;
                    const ugName = hasUserGroups ? getUgPath(gId) : gId;
                    const quota = quotaMap[gId] ?? { clawLimit: PRESET_POLICY_CLAW_LIMIT, tokenLimit: PRESET_POLICY_TOKEN_LIMIT };
                    return (
                      <TableRow key={gId} className="hover:bg-transparent">
                        <TableCell>{ugName}</TableCell>
                        <TableCell className="tabular-nums">{quota.clawLimit}</TableCell>
                        <TableCell className="tabular-nums">{quota.tokenLimit.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </SurfaceInner>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              该用户已加入分组，配额由平台策略统一管理。如需修改请前往<a href="/admin/platform-policy" className="text-blue-500 hover:text-[#355EF1] hover:underline">平台策略</a>页进行配置。
            </p>
          </div>
        ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Agent 数量上限
              <InfoPopover content="单个企业用户最多可以创建的 Agent 数量" />
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
              className="bg-white"
              placeholder="请输入数量"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              每日 Tokens 数量上限
              <InfoPopover content="单个企业用户每日最多可消耗的 Tokens 数量" />
            </Label>
            <TokenLimitInput
              value={values.tokenLimit}
              onChange={(v) => onChange({ ...values, tokenLimit: v })}
            />
          </div>
        </div>
        )}
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
  userGroups = [],
  onOpenCreateGroupDialog,
  groupPopoverReopenKey = 0,
}: {
  values: typeof emptyOneidEditForm;
  onChange: (v: typeof emptyOneidEditForm) => void;
  groups?: MemberGroup[];
  userGroups?: MMUserGroup[];
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

  // userGroups 树形逻辑
  const hasUserGroups = userGroups.length > 0;
  const ugMap = React.useMemo(() => new Map(userGroups.map((g) => [g.id, g])), [userGroups]);
  const getUgPath = (gId: string): string => {
    const chain: string[] = [];
    let node = ugMap.get(gId);
    while (node) { chain.unshift(node.name); node = node.parentId ? ugMap.get(node.parentId) : undefined; }
    return chain.join(" / ");
  };
  const deptGroups = React.useMemo(() => userGroups.filter((g) => g.source === "oneid-dept"), [userGroups]);
  const ogGroups = React.useMemo(() => userGroups.filter((g) => g.source === "oneid-group"), [userGroups]);
  const buildTree = (list: typeof userGroups) => {
    const map = new Map(list.map((g) => [g.id, { ...g, children: [] as typeof list }]));
    const roots: Array<typeof list[0] & { children: typeof list }> = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };
  const deptTree = React.useMemo(() => buildTree(deptGroups), [deptGroups]);
  const ogTree = React.useMemo(() => buildTree(ogGroups), [ogGroups]);
  const [treeExpanded, setTreeExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => setTreeExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const matchSearch = (g: { id: string; name: string }) => {
    if (!groupSearchStr.trim()) return true;
    const q = groupSearchStr.toLowerCase();
    return g.name.toLowerCase().includes(q) || getUgPath(g.id).toLowerCase().includes(q);
  };

  // dept 分组 id 集合（不可编辑）
  const deptGroupIds = React.useMemo(() => new Set(deptGroups.map((g) => g.id)), [deptGroups]);
  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(groupSearchStr.toLowerCase()));
  const toggleGroup = (gId: string) => {
    if (deptGroupIds.has(gId)) return; // dept 分组不可操作
    const next = values.groupIds.includes(gId) ? values.groupIds.filter((x) => x !== gId) : [...values.groupIds, gId];
    onChange({ ...values, groupIds: next });
  };

  const selectedNames = React.useMemo(() => {
    if (hasUserGroups) {
      return values.groupIds.map((id) => getUgPath(id)).filter(Boolean);
    }
    return groups.filter((g) => values.groupIds.includes(g.id)).map((g) => g.name);
  }, [values.groupIds, hasUserGroups, groups, userGroups]);

  const renderTreeNode = (node: any, depth: number): React.ReactNode => {
    if (!matchSearch(node) && !(node.children?.length > 0 && node.children.some((c: any) => matchSearch(c)))) return null;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = treeExpanded.has(node.id);
    const isSelected = values.groupIds.includes(node.id);
    const isDept = deptGroupIds.has(node.id);
    const row = (
      <div key={node.id}>
        <div
          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${isDept ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${isSelected ? "hover:bg-[#fafafa] text-[#355EF1]" : "hover:bg-[#fafafa] text-[#525252]"}`}
          style={{ paddingLeft: 8 + depth * 16 }}
          onClick={() => !isDept && toggleGroup(node.id)}
        >
          {hasChildren ? (
            <span
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              className="w-4 h-4 flex items-center justify-center text-[#A3A3A3] hover:text-[#737373] shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"}`}>
            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
          </span>
          <span className="truncate">{node.name}</span>
        </div>
        {hasChildren && isExpanded && node.children.map((c: any) => renderTreeNode(c, depth + 1))}
      </div>
    );
    if (isDept) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{row}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs max-w-[220px]">同步部门的分组不可编辑，如需编辑请前往腾讯统一身份管理平台</TooltipContent>
        </Tooltip>
      );
    }
    return row;
  };

  return (
    <div className="py-2 space-y-6">
      <div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              用户 ID
              <InfoPopover content="用户 ID 由统一身份平台管理" />
            </Label>
            <Input
              value={values.id}
              disabled
              className="bg-[#f5f5f5] cursor-not-allowed opacity-60 disabled:bg-[#f5f5f5] disabled:text-[#A3A3A3] disabled:cursor-not-allowed disabled:opacity-60 disabled:pointer-events-auto"
            />
          </div>
          <div className="space-y-2">
            <Label>用户角色</Label>
            <Select value={values.role} disabled>
              <SelectTrigger className="bg-[#f5f5f5] cursor-not-allowed opacity-60 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>部门</Label>
            <Input
              value={values.department || "—"}
              disabled
              className="bg-[#f5f5f5] cursor-not-allowed opacity-60 disabled:bg-[#f5f5f5] disabled:text-[#A3A3A3] disabled:cursor-not-allowed disabled:opacity-60 disabled:pointer-events-auto"
            />
          </div>

          {/* 用户分组 */}
          <div className="space-y-2">
            <Label>用户分组</Label>
            <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
              <PopoverTrigger asChild>
                <div>
                  <GroupSelectTrigger
                    names={selectedNames}
                    lockedNames={values.groupIds.filter((gid) => deptGroupIds.has(gid)).map((gid) => getUgPath(gid))}
                    onRemove={(name) => {
                      const id = values.groupIds.find((gid) => selectedNames.indexOf(name) === values.groupIds.indexOf(gid));
                      if (id && !deptGroupIds.has(id)) onChange({ ...values, groupIds: values.groupIds.filter((x) => x !== id) });
                    }}
                    onClear={() => onChange({ ...values, groupIds: values.groupIds.filter((gid) => deptGroupIds.has(gid)) })}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popper-anchor-width)", minWidth: 280 }}>
                <div className="p-2 border-b border-[#e5e5e5]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                    <input className="w-full h-7 pl-8 pr-2 text-xs border border-[#e5e5e5] rounded-[4px] outline-none focus:border-blue-300 bg-white placeholder:text-[#A3A3A3]" placeholder="搜索分组..." value={groupSearchStr} onChange={(e) => setGroupSearchStr(e.target.value)} />
                  </div>
                </div>
                <div ref={groupListRef} className="max-h-[280px] overflow-y-auto py-1 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                  {hasUserGroups ? (
                    <>
                      {deptTree.length > 0 && (
                        <div className="mb-1">
                          <div className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-[#A3A3A3] uppercase tracking-wide">部门</div>
                          {deptTree.map((n) => renderTreeNode(n, 0))}
                        </div>
                      )}
                      {ogTree.length > 0 && (
                        <div className="mb-1">
                          <div className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-[#A3A3A3] uppercase tracking-wide">自定义分组</div>
                          {ogTree.map((n) => renderTreeNode(n, 0))}
                        </div>
                      )}
                      {deptTree.length === 0 && ogTree.length === 0 && (
                        <p className="text-xs text-[#A3A3A3] text-center py-3">{groupSearchStr.trim() ? "未找到匹配的分组" : "暂无分组"}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {filteredGroups.map((g) => (
                        <button key={g.id} className={`w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-[#fafafa] transition-colors ${values.groupIds.includes(g.id) ? "text-[#355EF1]" : "text-[#525252]"}`} onClick={() => toggleGroup(g.id)}>
                          <span className="truncate">{g.name}</span>
                          {values.groupIds.includes(g.id) && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                        </button>
                      ))}
                      {filteredGroups.length === 0 && (
                        <p className="text-xs text-[#A3A3A3] text-center py-3">{groupSearchStr.trim() ? "未找到匹配的分组" : "暂无分组"}</p>
                      )}
                    </>
                  )}
                </div>

              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 用户配额（可编辑） */}
      <div>
        <p className="text-sm font-medium text-[#0A0A0A] mb-3">用户配额</p>
        {values.groupIds.length > 0 ? (
          <div className="space-y-3">
            <SurfaceInner className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>分组</TableHead>
                    <TableHead>Agent 上限</TableHead>
                    <TableHead>每日 Tokens 上限</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {values.groupIds.map((gId) => {
                    const quotaMap = ONEID_GROUP_POLICY_QUOTAS;
                    const ugName = hasUserGroups ? getUgPath(gId) : gId;
                    const quota = quotaMap[gId] ?? { clawLimit: PRESET_POLICY_CLAW_LIMIT, tokenLimit: PRESET_POLICY_TOKEN_LIMIT };
                    return (
                      <TableRow key={gId} className="hover:bg-transparent">
                        <TableCell>{ugName}</TableCell>
                        <TableCell className="tabular-nums">{quota.clawLimit}</TableCell>
                        <TableCell className="tabular-nums">{quota.tokenLimit.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </SurfaceInner>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              该用户已加入分组，配额由平台策略统一管理。如需修改请前往<a href="/admin/platform-policy" className="text-blue-500 hover:text-[#355EF1] hover:underline">平台策略</a>页进行配置。
            </p>
          </div>
        ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Agent 数量上限
              <InfoPopover content="单个企业用户最多可以创建的 Agent 数量" />
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
              className="bg-white"
              placeholder="请输入数量"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              每日 Tokens 数量上限
              <InfoPopover content="单个企业用户每日最多可消耗的 Tokens 数量" />
            </Label>
            <TokenLimitInput
              value={values.tokenLimit}
              onChange={(v) => onChange({ ...values, tokenLimit: v })}
            />
          </div>
        </div>
        )}
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
        className={`flex items-center gap-1 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors ${isSelected ? "bg-[#eff4ff] text-[#355EF1]" : "text-[#525252] hover:bg-[#f5f5f5]"
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
              <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </span>
        )}
        <span className={`text-sm truncate flex-1 ${isSelected ? "text-[#355EF1] font-medium" : ""}`}>{node.name}</span>
        {isSelected && <Check className="w-4 h-4 ml-auto text-[#355EF1] flex-shrink-0" />}
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
          className={`w-[160px] justify-between bg-white text-sm font-normal ${triggerNode ? "text-foreground" : "text-muted-foreground"}`}
        >
          <span className="truncate">{triggerNode?.name || "全部部门"}</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-1 shrink-0 text-[#737373] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="max-h-[280px] overflow-y-auto p-2">
          <div
            className={`flex items-center gap-2 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors ${tempValue === "" ? "bg-[#eff4ff]" : "hover:bg-[#f5f5f5]"
              }`}
            onClick={() => setTempValue("")}
          >
            <span className={`text-sm flex-1 ${tempValue === "" ? "text-[#355EF1] font-medium" : "text-[#525252]"}`}>全部部门</span>
            {tempValue === "" && <Check className="w-4 h-4 text-[#355EF1] flex-shrink-0" />}
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
        <div className="border-t border-[#e5e5e5] px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-1 text-xs overflow-hidden">
            {tempValue === "" ? (
              <span className="text-[#355EF1] font-medium truncate">全部部门</span>
            ) : pathParts.length > 0 ? (
              pathParts.map((part, idx) => (
                <span key={idx} className="flex items-center gap-1 shrink-0">
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-[#A3A3A3] flex-shrink-0" />}
                  <span className={idx === pathParts.length - 1 ? "text-[#355EF1] font-medium truncate" : "text-[#737373] truncate"}>
                    {part}
                  </span>
                </span>
              ))
            ) : (
              <span className="text-[#A3A3A3] truncate">未选择</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" className="text-xs text-[#737373] h-7 px-2" onClick={handleCancel}>取消</Button>
            <Button size="sm" className="text-xs h-7 px-3" onClick={handleConfirm}>确认</Button>
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
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-1 pb-3 space-y-3">
          {/* 账号密码展示 */}
          <div className="bg-[#fafafa] rounded-[4px] border border-[#e5e5e5] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A3A3A3] font-medium uppercase tracking-wide">用户 ID</span>
              <span className="text-sm font-mono text-gray-800 select-all">{memberId}</span>
            </div>
            <div className="border-t border-[#e5e5e5]" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A3A3A3] font-medium uppercase tracking-wide">初始密码</span>
              <span className="text-sm font-mono text-gray-800 tracking-widest select-none">{maskedPassword}</span>
            </div>
          </div>

          {/* 警示文案 */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-[4px] px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              关闭弹窗后将无法再次查看此密码，请复制后妥善保存，并通过安全渠道告知用户。
            </p>
          </div>

          {/* 复制按钮 */}
          <Button
            className="w-full"
           
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
/** 获取用户所在分组的配额信息（用于列表和弹窗展示） */
function getMemberGroupQuotas(memberId: string, hasOneid: boolean): Array<{ groupId: string; groupName: string; clawLimit: number; tokenLimit: number }> {
  // 从实际 mock 用户数据中获取用户的 groupIds
  const userOrg = hasOneid
    ? MM_MOCK_USERS.find((u) => u.userId === memberId)
    : MM_MOCK_USERS_MANUAL.find((u) => u.userId === memberId);
  if (!userOrg || userOrg.groupIds.length === 0) return [];

  const quotaMap = hasOneid ? ONEID_GROUP_POLICY_QUOTAS : GROUP_POLICY_QUOTAS;
  const allGroups = hasOneid ? MM_MOCK_GROUPS : MM_MOCK_MANUAL_GROUPS;
  const groupMap = new Map(allGroups.map((g) => [g.id, g]));

  return userOrg.groupIds
    .filter((gId) => groupMap.has(gId))
    .map((gId) => {
      const quota = quotaMap[gId] ?? { clawLimit: PRESET_POLICY_CLAW_LIMIT, tokenLimit: PRESET_POLICY_TOKEN_LIMIT };
      const fullPath = mmGetPrimaryDeptPath(gId, allGroups);
      return { groupId: gId, groupName: fullPath, clawLimit: quota.clawLimit, tokenLimit: quota.tokenLimit };
    });
}

export default function MemberManagement() {
  // 获取 hasOneid 状态
  const { hasOneid } = useAdminMode();

  const [members, setMembers] = useState<typeof MOCK_MEMBERS_BASE>(
    hasOneid ? MOCK_MEMBERS_ONEID_BASE : (MOCK_MEMBERS_MANUAL_BASE as typeof MOCK_MEMBERS_BASE)
  );
  // 监听 hasOneid 切换，members 重置为对应模式的基础数据
  useEffect(() => {
    setMembers(
      hasOneid ? MOCK_MEMBERS_ONEID_BASE : (MOCK_MEMBERS_MANUAL_BASE as typeof MOCK_MEMBERS_BASE)
    );
  }, [hasOneid]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isInitialAdminEdit, setIsInitialAdminEdit] = useState(false);

  // OneID 模式专用状态
  const [deptFilter, setDeptFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "member">("all");
  const [oneidEditForm, setOneidEditForm] = useState({ ...emptyOneidEditForm });
  const [isSyncing, setIsSyncing] = useState(false);
  /** 组织架构是否已同步为分组（由 GroupView 回调通知） */
  const [mmDeptSynced, setMmDeptSynced] = useState(false);
  /** 手动同步时产生的异常分组数据，传递给 GroupView 显示红点 */
  const [mmAnomalousGroups, setMmAnomalousGroups] = useState<{ groupId: string; groupName: string; memberCount: number; boundConfigs: string[]; agentInstanceCount: number }[]>([]);

  // OneID 同步结果弹窗：展示因名下有未清理 Agent 而无法删除的用户 + 分组异常
  const [syncResultDialog, setSyncResultDialog] = useState<{
    open: boolean;
    failedUsers: { id: string; clawCount: number; vpcName?: string }[];
    deletedCount: number;
    addedCount: number;
    /** 分组异常：组织架构被删除但仍有配置绑定的分组 */
    anomalousGroups?: { groupId: string; groupName: string; memberCount: number; boundConfigs: string[]; agentInstanceCount: number }[];
  } | null>(null);

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
  const [showAuthSourceDialog, setShowAuthSourceDialog] = useState(false);
  // 数据源弹窗的初始步骤和初始数据源ID（编辑/更换时使用）
  const [authSourceInitialStep, setAuthSourceInitialStep] = useState<1 | 2 | undefined>(undefined);
  const [authSourceInitialId, setAuthSourceInitialId] = useState<string | null>(null);
  const [authSourceInitialFormValues, setAuthSourceInitialFormValues] = useState<Record<string, string> | null>(null);
  // 已配置的数据源列表
  const [configuredAuthSources, setConfiguredAuthSources] = useState<ConfiguredAuthSource[]>([]);
  // 数据源删除二次确认弹窗
  const [deleteAuthSourceConfirm, setDeleteAuthSourceConfirm] = useState<{ open: boolean; source: ConfiguredAuthSource } | null>(null);
  // 批量导入弹窗状态
  const [batchImportStep, setBatchImportStep] = useState<"upload" | "importing" | "done">("upload");
  const [batchImportFile, setBatchImportFile] = useState<File | null>(null);
  const [batchImportProgress, setBatchImportProgress] = useState(0); // 0~100
  const [batchImportResult, setBatchImportResult] = useState<{ success: number; fail: number } | null>(null);
  const [showResetDialog, setShowResetDialog] = useState<string | null>(null);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [addBtnHovered, setAddBtnHovered] = useState(false);

  // 用户列表表格横向滚动检测（操作列 sticky right 阴影）
  const memberTableScrollRef = useRef<HTMLDivElement>(null);
  const [memberTableCanScrollRight, setMemberTableCanScrollRight] = useState(false);
  useEffect(() => {
    const el = memberTableScrollRef.current;
    if (!el) return;
    const check = () => {
      const canScroll = el.scrollWidth > el.clientWidth;
      const isAtRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setMemberTableCanScrollRight(canScroll && !isAtRight);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, []);

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

  // 新：部门视图的裁决 state（mock 级持久化）
  const [mmOverrides, setMmOverrides] = useState<Record<string, MMUserOverrideInfo>>(
    () => ({ ...MM_MOCK_OVERRIDES })
  );
  const handleMmResolveConflict = useCallback(
    (userId: string, winnerResourceId: string) => {
      setMmOverrides((prev) => {
        const cur = prev[userId];
        if (!cur) return prev;
        return {
          ...prev,
          [userId]: {
            ...cur,
            winnerResourceId,
            isResolved: true,
          },
        };
      });
    },
    []
  );
  const [groups, setGroups] = useState<MemberGroup[]>(MOCK_GROUPS_INIT);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(MOCK_GROUPS_INIT.length > 0 ? MOCK_GROUPS_INIT[0].id : "__ungrouped__");
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupParentId, setNewGroupParentId] = useState<string | null>(null);
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

  // 存量 Agent 实例处理弹窗
  const [agentInstanceDialog, setAgentInstanceDialog] = useState<{
    open: boolean;
    userId: string;
    removedGroupIds: string[];
    agents: Array<{ groupName: string; instances: Array<{ id: string; name: string }> }>;
    pendingAction: () => void; // 原始操作（保留原配置时执行）
  } | null>(null);
  const [agentInstanceChoice, setAgentInstanceChoice] = useState<"keep" | "delete">("keep");

  // 同步后存量 Agent 实例处理弹窗
  const [syncAgentInstanceDialog, setSyncAgentInstanceDialog] = useState<{
    open: boolean;
    agents: Array<{ userId: string; instanceId: string; instanceName: string; groupName: string; reason: string }>;
  } | null>(null);
  const [syncAgentInstanceChoice, setSyncAgentInstanceChoice] = useState<"keep" | "delete">("keep");

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
      vpcType: "auto" as const, vpcName: `agent/${newMember.id.split("@")[0]}`, hasVpcResources: false,
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
    // 从实际 mock 用户数据获取该用户的 groupIds（用于分组选择框）
    const userOrg = hasOneid
      ? MM_MOCK_USERS.find((u) => u.userId === member.id)
      : MM_MOCK_USERS_MANUAL.find((u) => u.userId === member.id);
    const actualGroupIds = userOrg?.groupIds ?? [];
    if (hasOneid) {
      setOneidEditForm({
        id: member.id,
        role: member.role,
        department: MOCK_MEMBER_DEPARTMENTS[member.id] || "",
        clawLimit: member.clawLimit,
        tokenLimit: member.tokenLimit,
        groupIds: actualGroupIds,
      });
    } else {
      setEditForm({
        id: member.id,
        role: member.role,
        clawLimit: member.clawLimit,
        tokenLimit: member.tokenLimit,
        groupIds: actualGroupIds,
      });
      setIsInitialAdminEdit(member.id === initialAdminId);
    }
    setEditMemberId(member.id);
  };

  const handleEdit = () => {
    const targetId = editMemberId!;
    const newGroupIds = hasOneid ? oneidEditForm.groupIds : editForm.groupIds;

    // 获取用户原来的 groupIds
    const userOrg = hasOneid
      ? MM_MOCK_USERS.find((u) => u.userId === targetId)
      : MM_MOCK_USERS_MANUAL.find((u) => u.userId === targetId);
    const oldGroupIds = userOrg?.groupIds ?? [];
    // 找出被移除的分组
    const removedGroupIds = oldGroupIds.filter((gId) => !newGroupIds.includes(gId));

    // 检查被移除分组中是否有 Agent 实例
    const userAgents = MOCK_USER_GROUP_AGENTS[targetId];
    const affectedAgents: Array<{ groupName: string; instances: Array<{ id: string; name: string }> }> = [];
    if (userAgents) {
      const allGroups = hasOneid ? MM_MOCK_GROUPS : MM_MOCK_MANUAL_GROUPS;
      removedGroupIds.forEach((gId) => {
        const instances = userAgents[gId];
        if (instances && instances.length > 0) {
          const g = allGroups.find((g) => g.id === gId);
          affectedAgents.push({ groupName: mmGetPrimaryDeptPath(gId, allGroups), instances });
        }
      });
    }

    const doEdit = () => {
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
          return { ...g, memberIds: Array.from(new Set([...without, targetId])) };
        }
        return { ...g, memberIds: without };
      }));
      setEditMemberId(null);
      toast.success("用户信息已更新");
    };

    if (affectedAgents.length > 0) {
      // 有存量实例，弹出二次确认
      setAgentInstanceDialog({
        open: true,
        userId: targetId,
        removedGroupIds,
        agents: affectedAgents,
        pendingAction: doEdit,
      });
    } else {
      doEdit();
    }
  };

  // 手动同步（OneID 模式）
  const handleSync = useCallback(() => {
    setIsSyncing(true);
    // 模拟同步过程：假设 OneID 侧删除了 jack@acompany.com 和 iris@acompany.com
    setTimeout(() => {
      const oneidDeletedUserIds = ["jack@acompany.com", "iris@acompany.com"];
      // 模拟新增用户数量
      const addedCount = 0;

      // 检查每个被删除用户名下的 Agent 数量
      const failedUsers: { id: string; clawCount: number; vpcName?: string }[] = [];
      let deletedCount = 0;
      // 模拟私有网络绑定情况
      const vpcBindings: Record<string, string> = {
        "iris@acompany.com": "openclaw/iris",
      };

      setMembers((prev) => {
        const updated = prev.map((m) => {
          if (!oneidDeletedUserIds.includes(m.id)) return m;
          const hasVpc = !!vpcBindings[m.id];
          if (m.clawCount > 0 || hasVpc) {
            // 有未清理的 Agent 或有私有网络绑定，不能删除，改为禁用
            failedUsers.push({ id: m.id, clawCount: m.clawCount, vpcName: vpcBindings[m.id] });
            return { ...m, status: "disabled" };
          } else {
            // 无 Agent，直接删除
            deletedCount++;
            return { ...m, _deleted: true };
          }
        });
        // 过滤掉直接删除的用户
        return updated.filter((m) => !(m as any)._deleted);
      });

      setIsSyncing(false);

      if (failedUsers.length > 0) {
        // 有无法删除的用户，弹窗提醒（已同步过组织架构时同时展示分组异常）
        const groupAnomalies = mmDeptSynced ? MM_MOCK_SYNC_RESULT.anomalousGroups : [];
        setSyncResultDialog({
          open: true,
          failedUsers,
          deletedCount,
          addedCount,
          anomalousGroups: groupAnomalies,
        });
        // 同步异常分组数据到 GroupView 以显示红点
        if (groupAnomalies.length > 0) {
          setMmAnomalousGroups(groupAnomalies);
          // 模拟：组织架构被删除后，用户从这些分组中被移除
          const deletedGroupIds = new Set(["dept-operation", "dept-operation-1", "dept-operation-2"]);
          MM_MOCK_USERS.forEach((u, idx) => {
            if (u.groupIds.some((gid) => deletedGroupIds.has(gid))) {
              MM_MOCK_USERS[idx] = {
                ...u,
                groupIds: u.groupIds.filter((gid) => !deletedGroupIds.has(gid)),
              };
            }
          });
        }
      } else {
        const parts: string[] = [];
        if (addedCount > 0) parts.push(`新增 ${addedCount} 个`);
        if (deletedCount > 0) parts.push(`删除 ${deletedCount} 个`);
        toast.success(`同步完成${parts.length > 0 ? `，${parts.join("，")}用户` : ""}`);
      }
    }, 2000);
  }, [mmDeptSynced]);

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
    setNewGroupParentId(null);
    setShowCreateGroupDialog(false);
    setSelectedGroupId(newGroup.id);
    // 如果添加用户弹窗打开，自动选中新分组并重新打开 Popover
    if (showAddDialog) {
      setNewMember((prev) => ({ ...prev, groupIds: [newGroup.id] }));
      setTimeout(() => setGroupPopoverReopenKey((k) => k + 1), 150);
    }
    // 如果编辑用户弹窗打开，自动选中新分组并重新打开 Popover
    if (editMemberId) {
      if (hasOneid) {
        setOneidEditForm((prev) => ({ ...prev, groupIds: [newGroup.id] }));
      } else {
        setEditForm((prev) => ({ ...prev, groupIds: [newGroup.id] }));
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
      const newIds = Array.from(new Set([...g.memberIds, ...addToGroupSelected]));
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
      <div className="page-enter min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#09090b]">用户管理</h1>
            <p className="text-sm text-[#737373] mt-1">管理企业用户的访问权限和资源配额
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
                    className="text-[#737373] hover:text-blue-500 inline-flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    前往腾讯统一身份管理用户
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* 我的数据源（OneID 模式下不展示） */}
        {!hasOneid && configuredAuthSources.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-[#525252] mb-3">我的数据源</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {configuredAuthSources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white rounded-[4px] border border-[#e5e5e5] p-4 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-[4px] bg-white border border-[#e5e5e5] flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={source.iconUrl}
                        alt={source.name}
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#09090b]">{source.name}</p>
                      <p className="text-xs text-[#737373] mt-0.5">{source.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <button
                        className="flex items-center gap-1 text-xs text-[#737373] hover:text-[#355EF1] transition-colors"
                        onClick={() => {
                          setAuthSourceInitialStep(2);
                          setAuthSourceInitialId(source.id);
                          setAuthSourceInitialFormValues(source.formValues || null);
                          setShowAuthSourceDialog(true);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                        编辑
                      </button>
                      <button
                        className="flex items-center gap-1 text-xs text-[#737373] hover:text-[#355EF1] transition-colors"
                        onClick={() => {
                          setAuthSourceInitialStep(1);
                          setAuthSourceInitialId(null);
                          setAuthSourceInitialFormValues(null);
                          setShowAuthSourceDialog(true);
                        }}
                      >
                        <RefreshCw className="w-3 h-3" />
                        更换
                      </button>
                      <button
                        className="flex items-center gap-1 text-xs text-[#737373] hover:text-red-500 transition-colors"
                        onClick={() => {
                          setDeleteAuthSourceConfirm({ open: true, source });
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${source.enabled ? "text-[#355EF1]" : "text-[#A3A3A3]"}`}>
                        {source.enabled ? "已启用" : "已禁用"}
                      </span>
                      <Switch
                        checked={source.enabled}
                        onCheckedChange={(checked) => {
                          setConfiguredAuthSources(configuredAuthSources.map((s) =>
                            s.id === source.id ? { ...s, enabled: checked } : s
                          ));
                          toast.success(checked ? `已启用数据源：${source.name}` : `已禁用数据源：${source.name}`);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + Filter + Actions Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex w-[676px] h-9 items-center gap-2 px-0 py-0 text-base leading-6 text-[#0A0A0A]">
            {/* 视图切换按钮组（最左侧，两种模式通用） */}
            <SegmentGroup>
              <SegmentOption
                active={viewMode === "all"}
                onClick={() => { setViewMode("all"); setPage(1); }}
              >
                全部
              </SegmentOption>
              <SegmentOption
                active={viewMode === "group"}
                onClick={() => { setViewMode("group"); setGroupPage(1); }}
              >
                分组
              </SegmentOption>
            </SegmentGroup>
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
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["all", "admin", "member"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v === "all" ? "全部角色" : v === "admin" ? "管理员" : "用户"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {/* 搜索框 */}
            <div className="relative w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <Input
                placeholder="搜索用户 ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 bg-white border-[#e5e5e5]"
              />
            </div>
            {/* 清除筛选按钮 - 当有任何筛选条件时显示 */}
            {(deptFilter || search.trim() || roleFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#737373] hover:text-[#525252] h-9 px-3"
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

          {/* 右端操作区：手动同步（OneID） / 下载 + 添加用户（普通模式·全部视图） */}
          <div className="flex items-center gap-2">
            {/* OneID 模式：手动同步按钮 */}
            {hasOneid && (
              <Button
                variant="outline"
                className="border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#fafafa]"
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

            {/* 普通模式 + 全部视图：导出用户列表 + 添加用户 */}
            {viewMode === "all" && !hasOneid && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#fafafa] h-9 w-9"
                  title="导出用户列表"
                  onClick={() => {
                    const headers = ["用户ID", "姓名", "角色", "状态", "创建时间"];
                    const rows = members.map((m: any) => [m.id || "", m.name || m.username || "", m.role || "", m.status || "", m.createdAt || m.created_at || ""]);
                    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
                    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
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
                {members.length >= 20 ? (
                  <div
                    className="relative inline-block cursor-not-allowed"
                    onMouseEnter={() => setAddBtnHovered(true)}
                    onMouseLeave={() => setAddBtnHovered(false)}
                  >
                    <div className="relative">
                      <Button className="pointer-events-none select-none text-sm" tabIndex={-1} aria-disabled="true">
                        添加用户<ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                      <div className="absolute inset-0 rounded-[4px] bg-white/50 pointer-events-none" />
                    </div>
                    {addBtnHovered && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-[4px] bg-gray-900 px-3 py-2 text-xs text-white leading-relaxed text-left shadow-lg pointer-events-none">
                        当前用户数已达上限，无法再添加
                      </div>
                    )}
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="text-sm">
                        添加用户<ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowAddDialog(true)}><Plus className="w-4 h-4 mr-2" />单个添加</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowBatchDialog(true)}><Upload className="w-4 h-4 mr-2" />批量导入</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setAuthSourceInitialStep(undefined);
                        setAuthSourceInitialId(null);
                        setAuthSourceInitialFormValues(null);
                        setShowAuthSourceDialog(true);
                      }}><Link2 className="w-4 h-4 mr-2" />数据源导入</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>

        {/* Table - 全部视图 */}
        {viewMode === "all" && (
        <div className="bg-white rounded-[4px] border border-[#e5e5e5] overflow-hidden"
         >
          <div className="overflow-x-auto" style={{ width: 0, minWidth: "100%" }} ref={memberTableScrollRef}>
          <table className="text-sm w-full" style={{ minWidth: hasOneid ? "1320px" : "100%" }}>
            <thead>
              <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                <th className="text-left px-4 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap" style={{ minWidth: "220px" }}>
                  <div className="flex items-center gap-1.5">
                    用户 ID
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-pointer inline-flex"><Info className="w-3.5 h-3.5 text-[#A3A3A3]" /></span></TooltipTrigger>
                      <TooltipContent sideOffset={4}>企业用户的唯一 ID，例如企业邮箱或企业用户唯一名称</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                {hasOneid && (
                  <>
                    <th className="text-left px-3 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap" style={{ minWidth: "200px" }}>
                      <div className="flex items-center gap-1.5">
                        部门
                        <Tooltip>
                          <TooltipTrigger asChild><span className="cursor-pointer inline-flex"><Info className="w-3.5 h-3.5 text-[#A3A3A3]" /></span></TooltipTrigger>
                          <TooltipContent sideOffset={4}>用户的部门信息来自腾讯统一身份管理平台</TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap" style={{ minWidth: "200px" }}>分组</th>
                  </>
                )}
                {!hasOneid && (
                  <th className="text-left px-3 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap" style={{ minWidth: "200px" }}>分组</th>
                )}
                <th className="text-left px-3 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap" style={{ minWidth: "80px" }}>角色</th>
                <th className="text-left px-3 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap" style={{ minWidth: "80px" }}>状态</th>
                <th className="text-left px-3 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap" style={{ minWidth: "120px" }}>
                  <div className="flex items-center gap-1.5">
                    Agent 上限
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-pointer inline-flex"><Info className="w-3.5 h-3.5 text-[#A3A3A3]" /></span></TooltipTrigger>
                      <TooltipContent sideOffset={4}>单个企业用户最多可以创建的 Agent 数量</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-3 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    每日 Tokens 上限
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-pointer inline-flex"><Info className="w-3.5 h-3.5 text-[#A3A3A3]" /></span></TooltipTrigger>
                      <TooltipContent sideOffset={4}>单个企业用户每日最多可消耗的 Tokens 数量</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-3 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap" style={{ minWidth: "110px" }}>加入时间</th>
                <th className="text-left px-4 py-3 text-[14px] font-semibold text-[#09090b] whitespace-nowrap sticky right-0 z-10 relative" style={{ backgroundColor: "#fafafa" }}>
                  {memberTableCanScrollRight && (
                    <div className="absolute left-0 top-0 bottom-0" style={{ width: "6px", marginLeft: "-6px", background: "linear-gradient(to right, transparent, rgba(0,0,0,0.04))" }} />
                  )}
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((member) => {
                const memberGroups = groups.filter((g) => g.memberIds.includes(member.id));
                const groupNames = memberGroups.map((g) => g.name);
                // OneID 模式：从 MM_MOCK_USERS 获取部门 + 分组
                const mmDeptPaths = hasOneid ? getMmUserDeptPaths(member.id) : [];
                const mmGroupItems = hasOneid ? getMmUserGroupItems(member.id) : [];
                // 普通模式：从 MM_MOCK_USERS_MANUAL 获取分组完整路径
                const manualGroupPaths = !hasOneid ? getManualUserGroupPaths(member.id) : [];
                return (
                <tr key={member.id} className="hover:bg-[#fafafa]/50 transition-colors">
                  <td className="px-4 py-4" style={{ width: '220px', minWidth: '220px', maxWidth: '220px' }}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium text-[#09090b] truncate block max-w-[180px] cursor-pointer">{member.id}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs break-all">{member.id}</TooltipContent>
                    </Tooltip>
                  </td>
                  {hasOneid && (
                    <>
                      {/* 部门列 */}
                      <td className="px-3 py-4" style={{ minWidth: "200px" }}>
                        {mmDeptPaths.length === 0 ? (
                          <span className="text-sm text-[#A3A3A3]">—</span>
                        ) : mmDeptPaths.length === 1 ? (
                          <span
                            className="text-sm text-[#737373] truncate block max-w-[200px]"
                            title={mmDeptPaths[0].path}
                          >
                            {mmDeptPaths[0].path}
                          </span>
                        ) : (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span className="inline-flex items-center gap-1 max-w-[200px] cursor-pointer">
                                <span className="text-sm text-[#737373] truncate">
                                  {mmDeptPaths[0].path}
                                </span>
                                <span className="text-xs text-[#A3A3A3] tabular-nums shrink-0">
                                  +{mmDeptPaths.length - 1}
                                </span>
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="text-xs max-w-[360px] p-0">
                              <div className="py-2">
                                {mmDeptPaths.map((dp, idx) => (
                                  <div key={idx} className="px-3 py-1.5 text-sm">
                                    <span className="text-gray-200 mr-1">{idx + 1}.</span>
                                    <span className="text-white">{dp.path}</span>
                                    {dp.isPrimary && (
                                      <span className="ml-2 inline-flex items-center text-[10px] font-medium text-blue-400 bg-blue-500/20 rounded px-1.5 py-0.5">
                                        主部门
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </td>
                      {/* 分组列（OneID 模式：紧跟部门列） */}
                      <td className="px-3 py-4 whitespace-nowrap" style={{ minWidth: "200px" }}>
                        <div className="flex items-center gap-1 max-w-[200px]">
                          {mmGroupItems.length === 0 ? (
                            <span className="text-sm text-[#A3A3A3]">—</span>
                          ) : (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span className="inline-flex items-center gap-1 cursor-pointer max-w-full">
                                <StatusTag mode="fill" variant="gray" className="max-w-[160px] truncate">
                                  {mmGroupItems[0].path}
                                </StatusTag>
                                {mmGroupItems.length > 1 && (
                                  <StatusTag mode="fill" variant="gray">
                                    +{mmGroupItems.length - 1}
                                  </StatusTag>
                                )}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="text-xs max-w-[380px]">
                              {mmGroupItems.map((gi, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center text-[10px] font-medium rounded px-1.5 py-0.5 shrink-0 ${
                                      gi.kind === "oneid-dept"
                                        ? "text-blue-400 bg-blue-500/20"
                                        : "text-purple-400 bg-purple-500/20"
                                    }`}
                                  >
                                    {gi.kind === "oneid-dept" ? "部门" : "自定义分组"}
                                  </span>
                                  <span>{gi.path}</span>
                                </div>
                              ))}
                            </HoverCardContent>
                          </HoverCard>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                  {!hasOneid && (
                    /* 普通模式分组列：紧跟用户ID，完整路径 + hover tooltip */
                    <td className="px-3 py-4 whitespace-nowrap" style={{ minWidth: "200px" }}>
                      <div className="flex items-center gap-1 max-w-[200px]">
                        {manualGroupPaths.length === 0 ? (
                          <span className="text-sm text-[#A3A3A3]">—</span>
                        ) : (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span className="inline-flex items-center gap-1 cursor-pointer max-w-full">
                                <StatusTag mode="fill" variant="gray" className="max-w-[160px] truncate">
                                  {manualGroupPaths[0].path}
                                </StatusTag>
                                {manualGroupPaths.length > 1 && (
                                  <StatusTag mode="fill" variant="gray">
                                    +{manualGroupPaths.length - 1}
                                  </StatusTag>
                                )}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="text-xs">
                              {manualGroupPaths.map((gp, idx) => (
                                <div key={idx}>{gp.path}</div>
                              ))}
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <StatusTag preset={member.role === "admin" ? "role-admin" : "role-user"} />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {member.status === "active" ? (
                      <StatusTag mode="dot" variant="green">正常</StatusTag>
                    ) : (
                      <StatusTag mode="dot" variant="red">禁用</StatusTag>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {(() => {
                      const quotas = getMemberGroupQuotas(member.id, hasOneid);
                      if (quotas.length > 0) {
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm text-[#525252] cursor-default border-b border-dashed border-gray-300">按分组</span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[240px]">
                              <div className="space-y-1">
                                {quotas.map((q) => (
                                  <div key={q.groupId} className="flex items-center justify-between gap-3">
                                    <span className="text-[#A3A3A3]">{q.groupName}</span>
                                    <span className="text-white font-medium">{q.clawLimit}</span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      return <span className="text-sm text-[#525252]">{member.clawLimit}</span>;
                    })()}
                  </td>
                  <td className="px-3 py-4">
                    {(() => {
                      const quotas = getMemberGroupQuotas(member.id, hasOneid);
                      if (quotas.length > 0) {
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm text-[#525252] cursor-default border-b border-dashed border-gray-300">按分组</span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[240px]">
                              <div className="space-y-1">
                                {quotas.map((q) => (
                                  <div key={q.groupId} className="flex items-center justify-between gap-3">
                                    <span className="text-[#A3A3A3]">{q.groupName}</span>
                                    <span className="text-white font-medium">{q.tokenLimit.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      return <span className="text-sm text-[#525252]">{member.tokenLimit.toLocaleString()}</span>;
                    })()}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#737373]">{member.joinTime}</span>
                  </td>
                  <td className="px-4 py-4 sticky right-0 bg-white z-10 relative">
                    {memberTableCanScrollRight && (
                      <div className="absolute left-0 top-0 bottom-0" style={{ width: "6px", marginLeft: "-6px", background: "linear-gradient(to right, transparent, rgba(0,0,0,0.04))" }} />
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link-dark"
                        size="sm"
                        className="h-auto px-0"
                        onClick={() => openEditDialog(member)}
                      >
                        编辑
                      </Button>
                      {!hasOneid && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="link-dark" size="sm" className="h-auto px-0 !ring-0 !outline-none focus-visible:!ring-0 focus-visible:!border-transparent">
                            更多
                          </Button>
                        </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.id === initialAdminId ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center px-2 py-1.5 text-xs text-[#A3A3A3] cursor-not-allowed select-none rounded-sm">
                                    <Key className="w-3.5 h-3.5 mr-2" />重置密码
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-[220px] text-xs leading-relaxed">初始管理员账号不允许重置密码</TooltipContent>
                              </Tooltip>
                            ) : (
                              <DropdownMenuItem className="text-xs text-[#737373] focus:text-[#525252] focus:bg-[#fafafa]" onClick={() => { setShowResetDialog(member.id); setResetForm({ ...emptyResetForm }); }}>
                                <Key className="w-3.5 h-3.5 mr-2" />重置密码
                              </DropdownMenuItem>
                            )}
                            {member.id === initialAdminId ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center px-2 py-1.5 text-xs text-[#A3A3A3] cursor-not-allowed select-none rounded-sm">
                                    <UserX className="w-3.5 h-3.5 mr-2" />禁用
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left">初始管理员账号不可禁用</TooltipContent>
                              </Tooltip>
                            ) : member.status === "active" ? (
                              <DropdownMenuItem className="text-xs text-[#737373] focus:text-[#525252] focus:bg-[#fafafa]" onClick={() => openDisableConfirm(member)}>
                                <UserX className="w-3.5 h-3.5 mr-2" />禁用
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-xs text-[#737373] focus:text-[#525252] focus:bg-[#fafafa]" onClick={() => openEnableConfirm(member)}>
                                <UserCheck className="w-3.5 h-3.5 mr-2" />启用
                              </DropdownMenuItem>
                            )}
                            {member.id === initialAdminId ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center px-2 py-1.5 text-xs text-[#A3A3A3] cursor-not-allowed select-none rounded-sm">
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
          <div className="px-6 py-3 border-t border-gray-50">
            <Pagination
              total={filtered.length}
              current={currentPage}
              pageSize={PAGE_SIZE}
              showTotal={(total) => `共 ${total} 名用户`}
              className="w-full justify-between"
              hideOnSinglePage
              onChange={(page) => { setPage(page); }}
            />
          </div>
        </div>
        )}

        {/* 分组视图（v2.0：多层级树 + 健康圆点 + 配置总览 + 导入组织架构） */}
        {viewMode === "group" && (
          <NewGroupView
            hasOneid={hasOneid}
            users={MM_MOCK_USERS}
            overrides={mmOverrides}
            onResolveConflict={handleMmResolveConflict}
            onDeptSyncedChange={setMmDeptSynced}
            externalAnomalousGroups={mmAnomalousGroups}
            onShowSyncResult={(anomalousGroups) => {
              // 模拟刷新同步：与手动同步保持一致，返回用户异常 + 分组异常
              // 假设 OneID 侧删除了 jack 和 iris（与 handleSync 一致）
              const oneidDeletedUserIds = ["jack@acompany.com", "iris@acompany.com"];
              const vpcBindings: Record<string, string> = {
                "iris@acompany.com": "openclaw/iris",
              };
              const failedUsers: { id: string; clawCount: number; vpcName?: string }[] = [];
              let deletedCount = 0;
              setMembers((prev) => {
                const updated = prev.map((m) => {
                  if (!oneidDeletedUserIds.includes(m.id)) return m;
                  const hasVpc = !!vpcBindings[m.id];
                  if (m.clawCount > 0 || hasVpc) {
                    failedUsers.push({ id: m.id, clawCount: m.clawCount, vpcName: vpcBindings[m.id] });
                    return { ...m, status: "disabled" as const };
                  } else {
                    deletedCount++;
                    return { ...m, _deleted: true } as typeof m & { _deleted: true };
                  }
                });
                return updated.filter((m) => !(m as { _deleted?: boolean })._deleted);
              });
              setSyncResultDialog({
                open: true,
                failedUsers,
                deletedCount,
                addedCount: 0,
                anomalousGroups,
              });
              // 同步异常分组数据到 GroupView 以显示红点
              if (anomalousGroups.length > 0) {
                setMmAnomalousGroups(anomalousGroups);
              }
            }}
          />
        )}

        {/* 旧分组视图已由 NewGroupView 替代 */}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="sm:max-w-[720px]"
          style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
        >
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex-1">
            <AddMemberFormFields
              values={newMember}
              onChange={setNewMember}
              existingMemberIds={members.map((m) => m.id)}
              groups={groups}
              userGroups={hasOneid ? MM_MOCK_GROUPS : MM_MOCK_MANUAL_GROUPS}
              onOpenCreateGroupDialog={() => { setShowCreateGroupDialog(true); setNewGroupName(""); setNewGroupParentId(null); }}
              groupPopoverReopenKey={groupPopoverReopenKey}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleAdd}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editMemberId} onOpenChange={(open) => { if (!open) setEditMemberId(null); }}>
        <DialogContent
          className="sm:max-w-[720px]"
          style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex-1">
            {hasOneid ? (
              <OneidEditMemberFormFields
                values={oneidEditForm}
                onChange={setOneidEditForm}
                groups={groups}
                userGroups={MM_MOCK_GROUPS}
                onOpenCreateGroupDialog={() => { setShowCreateGroupDialog(true); setNewGroupName(""); setNewGroupParentId(null); }}
                groupPopoverReopenKey={groupPopoverReopenKey}
              />
            ) : (
              <EditMemberFormFields
                values={editForm}
                onChange={setEditForm}
                isInitialAdmin={isInitialAdminEdit}
                groups={groups}
                userGroups={hasOneid ? MM_MOCK_GROUPS : MM_MOCK_MANUAL_GROUPS}
                onOpenCreateGroupDialog={() => { setShowCreateGroupDialog(true); setNewGroupName(""); setNewGroupParentId(null); }}
                groupPopoverReopenKey={groupPopoverReopenKey}
              />
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMemberId(null)}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleEdit}>保存修改</Button>
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
        <DialogContent className="sm:max-w-[560px]" onInteractOutside={(e) => {
          if (batchImportStep === "importing") e.preventDefault();
        }}>
          <DialogHeader>
            <DialogTitle className="text-[#0A0A0A]">批量导入用户</DialogTitle>
          </DialogHeader>

          <DialogBody>
            {/* ── 上传阶段 ── */}
            {batchImportStep === "upload" && (
              <div className="space-y-5">
                {/* Step 1: 下载模板 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#0A0A0A]">第一步：下载模板并填写用户信息</p>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    下载 CSV 模板，按格式填写信息后保存。
                    <span className="text-[#d42a1e] font-medium">单次最多导入 1000 个用户。</span>
                  </p>
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
                  <p className="text-sm font-medium text-[#0A0A0A]">第二步：上传填写好的 CSV 文件</p>
                  {!batchImportFile ? (
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed rounded-[4px] cursor-pointer border-[#E5E5E5] hover:border-[#1447E6] hover:bg-[#F5F8FF] transition-colors">
                      <Upload className="w-5 h-5 text-[#737373] mb-1.5" />
                      <span className="text-sm text-[#0A0A0A]">点击选择 CSV 文件</span>
                      <span className="text-xs text-[#737373] mt-0.5">仅支持 .csv 格式</span>
                      <input type="file" accept=".csv" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setBatchImportFile(file);
                        }} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-[4px] border border-[#E5E5E5] bg-[#F5F5F5]">
                      <FileText className="w-8 h-8 text-[#1447E6] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0A0A0A] truncate">{batchImportFile.name}</p>
                        <p className="text-xs text-[#737373]">{(batchImportFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        aria-label="移除文件"
                        className="w-6 h-6 rounded-full text-[#737373] hover:text-[#d42a1e] hover:bg-[#FEF2F2] flex items-center justify-center transition-colors flex-shrink-0"
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
                  <div className="w-16 h-16 rounded-full border-4 border-[#E8ECFE] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#1447E6] animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-base font-semibold text-[#0A0A0A]">正在导入中...</p>
                  <p className="text-sm text-[#737373]">预计需要 1 ~ 2 分钟，请勿关闭弹窗</p>
                  <p className="text-xs text-[#A3A3A3]">导入完成后将自动显示结果通知</p>
                </div>
              </div>
            )}
          </DialogBody>

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
                  variant="dialog-confirm"
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
        <DialogContent
          className="sm:max-w-md"
          style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex-1">
            <div className="space-y-4">
              <Alert variant="info">
                <AlertInfoIcon />
                <AlertDescription>
                  确认重置用户「<span className="font-medium">{showResetDialog}</span>」的密码？系统将自动生成新密码。
                </AlertDescription>
              </Alert>

              {/* 信息发送地址 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-[#525252]">
                  信息发送地址（选填）
                  <InfoPopover
                    content="信息发送会产生额外的短信/邮件费用，合并到腾讯云账单计费"
                    placement="top"
                  >
                    <Info className="w-3.5 h-3.5 text-[#737373]" />
                  </InfoPopover>
                </Label>
                <Input
                  type="email"
                  placeholder="输入用户接收新密码的邮箱地址"
                  value={resetForm.notificationEmail}
                  onChange={(e) => setResetForm({ ...resetForm, notificationEmail: e.target.value })}
                  tabIndex={-1}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowResetDialog(null); setResetForm({ ...emptyResetForm }); }}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleReset}>
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

      {/* OneID 同步结果弹窗：展示分组异常 + 用户异常 */}
      <Dialog
        open={!!syncResultDialog?.open}
        onOpenChange={(open) => { if (!open) setSyncResultDialog(null); }}
      >
        <DialogContent className="sm:max-w-[920px] max-h-[85vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#09090b]">同步结果</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-6">

            {/* ═══ 分组异常区块（上方） ═══ */}
            {(syncResultDialog?.anomalousGroups?.length ?? 0) > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#09090b] mb-3">分组异常</h4>

                {/* 分组异常提示 */}
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-[4px] px-4 py-3 mb-3">
                  <Info className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600 leading-relaxed">
                    以下分组对应的部门已在腾讯统一身份管理平台被删除，分组内用户已被移除。但由于分组仍有专属配置未解绑或存量 Agent 实例未删除，需管理员处理完成后，分组才会被彻底删除。专属配置可前往{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setSyncResultDialog(null);
                        setViewMode("group");
                      }}
                      className="inline font-semibold text-red-700 underline underline-offset-2 hover:text-red-800"
                    >
                      用户管理-分组视图
                    </button>
                    {" "}查看并解绑，Agent 实例可前往{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setSyncResultDialog(null);
                        window.location.href = "/admin/openclaw-monitor";
                      }}
                      className="inline font-semibold text-red-700 underline underline-offset-2 hover:text-red-800"
                    >
                      Agent 列表
                    </button>
                    {" "}页删除。
                  </p>
                </div>

                {/* 分组异常表格 */}
                <div className="rounded-[4px] border border-[#e5e5e5] overflow-hidden"
                >
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50 bg-[#fafafa]/50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">分组名称</th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">分组总人数</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">分组专属配置</th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">Agent 实例数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {syncResultDialog?.anomalousGroups?.map((group) => (
                        <tr key={group.groupId} className="hover:bg-[#fafafa]/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-[#09090b]">{group.groupName}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm tabular-nums text-[#737373]">{group.memberCount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {group.boundConfigs.map((config) => (
                                <span key={config} className="inline-flex items-center px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded-[4px] border border-red-100">
                                  {config}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-sm tabular-nums ${group.agentInstanceCount > 0 ? "font-semibold text-red-600" : "text-[#A3A3A3]"}`}>
                              {group.agentInstanceCount > 0 ? `${group.agentInstanceCount} 个` : "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══ 用户异常区块（下方） ═══ */}
            {(syncResultDialog?.failedUsers.length ?? 0) > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#09090b] mb-3">用户异常</h4>

                {/* 同步概要 */}
                <div className="flex items-start gap-2.5 bg-[#eff4ff] border border-blue-100 rounded-[4px] px-4 py-3 mb-3">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-[#355EF1] leading-relaxed">
                    本次同步
                    {[
                      (syncResultDialog?.addedCount ?? 0) > 0 ? <React.Fragment key="added">新增用户 <span className="font-semibold text-blue-700">{syncResultDialog?.addedCount}</span> 个</React.Fragment> : null,
                      (syncResultDialog?.failedUsers.length ?? 0) > 0 ? <React.Fragment key="failed">禁用用户 <span className="font-semibold text-red-600">{syncResultDialog?.failedUsers.length}</span> 个</React.Fragment> : null,
                      (syncResultDialog?.deletedCount ?? 0) > 0 ? <React.Fragment key="deleted">删除用户 <span className="font-semibold text-blue-700">{syncResultDialog?.deletedCount}</span> 个</React.Fragment> : null,
                    ].filter(Boolean).reduce<React.ReactNode[]>((acc, item, i) => {
                      if (i === 0) return [item];
                      return [...acc, <React.Fragment key={`sep-${i}`}>，</React.Fragment>, item];
                    }, [])}
                    。
                    {(syncResultDialog?.failedUsers.length ?? 0) > 0 && (() => {
                      const clawFailCount = syncResultDialog?.failedUsers.filter(u => u.clawCount > 0).length ?? 0;
                      const vpcFailCount = syncResultDialog?.failedUsers.filter(u => !!u.vpcName).length ?? 0;
                      const parts: React.ReactNode[] = [];
                      if (clawFailCount > 0) parts.push(<React.Fragment key="claw">其中 <span className="font-semibold text-red-600">{clawFailCount}</span> 个用户因名下存在未清理的 Agent 无法直接删除</React.Fragment>);
                      if (vpcFailCount > 0) parts.push(<React.Fragment key="vpc"><span className="font-semibold text-red-600">{vpcFailCount}</span> 个用户因名下存在未解除的私有网络无法直接删除</React.Fragment>);
                      return parts.length > 0 ? <>{parts.reduce<React.ReactNode[]>((acc, item, i) => i === 0 ? [item] : [...acc, "，", item], [])}，状态已自动改为禁用。</> : null;
                    })()}
                  </p>
                </div>

                {/* 无法删除的用户列表 */}
                <div className="rounded-[4px] border border-[#e5e5e5] overflow-hidden"
                >
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50 bg-[#fafafa]/50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">用户 ID</th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">名下 Agent</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">私有网络</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide">当前状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {syncResultDialog?.failedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-[#fafafa]/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-[#09090b]">{user.id}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-red-600">{user.clawCount} 个</span>
                          </td>
                          <td className="px-6 py-4">
                            {user.vpcName ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-[#355EF1]">{user.vpcName}</span>
                                <span className="text-xs text-red-600">(有关联云资源)</span>
                              </div>
                            ) : (
                              <span className="text-sm text-[#A3A3A3]">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <StatusTag mode="dot" variant="red">禁用</StatusTag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 警告提示：与删除弹窗红色框风格一致 */}
                <Alert variant="destructive" className="mt-3 border-red-200 bg-red-50">
                  <AlertCircle className="size-4" />
                  <AlertTitle>无法删除用户</AlertTitle>
                  <AlertDescription>
                    <p>
                      删除用户需要该用户名下没有任何 Agent。可让用户自行删除，或由管理员在 Agent 监控页手动删除。
                    </p>
                    {syncResultDialog?.failedUsers.some(u => !!u.vpcName) && (
                      <p>
                        删除用户需要系统自动分配的私有网络下无关联云资源。请前往{" "}
                        <a href="https://console.cloud.tencent.com/vpc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline hover:opacity-80">腾讯云控制台<ExternalLink className="w-3 h-3 inline-block" /></a>
                        {" "}解除后，再刷新检查。
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}

          </div>
          <DialogFooter>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                setSyncResultDialog(null);
                // 同步后检测存量 Agent 实例
                // 模拟：alice 被从 dept-tech 移出、bob 被从 dept-fe 移出、dept-ai 上级变动
                const syncAffectedAgents: Array<{ userId: string; instanceId: string; instanceName: string; groupName: string; reason: string }> = [];
                // 用户从分组中移除
                const removedFromGroup: Array<{ userId: string; groupId: string }> = [
                  { userId: "alice@acompany.com", groupId: "dept-tech" },
                  { userId: "bob@acompany.com", groupId: "dept-fe" },
                ];
                removedFromGroup.forEach(({ userId, groupId }) => {
                  const userAgents = MOCK_USER_GROUP_AGENTS[userId];
                  const instances = userAgents?.[groupId];
                  if (instances && instances.length > 0) {
                    const gName = mmGetPrimaryDeptPath(groupId, hasOneid ? MM_MOCK_GROUPS : MM_MOCK_MANUAL_GROUPS);
                    instances.forEach((inst) => {
                      syncAffectedAgents.push({ userId, instanceId: inst.id, instanceName: inst.name, groupName: gName, reason: "用户从分组中移除" });
                    });
                  }
                });
                if (syncAffectedAgents.length > 0) {
                  setSyncAgentInstanceDialog({ open: true, agents: syncAffectedAgents });
                  setSyncAgentInstanceChoice("keep");
                }
              }}
            >
              知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Check Dialog - 第一步：资源情况说明 */}
      <Dialog
        open={!!deleteCheckDialog?.open}
        onOpenChange={(open) => { if (!open) setDeleteCheckDialog(null); }}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>删除用户</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex-1">
            <div className="space-y-4">
            {/* Alert 提示放在内容区最上方（§8.7 强制规范 5）：根据条件显示蓝色 info 或红色 destructive */}
            {(() => {
              const clawOk = (deleteCheckDialog?.clawCount ?? 0) === 0;
              const vpcOk = deleteCheckDialog?.vpcType === "custom" || deleteCheckDialog?.hasVpcResources === false;
              const allOk = clawOk && vpcOk;

              if (allOk) {
                // 黄色 warning Alert：条件已满足，提醒用户即将执行删除
                return (
                  <Alert variant="warning">
                    <CircleAlert />
                    <AlertTitle>注意事项</AlertTitle>
                    <AlertDescription>
                      {deleteCheckDialog?.vpcType === "auto"
                        ? "该用户名下没有 Agent，且私有网络无关联资源，可以删除。删除后该用户将无法登录系统，操作不可撤销。"
                        : "该用户名下没有 Agent，可以删除。删除后该用户将无法登录系统，操作不可撤销。"
                      }
                    </AlertDescription>
                  </Alert>
                );
              }

              // 红色 destructive Alert：条件未满足
              const reasons: React.ReactNode[] = [];
              if (!clawOk) {
                reasons.push(
                  <p key="claw">
                    删除用户需要该用户名下没有任何 Agent。可让用户自行删除，或由管理员在 Agent 监控页手动删除。
                  </p>
                );
              }
              if (deleteCheckDialog?.vpcType === "auto" && !vpcOk) {
                reasons.push(
                  <p key="vpc">
                    删除用户需要系统自动分配的私有网络下无关联云资源。请前往{" "}
                    <a href="https://console.cloud.tencent.com/vpc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline hover:opacity-80">腾讯云控制台<ExternalLink className="w-3 h-3 inline-block" /></a>
                    {" "}解除后，再刷新检查。
                  </p>
                );
              }

              return (
                <Alert variant="warning">
                  <CircleAlert />
                  <AlertTitle>无法删除该用户</AlertTitle>
                  <AlertDescription>
                    {reasons}
                  </AlertDescription>
                </Alert>
              );
            })()}

            {/* 信息卡片：合并三项内容到统一卡片，行间用细分割线 */}
            <div className="rounded-[4px] border border-[#E5E5E5] bg-white divide-y divide-[#F5F5F5]">
              {/* 用户 ID */}
              <div className="px-4 py-3 flex items-center justify-between gap-4">
                <Label className="text-xs font-medium text-[#525252]">用户 ID</Label>
                <span className="text-sm text-[#0A0A0A] truncate">{deleteCheckDialog?.memberId}</span>
              </div>

              {/* 名下 Agent 数量 */}
              <div className="px-4 py-3 flex items-center justify-between gap-4">
                <Label className="text-xs font-medium text-[#525252]">名下 Agent 数量</Label>
                <div className="flex items-center gap-2">
                  {deleteCheckDialog?.clawRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#A3A3A3]" />
                  ) : (
                    <span className={`text-sm ${(deleteCheckDialog?.clawCount ?? 0) > 0 ? "text-[#DC2626] font-medium" : "text-[#0A0A0A]"}`}>
                      {deleteCheckDialog?.clawCount ?? 0} 个
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="刷新"
                    className="text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors"
                    onClick={() => {
                      if (!deleteCheckDialog) return;
                      setDeleteCheckDialog({ ...deleteCheckDialog, clawRefreshing: true });
                      setTimeout(() => {
                        const newCount = Math.random() > 0.5 ? deleteCheckDialog.clawCount : 0;
                        setDeleteCheckDialog({ ...deleteCheckDialog, clawCount: newCount, clawRefreshing: false });
                      }, 1200);
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 私有网络（仅自动分配 VPC 时展示） */}
              {deleteCheckDialog?.vpcType === "auto" && (
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <Label className="text-xs font-medium text-[#525252]">私有网络</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#0A0A0A]">
                      <a
                        href="https://console.cloud.tencent.com/vpc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1447E6] hover:underline"
                      >
                        {deleteCheckDialog?.vpcName}
                      </a>
                      {deleteCheckDialog?.vpcRefreshing ? (
                        <span className="text-[#A3A3A3] ml-1">(检查中...)</span>
                      ) : deleteCheckDialog?.hasVpcResources ? (
                        <span className="text-[#DC2626] ml-1">(有关联云资源)</span>
                      ) : (
                        <span className="text-[#0A0A0A] ml-1">(无关联资源)</span>
                      )}
                    </span>
                    <button
                      type="button"
                      aria-label="刷新"
                      className="text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors"
                      onClick={() => {
                        if (!deleteCheckDialog) return;
                        setDeleteCheckDialog({ ...deleteCheckDialog, vpcRefreshing: true });
                        setTimeout(() => {
                          const newHasResources = Math.random() > 0.5 ? deleteCheckDialog.hasVpcResources : false;
                          setDeleteCheckDialog({ ...deleteCheckDialog, hasVpcResources: newHasResources, vpcRefreshing: false });
                        }, 1200);
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCheckDialog(null)}>取消</Button>
            {/* 所有条件满足时才显示确认删除按钮 */}
            {(deleteCheckDialog?.clawCount ?? 0) === 0 &&
              (deleteCheckDialog?.vpcType === "custom" || deleteCheckDialog?.hasVpcResources === false) && (
                <Button
                  variant="destructive"
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

      {/* Disable Confirm - 警示弹窗 */}
      <AlertDialog
        open={!!disableConfirmDialog?.open}
        onOpenChange={(open) => { if (!open) setDisableConfirmDialog(null); }}
      >
        <AlertDialogContent className="sm:max-w-[560px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setDisableConfirmDialog(null)}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">禁用用户</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <Alert variant="warning">
                  <CircleAlert />
                  <AlertTitle>禁用后将产生以下影响</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>该用户将<span className="font-medium">无法再登录</span>用户端</li>
                      <li>名下所有 Agent 云服务器<span className="font-medium">关机</span>（数据不删除）</li>
                      <li>用户将<span className="font-medium">无法与 Agent 机器人对话</span></li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <div className="rounded-[4px] border border-[#E5E5E5] bg-white divide-y divide-[#F5F5F5]">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#525252]">用户 ID</span>
                    <span className="text-sm font-medium text-[#0A0A0A]">{disableConfirmDialog?.memberId}</span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#525252]">名下 Agent 数量</span>
                    <span className="text-sm font-semibold text-[#0A0A0A]">{disableConfirmDialog?.clawCount ?? 0} 个</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDisableConfirmDialog(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDisable(disableConfirmDialog!.memberId)}
              className="bg-[#d42a1e] hover:bg-[#b91c1c] text-white"
            >
              确认禁用
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enable Confirm Dialog */}
      <Dialog
        open={!!enableConfirmDialog?.open}
        onOpenChange={(open) => { if (!open) setEnableConfirmDialog(null); }}
      >
        <DialogContent className="sm:max-w-[560px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>启用用户</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="rounded-[4px] bg-[#fafafa] border border-[#e5e5e5] px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-[#737373]">用户 ID</span>
              <span className="text-sm font-medium text-[#09090b]">{enableConfirmDialog?.memberId}</span>
            </div>
            <div className="rounded-[4px] bg-[#fafafa] border border-[#e5e5e5] px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-[#737373]">名下 Agent 数量</span>
              <span className="text-sm font-semibold text-gray-800">{enableConfirmDialog?.clawCount ?? 0} 个</span>
            </div>
            <div className="rounded-[4px] bg-green-50 border border-green-300 px-4 py-3 text-sm text-green-700 space-y-2">
              <p className="font-medium">启用后将产生以下影响：</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>该用户可以<span className="font-semibold">继续登录</span>用户端</li>
                <li>名下所有 Agent 云服务器将<span className="font-semibold">开机</span>，恢复运行</li>
                <li>用户可以<span className="font-semibold">恢复与 Agent 机器人对话</span></li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnableConfirmDialog(null)}>取消</Button>
            <Button
              variant="dialog-confirm"
              onClick={() => handleEnable(enableConfirmDialog!.memberId)}
            >
              确认启用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm - 警示弹窗（二次确认 - 列出将删除的资源） */}
      <AlertDialog
        open={!!deleteConfirmDialog?.open}
        onOpenChange={(open) => { if (!open) setDeleteConfirmDialog(null); }}
      >
        <AlertDialogContent className="sm:max-w-[560px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setDeleteConfirmDialog(null)}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">确认删除用户</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-[#0A0A0A]">以下资源将被删除：</p>
                <Alert variant="warning">
                  <CircleAlert />
                  <AlertTitle>受影响的资源</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>用户账号：<span className="font-medium">{deleteConfirmDialog?.memberId}</span></li>
                      {deleteConfirmDialog?.vpcType === "auto" && deleteConfirmDialog?.vpcName && (
                        <li>私有网络：<span className="font-medium">{deleteConfirmDialog.vpcName}</span></li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-[#DC2626]">删除后无法恢复，请谨慎确认。</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmDialog(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirmDialog!.memberId)}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 存量 Agent 实例处理弹窗 */}
      <Dialog open={!!agentInstanceDialog?.open} onOpenChange={(open) => { if (!open) setAgentInstanceDialog(null); }}>
        <DialogContent className="sm:max-w-[720px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>存量 Agent 实例处理</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-[#525252]">
              该用户在以下分组中创建了 Agent 实例，用户已从这些分组中移除，请选择如何处理存量实例：
            </p>
            <div className="rounded-[4px] border border-[#e5e5e5] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white">
                    <th className="text-left px-3 py-2 font-medium text-[#737373]">用户 ID</th>
                    <th className="text-left px-3 py-2 font-medium text-[#737373]">Agent 实例名称 / ID</th>
                    <th className="text-left px-3 py-2 font-medium text-[#737373]">分组</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {agentInstanceDialog?.agents.flatMap((a) =>
                    a.instances.map((inst) => (
                      <tr key={inst.id}>
                        <td className="px-3 py-2 text-[#525252]">{agentInstanceDialog.userId}</td>
                        <td className="px-3 py-2 text-[#525252]">{inst.name}<span className="text-[#A3A3A3] ml-1">({inst.id})</span></td>
                        <td className="px-3 py-2 text-[#525252]">{a.groupName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="py-2 space-y-2">
            <p className="text-xs font-medium text-[#525252] mb-1">处理方式</p>
            {[
              { value: "keep", title: "保留原配置", desc: "存量 Agent 实例保留在原分组名下，可继续使用原分组的配置和权限，但无法在原分组创建新的 Agent" },
              { value: "delete", title: "删除实例", desc: "确认后将跳转到 Agent 列表页面，系统会帮您自动筛选出这些实例，您可以全选并批量删除" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-2.5 p-3 rounded-[4px] border cursor-pointer transition-colors ${agentInstanceChoice === opt.value ? "border-blue-300 bg-[#eff4ff]/50" : "border-[#e5e5e5] hover:border-gray-300"}`}
                onClick={() => setAgentInstanceChoice(opt.value as "keep" | "delete")}
              >
                <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${agentInstanceChoice === opt.value ? "border-blue-500" : "border-gray-300"}`}>
                  {agentInstanceChoice === opt.value && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#09090b]">{opt.title}</p>
                  <p className="text-xs text-[#737373] mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentInstanceDialog(null)}>取消</Button>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                agentInstanceDialog?.pendingAction();
                setAgentInstanceDialog(null);
                if (agentInstanceChoice === "delete") {
                  const ids = agentInstanceDialog?.agents.flatMap(a => a.instances.map(i => i.id)).join(",") ?? "";
                  window.location.href = `/admin/openclaw-monitor?filter=pending-delete&ids=${ids}`;
                }
              }}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 同步后存量 Agent 实例处理弹窗 */}
      <Dialog open={!!syncAgentInstanceDialog?.open} onOpenChange={(open) => { if (!open) setSyncAgentInstanceDialog(null); }}>
        <DialogContent className="sm:max-w-[720px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>存量 Agent 实例处理</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-[#525252]">
              本次同步导致部分用户被移除分组或上级分组发生变更，以下用户在原分组中创建了 Agent 实例，请选择如何处理存量实例：
            </p>
            <div className="rounded-[4px] border border-[#e5e5e5] overflow-hidden max-h-[200px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#fafafa] sticky top-0">
                    <th className="text-left px-3 py-2 font-medium text-[#737373]">用户 ID</th>
                    <th className="text-left px-3 py-2 font-medium text-[#737373]">Agent 实例名称 / ID</th>
                    <th className="text-left px-3 py-2 font-medium text-[#737373]">分组</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {syncAgentInstanceDialog?.agents.map((a) => (
                    <tr key={a.instanceId}>
                      <td className="px-3 py-2 text-[#525252]">{a.userId}</td>
                      <td className="px-3 py-2 text-[#525252]">{a.instanceName}<span className="text-[#A3A3A3] ml-1">({a.instanceId})</span></td>
                      <td className="px-3 py-2 text-[#525252]">{a.groupName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="py-2 space-y-2">
            <p className="text-xs font-medium text-[#525252] mb-1">处理方式</p>
            {[
              { value: "keep", title: "保留原配置", desc: "存量 Agent 实例保留在原分组名下，可继续使用原分组的配置和权限，但无法在原分组创建新的 Agent" },
              { value: "delete", title: "删除实例", desc: "确认后将跳转到 Agent 列表页面，系统会帮您自动筛选出这些实例，您可以全选并批量删除" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-2.5 p-3 rounded-[4px] border cursor-pointer transition-colors ${syncAgentInstanceChoice === opt.value ? "border-blue-300 bg-[#eff4ff]/50" : "border-[#e5e5e5] hover:border-gray-300"}`}
                onClick={() => setSyncAgentInstanceChoice(opt.value as "keep" | "delete")}
              >
                <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${syncAgentInstanceChoice === opt.value ? "border-blue-500" : "border-gray-300"}`}>
                  {syncAgentInstanceChoice === opt.value && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#09090b]">{opt.title}</p>
                  <p className="text-xs text-[#737373] mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncAgentInstanceDialog(null)}>取消</Button>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                setSyncAgentInstanceDialog(null);
                if (syncAgentInstanceChoice === "delete") {
                  const ids = syncAgentInstanceDialog?.agents.map(a => a.instanceId).join(",") ?? "";
                  window.location.href = `/admin/openclaw-monitor?filter=pending-delete&ids=${ids}`;
                }
              }}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建分组 Dialog */}
      <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>新建分组</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[#525252]">上级分组</Label>
                <Select value={newGroupParentId ?? "__root__"} onValueChange={(v) => setNewGroupParentId(v === "__root__" ? null : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__root__">无（顶层分组）</SelectItem>
                    {(hasOneid ? MM_MOCK_GROUPS : MM_MOCK_MANUAL_GROUPS).map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[#525252]">
                  分组名称<span className="text-[#DC2626] ml-0.5">*</span>
                </Label>
                <div
                  className="w-full flex items-center h-9 bg-white border border-[#d3d6db] rounded-[4px] focus-within:border-[#355EF1] transition-colors cursor-text overflow-hidden"
                  onClick={(e) => {
                    const inp = (e.currentTarget as HTMLDivElement).querySelector('input');
                    inp?.focus();
                  }}
                >
                  {newGroupParentId && (
                    <span className="pl-3 text-sm text-[#525252] whitespace-nowrap shrink-0 max-w-[40%] truncate select-none pointer-events-none">
                      {(hasOneid ? MM_MOCK_GROUPS : MM_MOCK_MANUAL_GROUPS).find((g) => g.id === newGroupParentId)?.name} /
                    </span>
                  )}
                  <input
                    placeholder="请输入分组名称"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateGroup(); }}
                    className="flex-1 min-w-0 h-full px-3 text-sm bg-transparent outline-none text-[#020617] placeholder:text-[#b0b6c3]"
                    style={{ paddingLeft: newGroupParentId ? "4px" : undefined }}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-[#737373]">分组名称为唯一标识，不能与已有分组重名，创建后支持修改</p>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateGroupDialog(false)}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleCreateGroup}>确认创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除分组确认 Dialog */}
      <Dialog open={!!deleteGroupDialog?.open} onOpenChange={(open) => { if (!open) setDeleteGroupDialog(null); }}>
        <DialogContent className="sm:max-w-[560px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>删除分组</DialogTitle>
          </DialogHeader>
          {(() => {
            const configs = deleteGroupDialog ? (MOCK_GROUP_CONFIGS[deleteGroupDialog.groupId] || []) : [];
            const hasRelatedConfigs = configs.some((c) => c.items.length > 0);
            return (
              <div className="py-2 space-y-3">
                <div className="rounded-[4px] bg-[#fafafa] border border-[#e5e5e5] px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-[#737373]">分组名称</span>
                  <span className="text-sm font-medium text-[#09090b]">{deleteGroupDialog?.groupName}</span>
                </div>
                <div className="rounded-[4px] bg-[#fafafa] border border-[#e5e5e5] px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-[#737373]">分组内用户数</span>
                  <span className="text-sm font-semibold text-gray-800">{deleteGroupDialog?.memberCount ?? 0} 人</span>
                </div>

                {/* 已应用配置 */}
                <div className="rounded-[4px] bg-[#fafafa] border border-[#e5e5e5] px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#737373]">已应用配置</span>
                    <button
                      className="text-[#A3A3A3] hover:text-blue-500 transition-colors"
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
                        <StatusTag mode="fill" key={c.type} variant="gray">{c.type}({c.items.length})</StatusTag>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-green-600">无关联配置</span>
                  )}
                </div>

                {/* 状态提示 */}
                {hasRelatedConfigs ? (
                  <div className="rounded-[4px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 space-y-2">
                    <p className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />以上配置的应用范围包含该分组，请先前往对应配置页面移除该分组后再执行删除。</p>
                    <p className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />删除分组后，组内用户不会被删除，仅解除分组关联。</p>
                  </div>
                ) : (
                  <div className="rounded-[4px] bg-green-50 border border-green-300 px-4 py-3 text-sm text-green-700">
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
                <Button variant="destructive" onClick={() => deleteGroupDialog && handleDeleteGroup(deleteGroupDialog.groupId)}>
                  确认删除
                </Button>
              );
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 从分组中移除确认 AlertDialog —— 遵循项目标准警示弹窗规范：
            - 标题黑色，正文黑色，强调字段告警色
            - 警示信息使用 Alert destructive 变体（位于内容区最上方）
            - 主按钮使用 destructive variant
            - 右上角带 X 关闭按钮
       */}
      <AlertDialog open={!!removeFromGroupDialog?.open} onOpenChange={(open) => { if (!open) setRemoveFromGroupDialog(null); }}>
        <AlertDialogContent className="sm:max-w-[560px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setRemoveFromGroupDialog(null)}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">从分组中移除</AlertDialogTitle>
          </AlertDialogHeader>

          {/* 警示提示 - Alert 位于内容区最上方 */}
          <Alert variant="warning">
            <CircleAlert />
            <AlertDescription>
              移除后，该用户在此分组下的可见范围和权限将被收回。用户不会被删除，
              <span className="font-medium">仅解除与该分组的关联</span>。
            </AlertDescription>
          </Alert>

          {/* 信息卡 */}
          <div className="rounded-[4px] border border-[#E5E5E5] bg-white px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#525252]">用户 ID</span>
              <span className="text-sm font-medium text-[#0A0A0A]">{removeFromGroupDialog?.memberId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#525252]">分组名称</span>
              <span className="text-sm font-medium text-[#0A0A0A]">{removeFromGroupDialog?.groupName}</span>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveFromGroupDialog(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeFromGroupDialog) {
                  handleRemoveFromGroup(removeFromGroupDialog.groupId, removeFromGroupDialog.memberId);
                  setRemoveFromGroupDialog(null);
                }
              }}
            >
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 添加用户到分组 Dialog */}
      <Dialog open={showAddToGroupDialog} onOpenChange={(open) => { if (!open) { setShowAddToGroupDialog(false); setAddToGroupSearch(""); setAddToGroupSelected([]); setAddToGroupDeptFilter(""); } }}>
        <DialogContent
          className="sm:max-w-[720px]"
          style={{ height: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>添加用户到「{groups.find((g) => g.id === selectedGroupId)?.name || ""}」</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex-1">
            <div className="space-y-4">
              {/* 单分组规则提示 */}
              <Alert variant="info">
                <AlertInfoIcon />
                <AlertDescription>
                  一个用户支持加入多个分组，可按分组设置不同的配置与权限
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-2">
                {hasOneid && (
                  <DepartmentFilter
                    departments={MOCK_DEPARTMENTS}
                    value={addToGroupDeptFilter}
                    onChange={setAddToGroupDeptFilter}
                  />
                )}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                  <Input
                    placeholder="搜索用户 ID..."
                    value={addToGroupSearch}
                    onChange={(e) => setAddToGroupSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>

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

                return (
                  <div className="border border-[#E5E5E5] rounded-[4px] overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-10"></TableHead>
                          <TableHead>用户 ID</TableHead>
                          {hasOneid && <TableHead>所属部门</TableHead>}
                          <TableHead>当前分组</TableHead>
                          <TableHead className="w-24">角色</TableHead>
                          <TableHead className="w-20">状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchFiltered.length === 0 ? (
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={hasOneid ? 6 : 5} className="text-center text-xs text-[#A3A3A3] py-6">
                              没有可添加的用户
                            </TableCell>
                          </TableRow>
                        ) : (
                          searchFiltered.map((m) => {
                            const isInCurrentGroup = currentGroup?.memberIds.includes(m.id) ?? false;
                            const otherGroup = groups.find((g) => g.id !== selectedGroupId && g.memberIds.includes(m.id));
                            const isInOtherGroup = !!otherGroup;
                            const isDisabled = isInCurrentGroup || isInOtherGroup;
                            const memberGroupNames = groups.filter((g) => g.memberIds.includes(m.id)).map((g) => g.name);
                            const groupDisplay = memberGroupNames.length === 0 ? "未分组" : memberGroupNames[0];
                            const tooltipText = isInCurrentGroup ? "该用户已在当前分组" : isInOtherGroup ? "该用户已在其他分组" : "";
                            const isChecked = isInCurrentGroup || addToGroupSelected.includes(m.id);
                            const onToggle = () => {
                              if (isDisabled) return;
                              setAddToGroupSelected((prev) =>
                                prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                              );
                            };
                            const row = (
                              <TableRow
                                key={m.id}
                                onClick={onToggle}
                                className={isDisabled ? "opacity-50 cursor-not-allowed bg-[#FAFAFA] hover:bg-[#FAFAFA]" : "cursor-pointer"}
                              >
                                <TableCell className="w-10">
                                  <Checkbox
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onCheckedChange={onToggle}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </TableCell>
                                <TableCell className="text-sm text-[#0A0A0A]">{m.id}</TableCell>
                                {hasOneid && (
                                  <TableCell className="text-xs text-[#737373]">
                                    {MOCK_MEMBER_DEPARTMENTS[m.id] || "-"}
                                  </TableCell>
                                )}
                                <TableCell className="text-xs text-[#737373]">{groupDisplay}</TableCell>
                                <TableCell className="w-24">
                                  <StatusTag preset={m.role === "admin" ? "role-admin" : "role-user"} />
                                </TableCell>
                                <TableCell className="w-20">
                                  {m.status === "active" ? (
                                    <StatusTag mode="dot" variant="green">正常</StatusTag>
                                  ) : (
                                    <StatusTag mode="dot" variant="red">禁用</StatusTag>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                            return isDisabled ? (
                              <Tooltip key={m.id}>
                                <TooltipTrigger asChild>{row}</TooltipTrigger>
                                <TooltipContent>{tooltipText}</TooltipContent>
                              </Tooltip>
                            ) : row;
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}

              {addToGroupSelected.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#737373]">已选择 {addToGroupSelected.length} 名用户</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setAddToGroupSelected([])}
                  >
                    清除筛选
                  </Button>
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddToGroupDialog(false); setAddToGroupSearch(""); setAddToGroupSelected([]); setAddToGroupDeptFilter(""); }}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleAddMembersToGroup} disabled={addToGroupSelected.length === 0}>
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auth Source Import Dialog（OneID 模式下不渲染） */}
      {!hasOneid && (
        <AuthSourceImportDialog
          open={showAuthSourceDialog}
          onOpenChange={(o) => {
            setShowAuthSourceDialog(o);
            if (!o) {
              // 关闭弹窗时重置初始参数
              setAuthSourceInitialStep(undefined);
              setAuthSourceInitialId(null);
              setAuthSourceInitialFormValues(null);
            }
          }}
          initialStep={authSourceInitialStep}
          initialSourceId={authSourceInitialId}
          initialFormValues={authSourceInitialFormValues}
          onComplete={(source) => {
            // 避免重复添加同一数据源
            setConfiguredAuthSources((prev) => {
              const exists = prev.find((s) => s.id === source.id);
              if (exists) {
                return prev.map((s) => s.id === source.id ? source : s);
              }
              return [...prev, source];
            });
          }}
        />
      )}

      {/* Auth Source Delete Confirm Dialog（OneID 模式下不渲染） */}
      {!hasOneid && (
        <Dialog
          open={!!deleteAuthSourceConfirm?.open}
          onOpenChange={(open) => { if (!open) setDeleteAuthSourceConfirm(null); }}
        >
        <DialogContent className="sm:max-w-[560px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>删除数据源</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            {deleteAuthSourceConfirm?.source && (
              <div className="flex items-center gap-3 rounded-[4px] bg-[#fafafa] border border-[#e5e5e5] px-4 py-3">
                <div className="w-8 h-8 rounded-[4px] bg-white border border-[#e5e5e5] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={deleteAuthSourceConfirm.source.iconUrl}
                    alt={deleteAuthSourceConfirm.source.name}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#09090b]">{deleteAuthSourceConfirm.source.name}</p>
                  <p className="text-xs text-[#737373]">{deleteAuthSourceConfirm.source.description}</p>
                </div>
              </div>
            )}
            <div className="rounded-[4px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 space-y-1.5">
              <p className="font-medium">确定要删除该数据源吗？</p>
              <p className="text-xs text-red-500 leading-relaxed">删除后，通过该数据源同步的用户数据将不再自动更新，已同步的用户不受影响。</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAuthSourceConfirm(null)}>取消</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteAuthSourceConfirm?.source) {
                  setConfiguredAuthSources(configuredAuthSources.filter((s) => s.id !== deleteAuthSourceConfirm.source.id));
                  toast.success(`已删除数据源：${deleteAuthSourceConfirm.source.name}`);
                }
                setDeleteAuthSourceConfirm(null);
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </>
  );
}
