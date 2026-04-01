/**
 * AdminModeToggle - 管控端模式切换 Toggle
 * iOS 风格 Toggle 开关：左侧「标准模式」，右侧「自定义模式」
 * 默认激活标准模式（左侧）
 */
import { useAdminMode } from "@/contexts/AdminModeContext";

export default function AdminModeToggle({ collapsed }: { collapsed: boolean }) {
  const { mode, setMode } = useAdminMode();
  const isCustom = mode === "custom";

  return (
    <div className={`px-3 pb-3 ${collapsed ? "flex justify-center" : ""}`}>
      {collapsed ? (
        /* 折叠状态：只显示小圆点指示当前模式 */
        <button
          onClick={() => setMode(isCustom ? "standard" : "custom")}
          title={isCustom ? "当前：自定义模式，点击切换到标准模式" : "当前：标准模式，点击切换到自定义模式"}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <div
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              isCustom ? "bg-violet-500" : "bg-blue-500"
            }`}
          />
        </button>
      ) : (
        /* 展开状态：完整 Toggle */
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase px-1">运行模式</p>
          <div className="flex items-center gap-2">
            {/* 标准模式标签 */}
            <span
              className={`text-xs transition-colors duration-200 ${
                !isCustom ? "text-blue-600 font-semibold" : "text-gray-400"
              }`}
            >
              标准
            </span>

            {/* Toggle 轨道 */}
            <button
              role="switch"
              aria-checked={isCustom}
              onClick={() => setMode(isCustom ? "standard" : "custom")}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                isCustom
                  ? "bg-violet-500 focus-visible:ring-violet-400"
                  : "bg-blue-500 focus-visible:ring-blue-400"
              }`}
            >
              {/* 滑块 */}
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  isCustom ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>

            {/* 自定义模式标签 */}
            <span
              className={`text-xs transition-colors duration-200 ${
                isCustom ? "text-violet-600 font-semibold" : "text-gray-400"
              }`}
            >
              自定义
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
