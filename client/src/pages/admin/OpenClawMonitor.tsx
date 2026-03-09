/**
 * OpenClawMonitor - 管控端 OpenClaw 监控页
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Bot, Activity, PowerOff, Trash2 } from "lucide-react";

const MOCK_CLAWS = [
  { id: "1", name: "Alice的助手", creator: "alice@acompany.com", status: "running", createTime: "2025-12-01" },
  { id: "2", name: "Bob工作助手", creator: "bob@acompany.com", status: "running", createTime: "2025-12-15" },
  { id: "3", name: "Carol的研究助手", creator: "carol@acompany.com", status: "stopped", createTime: "2026-01-05" },
  { id: "4", name: "Dave的代码助手", creator: "dave@acompany.com", status: "running", createTime: "2026-01-20" },
  { id: "5", name: "Eve的写作助手", creator: "eve@acompany.com", status: "stopped", createTime: "2026-02-10" },
];

export default function OpenClawMonitor() {
  const [claws, setClaws] = useState(MOCK_CLAWS);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = claws.filter((c) => {
    const matchSearch = !search || c.name.includes(search) || c.creator.includes(search);
    const matchDate = !dateFilter || c.createTime === dateFilter;
    return matchSearch && matchDate;
  });

  const total = claws.length;
  const running = claws.filter((c) => c.status === "running").length;
  const stopped = claws.filter((c) => c.status === "stopped").length;

  const toggleStatus = (id: string) => {
    setClaws(claws.map((c) => {
      if (c.id !== id) return c;
      const newStatus = c.status === "running" ? "stopped" : "running";
      toast.success(`OpenClaw 已${newStatus === "running" ? "启用" : "停用"}`);
      return { ...c, status: newStatus };
    }));
  };

  return (
    <AdminLayout>
      <div className="page-enter">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">OpenClaw 监控</h1>
          <p className="text-sm text-gray-500 mt-1">查看和管理所有企业成员创建的 OpenClaw 实例。</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">总 OpenClaw 数</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">运行中</p>
                <p className="text-2xl font-bold text-green-600">{running}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                <PowerOff className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">已停用</p>
                <p className="text-2xl font-bold text-gray-500">{stopped}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索 OpenClaw 名称或创建人"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white w-44"
          />
          {(search || dateFilter) && (
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setDateFilter(""); }}>
              清除筛选
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">OpenClaw 名称</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">创建人</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">状态</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">创建时间</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((claw) => (
                <tr key={claw.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{claw.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{claw.creator}</td>
                  <td className="px-6 py-4">
                    {claw.status === "running" ? (
                      <span className="badge-running text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        运行中
                      </span>
                    ) : (
                      <span className="badge-stopped text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                        已停用
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{claw.createTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => toggleStatus(claw.id)}
                      >
                        {claw.status === "running" ? "停用" : "启用"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => setDeleteTarget(claw.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            共 {filtered.length} 条记录
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">删除后该 OpenClaw 将无法恢复，确认删除吗？</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  setClaws(claws.filter((c) => c.id !== deleteTarget));
                  toast.success("OpenClaw 已删除");
                  setDeleteTarget(null);
                }
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
