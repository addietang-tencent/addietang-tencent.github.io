/**
 * Hero - 永辉版首屏
 * 渐变背景 + 标题区 + CTA + 浮动装饰 + 视觉复合层
 * 中央 Logo 与 Navbar、Footer 同步（来自 brandLogo store）
 *
 * 入场动画：所有 .yh-reveal 元素由父级 LandingPage 在挂载后统一触发，
 * 各元素通过 inline style 的 --yh-d 控制错峰延迟。
 */
import { useLocation } from "wouter";
import { useBrandLogo } from "./useBrandLogo";

export default function Hero() {
  const [, navigate] = useLocation();
  const logo = useBrandLogo();

  return (
    <section className="yh-hero">
      {/* ========== 背景层：banner-bg.png 静态铺底 ========== */}
      <img
        className="yh-hero-bg"
        src="/landing-assets/yh-features/banner-bg.png"
        alt=""
        aria-hidden="true"
      />

      {/* ========== 内容区（垂直 flex 居中） ========== */}
      <div className="yh-hero-content">
        {/* Badge: ClawPro Enterprise（距离导航 60px） */}
        <div
          className="yh-hero-badge yh-reveal"
          style={{ ["--yh-d" as never]: "0.05s" }}
        >
          <img
            src="/landing-assets/yonghui/1.svg"
            alt=""
            width={16}
            height={16}
          />
          <span>ClawPro Enterprise</span>
        </div>

        {/* 中央图标卡片 148×148（图标使用全局共享 Logo） */}
        <div
          className="yh-hero-icon-card yh-reveal"
          style={{ ["--yh-d" as never]: "0.20s" }}
        >
          <img
            src={logo}
            alt=""
            className="yh-hero-icon-card-logo"
          />
        </div>

        {/* 大标题（距离大图标 48px） - 整体淡入上移；保留原有渐变文字样式 */}
        <h1
          className="yh-hero-title yh-reveal"
          style={{ ["--yh-d" as never]: "0.40s" }}
        >
          永辉 AI Agent 管控平台
        </h1>

        {/* 副标题（距离大标题 16px） */}
        <p
          className="yh-hero-subtitle yh-reveal"
          style={{ ["--yh-d" as never]: "0.60s" }}
        >
          快速创建属于你的24小时 AI 私人助理，对话即可完成各种工作任务，随时随地提升工作效率
        </p>

        {/* CTA 按钮（距离副标题 48px） */}
        <button
          className="yh-hero-cta yh-reveal"
          style={{ ["--yh-d" as never]: "0.80s" }}
          onClick={() => navigate("/my-openclaw")}
        >
          立即创建
          <img
            src="/landing-assets/yh-features/arrow.png"
            alt=""
            width={24}
            height={24}
            className="yh-hero-cta-arrow"
          />
        </button>
      </div>

      {/* ========== 三步引导卡片（毛玻璃） ========== */}
      <div
        className="yh-steps-card yh-reveal"
        style={{ ["--yh-d" as never]: "1.00s" }}
      >
        {/* 装饰光晕 */}
        <div className="yh-steps-glow yh-steps-glow-1" />
        <div className="yh-steps-glow yh-steps-glow-2" />

        {/* Step 1 */}
        <div className="yh-step">
          <div className="yh-step-header">
            <span className="yh-step-num">Step1</span>
            <span className="yh-step-label">创建 Agent</span>
          </div>
          <p className="yh-step-desc">点击「创建 Agent」，为你的 Agent 取一个名字</p>
        </div>

        {/* 箭头 1→2 */}
        <img
          src="/landing-assets/yh-features/step-arrow.png"
          alt=""
          className="yh-step-arrow"
        />

        {/* Step 2 */}
        <div className="yh-step">
          <div className="yh-step-header">
            <span className="yh-step-num">Step2</span>
            <span className="yh-step-label">配置模型，在浏览器中对话</span>
          </div>
          <p className="yh-step-desc">进入「详细配置」，配置一个可用的 AI 模型</p>
        </div>

        {/* 箭头 2→3 */}
        <img
          src="/landing-assets/yh-features/step-arrow.png"
          alt=""
          className="yh-step-arrow"
        />

        {/* Step 3 */}
        <div className="yh-step">
          <div className="yh-step-header">
            <span className="yh-step-num">Step3</span>
            <span className="yh-step-label">开启通道，在聊天软件中对话</span>
          </div>
          <p className="yh-step-desc">配置完成，即可在下方对话视图直接与 Agent 对话</p>
        </div>
      </div>
    </section>
  );
}
