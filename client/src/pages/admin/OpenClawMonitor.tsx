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
import { Search, Bot, Activity, PowerOff, Trash2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const MOCK_CLAWS = [
  { id: "1",  name: "Alice的助手",      creator: "alice@acompany.com",  status: "running", createTime: "2025-12-01" },
  { id: "2",  name: "Bob工作助手",       creator: "bob@acompany.com",    status: "running", createTime: "2025-12-15" },
  { id: "3",  name: "Carol的研究助手",   creator: "carol@acompany.com",  status: "stopped", createTime: "2026-01-05" },
  { id: "4",  name: "Dave的代码助手",    creator: "dave@acompany.com",   status: "running", createTime: "2026-01-20" },
  { id: "5",  name: "Eve的写作助手",     creator: "eve@acompany.com",    status: "stopped", createTime: "2026-02-10" },
  { id: "6",  name: "Frank的数据助手",   creator: "frank@acompany.com",  status: "running", createTime: "2026-02-18" },
  { id: "7",  name: "Grace的翻译助手",   creator: "grace@acompany.com",  status: "running", createTime: "2026-02-25" },
  { id: "8",  name: "Henry的销售助手",   creator: "henry@acompany.com",  status: "stopped", createTime: "2026-03-01" },
  { id: "9",  name: "Ivy的客服助手",     creator: "ivy@acompany.com",    status: "running", createTime: "2026-03-05" },
  { id: "10", name: "Jack的会议助手",    creator: "jack@acompany.com",   status: "running", createTime: "2026-03-08" },
  { id: "11", name: "Karen的报告助手",   creator: "karen@acompany.com",  status: "stopped", createTime: "2026-03-09" },
  { id: "12", name: "Leo的项目助手",     creator: "leo@acompany.com",    status: "running", createTime: "2026-03-10" },
];

const PAGE_SIZE = 10;

export default function OpenClawMonitor() {
  const [claws, setClaws] = useState(
    // 按创建时间降序排列（最近的在前）
    [...MOCK_CLAWS].sort((a, b) => b.createTime.localeCompare(a.createTime))
  );
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("列表已刷新");
    }, 1000);
  };

  const hasFilter = search || dateFrom || dateTo;

  const filtered = claws.filter((c) => {
    const matchSearch = !search || c.name.includes(search) || c.creator.includes(search);
    const matchFrom = !dateFrom || c.createTime >= dateFrom;
    const matchTo = !dateTo || c.createTime <= dateTo;
    return matchSearch && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleFilterChange = (fn: () => void) => {
    fn();
    setPage(1);
  };

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
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索名称或创建人"
              value={search}
              onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
              className="pl-9 bg-white"
            />
          </div>
          {/* 时间范围筛选 */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange(() => setDateFrom(e.target.value))}
              className="bg-white w-40"
              title="开始日期"
            />
            <span className="text-gray-400 text-sm shrink-0">—</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange(() => setDateTo(e.target.value))}
              className="bg-white w-40"
              title="结束日期"
            />
          </div>
          {hasFilter && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              清除筛选
            </Button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50"
            title="刷新列表"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                    暂无符合条件的 OpenClaw
                  </td>
                </tr>
              ) : (
                paginated.map((claw) => (
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
                      <div className="flex items-center gap-2">
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
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              共 {filtered.length} 条记录
              {filtered.length > 0 && `，第 ${safePage} / ${totalPages} 页`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    p === safePage
                      ? "text-white"
                      : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                  style={p === safePage ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
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
                  setClaws((prev) => prev.filter((c) => c.id !== deleteTarget));
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
