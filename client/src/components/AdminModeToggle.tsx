/**
 * AdminModeToggle - 管控端模式切换 Toggle
 * iOS 风格 Toggle 开关：左侧「标准模式」，右侧「自定义模式」
 * 默认激活标准模式（左侧）
 *
 * 修复：加宽轨道（w-14 h-6），滑块（w-5 h-5）完全在轨道内滑动，不遮挡两侧文字
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
          <p className="text-[10px] text-gray-400 font-medium tracking-wide px-1">成员管理模式</p>
          <div className="flex items-center gap-2">
            {/* 标准模式标签 */}
            <span
              className={`text-xs transition-colors duration-200 flex-shrink-0 ${
                !isCustom ? "text-blue-600 font-semibold" : "text-gray-400"
              }`}
            >
              标准
            </span>

            {/* Toggle 轨道：w-14 h-6，滑块 w-5 h-5，留 2px 边距，完全在轨道内 */}
            <button
              role="switch"
              aria-checked={isCustom}
              onClick={() => setMode(isCustom ? "standard" : "custom")}
              className={`relative flex-shrink-0 w-14 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                isCustom
                  ? "bg-violet-500 focus-visible:ring-violet-400"
                  : "bg-blue-500 focus-visible:ring-blue-400"
              }`}
            >
              {/* 滑块：w-5 h-5，轨道内偏移：左侧 translate-x-0.5，右侧 translate-x-[34px] */}
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  isCustom ? "translate-x-[34px]" : "translate-x-0.5"
                }`}
              />
            </button>

            {/* 自定义模式标签 */}
            <span
              className={`text-xs transition-colors duration-200 flex-shrink-0 ${
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
