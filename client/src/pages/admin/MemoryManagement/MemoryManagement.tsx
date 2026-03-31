import { FreeVersionCard } from './components/FreeVersionCard';
import { ProVersionCard } from './components/ProVersionCard';

/**
 * 记忆管理页面
 * 
 * 设计特点：
 * - 展示 TDAI-Memory 记忆功能的能力对比
 * - 帮助管理员了解 Free 版和 Pro 版的差异
 * - 支持升级决策
 * 
 * 页面流程：
 * 1. Free 版介绍 + 启用/禁用开关
 * 2. Pro 版升级卡片 + Free vs Pro 对比表格
 */
export const MemoryManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f0f2f8] py-9 px-10">
      {/* 页面头部 */}
      <div className="mb-10 pb-8 border-b border-[#e8eaf0]">
        <h1 className="text-4xl font-bold text-[#1a1a2e] mb-3">
          记忆管理
        </h1>
        <p className="text-base text-[#6b7280] leading-relaxed">
          让 AI 智能体真正理解你、记住你，长期保持一致的工作习惯与决策偏好。由腾讯云数据库 Agent Memory 服务提供支持。
        </p>
      </div>

      {/* Free 版介绍卡片 */}
      <FreeVersionCard />

      {/* Pro 版卡片 + 对比表格 */}
      <ProVersionCard />
    </div>
  );
};

export default MemoryManagement;
