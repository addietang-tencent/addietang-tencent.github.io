/**
 * AgentChat - Figma「Lighthouse 产品需求 / page-首页-已连接」(节点 1003:22598) 1:1 还原
 * Design: 「流动蓝图」Fluid Blueprint v2
 *
 * ⚠️ 注意：本页面**故意不遵守** SKILL v2 §4「圆角 ≤ 4px」等约束，按 Figma 设计稿真实
 * 数值还原（应用卡 20px / Tab wrapper 16px / 输入卡 20px / 历史项 8px ……），
 * 用作设计还原稿。如要全站推行，需先升级 SKILL.md 的圆角规范。
 *
 * Figma 关键数值（已逐一比对）：
 *   - 整页底色 #F7F8FB；侧栏 / 主面板 #FFFFFF；分隔线 #E9ECF1
 *   - 应用卡 1200×768，圆角 20，shadow xs (0 1 4 rgba(0,0,0,0.05))
 *   - 侧栏 228 宽；分隔竖线 1px 高 894（用 right border 模拟）
 *   - Hermes / Beta 徽章：圆角 4，padding 0 5，高 16，字号 12/18 #757575
 *   - Segment Tab：wrapper 16 圆角 #F5F6F9 padding 4；激活 item 16 圆角 白底 +
 *     tea/shadow-xs；item padding 2 16；激活字 12/20 medium，未激活 12/20 regular
 *   - Agents 头像：40×40 圆，已选中：白底 + #0052D9 1px ring + tea/shadow-xs +
 *     conic 红色光晕 (255,79,79)；未选 #000 12% 透明圆底
 *   - 历史对话项：圆角 8，padding 8 12，文字 14/20 rgba(10,10,10,0.8)
 *   - 「前往小程序」按钮：196×36 圆角 8 white
 *   - 输入卡片：圆角 20，stroke #E9ECF1，shadow 0 4 12 rgba(0,0,0,0.04)
 *   - Deepseek pill：圆角 16，stroke #E6E9EF，padding 2 12
 *   - 指令库 pill：圆角 20，stroke #E9ECF1，padding 6 12
 *   - 快捷指令 chip：圆角 8，stroke #E9ECF1，padding 10 20，gap 16
 *   - Star 装饰渐变：linear-gradient(112deg, #E3453D 7%, #7D2621 70%)，10×11
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Pencil,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  MessageSquarePlus,
  MoreHorizontal,
  Plus,
  ArrowUp,
  ArrowRight,
  Edit3,
  Share2,
  Archive,
  Trash2,
} from "lucide-react";

/* ───────────── Mock 数据 ───────────── */

interface AgentItem {
  key: string;
  name: string;
  /** 角色虾头像图片路径（来自 /public/assets/avatars/） */
  avatar: string;
}

/**
 * Agent 头像映射（7 个真实职业，与 /public/assets/avatars/ 中的图一一对应）
 *
 * TOP（默认显示 5 个 + 第 6 格"展开/收起"按钮）：
 *   默认助手 / 开发工程师 / 设计师 / 项目经理 / 内容创作者
 * BOTTOM（点"展开更多"显示）：
 *   行业分析师 / 运营
 */
const AGENT_GROUP_TOP: AgentItem[] = [
  { key: "default", name: "默认助手", avatar: "/assets/avatars/avatar-default.png" },
  { key: "dev", name: "开发工程师", avatar: "/assets/avatars/avatar-developer.png" },
  { key: "designer", name: "设计师", avatar: "/assets/avatars/avatar-designer.png" },
  { key: "pm", name: "项目经理", avatar: "/assets/avatars/avatar-pm.png" },
  { key: "creator", name: "内容创作者", avatar: "/assets/avatars/avatar-creator.png" },
];
const AGENT_GROUP_BOTTOM: AgentItem[] = [
  { key: "analyst", name: "行业分析师", avatar: "/assets/avatars/avatar-analyst.png" },
  { key: "operator", name: "运营", avatar: "/assets/avatars/avatar-operator.png" },
];

/**
 * 实例切换 mock 数据
 *
 * 引擎 (engine):
 *   - OpenClaw: 完整对话视图 + 编排 + 工具调用，全功能
 *   - Hermes:   仅支持任务流（无对话视图）→ 在对话页 hover 时提示「Hermes 暂不支持对话视图」并 disabled
 *   - ACE:      执行引擎，有自身视图（这里也支持选中）
 *
 * 状态 (online):
 *   - true  → 实心绿点 #088F50
 *   - false → 空心灰圈 1px stroke #BFC4CC
 */
type InstanceEngine = "OpenClaw" | "Hermes" | "ACE";

interface InstanceItem {
  key: string;
  name: string;
  engine: InstanceEngine;
  online: boolean;
}

const INSTANCE_LIST: InstanceItem[] = [
  { key: "abc", name: "实例名称 ABC", engine: "OpenClaw", online: true },
  { key: "123", name: "实例名称 123", engine: "Hermes", online: true },
  { key: "liam-syd", name: "Liam悉尼", engine: "Hermes", online: false },
  { key: "liam-tyo", name: "Liam东京", engine: "ACE", online: false },
  { key: "liam-lon", name: "Liam伦敦", engine: "Hermes", online: false },
  { key: "ava-ny", name: "Ava纽约", engine: "OpenClaw", online: false },
];

interface HistoryItem {
  key: string;
  title: string;
  /** 已归档（置灰） */
  archived?: boolean;
}

const HISTORY_ITEMS: HistoryItem[] = [
  { key: "h1", title: "最近一小时的CPU使..." },
  { key: "h2", title: "查询可观测平台的告..." },
  { key: "h3", title: "绑定策略对象" },
  { key: "h4", title: "如何做小龙虾" },
  { key: "h5", title: "如何做麻辣小龙虾" },
  { key: "h6", title: "设计云产品 AI 助手", archived: true },
];

const QUICK_COMMANDS = [
  "帮我购买一个域名和一台服务器",
  "帮我开通 Lighthouse 实例防火墙",
  "帮我发送每日周报邮件",
  "帮我查询股票今日行情",
];

/* ───────────── 子组件 ───────────── */

/** 红色渐变小星形（Figma fill_5X9YJJ：linear-gradient(112deg, #E3453D 7%, #7D2621 70%)，10×11） */
function StarBullet() {
  return (
    <span
      aria-hidden
      className="flex h-[11px] w-[10px] flex-shrink-0 items-center justify-center"
      style={{
        background: "linear-gradient(112deg, #E3453D 7%, #7D2621 70%)",
        clipPath:
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      }}
      // allow-inline-gradient: Figma 设计稿 fill_5X9YJJ 红色装饰星形
    />
  );
}

/** AgentChat Logo（包含 logo 图标 + Beta 徽章） */
function HeaderLogo() {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="flex h-6 items-center font-semibold tracking-tight text-[#0A0A0A]"
        style={{ fontSize: 16, lineHeight: "24px" }}
      >
        AgentChat
      </span>
      {/* Beta 徽章：Figma layout_GZYS78 高 16，padding 0 5，stroke #D6DBE3，圆角 4 */}
      <span
        className="inline-flex items-center justify-center rounded-[4px] border"
        style={{
          height: 16,
          padding: "0 5px",
          borderColor: "#D6DBE3",
          fontSize: 12,
          lineHeight: "18px",
          color: "rgba(0,0,0,0.5)",
        }}
      >
        Beta
      </span>
    </div>
  );
}

/** Agent 头像（Figma 40×40 圆；选中态：白底 + #0052D9 1px ring + tea/shadow-xs） */
function AgentAvatar({ item, selected }: { item: AgentItem; selected: boolean }) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      {/* 圆形容器：选中=白底 + 1px 蓝边 + 阴影；未选=透明（直接显示 avatar 自带渐变背景） */}
      <span
        className="relative flex h-10 w-10 items-center justify-center rounded-full overflow-hidden"
        style={
          selected
            ? {
                background: "#FFFFFF",
                border: "1px solid #0052D9",
                boxShadow: "0 1px 4px 0 rgba(0,0,0,0.05)",
              }
            : undefined
        }
        // allow-shadow: Figma tea/shadow-xs (0 1 4 rgba(0,0,0,0.05))，仅本设计还原页使用
      >
        {/* 角色虾头像图片（来自 /public/assets/avatars/） */}
        <img
          src={item.avatar}
          alt={item.name}
          draggable={false}
          className="h-10 w-10 object-cover rounded-full pointer-events-none select-none"
        />
      </span>
    </div>
  );
}

/** 引擎徽章（OpenClaw / Hermes / ACE）：与 Hermes 徽章同款 4px 圆角 stroke */
function EngineBadge({ engine }: { engine: InstanceEngine }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[4px] border flex-shrink-0"
      style={{
        height: 16,
        padding: "0 5px",
        borderColor: "#D6DBE3",
        fontSize: 12,
        lineHeight: "18px",
        color: "rgba(0,0,0,0.5)",
      }}
    >
      {engine}
    </span>
  );
}

/* ───────────── 主组件 ───────────── */

interface AgentChatProps {
  /** 嵌入「我的 Agent」内容区时为 true：去掉外层画布与尺寸标记，宽度自适应。 */
  embedded?: boolean;
}

export default function AgentChat({ embedded = false }: AgentChatProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");
  const [activeAgentKey, setActiveAgentKey] = useState<string>("dev");
  const [inputText, setInputText] = useState<string>("");
  const [activeHistoryKey, setActiveHistoryKey] = useState<string>("h2");
  const sessionTitle =
    HISTORY_ITEMS.find((h) => h.key === activeHistoryKey)?.title ??
    "查询可观测平台的数据";

  /* 对话流 messages：每条 { id, role, content }
     默认空数组 → 显示 welcome 态；用户发送消息后开始累计 */
  type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /* 用户菜单 */
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  /* Header：会话标题切换 popover */
  const [titlePopoverOpen, setTitlePopoverOpen] = useState<boolean>(false);
  const titleTriggerRef = useRef<HTMLDivElement | null>(null);

  /* Header：会话更多菜单 */
  const [sessionMenuOpen, setSessionMenuOpen] = useState<boolean>(false);
  const sessionMenuRef = useRef<HTMLDivElement | null>(null);

  /* Header：全屏切换 */
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  /* Header：新建会话二次确认 */
  const [showNewChatConfirm, setShowNewChatConfirm] = useState<boolean>(false);

  /* Header：编辑角色 inline 输入 */
  const [roleEditOpen, setRoleEditOpen] = useState<boolean>(false);
  const [roleDraft, setRoleDraft] = useState<string>("");
  const roleEditRef = useRef<HTMLDivElement | null>(null);
  /* 用户对每个 agent 重命名后的覆盖名（key → name） */
  const [agentNameOverrides, setAgentNameOverrides] = useState<
    Record<string, string>
  >({});
  /* Agents 列表是否展开（默认收起，仅显示 TOP 三个） */
  const [agentsExpanded, setAgentsExpanded] = useState<boolean>(false);

  /* 实例切换：当前实例 + popover 开关 */
  const [activeInstanceKey, setActiveInstanceKey] = useState<string>("abc");
  const [instancePopoverOpen, setInstancePopoverOpen] = useState<boolean>(false);
  const instanceTriggerRef = useRef<HTMLDivElement | null>(null);

  const activeInstance =
    INSTANCE_LIST.find((i) => i.key === activeInstanceKey) ?? INSTANCE_LIST[0];

  /* 点击外部关闭 popover（实例切换 + 用户菜单 + 会话标题 + 会话更多 + 编辑角色） */
  useEffect(() => {
    if (
      !instancePopoverOpen &&
      !userMenuOpen &&
      !titlePopoverOpen &&
      !sessionMenuOpen &&
      !roleEditOpen
    )
      return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        instancePopoverOpen &&
        instanceTriggerRef.current &&
        !instanceTriggerRef.current.contains(target)
      ) {
        setInstancePopoverOpen(false);
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
      if (
        titlePopoverOpen &&
        titleTriggerRef.current &&
        !titleTriggerRef.current.contains(target)
      ) {
        setTitlePopoverOpen(false);
      }
      if (
        sessionMenuOpen &&
        sessionMenuRef.current &&
        !sessionMenuRef.current.contains(target)
      ) {
        setSessionMenuOpen(false);
      }
      if (
        roleEditOpen &&
        roleEditRef.current &&
        !roleEditRef.current.contains(target)
      ) {
        setRoleEditOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [
    instancePopoverOpen,
    userMenuOpen,
    titlePopoverOpen,
    sessionMenuOpen,
    roleEditOpen,
  ]);

  const activeAgentRaw =
    [...AGENT_GROUP_TOP, ...AGENT_GROUP_BOTTOM].find((a) => a.key === activeAgentKey) ??
    AGENT_GROUP_TOP[1];
  const activeAgent = {
    ...activeAgentRaw,
    name: agentNameOverrides[activeAgentRaw.key] ?? activeAgentRaw.name,
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    /* 模拟 AI 回复：500ms 后追加一条 assistant 消息 */
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: `收到你的请求：「${text}」。已记录到当前会话，正在为你处理。`,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 500);
  };

  /* 对话流自动滚动到底 */
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  /* ───────── 应用卡片本体 ───────── */
  const appCard = (
    <div
      className="relative flex overflow-hidden bg-white border border-[#E9ECF1]"
      style={{
        width: isFullscreen ? "100%" : embedded ? "100%" : 1200,
        height: isFullscreen ? "100%" : embedded ? 720 : 768,
        borderRadius: 20, // Figma 设计稿真实值
        boxShadow: isFullscreen
          ? "0 8px 32px 0 rgba(20,71,230,0.10), 0 2px 8px 0 rgba(0,0,0,0.06)"
          : embedded
            ? "0 1px 4px 0 rgba(0,0,0,0.05)"
            : "0px 24px 60px -12px rgba(20,71,230,0.18), 0px 8px 24px -4px rgba(0,0,0,0.08)",
      }}
      // allow-shadow: Figma tea/shadow-xs（嵌入态）/ 独立预览页设计稿外阴影 / 全屏态适度投影
    >
      {/* ───────── 左侧 Sidebar 228px ───────── */}
      <aside
        className="w-[228px] flex-shrink-0 flex flex-col bg-white"
        style={{ borderRight: "1px solid #E5E7EB" }}
      >
        {/* Header：logo + Beta，高 60 与右侧主面板 Header 对齐；底部 1px 分割线 */}
        <div
          className="flex items-center gap-2 flex-shrink-0"
          style={{
            height: 60,
            padding: "0 24px",
            borderBottom: "1px solid #E9ECF1",
          }}
        >
          <HeaderLogo />
        </div>

        {/* 实例信息：可点击切换；hover 显示 chevron；点击展开 popover */}
        <div
          ref={instanceTriggerRef}
          className="relative flex flex-col gap-2 px-4 pt-3 pb-3"
        >
          <button
            type="button"
            onClick={() => setInstancePopoverOpen((v) => !v)}
            className="group flex items-center gap-2 w-full text-left"
            style={{ outline: "none" }}
          >
            <span
              className="text-[#0A0A0A] truncate flex-1"
              style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600 }}
            >
              {activeInstance.name}
            </span>
            {/* 引擎徽章 */}
            <EngineBadge engine={activeInstance.engine} />
            {/* 状态点：在线 #088F50；hover 时被 chevron 取代 */}
            <span
              aria-hidden
              className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 group-hover:hidden"
            >
              {activeInstance.online ? (
                <span className="h-2 w-2 rounded-full" style={{ background: "#088F50" }} />
              ) : (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ border: "1px solid #BFC4CC", background: "transparent" }}
                />
              )}
            </span>
            {/* hover 时出现的 chevron */}
            <ChevronDown
              className="hidden group-hover:block flex-shrink-0"
              size={16}
              style={{
                color: "rgba(0,0,0,0.6)",
                transform: instancePopoverOpen ? "rotate(180deg)" : undefined,
                transition: "transform 0.15s ease",
              }}
            />
          </button>

          {/* Popover：实例列表 */}
          {instancePopoverOpen && (
            <div
              className="absolute left-2 right-2 z-30 bg-white"
              style={{
                top: "calc(100% - 4px)",
                borderRadius: 12,
                border: "1px solid #E9ECF1",
                boxShadow: "0 8px 24px 0 rgba(0,0,0,0.08), 0 1px 4px 0 rgba(0,0,0,0.05)",
                padding: 8,
              }}
              // allow-shadow: Figma 实例切换 popover 浮层阴影
            >
              {INSTANCE_LIST.map((ins) => {
                const isActive = ins.key === activeInstanceKey;
                // Hermes 引擎不支持对话视图：在对话页禁用并显示 tooltip
                const disabled = activeTab === "chat" && ins.engine === "Hermes";
                return (
                  <div key={ins.key} className="relative group/item">
                    <button
                      type="button"
                      onClick={() => {
                        if (disabled) return;
                        setActiveInstanceKey(ins.key);
                        setInstancePopoverOpen(false);
                      }}
                      disabled={disabled}
                      className="w-full flex items-center gap-2 transition-colors hover:bg-[#F5F6F9] disabled:cursor-not-allowed"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        opacity: disabled ? 0.5 : 1,
                      }}
                    >
                      <span
                        className="truncate flex-1 text-left"
                        style={{
                          fontSize: 14,
                          lineHeight: "22px",
                          color: isActive ? "rgba(10,10,10,0.92)" : "rgba(10,10,10,0.7)",
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        {ins.name}
                      </span>
                      <EngineBadge engine={ins.engine} />
                      <span
                        aria-hidden
                        className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0"
                      >
                        {ins.online ? (
                          <span className="h-2 w-2 rounded-full" style={{ background: "#088F50" }} />
                        ) : (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ border: "1px solid #BFC4CC", background: "transparent" }}
                          />
                        )}
                      </span>
                    </button>

                    {/* Tooltip：仅 disabled 项 hover 显示 */}
                    {disabled && (
                      <div
                        className="hidden group-hover/item:block absolute z-40 pointer-events-none"
                        style={{
                          left: "100%",
                          top: 0,
                          marginLeft: 8,
                          padding: "6px 10px",
                          background: "#FFFFFF",
                          border: "1px solid #E9ECF1",
                          borderRadius: 8,
                          boxShadow: "0 4px 12px 0 rgba(0,0,0,0.08)",
                          fontSize: 12,
                          lineHeight: "18px",
                          color: "rgba(10,10,10,0.85)",
                          whiteSpace: "nowrap",
                        }}
                        // allow-shadow: tooltip 浮层阴影
                      >
                        {ins.engine} 暂不支持对话视图
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Segment Tab：wrapper 16 圆角 #F5F6F9 padding 4；激活 item 16 圆角 白底 + 阴影 */}
        <div
          className="px-4 pt-3 pb-3"
          style={{ borderBottom: "1px solid #E9ECF1" }}
        >
          <div
            className="flex items-center"
            style={{
              background: "#F5F6F9",
              borderRadius: 16,
              padding: 4,
              gap: 8,
            }}
          >
            {(["chat", "settings"] as const).map((key) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === "settings") {
                      // 跳转到 OpenClaw 详情/基础配置页（图 1）
                      setLocation(`/openclaw/${activeInstanceKey}`);
                      return;
                    }
                    setActiveTab(key);
                  }}
                  className="flex-1 flex items-center justify-center transition-colors"
                  style={{
                    padding: "2px 16px",
                    borderRadius: 16, // Figma 激活 item 圆角
                    background: isActive ? "#FFFFFF" : "transparent",
                    boxShadow: isActive ? "0 1px 4px 0 rgba(0,0,0,0.05)" : undefined,
                    fontSize: 12,
                    lineHeight: "20px",
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.7)",
                  }}
                  // allow-shadow: Figma tea/shadow-xs，激活 Tab 阴影
                >
                  {key === "chat" ? "对话" : "设置"}
                </button>
              );
            })}
          </div>
        </div>

        {/* 主滚动区 */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#E5E5E5 transparent",
            padding: "0 16px",
          }}
        >
          {/* Agents 标题区 */}
          <div className="flex items-center" style={{ padding: "9px 12px" }}>
            <span style={{ fontSize: 12, lineHeight: "20px", color: "#ADADAD", flex: 1 }}>
              Agents
            </span>
            <button
              className="h-[14px] w-[14px] flex items-center justify-center text-[#737373] hover:text-[#1447E6] active:scale-90 transition-all"
              aria-label="新增 Agent"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Agents 头像组：3 列网格；默认仅显示 TOP；点击"展开更多"显示 BOTTOM */}
          <div className="grid grid-cols-3 gap-y-2.5">
            {(agentsExpanded
              ? [...AGENT_GROUP_TOP, ...AGENT_GROUP_BOTTOM]
              : AGENT_GROUP_TOP
            ).map((a) => (
              <button
                key={a.key}
                onClick={() => setActiveAgentKey(a.key)}
                className="flex flex-col items-center gap-2 py-2.5 active:scale-95 transition-transform"
              >
                <AgentAvatar item={a} selected={a.key === activeAgentKey} />
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: "16px",
                    letterSpacing: "-0.0125em",
                    color: "rgba(10,10,10,0.7)",
                  }}
                >
                  {a.name}
                </span>
              </button>
            ))}
            {/* 展开 / 收起 切换按钮 */}
            <button
              onClick={() => setAgentsExpanded((v) => !v)}
              className="flex flex-col items-center gap-2 py-2.5 group/more active:scale-95 transition-transform"
              aria-label={agentsExpanded ? "收起" : "展开更多"}
              title={agentsExpanded ? "收起" : "展开更多"}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,0,0,0.04)] group-hover/more:bg-[rgba(0,0,0,0.08)] text-[#737373] group-hover/more:text-[#1447E6] transition-colors">
                {agentsExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
              <span
                style={{
                  fontSize: 12,
                  lineHeight: "16px",
                  letterSpacing: "-0.0125em",
                  color: "rgba(10,10,10,0.7)",
                }}
              >
                {agentsExpanded ? "收起" : "展开更多"}
              </span>
            </button>
          </div>

          {/* 历史对话标题 */}
          <div className="flex items-center mt-1" style={{ padding: "9px 12px" }}>
            <span style={{ fontSize: 12, lineHeight: "20px", color: "#ADADAD" }}>历史对话</span>
          </div>

          {/* 历史对话列表：每项圆角 8、padding 8 12、文字 14/20 rgba(10,10,10,0.8) */}
          <div className="flex flex-col">
            {HISTORY_ITEMS.map((h) => {
              const isActive = h.key === activeHistoryKey;
              return (
                <button
                  key={h.key}
                  onClick={() => setActiveHistoryKey(h.key)}
                  className="text-left transition-colors hover:bg-[#F5F6F9]"
                  style={{
                    borderRadius: 8,
                    padding: "8px 12px",
                    background: isActive ? "#F5F6F9" : undefined,
                  }}
                >
                  <span
                    className="block truncate"
                    style={{
                      fontSize: 14,
                      lineHeight: "20px",
                      color: h.archived
                        ? "#A3A3A3"
                        : isActive
                          ? "rgba(10,10,10,0.95)"
                          : "rgba(10,10,10,0.8)",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {h.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 底部留白渐变（Figma fill_7Z35UL，伪实现：直接给一段 padding） */}
          <div style={{ height: 24 }} />
        </div>

        {/* Sidebar 底部：前往小程序 + 用户行 */}
        <div className="flex-shrink-0">
          {/* 前往小程序按钮：196×36 圆角 8 padding 12 8 */}
          <div className="px-3 pt-2 pb-2">
            <button
              className="group/mini w-full flex items-center justify-between bg-white hover:bg-[#F5F6F9] active:scale-[0.98] transition-all"
              style={{
                height: 36,
                borderRadius: 8,
                padding: "0 12px",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  lineHeight: "20px",
                  fontWeight: 400,
                  color: "#000",
                }}
              >
                前往小程序
              </span>
              <ArrowRight className="h-4 w-4 text-[#737373] group-hover/mini:text-[#1447E6] group-hover/mini:translate-x-0.5 transition-all" />
            </button>
          </div>
          {/* 用户行：top stroke 0.5px #E6E9EF，padding 12 8 20；可点击触发用户菜单 */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="w-full flex items-center gap-2.5 hover:bg-[#F5F6F9] transition-colors"
              style={{
                borderTop: "0.5px solid #E6E9EF",
                padding: "12px 12px 20px",
              }}
            >
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full text-white flex-shrink-0"
                style={{
                  background: "#000",
                  fontSize: 14.22,
                  lineHeight: "21.33px",
                  fontFamily:
                    "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace",
                  fontWeight: 500,
                }}
              >
                J
              </span>
              <span
                className="flex-1 text-left"
                style={{
                  fontSize: 14,
                  lineHeight: "20px",
                  color: "#0A0A0A",
                }}
              >
                Jaco
              </span>
              <ChevronDown
                className="h-4 w-4 flex-shrink-0"
                style={{
                  color: "rgba(0,0,0,0.4)",
                  transform: userMenuOpen ? "rotate(180deg)" : undefined,
                  transition: "transform 0.15s ease",
                }}
              />
            </button>

            {/* 用户菜单 */}
            {userMenuOpen && (
              <div
                className="absolute z-30 bg-white"
                style={{
                  left: 8,
                  right: 8,
                  bottom: "calc(100% - 4px)",
                  borderRadius: 12,
                  border: "1px solid #E9ECF1",
                  boxShadow:
                    "0 8px 24px 0 rgba(0,0,0,0.08), 0 1px 4px 0 rgba(0,0,0,0.05)",
                  padding: 4,
                }}
                // allow-shadow: 用户菜单浮层阴影
              >
                {[
                  { key: "profile", label: "个人资料" },
                  { key: "settings", label: "偏好设置" },
                  { key: "logout", label: "退出登录" },
                ].map((it) => (
                  <button
                    key={it.key}
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full text-left transition-colors hover:bg-[#F5F6F9]"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      lineHeight: "20px",
                      color:
                        it.key === "logout"
                          ? "rgba(229,62,62,0.9)"
                          : "rgba(10,10,10,0.85)",
                    }}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ───────── 主对话面板 ───────── */}
      <main className="flex-1 min-w-0 flex flex-col bg-white">
        {/* Header：高 60，padding 20 16 */}
        <header
          className="flex items-center justify-between flex-shrink-0"
          style={{
            height: 60,
            padding: "0 16px 0 20px",
            borderBottom: "1px solid #E9ECF1",
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* 角色名 + 编辑：点击 ✏ 后原地变 input 编辑（Enter 保存 / Esc 取消） */}
            <div ref={roleEditRef} className="relative flex items-center gap-1 flex-shrink-0">
              {roleEditOpen ? (
                <input
                  autoFocus
                  value={roleDraft}
                  onChange={(e) => setRoleDraft(e.target.value)}
                  onBlur={() => {
                    const next = roleDraft.trim();
                    if (next) {
                      setAgentNameOverrides((m) => ({
                        ...m,
                        [activeAgent.key]: next,
                      }));
                    }
                    setRoleEditOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const next = roleDraft.trim();
                      if (next) {
                        setAgentNameOverrides((m) => ({
                          ...m,
                          [activeAgent.key]: next,
                        }));
                      }
                      setRoleEditOpen(false);
                    }
                    if (e.key === "Escape") {
                      setRoleDraft(activeAgent.name);
                      setRoleEditOpen(false);
                    }
                  }}
                  className="outline-none focus:border-[#1447E6]"
                  style={{
                    height: 24,
                    width: Math.max(64, roleDraft.length * 14 + 24),
                    borderRadius: 6,
                    border: "1px solid #1447E6",
                    padding: "0 6px",
                    fontSize: 14,
                    lineHeight: "20px",
                    color: "#0A0A0A",
                    background: "#FFFFFF",
                  }}
                />
              ) : (
                <>
                  <span
                    style={{
                      fontSize: 14,
                      lineHeight: "20px",
                      color: "#0A0A0A",
                    }}
                  >
                    {activeAgent.name}
                  </span>
                  <button
                    onClick={() => {
                      setRoleDraft(activeAgent.name);
                      setRoleEditOpen(true);
                    }}
                    className="flex items-center justify-center text-[#A3A3A3] hover:text-[#1447E6] active:scale-90 transition-all"
                    style={{ width: 16, height: 16 }}
                    aria-label="编辑角色"
                    title="编辑角色"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
            {/* 分隔竖线 */}
            <span aria-hidden className="h-3 w-px" style={{ background: "#DEE1E8" }} />
            {/* 会话标题：可点击展开会话切换列表 */}
            <div ref={titleTriggerRef} className="relative min-w-0">
              <button
                onClick={() => setTitlePopoverOpen((v) => !v)}
                className="group/sess flex items-center gap-1 min-w-0 hover:bg-[#F5F6F9] active:scale-[0.98] transition-all"
                style={{ padding: "4px 8px", borderRadius: 6, marginLeft: -4 }}
                title="切换会话"
              >
                <span
                  className="truncate"
                  style={{
                    fontSize: 14,
                    lineHeight: "20px",
                    color: "rgba(10,10,10,0.8)",
                  }}
                >
                  {sessionTitle}
                </span>
                <ChevronDown
                  className="h-4 w-4 flex-shrink-0 group-hover/sess:text-[rgba(0,0,0,0.7)] transition-all"
                  style={{
                    color: "rgba(0,0,0,0.4)",
                    transform: titlePopoverOpen ? "rotate(180deg)" : undefined,
                  }}
                />
              </button>

              {/* 会话切换 popover */}
              {titlePopoverOpen && (
                <div
                  className="absolute z-30 bg-white"
                  style={{
                    top: "calc(100% + 6px)",
                    left: -4,
                    width: 280,
                    borderRadius: 12,
                    border: "1px solid #E9ECF1",
                    boxShadow:
                      "0 8px 24px 0 rgba(0,0,0,0.08), 0 1px 4px 0 rgba(0,0,0,0.05)",
                    padding: 4,
                  }}
                  // allow-shadow: 会话切换浮层
                >
                  <div
                    style={{
                      padding: "8px 12px 4px",
                      fontSize: 12,
                      lineHeight: "18px",
                      color: "rgba(10,10,10,0.45)",
                    }}
                  >
                    最近会话
                  </div>
                  <div className="flex flex-col">
                    {HISTORY_ITEMS.map((h) => {
                      const isActive = h.key === activeHistoryKey;
                      return (
                        <button
                          key={h.key}
                          onClick={() => {
                            setActiveHistoryKey(h.key);
                            setTitlePopoverOpen(false);
                          }}
                          className="text-left transition-colors hover:bg-[#F5F6F9]"
                          style={{
                            borderRadius: 8,
                            padding: "8px 12px",
                            background: isActive ? "#F5F6F9" : undefined,
                          }}
                        >
                          <span
                            className="block truncate"
                            style={{
                              fontSize: 13,
                              lineHeight: "20px",
                              color: h.archived
                                ? "#A3A3A3"
                                : isActive
                                  ? "rgba(10,10,10,0.95)"
                                  : "rgba(10,10,10,0.8)",
                              fontWeight: isActive ? 500 : 400,
                            }}
                          >
                            {h.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* 右侧三按钮：32×32 padding 10 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* 新建会话 → 二次确认 */}
            <button
              onClick={() => setShowNewChatConfirm(true)}
              aria-label="新建会话"
              title="新建会话"
              className="flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F6F9] active:scale-90 transition-all rounded-full"
              style={{ width: 32, height: 32 }}
            >
              <MessageSquarePlus className="h-5 w-5" />
            </button>

            {/* 更多 → 下拉菜单 */}
            <div ref={sessionMenuRef} className="relative">
              <button
                onClick={() => setSessionMenuOpen((v) => !v)}
                aria-label="更多"
                title="更多"
                className="flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F6F9] active:scale-90 transition-all rounded-full"
                style={{
                  width: 32,
                  height: 32,
                  background: sessionMenuOpen ? "#F5F6F9" : undefined,
                  color: sessionMenuOpen ? "#0A0A0A" : undefined,
                }}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {sessionMenuOpen && (
                <div
                  className="absolute right-0 z-30 bg-white"
                  style={{
                    top: "calc(100% + 6px)",
                    width: 180,
                    borderRadius: 12,
                    border: "1px solid #E9ECF1",
                    boxShadow:
                      "0 8px 24px 0 rgba(0,0,0,0.08), 0 1px 4px 0 rgba(0,0,0,0.05)",
                    padding: 4,
                  }}
                  // allow-shadow: 会话更多菜单
                >
                  {[
                    { key: "rename", label: "重命名", Icon: Edit3 },
                    { key: "share", label: "分享", Icon: Share2 },
                    { key: "archive", label: "归档", Icon: Archive },
                    { key: "delete", label: "删除会话", Icon: Trash2, danger: true },
                  ].map((it) => (
                    <button
                      key={it.key}
                      onClick={() => setSessionMenuOpen(false)}
                      className="w-full flex items-center gap-2 text-left transition-colors hover:bg-[#F5F6F9]"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        lineHeight: "20px",
                        color: it.danger
                          ? "rgba(229,62,62,0.9)"
                          : "rgba(10,10,10,0.85)",
                      }}
                    >
                      <it.Icon
                        className="h-4 w-4"
                        style={{
                          color: it.danger
                            ? "rgba(229,62,62,0.85)"
                            : "rgba(10,10,10,0.55)",
                        }}
                      />
                      {it.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 全屏切换 */}
            <button
              onClick={() => setIsFullscreen((v) => !v)}
              aria-label={isFullscreen ? "退出全屏" : "全屏"}
              title={isFullscreen ? "退出全屏" : "全屏"}
              className="flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F6F9] active:scale-90 transition-all rounded-full"
              style={{ width: 32, height: 32 }}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        {/* 内容区：有消息 → 对话流；无消息 → welcome 占位 */}
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-8">
            {/* 居中的内容块：内部元素左对齐 */}
            <div className="flex flex-col items-start">
              {/* 角色头像装饰：56×56 角色虾头像（与左侧选中头像同款，省去外圈红光晕） */}
              <img
                src={activeAgent.avatar}
                alt={activeAgent.name}
                draggable={false}
                className="rounded-full mb-4 object-cover pointer-events-none select-none"
                style={{ width: 56, height: 56 }}
              />

              {/* 欢迎语：20/32 #000 regular（左对齐） */}
              <h2
                className="text-left mb-4"
                style={{
                  fontSize: 20,
                  lineHeight: "32px",
                  color: "#000",
                  fontWeight: 400,
                }}
              >
                你好，我是{activeAgent.name}，今天我们来做些什么呢？
              </h2>

              {/* 快捷指令 chip 组：左对齐堆叠，chip 宽度自适应内容 */}
              <div className="flex flex-col items-start" style={{ gap: 16 }}>
                {QUICK_COMMANDS.map((command) => (
                  <button
                    key={command}
                    onClick={() => setInputText(command)}
                    className="inline-flex items-center transition-all duration-150 text-left bg-white hover:border-[#1447E6]/30 hover:shadow-[0_2px_8px_0_rgba(20,71,230,0.08)] active:scale-[0.98]"
                    style={{
                      borderRadius: 8,
                      border: "1px solid #E9ECF1",
                      padding: "9px 16px",
                      gap: 8,
                    }}
                    // allow-shadow: hover 微凸阴影
                  >
                    <StarBullet />
                    <span
                      style={{
                        fontSize: 14,
                        lineHeight: "22px",
                        color: "#000",
                      }}
                    >
                      {command}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto flex flex-col" style={{ maxWidth: 720, gap: 20 }}>
              {messages.map((m) =>
                m.role === "user" ? (
                  /* 用户消息：右对齐，灰色气泡 */
                  <div key={m.id} className="flex justify-end">
                    <div
                      style={{
                        maxWidth: "78%",
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: "#F5F6F9",
                        fontSize: 14,
                        lineHeight: "22px",
                        color: "#0A0A0A",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                ) : (
                  /* AI 消息：左对齐，前置 24×24 角色头像 */
                  <div key={m.id} className="flex items-start gap-2.5">
                    <img
                      src={activeAgent.avatar}
                      alt={activeAgent.name}
                      draggable={false}
                      className="rounded-full object-cover flex-shrink-0 pointer-events-none select-none"
                      style={{ width: 24, height: 24, marginTop: 2 }}
                    />
                    <div
                      style={{
                        maxWidth: "calc(100% - 36px)",
                        fontSize: 14,
                        lineHeight: "22px",
                        color: "#0A0A0A",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                ),
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* 输入区：圆角 20、stroke #E9ECF1、shadow 0 4 12 rgba(0,0,0,0.04) */}
        <div className="flex-shrink-0" style={{ padding: "0 16px 16px" }}>
          <div
            className="bg-white relative"
            style={{
              borderRadius: 20,
              border: "1px solid #E9ECF1",
              boxShadow: "0 4px 12px 0 rgba(0,0,0,0.04)",
            }}
            // allow-shadow: Figma effect_AO2YEQ
          >
            {/* 输入区：padding 16 20 高 80 */}
            <div style={{ padding: "16px 20px", height: 80 }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="发送消息开始对话"
                className="w-full h-full resize-none focus:outline-none bg-transparent"
                style={{
                  fontSize: 14,
                  lineHeight: "24px",
                  color: "#0A0A0A",
                }}
              />
            </div>

            {/* ActionBar：padding 0 16 16，space-between */}
            <div
              className="flex items-center justify-between"
              style={{ padding: "0 16px 16px" }}
            >
              <div className="flex items-center" style={{ gap: 8 }}>
                {/* Deepseek pill：圆角 16、stroke #E6E9EF、padding 2 12 */}
                <button
                  type="button"
                  className="inline-flex items-center bg-white hover:border-[#1447E6]/40 active:scale-[0.97] transition-all"
                  style={{
                    borderRadius: 16,
                    border: "1px solid #E6E9EF",
                    padding: "2px 12px",
                    gap: 4,
                  }}
                >
                  <span
                    aria-hidden
                    className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: "#3970FB" }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
                      <path d="M4 0L5.2 2.8L8 4L5.2 5.2L4 8L2.8 5.2L0 4L2.8 2.8L4 0Z" />
                    </svg>
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      lineHeight: "20px",
                      color: "rgba(0,0,0,0.9)",
                    }}
                  >
                    Deepseek R1
                  </span>
                  <ChevronDown className="h-4 w-4" style={{ color: "rgba(0,0,0,0.4)" }} />
                </button>
                {/* 指令库 pill：圆角 20、stroke #E9ECF1、padding 6 12 */}
                <button
                  type="button"
                  className="inline-flex items-center hover:border-[#1447E6]/40 active:scale-[0.97] transition-all"
                  style={{
                    borderRadius: 20,
                    border: "1px solid #E9ECF1",
                    padding: "6px 12px",
                    gap: 4,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(0,0,0,0.7)" }}>
                    <rect x="3" y="3" width="10" height="10" rx="2" />
                    <path d="M6 7h4M6 9h4" />
                  </svg>
                  <span
                    style={{
                      fontSize: 12,
                      lineHeight: "20px",
                      color: "rgba(0,0,0,0.9)",
                    }}
                  >
                    指令库
                  </span>
                </button>
              </div>

              {/* 右侧操作：附件 + 发送 */}
              <div className="flex items-center" style={{ gap: 8 }}>
                <button
                  type="button"
                  aria-label="附件"
                  className="flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F6F9] active:scale-90 transition-all rounded-full"
                  style={{ width: 32, height: 32 }}
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  aria-label="发送"
                  className="flex items-center justify-center text-white rounded-full transition-all duration-150 disabled:opacity-30 enabled:hover:bg-black enabled:active:scale-90"
                  style={{
                    width: 32,
                    height: 32,
                    background: "rgba(0,0,0,0.92)",
                  }}
                >
                  <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* 免责声明：11/24 rgba(0,0,0,0.3) */}
          <p
            className="text-center"
            style={{
              fontSize: 11,
              lineHeight: "24px",
              color: "rgba(0,0,0,0.3)",
              marginTop: 8,
            }}
          >
            通过LightClaw你可以直接和 openclaw对话，内容由当前服务器配置的 AI 模型提供，请注意鉴别
          </p>
        </div>
      </main>

      {/* 新建会话二次确认 */}
      {showNewChatConfirm && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.32)" }}
          onClick={() => setShowNewChatConfirm(false)}
        >
          <div
            className="bg-white"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 360,
              borderRadius: 16,
              padding: 24,
              boxShadow:
                "0 16px 48px 0 rgba(0,0,0,0.16), 0 2px 8px 0 rgba(0,0,0,0.08)",
            }}
            // allow-shadow: 二次确认 modal
          >
            <div
              style={{
                fontSize: 16,
                lineHeight: "24px",
                fontWeight: 600,
                color: "#0A0A0A",
                marginBottom: 8,
              }}
            >
              确认新建会话？
            </div>
            <div
              style={{
                fontSize: 13,
                lineHeight: "20px",
                color: "rgba(10,10,10,0.6)",
                marginBottom: 20,
              }}
            >
              新建会话后，当前会话记录会被清空。
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNewChatConfirm(false)}
                className="hover:bg-[#F5F6F9] active:scale-95 transition-all"
                style={{
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid #E9ECF1",
                  padding: "0 16px",
                  fontSize: 13,
                  color: "rgba(10,10,10,0.8)",
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  setMessages([]);
                  setInputText("");
                  setShowNewChatConfirm(false);
                }}
                className="text-white hover:bg-black active:scale-95 transition-all"
                style={{
                  height: 32,
                  borderRadius: 8,
                  padding: "0 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  background: "rgba(10,10,10,0.92)",
                }}
              >
                确认新建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ───────── 全屏 wrapper：固定在导航下方（top:64）+ 点阵背景 + padding ───────── */
  const fullscreenWrapper = (
    <div
      className="fixed left-0 right-0 bottom-0 z-[200] flex items-center justify-center"
      style={{
        top: 64,
        background: "#F7F8FB",
        padding: 32,
        backgroundImage:
          "radial-gradient(circle, #DFE2E5 1px, transparent 1.1px)",
        backgroundSize: "12px 12px",
      }}
    >
      {appCard}
    </div>
  );

  if (embedded) {
    return isFullscreen ? fullscreenWrapper : appCard;
  }

  /* ───────── 独立预览模式：Figma 整页底色 #F7F8FB + 居中卡片 + 尺寸徽章 ───────── */
  if (isFullscreen) {
    return fullscreenWrapper;
  }

  return (
    <div
      className="page-enter min-h-screen w-full flex items-center justify-center p-8 relative"
      style={{ background: "#F7F8FB" }}
    >
      {appCard}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <span
          className="inline-flex items-center px-2 h-5 rounded-[4px] text-white"
          style={{
            background: "#1447E6",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: 0.5,
          }}
        >
          1200 × 768
        </span>
      </div>
    </div>
  );
}
