/**
 * Features - 平台功能与特色（4 卡 + 柱状图）
 */
const CHART_BARS: Array<{ heights: [number, number, number] }> = [
  { heights: [60, 80, 50] },
  { heights: [75, 95, 75] },
  { heights: [75, 55, 75] },
];

export default function Features() {
  return (
    <div className="section-wrapper features-section">
      <div
        className="section-inner"
        style={{ border: "1px #E2E8F0 solid", background: "#FCFCFC", height: "100%", overflow: "hidden" }}
      >
        <div className="features-header">
          <div className="section-label">功能简介</div>
          <div className="section-title" style={{ marginTop: 8 }}>
            ClawPro 平台的功能与特色
          </div>
          <div className="section-desc" style={{ marginTop: 8 }}>
            专为企业场景设计，提供完善的管控能力和极致的使用体验
          </div>
        </div>

        <div className="features-grid">
          {/* 左大卡：云端部署 */}
          <div className="feature-card feature-card-large-left">
            <div className="feature-card-title">云端部署，24小时随时可用</div>
            <div className="feature-card-desc">
              部署在腾讯云服务器上，7×24 小时稳定运行，随时随地通过 IM 工具与你的 AI 助理对话。
            </div>
            <div className="cloud-illust">
              <img className="cloud-illust-static" src="/landing-assets/banner/cloud-illust-static.png" alt="云端部署" />
              <video
                className="cloud-illust-video"
                src="/landing-assets/banner/cloud-illust-video.mp4"
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* 中上卡：多用户协同 */}
          <div className="feature-card feature-card-mid-top collab-card">
            <div className="feature-card-title">多用户协同</div>
            <div className="feature-card-desc">
              支持企业内多名用户各自创建和管理专属 Agent，统一在企业账号体系下管理，互不干扰。
            </div>
            <div className="collab-illust">
              <img
                className="collab-illust-static"
                src="/landing-assets/banner/collab-illust-static.png"
                alt="多用户协同"
              />
              <video
                className="collab-illust-video"
                src="/landing-assets/banner/collab-illust.mp4"
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* 中下卡：集中化配置 */}
          <div className="feature-card feature-card-mid-bottom">
            <div className="feature-card-title">集中化配置管理</div>
            <div className="feature-card-desc">
              管理员可统一配置可用模型、通道和帮助文档，员工无需关心底层配置，专注于使用 AI 提升工作效率。
            </div>
            <div className="config-illust">
              <img className="config-img-1" src="/landing-assets/banner/config-illust-1.png" alt="" />
              <img className="config-img-2" src="/landing-assets/banner/config-illust-2.png" alt="" />
              <img className="config-img-3" src="/landing-assets/banner/config-illust-3.png" alt="" />
              <span className="config-line" aria-hidden="true" />
            </div>
          </div>

          {/* 右大卡：实时监控 */}
          <div className="feature-card feature-card-large-right">
            <div className="feature-card-title">实时监控与审计</div>
            <div className="feature-card-desc">
              全面的运营监控面板，实时掌握 Agent 运行状态和 Tokens 消耗情况，操作记录全程可追溯。
            </div>
            <div style={{ marginTop: 32 }}>
              <div className="chart-container">
                <div className="chart-legend">
                  <div className="chart-legend-item">
                    <img src="/landing-assets/111.svg" alt="" width={12} height={12} /> kimi-k2.5
                  </div>
                  <div className="chart-legend-item">
                    <img src="/landing-assets/112.svg" alt="" width={12} height={12} /> DeepSeek
                  </div>
                  <div className="chart-legend-item">
                    <img src="/landing-assets/113.svg" alt="" width={12} height={12} /> Hy3 preview
                  </div>
                </div>
                <div className="chart-plot">
                  <div className="chart-y-axis">
                    {[100, 80, 60, 40, 20, 0].map((v) => (
                      <span className="chart-y-label" key={v}>
                        {v}
                      </span>
                    ))}
                  </div>
                  <div className="chart-bars">
                    {CHART_BARS.map((g, i) => (
                      <div className="chart-bar-group" key={i}>
                        <div className="chart-bar chart-bar-green" style={{ height: `${g.heights[0]}%` }} />
                        <div className="chart-bar chart-bar-blue" style={{ height: `${g.heights[1]}%` }} />
                        <div className="chart-bar chart-bar-purple" style={{ height: `${g.heights[2]}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-bar" />
                    <div className="chart-tooltip-label">Tookens 请求数：</div>
                    <div className="chart-tooltip-value">52,250</div>
                  </div>
                </div>
                <div className="chart-x-axis">
                  <span />
                  <div className="chart-x-axis-inner">
                    <span className="chart-x-label">July</span>
                    <span className="chart-x-label">August</span>
                    <span className="chart-x-label">September</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
