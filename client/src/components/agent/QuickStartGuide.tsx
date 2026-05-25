/**
 * QuickStartGuide - 快速上手三步引导
 *
 * 严格 1:1 对齐 Figma node 1077:33857（数据来源：figma-framelink MCP 实时拉取）
 *
 *   1077:33857 「Frame」（旧节点 358:2341 的改稿）
 *     ├ layout: row / gap 24 / padding 20 24 20 42 / sizing fill x fixed(86)
 *     ├ borderRadius 12px
 *     ├ fill: linear-gradient(90deg, #E4F0FF 0% → #E5F6FF 50% → #BBD9FF 100%)
 *     ├ 不再有底边线（旧 358:2341 的 borderBottom #E2E8F0 在改稿中已移除）
 *     ├
 *     ├─ 358:2342 关闭 (绝对定位 x:1736 y:0 / 24×24)
 *     │     └ fill rgba(255,255,255,0.4) / borderRadius 0 0 0 20px
 *     │
 *     ├─ 358:2343 Step1 行 (layout_Y70E8S: row gap 16 fill x hug)
 *     │     ├─ 358:2344 icons (24×24, 步骤一图标)
 *     │     └─ 358:2345 文案块 (column gap 2)
 *     │           ├─ Frame (row gap 8) [Step1 (Menlo Bold 13/24 #355EF1) + 标题(PingFang SC Medium 14/22)]
 *     │           └─ 副文 (paragraph mini/regular: pingfangsc 12/20 #737373)
 *     │
 *     ├─ 358:2350 箭头 (16×16 vector, #BBC0CA)
 *     │
 *     ├─ 358:2351 Step2 行 (layout_0KQ8V4: row gap 12 fill x hug)
 *     │     ├─ 358:2352 icons (步骤二)
 *     │     └─ 文案：标题用 style_C05U2J (lh 24.44 而非 22)
 *     │
 *     ├─ 358:2358 箭头
 *     │
 *     ├─ 358:2359 Step3 行 (gap 12)
 *     │     └─ 文案：标题 + "可选"标签 (PingFang SC Regular 12/20 rgba(0,0,0,0.5))
 *     │
 *     └─ 358:2367 装饰 Group (绝对定位 x:1348.45 y:-157.71 / 709.28×446.69)
 *           ├─ Demo_Dot 360×120 (黑色横向蒙版 + 位图)  ← ⚠️ 暂未还原（见下方说明）
 *           └─ Ellipse 709×447 蓝色 rgba(186,202,255,0.5) blur(80)  ← 已还原
 *
 * 资源（已通过 figma-framelink MCP 下载到 public/figma-replica/quickstart/）：
 *   - step-1.svg / step-2.svg / step-3.svg：步骤一/二/三 的 24×24 图标
 *   - arrow-right.svg：16×16 箭头
 *   - close.svg：24×24 关闭按钮（左下圆角 20）
 *   - demo-dot.png：⚠️ 通过 imageRef 拉取，但实际是 800×600 **纯黑色**位图
 *                  Figma 画板上看到的"龙虾 IP"是设计师额外贴的占位素材
 *                  本工程暂不还原 Demo_Dot，等真实 IP 资源落地后再补。
 */
import { Fragment } from "react";

interface QuickStartGuideProps {
  onClose: () => void;
}

interface Step {
  index: 1 | 2 | 3;
  iconSrc: string;
  title: string;
  description: string;
  optional?: boolean;
  /** Step1 标题行高 22px，Step2/3 标题行高 24.44px（Figma style_KTGY3V vs style_C05U2J） */
  titleLineHeight: string;
  /** Step1 内部 gap 16px，Step2/3 内部 gap 12px（layout_Y70E8S vs layout_0KQ8V4） */
  rowGap: string;
}

const ASSET_BASE = "/figma-replica/quickstart";

const STEPS: Step[] = [
  {
    index: 1,
    iconSrc: `${ASSET_BASE}/step-1.svg`,
    title: "创建 Agent",
    description: "点击「创建 Agent」，为你的 Agent 取一个名字",
    titleLineHeight: "22px",
    rowGap: "16px",
  },
  {
    index: 2,
    iconSrc: `${ASSET_BASE}/step-2.svg`,
    title: "配置模型，在浏览器中对话",
    description: "进入「详细配置」，完成模型配置后，即可在对话视图直接进行对话",
    titleLineHeight: "24.44px",
    rowGap: "12px",
  },
  {
    index: 3,
    iconSrc: `${ASSET_BASE}/step-3.svg`,
    title: "开启通道，在聊天软件中对话",
    description: "您还可以配置通道，配置后即可开始在软件中与 Agent 对话",
    optional: true,
    titleLineHeight: "24.44px",
    rowGap: "12px",
  },
];

export const QuickStartGuide = ({ onClose }: QuickStartGuideProps) => {
  return (
    // 1077:33857 - 容器：渐变 + 圆角 12 + 段间距 20px
    <div
      className="relative overflow-hidden mb-5"
      style={{
        background:
          "linear-gradient(90deg, #E4F0FF 0%, #E5F6FF 50%, #BBD9FF 100%)",
        borderRadius: "12px",
      }}
    >
      {/*
        358:2367 装饰 Group：仅保留蓝色光晕椭圆（柔和氛围层）。

        ⚠️ 注意：Figma 原稿在 Group 内还有一个 358:2368 Demo_Dot（360×120 黑色横向
        蒙版 + 一张位图），但通过 figma-framelink MCP 拉取的 imageRef 位图本身是
        **纯黑色**（800×600 纯色 PNG）—— Figma 实际显示的"龙虾 IP"动效是设计师
        在画板上额外贴的占位元素，并非 imageRef 真实内容。如果按数据强行渲染，
        会得到一坨横向黑色渐变带（已验证 bug）。因此本工程仅保留蓝色光晕椭圆，
        Demo_Dot 留给后续真实素材落地后再补。

        Figma 原坐标 x:1348.45 y:-157.71，本工程容器宽度随视口变化，
        改为 right:0 / bottom:负值 贴右下角。
      */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          right: 0,
          bottom: "-158px",
          width: "709px",
          height: "447px",
        }}
      >
        {/* Ellipse 1114788：709×447 蓝色光晕 blur(80) */}
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(186,202,255,0.5)",
            borderRadius: "9999px",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/*
        358:2342 关闭按钮 - 24×24 / 仅左下圆角 20px / 背景 rgba(255,255,255,0.4)
        Figma 原坐标 x:1736 y:0，等价于贴右上角；hover 加深背景以暗示交互
      */}
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭快速上手"
        className="absolute top-0 right-0 z-20 w-6 h-6 flex items-center justify-center transition-colors hover:bg-white/60"
        style={{
          background: "rgba(255,255,255,0.4)",
          borderRadius: "0 0 0 20px",
        }}
      >
        {/* X 图标 - 来自 Figma 关闭组件 348:748，颜色 rgba(2,6,23,0.5) */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M2 2L10 10M10 2L2 10"
            stroke="rgba(2,6,23,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* 三步引导主体：358:2341 的 row layout - gap 24 / padding 20 24 20 42 */}
      <div
        className="relative z-10 flex items-center"
        style={{
          padding: "20px 24px 20px 42px",
          gap: "24px",
        }}
      >
        {STEPS.map((step, idx) => (
          <Fragment key={`step-${step.index}`}>
            {/* Step 行 - layout_Y70E8S(Step1, gap 16) / layout_0KQ8V4(Step2-3, gap 12) */}
            <div
              className="flex items-center flex-1 min-w-0"
              style={{ gap: step.rowGap }}
            >
              {/* 24×24 步骤图标 - 来自 Figma 组件库 311:356/357/359 */}
              <img
                src={step.iconSrc}
                alt=""
                aria-hidden
                className="flex-shrink-0"
                style={{ width: "24px", height: "24px" }}
              />

              {/* 文案块 layout_PYYERW: column gap 2 / hug × hug */}
              <div className="flex flex-col min-w-0" style={{ gap: "2px" }}>
                {/* 标题行 layout_KHPSRX: row align-center gap 8 / fill × hug */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    style={{
                      fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                      fontWeight: 700,
                      fontSize: "13px",
                      lineHeight: "24px",
                      color: "#355EF1",
                    }}
                  >
                    Step{step.index}
                  </span>
                  <span
                    className="truncate"
                    style={{
                      fontFamily:
                        "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: step.titleLineHeight,
                      letterSpacing: "0.5%",
                      color: "#0A0A0A",
                    }}
                  >
                    {step.title}
                  </span>
                  {step.optional && (
                    <span
                      style={{
                        fontFamily:
                          "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "20px",
                        color: "rgba(0,0,0,0.5)",
                      }}
                    >
                      可选
                    </span>
                  )}
                </div>
                {/* 副文 paragraph mini/regular */}
                <p
                  style={{
                    fontFamily:
                      "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "20px",
                    letterSpacing: "1.5%",
                    color: "#737373",
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>

            {/* 358:2350 / 358:2358 - 16×16 箭头分隔（独立兄弟节点，仅 step1→2 / step2→3 之间） */}
            {idx < STEPS.length - 1 && (
              <img
                src={`${ASSET_BASE}/arrow-right.svg`}
                alt=""
                aria-hidden
                className="flex-shrink-0"
                style={{ width: "16px", height: "16px" }}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};
