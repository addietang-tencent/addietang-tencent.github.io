/**
 * OpsObservation - 运维观测页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 标题、副标题、卡片、icon 与其他子页面保持一致
 */
import { useState } from "react";
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
  { time: "01:59", avg_ms: 60000 },
  { time: "02:04", avg_ms: 62000 },
  { time: "02:09", avg_ms: 59000 },
  { time: "02:14", avg_ms: 61000 },
  { time: "02:19", avg_ms: 58000 },
  { time: "02:24", avg_ms: 60000 },
  { time: "02:29", avg_ms: 61000 },
  { time: "02:34", avg_ms: 59000 },
  { time: "02:39", avg_ms: 62000 },
  { time: "02:44", avg_ms: 60000 },
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
    return localStorage.getItem("opsObservationClsEnabled") === "true";
  });
  const [showCLSDialog, setShowCLSDialog] = useState(false);
  const [showAKSKDialog, setShowAKSKDialog] = useState(false);
  const [secretId, setSecretId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCloseClsConfirm, setShowCloseClsConfirm] = useState(false);
  const [isClosingCls, setIsClosingCls] = useState(false);

  const handleOpenCLS = () => {
    setShowCLSDialog(true);
  };

  const handleEnableCLS = () => {
    setShowCLSDialog(false);
    setShowAKSKDialog(true);
  };

  const handleConfirmAKSK = () => {
    if (!secretId.trim().startsWith("AKID") || !secretKey.trim().startsWith("MYbT")) {
      alert("密钥无效");
      return;
    }
    setClsEnabled(true);
    localStorage.setItem("opsObservationClsEnabled", "true");
    setShowAKSKDialog(false);
    setSecretId("");
    setSecretKey("");
  };

  const handleCloseCls = () => {
    setIsClosingCls(true);
    setTimeout(() => {
      setClsEnabled(false);
      localStorage.setItem("opsObservationClsEnabled", "false");
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
            </div>
            <Button
              onClick={handleOpenCLS}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 whitespace-nowrap"
            >
              开启 CLS 日志服务
            </Button>
          </div>
        </div>
      )}

      {/* 已开启时显示关闭按钮 */}
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

      {/* Metric Cards */}
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
              <h3 className="text-sm font-semibold text-gray-900">消息处理</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={messageProcessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="processed" stroke="#10B981" dot={false} />
                <Line type="monotone" dataKey="queued" stroke="#3B82F6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Queue Status */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">队列状态</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={queueStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="depth_avg" stroke="#8B5CF6" dot={false} />
                <Line type="monotone" dataKey="wait_ms_avg" stroke="#06B6D4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Run Duration */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">执行耗时</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={runDurationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg_ms" stroke="#F59E0B" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CLS 开通弹窗 */}
      <Dialog open={showCLSDialog} onOpenChange={setShowCLSDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>开通日志服务CLS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-800">
                  开启可观测面板需要您开通「日志服务CLS」
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-2">腾讯云日志服务CLS独立计费产品</p>
                <p className="text-gray-600 mb-3">计费标准清楚，见<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CLS计费详情</a></p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCLSDialog(false)}>取消</Button>
            <Button onClick={handleEnableCLS} className="bg-blue-600 hover:bg-blue-700">开通</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 关闭 CLS 确认对话框 */}
      <Dialog open={showCloseClsConfirm} onOpenChange={setShowCloseClsConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确定要关闭 CLS 日志服务吗？</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 my-4">关闭后将无法查看该页面的数据仪表板。</p>
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

      {/* AKSK 接入弹窗 */}
      <Dialog open={showAKSKDialog} onOpenChange={setShowAKSKDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>开启可观测面板</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  将采用Loglistener采集器实时监听Openclaw相关日志，并上传到日志服务 CLS，同时您可以在管控端实时查看仪表盘数据
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">SecretId</label>
                <input
                  type="text"
                  value={secretId}
                  onChange={(e) => setSecretId(e.target.value)}
                  placeholder="AKID123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">SecretKey</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="MYbTAbcDefGhIjKl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAKSKDialog(false)}>取消</Button>
            <Button onClick={handleConfirmAKSK} className="bg-blue-600 hover:bg-blue-700">确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
