/**
 * OpsObservation - 运维观测页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 标题、副标题、卡片、icon 与其他子页面保持一致
 */
import { useState, useEffect } from "react";
import { AlertCircle, ArrowUpRight, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Eye, EyeOff } from "lucide-react";

// Mock data for charts
const logLevelData = [
  { level: "ERROR", count: 498 },
  { level: "WARNING", count: 1974 },
  { level: "INFO", count: 33124 },
  { level: "DEBUG", count: 56937 },
];

const logModuleData = [
  { name: "gateway/channels/qpo...", count: 62413 },
  { name: "gateway/health-monit...", count: 11206 },
  { name: "plugins", count: 1145 },
  { name: "agent/embedded", count: 630 },
  { name: "gateway/channels/fei...", count: 95 },
  { name: "gateway/canvas", count: 9 },
  { name: "browser/server", count: 9 },
  { name: "gmail-watcher", count: 1 },
  { name: "browser/service", count: 1 },
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
  { title: "执行耗时 P95", value: "10s", unit: "", icon: "", color: "#F59E0B" },
  { title: "队列深度 P95", value: "0", unit: "", icon: "", color: "#8B5CF6" },
  { title: "卡死会话", value: "4", unit: "", icon: "", color: "#EF4444" },
];

// Legend 说明映射
const legendTooltips: Record<string, string> = {
  "已处理完成的消息数量": "已处理完成：已成功处理完成的消息数量",
  "等待处理的消息数量": "等待处理：等待处理的消息数量",
  "队列长度 P95": "队列长度 P95：95% 的时间队列长度不超过此值，反映队列拥堵程度",
  "等待时间 P95": "等待时间 P95：95% 的消息等待时间不超过此值，反映队列延迟",
  "处理耗时 P50": "处理耗时 P50：50% 的消息处理时间不超过此值，反映最差场景性能与边缘业务的延迟风险",
  "处理耗时 P95": "处理耗时 P95：95% 的消息处理时间不超过此值，反映典型处理性能与大部分业务的实际延迟体验",
};

// Custom Y Axis Tick with Tooltip
const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const [showTooltip, setShowTooltip] = useState(false);
  const fullName = logModuleData.find(item => item.name.includes(payload.value.split('...')[0]))?.name || payload.value;
  
  return (
    <g>
      <text 
        x={x} 
        y={y} 
        textAnchor="end" 
        fontSize={12} 
        fill="#6b7280"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: 'pointer' }}
      >
        {payload.value}
      </text>
      {showTooltip && (
        <foreignObject x={x - 150} y={y - 25} width={140} height={40}>
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-normal break-words">
            {fullName}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

const CustomLegend = (props: any) => {
  const { payload } = props;
  console.log('CustomLegend payload:', payload);
  if (!payload || payload.length === 0) {
    return null;
  }
  return (
    <div className="flex gap-6 justify-center flex-wrap">
      {payload.map((entry: any, index: number) => {
        console.log('Legend entry:', entry);
        return (
          <div key={`legend-${index}`} className="group relative flex items-center gap-2 cursor-help">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600 inline-block">{entry.name}</span>
            {legendTooltips[entry.name] && (
              <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 z-50 w-max whitespace-nowrap">
                {legendTooltips[entry.name]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 工具函数
function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}
function todayStr() {
  return toDateStr(new Date());
}
function addDays(base: string, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export default function OpsObservation() {
  const today = todayStr();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const [clsEnabled, setClsEnabled] = useState(() => {
    const stored = localStorage.getItem("globalClsEnabled");
    return stored === "true";
  });
  const [isEnablingCls, setIsEnablingCls] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCloseClsConfirm, setShowCloseClsConfirm] = useState(false);
  const [isClosingCls, setIsClosingCls] = useState(false);

  // 处理日期变化
  const handleFromChange = (value: string) => {
    setDateFrom(value);
  };

  const handleToChange = (value: string) => {
    setDateTo(value);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); }, 1000);
  };

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
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">运维观测</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFromChange(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleToChange(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50"
              title="刷新数据"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
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
              <p className="text-xs text-blue-700 mt-2">授权开通后将自动采集日志及指标数据，支持通过全链路性能监控采集核心运行指标。2025年6月15日前该功能免费使用，2025年6月15日后CLS将按量计费，<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a></p>
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
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Log Module Distribution */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">日志模块分布</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={logModuleData} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={170} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
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
                <Line type="monotone" dataKey="processed" name="已处理完成的消息数量" stroke="#10B981" dot={false} />
                <Line type="monotone" dataKey="queued" name="等待处理的消息数量" stroke="#3B82F6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 text-xs flex-wrap">
              <div className="group relative cursor-help inline-flex items-center gap-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                  <span className="text-gray-600">已处理完成的消息数量</span>
                </span>
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 bg-gray-900 text-white rounded px-2 py-1 z-50 w-max whitespace-nowrap text-xs">
                  已成功处理完成的消息数量
                </div>
              </div>
              <div className="group relative cursor-help inline-flex items-center gap-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                  <span className="text-gray-600">等待处理的消息数量</span>
                </span>
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 bg-gray-900 text-white rounded px-2 py-1 z-50 w-max whitespace-nowrap text-xs">
                  等待处理的消息数量
                </div>
              </div>
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
                <Line type="monotone" dataKey="depth_avg" name="队列长度 P95" stroke="#8B5CF6" dot={false} />
                <Line type="monotone" dataKey="wait_ms_avg" name="等待时间 P95" stroke="#06B6D4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 text-xs flex-wrap">
              <div className="group relative cursor-help inline-flex items-center gap-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
                  <span className="text-gray-600">队列长度 P95</span>
                </span>
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 bg-gray-900 text-white rounded px-2 py-1 z-50 w-max whitespace-nowrap text-xs">
                  95% 的时间队列长度不超过此值，反映队列拥堵程度
                </div>
              </div>
              <div className="group relative cursor-help inline-flex items-center gap-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
                  <span className="text-gray-600">等待时间 P95</span>
                </span>
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 bg-gray-900 text-white rounded px-2 py-1 z-50 w-max whitespace-nowrap text-xs">
                  95% 的消息等待时间不超过此值，反映队列延迟
                </div>
              </div>
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
                <Line type="monotone" dataKey="run_duration_p50" name="处理耗时 P50" stroke="#F59E0B" dot={false} />
                <Line type="monotone" dataKey="run_duration_p95" name="处理耗时 P95" stroke="#EF4444" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 text-xs flex-wrap">
              <div className="group relative cursor-help inline-flex items-center gap-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                  <span className="text-gray-600">处理耗时 P50</span>
                </span>
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 bg-gray-900 text-white rounded px-2 py-1 z-50 w-max whitespace-nowrap text-xs">
                  50% 的消息处理时间不超过此值，反映最差场景性能与边缘业务的延迟风险
                </div>
              </div>
              <div className="group relative cursor-help inline-flex items-center gap-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                  <span className="text-gray-600">处理耗时 P95</span>
                </span>
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 bg-gray-900 text-white rounded px-2 py-1 z-50 w-max whitespace-nowrap text-xs">
                  95% 的消息处理时间不超过此值，反映典型处理性能与大部分业务的实际延迟体验
                </div>
              </div>
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
                <div className="font-medium text-red-900">运维观测</div>
                <div className="text-red-700">全链路性能监控采集核心运行指标</div>
              </div>
              <div className="text-xs text-gray-700">
                <div className="font-medium text-red-900">会话管理</div>
                <div className="text-red-700">会话总览、会话链下钻还原及渠道模型分布分析</div>
              </div>
              <div className="text-xs text-gray-700">
                <div className="font-medium text-red-900">Tokens 监控</div>
                <div className="text-red-700">按会话、消息维度查看 tokens、费用使用情况</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCloseClsConfirm(false)}
              className="text-xs h-8"
            >
              取消
            </Button>
            <Button
              onClick={handleCloseCls}
              disabled={isClosingCls}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 disabled:opacity-50"
            >
              {isClosingCls ? "关闭中..." : "确定关闭"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
