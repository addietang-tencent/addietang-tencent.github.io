import { useState } from "react";
import { ChevronLeft, ChevronRight, Zap, Database, Layers, User, FileText } from "lucide-react";

// 金字塔层级数据
const pyramidLevels = [
  {
    id: "L3",
    name: "Persona",
    label: "L3 Persona",
    description: "稳定的用户偏好与服务方式画像，让 Agent 按用户习惯协作",
    color: "from-indigo-400 to-indigo-500",
  },
  {
    id: "L2",
    name: "Scene Block",
    label: "L2 Scene Block",
    description: "按项目/主题/工作流场景聚类，带上下文召回，减少串场误用",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "L1",
    name: "Atomic Memory",
    label: "L1 Atomic Memory",
    description: "自动提取事实、偏好、约束、状态，从噪音中稳定抽出关键信息",
    color: "from-indigo-600 to-indigo-700",
  },
  {
    id: "L0",
    name: "Raw Log",
    label: "L0 Raw Log",
    description: "全量保留原始对话与事件流，确保原始信息不丢失，证据兜底",
    color: "from-indigo-700 to-indigo-800",
  },
];

// 评测数据
const benchmarkData = [
  {
    category: "用户事实召回",
    openclaw: 29.63,
    mem0: 58.82,
    tdai: 79.07,
  },
  {
    category: "偏好演变跟踪",
    openclaw: 66.67,
    mem0: 75.54,
    tdai: 83.45,
  },
  {
    category: "个性化推荐",
    openclaw: 46.67,
    mem0: 68.75,
    tdai: 76.36,
  },
  {
    category: "场景泛化",
    openclaw: 31.58,
    mem0: 77.19,
    tdai: 78.95,
  },
  {
    category: "总准确率",
    openclaw: 47.85,
    mem0: 71.0,
    tdai: 76.1,
  },
];

// 流程步骤
const flowSteps = ["碎片对话", "结构事实", "场景认知", "服务画像"];

// 最低支持版本
const MIN_SUPPORTED_VERSION = "3.24";

interface MemoryPreviewProps {
  memoryServiceEnabled?: boolean; // 管控端是否开启 Memory 服务
  openclawVersion?: string; // 当前 OpenClaw 版本，如 "3.20", "3.24"
}

// 版本比较函数
function isVersionSupported(version: string | undefined): boolean {
  if (!version) return false;
  const current = version.split('.').map(Number);
  const min = MIN_SUPPORTED_VERSION.split('.').map(Number);
  
  for (let i = 0; i < Math.max(current.length, min.length); i++) {
    const c = current[i] || 0;
    const m = min[i] || 0;
    if (c > m) return true;
    if (c < m) return false;
  }
  return true;
}

export function MemoryPreview({ memoryServiceEnabled = true, openclawVersion }: MemoryPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 2;
  
  const isVersionOk = isVersionSupported(openclawVersion);
  
  // 状态判断：场景1(服务未开启) > 场景2(版本不支持) > 场景3(正常使用)
  const serviceStatus: 'disabled' | 'version_unsupported' | 'available' = 
    !memoryServiceEnabled ? 'disabled' : 
    !isVersionOk ? 'version_unsupported' : 
    'available';

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* 头部标题 */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-2">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-gray-900">Memory Free 版</h2>
              {/* 状态标签 - 根据服务状态显示不同内容 */}
              {serviceStatus === 'available' ? (
                <>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-green-700 text-xs font-medium">已开启</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-indigo-700 text-xs font-medium">记忆预览功能即将上线</span>
                  </div>
                </>
              ) : serviceStatus === 'version_unsupported' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span className="text-amber-700 text-xs font-medium">暂不支持</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600 text-xs font-medium">未开启</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">让 AI 智能体真正理解你、记住你，长期保持一致的工作习惯与决策偏好。由腾讯云数据库 Agent Memory 服务提供支持。</p>
          </div>
        </div>
      </div>

      {/* 特性说明卡片 */}
      <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1" style={{ gridTemplateRows: '1fr 1fr' }}>
        <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all flex items-center min-h-[120px]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">记忆更稳定</h4>
              <p className="text-gray-500 text-sm leading-relaxed">自动记住你的偏好和习惯，无需手动设置</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all flex items-center min-h-[120px]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">理解更深刻</h4>
              <p className="text-gray-500 text-sm leading-relaxed">不只记住你说过什么，更理解你是谁，你想要什么</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all flex items-center min-h-[120px]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">检索更精准</h4>
              <p className="text-gray-500 text-sm leading-relaxed">需要时精准找到相关记忆，减少重复沟通</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all flex items-center min-h-[120px]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">跨会话不断线</h4>
              <p className="text-gray-500 text-sm leading-relaxed">换个聊天窗口也不会忘记之前的对话</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemoryPreview;
