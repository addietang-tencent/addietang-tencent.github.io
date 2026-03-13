/**
 * OpenClawMonitor - 管控端 OpenClaw 监控页
 * 布局：标题行右上角时间筛选器+刷新 → 表格（上方左侧搜索框、右侧统计）
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Bot, Trash2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const MOCK_CLAWS = [
  { id: "1",  name: "Alice的助手",      creator: "alice@acompany.com",  createTime: "2025-12-01 09:12:34" },
  { id: "2",  name: "Bob工作助手",       creator: "bob@acompany.com",    createTime: "2025-12-15 14:05:22" },
  { id: "3",  name: "Carol的研究助手",   creator: "carol@acompany.com",  createTime: "2026-01-05 10:33:47" },
  { id: "4",  name: "Dave的代码助手",    creator: "dave@acompany.com",   createTime: "2026-01-20 16:48:09" },
  { id: "5",  name: "Eve的写作助手",     creator: "eve@acompany.com",    createTime: "2026-02-10 08:21:55" },
  { id: "6",  name: "Frank的数据助手",   creator: "frank@acompany.com",  createTime: "2026-02-18 11:07:30" },
  { id: "7",  name: "Grace的翻译助手",   creator: "grace@acompany.com",  createTime: "2026-02-25 15:44:18" },
  { id: "8",  name: "Henry的销售助手",   creator: "henry@acompany.com",  createTime: "2026-03-01 09:58:03" },
  { id: "9",  name: "Ivy的客服助手",     creator: "ivy@acompany.com",    createTime: "2026-03-05 13:26:41" },
  { id: "10", name: "Jack的会议助手",    creator: "jack@acompany.com",   createTime: "2026-03-08 17:02:15" },
  { id: "11", name: "Karen的报告助手",   creator: "karen@acompany.com",  createTime: "2026-03-09 10:15:50" },
  { id: "12", name: "Leo的项目助手",     creator: "leo@acompany.com",    createTime: "2026-03-10 08:39:27" },
];

const PAGE_SIZE = 10;

export default function OpenClawMonitor() {
  const [claws, setClaws] = useState(
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

  // 时间筛选后的数据（用于统计卡片）
  const timeFiltered = claws.filter((c) => {
    const matchFrom = !dateFrom || c.createTime >= dateFrom;
    const matchTo = !dateTo || c.createTime <= dateTo;
    return matchFrom && matchTo;
  });

  // 搜索进一步过滤（用于列表）
  const filtered = timeFiltered.filter((c) => {
    return !search || c.name.includes(search) || c.creator.includes(search);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilterChange = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <>
      <div className="page-enter">
        {/* Header：标题左，时间筛选器+刷新右 */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OpenClaw 监控</h1>
            <p className="text-sm text-gray-500 mt-1">查看和管理所有企业成员创建的 OpenClaw 实例。</p>
          </div>
          {/* 时间范围筛选 + 刷新（同 Tokens 监控样式） */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange(() => setDateFrom(e.target.value))}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange(() => setDateTo(e.target.value))}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => handleFilterChange(() => { setDateFrom(""); setDateTo(""); })}
                className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-colors whitespace-nowrap"
              >
                清除筛选
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50 shrink-0"
              title="刷新列表"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 表格卡片 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>

          {/* 表格上方工具栏：左侧搜索框，右侧统计 */}
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
            {/* 左：搜索框 */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索名称或创建人"
                value={search}
                onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
                className="pl-9 bg-gray-50 border-gray-200 h-9"
              />
            </div>
            {/* 右：统计 icon + 文案 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-gray-500">
                共计 <span className="text-lg font-bold text-gray-900">{timeFiltered.length}</span> 个 OpenClaw
              </span>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[32%]">OpenClaw 名称</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[30%]">创建人的成员 ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[30%]">创建时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[8%]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
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
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{claw.createTime}</td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => setDeleteTarget(claw.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
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
    </>
  );
}
