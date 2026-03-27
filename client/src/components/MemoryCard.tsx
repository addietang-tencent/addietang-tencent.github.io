/**
 * MemoryCard - Memory 配置卡片组件
 * 用于 OpenClaw 详细配置页面，支持启用/禁用 Memory 功能
 * 
 * 设计理念：
 * - 极简入口：只有一个 Toggle 开关，无需额外配置
 * - 风险前置：启用/禁用都需要二次确认 + 橙色警告
 * - 状态清晰：三种状态（未启用/已启用/加载中）有明确视觉区分
 */

import { useState } from "react";
import { Brain, AlertCircle, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EnableMemoryDialog from "./EnableMemoryDialog";
import DisableMemoryDialog from "./DisableMemoryDialog";

interface MemoryCardProps {
  clawId?: string;
  clawName?: string;
  onNavigateToAdmin?: () => void;
}

export default function MemoryCard({
  clawId = "demo-claw",
  clawName = "Demo OpenClaw",
  onNavigateToAdmin,
}: MemoryCardProps) {
  // ── State Management ──
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [pendingToggleState, setPendingToggleState] = useState(false);

  // ── Toggle Handler ──
  const handleToggleChange = (checked: boolean) => {
    // 防止加载中时操作
    if (isLoading) return;

    setPendingToggleState(checked);

    if (checked) {
      // 打开启用弹窗
      setEnableDialogOpen(true);
    } else {
      // 打开禁用弹窗
      setDisableDialogOpen(true);
    }
  };

  // ── Enable Handler ──
  const handleEnableConfirm = async () => {
    setEnableDialogOpen(false);
    setIsLoading(true);

    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsEnabled(true);
      toast.success("Memory 功能已启用！");
    } catch (error) {
      toast.error("启用失败，请重试");
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Disable Handler ──
  const handleDisableConfirm = async () => {
    setDisableDialogOpen(false);
    setIsLoading(true);

    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsEnabled(false);
      toast.success("Memory 功能已禁用");
    } catch (error) {
      toast.error("禁用失败，请重试");
      setIsEnabled(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Cancel Handlers ──
  const handleEnableCancel = () => {
    setEnableDialogOpen(false);
  };

  const handleDisableCancel = () => {
    setDisableDialogOpen(false);
  };

  // ── Compute Status Colors ──
  const getStatusColor = () => {
    if (isLoading) {
      return {
        indicator: "bg-amber-400",
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
      };
    }
    if (isEnabled) {
      return {
        indicator: "bg-green-500",
        text: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-100",
      };
    }
    return {
      indicator: "bg-gray-300",
      text: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-100",
    };
  };

  const statusColor = getStatusColor();

  // ── Status Text ──
  const getStatusText = () => {
    if (isLoading) {
      return isEnabled ? "正在禁用..." : "正在启用...";
    }
    return isEnabled ? "已启用" : "未启用";
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
          height: "476px",
        }}
      >
        {/* ── Header ── */}
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">记忆 (TDAI-Memory)</h2>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          {/* Version Badge */}
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-3">
              TDAI-Memory Free 版
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              腾讯云自研 Agent 记忆系统，让 OpenClaw
              跨会话记住用户偏好、任务进度与历史决策，持续提供个性化服务。
            </p>
          </div>

          {/* Status Block */}
          <div
            className={`rounded-lg border p-4 flex items-center justify-between ${statusColor.bg} ${statusColor.border}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${statusColor.indicator}`} />
              <span className={`text-sm font-medium ${statusColor.text}`}>
                {getStatusText()}
              </span>
            </div>

            {/* Toggle Switch */}
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleChange}
              disabled={isLoading}
              className="scale-125 origin-right"
            />
          </div>


        </div>
      </div>

      {/* ── Dialogs ── */}
      <EnableMemoryDialog
        open={enableDialogOpen}
        onConfirm={handleEnableConfirm}
        onCancel={handleEnableCancel}
      />

      <DisableMemoryDialog
        open={disableDialogOpen}
        onConfirm={handleDisableConfirm}
        onCancel={handleDisableCancel}
      />
    </>
  );
}
