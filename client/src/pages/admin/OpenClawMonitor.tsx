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
import { DatePickerInput } from "@/components/DatePickerInput";

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
  
  // 三步骤开启流程状态
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1); // 1: 开通 CLS, 2: 设置主题, 3: 安装 Agent
  
  // 第一步: CLS 开通
  const [clsEnabled, setClsEnabled] = useState(false);
  
  // 第二步: 主题设置
  const [logTopic, setLogTopic] = useState("openclaw_log_topic");
  const [metricTopic, setMetricTopic] = useState("openclaw_metric_topic");
  
  // 第三步: Agent 安装
  const [isInstallingAgent, setIsInstallingAgent] = useState(false);
  
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
  // 打开三步骤设置弹窗
  const handleOpenSetupDialog = () => {
    setSetupStep(1);
    setShowSetupDialog(true);
  };

  // 第一步: 开通 CLS
  const handleStep1EnableCls = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setClsEnabled(true);
      setSetupStep(2);
      toast.success("CLS 服务已开通");
    }, 1500);
  };

  // 第二步: 主题设置完成后进入第三步
  const handleStep2Continue = () => {
    setSetupStep(3);
  };

  // 第三步: 安装 Agent
  const handleStep3InstallAgent = () => {
    setIsInstallingAgent(true);
    setTimeout(() => {
      setIsInstallingAgent(false);
      setClaws(claws.map(c => 
        selectedIds.has(c.id) ? { ...c, observableStatus: "on" } : c
      ));
      setShowSetupDialog(false);
      setSelectedIds(new Set());
      toast.success("可观测面板开启成功");
    }, 2000);
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
    // 批量开启也需要经过三步流程
    handleOpenSetupDialog();
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
          {/* 时间范围筛选 + 刷新 */}
          <div className="flex items-center gap-2">
            <DatePickerInput
              value={dateFrom}
              onChange={(val) => handleFilterChange(() => setDateFrom(val))}
              className="h-9"
            />
            <span className="text-gray-400 text-sm">—</span>
            <DatePickerInput
              value={dateTo}
              onChange={(val) => handleFilterChange(() => setDateTo(val))}
              className="h-9"
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
            {/* 右：统计 */}
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[28%]">OpenClaw 名称</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[28%]">创建人的用户 ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[28%]">创建时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[16%]">操作</th>
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

      {/* 三步骤开启流程弹窗 */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>开启可观测面板</DialogTitle>
          </DialogHeader>
          
          {/* 第一步: 开通 CLS */}
          {setupStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">1. 开通 CLS</h3>
                <p className="text-sm text-gray-600">
                  开启可观测面板需要您开通日志服务 CLS
                </p>
              </div>
              <div className="flex gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  2025年6月15日前该功能免费使用，2025年6月15日后CLS将按量计费
                </p>
              </div>
            </div>
          )}
          
          {/* 第二步: 主题设置 */}
          {setupStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">2. 设置主题</h3>
                <p className="text-sm text-gray-600">
                  配置日志主题和指标主题
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">日志主题</label>
                  <Input
                    placeholder="日志主题名称"
                    value={logTopic}
                    onChange={(e) => setLogTopic(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">指标主题</label>
                  <Input
                    placeholder="指标主题名称"
                    value={metricTopic}
                    onChange={(e) => setMetricTopic(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* 第三步: 安装 Agent */}
          {setupStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">3. 安装 Agent</h3>
                <p className="text-sm text-gray-600">
                  正在安装日志采集 Agent…
                </p>
              </div>
              {isInstallingAgent && (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            {setupStep > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setSetupStep((prev) => (prev - 1) as 1 | 2 | 3)}
                disabled={isLoading || isInstallingAgent}
              >
                上一步
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setShowSetupDialog(false)}
              disabled={isLoading || isInstallingAgent}
            >
              取消
            </Button>
            {setupStep === 1 && (
              <Button 
                onClick={handleStep1EnableCls} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "开通中..." : "下一步"}
              </Button>
            )}
            {setupStep === 2 && (
              <Button 
                onClick={handleStep2Continue}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                下一步
              </Button>
            )}
            {setupStep === 3 && (
              <Button 
                onClick={handleStep3InstallAgent} 
                disabled={isInstallingAgent}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isInstallingAgent ? "安装中..." : "确认"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 关闭确认弹窗 */}     <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
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
