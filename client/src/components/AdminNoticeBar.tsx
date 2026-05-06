/**
 * AdminNoticeBar - 管控端顶部常驻通知条
 * Design: 「流动蓝图」Fluid Blueprint
 * - 三类通知：基础配置告警（橙色）、腾讯云配额告警（橙色）、产品动态（蓝色）
 * - 支持自动轮播（5s）+ 手动左右切换
 * - 只有 1 条通知时隐藏切换按钮
 * - 不可手动关闭，强制常驻
 * - sticky top-0 固定在内容区顶部，不随页面滚动
 * - 跳转链接紧跟在通知文字末尾
 * - 产品动态图标使用星星符号
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, AlertTriangle, Sparkles, ExternalLink } from "lucide-react";

// ─── 基础配置 6 项完成状态（与 BasicInfo.tsx 保持一致） ──────────────────────
const STEP_STATUS: Record<number, { label: string; done: boolean }> = {
  1: { label: "设置平台名称与品牌", done: true },
  2: { label: "配置用户默认配额", done: true },
  3: { label: "导入企业用户", done: false },
  4: { label: "配置至少一个模型", done: true },
  5: { label: "配置至少一个通道", done: false },
  6: { label: "配置私有网络和安全组", done: false },
};

// ─── 腾讯云配额问题 mock 数据 ─────────────────────────────────────────────────
const QUOTA_ALERTS = [
  {
    id: "vpc",
    message: "私有网络（VPC）配额已耗尽，将影响用户端云设备的正常创建与使用。",
    link: "https://console.cloud.tencent.com/workorder/category",
  },
  {
    id: "ai2",
    message: "云服务器 Ai2 机型购买配额已耗尽，将影响用户端 AI 云设备的正常分配。",
    link: "https://console.cloud.tencent.com/workorder/category",
  },
];

// ─── 产品动态 mock 数据 ───────────────────────────────────────────────────────
const PRODUCT_NEWS = [
  {
    id: "news1",
    message: "【产品动态】OpenClaw v2.4.0 已发布：记忆管理功能上线，支持 Pro / Free 版本切换，Pro 版提供长期记忆存储与跨会话召回能力。",
  },
  {
    id: "news2",
    message: "【产品动态】OpenClaw v2.3.0 已发布：技能配置全面升级，支持公共技能库浏览、收藏与批量分发至指定用户或全体成员。",
  },
];

// ─── 通知条目类型 ─────────────────────────────────────────────────────────────
type NoticeType = "warning" | "info";

interface NoticeItem {
  id: string;
  type: NoticeType;
  message: string;
  action?: {
    label: string;
    href: string;
    external?: boolean;
  };
}

// ─── 构建通知列表 ─────────────────────────────────────────────────────────────
function buildNotices(): NoticeItem[] {
  const notices: NoticeItem[] = [];

  // 1. 基础配置未完成
  const incompleteSteps = Object.values(STEP_STATUS).filter((s) => !s.done);
  if (incompleteSteps.length > 0) {
    const names = incompleteSteps.map((s) => s.label).join("、");
    notices.push({
      id: "basic-config",
      type: "warning",
      message: `有 ${incompleteSteps.length} 项基础配置未完成（${names}），未完成配置将影响用户端的正常使用，`,
      action: {
        label: "前往基础信息配置处理",
        href: "/admin/basic-info",
        external: false,
      },
    });
  }

  // 2. 腾讯云配额问题
  for (const alert of QUOTA_ALERTS) {
    notices.push({
      id: `quota-${alert.id}`,
      type: "warning",
      message: alert.message.replace("。", "，"),
      action: {
        label: "前往腾讯云控制台提交工单",
        href: alert.link,
        external: true,
      },
    });
  }

  // 3. 产品动态
  for (const news of PRODUCT_NEWS) {
    notices.push({
      id: news.id,
      type: "info",
      message: news.message,
    });
  }

  return notices;
}

const AUTO_PLAY_INTERVAL = 5000;

export default function AdminNoticeBar() {
  // [004] 每次渲染都重算通知列表，以便存量企业 ack 状态变化时能即时从通知条消失
  const NOTICES = buildNotices();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = NOTICES.length;

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // 自动轮播
  useEffect(() => {
    if (total <= 1 || paused) return;
    const timer = setInterval(goNext, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [total, paused, goNext]);

  if (total === 0) return null;

  const notice = NOTICES[current];
  const isWarning = notice.type === "warning";

  return (
    <div
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors duration-300 sticky top-0 z-20 ${
        isWarning
          ? "bg-amber-50 border-b border-amber-200"
          : "bg-blue-50 border-b border-blue-200"
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 图标 */}
      <div className={`flex-shrink-0 ${isWarning ? "text-amber-500" : "text-blue-500"}`}>
        {isWarning ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      {/* 通知文字 + 跳转链接（内联排列） */}
      <div className={`flex-1 min-w-0 leading-5 flex items-baseline flex-wrap gap-x-1 ${isWarning ? "text-amber-800" : "text-blue-800"}`}>
        <span className="shrink-0 max-w-full">{notice.message}</span>
        {notice.action && (
          <>
            {notice.action.external ? (
              <a
                href={notice.action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-0.5 font-medium underline underline-offset-2 whitespace-nowrap flex-shrink-0 ${
                  isWarning ? "text-amber-700 hover:text-amber-900" : "text-blue-700 hover:text-blue-900"
                }`}
              >
                {notice.action.label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <Link href={notice.action.href}>
                <span
                  className={`inline font-medium underline underline-offset-2 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    isWarning ? "text-amber-700 hover:text-amber-900" : "text-blue-700 hover:text-blue-900"
                  }`}
                >
                  {notice.action.label}
                </span>
              </Link>
            )}
          </>
        )}
      </div>

      {/* 切换按钮（仅多条时显示） */}
      {total > 1 && (
        <div className="flex-shrink-0 flex items-center gap-1 ml-1">
          <button
            onClick={goPrev}
            className={`p-0.5 rounded hover:bg-black/10 transition-colors ${
              isWarning ? "text-amber-600" : "text-blue-600"
            }`}
            aria-label="上一条"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className={`text-xs tabular-nums ${isWarning ? "text-amber-500" : "text-blue-500"}`}>
            {current + 1}/{total}
          </span>
          <button
            onClick={goNext}
            className={`p-0.5 rounded hover:bg-black/10 transition-colors ${
              isWarning ? "text-amber-600" : "text-blue-600"
            }`}
            aria-label="下一条"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
