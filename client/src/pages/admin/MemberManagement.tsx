/**
 * MemberManagement - 管控端用户管理页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 */
import React, { useState, useEffect } from "react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Search, Plus, ChevronDown, Info, Upload, Download,
  Trash2, UserX, UserCheck, MoreHorizontal, Pencil, Key,
  ChevronLeft, ChevronRight, Copy, CheckCircle, AlertTriangle,
  Loader2, X, FileText,
} from "lucide-react";

const PAGE_SIZE = 10;

// 生成更多 mock 数据以演示翻页
const MOCK_MEMBERS_BASE = [
  { id: "alice@acompany.com", role: "admin", status: "active", clawLimit: 5, tokenLimit: 100000, clawCount: 3, joinTime: "2025-01-10" },
  { id: "bob@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-02-15" },
  { id: "carol@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 2, joinTime: "2025-03-01" },
  { id: "david@acompany.com", role: "member", status: "disabled", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-03-20" },
  { id: "eve@acompany.com", role: "member", status: "active", clawLimit: 5, tokenLimit: 80000, clawCount: 4, joinTime: "2025-04-05" },
  { id: "frank@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-04-12" },
  { id: "grace@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 2, joinTime: "2025-05-01" },
  { id: "henry@acompany.com", role: "member", status: "disabled", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-05-18" },
  { id: "iris@acompany.com", role: "member", status: "active", clawLimit: 5, tokenLimit: 80000, clawCount: 3, joinTime: "2025-06-02" },
  { id: "jack@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-06-20" },
  { id: "kate@acompany.com", role: "admin", status: "active", clawLimit: 5, tokenLimit: 100000, clawCount: 2, joinTime: "2025-07-05" },
  { id: "leo@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-07-22" },
];

const LAST_CLAW_LIMIT = 3;
const LAST_TOKEN_LIMIT = 50000;

/** 生成随机密码，格式 Oc@xxxxxxxx */
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
  notificationEmail: "",
};

const emptyEditForm = {
  id: "", role: "member", clawLimit: LAST_CLAW_LIMIT, tokenLimit: LAST_TOKEN_LIMIT,
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
}: {
  values: typeof emptyNewMember;
  onChange: (v: typeof emptyNewMember) => void;
  existingMemberIds?: string[];
}) {
  const [clawStr, setClawStr] = React.useState<string>(String(values.clawLimit));
  const [idError, setIdError] = React.useState<string>("");

  React.useEffect(() => {
    setClawStr(String(values.clawLimit));
  }, [values.clawLimit]);

  // 检查成员ID是否已存在
  const handleIdBlur = () => {
    if (values.id.trim() && existingMemberIds.includes(values.id.trim())) {
      setIdError("成员ID已存在，请使用其他ID");
    } else {
      setIdError("");
    }
  };

  return (
    <div className="py-2 space-y-6">
      {/* 第一大块：用户信息 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">用户信息</p>
        <div className="space-y-4">
          {/* 用户 ID */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              用户 ID
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
                setIdError(""); // 清除错误提示
              }}
              onBlur={handleIdBlur}
              className={`bg-gray-50 ${
                idError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
              }`}
            />
            {idError && (
              <p className="text-xs text-red-500 font-medium">{idError}</p>
            )}
          </div>

          {/* 用户角色 */}
          <div className="space-y-2">
            <Label>用户角色</Label>
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

          {/* 信息发送 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              （选填）信息发送
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>信息发送会产生额外的短信/邮件费用，合并到腾讯云账单计费</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="email"
              placeholder="输入用户接收账号密码的邮箱地址"
              value={values.notificationEmail}
              onChange={(e) => onChange({ ...values, notificationEmail: e.target.value })}
              className="bg-gray-50"
            />
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

// ─── 编辑用户表单（无密码、无信息发送，成员ID只读） ──────────────────────────
function EditMemberFormFields({
  values,
  onChange,
  isInitialAdmin = false,
}: {
  values: typeof emptyEditForm;
  onChange: (v: typeof emptyEditForm) => void;
  isInitialAdmin?: boolean;
}) {
  const [clawStr, setClawStr] = React.useState<string>(String(values.clawLimit));

  React.useEffect(() => {
    setClawStr(String(values.clawLimit));
  }, [values.clawLimit]);

  return (
    <div className="py-2 space-y-6">
      {/* 第一大块：用户信息 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">用户信息</p>
        <div className="space-y-4">
          {/* 用户 ID - 只读 */}
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

          {/* 用户角色 */}
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
              autoFocus
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
  const [members, setMembers] = useState(MOCK_MEMBERS_BASE);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isInitialAdminEdit, setIsInitialAdminEdit] = useState(false);

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
  const [deleteCheckDialog, setDeleteCheckDialog] = useState<{ open: boolean; memberId: string; clawCount: number } | null>(null);
  // 二次确认弹窗
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; memberId: string } | null>(null);
  // 禁用确认弹窗（新：所有用户均可禁用，只需二次确认）
  const [disableConfirmDialog, setDisableConfirmDialog] = useState<{ open: boolean; memberId: string; clawCount: number } | null>(null);
  // 启用确认弹窗
  const [enableConfirmDialog, setEnableConfirmDialog] = useState<{ open: boolean; memberId: string; clawCount: number } | null>(null);

  const filtered = sortedMembers.filter((m) =>
    m.id.toLowerCase().includes(search.toLowerCase())
  );
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
    }]);
    setShowAddDialog(false);
    setNewMember({ ...emptyNewMember });
    // 显示创建成功弹窗
    setCredentialDialog({ open: true, title: "成员已创建", memberId: newMember.id, password: pwd });
  };

  const openEditDialog = (member: typeof MOCK_MEMBERS_BASE[0]) => {
    setEditForm({
      id: member.id,
      role: member.role,
      clawLimit: member.clawLimit,
      tokenLimit: member.tokenLimit,
    });
    setIsInitialAdminEdit(member.id === initialAdminId);
    setEditMemberId(member.id);
  };

  const handleEdit = () => {
    setMembers(members.map((m) =>
      m.id === editMemberId
        ? { ...m, role: editForm.role, clawLimit: editForm.clawLimit, tokenLimit: editForm.tokenLimit }
        : m
    ));
    setEditMemberId(null);
    toast.success("用户信息已更新");
  };

  const handleToggleStatus = (id: string) => {
    setMembers(members.map((m) =>
      m.id === id ? { ...m, status: m.status === "active" ? "disabled" : "active" } : m
    ));
    toast.success("状态已更新");
  };

  const openDeleteCheck = (member: typeof MOCK_MEMBERS_BASE[0]) => {
    setDeleteCheckDialog({ open: true, memberId: member.id, clawCount: member.clawCount });
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
    // 显示重置成功弹窗
    setCredentialDialog({ open: true, title: "密码已重置", memberId, password: pwd });
  };

  return (
    <>
      <div className="page-enter">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
            <p className="text-sm text-gray-500 mt-1">管理企业用户的访问权限和资源配额</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                <Plus className="w-4 h-4 mr-1.5" />
                添加用户
                <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                单个添加
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowBatchDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                批量导入
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索用户 ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide w-[30%]">
                  <div className="flex items-center gap-1.5">
                    用户 ID
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default inline-flex">
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>企业用户的唯一 ID，例如企业邮箱或企业用户唯一名称</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide w-[9%]">角色</th>
                <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide w-[8%]">状态</th>
                <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide w-[13%] whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    OpenClaw 上限
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default inline-flex">
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>单个企业用户最多可以创建的 OpenClaw 数量</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide w-[15%] whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    每日 Tokens 上限
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default inline-flex">
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>单个企业用户每日最多可消耗的 Tokens 数量</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide w-[11%] whitespace-nowrap">加入时间</th>
                <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide w-[10%]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{member.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className={member.role === "admin" ? "border-blue-200 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500"}>
                      {member.role === "admin" ? "管理员" : "用户"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {member.status === "active" ? (
                      <span className="badge-running text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        正常
                      </span>
                    ) : (
                      <span className="badge-stopped text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        禁用
                      </span>
                    )}
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
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-0.5">
                      {/* 编辑 - 直接展示 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-500 hover:text-blue-600 h-7 px-2"
                        onClick={() => openEditDialog(member)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />编辑
                      </Button>
                      {/* 三点菜单：重置密码 + 禁用/启用 + 删除 */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 h-7 w-7 p-0 !ring-0 !outline-none focus-visible:!ring-0 focus-visible:!border-transparent">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* 重置密码：初始管理员禁用 */}
                          {member.id === initialAdminId ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center px-2 py-1.5 text-xs text-gray-300 cursor-not-allowed select-none rounded-sm">
                                  <Key className="w-3.5 h-3.5 mr-2" />
                                  重置密码
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[220px] text-xs leading-relaxed">
                                初始管理员账号不允许重置密码，如有需要请前往腾讯云云服务器控制台修改
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <DropdownMenuItem className="text-xs text-gray-500 focus:text-gray-700 focus:bg-gray-50" onClick={() => { setShowResetDialog(member.id); setResetForm({ ...emptyResetForm }); }}>
                              <Key className="w-3.5 h-3.5 mr-2" />
                              重置密码
                            </DropdownMenuItem>
                          )}
                          {/* 禁用/启用 */}
                          {member.id === initialAdminId ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center px-2 py-1.5 text-xs text-gray-300 cursor-not-allowed select-none rounded-sm">
                                  <UserX className="w-3.5 h-3.5 mr-2" />
                                  禁用
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="left">初始管理员账号不可禁用</TooltipContent>
                            </Tooltip>
                          ) : member.status === "active" ? (
                            <DropdownMenuItem
                              className="text-xs text-gray-500 focus:text-gray-700 focus:bg-gray-50"
                              onClick={() => openDisableConfirm(member)}
                            >
                              <UserX className="w-3.5 h-3.5 mr-2" />
                              禁用
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-xs text-gray-500 focus:text-gray-700 focus:bg-gray-50"
                              onClick={() => openEnableConfirm(member)}
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-2" />
                              启用
                            </DropdownMenuItem>
                          )}
                          {/* 删除：初始管理员不可删除 */}
                          {member.id === initialAdminId ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center px-2 py-1.5 text-xs text-gray-300 cursor-not-allowed select-none rounded-sm">
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  删除
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="left">初始管理员账号不可删除</TooltipContent>
                            </Tooltip>
                          ) : (
                            <DropdownMenuItem
                              className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => openDeleteCheck(member)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              删除
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 底部：共 N 名用户 + 翻页 */}
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">共 {filtered.length} 名用户</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-500"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 text-xs ${
                      p === currentPage
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-500"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
          </DialogHeader>
          <AddMemberFormFields values={newMember} onChange={setNewMember} existingMemberIds={members.map((m) => m.id)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button onClick={handleAdd} style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editMemberId} onOpenChange={(open) => { if (!open) setEditMemberId(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          <EditMemberFormFields values={editForm} onChange={setEditForm} isInitialAdmin={isInitialAdminEdit} />
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
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 bg-green-50">
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

      {/* Delete Check Dialog */}
      <Dialog
        open={!!deleteCheckDialog?.open}
        onOpenChange={(open) => { if (!open) setDeleteCheckDialog(null); }}
      >
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>删除用户</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm text-gray-600">
              只有当用户名下没有任何 OpenClaw 时，才可以删除用户。
            </p>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">用户 ID</span>
              <span className="text-sm font-medium text-gray-900">{deleteCheckDialog?.memberId}</span>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">名下 OpenClaw 数量</span>
              <span className={`text-sm font-semibold ${
                (deleteCheckDialog?.clawCount ?? 0) > 0 ? "text-red-500" : "text-green-600"
              }`}>
                {deleteCheckDialog?.clawCount ?? 0} 个
              </span>
            </div>
            {(deleteCheckDialog?.clawCount ?? 0) > 0 ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 space-y-1">
                <p className="font-medium">无法删除该用户</p>
                <p>请让用户自行删除所有 OpenClaw，或由管理员在 OpenClaw 监控页手动删除该用户名下的所有 OpenClaw 后，再执行删除操作。</p>
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                该用户名下没有 OpenClaw，可以删除。
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCheckDialog(null)}>取消</Button>
            {(deleteCheckDialog?.clawCount ?? 0) === 0 && (
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  const id = deleteCheckDialog!.memberId;
                  setDeleteCheckDialog(null);
                  setDeleteConfirmDialog({ open: true, memberId: id });
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
                <li>名下所有 OpenClaw 实例将<span className="font-semibold">关机</span>（数据保留，不删除）</li>
                <li>用户将<span className="font-semibold">无法与 AI 机器人对话</span></li>
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
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 space-y-2">
              <p className="font-medium">启用后将产生以下影响：</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>该用户可以<span className="font-semibold">继续登录</span>用户端</li>
                <li>名下所有 OpenClaw 实例将<span className="font-semibold">开机</span>，恢复运行</li>
                <li>用户可以<span className="font-semibold">恢复与 AI 机器人对话</span></li>
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

      {/* Delete Confirm Dialog (二次确认) */}
      <Dialog
        open={!!deleteConfirmDialog?.open}
        onOpenChange={(open) => { if (!open) setDeleteConfirmDialog(null); }}
      >
        <DialogContent className="sm:max-w-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>确认删除用户</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              确定要删除用户 <span className="font-medium text-gray-900">{deleteConfirmDialog?.memberId}</span> 吗？
            </p>
            <p className="text-sm text-red-500 font-medium">此操作不可撤销，删除后该用户将无法登录用户端。</p>
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
    </>
  );
}
