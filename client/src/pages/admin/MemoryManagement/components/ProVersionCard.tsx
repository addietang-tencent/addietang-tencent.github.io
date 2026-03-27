import React from 'react';

/**
 * Pro 版升级卡片
 * 
 * 设计特点：
 * - 紫色渐变背景
 * - 左侧文字 + 右侧升级按钮
 * - 背景装饰（伪元素圆形）
 */
export const ProVersionCard: React.FC = () => {
  return (
    <div className="relative rounded-[14px] overflow-hidden mb-5 shadow-[0_1px_4px_rgba(0,0,0,.03)]">
      {/* 背景渐变 */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#4338CA] via-[#6D28D9] to-[#7C3AED]"
        style={{
          background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 40%, #7C3AED 100%)',
        }}
      />

      {/* 背景装饰圆形 1 */}
      <div
        className="absolute rounded-full opacity-10"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,.8) 0%, transparent 70%)',
          top: '-50%',
          right: '-20%',
        }}
      />

      {/* 背景装饰圆形 2 */}
      <div
        className="absolute rounded-full opacity-5"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,.8) 0%, transparent 70%)',
          bottom: '-30%',
          left: '-10%',
        }}
      />

      {/* 内容容器 */}
      <div className="relative z-10 px-9 py-8 flex items-center justify-between gap-6">
        {/* 左侧内容 */}
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              TDAI-Memory Pro 版
            </h2>
          </div>

          <h3 className="text-[13.5px] text-white text-opacity-80 mb-3">
            基于腾讯云向量数据库的企业级记忆服务
          </h3>

          <p className="text-[13.5px] text-white text-opacity-80 leading-relaxed">
            Pro 版 = Free 版全部能力 + 腾讯云向量数据库（内置 Embedding），让 OpenClaw 从个人增强插件升级为企业级 AI Agent 记忆底座。
          </p>
        </div>

        {/* 右侧按钮 */}
        <div className="flex-shrink-0">
          <button
            disabled
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-[10px] text-sm font-semibold text-white border border-white border-opacity-30 transition-all duration-200 opacity-60 cursor-not-allowed"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span>即将到来</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
