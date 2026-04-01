/**
 * StandardTokensMonitor - 标准模式·Tokens 监控页（留白占位）
 */
import { Construction } from "lucide-react";

export default function StandardTokensMonitor() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Construction className="w-7 h-7 text-blue-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800">标准模式 · Tokens 监控</h2>
        <p className="text-sm text-gray-400 mt-1">此页面正在建设中，敬请期待</p>
      </div>
      <div className="mt-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-100">
        <p className="text-xs text-blue-500">当前处于标准模式，页面内容与自定义模式不同</p>
      </div>
    </div>
  );
}
