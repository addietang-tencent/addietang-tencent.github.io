/**
 * QuickStartGuide - 快速上手三步引导
 * 严格对齐 Figma node 358:2341：
 *   - 浅蓝渐变背景 + 底部边线 #E2E8F0
 *   - 容器 padding: 20px 24px 20px 42px、gap 24px（行）
 *   - 三步：创建 Agent → 配置模型 → 开启通道（可选）
 *   - 每步：24x24 步骤图标 + Step1/2/3 (Menlo Bold #1447E6) + 主标题 (PingFang SC Medium 14) + 副描述 (pingfangsc Regular 12 #737373)
 *   - 步骤间 16x16 灰色箭头分隔（#BBC0CA）
 *   - 右下角 Demo_Dot 装饰（用 360x120 渐变 + 大椭圆 blur 模拟）
 *   - 右上角关闭按钮
 */
import { ArrowRight, MousePointerClick, Settings2, MessagesSquare, X } from "lucide-react";

interface QuickStartGuideProps {
  onClose: () => void;
}

interface Step {
  index: 1 | 2 | 3;
  Icon: typeof MousePointerClick;
  title: string;
  description: string;
  optional?: boolean;
}

const STEPS: Step[] = [
  {
    index: 1,
    Icon: MousePointerClick,
    title: "创建 Agent",
    description: "点击「创建 Agent」，为你的 Agent 取一个名字",
  },
  {
    index: 2,
    Icon: Settings2,
    title: "配置模型，在浏览器中对话",
    description: "进入「详细配置」，配置一个可用的 AI 模型",
  },
  {
    index: 3,
    Icon: MessagesSquare,
    title: "开启通道，在聊天软件中对话",
    description: "配置完成，即可在下方对话视图直接与 Agent 对话",
    optional: true,
  },
];

export const QuickStartGuide = ({ onClose }: QuickStartGuideProps) => {
  return (
    <div
      className="relative overflow-hidden mb-5"
      style={{
        background:
          "linear-gradient(90deg, rgba(250,252,255,1) 0%, rgba(246,248,255,1) 54%, rgba(231,237,255,1) 100%)",
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      {/* 右下 Demo_Dot 装饰：用大椭圆光晕 + 局部蓝色高光模拟 Figma 龙虾 IP 装饰 */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          right: "-80px",
          bottom: "-160px",
          width: "709px",
          height: "447px",
          background: "rgba(186,202,255,0.5)",
          borderRadius: "9999px",
          filter: "blur(80px)",
        }}
      />
      {/* 右下方装饰：流体蓝图 IP 暗示（用径向光晕代替图片） */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          right: "20px",
          bottom: "-40px",
          width: "360px",
          height: "160px",
          background: [
            "radial-gradient(ellipse at 60% 50%, rgba(20,71,230,0.18) 0%, rgba(20,71,230,0) 65%)",
            "radial-gradient(ellipse at 80% 30%, rgba(88,86,214,0.15) 0%, rgba(88,86,214,0) 60%)",
          ].join(", "),
        }}
      />

      {/* 关闭按钮 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭快速上手"
        className="absolute top-3 right-3 z-20 w-6 h-6 rounded-[4px] flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] hover:bg-white/50 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* 三步引导主体（pl-[42px] pr-6 py-5 / row gap-6） */}
      <div
        className="relative z-10 flex items-center"
        style={{
          padding: "20px 24px 20px 42px",
          gap: "24px",
        }}
      >
        {STEPS.map((step, idx) => {
          const Icon = step.Icon;
          return (
            <div key={step.index} className="flex items-center flex-1 min-w-0 gap-3">
              {/* 24x24 步骤图标：白底蓝图标 + 蓝色边框，对齐 Figma 步骤一/二/三 */}
              <div
                className="flex-shrink-0 w-6 h-6 rounded-[4px] flex items-center justify-center"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(20,71,230,0.20)",
                  boxShadow: "0 1px 2px rgba(20,71,230,0.10)", // allow-shadow: 24x24 步骤图标内描边阴影，非卡片
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: "#1447E6" }} />
              </div>

              {/* 文案 */}
              <div className="flex flex-col min-w-0" style={{ gap: "2px" }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    style={{
                      fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                      fontWeight: 700,
                      fontSize: "13px",
                      lineHeight: "24px",
                      color: "#1447E6",
                    }}
                  >
                    Step{step.index}
                  </span>
                  <span
                    className="truncate"
                    style={{
                      fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "22px",
                      color: "#0A0A0A",
                    }}
                  >
                    {step.title}
                  </span>
                  {step.optional && (
                    <span
                      style={{
                        fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
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
                <p
                  style={{
                    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "20px",
                    color: "#737373",
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>

              {/* 箭头分隔 16x16 #BBC0CA */}
              {idx < STEPS.length - 1 && (
                <ArrowRight
                  className="w-4 h-4 flex-shrink-0 ml-2"
                  style={{ color: "#BBC0CA" }}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
