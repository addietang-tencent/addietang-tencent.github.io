/**
 * OpsObservation - 运维观测页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 标题、副标题、卡片、icon 与其他子页面保持一致
 */
import { useState, useEffect } from "react";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Eye, EyeOff } from "lucide-react";

// Mock data for charts
const logLevelData = [
  { date: "03-09", ERROR: 8, WARNING: 3, FATAL: 1 },
  { date: "03-10", ERROR: 5, WARNING: 4, FATAL: 0 },
];

const subsystemData = [
  { name: "openclaw", value: 8 },
  { name: "subagents", value: 2 },
  { name: "session", value: 1 },
];

const messageProcessData = [
  { time: "01:59", processed: 10, queued: 8 },
  { time: "02:04", processed: 12, queued: 9 },
  { time: "02:09", processed: 11, queued: 7 },
  { time: "02:14", processed: 13, queued: 8 },
  { time: "02:19", processed: 12, queued: 6 },
  { time: "02:24", processed: 14, queued: 7 },
  { time: "02:29", processed: 11, queued: 8 },
  { time: "02:34", processed: 13, queued: 9 },
  { time: "02:39", processed: 12, queued: 7 },
  { time: "02:44", processed: 14, queued: 6 },
];

const queueStatusData = [
  { time: "01:59", depth_avg: 2.0, wait_ms_avg: 1.8 },
  { time: "02:04", depth_avg: 1.9, wait_ms_avg: 1.7 },
  { time: "02:09", depth_avg: 2.1, wait_ms_avg: 1.9 },
  { time: "02:14", depth_avg: 2.0, wait_ms_avg: 1.8 },
  { time: "02:19", depth_avg: 1.8, wait_ms_avg: 1.6 },
  { time: "02:24", depth_avg: 2.0, wait_ms_avg: 1.8 },
  { time: "02:29", depth_avg: 1.9, wait_ms_avg: 1.7 },
  { time: "02:34", depth_avg: 2.1, wait_ms_avg: 1.9 },
  { time: "02:39", depth_avg: 2.0, wait_ms_avg: 1.8 },
  { time: "02:44", depth_avg: 1.9, wait_ms_avg: 1.7 },
];

const runDurationData = [
  { time: "01:59", run_duration_p50: 45000, run_duration_p95: 60000 },
  { time: "02:04", run_duration_p50: 46000, run_duration_p95: 62000 },
  { time: "02:09", run_duration_p50: 44000, run_duration_p95: 59000 },
  { time: "02:14", run_duration_p50: 47000, run_duration_p95: 61000 },
  { time: "02:19", run_duration_p50: 43000, run_duration_p95: 58000 },
  { time: "02:24", run_duration_p50: 45000, run_duration_p95: 60000 },
  { time: "02:29", run_duration_p50: 46000, run_duration_p95: 61000 },
  { time: "02:34", run_duration_p50: 44000, run_duration_p95: 59000 },
  { time: "02:39", run_duration_p50: 47000, run_duration_p95: 62000 },
  { time: "02:44", run_duration_p50: 45000, run_duration_p95: 60000 },
];

const METRIC_CARDS = [
  { title: "清单处理总量", value: "13", unit: "", icon: "", color: "#10B981" },
  { title: "清单入队", value: "13", unit: "", icon: "", color: "#3B82F6" },
  { title: "执行耗时 P95", value: "10s", unit: "正常", icon: "", color: "#F59E0B" },
  { title: "队列深度 P95", value: "0", unit: "正常", icon: "", color: "#8B5CF6" },
  { title: "卡死会话", value: "4", unit: "需关注", icon: "", color: "#EF4444" },
];

export default function OpsObservation() {
  const [clsEnabled, setClsEnabled] = useState(() => {
    const stored = localStorage.getItem("globalClsEnabled");
    return stored === "true";
  });
  const [isEnablingCls, setIsEnablingCls] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCloseClsConfirm, setShowCloseClsConfirm] = useState(false);
  const [isClosingCls, setIsClosingCls] = useState(false);

  // 监听 localStorage 变化，实现跨页面同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "globalClsEnabled") {
        setClsEnabled(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleOpenCLS = () => {
    setIsEnablingCls(true);
    // 模拟 loading 1.5 秒
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem("globalClsEnabled", "true");
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
      // 3 秒后隐藏成功提示
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const handleCloseCls = () => {
    setIsClosingCls(true);
    setTimeout(() => {
      setClsEnabled(false);
      localStorage.setItem("globalClsEnabled", "false");
      setIsClosingCls(false);
      setShowCloseClsConfirm(false);
    }, 1000);
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">运维观测</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          全方位守护系统稳定运行，从被动救火到主动防御
        </p>
      </div>

      {/* CLS 日志服务未开启提示 */}
      {!clsEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">运维观测需要开启 CLS 日志服务</h3>
              <p className="text-xs text-blue-700 mt-2">授权开通后将自动采集日志及指标数据，支持通过全链路性能监控采集核心运行指标。CLS 根据用量采用资源包或按量计费，<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a></p>
              <div className="text-xs text-blue-700 mt-3 space-y-1 border-t border-blue-200 pt-3">
                <p className="font-medium">开启 CLS 后还将获得：</p>
                <div>• 会话管理：支持通过会话总览、会话链下钻还原及渠道模型分布分析</div>
                <div>• Tokens 监控（按会话）：支持从按会话、消息维度查看 tokens、费用使用情况</div>
              </div>
            </div>
            <Button
              onClick={handleOpenCLS}
              disabled={isEnablingCls}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 whitespace-nowrap disabled:opacity-50"
            >
              {isEnablingCls ? "开启中..." : "开启 CLS 日志服务"}
            </Button>
          </div>
        </div>
      )}

      {/* CLS 开启成功提示 */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 max-w-md">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
            <div>
              <p className="text-sm font-medium text-green-800">CLS 日志服务开启成功</p>
              <div className="text-xs text-green-700 mt-2 space-y-1">
                <div>运维观测：支持通过全链路性能监控采集核心运行指标</div>
                <div>会话管理：支持通过会话总览、会话链下钻还原及渠道模型分布分析</div>
                <div>Tokens 监控：支持从按会话、消息维度查看 tokens、费用使用情况</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 已开启时显示关闭button */}
      {clsEnabled && (
        <div className="flex items-center justify-end mb-6">
          <Button
            onClick={() => setShowCloseClsConfirm(true)}
            variant="outline"
            className="text-xs h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
          >
            关闭 CLS 日志服务
          </Button>
        </div>
      )}

      {/* Metric Cards - 仅在 CLS 启用时显示 */}
      {clsEnabled && (
        <>
      <div className="grid grid-cols-5 gap-4 mb-8">
        {METRIC_CARDS.map((card, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs text-gray-500">{card.title}</span>
              <span className="text-lg">{card.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
            <div className="text-xs text-gray-400">{card.unit}</div>
          </div>
        ))}
      </div>

      {/* Application Logs Dashboard */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">应用日志大盘</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Log Level Distribution */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">日志级别分布</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={logLevelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ERROR" fill="#EF4444" />
                <Bar dataKey="WARNING" fill="#F59E0B" />
                <Bar dataKey="FATAL" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subsystem Errors */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">子系统错误</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subsystemData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* OTEL Metrics Dashboard */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">OTEL 指标大盘</h2>
        <div className="grid grid-cols-3 gap-6">
          {/* Message Processing */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="group relative">
                <h3 className="text-sm font-semibold text-gray-900 cursor-help">消息处理</h3>
                <div className="invisible group-hover:visible absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  已处理完成：已成功处理完成的消息数量；等待处理：等待处理的消息数量
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={messageProcessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                <Line type="monotone" dataKey="processed" name="已处理完成" stroke="#10B981" dot={false} />
                <Line type="monotone" dataKey="queued" name="等待处理" stroke="#3B82F6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p title="已成功处理完成的消息数量" className="cursor-help hover:text-gray-700"><span className="font-medium">已处理完成：</span>已成功处理完成的消息数量</p>
              <p title="等待处理的消息数量" className="cursor-help hover:text-gray-700"><span className="font-medium">等待处理：</span>等待处理的消息数量</p>
            </div>
          </div>

          {/* Queue Status */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="group relative">
                <h3 className="text-sm font-semibold text-gray-900 cursor-help">队列状态</h3>
                <div className="invisible group-hover:visible absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 w-max">
                  <div>队列长度 P95：95% 的时间队列长度不超过此值，反映队列拥堵程度</div>
                  <div>等待时间 P95：95% 的消息等待时间不超过此值，反映队列延迟</div>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={queueStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                <Line type="monotone" dataKey="depth_avg" name="队列长度 P95" stroke="#8B5CF6" dot={false} />
                <Line type="monotone" dataKey="wait_ms_avg" name="等待时间 P95" stroke="#06B6D4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p title="95% 的时间队列长度不超过此值，反映队列拥堵程度" className="cursor-help hover:text-gray-700"><span className="font-medium">队列长度 P95：</span>95% 的时间队列长度不超过此值，反映队列拥堵程度</p>
              <p title="95% 的消息等待时间不超过此值，反映队列延迟" className="cursor-help hover:text-gray-700"><span className="font-medium">等待时间 P95：</span>95% 的消息等待时间不超过此值，反映队列延迟</p>
            </div>
          </div>

          {/* Run Duration */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="group relative">
                <h3 className="text-sm font-semibold text-gray-900 cursor-help">执行耗时</h3>
                <div className="invisible group-hover:visible absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 w-max">
                  <div>处理耗时 P50：50% 的消息处理时间不超过此值，反映最差场景性能与边缘业务的延迟风险</div>
                  <div>处理耗时 P95：95% 的消息处理时间不超过此值，反映典型处理性能与大部分业务的实际延迟体验</div>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={runDurationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                <Line type="monotone" dataKey="run_duration_p50" name="处理耗时 P50" stroke="#F59E0B" dot={false} />
                <Line type="monotone" dataKey="run_duration_p95" name="处理耗时 P95" stroke="#EF4444" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p title="50% 的消息处理时间不超过此值，反映最差场景性能与边缘业务的延迟风险" className="cursor-help hover:text-gray-700"><span className="font-medium">处理耗时 P50：</span>50% 的消息处理时间不超过此值，反映最差场景性能与边缘业务的延迟风险</p>
              <p title="95% 的消息处理时间不超过此值，反映典型处理性能与大部分业务的实际延迟体验" className="cursor-help hover:text-gray-700"><span className="font-medium">处理耗时 P95：</span>95% 的消息处理时间不超过此值，反映典型处理性能与大部分业务的实际延迟体验</p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* 关闭 CLS 确认对话框 */}
      <Dialog open={showCloseClsConfirm} onOpenChange={setShowCloseClsConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确定要关闭 CLS 日志服务吗？</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 my-4">
            <p className="text-sm text-gray-600">关闭后以下功能将无法使用：</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-red-700">运维观测：</span>
                <span>支持通过全链路性能监控采集核心运行指标</span>
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-red-700">会话管理：</span>
                <span>支持通过会话总览、会话链下钻还原及渠道模型分布分析</span>
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-red-700">Tokens 监控（按会话）：</span>
                <span>支持从按会话、消息维度查看 tokens、费用使用情况</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCloseClsConfirm(false)}>
              取消
            </Button>
            <Button
              onClick={handleCloseCls}
              disabled={isClosingCls}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isClosingCls ? "关闭中..." : "确定关闭"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}
