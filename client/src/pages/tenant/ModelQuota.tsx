/**
 * ModelQuota - 模型额度页面
 * Design: 「流动蓝图」Fluid Blueprint
 */
import TenantLayout from "@/components/TenantLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, AlertCircle } from "lucide-react";

const QUOTA_DATA = [
  {
    model: "腾讯云 DeepSeek",
    version: "DeepSeek V3 0324",
    dailyLimit: 100000,
    used: 68420,
    color: "from-blue-500 to-blue-600",
  },
  {
    model: "腾讯云混元",
    version: "混元 Turbo",
    dailyLimit: 50000,
    used: 12300,
    color: "from-purple-500 to-purple-600",
  },
  {
    model: "腾讯云 Coding Plan",
    version: "自动",
    dailyLimit: 30000,
    used: 29800,
    color: "from-orange-500 to-orange-600",
  },
];

export default function ModelQuota() {
  const totalUsed = QUOTA_DATA.reduce((sum, m) => sum + m.used, 0);
  const totalLimit = QUOTA_DATA.reduce((sum, m) => sum + m.dailyLimit, 0);

  return (
    <TenantLayout>
      <div className="max-w-4xl mx-auto px-6 py-8 page-enter">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">模型额度</h1>
          <p className="text-sm text-gray-500 mt-1">查看你今日的模型 Tokens 使用情况</p>
        </div>

        {/* Overview Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 relative overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 orb-blue opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900">今日总消耗</h2>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-bold text-gray-900">{totalUsed.toLocaleString()}</span>
              <span className="text-gray-400 mb-1">/ {totalLimit.toLocaleString()} Tokens</span>
            </div>
            <Progress value={(totalUsed / totalLimit) * 100} className="h-2" />
            <p className="text-xs text-gray-400 mt-2">
              已使用 {((totalUsed / totalLimit) * 100).toFixed(1)}%，每日 0 点重置
            </p>
          </div>
        </div>

        {/* Per-model quota */}
        <div className="space-y-4">
          {QUOTA_DATA.map((item) => {
            const pct = (item.used / item.dailyLimit) * 100;
            const isWarning = pct > 80;
            return (
              <div key={item.model}
                className="bg-white rounded-2xl border border-gray-100 p-5"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <Brain className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.model}</p>
                      <p className="text-xs text-gray-400">{item.version}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{item.used.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">/ {item.dailyLimit.toLocaleString()}</p>
                  </div>
                </div>
                <Progress value={pct} className="h-1.5" />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${isWarning ? "text-orange-500" : "text-gray-400"}`}>
                    {isWarning && <AlertCircle className="w-3 h-3 inline mr-1" />}
                    已使用 {pct.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-400">
                    剩余 {(item.dailyLimit - item.used).toLocaleString()} Tokens
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          额度由企业管理员统一配置，如需调整请联系管理员
        </p>
      </div>
    </TenantLayout>
  );
}
