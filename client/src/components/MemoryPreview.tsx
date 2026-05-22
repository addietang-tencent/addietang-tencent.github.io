import { useState, useEffect } from "react";
import { Pagination } from "@/components/ui/pagination";
import { Zap, Database, Layers, User, FileText, ChevronRight, ChevronDown, ChevronLeft, ChevronUp, MessageSquare, ArrowUpDown, Shield, Crown, Loader2, Sparkles, Lock, Calendar, Target, Brain, Search, Link2, Clock, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusTag } from "@/components/ui/status-tag";

// Mock 数据 - Persona
const mockPersona = `# 用户画像

## 基本信息
- 名称：张三
- 角色：产品经理
- 偏好语言：简洁直接

## 工作习惯
- 喜欢在早晨处理重要任务
- 偏好使用 Markdown 格式记录
- 注重数据驱动决策

## 沟通风格
- 喜欢结构化的信息呈现
- 倾向于先看结论再看过程`;

// Mock 数据 - Scene Blocks（每个都是 md 文件，带有内容）
const mockSceneBlocks = [
  { 
    id: 's1', 
    name: '项目管理.md', 
    content: `# 项目管理场景

## 当前项目
- 正在负责 Memory Pro 产品的功能迭代
- 与后端团队协作开发 API 接口

## 项目习惯
- 使用 TAPD 进行任务管理
- 每周一进行 Sprint Planning`
  },
  { 
    id: 's2', 
    name: '技术调研.md', 
    content: `# 技术调研场景

## 关注技术栈
- React + TypeScript 前端开发
- 向量数据库与 RAG 技术

## 调研偏好
- 优先查看官方文档
- 喜欢对比多种方案的优缺点`
  },
  { 
    id: 's3', 
    name: '会议纪要.md', 
    content: `# 会议纪要场景

## 记录习惯
- 使用 Markdown 格式记录
- 重点标注行动项和负责人

## 常见会议
- 周会、技术评审、需求评审`
  },
  { 
    id: 's4', 
    name: '客户沟通.md', 
    content: `# 客户沟通场景

## 沟通渠道
- 企业微信群进行日常沟通
- 腾讯会议进行需求对齐

## 注意事项
- 记录客户的核心诉求
- 及时同步进展给客户`
  },
  { 
    id: 's5', 
    name: '产品设计.md', 
    content: `# 产品设计场景

## 设计工具
- Figma 进行原型设计
- 墨刀进行快速草图

## 设计原则
- 以用户为中心
- 保持界面简洁清晰`
  },
  { 
    id: 's6', 
    name: '数据分析.md', 
    content: `# 数据分析场景

## 分析工具
- SQL 查询数据库
- Excel 进行数据处理

## 分析维度
- 用户行为分析
- 功能使用率统计`
  },
  { 
    id: 's7', 
    name: '文档编写.md', 
    content: `# 文档编写场景

## 文档类型
- PRD 产品需求文档
- 技术方案文档

## 编写规范
- 结构清晰，分层明确
- 配图辅助说明`
  },
];

// Mock 数据 - Records
const mockRecords = [
  { id: 'r001', type: 'fact', tag: '工作', content: '用户是产品经理，负责 B 端产品线', confidence: 0.95 },
  { id: 'r002', type: 'preference', tag: '沟通', content: '偏好简洁直接的沟通方式，不喜欢冗长的解释', confidence: 0.88 },
  { id: 'r003', type: 'event', tag: '项目', content: '2026-03-28 完成了 Q1 产品规划评审', confidence: 0.92 },
  { id: 'r004', type: 'fact', tag: '技能', content: '熟悉 SQL 和基础数据分析', confidence: 0.85 },
  { id: 'r005', type: 'preference', tag: '工具', content: '常用 Figma 进行原型设计', confidence: 0.90 },
  { id: 'r006', type: 'fact', tag: '团队', content: '所在团队有 8 人，包含前后端和设计师', confidence: 0.87 },
  { id: 'r007', type: 'event', tag: '会议', content: '2026-04-01 参加了技术方案评审会议', confidence: 0.91 },
  { id: 'r008', type: 'preference', tag: '时间', content: '喜欢在上午处理复杂任务，下午处理沟通事务', confidence: 0.82 },
  { id: 'r009', type: 'fact', tag: '产品', content: '负责的产品月活用户约 10 万', confidence: 0.78 },
  { id: 'r010', type: 'event', tag: '发布', content: '2026-03-15 完成了 v2.3 版本的发布', confidence: 0.94 },
  { id: 'r011', type: 'preference', tag: '文档', content: '偏好使用 Markdown 格式编写文档', confidence: 0.89 },
  { id: 'r012', type: 'fact', tag: '技术', content: '对 AI 和大模型技术有浓厚兴趣', confidence: 0.86 },
];

// Mock 数据 - Conversations（平铺的消息列表，只有 sessionId，没有 title）
const mockConversations = [
  { id: 'c001', sessionId: 'session-001', role: 'user', content: '我想讨论一下 Memory Pro 的新功能需求，主要是关于记忆检索的优化。', time: '2026-04-03 10:30' },
  { id: 'c002', sessionId: 'session-001', role: 'assistant', content: '好的，关于记忆检索优化，您希望从哪些方面入手？比如检索速度、准确性还是用户体验？', time: '2026-04-03 10:31' },
  { id: 'c003', sessionId: 'session-001', role: 'user', content: '主要是准确性，目前语义匹配的效果还不够理想，有时候检索不到相关的记忆。', time: '2026-04-03 10:35' },
  { id: 'c004', sessionId: 'session-001', role: 'assistant', content: '理解了。针对语义匹配准确性的问题，我建议可以从以下几个方面优化：\n1. 优化 Embedding 模型的选择\n2. 调整向量相似度阈值\n3. 增加混合检索策略（关键词+语义）', time: '2026-04-03 10:36' },
  { id: 'c005', sessionId: 'session-002', role: 'user', content: '今天我们评审一下向量数据库的选型方案。', time: '2026-04-02 15:20' },
  { id: 'c006', sessionId: 'session-002', role: 'assistant', content: '好的，目前主流的向量数据库有 Milvus、Pinecone、Weaviate 等，您希望我从哪些维度进行对比分析？', time: '2026-04-02 15:21' },
  { id: 'c007', sessionId: 'session-002', role: 'user', content: '主要看性能、成本和易用性。', time: '2026-04-02 15:25' },
  { id: 'c008', sessionId: 'session-002', role: 'assistant', content: '从这三个维度来看：\n\n**性能**：Milvus 在大规模数据下表现优秀，支持多种索引类型\n\n**成本**：Milvus 开源免费，Pinecone 按用量付费\n\n**易用性**：Pinecone 托管服务更易上手，Milvus 需要自行运维', time: '2026-04-02 15:26' },
  { id: 'c009', sessionId: 'session-003', role: 'user', content: '最近收到了一些用户反馈，想和你一起分析一下。', time: '2026-04-01 09:45' },
  { id: 'c010', sessionId: 'session-003', role: 'assistant', content: '好的，请分享用户反馈的内容，我来帮您分析并提出改进建议。', time: '2026-04-01 09:46' },
  { id: 'c011', sessionId: 'session-003', role: 'user', content: '用户反映记忆管理界面不够直观，找不到想要的功能。', time: '2026-04-01 09:50' },
  { id: 'c012', sessionId: 'session-003', role: 'assistant', content: '这是一个 UX 问题。建议：\n1. 添加功能引导提示\n2. 优化导航结构，将常用功能前置\n3. 增加搜索功能，方便快速定位', time: '2026-04-01 09:51' },
  { id: 'c013', sessionId: 'session-004', role: 'user', content: '我们来讨论一下记忆服务的 API 接口设计。', time: '2026-03-31 14:20' },
  { id: 'c014', sessionId: 'session-004', role: 'assistant', content: '好的，关于记忆服务 API，我建议包含以下核心接口：\n1. 记忆写入 POST /memory\n2. 记忆检索 GET /memory/search\n3. 记忆更新 PUT /memory/{id}\n4. 记忆删除 DELETE /memory/{id}', time: '2026-03-31 14:21' },
  { id: 'c015', sessionId: 'session-005', role: 'user', content: '最近系统响应有点慢，想讨论下优化方案。', time: '2026-03-30 11:00' },
  { id: 'c016', sessionId: 'session-005', role: 'assistant', content: '了解，我们可以从以下几个方面入手：\n1. 数据库查询优化\n2. 缓存策略优化\n3. 前端渲染性能优化\n\n您想先从哪个方面开始？', time: '2026-03-30 11:01' },
  { id: 'c017', sessionId: 'session-006', role: 'user', content: '下个版本的发布计划是什么？', time: '2026-03-29 16:30' },
  { id: 'c018', sessionId: 'session-006', role: 'assistant', content: '根据之前的讨论，v2.4 版本计划包含：\n1. 记忆检索优化\n2. 新增批量导入功能\n3. UI 体验改进\n\n预计发布时间为 4 月中旬。', time: '2026-03-29 16:31' },
  { id: 'c019', sessionId: 'session-007', role: 'user', content: '帮我分析一下市面上的竞品。', time: '2026-03-28 10:15' },
  { id: 'c020', sessionId: 'session-007', role: 'assistant', content: '目前主要竞品包括：\n1. Mem0 - 开源记忆框架\n2. Zep - 长期记忆存储\n3. MemGPT - 自主记忆管理\n\n各有优缺点，您想深入了解哪个？', time: '2026-03-28 10:16' },
];

// Memory 状态类型：pro / free / none / upgrading（升级中）
type MemoryStatus = 'pro' | 'free' | 'none' | 'upgrading';

interface MemoryPreviewProps {
  // 当前实例的 Memory 状态
  memoryStatus?: MemoryStatus;
  // 是否在原子记忆中显示置信度列（默认 true）
  showConfidence?: boolean;
  // Pro 版额度是否可用
  proQuotaAvailable?: boolean;
  // Memory 状态变更回调
  onStatusChange?: (newStatus: MemoryStatus) => Promise<void>;
  // 是否正在加载数据（首次进入时加载）
  isLoading?: boolean;
  // [本期新增] 是否处于 Pro 免费体验期
  isFreeTrial?: boolean;
  // [本期新增] 免费体验预计结束时间（展示用字符串，如 "2026-06-30"）
  freeTrialEndDate?: string;
}

// 记忆类型标签组件
function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    fact: { bg: 'bg-blue-50', text: 'text-blue-600', label: '事实' },
    preference: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: '偏好' },
    event: { bg: 'bg-amber-50', text: 'text-amber-600', label: '事件' },
  };
  const c = config[type] || config.fact;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// Pro 版左侧导航项类型
type NavItem = 'persona' | 'scenes' | 'records' | 'conversations';

export function MemoryPreview({ 
  memoryStatus = 'none',
  showConfidence = true,
  proQuotaAvailable: _proQuotaAvailable = true,
  onStatusChange: _onStatusChange,
  isLoading = false,
  isFreeTrial = false,
  freeTrialEndDate,
}: MemoryPreviewProps) {
  const [activeNav, setActiveNav] = useState<NavItem>('persona');
  const [recordFilter, setRecordFilter] = useState<'all' | 'fact' | 'preference' | 'event'>('all');
  const [sortByConfidence, setSortByConfidence] = useState<'none' | 'asc' | 'desc'>('none');
  const [expandedScene, setExpandedScene] = useState<string | null>(mockSceneBlocks[0]?.id ?? null);
  
  // 对话记录状态
  const [convSessionFilter, setConvSessionFilter] = useState<string>('all');
  const [convSortOrder, setConvSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedConvId, setExpandedConvId] = useState<string | null>(null); // 当前展开的对话 ID
  
  // 时间筛选状态（默认选中近7天）
  const [convTimeFilter, setConvTimeFilter] = useState<'7days' | '30days' | 'custom'>('7days');
  const [convCustomStartDate, setConvCustomStartDate] = useState<string>('');
  const [convCustomEndDate, setConvCustomEndDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 每页显示条数（固定为 10）
  const pageSize = 10;

  // 免费体验期提示条（仅 Pro 且 isFreeTrial=true 时展示）
  const renderFreeTrialBanner = () => {
    if (!isFreeTrial) return null;
    return (
      <div className="mb-4 px-4 py-2.5 rounded-[4px] bg-amber-50 border border-amber-100 flex items-center gap-2 text-xs text-amber-700">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="leading-relaxed">
          当前处于 Pro 免费体验期
          {freeTrialEndDate && <> · 预计结束时间 <span className="font-medium">{freeTrialEndDate}</span></>}
          。免费期结束后不会自动扣费，如需延续请在控制台确认转为付费。
        </span>
      </div>
    );
  };

  // 分页状态
  const [scenesPage, setScenesPage] = useState(1);
  const [recordsPage, setRecordsPage] = useState(1);
  const [conversationsPage, setConversationsPage] = useState(1);

  // 过滤和排序记录
  const filteredRecords = mockRecords
    .filter(r => {
      if (recordFilter !== 'all' && r.type !== recordFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortByConfidence === 'asc') return a.confidence - b.confidence;
      if (sortByConfidence === 'desc') return b.confidence - a.confidence;
      return 0;
    });

  // 切换场景块展开状态（只允许展开一个）
  const toggleSceneExpand = (id: string) => {
    setExpandedScene(prev => prev === id ? null : id);
  };

  // 获取所有 sessionId 列表
  const sessionIds = Array.from(new Set(mockConversations.map(c => c.sessionId))).sort();

  // 过滤和排序对话记录
  const filteredConversations = mockConversations
    .filter(c => {
      // Session 筛选
      if (convSessionFilter !== 'all' && c.sessionId !== convSessionFilter) return false;
      
      // 时间筛选
      const convTime = new Date(c.time).getTime();
      const now = new Date().getTime();
      const dayMs = 24 * 60 * 60 * 1000;
      
      if (convTimeFilter === '7days') {
        const sevenDaysAgo = now - 7 * dayMs;
        if (convTime < sevenDaysAgo) return false;
      } else if (convTimeFilter === '30days') {
        const thirtyDaysAgo = now - 30 * dayMs;
        if (convTime < thirtyDaysAgo) return false;
      } else if (convTimeFilter === 'custom' && convCustomStartDate && convCustomEndDate) {
        const startTime = new Date(convCustomStartDate).getTime();
        const endTime = new Date(convCustomEndDate).getTime() + dayMs - 1; // 包含结束日期当天
        if (convTime < startTime || convTime > endTime) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return convSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  // 分页数据计算
  const paginatedScenes = mockSceneBlocks.slice((scenesPage - 1) * pageSize, scenesPage * pageSize);
  const totalScenesPages = Math.ceil(mockSceneBlocks.length / pageSize);
  
  const paginatedRecords = filteredRecords.slice((recordsPage - 1) * pageSize, recordsPage * pageSize);
  const totalRecordsPages = Math.ceil(filteredRecords.length / pageSize);
  
  const paginatedConversations = filteredConversations.slice((conversationsPage - 1) * pageSize, conversationsPage * pageSize);
  const totalConversationsPages = Math.ceil(filteredConversations.length / pageSize);

  // Pro 版左侧导航 - 左侧流程线 + 顶部箭头
  const ProNavigation = () => {
    const navItems = [
      { key: 'persona', icon: User, label: '个性化记忆' },
      { key: 'scenes', icon: Layers, label: '场景记忆' },
      { key: 'records', icon: Database, label: '原子记忆' },
      { key: 'conversations', icon: MessageSquare, label: '对话记录' },
    ];

    return (
      <div className="w-40 flex-shrink-0 border-r border-[#e5e5e5] pr-4">
        <div className="flex flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key as typeof activeNav)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-[4px] text-sm transition-colors mb-0.5 ${
                  isActive 
                    ? 'bg-blue-50 text-[#0A0A0A] font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1447E6]' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Persona 面板 - 用户画像，样式与场景记忆卡片一致
  const PersonaPanel = () => (
    <div className="h-full flex flex-col">
      <div className="bg-white border border-[#e5e5e5] rounded-[4px] overflow-hidden flex-1 overflow-y-auto">
        {/* 白色标题栏 */}
        <div className="px-4 py-3 border-b border-[#e5e5e5]">
          <span className="text-sm font-medium text-[#0A0A0A]">用户画像</span>
        </div>
        {/* 内容区 */}
        <div className="px-4 py-3 bg-[#FAFAFA]">
          <div className="space-y-2">
            {mockPersona.split('\n').map((line, i) => {
              if (!line.trim()) return null;
              if (line.startsWith('# ')) return null;
              if (line.startsWith('## ')) {
                return <h4 key={i} className="text-sm font-medium text-[#0A0A0A] mt-3">{line.replace('## ', '')}</h4>;
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={i} className="flex items-start gap-2 pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A3A3A3] mt-1.5 shrink-0" />
                    <span className="text-sm text-[#525252] leading-relaxed">{line.replace('- ', '')}</span>
                  </div>
                );
              }
              return <p key={i} className="text-sm text-[#525252] leading-relaxed">{line}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Scene Blocks 面板 - 每个都是 md 文件，点击后折叠展开（只允许展开一个）
  const ScenesPanel = () => (
    <div className="h-full flex flex-col">
      <div className="space-y-2 flex-1 overflow-auto">
        {paginatedScenes.map(scene => {
          const isExpanded = expandedScene === scene.id;
          return (
            <div key={scene.id} className="bg-white border border-[#e5e5e5] rounded-[4px] overflow-hidden">
              <button
                onClick={() => toggleSceneExpand(scene.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {isExpanded 
                    ? <ChevronDown className="w-4 h-4 text-[#737373]" />
                    : <ChevronRight className="w-4 h-4 text-[#737373]" />
                  }
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-gray-900 text-sm">{scene.name.replace(/\.md$/, '')}</div>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-[#e5e5e5] px-4 py-3 max-h-[200px] overflow-auto bg-[#FAFAFA]">
                  <div className="space-y-2">
                    {(() => {
                      // 去掉内容区第一行的一级标题（与卡片头部的 scene.name 重复）
                      const lines = scene.content.split('\n');
                      if (lines[0]?.startsWith('# ')) {
                        lines.shift();
                        while (lines.length > 0 && !lines[0].trim()) {
                          lines.shift();
                        }
                      }
                      return lines;
                    })().map((line, i) => {
                      if (!line.trim()) return null;
                      if (line.startsWith('# ')) {
                        return <h4 key={i} className="text-sm font-semibold text-[#0A0A0A]">{line.replace('# ', '')}</h4>;
                      }
                      if (line.startsWith('## ')) {
                        return <h5 key={i} className="text-sm font-medium text-[#0A0A0A] mt-2">{line.replace('## ', '')}</h5>;
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={i} className="flex items-start gap-2 pl-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A3A3A3] mt-1.5 shrink-0" />
                            <span className="text-sm text-[#525252] leading-relaxed">{line.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      return <p key={i} className="text-sm text-[#525252] leading-relaxed">{line}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Pagination total={mockSceneBlocks.length} current={scenesPage} pageSize={pageSize} showTotal={(total) => `共 ${total} 条记录`} simple className="w-full justify-between mt-4 pt-4 border-t border-[#e5e5e5]" onChange={(p) => setScenesPage(p)} />
    </div>
  );

  // Records 面板
  const RecordsPanel = () => (
    <div className="h-full flex flex-col">
      {/* 过滤器（§8.1 按钮规范） */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2">
          {(['all', 'fact', 'preference', 'event'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => { setRecordFilter(filter); setRecordsPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-[4px] border transition-colors ${
                recordFilter === filter
                  ? 'bg-blue-50 text-[#1447E6] border-[#1447E6] font-medium'
                  : 'bg-white text-[#737373] border-[#E5E5E5] hover:border-[#1447E6] hover:text-[#1447E6]'
              }`}
            >
              {filter === 'all' ? '全部' : filter === 'fact' ? '事实' : filter === 'preference' ? '偏好' : '事件'}
            </button>
          ))}
        </div>
      </div>

      {/* 记录表格（§8.4 表格规范） */}
      <div className="bg-white border border-[#E5E5E5] rounded-[4px] overflow-hidden flex-1 flex flex-col">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-gray-50/50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">类型</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">标签</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">内容</th>
              {showConfidence && (
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <button 
                    onClick={() => {
                      setSortByConfidence(prev => {
                        if (prev === 'none') return 'desc';
                        if (prev === 'desc') return 'asc';
                        return 'none';
                      });
                    }}
                    className="flex items-center gap-1 hover:text-[#1447E6] transition-colors"
                  >
                    置信度
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedRecords.map(record => (
              <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4"><TypeBadge type={record.type} /></td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-medium bg-[#F5F5F5] text-[#525252]">{record.tag}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-[280px] truncate">{record.content}</td>
                {showConfidence && (
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${
                      record.confidence >= 0.9 ? 'text-[#16A34A]' : 
                      record.confidence >= 0.8 ? 'text-[#F59E0B]' : 'text-[#737373]'
                    }`}>
                      {record.confidence.toFixed(2)}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedRecords.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">暂无匹配的记忆记录</div>
        )}
      </div>
      <Pagination total={filteredRecords.length} current={recordsPage} pageSize={pageSize} showTotal={(total) => `共 ${total} 条记录`} simple className="w-full justify-between mt-4 pt-4 border-t border-[#e5e5e5]" onChange={(p) => setRecordsPage(p)} />
    </div>
  );

  // Conversations 面板 - 平铺展示消息列表，支持按 sessionId 筛选
  const ConversationsPanel = () => {
    // 计算自定义日期范围是否有效（最多30天）
    const isCustomDateValid = () => {
      if (!convCustomStartDate || !convCustomEndDate) return false;
      const start = new Date(convCustomStartDate).getTime();
      const end = new Date(convCustomEndDate).getTime();
      const dayMs = 24 * 60 * 60 * 1000;
      const diffDays = (end - start) / dayMs;
      return diffDays >= 0 && diffDays <= 30;
    };

    // 处理快速筛选按钮点击
    const handleQuickFilter = (type: '7days' | '30days') => {
      setConvTimeFilter(type);
      setShowDatePicker(false);
      setConversationsPage(1);
    };

    // 应用自定义日期范围
    const applyCustomDateRange = () => {
      if (isCustomDateValid()) {
        setConvTimeFilter('custom');
        setShowDatePicker(false);
        setConversationsPage(1);
      }
    };

    return (
      <div className="h-full flex flex-col">
        {/* 筛选器 */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">会话:</span>
            <Select value={convSessionFilter} onValueChange={(v) => { setConvSessionFilter(v); setConversationsPage(1); }}>
              <SelectTrigger className="h-8 w-[160px] text-xs rounded-[4px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {sessionIds.map(id => (
                  <SelectItem key={id} value={id}>{id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 时间筛选 */}
          <div className="flex items-center gap-2 relative">
            <div className="inline-flex items-center gap-1 p-1 rounded-[4px]" style={{ background: "#F5F5F5" }}>
              {(['7days', '30days'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => handleQuickFilter(type)}
                  className={`px-3 py-1.5 text-xs rounded-[3px] transition-all duration-150 ${
                    convTimeFilter === type
                      ? 'bg-white text-[#0A0A0A] font-medium'
                      : 'text-[#737373] hover:text-[#0A0A0A] font-normal'
                  }`}
                  style={convTimeFilter === type ? { boxShadow: "0 1px 2px rgba(0,0,0,0.06)" } : undefined}
                >
                  {type === '7days' ? '近7天' : '近30天'}
                </button>
              ))}
            </div>

            {/* 自定义日期按钮 */}
            <button
              onClick={() => {
                if (showDatePicker) {
                  setShowDatePicker(false);
                } else {
                  setShowDatePicker(true);
                  const today = new Date();
                  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  if (!convCustomStartDate || !convCustomEndDate) {
                    setConvCustomEndDate(today.toISOString().split('T')[0]);
                    setConvCustomStartDate(sevenDaysAgo.toISOString().split('T')[0]);
                  }
                }
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-[4px] border transition-colors ${
                convTimeFilter === 'custom' || showDatePicker
                  ? 'bg-[#EFF6FF] border-[#1447E6] text-[#1447E6]'
                  : 'bg-white border-[#E5E5E5] text-[#737373] hover:text-[#0A0A0A] hover:border-[#1447E6]'
              }`}
              title="自定义日期范围"
            >
              <Calendar className="w-4 h-4" />
            </button>

            {/* 显示当前自定义筛选范围 */}
            {convTimeFilter === 'custom' && !showDatePicker && convCustomStartDate && convCustomEndDate && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#EFF6FF] text-[#1447E6] rounded-[4px] text-xs">
                <span>{convCustomStartDate} ~ {convCustomEndDate}</span>
                <button
                  onClick={() => {
                    setConvTimeFilter('7days');
                    setConvCustomStartDate('');
                    setConvCustomEndDate('');
                  }}
                  className="p-0.5 hover:bg-[#1447E6]/10 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* 自定义日期选择器弹窗 */}
            {showDatePicker && (
              <div
                className="absolute right-0 top-full mt-2 p-4 bg-white border border-[#E5E5E5] rounded-[4px] z-10"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={convCustomStartDate}
                      onChange={(e) => setConvCustomStartDate(e.target.value)}
                      className="h-8 text-xs px-2 py-1.5 border border-[#E5E5E5] rounded-[4px] focus:outline-none focus:border-[#1447E6]"
                    />
                    <span className="text-xs text-[#737373]">至</span>
                    <input
                      type="date"
                      value={convCustomEndDate}
                      onChange={(e) => setConvCustomEndDate(e.target.value)}
                      className="h-8 text-xs px-2 py-1.5 border border-[#E5E5E5] rounded-[4px] focus:outline-none focus:border-[#1447E6]"
                    />
                  </div>
                  {convCustomStartDate && convCustomEndDate && !isCustomDateValid() && (
                    <span className="text-xs text-[#d42a1e]">日期范围最多30天</span>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-3 py-1.5 text-xs text-[#737373] hover:text-[#0A0A0A] rounded-[4px] border border-[#e5e5e5] hover:bg-[#F5F5F5] transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={applyCustomDateRange}
                      disabled={!isCustomDateValid()}
                      className={`px-3 py-1.5 text-xs rounded-[4px] transition-colors ${
                        isCustomDateValid()
                          ? 'bg-[#0A0A0A] text-white hover:opacity-90'
                          : 'bg-[#F5F5F5] text-[#A3A3A3] cursor-not-allowed'
                      }`}
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 消息表格（§8.4 表格规范） */}
        <div className="bg-white border border-[#E5E5E5] rounded-[4px] overflow-hidden flex-1 flex flex-col">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">会话 ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">角色</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">内容</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <button 
                    onClick={() => setConvSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 hover:text-[#1447E6] transition-colors"
                  >
                    时间
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedConversations.map(conv => {
                const isExpanded = expandedConvId === conv.id;
                const isLongContent = conv.content.length > 80;
                return (
                  <tr key={conv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 font-mono">{conv.sessionId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-medium ${
                        conv.role === 'user' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {conv.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-[320px]">
                      <div className={isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}>
                        {conv.content}
                      </div>
                      {isLongContent && (
                        <button
                          onClick={() => setExpandedConvId(isExpanded ? null : conv.id)}
                          className="text-xs text-[#1447E6] hover:opacity-80 mt-1 flex items-center gap-0.5"
                        >
                          {isExpanded ? (
                            <>收起 <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>展开 <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{conv.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {paginatedConversations.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">暂无匹配的对话记录</div>
          )}
        </div>
        <Pagination total={filteredConversations.length} current={conversationsPage} pageSize={pageSize} showTotal={(total) => `共 ${total} 条记录`} simple className="w-full justify-between mt-4 pt-4 border-t border-[#e5e5e5]" onChange={(p) => setConversationsPage(p)} />
      </div>
    );
  };

  // Pro 版内容区域
  const ProContent = () => (
    <div className="flex-1 pl-4 overflow-hidden flex flex-col">
      {activeNav === 'persona' && <PersonaPanel />}
      {activeNav === 'scenes' && <ScenesPanel />}
      {activeNav === 'records' && <RecordsPanel />}
      {activeNav === 'conversations' && <ConversationsPanel />}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // 数据面板加载状态 - 简单的 loading 占位
  // ══════════════════════════════════════════════════════════════════════════════
  const DataLoadingPlaceholder = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      <p className="text-sm text-gray-500">正在加载记忆数据，请稍候...</p>
      <p className="text-xs text-gray-400 mt-1">首次加载可能需要一些时间</p>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // 升级中状态 - 简单的加载提示
  // ══════════════════════════════════════════════════════════════════════════════
  if (memoryStatus === 'upgrading') {
    return (
      <div className="w-full h-full flex flex-col">
        {/* 升级中头部 */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-[4px] flex items-center justify-center flex-shrink-0 relative"
              style={{ background: '#355EF1' }}
            >
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">Memory Pro 服务</h2>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-medium rounded-full flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  开通中
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                正在开通服务，请稍候...
              </p>
            </div>
          </div>
        </div>

        {/* 居中的加载提示 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm">正在迁移数据并配置服务...</p>
            <p className="text-gray-400 text-xs mt-2">这可能需要几分钟时间</p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 未开通状态 - 显示宣传话术和状态
  // ══════════════════════════════════════════════════════════════════════════════
  if (memoryStatus === 'none') {
    return (
      <div className="w-full">
        {/* 页面标题 + 状态徽章 */}
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-10 h-10 rounded-[4px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #9CA3AF, #D1D5DB)' }}
          >
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">Memory 服务</h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                未开启
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              让 AI 智能体真正理解你、记住你，长期保持一致的工作习惯与决策偏好。
            </p>
          </div>
        </div>

        {/* 能力宣传区域 */}
        <div className="p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-[4px] border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-[4px] bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">为您的 AI 智能体开启记忆能力</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Memory 服务让智能体能够记住您的偏好、习惯和历史对话，提供更加个性化、连贯的交互体验。
            </p>
          </div>

          {/* 核心能力展示 - 四项特性 */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-white rounded-[4px] border border-[#e5e5e5] flex items-start gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1">记忆更稳定</h4>
                <p className="text-xs text-gray-500 leading-relaxed">自动提取偏好、约束与任务状态，无需手动触发</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-[4px] border border-[#e5e5e5] flex items-start gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1">理解更深刻</h4>
                <p className="text-xs text-gray-500 leading-relaxed">四层记忆金字塔逐步提炼，从"记住你说过什么"到"理解你是谁"</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-[4px] border border-[#e5e5e5] flex items-start gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-green-50 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1">检索更精准</h4>
                <p className="text-xs text-gray-500 leading-relaxed">记忆分层组织、按场景归类，按需精准召回</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-[4px] border border-[#e5e5e5] flex items-start gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Link2 className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1">跨会话不断</h4>
                <p className="text-xs text-gray-500 leading-relaxed">记忆跨聊天通道共享，不随上下文压缩丢失</p>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>请联系管理员在管控端开通 Memory 服务</span>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 已开通 Free 版界面
  // ══════════════════════════════════════════════════════════════════════════════
  if (memoryStatus === 'free') {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Free 版头部标题 */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-[4px] flex items-center justify-center flex-shrink-0"
              style={{ background: '#355EF1' }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">Memory Free 服务</h2>
                <StatusTag variant="blue">已开启</StatusTag>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                让 AI 智能体真正理解你、记住你，长期保持一致的工作习惯与决策偏好。
              </p>
            </div>
          </div>
        </div>

        {/* 记忆数据预览 - 加载中或已加载 */}
        {isLoading ? (
          <DataLoadingPlaceholder />
        ) : (
          <div className="flex items-start flex-1 min-h-0">
            <ProNavigation />
            <ProContent />
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 已开通 Pro 版界面
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full h-full flex flex-col">
      {/* [本期新增] 免费体验期提示条 */}
      {renderFreeTrialBanner()}

      <div className="flex items-start flex-1 min-h-0">
        <ProNavigation />
        <ProContent />
      </div>
    </div>
  );
}

export default MemoryPreview;
