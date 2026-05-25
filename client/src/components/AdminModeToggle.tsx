/**
 * AdminModeToggle - 管控端成员管理模式切换
 * 分段选择器（Segmented Control）风格，三段：
 *   普通（custom）- 紫色
 *   oneid专用（standard）- 蓝色
 *   统一（unified）- 品牌渐变蓝紫
 * 选中项白色卡片+阴影浮起，未选中项透明背景灰色文字
 * 默认激活普通模式（custom）
 */
import { useAdminMode, type AdminMode } from "@/contexts/AdminModeContext";

const BRAND_GRADIENT = "linear-gradient(135deg, #007AFF, #5856D6)";

const ORDER: AdminMode[] = ["custom", "standard", "unified"];

const DOT_COLOR: Record<AdminMode, string> = {
  custom: "bg-violet-500",
  standard: "bg-blue-500",
  unified: "", // 渐变靠 inline style
};

const TEXT_COLOR: Record<AdminMode, string> = {
  custom: "text-violet-600",
  standard: "text-blue-600",
  unified: "text-transparent bg-clip-text",
};

const LABEL: Record<AdminMode, string> = {
  custom: "普通",
  standard: "oneid专用",
  unified: "统一",
};

export default function AdminModeToggle({ collapsed }: { collapsed: boolean }) {
  const { mode, setMode } = useAdminMode();

  /** 折叠态：点击循环切换到下一个模式 */
  const cycleMode = () => {
    const idx = ORDER.indexOf(mode);
    const next = ORDER[(idx + 1) % ORDER.length];
    setMode(next);
  };

  /** 折叠态指示点：unified 用渐变背景 */
  const collapsedDotStyle =
    mode === "unified" ? { background: BRAND_GRADIENT } : undefined;

  return (
    <div className={`px-3 pb-3 ${collapsed ? "flex justify-center" : ""}`}>
      {collapsed ? (
        /* 折叠状态：小圆点指示当前模式，点击循环 */
        <button
          onClick={cycleMode}
          title={`当前：${LABEL[mode]}模式，点击切换到下一个模式`}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <div
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${DOT_COLOR[mode]}`}
            style={collapsedDotStyle}
          />
        </button>
      ) : (
        /* 展开状态：分段选择器（三段） */
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-gray-400 font-medium px-0.5">成员管理模式</p>

          {/* 分段选择器容器 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {ORDER.map((m) => {
              const active = mode === m;
              const isUnifiedItem = m === "unified";

              // 选中文字色：unified 走渐变 text-clip
              const activeTextStyle =
                active && isUnifiedItem
                  ? {
                      backgroundImage: BRAND_GRADIENT,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }
                  : undefined;

              // 选中圆点：unified 用渐变 inline style
              const activeDotStyle =
                active && isUnifiedItem ? { background: BRAND_GRADIENT } : undefined;

              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`
                    flex-1 flex items-center justify-center gap-1 h-7 rounded-md text-xs font-medium
                    transition-all duration-200 select-none
                    ${active
                      ? `bg-white shadow-sm shadow-black/10 font-semibold ${
                          isUnifiedItem ? "" : TEXT_COLOR[m]
                        }`
                      : "text-gray-500 hover:text-gray-700"
                    }
                  `}
                  style={activeTextStyle}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200 ${
                      active && !isUnifiedItem ? DOT_COLOR[m] : !active ? "bg-gray-400" : ""
                    }`}
                    style={activeDotStyle}
                  />
                  {LABEL[m]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
