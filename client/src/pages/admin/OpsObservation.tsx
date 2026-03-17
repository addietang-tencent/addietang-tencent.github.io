/**
 * OpsObservation - 运维观测页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 标题、副标题、卡片、icon 与其他子页面保持一致
 */
import { AlertCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  { title: "清单处理总量", value: "13", unit: "processed_total", icon: "📊", color: "#10B981" },
  { title: "清单入队", value: "13", unit: "queued_total", icon: "📥", color: "#3B82F6" },
  { title: "执行耗时 P95", value: "10s", unit: "run_duration", icon: "⏱️", color: "#F59E0B" },
  { title: "队列深度 P95", value: "0", unit: "正常", icon: "✓", color: "#8B5CF6" },
  { title: "卡死会话", value: "4", unit: "需关注", icon: "⚠️", color: "#EF4444" },
];

export default function OpsObservation() {
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
              <span className="text-xs text-gray-400">logLevelName</span>
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
              <span className="text-xs text-gray-400">subsystem</span>
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
              <span className="text-xs text-gray-400">processed/queued</span>
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
              <span className="text-xs text-gray-400">depth/wait</span>
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
              <span className="text-xs text-gray-400">run_duration</span>
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

      {/* Observable Panel Prompt */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900 mb-1">会话详情需要开启可观测面板</h3>
          <p className="text-sm text-blue-700">
            开启可观测面板后，您可以查看每个会话的详细日志和交互数据，帮助您更好地理解和优化对话流程。
          </p>
        </div>
      </div>
    </div>
  );
}
