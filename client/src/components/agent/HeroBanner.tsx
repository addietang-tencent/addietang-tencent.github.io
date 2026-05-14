/**
 * HeroBanner - 我的 Agent 页面顶部欢迎条幅
 *
 * 严格 1:1 对齐 Figma 节点 358:2325（默认态）/ 363:5079（QuickStart 关闭态）：
 *
 *   358:2325 「页面引导语」（默认态：QuickStart 展开）
 *     ├ height 112 / padding 0 42px / column / center / gap 8
 *     ├ stroke: 仅左右 1px #E2E8F0（strokeWeight: 0 1px）
 *     ├ background: 透明（无底色）
 *     ├─ 标题: PingFang SC Medium 26/35.56 / letter -4.27%
 *     │       fill: linear-gradient(90deg, #0A0A0A → #1447E6)
 *     └─ 副文案: PingFang SC Regular 12/22.22 / letter 1.5% / #737373
 *
 *   363:5079 「页面引导语」（QuickStart 关闭态）
 *     ├ ...同上...
 *     └─ Frame 2147227607 (row / align-center / gap 8 / hug × hug)
 *         ├─ 副文案（同 358:2332）
 *         └─ 363:5487 「查看步骤指引」按钮 - row / center / padding 2 8 / radius 2
 *             ├ fill: linear-gradient(90deg, #FFFFFF 0% → #EFF3FF 100%)
 *             ├ stroke 1px #E4E8F5
 *             └ 文字: PingFang SC Regular 12/20 #020617
 *
 * NOTE:
 *   1. HeroBanner 区域无任何底色/渐变背景，保持纯白。
 *   2. 底部 1px 分割线左右各外延 80px 贯穿矩阵带，直达视口边缘。
 *   3. HeroBanner 自身无 margin-bottom，与下方 QuickStartGuide 紧贴
 *      （两者之间靠 HeroBanner 底部分割线作为视觉接缝）。
 */
interface HeroBannerProps {
  /**
   * 当 QuickStartGuide 已关闭时传入此回调，HeroBanner 副文右侧会渲染
   * 「查看步骤指引」按钮，点击重新唤起 QuickStartGuide。
   * 不传则不渲染按钮（QuickStart 展开态）。
   */
  onShowQuickStart?: () => void;
}

export const HeroBanner = ({ onShowQuickStart }: HeroBannerProps) => {
  return (
    // 外层包裹严格固定 112px，与下方紧贴；防止内部副文+按钮换行时把容器撑高
    // 底部分割线由绝对定位的子元素实现「100vw」贯穿全视口
    <div className="relative" style={{ height: "112px" }}>
      {/* 358:2325 / 363:5079 - 页面引导语：高 112 / padding 0 42 / 左右竖线 / 无底色
          overflow:hidden 兜底，防止副文/按钮意外换行撑高 */}
      <div
        style={{
          height: "112px",
          padding: "0 42px",
          borderLeft: "1px solid #E2E8F0",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "8px",
          overflow: "hidden",
        }}
      >
        {/* 主标题：黑→蓝渐变文字 */}
        <h1
          style={{
            fontFamily:
              "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 500,
            fontSize: "26px",
            lineHeight: "35.56px",
            letterSpacing: "-4.27%",
            margin: 0,
            backgroundImage:
              "linear-gradient(90deg, #0A0A0A 0%, #1447E6 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            // 单行宽度自适应（hug），不强制断行
            width: "fit-content",
          }}
        >
          快速创建你的专属 AI 助理
        </h1>

        {/*
          副文 + 「查看步骤指引」按钮 - Figma 363:5486 row gap 8 align-center hug
          只有传入 onShowQuickStart 时才渲染按钮（即 QuickStart 已被关闭时）
        */}
        <div className="flex items-center" style={{ gap: "8px" }}>
          {/* 副文案：muted-foreground */}
          <p
            style={{
              fontFamily:
                "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "22.22px",
              letterSpacing: "1.5%",
              color: "#737373",
              margin: 0,
            }}
          >
            对话即可完成各种工作任务，多模型接入、多平台链接，随时随地提升工作效率
          </p>

          {/*
            363:5487 「查看步骤指引」按钮
            row / center / padding 2px 8px / gap 10 / radius 2
            fill 渐变 #FFFFFF→#EFF3FF / stroke 1px #E4E8F5
          */}
          {onShowQuickStart && (
            <button
              type="button"
              onClick={onShowQuickStart}
              className="inline-flex items-center justify-center transition-colors"
              style={{
                padding: "2px 8px",
                gap: "10px",
                borderRadius: "2px",
                background:
                  "linear-gradient(90deg, #FFFFFF 0%, #EFF3FF 100%)",
                border: "1px solid #E4E8F5",
              }}
            >
              <span
                style={{
                  fontFamily:
                    "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "20px",
                  color: "#020617",
                  whiteSpace: "nowrap",
                }}
              >
                查看步骤指引
              </span>
            </button>
          )}
        </div>
      </div>

      {/*
        贯穿底部分割线：用 100vw + calc(50% - 50vw) 让线横跨整个视口宽度，
        在 >1920px 大屏下也能左右真正顶到视口边缘（页面外层有 overflow-x-clip 兜底防止水平滚动）。
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: "calc(50% - 50vw)",
          width: "100vw",
          bottom: 0,
          height: "1px",
          backgroundColor: "#E2E8F0",
        }}
      />
    </div>
  );
};
