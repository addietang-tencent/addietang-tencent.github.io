/**
 * AdminModeToggle - 管控端成员管理模式切换
 * 分段选择器（Segmented Control）风格：
 * 圆角矩形容器，选中项白色卡片+阴影浮起，未选中项透明背景灰色文字
 * 默认激活标准模式
 */
import { useAdminMode } from "@/contexts/AdminModeContext";

export default function AdminModeToggle({ collapsed }: { collapsed: boolean }) {
  const { mode, setMode } = useAdminMode();
  const isCustom = mode === "custom";

  return (
    <div className={`px-3 pb-3 ${collapsed ? "flex justify-center" : ""}`}>
      {collapsed ? (
        /* 折叠状态：小圆点指示当前模式 */
        <button
          onClick={() => setMode(isCustom ? "standard" : "custom")}
          title={isCustom ? "当前：自定义模式，点击切换到标准模式" : "当前：标准模式，点击切换到自定义模式"}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <div
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              isCustom ? "bg-violet-500" : "bg-blue-500"
            }`}
          />
        </button>
      ) : (
        /* 展开状态：分段选择器 */
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-gray-400 font-medium px-0.5">成员管理模式</p>

          {/* 分段选择器容器 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {/* 标准模式 */}
            <button
              onClick={() => setMode("standard")}
              className={`
                flex-1 flex items-center justify-center gap-1 h-7 rounded-md text-xs font-medium
                transition-all duration-200 select-none
                ${!isCustom
                  ? "bg-white text-blue-600 shadow-sm shadow-black/10 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200 ${
                  !isCustom ? "bg-blue-500" : "bg-gray-400"
                }`}
              />
              标准
            </button>

            {/* 自定义模式 */}
            <button
              onClick={() => setMode("custom")}
              className={`
                flex-1 flex items-center justify-center gap-1 h-7 rounded-md text-xs font-medium
                transition-all duration-200 select-none
                ${isCustom
                  ? "bg-white text-violet-600 shadow-sm shadow-black/10 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200 ${
                  isCustom ? "bg-violet-500" : "bg-gray-400"
                }`}
              />
              自定义
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
