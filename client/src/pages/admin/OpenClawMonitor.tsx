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
import { Search, Bot, Trash2, ChevronLeft, ChevronRight, RefreshCw, Plus, AlertCircle } from "lucide-react";

const MOCK_CLAWS = [
  { id: "1",  name: "Alice的助手",      creator: "alice@acompany.com",  createTime: "2025-12-01 09:12:34", observableStatus: "off" },
  { id: "2",  name: "Bob工作助手",       creator: "bob@acompany.com",    createTime: "2025-12-15 14:05:22", observableStatus: "off" },
  { id: "3",  name: "Carol的研究助手",   creator: "carol@acompany.com",  createTime: "2026-01-05 10:33:47", observableStatus: "off" },
  { id: "4",  name: "Dave的代码助手",    creator: "dave@acompany.com",   createTime: "2026-01-20 16:48:09", observableStatus: "off" },
  { id: "5",  name: "Eve的写作助手",     creator: "eve@acompany.com",    createTime: "2026-02-10 08:21:55", observableStatus: "off" },
  { id: "6",  name: "Frank的数据助手",   creator: "frank@acompany.com",  createTime: "2026-02-18 11:07:30", observableStatus: "off" },
  { id: "7",  name: "Grace的翻译助手",   creator: "grace@acompany.com",  createTime: "2026-02-25 15:44:18", observableStatus: "off" },
  { id: "8",  name: "Henry的销售助手",   creator: "henry@acompany.com",  createTime: "2026-03-01 09:58:03", observableStatus: "off" },
  { id: "9",  name: "Ivy的客服务助手",     creator: "ivy@acompany.com",    createTime: "2026-03-05 13:26:41", observableStatus: "off" },
  { id: "10", name: "Jack的会议助手",    creator: "jack@acompany.com",   createTime: "2026-03-08 17:02:15", observableStatus: "off" },
  { id: "11", name: "Karen的报告助手",   creator: "karen@acompany.com",  createTime: "2026-03-09 10:15:50", observableStatus: "off" },
  { id: "12", name: "Leo的项目助手",     creator: "leo@acompany.com",    createTime: "2026-03-10 08:39:27", observableStatus: "off" },
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
  
  // CLS 服务开通流程状态
  const [showClsDialog, setShowClsDialog] = useState(false);
  const [clsEnabled, setClsEnabled] = useState(false);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  
  const [secretId, setSecretId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allObservableEnabled, setAllObservableEnabled] = useState(false);
  
  // 批量选择状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [batchMode, setBatchMode] = useState<"enable" | "disable" | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("列表已刷新");
    }, 1000);
  };

  // 打开可观测面板
  const handleOpenObservability = () => {
    // Demo 默认未开通 CLS 服务
    if (!clsEnabled) {
      setShowClsDialog(true);
    } else {
      // 已开通则全量开启可观测面板
      setClaws(claws.map(c => ({ ...c, observableStatus: "on" })));
      setAllObservableEnabled(true);
      toast.success("全量开启可观测面板成功");
    }
  };

  // 开通 CLS 服务
  const handleEnableCls = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setClsEnabled(true);
      setShowClsDialog(false);
      toast.success("CLS 服务已开通");
      // 开通后显示接入弹窗
      setShowAccessDialog(true);
    }, 1500);
  };

  const handleAccessOpenClaw = () => {
    const trimmedSecretId = secretId.trim();
    const trimmedSecretKey = secretKey.trim();
    
    if (!trimmedSecretId.startsWith("AKID") || !trimmedSecretKey.startsWith("MYbT")) {
      toast.error("密钥无效，请检查 SecretId 和 SecretKey");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (batchMode === "enable") {
        // 批量开启
        setClaws(claws.map(c => 
          selectedIds.has(c.id) ? { ...c, observableStatus: "on" } : c
        ));
        toast.success(`已为 ${selectedIds.size} 个 OpenClaw 开启可观测面板`);
      } else {
        // 单个接入
        const newClaw = {
          id: String(Math.max(...claws.map(c => parseInt(c.id))) + 1),
          name: `接入的 OpenClaw (${trimmedSecretId.slice(0, 4)}...)`,
          creator: "system@acompany.com",
          createTime: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/\//g, '-')
        };
        setClaws([{ ...newClaw, observableStatus: "on" }, ...claws]);
        toast.success("开启可观测面板成功");
      }
      setIsLoading(false);
      setShowAccessDialog(false);
      setSecretId("");
      setSecretKey("");
      setSelectedIds(new Set());
      setBatchMode(null);
    }, 1500);
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

  // 切换单个选中状态
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  // 批量开启可观测面板
  const handleBatchEnable = () => {
    if (selectedIds.size === 0) {
      toast.error("请先选择要开启的 OpenClaw");
      return;
    }
    setBatchMode("enable");
    if (!clsEnabled) {
      setShowClsDialog(true);
    } else {
      setShowAccessDialog(true);
    }
  };

  // 批量关闭可观测面板
  const handleBatchDisable = () => {
    if (selectedIds.size === 0) {
      toast.error("请先选择要关闭的 OpenClaw");
      return;
    }
    setShowCloseConfirm(true);
  };

  // 确认关闭
  const confirmDisable = () => {
    setClaws(claws.map(c => 
      selectedIds.has(c.id) ? { ...c, observableStatus: "off" } : c
    ));
    const count = selectedIds.size;
    setSelectedIds(new Set());
    setShowCloseConfirm(false);
    toast.success(`已关闭 ${count} 个 OpenClaw 的可观测面板`);
  };

  return (
    <>
      <div className="page-enter">
        {/* Header：标题左，时间筛选器+刷新右 */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OpenClaw 监控</h1>
            <p className="text-sm text-gray-500 mt-1">查看和管理所有企业用户创建的 OpenClaw 实例。</p>
          </div>
          {/* 接入按键 + 时间范围筛选 + 刷新 */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenObservability}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
              className="text-white gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              开启可观测面板
            </Button>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange(() => setDateFrom(e.target.value))}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange(() => setDateTo(e.target.value))}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
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

          {/* 表格上方工具栏：左侧搜索框，右侧统计 + 批量操作 */}
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
            {/* 左：搜索框 */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索名称或创建人"
                value={search}
                onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
                className="pl-9 bg-gray-50 border-gray-200 h-9"
              />
            </div>
            {/* 右：统计 + 批量操作 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm text-gray-500">
                  共计 <span className="text-lg font-bold text-gray-900">{timeFiltered.length}</span> 个 OpenClaw
                </span>
              </div>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                  <span className="text-sm text-gray-500">已选 {selectedIds.size} 个</span>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleBatchEnable}
                  >
                    开启
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50"
                    onClick={handleBatchDisable}
                  >
                    关闭
                  </Button>
                </div>
              )}
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[5%]">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[23%]">OpenClaw 名称</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">创建人的用户 ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">创建时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[14%]">可观测面板状态</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[14%]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                    暂无符合条件的 OpenClaw
                  </td>
                </tr>
              ) : (
                paginated.map((claw) => (
                  <tr key={claw.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(claw.id)}
                        onChange={() => toggleSelect(claw.id)}
                        className="rounded border-gray-300 cursor-pointer"
                      />
                    </td>
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
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        claw.observableStatus === "on"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-50 text-gray-600"
                      }`}>
                        {claw.observableStatus === "on" ? "开启" : "未开启"}
                      </span>
                    </td>
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400 px-2">第 {safePage} 页</span>
              <button
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CLS 开通弹窗 */}
      <Dialog open={showClsDialog} onOpenChange={setShowClsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>开通日志服务CLS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                开启可观测面板需要您开通「日志服务CLS」
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">腾讯云日志服务CLS独立计费产品。</p>
              <p className="text-sm text-gray-600">
                计费标准清楚见 
                <a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  CLS计费详情
                </a>
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowClsDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleEnableCls} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "开通中..." : "开通"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 接入 AKSK 弹窗 */}
      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>开启可观测面板</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                将采用Loglistener采集器实时监听Openclaw相关日志，并上传到日志服务 CLS，同时您可以在管控端实时查看仪表盘数据
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">SecretId</label>
                <Input
                  placeholder="请输入 SecretId"
                  value={secretId}
                  onChange={(e) => setSecretId(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">SecretKey</label>
                <Input
                  type="password"
                  placeholder="请输入 SecretKey"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAccessDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleAccessOpenClaw} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "接入中..." : "接入"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 关闭确认弹窗 */}
      <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>关闭可观测面板</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                关闭后将无法查看详细日志和对话数据，请谨慎操作
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCloseConfirm(false)}>
              取消
            </Button>
            <Button 
              onClick={confirmDisable}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              确认关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>删除 OpenClaw</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">确定要删除这个 OpenClaw 吗？此操作无法撤销。</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button 
              onClick={() => {
                setClaws(claws.filter(c => c.id !== deleteTarget));
                setDeleteTarget(null);
                toast.success("已删除");
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
