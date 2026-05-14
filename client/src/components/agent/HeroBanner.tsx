/**
 * HeroBanner - 我的 Agent 页面顶部欢迎条幅
 * 严格对齐 Figma node 358:2325「页面引导语」：
 *   - 容器：固定 112px 高、padding 0 42px、column/center、gap 8px
 *   - 上下边线 #E2E8F0（strokeWeight: 0 1，对应仅上下边）
 *   - 大字标题：PingFang SC Medium 26/35.56，黑→蓝渐变文字（#0A0A0A → #1447E6）
 *   - 副文案：PingFang SC Regular 12/22.22，颜色 #737373
 *   - 右侧 640x112 装饰位（无外部图，使用与 Figma 一致的多层径向渐变 + 流体感装饰）
 */
export const HeroBanner = () => {
  return (
    <div
      className="relative overflow-hidden mb-5"
      style={{
        height: "112px",
        padding: "0 42px",
        borderTop: "1px solid #E2E8F0",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      {/* 右侧 640x112 装饰区，对齐 Figma 358:2326 */}
      <div
        aria-hidden
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: "640px",
          height: "112px",
          background: [
            // 主光晕：蓝色，从右上向左下扩散
            "radial-gradient(circle at 80% 30%, rgba(20,71,230,0.20) 0%, rgba(20,71,230,0) 55%)",
            // 副光晕：紫色，从右下向左上扩散
            "radial-gradient(circle at 95% 75%, rgba(88,86,214,0.18) 0%, rgba(88,86,214,0) 50%)",
            // 边缘高光：白色提亮
            "radial-gradient(ellipse at 100% 50%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%)",
          ].join(", "),
        }}
      />

      {/* 装饰：右侧浮动小圆球（流体蓝图风格点缀） */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          right: "120px",
          top: "30px",
          width: "8px",
          height: "8px",
          borderRadius: "9999px",
          background: "#1447E6",
          opacity: 0.6,
          boxShadow: "0 0 12px rgba(20,71,230,0.6)",
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          right: "60px",
          top: "70px",
          width: "5px",
          height: "5px",
          borderRadius: "9999px",
          background: "#5856D6",
          opacity: 0.5,
          boxShadow: "0 0 8px rgba(88,86,214,0.5)",
        }}
      />

      {/* 文案区 */}
      <div className="relative z-10">
        <h1
          style={{
            fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: 500,
            fontSize: "26px",
            lineHeight: "35.56px",
            letterSpacing: "-1.11px",
            backgroundImage: "linear-gradient(90deg, #0A0A0A 0%, #1447E6 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            margin: 0,
          }}
        >
          快速创建你的专属 AI 助理
        </h1>
      </div>
      <p
        className="relative z-10"
        style={{
          fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "22.22px",
          letterSpacing: "0.18px",
          color: "#737373",
          margin: 0,
        }}
      >
        对话即可完成各种工作任务，多模型接入、多平台链接，随时随地提升工作效率
      </p>
    </div>
  );
};
