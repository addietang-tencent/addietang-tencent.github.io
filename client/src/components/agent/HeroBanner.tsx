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
 *     │       fill: linear-gradient(90deg, #0A0A0A → #355EF1)
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
          overflow:hidden 兜底，防止副文/按钮意外换行撑高
          alignItems: flex-start 让子元素宽度 hug 内容，避免标题用 fit-content 时
          每次父级 reflow 都重新测量渐变文字宽度（这是关闭 QuickStart 时标题抖动的根因之一）*/}
      <div
        style={{
          height: "112px",
          padding: "0 42px",
          borderLeft: "1px solid #E2E8F0",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "8px",
          overflow: "hidden",
        }}
      >
        {/* 主标题：黑→蓝渐变文字
            - 用 inline-block + alignSelf:flex-start 让宽度 hug 内容，
              比 width: fit-content 在父级 flex 重排时更稳定（不会反复重测内容宽度）。
            - transform: translateZ(0) 把标题提升到独立合成层，
              关闭 QuickStartGuide 时父级 DOM 变更不会触发渐变文字的子像素重绘抖动。 */}
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
              "linear-gradient(90deg, #0A0A0A 0%, #355EF1 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            display: "inline-block",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        >
          快速创建你的专属 AI 助理
        </h1>

        {/*
          副文 + 「查看步骤指引」按钮 - Figma 363:5486 row gap 8 align-center hug
          只有传入 onShowQuickStart 时才渲染按钮（即 QuickStart 已被关闭时）

          ⚠️ 抖动修复：两态副文行的渲染高度不同会导致标题跳动 ——
            · 展开态：只有 <p>，外盒高度 = lineHeight 22.22px
            · 关闭态：<p> + 按钮，外盒高度被按钮（padding 2/2 + border 1/1 + 内文 20 = 26px）撑高到 ~26px
            高度差 ~3.78px，叠加父级 column flex justify-center 后，标题 y 坐标
            会瞬时上移 ~1.89px，肉眼看就是关闭瞬间「标题抖一下」。
          解法：把副文行外盒高度恒定锁在 26px（按钮态高度），两态都不再变化。
        */}
        <div
          className="flex items-center"
          style={{ gap: "8px", height: "26px" }}
        >
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
