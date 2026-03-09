/**
 * TokensMonitor - 管控端 Tokens 监控页
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

const MEMBER_DATA = [
  { id: "alice@acompany.com", inputTokens: 45200, outputTokens: 38100, limit: 100000 },
  { id: "bob@acompany.com", inputTokens: 12300, outputTokens: 9800, limit: 100000 },
  { id: "carol@acompany.com", inputTokens: 67800, outputTokens: 55200, limit: 100000 },
  { id: "dave@acompany.com", inputTokens: 8900, outputTokens: 7200, limit: 100000 },
  { id: "eve@acompany.com", inputTokens: 23400, outputTokens: 18700, limit: 100000 },
];

const MODEL_DATA = [
  { name: "腾讯云 DeepSeek (V3 0324)", inputTokens: 98700, outputTokens: 82300, limit: 500000 },
  { name: "腾讯云混元 (Turbo)", inputTokens: 34200, outputTokens: 28900, limit: 200000 },
  { name: "腾讯云 DeepSeek (R1)", inputTokens: 25100, outputTokens: 18800, limit: 100000 },
];

const GLOBAL_LIMIT = 1000000;

function ProgressBar({ value, max, color = "blue" }: { value: number; max: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };
  const barColor = pct > 80 ? colorMap.red : pct > 60 ? colorMap.yellow : colorMap.blue;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function TokensMonitor() {
  const [dateFilter, setDateFilter] = useState("");

  const totalInput = MEMBER_DATA.reduce((s, m) => s + m.inputTokens, 0);
  const totalOutput = MEMBER_DATA.reduce((s, m) => s + m.outputTokens, 0);
  const totalTokens = totalInput + totalOutput;
  const globalPct = ((totalTokens / GLOBAL_LIMIT) * 100).toFixed(1);

  return (
    <AdminLayout>
      <div className="page-enter">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tokens 监控</h1>
            <p className="text-sm text-gray-500 mt-1">查看企业成员和模型的 Tokens 消耗情况。</p>
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white w-44"
          />
        </div>

        {/* Overview */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: "总请求数", value: "1,284", icon: TrendingUp, color: "from-blue-500 to-blue-600" },
            { label: "输入 Tokens", value: totalInput.toLocaleString(), icon: ArrowUp, color: "from-indigo-500 to-indigo-600" },
            { label: "输出 Tokens", value: totalOutput.toLocaleString(), icon: ArrowDown, color: "from-purple-500 to-purple-600" },
            { label: "总 Tokens", value: totalTokens.toLocaleString(), icon: Zap, color: "from-blue-600 to-purple-600" },
            { label: "全局配额消耗", value: `${globalPct}%`, icon: Zap, color: "from-orange-500 to-red-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              {stat.label === "全局配额消耗" && (
                <ProgressBar value={totalTokens} max={GLOBAL_LIMIT} />
              )}
            </div>
          ))}
        </div>

        {/* Detail Tabs */}
        <Tabs defaultValue="member">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="member">按成员</TabsTrigger>
              <TabsTrigger value="model">按模型</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="member">
            <p className="text-xs text-gray-400 mb-3">汇总每个成员每日使用所有模型的消耗</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">成员 ID</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输入 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输出 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">每日上限</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-40">消耗占比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MEMBER_DATA.map((m) => {
                    const total = m.inputTokens + m.outputTokens;
                    const pct = ((total / m.limit) * 100).toFixed(1);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">{m.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">{m.inputTokens.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">{m.outputTokens.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{total.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right">{m.limit.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{pct}%</span>
                            </div>
                            <ProgressBar value={total} max={m.limit} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="model">
            <p className="text-xs text-gray-400 mb-3">汇总每个模型每日所有企业成员使用的消耗</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">模型名称</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输入 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输出 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">每日上限</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-40">消耗占比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MODEL_DATA.map((m) => {
                    const total = m.inputTokens + m.outputTokens;
                    const pct = ((total / m.limit) * 100).toFixed(1);
                    return (
                      <tr key={m.name} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">{m.inputTokens.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">{m.outputTokens.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{total.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right">{m.limit.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500">{pct}%</span>
                            <ProgressBar value={total} max={m.limit} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
