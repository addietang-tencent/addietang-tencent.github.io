/**
 * MemberManagement - 管控端成员管理页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
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
  Trash2, Key, UserX, UserCheck, MoreHorizontal
} from "lucide-react";

const MOCK_MEMBERS = [
  { id: "alice@acompany.com", role: "admin", status: "active", clawLimit: 5, tokenLimit: 100000, clawCount: 3, joinTime: "2025-01-10" },
  { id: "bob@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 1, joinTime: "2025-02-15" },
  { id: "carol@acompany.com", role: "member", status: "active", clawLimit: 3, tokenLimit: 50000, clawCount: 2, joinTime: "2025-03-01" },
  { id: "david@acompany.com", role: "member", status: "disabled", clawLimit: 3, tokenLimit: 50000, clawCount: 0, joinTime: "2025-03-20" },
  { id: "eve@acompany.com", role: "member", status: "active", clawLimit: 5, tokenLimit: 80000, clawCount: 4, joinTime: "2025-04-05" },
];

const LAST_CLAW_LIMIT = 3;
const LAST_TOKEN_LIMIT = 50000;

export default function MemberManagement() {
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({
    id: "", role: "member", clawLimit: LAST_CLAW_LIMIT, tokenLimit: LAST_TOKEN_LIMIT,
    passwordMode: "random" as "random" | "custom",
    customPassword: "",
    sendNotification: false,
    notificationEmail: "",
  });

  const filtered = members.filter((m) =>
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newMember.id.trim()) { toast.error("请输入成员 ID"); return; }
    if (newMember.passwordMode === "custom" && !newMember.customPassword.trim()) { toast.error("请输入指定密码"); return; }
    setMembers([...members, {
      id: newMember.id, role: newMember.role, status: "active",
      clawLimit: newMember.clawLimit, tokenLimit: newMember.tokenLimit,
      clawCount: 0, joinTime: new Date().toISOString().slice(0, 10),
    }]);
    setShowAddDialog(false);
    setNewMember({ id: "", role: "member", clawLimit: LAST_CLAW_LIMIT, tokenLimit: LAST_TOKEN_LIMIT, passwordMode: "random", customPassword: "", sendNotification: false, notificationEmail: "" });
    toast.success("成员已添加");
  };

  const handleToggleStatus = (id: string) => {
    setMembers(members.map((m) =>
      m.id === id ? { ...m, status: m.status === "active" ? "disabled" : "active" } : m
    ));
    toast.success("状态已更新");
  };

  const handleDelete = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    toast.success("成员已删除");
  };

  return (
    <AdminLayout>
      <div className="page-enter">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">成员管理</h1>
            <p className="text-sm text-gray-500 mt-1">管理企业成员的访问权限和资源配额</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                <Plus className="w-4 h-4 mr-1.5" />
                添加成员
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
        <div className="bg-white rounded-2xl border border-gray-100 mb-5 p-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索成员 ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="flex items-center gap-1.5">
                    成员 ID
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>企业成员的唯一 ID，例如企业邮箱或企业成员唯一名称</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">角色</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">状态</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="flex items-center gap-1.5">
                    OpenClaw 上限
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>单个企业成员最多可以创建的 OpenClaw 数量</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="flex items-center gap-1.5">
                    每日 Tokens 上限
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>单个企业成员每日最多可消耗的 Tokens 数量</TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">加入时间</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{member.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={member.role === "admin" ? "border-blue-200 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500"}>
                      {member.role === "admin" ? "管理员" : "成员"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {member.status === "active" ? (
                      <span className="badge-running text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        正常
                      </span>
                    ) : (
                      <span className="badge-stopped text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                        已禁用
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{member.clawCount} / {member.clawLimit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{member.tokenLimit.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{member.joinTime}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-500 hover:text-blue-600"
                        onClick={() => { setShowResetDialog(member.id); }}
                      >
                        <Key className="w-3.5 h-3.5 mr-1" />
                        重置密码
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-500 hover:text-orange-600"
                        onClick={() => handleToggleStatus(member.id)}
                      >
                        {member.status === "active" ? (
                          <><UserX className="w-3.5 h-3.5 mr-1" />禁用</>
                        ) : (
                          <><UserCheck className="w-3.5 h-3.5 mr-1" />启用</>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        删除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            共 {filtered.length} 名成员
          </div>
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加成员</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-6">

            {/* 第一大块：成员信息 */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">成员信息</p>
              <div className="space-y-4">
                {/* 成员 ID */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    成员 ID
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default inline-flex">
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>填写企业成员的唯一 ID，例如企业邮箱或企业成员唯一名称，作为企业成员登录员工端的账号</TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    placeholder="例如：alice@acompany.com"
                    value={newMember.id}
                    onChange={(e) => setNewMember({ ...newMember, id: e.target.value })}
                    className="bg-gray-50"
                  />
                </div>

                {/* 成员角色 */}
                <div className="space-y-2">
                  <Label>成员角色</Label>
                  <Select value={newMember.role} onValueChange={(v) => setNewMember({ ...newMember, role: v })}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">成员</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 密码 */}
                <div className="space-y-2">
                  <Label>密码</Label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full">
                    <button
                      onClick={() => setNewMember({ ...newMember, passwordMode: "random" })}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        newMember.passwordMode === "random"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      随机密码
                    </button>
                    <button
                      onClick={() => setNewMember({ ...newMember, passwordMode: "custom" })}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        newMember.passwordMode === "custom"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      指定密码
                    </button>
                  </div>
                  {newMember.passwordMode === "custom" && (
                    <Input
                      type="password"
                      placeholder="请输入指定密码"
                      value={newMember.customPassword}
                      onChange={(e) => setNewMember({ ...newMember, customPassword: e.target.value })}
                      className="bg-gray-50"
                    />
                  )}
                </div>

                {/* 信息发送 */}
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
                  <Input
                    type="email"
                    placeholder="选填，输入成员接收账号密码的邮箱地址"
                    value={newMember.notificationEmail}
                    onChange={(e) => setNewMember({ ...newMember, notificationEmail: e.target.value })}
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-100" />

            {/* 第二大块：成员配额 */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">成员配额</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    OpenClaw 数量上限
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>单个企业成员最多可以创建的 OpenClaw 数量</TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    value={newMember.clawLimit}
                    onChange={(e) => setNewMember({ ...newMember, clawLimit: Number(e.target.value) })}
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    每日 Tokens 数量上限
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>单个企业成员每日最多可消耗的 Tokens 数量</TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    value={newMember.tokenLimit}
                    onChange={(e) => setNewMember({ ...newMember, tokenLimit: Number(e.target.value) })}
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button onClick={handleAdd} style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Import Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>批量导入成员</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">请下载模板，填写成员信息后上传</p>
            <Button variant="outline" className="w-full" onClick={() => toast.success("模板已下载")}>
              <Download className="w-4 h-4 mr-2" />
              下载导入模板
            </Button>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">点击上传 Excel / CSV 文件</span>
              <input type="file" accept=".xlsx,.csv" className="hidden"
                onChange={() => { setShowBatchDialog(false); toast.success("成员已批量导入"); }} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDialog(false)}>取消</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!showResetDialog} onOpenChange={() => setShowResetDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 py-2">
            确认重置成员 <span className="font-medium text-gray-900">{showResetDialog}</span> 的密码？
            重置后系统将生成随机密码并发送给该成员。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(null)}>取消</Button>
            <Button onClick={() => { setShowResetDialog(null); toast.success("密码已重置，新密码已发送给成员"); }}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
