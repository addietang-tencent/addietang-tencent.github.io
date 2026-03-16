/**
 * OpsObservation - 运维观测页面（监控大盘）
 * 包含：顶部指标卡 / 应用日志大盘 / OTEL 指标大盘
 * 风格：浅色主题，与管控端整体保持一致
 */
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { MessageSquare, Clock, Layers, AlertTriangle, BarChart2, Activity, Inbox } from "lucide-react";

// ─── Mock 数据 ────────────────────────────────────────────────────────────────

// 顶部指标卡
const STAT_CARDS = [
  {
    label: "消息处理总量",
    metric: "processed_total",
    value: 13,
    color: "#22c55e",
    icon: MessageSquare,
    iconBg: "from-green-500 to-green-600",
    status: null,
  },
  {
    label: "消息入队",
    metric: "queued_total",
    value: 13,
    color: "#3b82f6",
    icon: Inbox,
    iconBg: "from-blue-500 to-blue-600",
    status: null,
  },
  {
    label: "执行耗时 P95",
    metric: "run_duration",
    value: "10s",
    color: "#f59e0b",
    icon: Clock,
    iconBg: "from-amber-400 to-amber-500",
    status: null,
  },
  {
    label: "队列深度 P95",
    metric: "depth/wait",
    value: 0,
    color: "#8b5cf6",
    icon: Layers,
    iconBg: "from-violet-500 to-violet-600",
    status: { text: "正常", type: "ok" },
  },
  {
    label: "卡死会话",
    metric: "stuck_sessions",
    value: 4,
    color: "#ef4444",
    icon: AlertTriangle,
    iconBg: "from-red-500 to-red-600",
    status: { text: "需关注", type: "warn" },
  },
];

// 日志级别分布（堆叠柱状图）
const LOG_LEVEL_DATA = [
  { date: "03-09", ERROR: 8, WARN: 4, FATAL: 0 },
  { date: "03-10", ERROR: 0, WARN: 5, FATAL: 0 },
];

// 子系统错误（水平条形图）
const SUBSYSTEM_ERROR_DATA = [
  { name: "openclaw", count: 6 },
  { name: "subagents", count: 1 },
  { name: "session", count: 1 },
];

// 生成时间序列 mock 数据（01:59 ~ 02:44，每 5 分钟一个点）
function genTimeSeries() {
  const times = [];
  for (let m = 59; m <= 104; m += 5) {
    const h = m >= 60 ? 2 : 1;
    const min = m >= 60 ? m - 60 : m;
    times.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return times;
}
const TIME_LABELS = genTimeSeries();

const MSG_PROC_DATA = TIME_LABELS.map((t) => ({
  time: t,
  processed: 12 + Math.floor(Math.random() * 2),
  queued: Math.floor(Math.random() * 2),
}));

const QUEUE_STATE_DATA = TIME_LABELS.map((t) => ({
  time: t,
  depthAvg: +(0.4 + Math.random() * 0.2).toFixed(2),
  waitAvg: +(2.4 + Math.random() * 0.4).toFixed(2),
}));

const EXEC_DURATION_DATA = TIME_LABELS.map((t) => ({
  time: t,
  avgMs: 60000 + Math.floor(Math.random() * 3000),
}));

// ─── 子组件 ───────────────────────────────────────────────────────────────────

/** 通用图表卡片容器 */
function ChartCard({
  title,
  badge,
  icon,
  iconBg,
  children,
  footer,
}: {
  title: string;
  badge: string;
  icon: React.ElementType;
  iconBg: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const Icon = icon;
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      {/* 卡片头 */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">{title}</span>
        </div>
        <span className="text-xs font-mono text-violet-500 bg-violet-50 px-2 py-0.5 rounded-md">{badge}</span>
      </div>
      {/* 图表区 */}
      <div className="px-4 pt-4 pb-2">{children}</div>
      {/* 底部指标 */}
      {footer && (
        <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40 flex items-center gap-8">
          {footer}
        </div>
      )}
    </div>
  );
}

/** 底部指标项 */
function FooterStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-base font-bold text-gray-900">{value}</span>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function OpsObservation() {
  return (
    <div className="page-enter max-w-5xl space-y-8">

      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">运维观测</h1>
        <p className="text-sm text-gray-500 mt-1">全方位守护系统稳定运行，从被动救火到主动防御</p>
      </div>

      {/* ══ 顶部指标卡 ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-5 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 px-4 py-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-gray-500 leading-tight">{card.label}</span>
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">{card.value}</div>
              {card.status ? (
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                  {card.status.type === "warn" && <AlertTriangle className="w-3 h-3 text-red-500" />}
                  {card.status.text}
                </div>
              ) : (
                <div className="text-xs text-gray-400 font-mono">{card.metric}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══ 应用日志大盘 ════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h2 className="text-base font-bold text-gray-900">应用日志大盘</h2>
        </div>
        <div className="grid grid-cols-2 gap-5">

          {/* 日志级别分布 */}
          <ChartCard
            title="日志级别分布"
            badge="logLevelName"
            icon={BarChart2}
            iconBg="from-blue-500 to-blue-600"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={LOG_LEVEL_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="ERROR" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="WARN" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="FATAL" stackId="a" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 子系统错误 */}
          <ChartCard
            title="子系统错误"
            badge="subsystem"
            icon={AlertTriangle}
            iconBg="from-red-500 to-red-600"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={SUBSYSTEM_ERROR_DATA}
                layout="vertical"
                margin={{ top: 8, right: 32, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {SUBSYSTEM_ERROR_DATA.map((entry, index) => {
                    const colors = ["#ef4444", "#f59e0b", "#3b82f6"];
                    return <Cell key={index} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* ══ OTEL 指标大盘 ═══════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-violet-500" />
          <h2 className="text-base font-bold text-gray-900">OTEL 指标大盘</h2>
        </div>
        <div className="grid grid-cols-3 gap-5">

          {/* 消息处理 */}
          <ChartCard
            title="消息处理"
            badge="processed/queued"
            icon={MessageSquare}
            iconBg="from-green-500 to-green-600"
            footer={
              <>
                <FooterStat label="处理量" value={13} />
                <FooterStat label="积压" value={0} />
              </>
            }
          >
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={MSG_PROC_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 11 }}
                />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                <Line type="monotone" dataKey="processed" stroke="#22c55e" strokeWidth={1.5} dot={false} name="processed" />
                <Line type="monotone" dataKey="queued" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="queued" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 队列状态 */}
          <ChartCard
            title="队列状态"
            badge="depth/wait"
            icon={Layers}
            iconBg="from-violet-500 to-violet-600"
            footer={
              <>
                <FooterStat label="depth P95" value={0} />
                <FooterStat label="wait P95" value="0s" />
              </>
            }
          >
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={QUEUE_STATE_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 11 }}
                />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                <Line type="monotone" dataKey="depthAvg" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="depth avg" />
                <Line type="monotone" dataKey="waitAvg" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="wait_ms avg" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 执行耗时 */}
          <ChartCard
            title="执行耗时"
            badge="run_duration"
            icon={Clock}
            iconBg="from-amber-400 to-amber-500"
            footer={
              <>
                <FooterStat label="P50" value="5s" />
                <FooterStat label="P95" value="10s" />
              </>
            }
          >
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={EXEC_DURATION_DATA} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [`${v.toLocaleString()} ms`, "avg ms"]}
                />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                <Line type="monotone" dataKey="avgMs" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="avg ms" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </div>

    </div>
  );
}
