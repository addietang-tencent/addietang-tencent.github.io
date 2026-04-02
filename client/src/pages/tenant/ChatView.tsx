/**
 * ChatView - 对话视图组件
 * Design: 「流动蓝图」Fluid Blueprint
 * - 左侧 OpenClaw 列表面板（无搜索框、无头像）
 * - 右侧对话区（欢迎态 + 对话态 + 三点loading + 输入框）
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreVertical, Settings, RefreshCw, HardDriveDownload, Trash2,
  RotateCcw, Terminal, UserMinus, Send, Plus, Mic, ChevronUp, ChevronDown, Sparkles, FilePlus2,
} from "lucide-react";

// Types - must match MyOpenClaw
type OpenClawStatus = "creating" | "createFail" | "running" | "shutdown" | "loading" | "loadFail" | "maintaining" | "pending";

interface OpenClawItem {
  id: string;
  instanceId: string;
  name: string;
  status: OpenClawStatus;
  createdAt: string;
  model: string;
  modelVersion: string;
  channels: any[];
  skills: any[];
  op?: string;
  roleName?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const STATUS_CONFIG: Record<OpenClawStatus, {
  label: string;
  dotColor?: string;
  bgColor: string;
  textColor: string;
  tooltipText?: string;
  isDisabled: boolean;
  isGrayAvatar: boolean;
}> = {
  creating: { label: "创建中", dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)", textColor: "#0055cc", tooltipText: "正在创建中，请稍候", isDisabled: true, isGrayAvatar: false },
  createFail: { label: "创建失败", dotColor: "#FF3B30", bgColor: "rgba(255,59,48,0.10)", textColor: "#c0392b", tooltipText: "创建失败，可删除后重新创建", isDisabled: true, isGrayAvatar: true },
  running: { label: "运行中", dotColor: "#34C759", bgColor: "rgba(52,199,89,0.12)", textColor: "#1a8c3a", isDisabled: false, isGrayAvatar: false },
  shutdown: { label: "已关机", dotColor: "#9CA3AF", bgColor: "rgba(156,163,175,0.15)", textColor: "#4b5563", tooltipText: "已关机，如需恢复请联系管理员", isDisabled: true, isGrayAvatar: true },
  loading: { label: "加载中", dotColor: "#007AFF", bgColor: "rgba(0,122,255,0.10)", textColor: "#0055cc", tooltipText: "加载中，请稍候", isDisabled: true, isGrayAvatar: false },
  loadFail: { label: "加载失败", dotColor: "#FF3B30", bgColor: "rgba(255,59,48,0.10)", textColor: "#c0392b", tooltipText: "加载失败，可点击重试恢复", isDisabled: true, isGrayAvatar: true },
  maintaining: { label: "维护中", dotColor: "#FF9500", bgColor: "rgba(255,149,0,0.10)", textColor: "#b8640a", tooltipText: "维护中，请稍候", isDisabled: true, isGrayAvatar: false },
  pending: { label: "待处理", dotColor: "#FF3B30", bgColor: "rgba(255,59,48,0.10)", textColor: "#c0392b", tooltipText: "已停用，请联系管理员处理", isDisabled: true, isGrayAvatar: true },
};

const MOCK_QUICK_COMMANDS = [
  "每天早上 9 点抓取 AI 行业新闻发我",
  "每天截图发我腾讯云活动页面最新的优惠",
  "监控汽油价格以提醒我加油",
  "半小时后提醒我开会",
];

const MOCK_AI_RESPONSES = [
  "好的，我来帮你处理这个任务。让我先了解一下具体需求...",
  "收到！我已经开始执行了，稍后会把结果发给你。",
  "没问题，我会持续关注并及时提醒你。",
  "好嘞，这个任务我很擅长，马上开始！",
];

const COMMAND_LIST = [
  { command: "/new", label: "新建会话" },
  { command: "/compact", label: "压缩上下文" },
  { command: "/status", label: "查看状态" },
  { command: "/stop", label: "停止当前任务" },
  { command: "/commands", label: "全部指令" },
];

// Status dot for sidebar list
const StatusDotSmall = ({ status }: { status: OpenClawStatus }) => {
  const cfg = STATUS_CONFIG[status];
  if (status === "loading") {
    return (
      <span className="inline-block flex-shrink-0 animate-spin"
        style={{ borderWidth: "1.5px", borderStyle: "solid", borderColor: `${cfg.dotColor} transparent transparent transparent`, width: "6px", height: "6px", borderRadius: "50%" }} />
    );
  }
  if (status === "creating") {
    return (
      <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
        style={{ background: cfg.dotColor, animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
    );
  }
  return <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: cfg.dotColor }} />;
};

const StatusBadgeSmall = ({ status }: { status: OpenClawStatus }) => {
  const cfg = STATUS_CONFIG[status];
  const badge = (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
      style={{ background: cfg.bgColor, color: cfg.textColor, fontSize: "10px" }}>
      <StatusDotSmall status={status} />
      {cfg.label}
    </span>
  );
  if (cfg.tooltipText && status !== "running") {
    return (
      <Tooltip>
        <TooltipTrigger asChild><div>{badge}</div></TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{cfg.tooltipText}</TooltipContent>
      </Tooltip>
    );
  }
  return badge;
};

// Three-dot loading animation
const TypingIndicator = () => (
  <div className="flex items-center gap-1 py-2 px-1">
    <span className="w-2 h-2 rounded-full bg-gray-400 typing-dot" style={{ animationDelay: "0ms" }} />
    <span className="w-2 h-2 rounded-full bg-gray-400 typing-dot" style={{ animationDelay: "150ms" }} />
    <span className="w-2 h-2 rounded-full bg-gray-400 typing-dot" style={{ animationDelay: "300ms" }} />
  </div>
);

interface ChatViewProps {
  claws: OpenClawItem[];
  onDeleteConfirm: (claw: { id: string; name: string; status: OpenClawStatus }) => void;
  onRestartConfirm: (claw: { id: string; name: string }) => void;
  onReinstallConfirm: (claw: { id: string; name: string }) => void;
  onRemoveRoleConfirm: (claw: { id: string; name: string; roleName: string }) => void;
  onRetry: (id: string, name: string) => void;
  allowTerminal: boolean;
  refreshingIds: Set<string>;
  onRefreshStatus: (e: React.MouseEvent, id: string, name: string) => void;
}

export default function ChatView({
  claws, onDeleteConfirm, onRestartConfirm, onReinstallConfirm,
  onRemoveRoleConfirm, onRetry, allowTerminal, refreshingIds, onRefreshStatus,
}: ChatViewProps) {
  // Select the newest claw by default
  const sortedClaws = [...claws].sort((a, b) => {
    // Sort by createdAt descending (newest first)
    return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
  });
  const [selectedClawId, setSelectedClawId] = useState<string | null>(() => {
    return sortedClaws.length > 0 ? sortedClaws[0].id : null;
  });

  // Update selection if claws change and selected is gone
  useEffect(() => {
    if (claws.length === 0) {
      setSelectedClawId(null);
      return;
    }
    if (selectedClawId && !claws.find(c => c.id === selectedClawId)) {
      const sorted = [...claws].sort((a, b) => b.id.localeCompare(a.id));
      setSelectedClawId(sorted[0]?.id ?? null);
    }
    if (!selectedClawId && claws.length > 0) {
      const sorted = [...claws].sort((a, b) => b.id.localeCompare(a.id));
      setSelectedClawId(sorted[0]?.id ?? null);
    }
  }, [claws, selectedClawId]);

  const selectedClaw = claws.find(c => c.id === selectedClawId) ?? null;

  // Chat messages per claw
  const [chatMap, setChatMap] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commandsRef = useRef<HTMLDivElement>(null);

  const currentMessages = selectedClawId ? (chatMap[selectedClawId] ?? []) : [];

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping, scrollToBottom]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedClawId || isTyping) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputText.trim(),
      timestamp: Date.now(),
    };
    setChatMap(prev => ({
      ...prev,
      [selectedClawId]: [...(prev[selectedClawId] ?? []), userMsg],
    }));
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulate AI response
    setIsTyping(true);
    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)],
        timestamp: Date.now(),
      };
      setChatMap(prev => ({
        ...prev,
        [selectedClawId]: [...(prev[selectedClawId] ?? []), aiMsg],
      }));
      setIsTyping(false);
    }, delay);
  };

  const handleQuickCommand = (cmd: string) => {
    if (!selectedClawId || isTyping) return;
    setInputText("");
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: cmd,
      timestamp: Date.now(),
    };
    setChatMap(prev => ({
      ...prev,
      [selectedClawId]: [...(prev[selectedClawId] ?? []), userMsg],
    }));

    setIsTyping(true);
    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)],
        timestamp: Date.now(),
      };
      setChatMap(prev => ({
        ...prev,
        [selectedClawId]: [...(prev[selectedClawId] ?? []), aiMsg],
      }));
      setIsTyping(false);
    }, delay);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  // Close commands popover on click outside
  useEffect(() => {
    if (!showCommands) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (commandsRef.current && !commandsRef.current.contains(e.target as Node)) {
        setShowCommands(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCommands]);

  const handleNewChat = () => {
    if (!selectedClawId || isTyping) return;
    // Send /new command
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: "/new",
      timestamp: Date.now(),
    };
    setChatMap(prev => ({
      ...prev,
      [selectedClawId]: [...(prev[selectedClawId] ?? []), userMsg],
    }));
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "好的，已新建会话。之前的对话上下文已清除，我们重新开始吧！",
        timestamp: Date.now(),
      };
      setChatMap(prev => ({
        ...prev,
        [selectedClawId]: [...(prev[selectedClawId] ?? []), aiMsg],
      }));
      setIsTyping(false);
    }, 1000);
  };

  const handleSendCommand = (command: string) => {
    if (!selectedClawId || isTyping) return;
    setShowCommands(false);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: command,
      timestamp: Date.now(),
    };
    setChatMap(prev => ({
      ...prev,
      [selectedClawId]: [...(prev[selectedClawId] ?? []), userMsg],
    }));
    setIsTyping(true);
    const responseMap: Record<string, string> = {
      "/new": "好的，已新建会话。之前的对话上下文已清除，我们重新开始吧！",
      "/compact": "已压缩上下文，当前保留最近 10 条对话记录。",
      "/status": "当前状态：运行中 | 模型：GPT-4o | 已用 Token：1,234 | 剩余配额：98,766",
      "/stop": "已停止当前任务。",
      "/commands": "可用指令：\n/new — 新建会话\n/compact — 压缩上下文\n/status — 查看状态\n/stop — 停止当前任务\n/commands — 全部指令",
    };
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: responseMap[command] || "未知指令，请输入 /commands 查看全部指令。",
        timestamp: Date.now(),
      };
      setChatMap(prev => ({
        ...prev,
        [selectedClawId]: [...(prev[selectedClawId] ?? []), aiMsg],
      }));
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };

  const isRunning = selectedClaw?.status === "running";

  return (
    <div className="flex bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)", height: "calc(100vh - 200px)", minHeight: "500px" }}>

      {/* Left Panel - OpenClaw List */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">我的 OpenClaw</h3>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
          {claws.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-xs text-gray-400">暂无 OpenClaw</p>
            </div>
          ) : (
            <div className="py-1">
              {claws.map((claw) => {
                const isSelected = claw.id === selectedClawId;
                const cfg = STATUS_CONFIG[claw.status];
                return (
                  <div
                    key={claw.id}
                    className={`mx-2 my-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group/item ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    style={isSelected ? { borderLeft: "2px solid #007AFF" } : { borderLeft: "2px solid transparent" }}
                    onClick={() => setSelectedClawId(claw.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-medium truncate ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                            {claw.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {claw.roleName && (
                            <span className="text-xs text-gray-400 truncate">{claw.roleName}</span>
                          )}
                          <StatusBadgeSmall status={claw.status} />
                        </div>
                      </div>
                      {/* More menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover/item:opacity-100 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          {/* Config */}
                          {!cfg.isDisabled && (
                            <Link href={`/openclaw/${claw.id}`}>
                              <DropdownMenuItem>
                                <Settings className="w-4 h-4 mr-2 text-gray-500" />
                                详细配置
                              </DropdownMenuItem>
                            </Link>
                          )}
                          {/* Restart */}
                          {claw.status === "running" ? (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRestartConfirm({ id: claw.id, name: claw.name }); }}>
                              <RotateCcw className="w-4 h-4 mr-2 text-gray-500" />
                              重启
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                              <RotateCcw className="w-4 h-4 mr-2 text-gray-400" />
                              重启
                            </DropdownMenuItem>
                          )}
                          {/* Reinstall */}
                          {claw.status === "running" ? (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onReinstallConfirm({ id: claw.id, name: claw.name }); }}>
                              <HardDriveDownload className="w-4 h-4 mr-2 text-gray-500" />
                              重新安装
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                              <HardDriveDownload className="w-4 h-4 mr-2 text-gray-400" />
                              重新安装
                            </DropdownMenuItem>
                          )}
                          {/* Terminal */}
                          {allowTerminal && (
                            claw.status === "running" ? (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/terminal/${claw.id}`, "_blank"); }}>
                                <Terminal className="w-4 h-4 mr-2 text-gray-500" />
                                进入终端
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                                <Terminal className="w-4 h-4 mr-2 text-gray-400" />
                                进入终端
                              </DropdownMenuItem>
                            )
                          )}
                          {/* Remove Role */}
                          {claw.roleName && claw.roleName !== "通用助手" && claw.status === "running" && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRemoveRoleConfirm({ id: claw.id, name: claw.name, roleName: claw.roleName! }); }}>
                              <UserMinus className="w-4 h-4 mr-2 text-gray-500" />
                              移除角色
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {/* Delete */}
                          {["creating", "loading", "pending"].includes(claw.status) ? (
                            <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); onDeleteConfirm({ id: claw.id, name: claw.name, status: claw.status }); }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedClaw ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">请选择一个 OpenClaw 开始对话</p>
          </div>
        ) : (
          <>
            {/* Top Bar - New Chat Button */}
            <div className="flex items-center justify-end px-4 py-2 border-b border-gray-50 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleNewChat}
                    disabled={!isRunning || isTyping}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FilePlus2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">新建对话</TooltipContent>
              </Tooltip>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
              {currentMessages.length === 0 ? (
                /* Welcome state */
                <div className="flex flex-col items-center justify-center h-full">
                  <img
                    src="/avatar_3d_preview.png"
                    alt="OpenClaw"
                    className="w-24 h-24 mb-6 object-contain"
                    draggable={false}
                  />
                  <h2 className="text-xl font-semibold text-gray-900 mb-8">
                    你好，我是{selectedClaw.name}，今天我们来做些什么呢？
                  </h2>
                  <div className="flex flex-col gap-3 w-full max-w-md">
                    {MOCK_QUICK_COMMANDS.map((cmd, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickCommand(cmd)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 text-left group/cmd"
                        disabled={!isRunning || isTyping}
                      >
                        <span className="text-blue-500 flex-shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        <span className="text-sm text-gray-700 group-hover/cmd:text-gray-900">{cmd}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Conversation state */
                <div className="max-w-3xl mx-auto space-y-6">
                  {currentMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "user" ? (
                        <div className="max-w-[70%] px-4 py-2.5 rounded-2xl bg-gray-100 text-sm text-gray-900 leading-relaxed">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="max-w-[85%] text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <TypingIndicator />
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 px-8 pb-4">
              {!isRunning ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-gray-400">当前 OpenClaw 不可用，请等待状态恢复或选择其他 OpenClaw</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={handleTextareaInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="发送消息开始对话"
                      rows={1}
                      className="w-full px-4 pt-4 pb-2 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none bg-transparent"
                      style={{ minHeight: "44px", maxHeight: "120px" }}
                      disabled={isTyping}
                    />
                    <div className="flex items-center justify-between px-3 pb-3">
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <div className="relative" ref={commandsRef}>
                          <button
                            onClick={() => setShowCommands(!showCommands)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors text-xs font-medium"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            指令库
                            {showCommands ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                          </button>
                          {showCommands && (
                            <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl border border-gray-200 py-2 z-50"
                              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                              {COMMAND_LIST.map((item) => (
                                <button
                                  key={item.command}
                                  onClick={() => handleSendCommand(item.command)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                                >
                                  <span className="text-sm font-mono text-gray-900">{item.command}</span>
                                  <span className="text-sm text-gray-400">{item.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                          <Mic className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleSend}
                          disabled={!inputText.trim() || isTyping}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-150 disabled:opacity-30"
                          style={{ background: inputText.trim() && !isTyping ? "linear-gradient(135deg, #007AFF, #5856D6)" : "#d1d5db" }}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-2.5">
                    只要您配置了模型，您可以直接在浏览器和 OpenClaw 对话，内容由您配置的 AI 模型返回，请注意甄别
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* CSS for typing dots */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot {
          animation: typingBounce 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
